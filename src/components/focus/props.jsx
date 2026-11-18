import Emote from '@/components/focus/Emote';
import { useSceneLight } from '@/components/focus/sceneContext';

const DESK_TOP = -44;
const BOOK_COLORS = ['#e76f51', '#2a9d8f', '#e9c46a', '#264653', '#8ab17d', '#b5838d', '#6d6875', '#f4a261', '#457b9d'];

function Glow({ x = 0, y = 0, r = 60, tone = 'cool', strength = 1 }) {
    const { night } = useSceneLight();
    return <circle cx={x} cy={y} r={r} fill={`url(#focus-glow-${tone})`} opacity={Math.min(night * strength, 1)} />;
}

function Window({ w = 84, h = 92, curtain, top = -152, skyline }) {
    const { night } = useSceneLight();
    const half = w / 2;
    return (
        <g>
            <rect x={-half - 4} y={top - 4} width={w + 8} height={h + 8} rx="3" fill="#f3f4f6" stroke="#cbd5e1" />
            <rect x={-half} y={top} width={w} height={h} fill="url(#focus-sky-win)" />
            {skyline && (
                <g>
                    {[[6, 16, 40], [24, 12, 56], [38, 20, 34], [60, 14, 50]].map(([bx, bw, bh]) => (
                        <g key={bx}>
                            <rect x={-half + bx} y={top + h - bh} width={bw} height={bh} fill="#55657f" />
                            <rect x={-half + bx + 3} y={top + h - bh + 6} width="3" height="3" fill="#ffd479" opacity={night} />
                            <rect x={-half + bx + 3} y={top + h - bh + 16} width="3" height="3" fill="#ffd479" opacity={night} />
                        </g>
                    ))}
                </g>
            )}
            {night > 0.3 && (
                <g opacity={night}>
                    <circle cx={half * 0.4} cy={top + h * 0.28} r="9" fill="#f4f1de" />
                    <circle cx={-half * 0.5} cy={top + h * 0.2} r="1.4" fill="#fff" />
                    <circle cx={-half * 0.1} cy={top + h * 0.45} r="1.2" fill="#fff" />
                    <circle cx={half * 0.7} cy={top + h * 0.6} r="1.2" fill="#fff" />
                </g>
            )}
            <path d={`M${-half} ${top + h} L${-half * 0.2} ${top + h * 0.7} L${half * 0.3} ${top + h * 0.85} L${half} ${top + h * 0.62} V${top + h}Z`} fill="#000" opacity="0.12" />
            <path d={`M0 ${top} V${top + h} M${-half} ${top + h / 2} H${half}`} stroke="#f3f4f6" strokeWidth="3.5" />
            <rect x={-half - 8} y={top + h + 4} width={w + 16} height="5" rx="2" fill="#e5e7eb" />
            {curtain && (
                <g fill={curtain}>
                    <path d={`M${-half - 6} ${top - 6} H${-half + 20} Q${-half + 12} ${top + h / 2} ${-half + 24} ${top + h + 4} H${-half - 6}Z`} />
                    <path d={`M${half + 6} ${top - 6} H${half - 20} Q${half - 12} ${top + h / 2} ${half - 24} ${top + h + 4} H${half + 6}Z`} />
                </g>
            )}
        </g>
    );
}

function Chair({ tone = '#58698a' }) {
    return (
        <g>
            <rect x="-17" y="-62" width="4.6" height="40" rx="2.2" fill={tone} />
            <rect x="-16" y="-25" width="32" height="4.4" rx="2.2" fill={tone} />
            <rect x="-12" y="-21" width="3.4" height="21" fill="#3f4b63" />
            <rect x="9" y="-21" width="3.4" height="21" fill="#3f4b63" />
        </g>
    );
}

function Bed({ sleeper }) {
    return (
        <g>
            <rect x="-80" y="-66" width="8" height="66" rx="3" fill="#6b4a2f" />
            <rect x="-76" y="-20" width="152" height="20" rx="3" fill="#8a5f3b" />
            <rect x="-72" y="-34" width="144" height="16" rx="6" fill="#eef2f8" />
            <rect x="-72" y="-46" width="36" height="14" rx="7" fill="#ffffff" />
            {sleeper && (
                <g>
                    <circle cx="-54" cy="-51" r="12.5" fill={sleeper.hair} />
                    <circle cx="-51" cy="-49" r="10.5" fill={sleeper.skin} />
                    <path d="M-47 -50 Q-45 -48 -43 -50" stroke="#1d1a22" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                    <path d="M-47 -44 Q-45 -43 -43 -44" stroke="#7a3b3b" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                    {sleeper.emote && <Emote kind={sleeper.emote} x={-30} y={-84} />}
                </g>
            )}
            <path d="M-46 -34 C-46 -49 -30 -48 -22 -42 L72 -40 V-17 H-46Z" fill="#6aa5e0" />
            <path d="M-20 -41 V-17 M10 -40 V-17" stroke="#5a94cf" strokeWidth="3" />
        </g>
    );
}

