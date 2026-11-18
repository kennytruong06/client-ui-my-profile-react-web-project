const ITEMS = {
    book: (
        <g transform="translate(3 -9)">
            <rect width="17" height="12" rx="1.5" fill="#4f74b3" />
            <rect x="1.5" y="1.5" width="14" height="9" fill="#f6f1e3" />
            <path d="M8.5 1.5 V10.5" stroke="#c9c2ad" strokeWidth="1" />
        </g>
    ),
    mug: (
        <g transform="translate(1 -11)">
            <rect width="10" height="12" rx="2" fill="#ffffff" stroke="#d3dae6" />
            <path d="M10 3 q5 0 5 4 q0 3 -5 3" stroke="#d3dae6" strokeWidth="2" fill="none" />
            <rect x="1" y="1" width="8" height="3" fill="#6b4226" />
        </g>
    ),
    cup: (
        <g transform="translate(1 -14)">
            <path d="M0 3 L10 3 L9 16 L1 16Z" fill="#d6a56f" />
            <rect x="-1" y="0" width="12" height="4" rx="1.5" fill="#f4efe6" />
            <rect x="0" y="8" width="10" height="3" fill="#8b5a2b" />
        </g>
    ),
    phone: (
        <g transform="translate(1 -13)">
            <rect width="8" height="13" rx="1.8" fill="#1f2937" />
            <rect x="1" y="1.4" width="6" height="10" rx="1" fill="#9bdcff" />
        </g>
    ),
    paper: (
        <g transform="translate(-1 -15)">
            <rect width="13" height="17" fill="#ffffff" stroke="#cbd5e1" />
            <path d="M2.5 4 H10.5 M2.5 7.5 H10.5 M2.5 11 H8" stroke="#94a3b8" strokeWidth="1.1" />
        </g>
    ),
    folder: (
        <g transform="translate(-1 -14)">
            <rect width="16" height="18" rx="1.5" fill="#f59e0b" />
            <rect x="2" y="2" width="12" height="3" fill="#fde68a" />
        </g>
    ),
    tray: (
        <g transform="translate(-6 -6)">
            <rect width="30" height="3" rx="1.5" fill="#94a3b8" />
            <path d="M4 0 q5 -9 10 0Z" fill="#ffffff" />
            <circle cx="21" cy="-2" r="3.2" fill="#f59e0b" />
        </g>
    ),
    bowl: (
        <g transform="translate(-4 -7)">
            <path d="M0 0 H16 q-1 8 -8 8 q-7 0 -8 -8Z" fill="#ffffff" stroke="#d3dae6" />
            <ellipse cx="8" cy="0.5" rx="7.5" ry="2" fill="#f4d58d" />
        </g>
    ),
    pizza: (
        <g transform="translate(-4 -6)">
            <rect width="26" height="5" rx="1" fill="#d9a066" />
            <rect y="-2" width="26" height="2.5" fill="#e8b97c" />
        </g>
    ),
    bag: (
        <g transform="translate(-2 1)">
            <path d="M2 0 V6 M10 0 V6" stroke="#5a3d25" strokeWidth="1.4" />
            <rect x="-4" y="6" width="20" height="17" rx="3" fill="#7a5a3a" />
        </g>
    ),
    duck: (
        <g transform="translate(2 -12)">
            <ellipse cx="5" cy="8" rx="8" ry="5.4" fill="#facc15" />
            <circle cx="10" cy="1.5" r="4.6" fill="#facc15" />
            <path d="M14 1.5 L19 3 L14 4.4Z" fill="#f97316" />
            <circle cx="11" cy="0.4" r="0.9" fill="#1f2937" />
        </g>
    ),
    clicker: <rect x="0" y="-7" width="3" height="8" rx="1" fill="#111827" />,
    pen: <rect x="1" y="-1" width="3" height="11" rx="1.2" fill="#2563eb" />,
};

function Graded({ mirror }) {
    return (
        <g transform="translate(-1 -17)">
            <rect width="14" height="19" fill="#ffffff" stroke="#cbd5e1" />
            <text x="7" y="14" textAnchor="middle" transform={mirror ? 'translate(14 0) scale(-1 1)' : undefined} fontSize="12" fontWeight="800" fill="#e63946">9</text>
        </g>
    );
}

export default function Held({ kind, angle, mirror }) {
    if (kind === 'graded') {
        return <g transform={`rotate(${angle})`}><Graded mirror={mirror} /></g>;
    }
    if (kind === 'stick') {
        return <rect x="-1" y="0" width="2.4" height="46" rx="1" fill="#c18a52" />;
    }
    const item = ITEMS[kind];
    return item ? <g transform={`rotate(${angle})`}>{item}</g> : null;
}
