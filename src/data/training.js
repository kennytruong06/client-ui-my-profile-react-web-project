export const TRAINING_FROM = '2026-11-28';
export const TRAINING_TO = '2026-12-06';

const MET = { rest: 2, prep: 2.8, stretch: 2.3, moderate: 3.8, vigorous: 8, walk: 4.3, slowWalk: 3, bike: 4 };

const text = (vi, en) => ({ vi, en });

const move = (name, fields) => ({ sets: 1, rest: 0, next: 0, pace: 3, met: MET.moderate, ...fields, name });
const prep = (name, minutes, cue) => move(name, { seconds: minutes * 60, met: MET.prep, prep: true, cue });
const stretch = (minutes) => move(text('Giãn cơ', 'Stretch'), { seconds: minutes * 60, met: MET.stretch, prep: true, cue: text('Ngực, vai, tay trước, tay sau, đùi, mỗi chỗ 30 giây', 'Chest, shoulders, biceps, triceps, thighs, 30 s each') });
const part = (moves, rounds = 1, restRound = 0) => ({ moves, rounds, restRound });
const option = (id, weather, label, parts) => ({ id, weather, label, parts });

const workSeconds = (item) => (item.seconds ?? item.reps * item.pace) * (item.perSide ? 2 : 1);

export function moveSeconds(entry) {
    return entry.sets * workSeconds(entry) + (entry.sets - 1) * entry.rest;
}

export function roundSeconds(moves) {
    return moves.reduce((sum, entry) => sum + moveSeconds(entry) + entry.next, 0);
}

/**
 * Totals one training option: main moves, sets, active and rest seconds, and the minimum net kcal for a body weight.
 */
export function optionStats(item, kg) {
    const totals = { moves: 0, sets: 0, active: 0, rest: 0, kcal: 0 };
    const perSecond = (met) => ((met - 1) * 3.5 * kg) / 200 / 60;
    item.parts.forEach(({ moves, rounds, restRound }) => {
        moves.forEach((entry) => {
            const active = rounds * entry.sets * workSeconds(entry);
            const rest = rounds * ((entry.sets - 1) * entry.rest + entry.next);
            if (!entry.prep) {
                totals.moves += 1;
                totals.sets += rounds * entry.sets;
            }
            totals.active += active;
            totals.rest += rest;
            totals.kcal += active * perSecond(entry.met) + rest * perSecond(MET.rest);
        });
        totals.rest += (rounds - 1) * restRound;
        totals.kcal += (rounds - 1) * restRound * perSecond(MET.rest);
    });
    return { ...totals, seconds: totals.active + totals.rest, kcal: Math.round(totals.kcal) };
}

const WARM_UP = prep(text('Khởi động', 'Warm-up'), 8, text(
    'Xoay cổ, vai, cổ tay 2 phút · 50 jumping jack · 2 hiệp × 10 chống đẩy vào tường · plank 30 giây',
    'Neck, shoulder and wrist circles 2 min · 50 jumping jacks · 2 sets × 10 wall push-ups · 30 s plank',
));

const PUSH_UP = move(text('Chống đẩy thường', 'Push-ups'), {
    sets: 4, reps: 10, rest: 90, next: 120,
    cue: text('Người thẳng từ vai tới gót, ngực xuống cách sàn 1 nắm tay. Còn sức thì làm quá 10 cái và ghi số thật.', 'Body straight from shoulders to heels, chest one fist from the floor. Go past 10 if you can and log the real count.'),
});
const PIKE = (sets) => move(text('Pike push-up (vai)', 'Pike push-ups (shoulders)'), {
    sets, reps: 6, pace: 3.5, rest: 90, next: 120,
    cue: text('Mông đẩy cao thành chữ V ngược, hạ đỉnh đầu xuống sát sàn trước mặt rồi đẩy lên.', 'Hips high in an upside-down V, lower the top of your head toward the floor in front of you, then press up.'),
});
const TABLE_ROW = (sets) => move(text('Kéo người dưới gầm bàn, tay ngửa (tay trước + lưng)', 'Under-table rows, palms up (biceps + back)'), {
    sets, reps: 8, pace: 4, rest: 90, next: 120,
    cue: text('Bàn phải thật chắc. Nằm dưới mép bàn, tay ngửa nắm mép, kéo ngực chạm mép bàn, hạ chậm 3 giây.', 'Use a very sturdy table. Lie under the edge, palms up, pull your chest to the edge and lower for 3 s.'),
});
const TOWEL_CURL = (sets, rest) => move(text('Kéo khăn tự kháng lực (tay trước)', 'Self-resisted towel curls (biceps)'), {
    sets, reps: 10, perSide: true, pace: 4, rest, next: 90,
    cue: text('Một chân giẫm giữa khăn tắm, tay kéo hai đầu khăn lên như cuốn tạ, chân ghì lại. Lên 1 giây, hạ chậm 3 giây.', 'Step on the middle of a bath towel and curl both ends up while the foot resists. 1 s up, 3 s down.'),
});
const KNEE_FINISHER = move(text('Kết bài: chống đẩy quỳ đến kiệt sức', 'Finisher: knee push-ups to failure'), {
    reps: 15, next: 60,
    cue: text('Mục tiêu 15 cái, làm tới khi không lên nổi nữa thì dừng.', 'Aim for 15 and stop when you cannot push up any more.'),
});
const TOWEL_HOLD = (sets) => move(text('Giữ tĩnh kéo khăn ở góc 90°', 'Towel curl hold at 90°'), {
    sets, seconds: 30, perSide: true, rest: 60, next: 90,
    cue: text('Kéo khăn tới khi khuỷu tay vuông góc rồi giữ, gồng hết sức trong 30 giây.', 'Curl until the elbow is at 90° and hold, squeezing as hard as you can for 30 s.'),
});

