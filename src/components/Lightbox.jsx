import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuChevronLeft, LuChevronRight, LuX } from 'react-icons/lu';

export default function Lightbox({ images, index, caption, onChange, onClose }) {
    const open = index != null;

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const onKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            } else if (event.key === 'ArrowRight') {
                onChange((index + 1) % images.length);
            } else if (event.key === 'ArrowLeft') {
                onChange((index - 1 + images.length) % images.length);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, index, images.length, onChange, onClose]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[100] flex items-center justify-center overscroll-contain bg-black/90 p-4 backdrop-blur"
                >
                    <figure onClick={(event) => event.stopPropagation()} className="relative flex max-h-full max-w-5xl flex-col items-center">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={images[index]}
                                src={images[index]}
                                alt={caption ?? ''}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="max-h-[80vh] w-auto rounded-xl object-contain"
                            />
                        </AnimatePresence>
                        <figcaption className="mt-3 text-center text-sm text-muted">
                            {caption}
                            {images.length > 1 && <span className="ml-2 font-mono text-faint">{index + 1}/{images.length}</span>}
                        </figcaption>
                        <button type="button" aria-label="Close" onClick={onClose} className="absolute -top-3 -right-3 grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-ink-950">
                            <LuX />
                        </button>
                        {images.length > 1 && (
                            <>
                                <button type="button" aria-label="Previous" onClick={() => onChange((index - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white hover:bg-brand-500 hover:text-ink-950">
                                    <LuChevronLeft />
                                </button>
                                <button type="button" aria-label="Next" onClick={() => onChange((index + 1) % images.length)} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white hover:bg-brand-500 hover:text-ink-950">
                                    <LuChevronRight />
                                </button>
                            </>
                        )}
                    </figure>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