function Alarm() {
    return (
        <g className="anim ring">
            <circle cx="-6" cy="-21" r="3.6" fill="#b91c1c" />
            <circle cx="6" cy="-21" r="3.6" fill="#b91c1c" />
            <circle cy="-11" r="11" fill="#e5484d" />
            <circle cy="-11" r="8" fill="#ffffff" />
            <path d="M0 -11 V-17 M0 -11 L4 -9" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" />
        </g>
    );
}

function Plant() {
    return (
        <g>
            <path d="M-11 -26 H11 L8 0 H-8Z" fill="#c8643b" />
            <ellipse cx="-8" cy="-40" rx="6" ry="16" transform="rotate(-24 -8 -40)" fill="#3f8f5a" />
            <ellipse cx="8" cy="-42" rx="6" ry="17" transform="rotate(22 8 -42)" fill="#2f7a4a" />
            <ellipse cx="0" cy="-46" rx="6" ry="19" fill="#48a368" />
        </g>
    );
}

function Lamp() {
    return (
        <g>
            <rect x="-9" y="-3" width="18" height="3" rx="1.5" fill="#374151" />
            <path d="M0 -3 L-6 -22 L8 -36" stroke="#374151" strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <path d="M2 -40 L16 -34 L12 -28 L0 -34Z" fill="#fbbf24" />
        </g>
    );
}

function Monitor({ screen = '#16233b', badge, ok }) {
    return (
        <g>
            <rect x="-9" y="-3" width="18" height="3" rx="1.5" fill="#4b5563" />
            <rect x="-2.5" y="-12" width="5" height="10" fill="#6b7280" />
            <rect x="-25" y="-44" width="50" height="33" rx="3" fill="#1b2230" />
            <rect x="-22" y="-41" width="44" height="27" fill={screen} />
            {ok ? (
                <path d="M-8 -26 L-2 -19 L10 -33" stroke="#22c55e" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
                <g>
                    <rect x="-18" y="-37" width="22" height="2.6" rx="1" fill="#7dd3fc" />
                    <rect x="-14" y="-32" width="26" height="2.6" rx="1" fill="#a7f3d0" />
                    <rect x="-14" y="-27" width="16" height="2.6" rx="1" fill="#fde68a" />
                    <rect x="-18" y="-22" width="24" height="2.6" rx="1" fill="#7dd3fc" />
                </g>
            )}
            {badge && (
                <g>
                    <circle cx="21" cy="-44" r="8.5" fill="#e63946" />
                    <text x="21" y="-41" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">{badge}</text>
                </g>
            )}
        </g>
    );
}

function Laptop() {
    return (
        <g>
            <path d="M-17 0 H17 L15 -3 H-15Z" fill="#cbd5e1" />
            <path d="M-13 -3 L-6 -27 H17 L12 -3Z" fill="#1b2230" />
            <path d="M-10 -5 L-4.5 -24 H14 L10 -5Z" fill="#7dd3fc" opacity="0.85" />
        </g>
    );
}

function Books() {
    return (
        <g>
            <rect x="-13" y="-6" width="26" height="6" rx="1" fill="#e76f51" />
            <rect x="-11" y="-12" width="24" height="6" rx="1" fill="#2a9d8f" />
            <rect x="-14" y="-18" width="25" height="6" rx="1" fill="#e9c46a" />
        </g>
    );
}

function BookOpen() {
    return (
        <g>
            <path d="M-17 0 L0 -2 L17 0 L17 -5 L0 -7 L-17 -5Z" fill="#f6f1e3" stroke="#c9c2ad" />
            <path d="M0 -2 V-7" stroke="#c9c2ad" />
            <path d="M-13 -3.4 L-3 -4.4 M3 -4.4 L13 -3.4" stroke="#94a3b8" strokeWidth="0.8" />
        </g>
    );
}

