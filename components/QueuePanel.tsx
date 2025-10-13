
import React from 'react';
import type { Job } from '../types';
import { JobStatus } from '../types';

interface QueuePanelProps {
    jobs: Job[];
}

const getStatusColor = (status: JobStatus) => {
    switch (status) {
        case JobStatus.COMPLETED: return 'bg-green-500';
        case JobStatus.FAILED: return 'bg-red-500';
        case JobStatus.QUEUED: return 'bg-gray-500';
        default: return 'bg-indigo-500';
    }
};

const JobItem: React.FC<{ job: Job }> = ({ job }) => (
    <div className="p-2 bg-gray-700/50 rounded-md">
        <div className="flex justify-between items-center text-xs mb-1">
            <p className="font-semibold truncate pr-2">{job.scriptTitle}</p>
            <p className="text-gray-400 flex-shrink-0">{job.status}</p>
        </div>
        <div className="w-full bg-gray-600/50 rounded-full h-1.5">
            <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${getStatusColor(job.status)}`}
                style={{ width: `${job.progress}%` }}
            ></div>
        </div>
        {job.status !== JobStatus.COMPLETED && job.status !== JobStatus.FAILED && job.eta > 0 &&
            <p className="text-right text-xs text-gray-400 mt-1">ETA: {Math.floor(job.eta / 60)}m {job.eta % 60}s</p>
        }
    </div>
);

export const QueuePanel: React.FC<QueuePanelProps> = ({ jobs }) => {
    return (
        <div className="flex-1 flex flex-col space-y-2 p-3 bg-gray-800/50 rounded-lg min-h-[150px]">
            <h2 className="text-sm font-semibold text-gray-300 mb-1">Antrian</h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {jobs.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">No active jobs.</p>
                ) : (
                    jobs.map(job => <JobItem key={job.id} job={job} />)
                )}
            </div>
        </div>
    );
};
