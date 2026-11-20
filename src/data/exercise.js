export const EXERCISE_GROUPS = ['strength', 'cardio', 'sport', 'other'];

const activity = (id, group, vi, en, metrics = []) => ({ id, group, metrics, label: { vi, en } });

export const EXERCISE_ACTIVITIES = [
    activity('pushups', 'strength', 'Hít đất', 'Push-ups', ['reps']),
    activity('squats', 'strength', 'Squat', 'Squats', ['reps']),
    activity('crunches', 'strength', 'Gập bụng', 'Crunches', ['reps']),
    activity('plank', 'strength', 'Plank', 'Plank'),
    activity('walk', 'cardio', 'Đi bộ', 'Walking', ['km']),
    activity('run', 'cardio', 'Chạy bộ', 'Running', ['km']),
    activity('cycling', 'cardio', 'Đạp xe', 'Cycling', ['km']),
    activity('swim', 'cardio', 'Bơi lội', 'Swimming', ['km']),
    activity('jump-rope', 'cardio', 'Nhảy dây', 'Jump rope', ['reps']),
    activity('badminton', 'sport', 'Đánh cầu lông', 'Badminton'),
    activity('football', 'sport', 'Đá banh', 'Football'),
    activity('volleyball', 'sport', 'Bóng chuyền', 'Volleyball'),
    activity('basketball', 'sport', 'Bóng rổ', 'Basketball'),
    activity('shadow', 'other', 'Đấm gió boxing', 'Shadow boxing'),
    activity('stretch', 'other', 'Giãn cơ / yoga', 'Stretching / yoga'),
    activity('other', 'other', 'Khác (tự ghi)', 'Other (write it)'),
];

const REPS_PER_MINUTE = 10;
const MIN_ESTIMATE = 2;

export function estimateMinutes(reps) {
    return Math.max(Math.ceil(Number(reps) / REPS_PER_MINUTE), MIN_ESTIMATE);
}
