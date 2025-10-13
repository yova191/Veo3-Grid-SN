
import React, { useRef, useEffect } from 'react';
import { Button } from './ui/Button';

interface ConsoleLogProps {
    logs: string[];
}

export const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="h-full flex flex-col p-2 font-mono text-xs">
            <div className="flex justify-between items-center px-2 pb-1 border-b border-gray-700/50 mb-2">
                <h3 className="font-semibold text-gray-300">Console Log</h3>
                <Button variant="ghost" size="sm" onClick={() => { /* Clear logs logic */ }}>Clear</Button>
            </div>
            <div ref={logContainerRef} className="flex-1 overflow-y-auto pr-2">
                {logs.map((log, index) => (
                    <p key={index} className="text-gray-400 leading-relaxed fade-in">
                        <span className="text-indigo-400 mr-2">&gt;</span>{log}
                    </p>
                ))}
            </div>
        </div>
    );
};
