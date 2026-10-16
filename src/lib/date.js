const DAY_MS = 86400000;

function pad(value) {
    return String(value).padStart(2, '0');
}

export function toKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromKey(key) {
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day);
}

export function todayKey() {
    return toKey(new Date());
}

export function addDays(key, amount) {
    const date = fromKey(key);
    date.setDate(date.getDate() + amount);
    return toKey(date);
}

export function diffDays(fromKeyValue, toKeyValue) {
    return Math.round((fromKey(toKeyValue) - fromKey(fromKeyValue)) / DAY_MS);
}

export function weekdayOf(key) {
    return fromKey(key).getDay();
}

export function rangeKeys(startKey, endKey) {
    const keys = [];
    for (let key = startKey; key <= endKey; key = addDays(key, 1)) {
        keys.push(key);
    }
    return keys;
}

export function monthMatrix(year, month) {
    const first = new Date(year, month, 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = toKey(new Date(year, month, 1 - mondayOffset));
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function minutesOfDay(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

export function endTime(start, minutes) {
    const total = minutesOfDay(start) + minutes;
    return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

export function formatLongDate(key, t) {
    const date = fromKey(key);
    return `${t('weekdays.long')[date.getDay()]}, ${date.getDate()} ${t('months')[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatShortDate(key, t) {
    const date = fromKey(key);
    return `${date.getDate()} ${t('monthsShort')[date.getMonth()]}, ${date.getFullYear()}`;
}

export function formatDuration(totalMinutes) {
    const minutes = Math.max(0, Math.round(totalMinutes ?? 0));
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours === 0) {
        return `${rest}m`;
    }
    return rest ? `${hours}h${pad(rest)}` : `${hours}h`;
}