function Papers() {
    return (
        <g>
            <rect x="-11" y="-3" width="22" height="3" fill="#ffffff" stroke="#cbd5e1" />
            <rect x="-9" y="-6" width="22" height="3" fill="#f8fafc" stroke="#cbd5e1" />
            <rect x="-12" y="-9" width="22" height="3" fill="#ffffff" stroke="#cbd5e1" />
        </g>
    );
}

function Crumpled() {
    return (
        <g fill="#e5e7eb" stroke="#9ca3af">
            <circle cx="0" cy="-5" r="5.5" />
            <circle cx="12" cy="-3.5" r="4" />
            <circle cx="-9" cy="-3" r="3.4" />
        </g>
    );
}

function Mug() {
    return (
        <g>
            <rect x="-6" y="-12" width="12" height="12" rx="2" fill="#ffffff" stroke="#d3dae6" />
            <path d="M6 -9 q5 0 5 4 q0 3 -5 3" stroke="#d3dae6" strokeWidth="2" fill="none" />
            <rect x="-5" y="-11" width="10" height="3" fill="#6b4226" />
        </g>
    );
}

function Duck() {
    return (
        <g>
            <ellipse cx="0" cy="-6" rx="9" ry="6" fill="#facc15" />
            <circle cx="6" cy="-14" r="5" fill="#facc15" />
            <path d="M10 -14 L15 -12.5 L10 -11Z" fill="#f97316" />
            <circle cx="7.2" cy="-15.4" r="1" fill="#1f2937" />
        </g>
    );
}

function Phone({ ring }) {
    return (
        <g className={ring ? 'anim ring' : undefined}>
            <rect x="-8" y="-3" width="16" height="3" rx="1.5" fill="#1f2937" />
            <rect x="-6" y="-3.6" width="12" height="1.6" rx="0.8" fill="#9bdcff" />
        </g>
    );
}

function FoodTray() {
    return (
        <g>
            <rect x="-15" y="-3" width="30" height="3" rx="1.5" fill="#94a3b8" />
            <path d="M-12 -3 q5 -10 11 0Z" fill="#ffffff" />
            <path d="M-12 -3 q5 -7 11 0Z" fill="#f4d58d" />
            <rect x="3" y="-8" width="10" height="5" rx="1.5" fill="#f59e0b" />
        </g>
    );
}

function PizzaBox() {
    return (
        <g>
            <rect x="-14" y="-5" width="28" height="5" rx="1" fill="#d9a066" />
            <rect x="-14" y="-8" width="28" height="3" fill="#e8b97c" />
        </g>
    );
}

function Blackboard({ formula = 'y = ax² + bx + c' }) {
    return (
        <g>
            <rect x="-68" y="-154" width="136" height="76" rx="3" fill="#2f5d50" stroke="#8b6a43" strokeWidth="4" />
            <text x="-54" y="-124" fontSize="13" fill="#e8f0e8" fontFamily="'Comic Sans MS', 'Segoe Print', cursive">{formula}</text>
            <path d="M-54 -108 H20 M-54 -98 H-8" stroke="#e8f0e8" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
            <path d="M30 -112 q10 -14 22 0 q10 14 20 -2" stroke="#fde68a" strokeWidth="1.8" fill="none" opacity="0.85" />
            <rect x="-60" y="-76" width="120" height="4" rx="1.5" fill="#8b6a43" />
            <rect x="-30" y="-80" width="10" height="3" fill="#f8fafc" />
        </g>
    );
}

function Screen() {
    const bars = [16, 24, 21, 34, 46];
    return (
        <g>
            <rect x="-68" y="-156" width="136" height="80" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
            <rect x="-56" y="-146" width="40" height="4" rx="2" fill="#94a3b8" />
            {bars.map((value, index) => (
                <rect key={value + index} x={-50 + index * 20} y={-86 - value} width="13" height={value} rx="2" fill={index === 4 ? '#22c55e' : '#60a5fa'} />
            ))}
            <path d="M-50 -100 L-30 -112 L-10 -108 L10 -120 L30 -132" stroke="#f97316" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
    );
}

