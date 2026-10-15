export const CATEGORIES = ['exercise', 'english', 'skincare', 'guitar', 'piano'];

export const SKINCARE_STEPS = [
    { id: 'remover', label: { en: 'Makeup remover', vi: 'Tẩy trang' } },
    { id: 'cleanser', label: { en: 'Cleanser', vi: 'Sữa rửa mặt' } },
    { id: 'pre-serum', label: { en: 'Pre-serum', vi: 'Pre-serum' } },
    { id: 'serum', label: { en: 'Serum', vi: 'Serum' } },
    { id: 'nohalab', label: { en: 'Nohalab · deep repair & moisturizing', vi: 'Nohalab · phục hồi & dưỡng ẩm chuyên sâu' } },
];

const skincareNight = (start) => ({
    id: 'skincare',
    category: 'skincare',
    mandatory: true,
    start,
    minutes: 20,
    title: { en: 'Night skin care', vi: 'Skin care buổi tối' },
    steps: SKINCARE_STEPS,
});

const WORKDAY_FULL = [
    {
        id: 'workout',
        category: 'exercise',
        mandatory: true,
        start: '06:00',
        minutes: 30,
        title: { en: 'Morning workout', vi: 'Tập thể dục buổi sáng' },
        steps: [
            { id: 'pushups', label: { en: '50 push-ups', vi: 'Hít đất 50 cái' } },
            { id: 'squats', label: { en: '50 squats', vi: 'Squat 50 cái' } },
            { id: 'crunches', label: { en: '100 crunches', vi: 'Gập bụng 100 cái' } },
            { id: 'shadow', label: { en: '10 min shadow boxing', vi: 'Đấm gió boxing 10 phút' } },
            { id: 'footwork', label: { en: '5 min boxing with footwork', vi: 'Vừa đấm gió vừa di chuyển 5 phút' } },
        ],
    },
    {
        id: 'english-1',
        category: 'english',
        mandatory: true,
        start: '06:40',
        minutes: 60,
        roadmap: true,
        title: { en: 'English 1 · Listening', vi: 'Tiếng Anh 1 · Listening' },
        details: { en: 'Do the listening test, check answers, read the transcript.', vi: 'Làm bài nghe, chấm đáp án, đọc transcript.' },
    },
    {
        id: 'english-2',
        category: 'english',
        mandatory: true,
        start: '12:00',
        minutes: 60,
        roadmap: true,
        title: { en: 'English 2 · Reading + vocabulary (lunch break)', vi: 'Tiếng Anh 2 · Reading + từ vựng (giờ nghỉ trưa)' },
        details: { en: 'One reading passage and 8–10 new words.', vi: 'Một bài đọc và 8–10 từ mới.' },
    },
    {
        id: 'english-3',
        category: 'english',
        mandatory: true,
        start: '18:30',
        minutes: 120,
        roadmap: true,
        title: { en: 'English 3 · Writing / Speaking + review', vi: 'Tiếng Anh 3 · Writing / Speaking + ôn lỗi' },
        details: { en: 'Two 55-minute blocks with a 10-minute break. Finish with the daily log.', vi: 'Hai khối 55 phút, nghỉ 10 phút ở giữa. Kết thúc bằng nhật ký học.' },
    },
    {
        id: 'guitar-extra',
        category: 'guitar',
        mandatory: false,
        start: '21:00',
        minutes: 30,
        title: { en: 'Guitar practice (pick guitar or piano)', vi: 'Luyện guitar (chọn guitar hoặc piano)' },
    },
    {
        id: 'piano-extra',
        category: 'piano',
        mandatory: false,
        start: '21:00',
        minutes: 30,
        title: { en: 'Piano practice (pick guitar or piano)', vi: 'Luyện piano (chọn guitar hoặc piano)' },
    },
    skincareNight('22:00'),
];

const MUSIC_DAY = [
    {
        id: 'light-workout',
        category: 'exercise',
        mandatory: true,
        start: '06:00',
        minutes: 30,
        title: { en: 'Light morning workout', vi: 'Thể dục nhẹ buổi sáng' },
        details: { en: 'Free choice: brisk walk, push-ups or any light session that makes you sweat.', vi: 'Tự do: đi bộ nhanh, hít đất hoặc bài nhẹ nhàng ra mồ hôi.' },
    },
    {
        id: 'english-am',
        category: 'english',
        mandatory: false,
        start: '06:40',
        minutes: 60,
        roadmap: true,
        title: { en: 'English · morning bonus', vi: 'Tiếng Anh · buổi sáng (thêm)' },
        details: { en: 'Listening practice from the roadmap.', vi: 'Luyện Listening theo lộ trình.' },
    },
    {
        id: 'english-lunch',
        category: 'english',
        mandatory: false,
        start: '12:00',
        minutes: 60,
        roadmap: true,
        title: { en: 'English · lunch nap swap', vi: 'Tiếng Anh · thay giờ ngủ trưa' },
        details: { en: 'Use the 1-hour nap time for reading or vocabulary.', vi: 'Tranh thủ 1 tiếng ngủ trưa để đọc hoặc học từ vựng.' },
    },
    {
        id: 'piano-1',
        category: 'piano',
        mandatory: true,
        start: '18:00',
        minutes: 60,
        title: { en: 'Piano · block 1', vi: 'Piano · khối 1' },
    },
    {
        id: 'guitar-class',
        category: 'guitar',
        mandatory: true,
        start: '19:00',
        minutes: 60,
        title: { en: 'Guitar class', vi: 'Lớp học guitar' },
    },
    {
        id: 'guitar-practice',
        category: 'guitar',
        mandatory: true,
        start: '20:10',
        minutes: 60,
        title: { en: 'Guitar practice after class', vi: 'Luyện guitar thêm sau giờ học' },
        details: { en: 'Practise what the teacher just showed while it is fresh.', vi: 'Luyện ngay bài thầy vừa dạy khi còn nhớ.' },
    },
    {
        id: 'piano-2',
        category: 'piano',
        mandatory: true,
        start: '21:10',
        minutes: 60,
        title: { en: 'Piano · block 2', vi: 'Piano · khối 2' },
    },
    skincareNight('22:20'),
];

