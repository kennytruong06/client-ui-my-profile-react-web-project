import { PropNode } from '@/components/focus/props';
import { useSceneLight } from '@/components/focus/sceneContext';
import { clamp01, mixColor } from '@/data/focusStory';

export const BASE = -22;
const BIG = 3000;
const TILE = 800;
const OFFSETS = [-TILE, 0, TILE, TILE * 2];
const FLOOR_LINES = [-8, 8, 28, 52, 80];

function Room({ wall, trim, floor, wainscot, children }) {
    return (
        <g>
            <rect x={-BIG} y={-BIG} width={BIG * 2} height={BIG + BASE} fill={wall} />
            {wainscot && <rect x={-BIG} y={BASE - wainscot.height} width={BIG * 2} height={wainscot.height} fill={wainscot.color} />}
            <rect x={-BIG} y={BASE - 7} width={BIG * 2} height="7" fill={trim} />
            <rect x={-BIG} y={BASE} width={BIG * 2} height={BIG} fill={floor} />
            <g stroke="#000000" strokeOpacity="0.1" strokeWidth="1.5">
                {FLOOR_LINES.map((lineY) => <path key={lineY} d={`M${-BIG} ${lineY} H${BIG}`} />)}
            </g>
            {children}
        </g>
    );
}

function Scenery({ id, duration, scroll }) {
    return (
        <g className={scroll ? 'scenery' : undefined} style={{ animationDuration: `${duration}s` }}>
            {OFFSETS.map((offset) => <use key={offset} href={`#${id}`} x={offset} />)}
        </g>
    );
}

function Stars({ top }) {
    const { night } = useSceneLight();
    const stars = [];
    let seed = 11;
    for (let index = 0; index < 46; index += 1) {
        seed = (seed * 16807) % 2147483647;
        const x = (seed / 2147483647) * 900 - 450;
        seed = (seed * 16807) % 2147483647;
        const y = top + 8 + (seed / 2147483647) * (BASE - 70 - top);
        stars.push({ x, y, big: index % 4 === 0 });
    }
    return (
        <g opacity={night}>
            {stars.map((star) => <circle key={`${star.x}${star.y}`} className={star.big ? 'star' : undefined} cx={star.x} cy={star.y} r={star.big ? 1.8 : 1.1} fill="#ffffff" />)}
            <g transform="translate(150 -212)">
                <circle r="18" fill="#f4f1de" />
                <circle cx="-6" cy="-4" r="3.4" fill="#dcd8c0" />
                <circle cx="7" cy="6" r="2.6" fill="#dcd8c0" />
            </g>
        </g>
    );
}

function Sun() {
    const { hour } = useSceneLight();
    if (hour < 5.3 || hour > 19.2) {
        return null;
    }
    const travel = clamp01((hour - 5.5) / 13.5);
    const lift = Math.sin(travel * Math.PI);
    return <circle cx={-280 + travel * 560} cy={BASE - lift * 230} r="26" fill={mixColor('#ff8c4a', '#fff4b0', lift)} />;
}

function OutdoorSky({ id }) {
    const { top } = useSceneLight();
    return (
        <g>
            <rect x={-BIG} y={-BIG} width={BIG * 2} height={BIG + BASE + 2} fill="url(#focus-sky)" />
            <Stars top={top} />
            <Sun />
            <g opacity="0.85">
                <Scenery id={`${id}-clouds`} duration={150} scroll />
            </g>
        </g>
    );
}

function Cloud({ x, y, scale }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#ffffff" opacity="0.9">
            <ellipse rx="34" ry="12" />
            <ellipse cx="-16" cy="-8" rx="18" ry="12" />
            <ellipse cx="12" cy="-12" rx="20" ry="14" />
        </g>
    );
}

