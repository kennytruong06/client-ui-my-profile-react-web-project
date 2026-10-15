import { useSyncExternalStore } from 'react';
import initialEntries from '@/data/daily/entries.json';
import initialCategories from '@/data/daily/categories.json';

const API = '/__daily';
const MAX_SIDE = 1920;
const QUALITY = 0.85;

export const DAILY_EDITABLE = import.meta.env.DEV;

let state = { entries: initialEntries, categories: initialCategories };
const listeners = new Set();

function setState(next) {
    state = next;
    listeners.forEach((listener) => listener());
}

function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useDaily() {
    return useSyncExternalStore(subscribe, () => state);
}

async function request(method, route, body) {
    const response = await fetch(`${API}${route}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error ?? 'Request failed');
    }
    setState(data);
    return data;
}

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Cannot read ${file.name}`));
        };
        image.src = url;
    });
}

export async function compressImage(file) {
    const image = await loadImage(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/webp', QUALITY);
}

export async function createEntry({ date, note, categories, files }) {
    const images = await Promise.all(files.map(compressImage));
    return request('POST', '/entries', { date, note, categories, images });
}

export async function updateEntry(id, { date, note, categories, addFiles = [], removeImages = [] }) {
    const addImages = await Promise.all(addFiles.map(compressImage));
    return request('PATCH', `/entries/${encodeURIComponent(id)}`, { date, note, categories, addImages, removeImages });
}

export function deleteEntry(id) {
    return request('DELETE', `/entries/${encodeURIComponent(id)}`);
}

export function saveCategories(categories) {
    return request('PUT', '/categories', { categories });
}
