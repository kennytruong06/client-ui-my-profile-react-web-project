export default function Backdrop() {
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="grid-backdrop absolute inset-0" />
            <div className="absolute -top-40 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-brand-500/15 blur-[120px] animate-float" />
            <div className="absolute top-1/2 -right-40 h-[420px] w-[420px] rounded-full bg-brand-700/10 blur-[120px] animate-float [animation-delay:-7s]" />
            <div className="absolute bottom-0 -left-40 h-[360px] w-[360px] rounded-full bg-white/5 blur-[120px] animate-float [animation-delay:-3s]" />
        </div>
    );
}
