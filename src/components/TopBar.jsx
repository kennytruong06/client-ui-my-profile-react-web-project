import { Link } from 'react-router-dom';
import LanguageToggle from '@/components/LanguageToggle';

export default function TopBar() {
    return (
        <header className="fixed inset-x-0 top-0 z-30 border-b border-line bg-ink-950/70 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link to="/" className="flex items-center gap-2 font-display text-sm font-semibold tracking-wide text-white">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-ink-950">K</span>
                    <span>KENNY<span className="text-brand-400">.</span></span>
                </Link>
                <LanguageToggle />
            </div>
        </header>
    );
}
