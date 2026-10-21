import { useSyncExternalStore } from 'react';
import { todayKey } from '@/lib/date';
import { DEFAULT_TOPICS, ENGLISH_SKILLS } from '@/data/english';
import { fromCsv, toCsv } from '@/lib/csv';
import journalCsv from '@/data/journal/journal.csv?raw';

const LEGACY_STORAGE_KEY = 'kp.journal.v1';
const API = '/__journal';
const SAVE_DELAY = 400;

export const JOURNAL_EDITABLE = import.meta.env.DEV;
export const JOURNAL_FILE = 'src/data/journal/journal.csv';

function emptyState() {
    return {
        trackingStart: todayKey(),
        days: {},
        english: { startDate: null, days: {} },
        vocab: { words: [], topics: DEFAULT_TOPICS },
    };
}

function normalize(parsed) {
    const defaults = emptyState();
    return {
        ...defaults,
        ...parsed,
        english: { ...defaults.english, ...parsed.english },
        vocab: { ...defaults.vocab, ...parsed.vocab },
    };
}

function readFile() {
    try {
        const rows = fromCsv(journalCsv);
        return rows.length ? rowsToJournal(rows) : null;
    } catch {
        return null;
    }
}

function readLegacyBrowserData() {
    try {
        const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
        return raw ? normalize(JSON.parse(raw)) : null;
    } catch {
        return null;
    }
}

const fileState = readFile();
const legacyState = !fileState && JOURNAL_EDITABLE ? readLegacyBrowserData() : null;
let state = fileState ?? legacyState ?? emptyState();
const listeners = new Set();

let saveStatus = 'saved';
let saveTimer = null;
const statusListeners = new Set();

function setSaveStatus(next) {
    saveStatus = next;
    statusListeners.forEach((listener) => listener());
}

export function useSaveStatus() {
    return useSyncExternalStore((listener) => {
        statusListeners.add(listener);
        return () => statusListeners.delete(listener);
    }, () => saveStatus);
}

async function flush() {
    saveTimer = null;
    setSaveStatus('saving');
    try {
        const response = await fetch(API, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csv: toCsv(journalToRows(state)) }),
            keepalive: true,
        });
        setSaveStatus(response.ok ? 'saved' : 'error');
    } catch {
        setSaveStatus('error');
    }
}

function scheduleSave() {
    clearTimeout(saveTimer);
    setSaveStatus('pending');
    saveTimer = setTimeout(flush, SAVE_DELAY);
}

if (JOURNAL_EDITABLE) {
    window.addEventListener('beforeunload', () => {
        if (saveTimer) {
            clearTimeout(saveTimer);
            flush();
        }
    });
    if (legacyState) {
        scheduleSave();
    }
}

function commit(next) {
    if (!JOURNAL_EDITABLE) {
        return;
    }
    state = next;
    listeners.forEach((listener) => listener());
    scheduleSave();
}

function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot() {
    return state;
}

export function useJournal() {
    return useSyncExternalStore(subscribe, getSnapshot);
}

