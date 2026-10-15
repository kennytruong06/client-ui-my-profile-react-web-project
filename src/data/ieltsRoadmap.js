import { diffDays } from '@/lib/date';

export const ROADMAP_LENGTH = 60;

export const RESOURCES = [
    {
        name: 'IELTS.org — official sample tests',
        url: 'https://ielts.org/take-a-test/preparation-resources/sample-test-questions',
        note: { en: 'Use for regular checkpoints. Pick Academic or General Training.', vi: 'Dùng để làm bài kiểm tra định kỳ. Chọn đúng Academic hoặc General Training.' },
    },
    {
        name: 'British Council — IELTS preparation / IELTS Ready',
        url: 'https://takeielts.britishcouncil.org/prepare',
        note: { en: 'Prep material and practice; some content may need registration or payment.', vi: 'Tài liệu chuẩn bị và bài luyện; một số nội dung có thể cần đăng ký hoặc trả phí.' },
    },
    {
        name: 'BBC Learning English',
        url: 'https://www.bbc.co.uk/learningenglish/',
        note: { en: 'Short listening, pronunciation and daily comprehension. Not a replacement for IELTS tests.', vi: 'Luyện nghe ngắn, phát âm và khả năng hiểu hằng ngày. Không thay thế đề IELTS.' },
    },
    {
        name: 'IELTS Liz',
        url: 'https://ieltsliz.com/',
        note: { en: 'Question types and strategies for all four skills.', vi: 'Học dạng câu hỏi và chiến thuật cả 4 kỹ năng.' },
    },
    {
        name: 'British Council LearnEnglish',
        url: 'https://learnenglish.britishcouncil.org/',
        note: { en: 'Grammar, vocabulary, listening and reading at B1–B2.', vi: 'Củng cố ngữ pháp, từ vựng, nghe và đọc ở mức B1–B2.' },
    },
    {
        name: 'Cambridge English',
        url: 'https://www.cambridgeenglish.org/learning-english/',
        note: { en: 'Extra foundation practice.', vi: 'Bổ sung bài luyện tiếng Anh nền tảng.' },
    },
    {
        name: 'Write & Improve',
        url: 'https://writeandimprove.com/',
        note: { en: 'Writing practice with automatic feedback; it is not an official IELTS score.', vi: 'Luyện viết có phản hồi tự động; không xem đó là điểm IELTS chính thức.' },
    },
];

export const DAILY_BLOCKS = [
    {
        id: 'listening',
        minutes: 60,
        title: { en: 'Listening', vi: 'Listening' },
        items: {
            en: ['20 min: do the listening test', '20 min: check answers and read the transcript', '10 min: listen again to the parts you got wrong', '10 min: log mistakes, shadow the audio or practise pronunciation'],
            vi: ['20 phút làm bài nghe', '20 phút chấm đáp án và xem transcript', '10 phút nghe lại đoạn sai', '10 phút ghi lỗi, luyện phát âm hoặc nhắc theo audio'],
        },
    },
    {
        id: 'reading',
        minutes: 35,
        title: { en: 'Reading', vi: 'Reading' },
        items: {
            en: ['Do one reading section', 'Find the evidence in the text for every answer', 'Note synonyms / paraphrases and why you were wrong'],
            vi: ['Làm một phần bài đọc', 'Tìm bằng chứng trong đoạn văn cho từng đáp án', 'Ghi lại từ đồng nghĩa/paraphrase và lý do sai'],
        },
    },
    {
        id: 'output',
        minutes: 35,
        title: { en: 'Writing or Speaking', vi: 'Writing hoặc Speaking' },
        items: {
            en: ['Alternate the two skills', 'Writing: write, then correct', 'Speaking: answer aloud, record, listen back'],
            vi: ['Luân phiên hai kỹ năng', 'Writing: viết và sửa bài', 'Speaking: trả lời thành tiếng, ghi âm, nghe lại'],
        },
    },
    {
        id: 'grammar',
        minutes: 30,
        title: { en: 'Grammar + Vocabulary', vi: 'Grammar + Vocabulary' },
        items: {
            en: ['Review one grammar point', 'Learn 8–10 words/phrases with examples, taken from your practice'],
            vi: ['Ôn một điểm ngữ pháp', 'Học 8–10 từ/cụm từ có ví dụ, ưu tiên từ lấy từ bài luyện'],
        },
    },
    {
        id: 'review',
        minutes: 20,
        title: { en: 'Review mistakes', vi: 'Ôn lỗi sai' },
        items: {
            en: ['Review old words', 'Look at yesterday’s mistakes', 'Write results in the daily log'],
            vi: ['Ôn từ cũ', 'Xem lại lỗi ngày hôm trước', 'Ghi kết quả vào nhật ký'],
        },
    },
];

