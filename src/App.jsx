import {useState} from 'react'
import './App.css'
import Dock from '@/components/Dock';
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from 'react-icons/vsc';
import MyMemoriesPage from '@/pages/memories/MyMemoriesPage';

const items = [
    { icon: <VscHome className={'text-white'} size={18} />, label: 'Home', onClick: () => alert('Home!') },
    { icon: <VscArchive size={18} />, label: 'My Memories', onClick: () => alert('My Memories!') },
    { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => alert('Profile!') },
    { icon: <VscSettingsGear size={18} />, label: 'Settings', onClick: () => alert('Settings!') },
];

function App() {
    const [page, setPage] = useState('Home');

    const handleClick = (label) => {
        setPage(label);
    };

    const dockItems = items.map(item => ({
        ...item,
        onClick: () => handleClick(item.label),
    }));

    return (
        <div className="w-full h-full bg-main flex justify-center items-center">

            <div className="w-full h-full flex justify-center items-center bg-emerald-300 ">
                {page === 'Home' && <p>Đây là trang Home.</p>}
                {page === 'My Memories' && <MyMemoriesPage />}
                {page === 'Profile' && <p>Đây là trang Profile.</p>}
                {page === 'Settings' && <p>Đây là trang Settings.</p>}
            </div>

            <Dock
                items={dockItems}
                panelHeight={68}
                baseItemSize={50}
                magnification={70}
            />
        </div>
    );
}

export default App