function House({ x, w, h, body, roof }) {
    const { night } = useSceneLight();
    const lit = mixColor('#d6ecfb', '#ffd479', night);
    return (
        <g transform={`translate(${x} ${BASE})`}>
            <rect x="0" y={-h} width={w} height={h} fill={body} />
            <polygon points={`${-6},${-h} ${w / 2},${-h - 30} ${w + 6},${-h}`} fill={roof} />
            <rect x={w * 0.14} y={-h * 0.72} width="16" height="16" rx="2" fill={lit} />
            <rect x={w * 0.56} y={-h * 0.72} width="16" height="16" rx="2" fill={lit} />
            <rect x={w * 0.38} y={-30} width="16" height="30" rx="2" fill="#7a5a3a" />
        </g>
    );
}

function Shop({ x, w, h, body, awning }) {
    const { night } = useSceneLight();
    const lit = mixColor('#d6ecfb', '#ffd479', night);
    return (
        <g transform={`translate(${x} ${BASE})`}>
            <rect x="0" y={-h} width={w} height={h} fill={body} />
            <rect x="-4" y={-h - 6} width={w + 8} height="8" fill="#475569" />
            <rect x="6" y={-h * 0.62} width={w - 12} height={h * 0.62} fill={lit} />
            <path d={`M-2 ${-h * 0.62 - 2} H${w + 2} V${-h * 0.62 + 12} H-2Z`} fill={awning} />
            <rect x={w - 28} y="-34" width="16" height="34" fill="#475569" />
        </g>
    );
}

function Tree({ x, size = 1 }) {
    return (
        <g transform={`translate(${x} ${BASE}) scale(${size})`}>
            <rect x="-4" y="-34" width="8" height="34" fill="#6b4a2f" />
            <circle cy="-56" r="26" fill="#3f8f5a" />
            <circle cx="-16" cy="-44" r="16" fill="#357a4d" />
            <circle cx="17" cy="-46" r="17" fill="#48a368" />
        </g>
    );
}

function StreetLamp({ x }) {
    const { night } = useSceneLight();
    return (
        <g transform={`translate(${x} ${BASE + 12})`}>
            <rect x="-2.5" y="-104" width="5" height="104" fill="#374151" />
            <path d="M0 -104 H20" stroke="#374151" strokeWidth="4" />
            <rect x="12" y="-108" width="16" height="7" rx="3" fill={mixColor('#9ca3af', '#ffe58a', night)} />
            <circle cx="20" cy="-100" r="46" fill="url(#focus-glow-warm)" opacity={night} />
        </g>
    );
}

function StreetBackdrop({ scroll }) {
    const id = scroll ? 'street' : 'stop';
    return (
        <g>
            <defs>
                <g id={`${id}-clouds`}>
                    <Cloud x={-40} y={-250} scale={1} />
                    <Cloud x={300} y={-300} scale={0.8} />
                    <Cloud x={560} y={-230} scale={1.2} />
                </g>
                <g id={`${id}-far`}>
                    {[[0, 60, 96], [70, 50, 64], [130, 70, 124], [210, 40, 74], [260, 60, 104], [330, 50, 84], [390, 80, 144], [480, 50, 74], [540, 60, 114], [610, 40, 64], [660, 70, 98], [740, 60, 84]].map(([bx, bw, bh]) => (
                        <rect key={bx} x={bx} y={BASE - bh} width={bw} height={bh + 2} fill="#8ea4c4" opacity="0.8" />
                    ))}
                </g>
                <g id={`${id}-mid`}>
                    <House x={30} w={104} h={66} body="#ecc9a0" roof="#c0583f" />
                    <Tree x={170} size={1.05} />
                    <Shop x={214} w={130} h={94} body="#8fb7d6" awning="#e76f51" />
                    <Tree x={388} size={0.9} />
                    <House x={428} w={112} h={76} body="#f1d9b5" roof="#5a7bb5" />
                    <Shop x={588} w={104} h={102} body="#d9a3b8" awning="#2a9d8f" />
                    <Tree x={736} size={1} />
                </g>
                <g id={`${id}-near`}>
                    <rect x="0" y={BASE - 12} width={TILE} height="14" fill="#6aa163" />
                    {[10, 90, 170, 250, 330, 410, 490, 570, 650, 730].map((hx) => <circle key={hx} cx={hx} cy={BASE - 12} r="9" fill="#78b36f" />)}
                    <StreetLamp x={150} />
                    <StreetLamp x={560} />
                </g>
            </defs>
            <OutdoorSky id={id} />
            <Scenery id={`${id}-far`} duration={160} scroll={scroll} />
            <Scenery id={`${id}-mid`} duration={52} scroll={scroll} />
            <rect x={-BIG} y={BASE - 14} width={BIG * 2} height="40" fill="#c9cdd6" />
            <rect x={-BIG} y={BASE + 24} width={BIG * 2} height="5" fill="#9aa1ad" />
            <rect x={-BIG} y={BASE + 29} width={BIG * 2} height={BIG} fill="#4b5563" />
            <Scenery id={`${id}-near`} duration={13} scroll={scroll} />
            {!scroll && <BusStop />}
        </g>
    );
}

