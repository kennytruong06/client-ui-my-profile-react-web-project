import { LuBookOpen, LuDumbbell, LuGuitar, LuPiano, LuSparkles } from 'react-icons/lu';

const ICONS = {
    exercise: LuDumbbell,
    english: LuBookOpen,
    skincare: LuSparkles,
    guitar: LuGuitar,
    piano: LuPiano,
};

export default function CategoryIcon({ category, size = 18, className = '' }) {
    const Icon = ICONS[category] ?? LuSparkles;
    return <Icon size={size} className={className} />;
}
