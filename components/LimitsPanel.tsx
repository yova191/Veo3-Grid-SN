
import React from 'react';
import type { ApiLimit } from '../types';
import { Button } from './ui/Button';
import { RefreshCwIcon } from './icons';

interface LimitsPanelProps {
    limits: ApiLimit[];
    onRefresh: () => void;
}

const LimitBar: React.FC<{ limit: ApiLimit }> = ({ limit }) => {
    const percentage = (limit.usedToday / limit.limitPerDay) * 100;
    const sourceColor = limit.source === 'real' ? 'text-green-400' : 'text-yellow-400';

    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm text-gray-300">{limit.service}</p>
                <p className="text-xs">
                    <span className="font-semibold text-white">{limit.usedToday}</span>
                    <span className="text-gray-400"> / {limit.limitPerDay} daily</span>
                </p>
            </div>
            <div className="w-full bg-gray-600/50 rounded-full h-2">
                <div 
                    className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <p className={`text-right text-xs mt-1 ${sourceColor}`}>
                ({limit.source})
            </p>
        </div>
    );
};


export const LimitsPanel: React.FC<LimitsPanelProps> = ({ limits, onRefresh }) => {
    return (
        <div className="p-4 bg-black/30 backdrop-blur-sm rounded-lg border border-gray-700/50 space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-200">Keterangan Limit API Key</h3>
                <Button variant="ghost" size="sm" onClick={onRefresh}>
                    <RefreshCwIcon className="w-3 h-3 mr-1.5" />
                    Refresh
                </Button>
            </div>
            <div className="space-y-4">
                {limits.length > 0 ? (
                    limits.map(limit => <LimitBar key={limit.service} limit={limit} />)
                ) : (
                    <p className="text-xs text-gray-500 text-center py-4">
                        Validate your API key to see limit information.
                    </p>
                )}
            </div>
            <p className="text-xs text-gray-500 pt-2">
                Angka estimasi akan lebih akurat jika Service Usage/Monitoring API aktif.
            </p>
        </div>
    );
};