export const DAILY_NOTE = {
    en: 'On full mock-test days, adjust the timing to match the real exam. Never skip the correction step after a test.',
    vi: 'Khi làm bài thi thử đầy đủ: điều chỉnh thời lượng để mô phỏng đúng thời gian thi. Đừng bỏ phần chữa lỗi sau khi làm đề.',
};

export const LISTENING_METHOD = [
    {
        title: { en: 'Listen and answer', vi: 'Nghe và làm bài' },
        text: { en: 'Listen once like in the exam. Do not read the transcript first.', vi: 'Nghe một lần như khi thi, không xem transcript trước.' },
    },
    {
        title: { en: 'Score it', vi: 'Chấm điểm' },
        text: { en: 'Mark right/wrong and classify each mistake.', vi: 'Xác định câu đúng/sai và phân loại lỗi.' },
    },
    {
        title: { en: 'Read the transcript', vi: 'Đọc transcript' },
        text: { en: 'Find where each answer is; check vocabulary, linking, pronunciation or paraphrase.', vi: 'Tìm đúng đoạn chứa đáp án; kiểm tra từ vựng, nối âm, phát âm hoặc paraphrase.' },
    },
    {
        title: { en: 'Listen again', vi: 'Nghe lại' },
        text: { en: 'Replay hard parts, shadow the speaker, then listen to the whole part without the transcript.', vi: 'Nghe từng đoạn khó, nhắc theo người nói, rồi nghe cả đoạn không nhìn transcript.' },
    },
    {
        title: { en: 'Write it down', vi: 'Ghi sổ' },
        text: { en: 'Write at least 3 words, phrases or sentences you could not catch.', vi: 'Ghi ít nhất 3 từ/cụm từ hoặc câu mà trước đó nghe không ra.' },
    },
];

export const LISTENING_WARNING = {
    en: 'Never just play audio passively. Every listening session needs answers, checking and correction.',
    vi: 'Không chỉ bật audio thụ động. Mỗi lần luyện nghe cần có bài làm, kiểm tra đáp án và chữa lỗi.',
};

export const CHECKPOINTS = {
    1: { en: 'Measure your starting point in all four skills.', vi: 'Đo điểm xuất phát của cả 4 kỹ năng.' },
    7: { en: 'Identify your common Listening mistake types.', vi: 'Xác định nhóm lỗi Listening thường gặp.' },
    14: { en: 'Do an equivalent test and compare correct answers.', vi: 'Làm bài tương đương và so sánh số câu đúng.' },
    28: { en: 'Mock test and check your speed.', vi: 'Mock test và kiểm tra tốc độ.' },
    42: { en: 'Check that your score stays stable.', vi: 'Kiểm tra khả năng giữ điểm ổn định.' },
    56: { en: 'Assess readiness for the placement test.', vi: 'Đánh giá mức sẵn sàng cho bài test đầu vào.' },
    58: { en: 'Assess readiness for the placement test.', vi: 'Đánh giá mức sẵn sàng cho bài test đầu vào.' },
};

