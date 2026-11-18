const SYMBOLS = {
    heart: <path d="M0 7 C-13 -3 -7 -13 0 -6 C7 -13 13 -3 0 7Z" fill="#ff4d6d" />,
    anger: <path d="M-6 -3 q4 -2 4 -6 M6 -3 q-4 -2 -4 -6 M-6 4 q4 2 4 6 M6 4 q-4 2 -4 6" stroke="#e63946" strokeWidth="2.4" fill="none" strokeLinecap="round" />,
    sweat: <path d="M0 -9 C7 0 7 7 0 7 C-7 7 -7 0 0 -9Z" fill="#4cb4ff" />,
    question: <text y="6" textAnchor="middle" fontSize="19" fontWeight="800" fill="#3b82f6">?</text>,
    exclaim: <text y="6" textAnchor="middle" fontSize="19" fontWeight="800" fill="#e63946">!</text>,
    idea: (
        <g>
            <circle cy="-2" r="6" fill="#ffd23f" />
            <rect x="-3" y="3" width="6" height="4" rx="1" fill="#7b8794" />
            <path d="M-10 -8 L-7 -6 M10 -8 L7 -6 M0 -13 L0 -10" stroke="#ffb703" strokeWidth="1.6" strokeLinecap="round" />
        </g>
    ),
    check: (
        <g>
            <circle r="8" fill="#22c55e" />
            <path d="M-4 0 L-1 3.5 L5 -3" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
    ),
    sparkle: <path d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4Z" fill="#ffb703" />,
    zzz: (
        <g fill="#5b6b8c" fontWeight="800">
            <text x="-9" y="6" fontSize="11">Z</text>
            <text x="-1" y="0" fontSize="9">z</text>
            <text x="5" y="-5" fontSize="7">z</text>
        </g>
    ),
    laugh: <text y="5" textAnchor="middle" fontSize="12" fontWeight="800" fill="#f97316">ha</text>,
    coffee: (
        <g>
            <path d="M-6 -2 L6 -2 L5 7 L-5 7Z" fill="#8b5a2b" />
            <path d="M-3 -4 q2 -3 0 -6 M2 -4 q2 -3 0 -6" stroke="#94a3b8" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
    ),
    clap: <text y="5" textAnchor="middle" fontSize="12" fontWeight="800" fill="#16a34a">clap</text>,
};

export default function Emote({ kind, x = 14, y = -138 }) {
    const symbol = SYMBOLS[kind];
    if (!symbol) {
        return null;
    }
    return (
        <g transform={`translate(${x} ${y})`}>
            <g className="anim emote-float">
                <circle r="15" fill="#ffffff" opacity="0.95" />
                <path d="M-4 13 L0 20 L5 13Z" fill="#ffffff" opacity="0.95" />
                {symbol}
            </g>
        </g>
    );
}