function Bus() {
    return (
        <g className="anim bus-cycle">
            <g transform={`translate(0 ${BASE - 2})`}>
                <rect x="-80" y="-56" width="160" height="48" rx="9" fill="#2f6fd6" />
                <rect x="-80" y="-30" width="160" height="6" fill="#ffffff" opacity="0.85" />
                {[-66, -42, -18, 6, 30].map((wx) => <rect key={wx} x={wx} y="-50" width="20" height="16" rx="3" fill="#cfe8ff" />)}
                <rect x="54" y="-50" width="20" height="38" rx="3" fill="#b6d6f5" />
                <circle cx="-48" cy="-6" r="9" fill="#1f2937" />
                <circle cx="48" cy="-6" r="9" fill="#1f2937" />
                <circle cx="-48" cy="-6" r="4" fill="#9ca3af" />
                <circle cx="48" cy="-6" r="4" fill="#9ca3af" />
            </g>
        </g>
    );
}

function BusStop() {
    return (
        <g>
            <Bus />
            <g transform={`translate(150 ${BASE + 14})`}>
                <rect x="-2.5" y="-110" width="5" height="110" fill="#4b5563" />
                <circle cy="-116" r="14" fill="#2f6fd6" />
                <text y="-112" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">BUS</text>
            </g>
        </g>
    );
}

function Bedroom() {
    return (
        <Room wall="#cfe0f5" trim="#a9c4e6" floor="#c49a6c">
            <ellipse cx="10" cy="22" rx="150" ry="13" fill="#e9a1a1" opacity="0.55" />
            <PropNode item={{ kind: 'window', x: -118, curtain: '#f4a6b8' }} pass="draw" />
            <PropNode item={{ kind: 'poster', x: 50, color: '#8ecae6' }} pass="draw" />
            <PropNode item={{ kind: 'poster', x: 96, color: '#f4a261' }} pass="draw" />
        </Room>
    );
}

function Classroom() {
    return (
        <Room wall="#e6eed9" trim="#7c9a74" floor="#cba978" wainscot={{ height: 52, color: '#9dbb92' }}>
            <PropNode item={{ kind: 'window', x: -150, w: 74, curtain: '#9fb6d9' }} pass="draw" />
            <PropNode item={{ kind: 'poster', x: 192, color: '#a3d9a5' }} pass="draw" />
        </Room>
    );
}

function Library() {
    return (
        <Room wall="#e9d8b8" trim="#a07850" floor="#8c6a4c">
            {[-396, -264, -132, 0, 132, 264, 396].map((shelfX) => <PropNode key={shelfX} item={{ kind: 'shelf', x: shelfX, y: BASE, w: 126, h: 150, rows: 4 }} pass="draw" />)}
        </Room>
    );
}

