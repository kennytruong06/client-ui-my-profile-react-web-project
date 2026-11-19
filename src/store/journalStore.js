import { useSyncExternalStore } from 'react';
import { todayKey } from '@/lib/date';
import { DEFAULT_TOPICS, ENGLISH_SKILLS, EXAMS } from '@/data/english';
import { fromCsv, toCsv } from '@/lib/csv';
import { emptyProfile, mealFromPlan, sameFood } from '@/lib/nutrition';
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
        english: { days: {}, milestones: {} },
        vocab: { words: [], topics: DEFAULT_TOPICS },
        nutrition: emptyNutrition(),
    };
}

export function emptyNutrition() {
    return { profile: null, weights: {}, days: {}, fridge: [], plan: [], menus: {} };
}

function normalize(parsed) {
    const defaults = emptyState();
    return {
        ...defaults,
        ...parsed,
        english: { ...defaults.english, ...parsed.english },
        vocab: { ...defaults.vocab, ...parsed.vocab },
        nutrition: { ...defaults.nutrition, ...parsed.nutrition },
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

export function emptyEnglishLog() {
    return { done: false, date: '', note: '', hidden: [], skills: {} };
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

export function assignEnglishDay(dayNumber, date) {
    const days = Object.fromEntries(Object.entries(state.english.days).map(([key, log]) => [key, date && log.date === date ? { ...log, date: '' } : log]));
    days[dayNumber] = { ...englishLogOf({ english: { days } }, dayNumber), date };
    commit({ ...state, english: { ...state.english, days } });
}

export function milestoneOf(journal, dayNumber) {
    const stored = journal.english.milestones?.[dayNumber];
    return { ielts: { ...stored?.ielts }, toeic: { ...stored?.toeic } };
}

function milestonesWith(journal, dayNumber, exam, skill, patch) {
    const current = milestoneOf(journal, dayNumber);
    const entry = { score: '', note: '', ...current[exam][skill], ...patch };
    return { ...journal.english.milestones, [dayNumber]: { ...current, [exam]: { ...current[exam], [skill]: entry } } };
}

export function updateMilestone(dayNumber, exam, skill, patch) {
    commit({ ...state, english: { ...state.english, milestones: milestonesWith(state, dayNumber, exam, skill, patch) } });
}

export function updateEnglishSkill(dayNumber, skill, patch) {
    withEnglishDay(dayNumber, (log) => ({ ...log, skills: { ...log.skills, [skill]: { note: '', ...log.skills[skill], ...patch } } }));
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

export function saveProfile(patch) {
    const profile = { ...emptyProfile(), ...state.nutrition.profile, ...patch };
    commit({ ...state, nutrition: { ...state.nutrition, profile } });
}

export function setWeight(date, kg) {
    const weights = { ...state.nutrition.weights };
    if (kg == null || kg === '' || Number(kg) <= 0) {
        delete weights[date];
    } else {
        weights[date] = Number(kg);
    }
    commit({ ...state, nutrition: { ...state.nutrition, weights } });
}

function withNutritionDay(date, update) {
    const day = state.nutrition.days[date] ?? { meals: [], burn: 0, note: '' };
    const nextDay = update(day);
    const days = { ...state.nutrition.days };
    if (nextDay.meals.length === 0 && !nextDay.burn && !nextDay.note) {
        delete days[date];
    } else {
        days[date] = nextDay;
    }
    commit({ ...state, nutrition: { ...state.nutrition, days } });
}

export function addMeal(date, meal) {
    withNutritionDay(date, (day) => ({ ...day, meals: [...day.meals, { qty: 1, ...meal, id: newId() }] }));
}

export function updateMeal(date, id, patch) {
    withNutritionDay(date, (day) => ({ ...day, meals: day.meals.map((meal) => (meal.id === id ? { ...meal, ...patch } : meal)) }));
}

export function removeMeal(date, id) {
    withNutritionDay(date, (day) => ({ ...day, meals: day.meals.filter((meal) => meal.id !== id) }));
}

export function setNutritionDay(date, patch) {
    withNutritionDay(date, (day) => ({ ...day, ...patch }));
}

function commitNutrition(update) {
    commit({ ...state, nutrition: update(state.nutrition) });
}

export function addFridgeItem(item) {
    commitNutrition((nutrition) => {
        const existing = nutrition.fridge.find((candidate) => sameFood(candidate, item));
        if (existing) {
            const fridge = nutrition.fridge.map((candidate) => (candidate.id === existing.id ? { ...candidate, amount: candidate.amount + item.amount } : candidate));
            return { ...nutrition, fridge };
        }
        return { ...nutrition, fridge: [...nutrition.fridge, { ...item, id: newId() }] };
    });
}

export function updateFridgeItem(id, patch) {
    commitNutrition((nutrition) => ({ ...nutrition, fridge: nutrition.fridge.map((item) => (item.id === id ? { ...item, ...patch } : item)) }));
}

export function removeFridgeItem(id) {
    commitNutrition((nutrition) => ({
        ...nutrition,
        fridge: nutrition.fridge.filter((item) => item.id !== id),
        plan: nutrition.plan.filter((entry) => entry.fridgeId !== id || entry.done),
    }));
}

export function setMenu(date, slot, patch) {
    commitNutrition((nutrition) => {
        const key = `${date}|${slot}`;
        const next = { ...nutrition.menus[key], ...patch };
        const menus = { ...nutrition.menus };
        if (!next.title && !next.time && !next.note) {
            delete menus[key];
        } else {
            menus[key] = next;
        }
        return { ...nutrition, menus };
    });
}

export function addPlanEntry(entry) {
    commitNutrition((nutrition) => ({ ...nutrition, plan: [...nutrition.plan, { done: false, mealId: null, ...entry, id: newId() }] }));
}

export function updatePlanEntry(id, patch) {
    commitNutrition((nutrition) => ({ ...nutrition, plan: nutrition.plan.map((entry) => (entry.id === id && !entry.done ? { ...entry, ...patch } : entry)) }));
}

export function removePlanEntry(id) {
    commitNutrition((nutrition) => ({ ...nutrition, plan: nutrition.plan.filter((entry) => entry.id !== id || entry.done) }));
}

function applyPlanDone(nutrition, entryId, done) {
    const entry = nutrition.plan.find((candidate) => candidate.id === entryId);
    if (!entry || entry.done === done || (done && entry.date > todayKey())) {
        return nutrition;
    }
    const delta = done ? -entry.amount : entry.amount;
    const fridge = nutrition.fridge.map((item) => (item.id === entry.fridgeId ? { ...item, amount: Math.max(Math.round((item.amount + delta) * 10) / 10, 0) } : item));
    const days = { ...nutrition.days };
    const day = days[entry.date] ?? { meals: [], burn: 0, note: '' };
    const mealId = done ? newId() : null;
    const meals = done ? [...day.meals, mealFromPlan(entry, mealId)] : day.meals.filter((meal) => meal.id !== entry.mealId);
    if (meals.length === 0 && !day.burn && !day.note) {
        delete days[entry.date];
    } else {
        days[entry.date] = { ...day, meals };
    }
    const plan = nutrition.plan.map((candidate) => (candidate.id === entryId ? { ...candidate, done, mealId } : candidate));
    return { ...nutrition, fridge, days, plan };
}

export function setPlanDone(entryIds, done) {
    commitNutrition((nutrition) => entryIds.reduce((current, entryId) => applyPlanDone(current, entryId, done), nutrition));
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
        rows.push({ type: 'english-day', date: log.date, key: dayNumber, status: log.done ? 'done' : '', text: log.note });
        ENGLISH_SKILLS.forEach((skill) => {
            const entry = log.skills[skill];
            const hidden = log.hidden.includes(skill);
            if (entry || hidden) {
                rows.push({ type: 'english-skill', key: `${dayNumber}.${skill}`, status: hidden ? 'hidden' : '', text: entry?.note ?? '' });
            }
        });
    });

    Object.keys(journal.english.milestones ?? {}).sort((a, b) => Number(a) - Number(b)).forEach((dayNumber) => {
        const milestone = milestoneOf(journal, dayNumber);
        EXAMS.forEach((exam) => {
            ENGLISH_SKILLS.forEach((skill) => {
                const entry = milestone[exam][skill];
                if (entry && (entry.score || entry.note)) {
                    rows.push({ type: 'milestone', key: `${dayNumber}.${exam}.${skill}`, variant: entry.score, text: entry.note });
                }
            });
        });
    });

    if (journal.nutrition.profile) {
        rows.push({ type: 'body-profile', text: JSON.stringify(journal.nutrition.profile) });
    }
    Object.entries(journal.nutrition.weights).sort(([a], [b]) => a.localeCompare(b)).forEach(([date, kg]) => {
        rows.push({ type: 'body-weight', date, text: kg });
    });
    Object.entries(journal.nutrition.days).sort(([a], [b]) => a.localeCompare(b)).forEach(([date, day]) => {
        if (day.burn || day.note) {
            rows.push({ type: 'nutrition-day', date, minutes: day.burn || '', text: day.note });
        }
        day.meals.forEach((meal) => rows.push({ type: 'meal', date, key: meal.id, text: JSON.stringify(meal) }));
    });
    journal.nutrition.fridge.forEach((item) => rows.push({ type: 'fridge-item', key: item.id, text: JSON.stringify(item) }));
    Object.entries(journal.nutrition.menus ?? {}).sort(([a], [b]) => a.localeCompare(b)).forEach(([key, menu]) => {
        const [date, slot] = key.split('|');
        rows.push({ type: 'meal-menu', date, key: slot, text: JSON.stringify(menu) });
    });
    [...journal.nutrition.plan].sort((a, b) => a.date.localeCompare(b.date)).forEach((entry) => {
        const { date, ...rest } = entry;
        rows.push({ type: 'meal-plan', date, key: entry.id, status: entry.done ? 'done' : '', text: JSON.stringify(rest) });
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
            journal.english.days[row.key] = { ...emptyEnglishLog(), ...journal.english.days[row.key], done: row.status === 'done', date: row.date ?? '', note: row.text };
        } else if (row.type === 'english-skill') {
            const [dayNumber, skill] = row.key.split('.');
            const log = { ...emptyEnglishLog(), ...journal.english.days[dayNumber] };
            if (row.status === 'hidden') {
                log.hidden = [...log.hidden, skill];
            } else {
                log.skills = { ...log.skills, [skill]: { note: row.text } };
            }
            journal.english.days[dayNumber] = log;
            if (row.variant) {
                journal.english.milestones = milestonesWith(journal, dayNumber, 'ielts', skill, { score: row.variant });
            }
        } else if (row.type === 'milestone') {
            const [dayNumber, exam, skill] = row.key.split('.');
            journal.english.milestones = milestonesWith(journal, dayNumber, exam, skill, { score: row.variant, note: row.text });
        } else if (row.type === 'body-profile') {
            journal.nutrition.profile = { ...emptyProfile(), ...JSON.parse(row.text) };
        } else if (row.type === 'body-weight') {
            journal.nutrition.weights[row.date] = Number(row.text);
        } else if (row.type === 'nutrition-day') {
            const day = journal.nutrition.days[row.date] ?? { meals: [], burn: 0, note: '' };
            journal.nutrition.days[row.date] = { ...day, burn: Number(row.minutes) || 0, note: row.text ?? '' };
        } else if (row.type === 'meal') {
            const day = journal.nutrition.days[row.date] ?? { meals: [], burn: 0, note: '' };
            journal.nutrition.days[row.date] = { ...day, meals: [...day.meals, JSON.parse(row.text)] };
        } else if (row.type === 'fridge-item') {
            journal.nutrition.fridge = [...journal.nutrition.fridge, JSON.parse(row.text)];
        } else if (row.type === 'meal-menu') {
            journal.nutrition.menus = { ...journal.nutrition.menus, [`${row.date}|${row.key}`]: JSON.parse(row.text) };
        } else if (row.type === 'meal-plan') {
            journal.nutrition.plan = [...journal.nutrition.plan, { ...JSON.parse(row.text), date: row.date }];
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
