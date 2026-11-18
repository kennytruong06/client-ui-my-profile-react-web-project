import Emote from '@/components/focus/Emote';
import Held from '@/components/focus/Held';
import { mixColor } from '@/data/focusStory';

const UPPER = 19;
const FORE = 17;
const HIP_STAND = -44;
const SIT_DROP = 22;
const SHOULDER_Y = -78;
const HEAD = { x: 2, y: -101, r: 12.5 };

const POSES = {
    stand: { legs: 'stand', near: [6, 6], far: [-4, 4], body: 'bob' },
    walk: { legs: 'walk', near: [0, 6], far: [0, 6], armAnim: 'swing', body: 'step' },
    sit: { legs: 'sit', near: [28, 78], far: [22, 84], body: 'bob' },
    type: { legs: 'sit', near: [28, 78], far: [22, 84], forearm: 'type', body: 'bob', lean: 4 },
    write: { legs: 'sit', near: [32, 66], far: [18, 88], forearm: 'write', lean: 14, tilt: 8 },
    read: { legs: 'sit', near: [52, 66], far: [44, 72], lean: 8 },
    explain: { legs: 'sit', near: [64, 26], far: [22, 84], lean: 12, body: 'bob' },
    slump: { legs: 'sit', near: [20, 40], far: [14, 44], lean: 22, tilt: 12 },
    sleepDesk: { legs: 'sit', near: [66, 30], far: [60, 34], lean: 62, tilt: 4 },
    raise: { legs: 'sit', near: [120, 40], far: [22, 84], body: 'bob' },
    phone: { legs: 'sit', near: [50, 90], far: [20, 86], lean: 6, tilt: 10 },
    drink: { legs: 'sit', near: [70, 100], far: [22, 84], lean: 2 },
    point: { legs: 'stand', near: [118, 2], far: [-4, 4], body: 'bob' },
    pointDown: { legs: 'stand', near: [62, 22], far: [-4, 4], lean: 16, body: 'bob' },
    wave: { legs: 'stand', near: [115, 40], far: [-4, 4], forearm: 'wave', body: 'bob' },
    hips: { legs: 'stand', near: [-22, 104], far: [-14, 98], body: 'bob' },
    shout: { legs: 'stand', near: [-22, 104], far: [-14, 98], body: 'shake', lean: 6 },
    cross: { legs: 'stand', near: [10, 100], far: [6, 106], body: 'bob' },
    hold: { legs: 'stand', near: [48, 52], far: [42, 58], body: 'bob' },
    cheer: { legs: 'stand', near: [125, 40], far: [95, 70], body: 'bounce' },
    clap: { legs: 'stand', near: [48, 62], far: [44, 66], forearm: 'clap', body: 'bounce' },
    laugh: { legs: 'stand', near: [30, 70], far: [24, 76], body: 'bounce', lean: -4 },
    sip: { legs: 'stand', near: [70, 100], far: [-4, 4], body: 'bob' },
    calm: { legs: 'stand', near: [88, 4], far: [80, 8], forearm: 'wave', body: 'bob' },
    dismay: { legs: 'stand', near: [100, 50], far: [96, 52], body: 'shake', tilt: 6 },
};

const SIT_POSES = Object.keys(POSES).filter((key) => POSES[key].legs === 'sit');

export function isSeated(poseKey) {
    return SIT_POSES.includes(poseKey);
}

export function headTop(poseKey, scale = 1) {
    return (isSeated(poseKey) ? 96 : 120) * scale;
}

const shade = (color, ratio = 0.18) => mixColor(color, '#000000', ratio);

function Leg({ hipX, mode, color, shoe, phase }) {
    const hipY = mode === 'sit' ? HIP_STAND + SIT_DROP : HIP_STAND;
    const walking = mode === 'walk';
    return (
        <g transform={`translate(${hipX} ${hipY})`}>
            <g className={walking ? `anim p-leg-${phase}` : undefined}>
                {mode === 'sit' ? (
                    <g transform="rotate(-90)">
                        <rect x="-4.6" y="0" width="9.2" height="22" rx="4.4" fill={color} />
                        <g transform="translate(0 22) rotate(90)">
                            <rect x="-4.2" y="-2" width="8.4" height="24" rx="4" fill={color} />
                            <rect x="-4.6" y="16.5" width="14" height="6.5" rx="3" fill={shoe} />
                        </g>
                    </g>
                ) : (
                    <>
                        <rect x="-4.6" y="0" width="9.2" height="44" rx="4.4" fill={color} />
                        <rect x="-4.6" y="37.5" width="14" height="6.5" rx="3" fill={shoe} />
                    </>
                )}
            </g>
        </g>
    );
}

