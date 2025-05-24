import {useState} from 'react'
import './App.css'
import Dock from '@/components/Dock';
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from 'react-icons/vsc';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MyMemoriesPage from '@/pages/memories/MyMemoriesPage';
import HomePage from '@/pages/home/HomePage';
import ProfilePage from '@/pages/profile/ProfilePage';
import SettingsPage from '@/pages/setting/SettingsPage';

const items = [
    { icon: <VscHome className={'text-white'} size={18} />, label: 'Home',  path: '/' },
    { icon: <VscArchive size={18} />, label: 'My memories',  path: '/memories' },
    { icon: <VscAccount size={18} />, label: 'Profile',  path: '/profile' },
    { icon: <VscSettingsGear size={18} />, label: 'Settings',  path: '/settings' },
];

function DockWithNavigation() {
    const navigate = useNavigate();

    const dockItems = items.map(item => ({
        ...item,
        onClick: () => navigate(item.path),
    }));

    return (
        <Dock
            items={dockItems}
            panelHeight={68}
            baseItemSize={50}
            magnification={70}
        />
    );
}

function App() {
    return (
        <Router>
            <div className="w-full h-full bg-main flex justify-center items-center overflow-hidden">

                <div className="w-full h-full flex justify-center items-center overflow-hidden">
                    <Routes>
                        <Route path="/" element={<MyMemoriesPage/>}/>
                        <Route path="/home" element={<HomePage/>}/>
                        <Route path="/profile" element={<ProfilePage/>}/>
                        <Route path="/settings" element={<SettingsPage/>}/>
                        <Route path="*" element={<Navigate to="/" replace/>}/>
                    </Routes>
                </div>

                <DockWithNavigation/>

            </div>
        </Router>
    );
}

export default App
