const SKY_STOPS = [
    { at: 0, top: '#0a1030', bottom: '#243b6b' },
    { at: 5, top: '#1b2350', bottom: '#5a4a7a' },
    { at: 6.5, top: '#7aa6d8', bottom: '#ffc99a' },
    { at: 8, top: '#5fa8ea', bottom: '#cfeaff' },
    { at: 12, top: '#3d9be9', bottom: '#bfe6ff' },
    { at: 16, top: '#4e8fd0', bottom: '#ffe1a8' },
    { at: 18, top: '#7a5aa6', bottom: '#ff9a6a' },
    { at: 19.5, top: '#1c2450', bottom: '#4a4a85' },
    { at: 21, top: '#0b1030', bottom: '#243b6b' },
    { at: 24, top: '#0a1030', bottom: '#243b6b' },
];

export const clamp01 = (value) => Math.min(Math.max(value, 0), 1);

const smooth = (from, to, value) => {
    const ratio = clamp01((value - from) / (to - from));
    return ratio * ratio * (3 - 2 * ratio);
};

const bump = (from, peak, to, value) => smooth(from, peak, value) * (1 - smooth(peak, to, value));

const channel = (hex, offset) => parseInt(hex.slice(offset, offset + 2), 16);

export function mixColor(from, to, ratio) {
    const parts = [1, 3, 5].map((offset) => {
        const value = channel(from, offset) + (channel(to, offset) - channel(from, offset)) * ratio;
        return Math.round(value).toString(16).padStart(2, '0');
    });
    return `#${parts.join('')}`;
}

export function skyAtHour(hour) {
    const nextIndex = SKY_STOPS.findIndex((stop) => stop.at >= hour);
    if (nextIndex <= 0) {
        return SKY_STOPS[0];
    }
    const previous = SKY_STOPS[nextIndex - 1];
    const next = SKY_STOPS[nextIndex];
    const ratio = (hour - previous.at) / (next.at - previous.at);
    return { top: mixColor(previous.top, next.top, ratio), bottom: mixColor(previous.bottom, next.bottom, ratio) };
}

export const nightAt = (hour) => Math.max(smooth(18.6, 20.6, hour), 1 - smooth(5.2, 6.8, hour));

export const warmAt = (hour) => Math.max(bump(16.3, 17.9, 19.4, hour), bump(5.6, 6.6, 7.8, hour));

export function sceneIndexAt(sceneCount, progress) {
    return Math.min(Math.floor(progress * (sceneCount - 1) + 1e-9), sceneCount - 1);
}

export function hourAt(scenes, progress) {
    const index = sceneIndexAt(scenes.length, progress);
    if (index >= scenes.length - 1) {
        return scenes[index].hour;
    }
    const ratio = progress * (scenes.length - 1) - index;
    return scenes[index].hour + (scenes[index + 1].hour - scenes[index].hour) * ratio;
}

export function secondsIntoScene(sceneCount, progress, totalSeconds) {
    const index = sceneIndexAt(sceneCount, progress);
    const ratio = Math.max(progress * (sceneCount - 1) - index, 0);
    return (ratio * totalSeconds) / (sceneCount - 1);
}

export function formatHour(hour) {
    const total = Math.round(hour * 60);
    const hours = Math.floor(total / 60) % 24;
    const minutes = total % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