export const SCORING_NOTE = {
    en: 'For Listening and Academic Reading, record correct answers out of 40 and use the conversion table of that test as a guide. Thresholds differ between tests. Writing and Speaking should be judged by IELTS criteria or by someone qualified.',
    vi: 'Với Listening và Academic Reading, ghi số câu đúng trên 40 và dùng bảng quy đổi của đề tương ứng để tham khảo band. Ngưỡng quy đổi có thể khác nhau giữa các đề. Writing và Speaking nên được đánh giá theo tiêu chí IELTS hoặc nhờ người có chuyên môn phản hồi.',
};

export const PRINCIPLES = [
    {
        title: { en: 'Do not just grind tests', vi: 'Không chỉ cày đề' },
        text: { en: 'The first two weeks are for learning the format and fixing the foundation.', vi: 'Hai tuần đầu cần học format và củng cố nền tảng.' },
    },
    {
        title: { en: 'Do not memorise model answers', vi: 'Không học thuộc bài mẫu' },
        text: { en: 'Learn to develop ideas and express them naturally.', vi: 'Học cách phát triển ý và diễn đạt tự nhiên.' },
    },
    {
        title: { en: 'No progress after 3–4 weeks? Change the method', vi: 'Không tăng điểm sau 3–4 tuần thì đổi cách luyện' },
        text: { en: 'Find the specific cause instead of doing more tests mechanically.', vi: 'Tìm nguyên nhân cụ thể thay vì làm thêm đề một cách máy móc.' },
    },
];

