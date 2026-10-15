import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Lightbox from '@/components/Lightbox';

const allImages = import.meta.glob('@/assets/memories/*/*.{jpg,png,jpeg,gif}', { eager: true, import: 'default' });

export default function Gallery({ folder }) {
    const [selected, setSelected] = useState(null);

    const items = useMemo(() => Object.entries(allImages)
        .filter(([path]) => path.includes(`/memories/${folder}/`))
        .map(([path, image]) => ({
            image,
            text: decodeURIComponent(path.split('/').pop()).replace(/\.[^/.]+$/, ''),
        })), [folder]);

    return (
        <>
            <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
                {items.map((item, index) => (
                    <motion.button
                        key={item.image}
                        type="button"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index, 20) * 0.03 }}
                        onClick={() => setSelected(index)}
                        className="group relative mb-3 block w-full overflow-hidden rounded-xl border border-line"
                    >
                        <img src={item.image} alt={item.text} loading="lazy" className="w-full transition duration-500 group-hover:scale-105" />
                        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                    </motion.button>
                ))}
            </div>

            <Lightbox
                images={items.map((item) => item.image)}
                index={selected}
                caption={selected == null ? '' : items[selected]?.text}
                onChange={setSelected}
                onClose={() => setSelected(null)}
            />
        </>
    );
}