function Clock({ time = [10, 10] }) {
    const [hours, minutes] = time;
    const hourAngle = (hours % 12) * 30 + minutes * 0.5;
    const minuteAngle = minutes * 6;
    return (
        <g>
            <circle cy="-150" r="13" fill="#ffffff" stroke="#374151" strokeWidth="2.5" />
            <path d="M0 -150 V-158" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" transform={`rotate(${hourAngle} 0 -150)`} />
            <path d="M0 -150 V-161" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${minuteAngle} 0 -150)`} />
            <g transform="translate(0 -150)">
                <path className="anim clock-hand" d="M0 0 V-11" stroke="#e5484d" strokeWidth="0.9" />
            </g>
        </g>
    );
}

function Door() {
    return (
        <g>
            <rect x="-28" y="-124" width="56" height="124" fill="#d4a373" stroke="#a97c50" strokeWidth="3" />
            <rect x="-20" y="-114" width="40" height="46" rx="2" fill="#c08a58" />
            <rect x="-20" y="-60" width="40" height="52" rx="2" fill="#c08a58" />
            <circle cx="19" cy="-56" r="2.8" fill="#f2c94c" />
        </g>
    );
}

function Poster({ color = '#f4a261' }) {
    return (
        <g>
            <rect x="-17" y="-142" width="34" height="46" fill="#ffffff" stroke="#cbd5e1" />
            <rect x="-13" y="-138" width="26" height="26" fill={color} />
            <circle cx="0" cy="-125" r="8" fill="#ffffff" opacity="0.6" />
            <rect x="-13" y="-106" width="20" height="3" fill="#94a3b8" />
            <rect x="-13" y="-101" width="14" height="3" fill="#cbd5e1" />
        </g>
    );
}

function Shelf({ w = 120, h = 132, rows = 3 }) {
    const rowHeight = h / rows;
    return (
        <g>
            <rect x={-w / 2} y={-h} width={w} height={h} fill="#8b5e3c" />
            {Array.from({ length: rows }, (_, row) => {
                const baseY = -h + (row + 1) * rowHeight - 4;
                const books = Math.floor((w - 12) / 9);
                return (
                    <g key={row}>
                        <rect x={-w / 2 + 4} y={baseY - rowHeight + 8} width={w - 8} height={rowHeight - 6} fill="#6d4627" />
                        {Array.from({ length: books }, (_, index) => {
                            const height = 20 + ((index * 7 + row * 5) % 14);
                            return <rect key={index} x={-w / 2 + 7 + index * 9} y={baseY - height} width="7.5" height={height} rx="1" fill={BOOK_COLORS[(index + row * 3) % BOOK_COLORS.length]} />;
                        })}
                        <rect x={-w / 2 + 4} y={baseY} width={w - 8} height="4" fill="#8b5e3c" />
                    </g>
                );
            })}
        </g>
    );
}

function CoffeeMachine() {
    return (
        <g>
            <rect x="-17" y="-52" width="34" height="52" rx="4" fill="#374151" />
            <rect x="-12" y="-46" width="24" height="14" rx="2" fill="#111827" />
            <circle cx="-6" cy="-39" r="2" fill="#22c55e" />
            <rect x="-9" y="-22" width="18" height="3" fill="#9ca3af" />
            <rect x="-5" y="-19" width="10" height="9" rx="1.5" fill="#ffffff" />
            <path d="M-3 -24 q2 -4 0 -7 M3 -24 q2 -4 0 -7" stroke="#cbd5e1" strokeWidth="1.3" fill="none" className="anim emote-float" />
        </g>
    );
}

function Fridge() {
    return (
        <g>
            <rect x="-22" y="-112" width="44" height="112" rx="4" fill="#e5e7eb" stroke="#cbd5e1" />
            <path d="M-22 -72 H22" stroke="#cbd5e1" strokeWidth="2" />
            <rect x="14" y="-100" width="3" height="18" rx="1.5" fill="#9ca3af" />
            <rect x="14" y="-66" width="3" height="24" rx="1.5" fill="#9ca3af" />
            <rect x="-14" y="-96" width="10" height="12" fill="#fde68a" />
        </g>
    );
}

function Counter({ w = 150 }) {
    return (
        <g>
            <rect x={-w / 2} y="-46" width={w} height="46" fill="#b08968" />
            <rect x={-w / 2 - 3} y="-50" width={w + 6} height="5" rx="2" fill="#e5e7eb" />
            <path d={`M${-w / 6} -46 V0 M${w / 6} -46 V0`} stroke="#8d6a4d" strokeWidth="2" />
        </g>
    );
}

const DESK_STYLES = {
    school: { top: '#c99a5b', panel: null, leg: '#8b6a43' },
    home: { top: '#d9b184', panel: '#f1f5f9', leg: '#a67c52' },
    office: { top: '#e2e8f0', panel: '#94a3b8', leg: '#64748b' },
    meeting: { top: '#6b4f3a', panel: '#5a4130', leg: '#4a3526' },
    cafe: { top: '#d6a96a', panel: null, leg: '#8b6a43' },
};

function Desk({ w = 72, tone = 'school', on = [] }) {
    const style = DESK_STYLES[tone] ?? DESK_STYLES.school;
    const half = w / 2;
    return (
        <g>
            <rect x={-half} y={DESK_TOP} width={w} height="5" rx="1.8" fill={style.top} />
            {style.panel ? (
                <rect x={-half + 3} y={DESK_TOP + 5} width={w - 6} height={-DESK_TOP - 5} fill={style.panel} />
            ) : (
                <g fill={style.leg}>
                    <rect x={-half + 5} y={DESK_TOP + 5} width="4" height={-DESK_TOP - 5} />
                    <rect x={half - 9} y={DESK_TOP + 5} width="4" height={-DESK_TOP - 5} />
                    <rect x={-half + 7} y="-20" width={w - 14} height="3" />
                </g>
            )}
            <g transform={`translate(0 ${DESK_TOP})`}>
                {on.map((item, index) => <PropNode key={`${item.kind}-${index}`} item={item} pass="draw" />)}
            </g>
        </g>
    );
}

export const PROPS = {
    bed: { draw: (p) => <Bed {...p} /> },
    nightstand: {
        draw: ({ on = [] }) => (
            <g>
                <rect x="-18" y="-36" width="36" height="36" rx="3" fill="#8a5f3b" />
                <rect x="-14" y="-24" width="28" height="3" fill="#6b4a2f" />
                <g transform="translate(0 -36)">
                    {on.map((item, index) => <PropNode key={index} item={item} pass="draw" />)}
                </g>
            </g>
        ),
    },
    alarm: { draw: () => <Alarm /> },
    plant: { draw: () => <Plant /> },
    window: { draw: (p) => <Window {...p} /> },
    door: { draw: () => <Door /> },
    desk: { draw: (p) => <Desk {...p} />, glow: ({ on = [] }) => on.map((item, index) => <PropNode key={index} item={{ ...item, y: (item.y ?? 0) + DESK_TOP }} pass="glow" />) },
    table: { draw: (p) => <Desk {...p} tone={p.tone ?? 'cafe'} />, glow: ({ on = [] }) => on.map((item, index) => <PropNode key={index} item={{ ...item, y: (item.y ?? 0) + DESK_TOP }} pass="glow" />) },
    chair: { draw: (p) => <Chair {...p} /> },
    blackboard: { draw: (p) => <Blackboard {...p} /> },
    screen: { draw: () => <Screen /> },
    clock: { draw: (p) => <Clock {...p} /> },
    poster: { draw: (p) => <Poster {...p} /> },
    shelf: { draw: (p) => <Shelf {...p} /> },
    lamp: { draw: () => <Lamp />, glow: () => <Glow x={10} y={-30} r={64} tone="warm" strength={0.55} /> },
    monitor: { draw: (p) => <Monitor {...p} />, glow: () => <Glow x={0} y={-26} r={58} tone="cool" strength={0.5} /> },
    laptop: { draw: () => <Laptop />, glow: () => <Glow x={2} y={-16} r={46} tone="cool" strength={0.5} /> },
    phone: { draw: (p) => <Phone {...p} />, glow: () => <Glow x={0} y={-4} r={28} tone="cool" strength={0.8} /> },
    books: { draw: () => <Books /> },
    bookopen: { draw: () => <BookOpen /> },
    papers: { draw: () => <Papers /> },
    crumpled: { draw: () => <Crumpled /> },
    mug: { draw: () => <Mug /> },
    duck: { draw: () => <Duck /> },
    foodTray: { draw: () => <FoodTray /> },
    pizzaBox: { draw: () => <PizzaBox /> },
    coffeeMachine: { draw: () => <CoffeeMachine /> },
    fridge: { draw: () => <Fridge /> },
    counter: { draw: (p) => <Counter {...p} /> },
};

export function PropNode({ item, pass }) {
    const entry = PROPS[item.kind];
    const { kind, x = 0, y = 0, s = 1, flip = false, ...rest } = item;
    const render = pass === 'glow' ? entry?.glow : entry?.draw;
    if (!render) {
        return null;
    }
    return <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} data-kind={kind}>{render(rest)}</g>;
}

