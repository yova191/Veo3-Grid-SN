import React from 'react';
import type { GalleryItem } from '../types';
import { Button } from './ui/Button';
import { DownloadIcon } from './icons';
import { Timeline } from './Timeline';

interface PreviewPanelProps {
    item: GalleryItem | null;
    onUpdateItem: (item: GalleryItem) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ item, onUpdateItem }) => {
    if (!item) {
        return (
            <div className="flex-1 bg-black/30 backdrop-blur-sm rounded-lg border border-gray-700/50 flex items-center justify-center">
                <p className="text-gray-500">Select a video from the gallery to preview</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-black/30 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-y-auto">
            <div className="aspect-video bg-black flex-shrink-0">
                <video key={item.id} controls autoPlay muted loop className="w-full h-full object-contain">
                    <source src={item.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
            <div className="p-4 space-y-3 flex-shrink-0">
                <h2 className="text-lg font-bold text-white truncate">{item.title}</h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span>Total Duration:</span> <span className="text-gray-200">{item.metadata.totalDuration}</span>
                    <span>Resolution:</span> <span className="text-gray-200">{item.metadata.resolution}</span>
                    <span>FPS:</span> <span className="text-gray-200">{item.metadata.fps}</span>
                    <span>Model Used:</span> <span className="text-gray-200">{item.metadata.modelUsed}</span>
                    <span>Mode:</span> <span className="text-gray-200">{item.metadata.mode}</span>
                    <span>Date:</span> <span className="text-gray-200">{item.metadata.date}</span>
                </div>
                <div className="flex space-x-2 pt-2">
                    <Button variant="secondary" className="w-full">
                        <DownloadIcon className="w-4 h-4 mr-2"/> Download MP4
                    </Button>
                    <Button variant="ghost" className="w-full">
                        Regenerate Scene
                    </Button>
                </div>
            </div>

            <Timeline item={item} onSaveChanges={onUpdateItem} />

        </div>
    );
};