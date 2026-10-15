import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const API_PREFIX = '/__daily';
const IMAGE_URL_PREFIX = '/daily/images';
const EXTENSIONS = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' };

function paths(root) {
    return {
        entries: path.join(root, 'src/data/daily/entries.json'),
        categories: path.join(root, 'src/data/daily/categories.json'),
        images: path.join(root, 'public/daily/images'),
    };
}

async function readJson(file) {
    return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function writeJson(file, data) {
    await fs.writeFile(file, `${JSON.stringify(data, null, 4)}\n`);
}

async function readBody(req) {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(chunk);
    }
    return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

function sortEntries(entries) {
    return [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

async function saveImages(dir, entryId, images) {
    const entryDir = path.join(dir, entryId);
    await fs.mkdir(entryDir, { recursive: true });
    const urls = [];
    for (const dataUrl of images) {
        const match = /^data:(image\/[a-z]+);base64,(.+)$/.exec(dataUrl);
        if (!match || !EXTENSIONS[match[1]]) {
            throw new Error('Unsupported image');
        }
        const name = `${crypto.randomBytes(6).toString('hex')}.${EXTENSIONS[match[1]]}`;
        await fs.writeFile(path.join(entryDir, name), Buffer.from(match[2], 'base64'));
        urls.push(`${IMAGE_URL_PREFIX}/${entryId}/${name}`);
    }
    return urls;
}

async function removeImage(dir, url) {
    if (!url.startsWith(`${IMAGE_URL_PREFIX}/`)) {
        return;
    }
    const target = path.join(dir, url.slice(IMAGE_URL_PREFIX.length + 1));
    if (target.startsWith(dir)) {
        await fs.rm(target, { force: true });
    }
}

function cleanText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function cleanCategories(value, categories) {
    const known = new Set(categories.map((category) => category.id));
    return Array.isArray(value) ? [...new Set(value)].filter((id) => known.has(id)) : [];
}

async function handle(root, req) {
    const files = paths(root);
    const url = new URL(req.url, 'http://localhost');
    const route = url.pathname.slice(API_PREFIX.length);
    const entries = await readJson(files.entries);
    const categories = await readJson(files.categories);
    const body = req.method === 'GET' || req.method === 'DELETE' ? {} : await readBody(req);
    let nextEntries = entries;
    let nextCategories = categories;

    if (req.method === 'POST' && route === '/entries') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? '') || !Array.isArray(body.images) || body.images.length === 0) {
            return { status: 422, data: { error: 'Date and at least one image are required.' } };
        }
        const id = `${body.date}-${crypto.randomBytes(3).toString('hex')}`;
        const images = await saveImages(files.images, id, body.images);
        nextEntries = [...entries, {
            id,
            date: body.date,
            note: cleanText(body.note),
            categories: cleanCategories(body.categories, categories),
            images,
            createdAt: new Date().toISOString(),
        }];
    } else if (route.startsWith('/entries/') && (req.method === 'PATCH' || req.method === 'DELETE')) {
        const id = decodeURIComponent(route.slice('/entries/'.length));
        const entry = entries.find((item) => item.id === id);
        if (!entry) {
            return { status: 404, data: { error: 'Entry not found.' } };
        }
        if (req.method === 'DELETE') {
            await fs.rm(path.join(files.images, id), { recursive: true, force: true });
            nextEntries = entries.filter((item) => item.id !== id);
        } else {
            const removed = Array.isArray(body.removeImages) ? body.removeImages : [];
            await Promise.all(removed.map((image) => removeImage(files.images, image)));
            const added = Array.isArray(body.addImages) && body.addImages.length ? await saveImages(files.images, id, body.addImages) : [];
            const updated = {
                ...entry,
                date: /^\d{4}-\d{2}-\d{2}$/.test(body.date ?? '') ? body.date : entry.date,
                note: body.note === undefined ? entry.note : cleanText(body.note),
                categories: body.categories === undefined ? entry.categories : cleanCategories(body.categories, categories),
                images: [...entry.images.filter((image) => !removed.includes(image)), ...added],
            };
            nextEntries = entries.map((item) => (item.id === id ? updated : item));
        }
    } else if (req.method === 'PUT' && route === '/categories') {
        const incoming = Array.isArray(body.categories) ? body.categories : [];
        nextCategories = incoming
            .map((category) => ({ id: cleanText(category.id) || crypto.randomBytes(4).toString('hex'), name: cleanText(category.name) }))
            .filter((category) => category.name);
        const known = new Set(nextCategories.map((category) => category.id));
        nextEntries = entries.map((entry) => ({ ...entry, categories: entry.categories.filter((id) => known.has(id)) }));
    } else if (req.method !== 'GET') {
        return { status: 404, data: { error: 'Unknown route.' } };
    }

    nextEntries = sortEntries(nextEntries);
    if (nextEntries !== entries) {
        await writeJson(files.entries, nextEntries);
    }
    if (nextCategories !== categories) {
        await writeJson(files.categories, nextCategories);
    }
    return { status: 200, data: { entries: nextEntries, categories: nextCategories } };
}

export default function dailyApi() {
    let root = process.cwd();

    return {
        name: 'daily-memories-api',
        apply: 'serve',
        configResolved(config) {
            root = config.root;
        },
        handleHotUpdate({ file }) {
            if (file.startsWith(path.join(root, 'src/data/daily'))) {
                return [];
            }
            return undefined;
        },
        configureServer(server) {
            server.middlewares.use(API_PREFIX, async (req, res) => {
                req.url = `${API_PREFIX}${req.url}`;
                try {
                    const { status, data } = await handle(root, req);
                    res.statusCode = status;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                } catch (error) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: error.message }));
                }
            });
        },
    };
}