const STRENGTH = {
    chest: option('strength', null, text('Buổi nhấn ngực', 'Chest focus'), [part([
        WARM_UP,
        PUSH_UP,
        move(text('Chống đẩy tay rộng', 'Wide push-ups'), {
            sets: 4, reps: 8, rest: 90, next: 120,
            cue: text('Hai tay rộng hơn vai 1 gang. Không đủ 8 cái thì quỳ gối làm cho đủ.', 'Hands a hand-span wider than your shoulders. Drop to your knees to finish the 8 if needed.'),
        }),
        move(text('Chống đẩy chống tay mép giường, hạ chậm 3 giây', 'Incline push-ups on the bed edge, 3 s down'), {
            sets: 3, reps: 12, pace: 4, rest: 75, next: 120,
            cue: text('Hạ ngực chạm mép giường trong 3 giây, đẩy lên nhanh.', 'Lower your chest to the bed edge in 3 s, push up fast.'),
        }),
        PIKE(3),
        TABLE_ROW(4),
        TOWEL_CURL(3, 45),
        KNEE_FINISHER,
        stretch(5),
    ])]),
    shoulders: option('strength', null, text('Buổi nhấn vai', 'Shoulder focus'), [part([
        WARM_UP,
        PIKE(4),
        PUSH_UP,
        move(text('Plank chạm vai', 'Plank shoulder taps'), {
            sets: 3, reps: 10, perSide: true, pace: 1.5, rest: 60, next: 90,
            cue: text('Tư thế chống đẩy, chân dang rộng, tay chạm vai đối diện, hông không lắc.', 'Push-up position, feet wide, tap the opposite shoulder without rocking your hips.'),
        }),
        move(text('Nằm sấp nâng tay chữ Y, T, W (vai sau)', 'Prone Y, T, W raises (rear delts)'), {
            sets: 3, reps: 24, pace: 2.5, rest: 60, next: 90,
            cue: text('Nằm sấp, nâng tay lên theo chữ Y 8 cái, chữ T 8 cái, chữ W 8 cái, giữ 1 giây ở trên.', 'Lie face down and raise your arms in a Y 8 times, a T 8 times, a W 8 times, holding 1 s at the top.'),
        }),
        TABLE_ROW(4),
        TOWEL_HOLD(3),
        move(text('Kết bài: giang ngang tay xoay vòng nhỏ', 'Finisher: small arm circles'), {
            sets: 2, seconds: 60, rest: 30, next: 90,
            cue: text('Hai tay giang ngang vai, xoay vòng nhỏ 30 giây chiều tới, 30 giây chiều lui, không hạ tay.', 'Arms out at shoulder height, small circles 30 s forward and 30 s back without dropping your arms.'),
        }),
        stretch(5),
    ])]),
    arms: option('strength', null, text('Buổi nhấn tay trước', 'Biceps focus'), [part([
        WARM_UP,
        TABLE_ROW(5),
        TOWEL_CURL(4, 60),
        PUSH_UP,
        move(text('Chống đẩy kim cương (tay sau)', 'Diamond push-ups (triceps)'), {
            sets: 3, reps: 8, rest: 75, next: 120,
            cue: text('Hai ngón cái và ngón trỏ chạm nhau thành hình thoi dưới ngực. Không đủ 8 cái thì quỳ gối.', 'Thumbs and index fingers touch in a diamond under your chest. Drop to your knees if you cannot do 8.'),
        }),
        PIKE(3),
        TOWEL_HOLD(2),
        KNEE_FINISHER,
        stretch(5),
    ])]),
};

const HOME = option('home', 'rain', text('Cardio trong nhà', 'Indoor cardio'), [
    part([prep(text('Khởi động', 'Warm-up'), 5, text('Xoay khớp 2 phút · đi tại chỗ 2 phút · 30 jumping jack chậm', 'Joint circles 2 min · march in place 2 min · 30 slow jumping jacks'))]),
    part([
        move(text('Jumping jack', 'Jumping jacks'), { reps: 50, pace: 1, met: MET.vigorous, next: 30 }),
        move(text('Bước chân lên trước (lunge)', 'Forward lunges'), { reps: 10, perSide: true, pace: 2.5, next: 30 }),
        move(text('Bước sang ngang rồi nhảy', 'Side step and jump'), { reps: 12, pace: 4, next: 30 }),
        move(text('Squat', 'Squats'), { reps: 20, pace: 2.5, next: 30 }),
        move(text('Leo núi (mountain climber)', 'Mountain climbers'), { reps: 30, pace: 1, met: MET.vigorous, next: 30 }),
        move(text('Đá chân ra sau', 'Donkey kicks'), { reps: 15, perSide: true, pace: 1.5, next: 30 }),
        move(text('Gập bụng liên sườn', 'Oblique crunches'), { reps: 12, perSide: true, pace: 2, next: 30 }),
        move(text('Gập bụng thường', 'Crunches'), { reps: 20, pace: 2, next: 30 }),
        move(text('Chạy tại chỗ nâng cao gối', 'High knees in place'), { seconds: 40, met: MET.vigorous }),
    ], 4, 120),
    part([stretch(6)]),
]);

