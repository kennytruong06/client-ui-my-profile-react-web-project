import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LuMessageCircle } from 'react-icons/lu';
import { BACKDROPS } from '@/components/focus/backdrops';
import Person, { headTop, isSeated } from '@/components/focus/Person';
import { PropNode } from '@/components/focus/props';
import { SceneContext } from '@/components/focus/sceneContext';
import { hourAt, nightAt, sceneIndexAt, secondsIntoScene, skyAtHour, warmAt } from '@/data/focusStory';
import { useI18n } from '@/i18n/I18nProvider';

const BASE_HEIGHT = 400;
const MIN_VIEW_WIDTH = 420;
const MAX_VIEW_WIDTH = 1500;
const GROUND_BASE = 352;
const CONTROLS_CLEARANCE_PX = 156;
const LINE_SECONDS = 8;
const LINE_VISIBLE_SECONDS = 6.4;
const BUBBLE_MAX_WIDTH = 280;
const BIG = 3000;
const FRONT_KINDS = new Set(['desk', 'table', 'crumpled']);

function viewOf(aspect) {
    const width = Math.min(Math.max(BASE_HEIGHT * aspect, MIN_VIEW_WIDTH), MAX_VIEW_WIDTH);
    return { width, height: width / aspect };
}

function layerOf(item) {
    return item.layer ?? (FRONT_KINDS.has(item.kind) ? 'front' : 'back');
}

function castFor(scene, story, line) {
    return scene.cast.map((entry) => {
        const speaking = line && line.who === entry.id;
        const base = story.roster[entry.id] ?? {};
        return {
            ...base,
            ...entry,
            talking: Boolean(speaking && !line.msg),
            mood: speaking && line.mood ? line.mood : entry.mood,
            emote: speaking && line.emote ? line.emote : entry.emote,
        };
    });
}

function bubbleAnchor(line, scene, cast) {
    if (line.at) {
        return { x: line.at[0], y: line.at[1] };
    }
    const person = cast.find((entry) => entry.id === line.who);
    if (!person) {
        return null;
    }
    const lift = headTop(person.pose, person.scale ?? 1) + (person.emote ? 48 : 30);
    return { x: person.x + (person.flip ? -2 : 2), y: (person.y ?? 0) - lift };
}

