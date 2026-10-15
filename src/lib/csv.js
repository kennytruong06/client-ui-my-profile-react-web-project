export const CSV_COLUMNS = ['type', 'date', 'key', 'status', 'variant', 'steps', 'text'];

function escapeCell(value) {
    const text = value == null ? '' : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows) {
    const lines = [CSV_COLUMNS.join(',')];
    rows.forEach((row) => {
        lines.push(CSV_COLUMNS.map((column) => escapeCell(row[column])).join(','));
    });
    return lines.join('\n');
}

function parseLines(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (quoted) {
            if (char === '"' && text[index + 1] === '"') {
                cell += '"';
                index += 1;
            } else if (char === '"') {
                quoted = false;
            } else {
                cell += char;
            }
        } else if (char === '"') {
            quoted = true;
        } else if (char === ',') {
            row.push(cell);
            cell = '';
        } else if (char === '\n' || char === '\r') {
            if (char === '\r' && text[index + 1] === '\n') {
                index += 1;
            }
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        } else {
            cell += char;
        }
    }

    if (cell !== '' || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }

    return rows;
}

export function fromCsv(text) {
    const [header, ...body] = parseLines(text.replace(/^﻿/, ''));
    if (!header || header[0] !== 'type') {
        throw new Error('invalid-csv');
    }
    return body
        .filter((cells) => cells.some((cell) => cell !== ''))
        .map((cells) => Object.fromEntries(header.map((column, index) => [column, cells[index] ?? ''])));
}

export function downloadText(filename, text) {
    const blob = new Blob(['﻿', text], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