const brisk = (minutes, km) => move(text('Đi bộ nhanh 5,5 km/h', 'Brisk walk at 5.5 km/h'), {
    seconds: minutes * 60, met: MET.walk,
    cue: text(`Khoảng ${km.vi} km. Nói chuyện được nhưng không hát được. Mang áo mưa phòng mưa bất chợt.`, `About ${km.en} km. You can talk but not sing. Bring a raincoat in case of a shower.`),
});
const easyWalk = (name, cue) => move(name, { seconds: 300, met: MET.slowWalk, prep: true, cue });
const WALK_IN = easyWalk(text('Đi chậm khởi động', 'Easy walk to warm up'), text('Đi thong thả 5 phút, xoay vai và cổ chân', 'Stroll for 5 min, roll your shoulders and ankles'));
const WALK_OUT = easyWalk(text('Đi chậm thả lỏng', 'Easy walk to cool down'), text('Đi chậm 5 phút cho nhịp tim hạ, về nhà giãn cơ đùi và bắp chân', 'Walk slowly for 5 min to bring your heart rate down, then stretch thighs and calves at home'));

const WALK = option('walk', 'dry', text('Đi bộ ngoài trời', 'Outdoor walk'), [part([WALK_IN, brisk(50, text('4,6', '4.6')), WALK_OUT])]);
const WALK_LONG = option('walk', 'dry', text('Đi bộ ngoài trời', 'Outdoor walk'), [part([WALK_IN, brisk(80, text('7,3', '7.3')), WALK_OUT])]);

const BIKE = option('bike', 'dry', text('Đạp xe', 'Cycling'), [part([
    move(text('Đạp xe khoảng 15 km/h', 'Ride at about 15 km/h'), {
        sets: 2, seconds: 55 * 60, rest: 600, met: MET.bike,
        cue: text('Mỗi chặng 55 phút ≈ 14 km, giữa 2 chặng dừng 10 phút uống nước. Mưa to hoặc có sấm sét thì không đạp, chuyển sang cardio trong nhà.', 'Each leg 55 min ≈ 14 km, with a 10 min water stop between. Skip the ride in heavy rain or thunder and do indoor cardio instead.'),
    }),
])]);

const strength = (focus) => ({
    id: 'strength',
    category: 'exercise',
    mandatory: true,
    start: '05:00',
    minutes: 60,
    title: text('Tập cơ: ngực · tay trước · vai', 'Strength: chest · biceps · shoulders'),
    details: text(
        'Không cần dụng cụ, chỉ cần khăn tắm và một cái bàn chắc. Ghi số cái thật từng hiệp, buổi sau cố thêm 1–2 cái mỗi hiệp.',
        'No equipment, just a bath towel and a sturdy table. Log the real reps of every set and add 1–2 reps per set next time.',
    ),
    options: [STRENGTH[focus]],
});

const cardio = (start, minutes, outdoor) => ({
    id: 'cardio',
    category: 'exercise',
    mandatory: true,
    start,
    minutes,
    title: text('Cardio đốt kcal', 'Fat-burning cardio'),
    options: [outdoor, HOME],
});

const ride = () => ({
    id: 'cardio',
    category: 'exercise',
    mandatory: true,
    start: '06:00',
    minutes: 120,
    title: text('Đạp xe buổi sáng', 'Morning ride'),
    options: [BIKE, HOME],
});

const EVENING_MUSIC = ['guitar-extra', 'piano-extra'];

export const TRAINING_DAYS = {
    '2026-11-28': { replaces: [], tasks: [ride()] },
    '2026-11-29': { replaces: [], tasks: [ride()] },
    '2026-11-30': { replaces: EVENING_MUSIC, tasks: [strength('chest'), cardio('21:00', 60, WALK)] },
    '2026-12-01': { replaces: [], tasks: [cardio('05:00', 60, WALK)] },
    '2026-12-02': { replaces: EVENING_MUSIC, tasks: [strength('shoulders'), cardio('21:00', 60, WALK)] },
    '2026-12-03': { replaces: [], tasks: [cardio('05:00', 60, WALK)] },
    '2026-12-04': { replaces: EVENING_MUSIC, tasks: [strength('arms'), cardio('21:00', 60, WALK)] },
    '2026-12-05': { replaces: [], tasks: [cardio('06:00', 90, WALK_LONG)] },
    '2026-12-06': { replaces: [], tasks: [cardio('06:00', 90, WALK_LONG)] },
};