function Arm({ angles, sleeve, forearmColor, skin, anim, forearmAnim, hold, pivotX, mirror }) {
    const [upper, fore] = angles;
    return (
        <g transform={`translate(${pivotX} ${SHOULDER_Y}) rotate(${-upper})`}>
            <g className={anim ? `anim ${anim}` : undefined}>
                <rect x="-3.6" y="-2" width="7.2" height={UPPER + 3} rx="3.6" fill={sleeve} />
                <g transform={`translate(0 ${UPPER}) rotate(${-fore})`}>
                    <g className={forearmAnim ? `anim ${forearmAnim}` : undefined}>
                        <rect x="-3.2" y="-2" width="6.4" height={FORE + 2} rx="3.2" fill={forearmColor} />
                        <circle cy={FORE + 1} r="4.1" fill={skin} />
                        {hold && <g transform={`translate(0 ${FORE + 1})`}><Held kind={hold} angle={upper + fore} mirror={mirror} /></g>}
                    </g>
                </g>
            </g>
        </g>
    );
}

function HairBack({ style, color }) {
    if (style === 'none') {
        return null;
    }
    return (
        <g fill={color}>
            <circle cx="-2.6" cy="-2.2" r="13.4" />
            {style === 'long' && <path d="M-14 -2 C-19 12 -17 30 -7 36 L3 32 C1 22 2 12 3 4Z" />}
            {style === 'bob' && <path d="M-14.5 0 C-17 10 -14 18 -5 19 L3 13 L1 2Z" />}
            {style === 'bun' && <circle cx="-11" cy="-13" r="6.2" />}
            {style === 'pony' && <path d="M-13 -5 C-27 -3 -29 13 -22 25 C-20 14 -15 8 -10 5Z" />}
        </g>
    );
}

function HairFront({ style, color }) {
    if (style === 'none') {
        return null;
    }
    return <path d="M-12.6 1 C-14 -10 -5 -16 4 -15 C10 -14 13.2 -9 12.8 -5 C10 -8.5 5.5 -8 1.5 -6.5 C-3 -5 -8 -4.5 -12.6 1Z" fill={color} />;
}

function Eye({ mood }) {
    if (mood === 'sleep') {
        return <path d="M4.2 -1.2 Q6.6 1.4 9 -1.2" stroke="#1d1a22" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'laugh' || mood === 'love') {
        return <path d="M4.2 0 Q6.6 -3.6 9 0" stroke="#1d1a22" strokeWidth="1.6" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'surprised' || mood === 'shout') {
        return (
            <g>
                <circle cx="6.8" cy="-1.6" r="3.1" fill="#ffffff" />
                <circle cx="7.4" cy="-1.6" r="1.6" fill="#1d1a22" />
            </g>
        );
    }
    return <circle cx="6.8" cy="-1.6" r="1.9" fill="#1d1a22" />;
}

function Brow({ mood }) {
    const paths = {
        angry: 'M3 -8.2 L10 -4.8',
        shout: 'M3 -8.4 L10 -4.6',
        stress: 'M3 -4.8 L10 -8',
        sad: 'M3 -4.8 L10 -8',
        surprised: 'M3.5 -8.6 L9.5 -8.6',
    };
    return <path d={paths[mood] ?? 'M3.2 -6.4 L9.6 -6.6'} stroke="#2b2230" strokeWidth="1.5" strokeLinecap="round" fill="none" />;
}