const SATURDAY = [
    {
        id: 'saturday-workout',
        category: 'exercise',
        mandatory: true,
        start: '06:30',
        minutes: 60,
        title: { en: 'Saturday training', vi: 'Buổi tập thứ 7' },
        variants: [
            { id: 'run', label: { en: 'Run 5 km', vi: 'Chạy bộ 5 km' } },
            { id: 'walk', label: { en: 'Walk 10,000 steps', vi: 'Đi bộ 10.000 bước' } },
            {
                id: 'strength',
                label: { en: 'Strength circuit', vi: 'Buổi tập thể lực' },
                details: {
                    en: 'Warm-up 5 min · 4 rounds: 15 push-ups, 20 squats, 12 lunges per leg, 20 mountain climbers, 10 burpees, 40 s plank · 90 s rest between rounds · 5 min stretching.',
                    vi: 'Khởi động 5 phút · 4 vòng: 15 hít đất, 20 squat, 12 lunge mỗi chân, 20 mountain climber, 10 burpee, plank 40 giây · nghỉ 90 giây giữa các vòng · giãn cơ 5 phút.',
                },
            },
        ],
    },
    {
        id: 'english-s1',
        category: 'english',
        mandatory: true,
        start: '08:00',
        minutes: 90,
        roadmap: true,
        title: { en: 'English 1 · Listening', vi: 'Tiếng Anh 1 · Listening' },
    },
    {
        id: 'english-s2',
        category: 'english',
        mandatory: true,
        start: '10:00',
        minutes: 90,
        roadmap: true,
        title: { en: 'English 2 · Reading + vocabulary', vi: 'Tiếng Anh 2 · Reading + từ vựng' },
    },
    {
        id: 'guitar-sat',
        category: 'guitar',
        mandatory: true,
        start: '13:30',
        minutes: 120,
        title: { en: 'Guitar · 2 hours', vi: 'Guitar · 2 tiếng' },
    },
    {
        id: 'english-s3',
        category: 'english',
        mandatory: true,
        start: '15:45',
        minutes: 90,
        roadmap: true,
        title: { en: 'English 3 · Writing', vi: 'Tiếng Anh 3 · Writing' },
    },
    {
        id: 'piano-sat',
        category: 'piano',
        mandatory: true,
        start: '17:30',
        minutes: 120,
        title: { en: 'Piano · 2 hours', vi: 'Piano · 2 tiếng' },
    },
    {
        id: 'english-s4',
        category: 'english',
        mandatory: true,
        start: '20:00',
        minutes: 90,
        roadmap: true,
        title: { en: 'English 4 · Speaking + review', vi: 'Tiếng Anh 4 · Speaking + ôn lỗi' },
    },
    skincareNight('22:00'),
];

const SUNDAY = [
    {
        id: 'sunday-workout',
        category: 'exercise',
        mandatory: true,
        start: '06:30',
        minutes: 30,
        title: { en: 'Gentle morning workout', vi: 'Thể dục nhẹ buổi sáng' },
        details: { en: 'Walk, stretch or light bodyweight moves before going home.', vi: 'Đi bộ, giãn cơ hoặc bài nhẹ trước khi về quê.' },
    },
    {
        id: 'english-sun',
        category: 'english',
        mandatory: true,
        start: '19:45',
        minutes: 120,
        roadmap: true,
        title: { en: 'English · evening 2 hours', vi: 'Tiếng Anh · 2 tiếng buổi tối' },
    },
    {
        id: 'piano-sun',
        category: 'piano',
        mandatory: true,
        start: '21:50',
        minutes: 120,
        title: { en: 'Piano · 2 hours', vi: 'Piano · 2 tiếng' },
    },
    skincareNight('23:50'),
];

export const WEEK_TEMPLATE = {
    0: SUNDAY,
    1: WORKDAY_FULL,
    2: MUSIC_DAY,
    3: WORKDAY_FULL,
    4: MUSIC_DAY,
    5: WORKDAY_FULL,
    6: SATURDAY,
};

export const WORK_HOURS = { start: '09:00', end: '17:30', days: [1, 2, 3, 4, 5] };

export function tasksForWeekday(weekday) {
    return WEEK_TEMPLATE[weekday] ?? [];
}
