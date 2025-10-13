
import React from 'react';
import type { ModelStatus } from '../types';

interface HeaderProps {
    modelStatus: ModelStatus;
}

export const Header: React.FC<HeaderProps> = ({ modelStatus }) => {
    const statusColor = {
        "Veo 3 Available": 'bg-green-500/30 text-green-300 border-green-500/50',
        "Fallback Model Active": 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50',
        "Simulation Mode": 'bg-blue-500/30 text-blue-300 border-blue-500/50'
    };

    return (
        <header className="relative z-20 h-16 flex items-center justify-between px-4 sm:px-6 bg-black/30 backdrop-blur-sm border-b border-gray-700/50">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-orange-400">
                VEO³ Grid Nusantara
            </h1>
            <div className="flex items-center space-x-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${statusColor[modelStatus]}`}>
                    {modelStatus}
                </span>
            </div>
        </header>
    );
};