function Mouth({ mood, talking }) {
    const open = '#7a2332';
    const shapes = {
        neutral: <path d="M7.2 7.6 H12" stroke="#7a3b3b" strokeWidth="1.5" strokeLinecap="round" fill="none" />,
        smile: <path d="M6.6 6 Q9.6 10.4 12.6 5.6" stroke="#7a3b3b" strokeWidth="1.5" strokeLinecap="round" fill="none" />,
        love: <path d="M6.6 6 Q9.6 10.4 12.6 5.6" stroke="#7a3b3b" strokeWidth="1.5" strokeLinecap="round" fill="none" />,
        laugh: <path d="M6 5.4 Q9.8 14 13.4 5 Z" fill={open} />,
        angry: <path d="M7 9.4 Q9.6 5.6 12.6 8.6" stroke="#7a3b3b" strokeWidth="1.6" strokeLinecap="round" fill="none" />,
        shout: <path d="M6.6 4.6 L13.4 4.4 L12.4 12.4 Q9.4 13.6 7 11.4Z" fill={open} />,
        stress: <path d="M6.6 8.4 Q8.4 6.2 10 8.4 T13 7.8" stroke="#7a3b3b" strokeWidth="1.4" strokeLinecap="round" fill="none" />,
        sad: <path d="M7 9.2 Q9.6 6 12.4 8.8" stroke="#7a3b3b" strokeWidth="1.5" strokeLinecap="round" fill="none" />,
        surprised: <ellipse cx="10" cy="8.2" rx="2.1" ry="2.9" fill={open} />,
        sleep: <path d="M7.4 8 Q9.6 9.2 11.8 8" stroke="#7a3b3b" strokeWidth="1.4" strokeLinecap="round" fill="none" />,
    };
    return <g className={talking ? 'anim p-talk' : undefined}>{shapes[mood] ?? shapes.neutral}</g>;
}

function Face({ mood, talking, skin }) {
    const blush = mood === 'love' || mood === 'smile';
    const flushed = mood === 'angry' || mood === 'shout';
    return (
        <g>
            {(blush || flushed) && <circle cx="8.2" cy="4.4" r="3.1" fill={flushed ? '#ff4d4d' : '#ff8aa0'} opacity={flushed ? 0.45 : 0.4} />}
            <path d="M12.2 -1 q3.8 3.2 0.4 5.4 z" fill={skin} />
            <Eye mood={mood} />
            <Brow mood={mood} />
            <Mouth mood={mood} talking={talking} />
        </g>
    );
}

function Accessories({ acc, bag, tie }) {
    return (
        <g>
            {acc.includes('shirtV') && <path d="M3 -86 L9 -68 L12 -86Z" fill="#f8fafc" />}
            {acc.includes('tie') && <path d="M8 -81 L13 -81 L12 -58 L10.4 -54 L8.8 -58Z" fill={tie} />}
            {acc.includes('badge') && (
                <g>
                    <path d="M3 -86 L8 -66" stroke="#2563eb" strokeWidth="1.6" />
                    <rect x="5" y="-66" width="8" height="10" rx="1.5" fill="#ffffff" stroke="#94a3b8" />
                </g>
            )}
            {acc.includes('apron') && (
                <g>
                    <path d="M-12 -64 L12 -64 L12 -34 L-12 -34Z" fill="#fff7ed" opacity="0.95" />
                    <path d="M-12 -80 L-4 -64 M12 -80 L4 -64" stroke="#fff7ed" strokeWidth="3" />
                </g>
            )}
            {acc.includes('backpack') && <rect x="-1.6" y="-86" width="4.4" height="34" fill={shade(bag, 0.15)} />}
        </g>
    );
}

