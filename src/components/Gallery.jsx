import React, { useState, useMemo } from 'react';

const allImages = import.meta.glob('@/assets/memories/*/*.{jpg,png,jpeg,gif}', { eager: true });

export default function Gallery({ folder }) {
    const [selected, setSelected] = useState(null);

    const defaultItems = useMemo(() => {
        return Object.entries(allImages)
            .filter(([path]) => path.includes(`/memories/${folder}/`))
            .map(([path, module]) => {
                const parts = path.split('/');
                const filename = parts[parts.length - 1];
                const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

                return {
                    image: module.default,
                    text: nameWithoutExt,
                };
            });
    }, [folder]);

    return (
        <div className="p-4">
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {defaultItems.map((item, index) => (
                    <img
                        key={index}
                        src={item.image}
                        alt={item.text}
                        className="w-full rounded cursor-pointer hover:opacity-80 transition"
                        onClick={() => setSelected(item)}
                    />
                ))}
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div
                        className="relative w-[90vw] h-[90vh] bg-white/50 rounded-xl shadow-2xl overflow-hidden flex items-center justify-center">

                        <button
                            onClick={() => setSelected(null)}
                            className="absolute top-4 right-4 !bg-black/50 text-white text-2xl font-bold px-3 py-1 rounded transition z-20"
                        >
                            x
                        </button>

                        <img
                            src={selected.image}
                            alt={selected.text}
                            className="h-full w-auto object-contain"
                        />

                        <div
                            className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-sm sm:text-base px-4 py-2 rounded z-20">
                            {selected.text}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
