import { BEDTIME, WAKE_TIME, WORK_HOURS, mealsForWeekday, tasksForDate } from '@/data/schedule';
import { minutesOfDay, weekdayOf } from '@/lib/date';

export const DAY_START = minutesOfDay(WAKE_TIME);
export const DAY_END = minutesOfDay(BEDTIME);

function assignLanes(blocks) {
    const sorted = [...blocks].sort((a, b) => a.start - b.start || b.minutes - a.minutes);
    const result = [];
    let cluster = [];
    let clusterEnd = -1;

    const flush = () => {
        const lanes = Math.max(1, ...cluster.map((block) => block.lane + 1));
        cluster.forEach((block) => result.push({ ...block, lanes }));
        cluster = [];
    };

    sorted.forEach((block) => {
        if (cluster.length && block.start >= clusterEnd) {
            flush();
            clusterEnd = -1;
        }
        const taken = cluster.filter((other) => other.start + other.minutes > block.start).map((other) => other.lane);
        let lane = 0;
        while (taken.includes(lane)) {
            lane += 1;
        }
        cluster.push({ ...block, lane });
        clusterEnd = Math.max(clusterEnd, block.start + block.minutes);
    });
    if (cluster.length) {
        flush();
    }
    return result;
}

export function blocksForDate(date) {
    const weekday = weekdayOf(date);
    const blocks = [];

    if (WORK_HOURS.days.includes(weekday)) {
        WORK_HOURS.blocks.forEach((block, index) => {
            blocks.push({ id: `work-${index}`, kind: 'work', start: minutesOfDay(block.start), minutes: block.minutes });
        });
    }

    mealsForWeekday(weekday).forEach((meal) => {
        blocks.push({ id: `meal-${meal.id}`, kind: 'meal', meal: meal.id, start: minutesOfDay(meal.start), minutes: meal.minutes });
    });

    tasksForDate(date).filter((task) => !task.flexible).forEach((task) => {
        blocks.push({ id: task.id, kind: 'task', task, start: minutesOfDay(task.start), minutes: task.minutes });
    });

    return assignLanes(blocks);
}

export function hourMarks() {
    const marks = [];
    for (let minute = Math.ceil(DAY_START / 60) * 60; minute <= DAY_END; minute += 60) {
        marks.push(minute);
    }
    return marks;
}

export function formatClock(minutes) {
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}