function Canteen() {
    return (
        <Room wall="#fbe6c8" trim="#d9a066" floor="#efe3cf">
            <defs>
                <pattern id="canteen-checker" width="40" height="30" patternUnits="userSpaceOnUse">
                    <rect width="40" height="30" fill="#efe3cf" />
                    <rect width="20" height="15" fill="#e0cfb2" />
                    <rect x="20" y="15" width="20" height="15" fill="#e0cfb2" />
                </pattern>
            </defs>
            <rect x={-BIG} y={BASE} width={BIG * 2} height={BIG} fill="url(#canteen-checker)" />
            <PropNode item={{ kind: 'counter', x: -140, w: 150 }} pass="draw" />
            <PropNode item={{ kind: 'window', x: 135, w: 76, curtain: '#f4a6b8' }} pass="draw" />
            <g fill="#f59e0b">
                {[-70, 0, 70].map((lampX) => (
                    <g key={lampX}>
                        <path d={`M${lampX} -400 V-176`} stroke="#6b7280" strokeWidth="1.5" />
                        <path d={`M${lampX - 14} -158 Q${lampX} -184 ${lampX + 14} -158Z`} />
                    </g>
                ))}
            </g>
        </Room>
    );
}

function Office() {
    return (
        <Room wall="#e6ecf3" trim="#cdd5e1" floor="#6f7c8f">
            {[-140, -34, 72].map((windowX) => <PropNode key={windowX} item={{ kind: 'window', x: windowX, w: 86, h: 96, skyline: true }} pass="draw" />)}
            <PropNode item={{ kind: 'clock', x: 160, time: [9, 20] }} pass="draw" />
            <PropNode item={{ kind: 'plant', x: 184 }} pass="draw" />
        </Room>
    );
}

function Meeting() {
    return (
        <Room wall="#dde3ec" trim="#b7c1d1" floor="#5f6b7a">
            <PropNode item={{ kind: 'window', x: -150, w: 70, h: 96, skyline: true }} pass="draw" />
            <PropNode item={{ kind: 'plant', x: 186 }} pass="draw" />
        </Room>
    );
}

function Pantry() {
    return (
        <Room wall="#f6e7cc" trim="#d6b98c" floor="#cdb48c">
            <rect x={-BIG} y={BASE - 100} width={BIG * 2} height="78" fill="#fffaf0" />
            <g stroke="#e5d9c0" strokeWidth="1.4">
                {Array.from({ length: 60 }, (_, index) => <path key={index} d={`M${-600 + index * 20} ${BASE - 100} V${BASE}`} />)}
                <path d={`M${-BIG} ${BASE - 60} H${BIG}`} />
            </g>
            <rect x="-190" y="-172" width="150" height="46" rx="3" fill="#b08968" />
            <path d="M-115 -172 V-126" stroke="#8d6a4d" strokeWidth="2" />
            <PropNode item={{ kind: 'counter', x: -115, y: BASE + 20, w: 150 }} pass="draw" />
            <PropNode item={{ kind: 'coffeeMachine', x: -150, y: BASE + 20 - 50 }} pass="draw" />
            <PropNode item={{ kind: 'fridge', x: 170, y: BASE + 4 }} pass="draw" />
            <PropNode item={{ kind: 'window', x: 52, w: 72, h: 70, top: -150 }} pass="draw" />
        </Room>
    );
}

export const BACKDROPS = {
    bedroom: { View: Bedroom, outdoor: false },
    classroom: { View: Classroom, outdoor: false },
    library: { View: Library, outdoor: false },
    canteen: { View: Canteen, outdoor: false },
    office: { View: Office, outdoor: false },
    meeting: { View: Meeting, outdoor: false },
    pantry: { View: Pantry, outdoor: false },
    street: { View: () => <StreetBackdrop scroll />, outdoor: true },
    stop: { View: () => <StreetBackdrop scroll={false} />, outdoor: true },
};
