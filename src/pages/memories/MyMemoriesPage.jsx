import React, { useState }  from 'react';
import BlurText from '@/components/BlurText'
import Gallery from '@/components/Gallery'

function MyMemoriesPage() {
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedLabel, setSelectedLabel] = useState(null);

    const albums = [
        { folder: 'high-school-yearbook-photo', label: 'Kỷ yếu Cấp 3' },
        { folder: 'high-school-normal-photo', label: 'Những kỷ niệm Cấp 3' },
        { folder: 'couple', label: 'Ảnh Couple nè !' },
        { folder: 'bf', label: 'Bạn thân' },
        { folder: 'me', label: 'Ảnh của tui' },
        { folder: 'noble-team', label: 'Noble Team' },
        { folder: 'university', label: 'Ảnh đại học' },
        { folder: 'tom-dev-team', label: 'Ảnh Tom Dev Team' },
        { folder: 'self-defense-militia-in-vietnam', label: 'Dân quân tự vệ' },
        { folder: 'my-teenage-years', label: 'Ảnh trẻ trâu' },
        { folder: 'middle-school', label: 'Ảnh cấp 2' },
    ];

    const handleAnimationComplete = () => {
        console.log('Animation completed!');
    };

    return (
        <div className="w-full h-full flex flex-col justify-start items-center p-8 bg-black overflow-y-scroll">
            <BlurText
                text={selectedLabel ?? 'This is My Memories !!'}
                delay={150}
                animateBy="words"
                direction="top"
                onAnimationComplete={handleAnimationComplete}
                className="text-3xl text-white mb-8"
            />
            <div className="flex flex-wrap gap-4 mb-8 justify-center">
                {albums.map(({folder, label}) => (
                    <button
                        key={folder}
                        onClick={() => {
                            setSelectedFolder(folder)
                            setSelectedLabel(label)
                        }}
                        className={`px-4 py-2 rounded text-black border font-semibold ${
                            selectedFolder === folder
                                ? 'bg-white text-black'
                                : 'border-white hover:bg-white/20'
                        } transition`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            {selectedFolder && <Gallery folder={selectedFolder}/>}
        </div>
    );
}

export default MyMemoriesPage;
