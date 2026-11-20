import { EXERCISE_ACTIVITIES, EXERCISE_GROUPS } from '@/data/exercise';
import { STUDY_TOPICS, STUDY_TOPIC_GROUPS } from '@/data/english';

export const SESSION_KINDS = {
    study: { topics: STUDY_TOPICS, groups: STUDY_TOPIC_GROUPS, quickMinutes: [15, 30, 45, 60, 90] },
    exercise: { topics: EXERCISE_ACTIVITIES, groups: EXERCISE_GROUPS, quickMinutes: [10, 15, 20, 30, 45, 60] },
};

export function topicOf(kind, id) {
    return SESSION_KINDS[kind].topics.find((item) => item.id === id) ?? null;
}

export function metricsOf(kind, id) {
    return topicOf(kind, id)?.metrics ?? [];
}
