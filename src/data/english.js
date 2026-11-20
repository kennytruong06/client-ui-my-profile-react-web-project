export const ENGLISH_SKILLS = ['listening', 'reading', 'writing', 'speaking'];

export const CHART_SKILLS = ['listening', 'reading'];

export const EXAMS = ['ielts', 'toeic'];

export const STUDY_TOPIC_GROUPS = ['learn', 'practice', 'review', 'other'];

const topic = (id, group, vi, en) => ({ id, group, label: { vi, en } });

export const STUDY_TOPICS = [
    topic('theory', 'learn', 'Ôn lý thuyết', 'Review theory'),
    topic('grammar', 'learn', 'Ngữ pháp', 'Grammar'),
    topic('vocab-new', 'learn', 'Học từ vựng mới', 'Learn new vocabulary'),
    topic('vocab-review', 'learn', 'Ôn từ vựng', 'Review vocabulary'),
    topic('listening-test', 'practice', 'Làm đề Listening', 'Listening test'),
    topic('reading-test', 'practice', 'Làm đề Reading', 'Reading test'),
    topic('writing-test', 'practice', 'Làm bài Writing', 'Writing task'),
    topic('speaking-test', 'practice', 'Làm đề Speaking', 'Speaking test'),
    topic('toeic-test', 'practice', 'Làm đề TOEIC', 'TOEIC test'),
    topic('listening-review', 'review', 'Ôn lại Listening', 'Review Listening'),
    topic('reading-review', 'review', 'Ôn lại Reading', 'Review Reading'),
    topic('writing-review', 'review', 'Ôn lại Writing', 'Review Writing'),
    topic('speaking-review', 'review', 'Ôn lại Speaking', 'Review Speaking'),
    topic('mistakes', 'review', 'Chữa lỗi sai', 'Fix mistakes'),
    topic('roadmap', 'other', 'Theo lộ trình IELTS', 'Follow the IELTS roadmap'),
    topic('other', 'other', 'Khác (tự ghi)', 'Other (write it)'),
];

export const SCORE_RULES = {
    ielts: {
        listening: { max: 40, step: 1 },
        reading: { max: 40, step: 1 },
        writing: { max: 9, step: 0.5 },
        speaking: { max: 9, step: 0.5 },
    },
    toeic: {
        listening: { max: 495, step: 5 },
        reading: { max: 495, step: 5 },
        writing: { max: 200, step: 10 },
        speaking: { max: 200, step: 10 },
    },
};

export const DEFAULT_TOPICS = [
    { id: 'travel', name: 'Travel' },
    { id: 'city', name: 'City' },
    { id: 'work', name: 'Work' },
    { id: 'education', name: 'Education' },
    { id: 'technology', name: 'Technology' },
    { id: 'environment', name: 'Environment' },
    { id: 'health', name: 'Health' },
    { id: 'food', name: 'Food' },
    { id: 'daily-life', name: 'Daily life' },
    { id: 'phrases', name: 'Phrases' },
    { id: 'idioms', name: 'Idioms' },
    { id: 'phrasal-verbs', name: 'Phrasal verbs' },
    { id: 'collocations', name: 'Collocations' },
    { id: 'modal-verbs', name: 'Modal verbs' },
];

export const PARTS_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'phrasal-verb', 'idiom', 'phrase', 'preposition', 'conjunction', 'pronoun', 'other'];

export function splitList(text) {
    return (text ?? '').split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
}

export function splitLines(text) {
    return (text ?? '').split('\n').map((item) => item.trim()).filter(Boolean);
}
