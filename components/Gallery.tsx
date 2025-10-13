
import React from 'react';
import type { GalleryItem } from '../types';
import { PlayIcon, DownloadIcon } from './icons';

interface GalleryProps {
    items: GalleryItem[];
    onSelectItem: (item: GalleryItem) => void;
    selectedItemId?: string | null;
}

const GalleryCard: React.FC<{ item: GalleryItem; onSelect: () => void; isSelected: boolean }> = ({ item, onSelect, isSelected }) => {
    const statusBadgeColor = item.status === 'Veo' ? 'bg-green-500/80' : 'bg-blue-500/80';
    const selectionClass = isSelected ? 'ring-2 ring-orange-500' : 'ring-1 ring-gray-700 hover:ring-indigo-500';

    return (
        <div 
            className={`group relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all ${selectionClass}`}
            onClick={onSelect}
        >
            <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-2 text-white">
                <h3 className="text-sm font-semibold truncate">{item.title}</h3>
                <div className="text-xs text-gray-300 flex items-center space-x-2">
                    <span>{item.duration}</span>
                    <span>{item.resolution}</span>
                </div>
            </div>
            <span className={`absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-md text-white ${statusBadgeColor}`}>
                {item.status}
            </span>
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayIcon className="w-12 h-12 text-white" />
            </div>
        </div>
    );
};


export const Gallery: React.FC<GalleryProps> = ({ items, onSelectItem, selectedItemId }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-200">Galeri</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map(item => (
                    <GalleryCard 
                        key={item.id} 
                        item={item} 
                        onSelect={() => onSelectItem(item)}
                        isSelected={item.id === selectedItemId}
                    />
                ))}
            </div>
        </div>
    );
};