export function newId() {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function withDay(date, update) {
    const day = state.days[date] ?? { tasks: {}, note: '' };
    const nextDay = update(day);
    const isEmpty = Object.keys(nextDay.tasks).length === 0 && !nextDay.note;
    const days = { ...state.days };
    if (isEmpty) {
        delete days[date];
    } else {
        days[date] = nextDay;
    }
    commit({ ...state, days });
}

export function updateTask(date, taskId, patch) {
    withDay(date, (day) => {
        const current = { status: null, note: '', steps: [], stepValues: {}, variant: null, minutes: null, activity: '', ...day.tasks[taskId] };
        const next = { ...current, ...patch };
        const tasks = { ...day.tasks };
        if (!next.status && !next.note && next.steps.length === 0 && Object.keys(next.stepValues).length === 0 && !next.variant && next.minutes == null && !next.activity) {
            delete tasks[taskId];
        } else {
            tasks[taskId] = next;
        }
        return { ...day, tasks };
    });
}

export function setDayNote(date, note) {
    withDay(date, (day) => ({ ...day, note }));
}

export function setTrackingStart(date) {
    commit({ ...state, trackingStart: date });
}

export function setEnglishStart(date) {
    commit({ ...state, english: { ...state.english, startDate: date } });
}

export function emptyEnglishLog() {
    return { done: false, note: '', hidden: [], skills: {} };
}

export function englishLogOf(journal, dayNumber) {
    return { ...emptyEnglishLog(), ...journal.english.days[dayNumber] };
}

function withEnglishDay(dayNumber, update) {
    const days = { ...state.english.days, [dayNumber]: update(englishLogOf(state, dayNumber)) };
    commit({ ...state, english: { ...state.english, days } });
}

export function updateEnglishDay(dayNumber, patch) {
    withEnglishDay(dayNumber, (log) => ({ ...log, ...patch }));
}

export function updateEnglishSkill(dayNumber, skill, patch) {
    withEnglishDay(dayNumber, (log) => ({ ...log, skills: { ...log.skills, [skill]: { note: '', score: '', ...log.skills[skill], ...patch } } }));
}

export function setEnglishSkillHidden(dayNumber, skill, hidden) {
    withEnglishDay(dayNumber, (log) => {
        const skills = { ...log.skills };
        if (hidden) {
            delete skills[skill];
        }
        return {
            ...log,
            skills,
            hidden: hidden ? [...new Set([...log.hidden, skill])] : log.hidden.filter((item) => item !== skill),
        };
    });
}

function withVocab(update) {
    commit({ ...state, vocab: update(state.vocab) });
}

export function saveWord(word) {
    withVocab((vocab) => {
        const exists = vocab.words.some((item) => item.id === word.id);
        const saved = { ...word, id: word.id || newId(), updatedAt: new Date().toISOString() };
        const words = exists ? vocab.words.map((item) => (item.id === word.id ? saved : item)) : [{ ...saved, createdAt: saved.updatedAt }, ...vocab.words];
        return { ...vocab, words };
    });
}

export function deleteWord(id) {
    withVocab((vocab) => ({ ...vocab, words: vocab.words.filter((word) => word.id !== id) }));
}

export function addExample(id, sentence) {
    withVocab((vocab) => ({
        ...vocab,
        words: vocab.words.map((word) => (word.id === id ? { ...word, examples: word.examples ? `${word.examples}\n${sentence}` : sentence } : word)),
    }));
}

export function recordReview(id, remembered) {
    withVocab((vocab) => ({
        ...vocab,
        words: vocab.words.map((word) => {
            if (word.id !== id) {
                return word;
            }
            const reviews = { good: 0, again: 0, ...word.reviews };
            return { ...word, reviews: { ...reviews, [remembered ? 'good' : 'again']: reviews[remembered ? 'good' : 'again'] + 1 }, lastReviewed: todayKey() };
        }),
    }));
}

export function saveTopics(topics) {
    withVocab((vocab) => {
        const known = new Set(topics.map((topic) => topic.id));
        return {
            topics,
            words: vocab.words.map((word) => ({ ...word, topics: (word.topics ?? []).filter((id) => known.has(id)) })),
        };
    });
}

export function resetJournal() {
    commit(emptyState());
}

function encodeSteps(task) {
    const values = task.stepValues ?? {};
    const ids = [...new Set([...(task.steps ?? []), ...Object.keys(values)])];
    return ids.map((id) => {
        const checked = (task.steps ?? []).includes(id) ? '' : '!';
        return values[id] == null ? `${checked}${id}` : `${checked}${id}=${values[id]}`;
    }).join('|');
}

function decodeSteps(text) {
    const steps = [];
    const stepValues = {};
    (text ? text.split('|') : []).forEach((part) => {
        const unchecked = part.startsWith('!');
        const [id, value] = part.replace(/^!/, '').split('=');
        if (!unchecked) {
            steps.push(id);
        }
        if (value !== undefined && value !== '') {
            stepValues[id] = Number(value);
        }
    });
    return { steps, stepValues };
}

export function journalToRows(journal) {
    const rows = [
        { type: 'setting', key: 'trackingStart', text: journal.trackingStart },
        { type: 'setting', key: 'englishStart', text: journal.english.startDate ?? '' },
    ];

    Object.entries(journal.days).sort(([a], [b]) => a.localeCompare(b)).forEach(([date, day]) => {
        if (day.note) {
            rows.push({ type: 'day-note', date, text: day.note });
        }
        Object.entries(day.tasks).forEach(([taskId, task]) => {
            rows.push({
                type: 'task',
                date,
                key: taskId,
                status: task.status ?? '',
                variant: task.variant ?? '',
                steps: encodeSteps(task),
                text: task.note ?? '',
                minutes: task.minutes ?? '',
                activity: task.activity ?? '',
            });
        });
    });

    Object.keys(journal.english.days).forEach((dayNumber) => {
        const log = englishLogOf(journal, dayNumber);
        rows.push({ type: 'english-day', key: dayNumber, status: log.done ? 'done' : '', text: log.note });
        ENGLISH_SKILLS.forEach((skill) => {
            const entry = log.skills[skill];
            const hidden = log.hidden.includes(skill);
            if (entry || hidden) {
                rows.push({ type: 'english-skill', key: `${dayNumber}.${skill}`, status: hidden ? 'hidden' : '', variant: entry?.score ?? '', text: entry?.note ?? '' });
            }
        });
    });

    journal.vocab.topics.forEach((topic) => rows.push({ type: 'vocab-topic', key: topic.id, text: topic.name }));
    journal.vocab.words.forEach((word) => rows.push({ type: 'vocab-word', key: word.id, text: JSON.stringify(word) }));

    return rows;
}

function rowsToJournal(rows) {
    const journal = emptyState();
    const topics = [];
    const words = [];

    rows.forEach((row) => {
        if (row.type === 'setting' && row.key === 'trackingStart' && row.text) {
            journal.trackingStart = row.text;
        } else if (row.type === 'setting' && row.key === 'englishStart') {
            journal.english.startDate = row.text || null;
        } else if (row.type === 'day-note') {
            journal.days[row.date] = { tasks: {}, ...journal.days[row.date], note: row.text };
        } else if (row.type === 'task') {
            const day = journal.days[row.date] ?? { tasks: {}, note: '' };
            day.tasks[row.key] = {
                status: row.status || null,
                note: row.text,
                ...decodeSteps(row.steps),
                variant: row.variant || null,
                minutes: row.minutes === undefined || row.minutes === '' ? null : Number(row.minutes),
                activity: row.activity ?? '',
            };
            journal.days[row.date] = day;
        } else if (row.type === 'english-day') {
            journal.english.days[row.key] = { ...emptyEnglishLog(), ...journal.english.days[row.key], done: row.status === 'done', note: row.text };
        } else if (row.type === 'english-skill') {
            const [dayNumber, skill] = row.key.split('.');
            const log = { ...emptyEnglishLog(), ...journal.english.days[dayNumber] };
            if (row.status === 'hidden') {
                log.hidden = [...log.hidden, skill];
            } else {
                log.skills = { ...log.skills, [skill]: { note: row.text, score: row.variant } };
            }
            journal.english.days[dayNumber] = log;
        } else if (row.type === 'vocab-topic') {
            topics.push({ id: row.key, name: row.text });
        } else if (row.type === 'vocab-word') {
            words.push(JSON.parse(row.text));
        }
    });

    journal.vocab = { topics: topics.length ? topics : DEFAULT_TOPICS, words };
    return journal;
}

export function importRows(rows) {
    commit(rowsToJournal(rows));
}
