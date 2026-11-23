import fs from 'fs/promises';
import path from 'path';

const API_PATH = '/__journal';
const RELATIVE_FILE = 'src/data/journal/journal.csv';

async function readBody(req) {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(chunk);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export default function journalApi() {
    let root = process.cwd();
    let lastWritten = null;

    return {
        name: 'journal-csv-api',
        apply: 'serve',
        configResolved(config) {
            root = config.root;
        },
        async handleHotUpdate({ file, server }) {
            if (file !== path.join(root, RELATIVE_FILE)) {
                return undefined;
            }
            const content = await fs.readFile(file, 'utf8');
            if (content !== lastWritten) {
                server.ws.send({ type: 'full-reload' });
            }
            return [];
        },
        configureServer(server) {
            server.middlewares.use(API_PATH, async (req, res) => {
                res.setHeader('Content-Type', 'application/json');
                if (req.method !== 'PUT') {
                    res.statusCode = 405;
                    res.end(JSON.stringify({ error: 'Method not allowed.' }));
                    return;
                }
                try {
                    const { csv } = await readBody(req);
                    if (typeof csv !== 'string' || !csv.startsWith('type,')) {
                        res.statusCode = 422;
                        res.end(JSON.stringify({ error: 'Invalid CSV.' }));
                        return;
                    }
                    const file = path.join(root, RELATIVE_FILE);
                    await fs.mkdir(path.dirname(file), { recursive: true });
                    lastWritten = `﻿${csv}\n`;
                    await fs.writeFile(file, lastWritten);
                    res.end(JSON.stringify({ ok: true }));
                } catch (error) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: error.message }));
                }
            });
        },
    };
}