function SpeechBubble({ line, anchor, story, geometry, viewportWidth, bubbleKey }) {
    const { tx } = useI18n();
    const name = line.name ?? story.roster[line.who]?.name;
    const maxWidth = Math.min(BUBBLE_MAX_WIDTH, viewportWidth - 24);
    const half = maxWidth / 2;
    const rawLeft = (geometry.cx + anchor.x) * geometry.pxPerUnit;
    const left = Math.min(Math.max(rawLeft, half + 12), viewportWidth - half - 12);
    const top = (geometry.floorY + anchor.y) * geometry.pxPerUnit;
    const tailShift = Math.min(Math.max(rawLeft - left, 18 - half), half - 18);

    return (
        <div className="pointer-events-none absolute z-10" style={{ left, top, transform: 'translate(-50%, -100%)' }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={bubbleKey}
                    initial={{ opacity: 0, y: 8, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22 }}
                    style={{ width: 'max-content', maxWidth }}
                    className={`relative rounded-2xl px-3.5 py-2 text-left text-sm font-medium leading-snug shadow-xl shadow-black/30 ${line.msg ? 'border border-sky-300 bg-sky-50 text-slate-800' : 'bg-white text-slate-800'}`}
                >
                    {name && (
                        <span className="mr-1.5 inline-flex items-center gap-1 font-display text-xs font-bold uppercase tracking-wide text-brand-700">
                            {line.msg && <LuMessageCircle size={12} />}
                            {tx(name)}
                        </span>
                    )}
                    {tx(line.text)}
                    <span
                        className={`absolute -bottom-1.5 h-3 w-3 -translate-x-1/2 rotate-45 ${line.msg ? 'border-b border-r border-sky-300 bg-sky-50' : 'bg-white'}`}
                        style={{ left: `calc(50% + ${tailShift}px)` }}
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function Foreground({ scene, story, line }) {
    const cast = castFor(scene, story, line);
    const backProps = scene.props.filter((item) => layerOf(item) === 'back');
    const frontProps = scene.props.filter((item) => layerOf(item) === 'front');
    return (
        <g>
            {backProps.map((item, index) => <PropNode key={`b${index}`} item={item} pass="draw" />)}
            {cast.filter((entry) => isSeated(entry.pose)).map((entry) => (
                <PropNode key={`chair-${entry.id}`} item={{ kind: 'chair', x: entry.x, y: entry.y ?? 0, flip: entry.flip, s: entry.scale ?? 1 }} pass="draw" />
            ))}
            {cast.map((entry) => <Person key={entry.id} {...entry} />)}
            {frontProps.map((item, index) => <PropNode key={`f${index}`} item={item} pass="draw" />)}
        </g>
    );
}

export default function FocusScene({ story, progress, running, viewport, totalSeconds }) {
    const scenes = story.scenes;
    const index = sceneIndexAt(scenes.length, progress);
    const scene = scenes[index];
    const hour = hourAt(scenes, progress);
    const night = nightAt(hour);
    const warm = warmAt(hour);
    const sky = skyAtHour(hour);
    const backdrop = BACKDROPS[scene.setting];

    const aspect = viewport.width / viewport.height;
    const { width, height } = viewOf(aspect);
    const pxPerUnit = viewport.height / height;
    const lift = Math.max(0, CONTROLS_CLEARANCE_PX / pxPerUnit - (BASE_HEIGHT - GROUND_BASE));
    const floorY = height - (BASE_HEIGHT - GROUND_BASE) - lift;
    const cx = width / 2;

    const seconds = secondsIntoScene(scenes.length, progress, totalSeconds);
    const lineIndex = Math.floor(seconds / LINE_SECONDS) % scene.lines.length;
    const line = seconds % LINE_SECONDS < LINE_VISIBLE_SECONDS ? scene.lines[lineIndex] : null;
    const castNow = useMemo(() => scene.cast.map((entry) => ({ ...(story.roster[entry.id] ?? {}), ...entry })), [scene, story]);
    const anchor = line ? bubbleAnchor(line, scene, castNow) : null;
    const light = useMemo(() => ({ hour, night, warm, top: -floorY }), [hour, night, warm, floorY]);
    const nightTint = night * (backdrop.outdoor ? 0.32 : 0.46);
    const warmTint = warm * (backdrop.outdoor ? 0.1 : 0.16);

    return (
        <>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid slice"
                className={`absolute inset-0 h-full w-full ${running ? '' : 'scene-paused'}`}
                aria-hidden="true"
            >
                <defs>
                    <linearGradient id="focus-sky" gradientUnits="userSpaceOnUse" x1="0" y1={-floorY} x2="0" y2="-22">
                        <stop offset="0" stopColor={sky.top} />
                        <stop offset="1" stopColor={sky.bottom} />
                    </linearGradient>
                    <linearGradient id="focus-sky-win" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor={sky.top} />
                        <stop offset="1" stopColor={sky.bottom} />
                    </linearGradient>
                    <radialGradient id="focus-glow-warm">
                        <stop offset="0" stopColor="#ffd98a" stopOpacity="0.6" />
                        <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="focus-glow-cool">
                        <stop offset="0" stopColor="#9bdcff" stopOpacity="0.55" />
                        <stop offset="1" stopColor="#9bdcff" stopOpacity="0" />
                    </radialGradient>
                </defs>

                <SceneContext.Provider value={light}>
                    <g transform={`translate(${cx} ${floorY})`}>
                        <AnimatePresence initial={false}>
                            <motion.g
                                key={scene.setting}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { duration: 0.6 } }}
                                exit={{ opacity: 0, transition: { duration: 0, delay: 0.6 } }}
                            >
                                <backdrop.View />
                            </motion.g>
                        </AnimatePresence>

                        <AnimatePresence initial={false}>
                            <motion.g
                                key={scene.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { duration: 0.45, delay: 0.25 } }}
                                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                            >
                                <Foreground scene={scene} story={story} line={line} />
                            </motion.g>
                        </AnimatePresence>

                        <rect x={-BIG} y={-BIG} width={BIG * 2} height={BIG * 2} fill="#070b24" opacity={nightTint} />
                        <rect x={-BIG} y={-BIG} width={BIG * 2} height={BIG * 2} fill="#ff8a3d" opacity={warmTint} />

                        <AnimatePresence initial={false}>
                            <motion.g
                                key={`glow-${scene.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { duration: 0.45, delay: 0.25 } }}
                                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                            >
                                {scene.props.map((item, itemIndex) => <PropNode key={itemIndex} item={item} pass="glow" />)}
                            </motion.g>
                        </AnimatePresence>
                    </g>
                </SceneContext.Provider>
            </svg>

            {line && anchor && (
                <SpeechBubble
                    line={line}
                    anchor={anchor}
                    story={story}
                    geometry={{ cx, floorY, pxPerUnit }}
                    viewportWidth={viewport.width}
                    bubbleKey={`${scene.id}-${lineIndex}`}
                />
            )}
        </>
    );
}