export default function Person({
    x,
    y = 0,
    scale = 1,
    flip = false,
    pose = 'stand',
    mood = 'neutral',
    emote,
    hold,
    talking = false,
    skin = '#efc29a',
    hair = '#2b2230',
    hairStyle = 'short',
    top = '#ffffff',
    bottom = '#334155',
    shoe = '#272733',
    acc = [],
    skirt = false,
    sleeves = 'short',
    build = 1,
    tie = '#c0392b',
    bag = '#e07a5f',
    body,
}) {
    const spec = POSES[pose] ?? POSES.stand;
    const seated = spec.legs === 'sit';
    const drop = seated ? SIT_DROP : 0;
    const lean = spec.lean ?? 0;
    const skinDark = shade(skin, 0.1);
    const bodyAnim = body ?? spec.body;
    const forearmNear = spec.forearm && (spec.forearm === 'type' ? 'p-type-a' : `p-${spec.forearm}`);
    const forearmFar = spec.forearm === 'type' ? 'p-type-b' : undefined;
    const sleeveFar = shade(top, 0.14);
    const foreNearColor = sleeves === 'long' ? top : skin;
    const foreFarColor = sleeves === 'long' ? sleeveFar : skinDark;
    const direction = flip ? -1 : 1;
    const halfWidth = 12 * build;

    return (
        <g transform={`translate(${x} ${y})`}>
            <g transform={`scale(${direction * scale} ${scale})`}>
                <ellipse cx="2" cy="2" rx="30" ry="4.5" fill="#000000" opacity="0.16" />
                <g className={bodyAnim ? `anim b-${bodyAnim}` : undefined}>
                    <Leg hipX={-2} mode={spec.legs} color={shade(bottom, 0.16)} shoe={shade(shoe, 0.1)} phase="b" />
                    <Leg hipX={1} mode={spec.legs} color={bottom} shoe={shoe} phase="a" />
                    <g transform={`translate(0 ${drop}) rotate(${lean} 0 ${HIP_STAND})`}>
                        {acc.includes('backpack') && (
                            <g>
                                <rect x="-23" y="-82" width="14" height="32" rx="5" fill={bag} />
                                <rect x="-21" y="-68" width="10" height="9" rx="2" fill={shade(bag, 0.2)} />
                            </g>
                        )}
                        <g transform={`translate(${HEAD.x} ${HEAD.y}) rotate(${spec.tilt ?? 0} 0 12)`}>
                            <HairBack style={hairStyle} color={hair} />
                        </g>
                        <Arm
                            angles={spec.far}
                            sleeve={sleeveFar}
                            forearmColor={foreFarColor}
                            skin={skinDark}
                            anim={spec.armAnim === 'swing' ? 'p-arm-a' : undefined}
                            forearmAnim={forearmFar}
                            pivotX={-1}
                        />
                        <rect x="-2.6" y="-92" width="6.4" height="10" fill={skinDark} />
                        <rect x={-halfWidth} y="-86" width={halfWidth * 2} height="44" rx="9" fill={top} />
                        {skirt && <path d={`M${-halfWidth} -52 L${halfWidth} -52 L${halfWidth + 6} -26 L${-halfWidth - 6} -26Z`} fill={bottom} />}
                        <Accessories acc={acc} bag={bag} tie={tie} />
                        <Arm
                            angles={spec.near}
                            sleeve={top}
                            forearmColor={foreNearColor}
                            skin={skin}
                            anim={spec.armAnim === 'swing' ? 'p-arm-b' : undefined}
                            forearmAnim={forearmNear}
                            hold={hold}
                            mirror={flip}
                            pivotX={1}
                        />
                        <g transform={`translate(${HEAD.x} ${HEAD.y}) rotate(${spec.tilt ?? 0} 0 12)`}>
                            <circle r={HEAD.r} fill={skin} />
                            <ellipse cx="-2.5" cy="2" rx="2.6" ry="3.4" fill={skinDark} />
                            <Face mood={mood} talking={talking} skin={skin} />
                            <HairFront style={hairStyle} color={hair} />
                            {acc.includes('glasses') && (
                                <g fill="none" stroke="#2b2b33" strokeWidth="1.3">
                                    <circle cx="7" cy="-1.5" r="4.3" fill="rgba(255,255,255,0.3)" />
                                    <path d="M2.7 -2 L-9 -4" />
                                </g>
                            )}
                            {acc.includes('headphones') && (
                                <g>
                                    <path d="M-12.4 0 C-13 -19 12.6 -19 12 -4" stroke="#1f2937" strokeWidth="3" fill="none" />
                                    <rect x="-5.5" y="-2.5" width="7.5" height="9" rx="3" fill="#e5484d" />
                                </g>
                            )}
                        </g>
                    </g>
                </g>
            </g>
            {emote && (
                <Emote
                    kind={emote}
                    x={(flip ? -1 : 1) * 18 * scale}
                    y={-(headTop(pose, scale) + 22)}
                />
            )}
        </g>
    );
}