export const WEEKS = [
    {
        week: 1,
        title: { en: 'Understand the test and fix basic listening errors', vi: 'Hiểu bài thi và sửa lỗi nghe cơ bản' },
        days: [
            { en: 'Placement test in all 4 skills; save Listening/Reading results and your Writing/Speaking.', vi: 'Kiểm tra đầu vào 4 kỹ năng; lưu kết quả Listening/Reading và bài Writing/Speaking.' },
            { en: 'Listening gap-fill; practise numbers, names and addresses.', vi: 'Listening dạng điền thông tin; luyện nghe số, tên, địa chỉ.' },
            { en: 'Listening on places/directions; review prepositions and position words.', vi: 'Listening về địa điểm/chỉ đường; ôn giới từ và từ chỉ vị trí.' },
            { en: 'Listening multiple choice; spot distractors.', vi: 'Listening multiple choice; nhận diện đáp án gây nhiễu.' },
            { en: 'Reading for specific information; review basic tenses.', vi: 'Reading tìm thông tin cụ thể; ôn các thì cơ bản.' },
            { en: 'Write an opinion paragraph; Speaking Part 1 about yourself.', vi: 'Writing đoạn nêu ý kiến; Speaking Part 1 về bản thân.' },
            { en: 'Mini-test Listening + Reading; review the week’s mistakes.', vi: 'Mini-test Listening + Reading; tổng kết lỗi cả tuần.' },
        ],
    },
    {
        week: 2,
        title: { en: 'Strengthen the B1 foundation', vi: 'Củng cố nền B1' },
        days: [
            { en: 'Listening form completion; practise spelling and singular/plural.', vi: 'Listening form completion; luyện chính tả và số ít/số nhiều.' },
            { en: 'Listening matching; review synonyms and paraphrasing.', vi: 'Listening matching; ôn từ đồng nghĩa và cách diễn đạt lại.' },
            { en: 'Reading True/False/Not Given; separate “not mentioned” information.', vi: 'Reading True/False/Not Given; phân biệt thông tin không được đề cập.' },
            { en: 'Grammar: articles, subject–verb agreement, compound sentences.', vi: 'Grammar: articles, subject–verb agreement, câu ghép.' },
            { en: 'Writing Task 2: opinion essay; practise outlining.', vi: 'Writing Task 2: opinion essay; tập lập dàn ý.' },
            { en: 'Speaking Part 1 and Part 2; record your answers.', vi: 'Speaking Part 1 và Part 2; ghi âm câu trả lời.' },
            { en: 'Second Listening + Reading test; compare with Day 1.', vi: 'Kiểm tra Listening + Reading lần hai; so sánh với ngày 1.' },
        ],
    },
    {
        week: 3,
        title: { en: 'Learn IELTS techniques', vi: 'Học kỹ thuật IELTS' },
        days: [
            { en: 'Listening Part 2; practise maps and diagrams.', vi: 'Listening Part 2; luyện bản đồ và sơ đồ.' },
            { en: 'Listening Part 3; multi-speaker conversations.', vi: 'Listening Part 3; nghe hội thoại nhiều người.' },
            { en: 'Reading matching headings and sentence completion.', vi: 'Reading matching headings và sentence completion.' },
            { en: 'Writing Task 2: discuss both views.', vi: 'Writing Task 2: thảo luận hai quan điểm.' },
            { en: 'Speaking Part 2; talk 1–2 minutes from a cue card.', vi: 'Speaking Part 2; nói 1–2 phút theo cue card.' },
            { en: 'Full 4-part Listening; correct every wrong answer.', vi: 'Listening đủ 4 phần; chữa từng câu sai.' },
            { en: 'Timed mini mock; note your weakest skill.', vi: 'Mini mock có bấm giờ; ghi lại kỹ năng yếu nhất.' },
        ],
    },
    {
        week: 4,
        title: { en: 'Work under time limits', vi: 'Làm bài có giới hạn thời gian' },
        days: [
            { en: 'Full Listening test; do not pause the audio.', vi: 'Listening đề hoàn chỉnh; không tạm dừng audio.' },
            { en: 'Timed Reading; practise time management.', vi: 'Reading có bấm giờ; tập quản lý thời gian.' },
            { en: 'Writing Task 1 Academic: describe a chart.', vi: 'Writing Task 1 Academic: mô tả biểu đồ.' },
            { en: 'Speaking Parts 1, 2 and 3.', vi: 'Speaking đủ Part 1, 2, 3.' },
            { en: 'Writing Task 2 in 40 minutes.', vi: 'Writing Task 2 trong 40 phút.' },
            { en: 'Deep practice on the Listening type you miss most.', vi: 'Luyện sâu dạng Listening sai nhiều nhất.' },
            { en: '4-skill practice test; save the results.', vi: 'Kiểm tra thử 4 kỹ năng và lưu kết quả.' },
        ],
    },
    {
        week: 5,
        title: { en: 'Raise accuracy', vi: 'Tăng độ chính xác' },
        days: [
            { en: 'Listening Sections 1–2; focus on spelling and distractors.', vi: 'Listening Section 1–2; tập trung spelling và distractors.' },
            { en: 'Listening Sections 3–4; listen for main ideas.', vi: 'Listening Section 3–4; luyện nghe ý chính.' },
            { en: 'Reading; analyse paraphrases and synonyms.', vi: 'Reading; phân tích paraphrase và từ đồng nghĩa.' },
            { en: 'Writing Task 1 and Task 2; watch the structure.', vi: 'Writing Task 1 và Task 2; chú ý bố cục.' },
            { en: 'Speaking on education, technology, work.', vi: 'Speaking về education, technology, work.' },
            { en: 'Listening + Reading under exam conditions.', vi: 'Làm Listening + Reading trong điều kiện thi.' },
            { en: '4-skill mock test; compare with Day 28.', vi: 'Mock test 4 kỹ năng; so sánh với ngày 28.' },
        ],
    },
    {
        week: 6,
        title: { en: 'Target the weak points', vi: 'Tập trung vào điểm yếu' },
        days: [
            { en: 'Classify Listening mistakes: could not hear, did not know the word, spelling, or tricked.', vi: 'Phân loại lỗi Listening: nghe không ra, không hiểu từ, sai chính tả hay bị đánh lừa.' },
            { en: 'Practise the Listening error group you make most.', vi: 'Luyện đúng nhóm lỗi Listening mắc nhiều nhất.' },
            { en: 'Reading and Writing on environment or education.', vi: 'Reading và Writing về environment hoặc education.' },
            { en: 'Speaking mock; listen back and correct.', vi: 'Speaking mock; nghe lại bản ghi âm và sửa lỗi.' },
            { en: 'Full Listening test; record the score.', vi: 'Listening đề hoàn chỉnh; ghi điểm.' },
            { en: 'Full Reading test; record the score.', vi: 'Reading đề hoàn chỉnh; ghi điểm.' },
            { en: '4-skill mock test and progress review.', vi: 'Mock test 4 kỹ năng và đánh giá tiến bộ.' },
        ],
    },
    {
        week: 7,
        title: { en: 'Simulate the placement test', vi: 'Mô phỏng bài kiểm tra đầu vào' },
        days: [
            { en: 'Full Listening test; accuracy first.', vi: 'Listening đủ đề; ưu tiên độ chính xác.' },
            { en: 'Full Reading test; work on speed.', vi: 'Reading đủ đề; luyện tốc độ.' },
            { en: 'Both Writing tasks in 60 minutes (Academic).', vi: 'Writing đủ hai Task trong 60 phút (nếu thi Academic).' },
            { en: 'Speaking mock, 11–14 minutes.', vi: 'Speaking mock 11–14 phút.' },
            { en: 'Review your mistake notebook and collected vocabulary.', vi: 'Ôn sổ lỗi sai và từ vựng tích lũy.' },
            { en: '4-skill mock test.', vi: 'Mock test 4 kỹ năng.' },
            { en: 'Summarise scores and pick your 2 biggest weaknesses.', vi: 'Tổng hợp điểm và xác định 2 điểm yếu lớn nhất.' },
        ],
    },
    {
        week: 8,
        title: { en: 'Polish and get ready for the test', vi: 'Hoàn thiện và sẵn sàng đi test' },
        days: [
            { en: 'Your weakest Listening type.', vi: 'Listening dạng yếu nhất.' },
            { en: 'Your weakest Reading type.', vi: 'Reading dạng yếu nhất.' },
            { en: 'Writing Task 1 + Task 2.', vi: 'Writing Task 1 + Task 2.' },
            { en: 'Speaking mock and corrections.', vi: 'Speaking mock và sửa lỗi.' },
            { en: 'Full Listening test.', vi: 'Listening đề hoàn chỉnh.' },
            { en: 'Full Reading test.', vi: 'Reading đề hoàn chỉnh.' },
            { en: '4-skill mock test.', vi: 'Mock test 4 kỹ năng.' },
            { en: 'Deep review of repeated Listening mistakes.', vi: 'Ôn sâu các lỗi Listening lặp lại.' },
            { en: 'Final practice test.', vi: 'Làm bài kiểm tra thử cuối.' },
            { en: 'Review strategies, Writing structure and Speaking topics.', vi: 'Ôn chiến thuật, bố cục Writing và chủ đề Speaking.' },
            { en: 'Light review, rest, then go to the placement test.', vi: 'Ôn nhẹ, nghỉ ngơi và đi kiểm tra đầu vào.' },
        ],
    },
];

export const ROADMAP_DAYS = WEEKS.flatMap((week, weekIndex) => {
    const offset = WEEKS.slice(0, weekIndex).reduce((sum, previous) => sum + previous.days.length, 0);
    return week.days.map((text, index) => ({ day: offset + index + 1, week: week.week, text }));
});

export function roadmapDay(dayNumber) {
    return ROADMAP_DAYS.find((item) => item.day === dayNumber) ?? null;
}

export function roadmapDayFor(startDate, date) {
    if (!startDate) {
        return null;
    }
    const day = diffDays(startDate, date) + 1;
    return day >= 1 && day <= ROADMAP_LENGTH ? day : null;
}
