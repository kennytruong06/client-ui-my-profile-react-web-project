export const ENGLISH_SKILLS = ['listening', 'reading', 'writing', 'speaking'];

export const CHART_SKILLS = ['listening', 'reading'];

export const EXAMS = ['ielts', 'toeic'];

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
