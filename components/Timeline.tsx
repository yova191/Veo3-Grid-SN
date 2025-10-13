import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Scene, GalleryItem } from '../types';
import { FilmIcon, MicIcon, MusicIcon, Volume2Icon, ImageIcon } from './icons';
import { Button } from './ui/Button';

interface TimelineProps {
    item: GalleryItem;
    onSaveChanges: (updatedItem: GalleryItem) => void;
}

const TrackHeader: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <div className="h-20 flex flex-col items-center justify-center bg-gray-800/60 p-2 border-b border-r border-gray-700/50">
        {icon}
        <span className="text-xs mt-1 text-gray-400">{label}</span>
    </div>
);

const AudioTrackHeader: React.FC<{ 
    icon: React.ReactNode; 
    label: string;
    trackName: string;
    volume: number;
    onVolumeChange: (volume: number) => void;
}> = ({ icon, label, trackName, volume, onVolumeChange }) => (
    <div className="h-20 flex flex-col items-center justify-center bg-gray-800/60 p-2 border-b border-r border-gray-700/50 text-center">
        {icon}
        <span className="text-xs mt-1 text-gray-400">{label}</span>
        <span className="text-xs text-gray-200 w-full truncate" title={trackName}>{trackName}</span>
         <div className="w-full px-1 mt-1">
             <input type="range" min="0" max="100" value={volume} onChange={(e) => onVolumeChange(parseInt(e.target.value, 10))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
         </div>
    </div>
);

const SceneClip: React.FC<{
    scene: Scene;
    totalDuration: number;
    isResizing: boolean;
    onResizeStart: (
        event: React.MouseEvent<HTMLDivElement>,
        sceneId: string,
        handle: 'left' | 'right'
    ) => void;
}> = ({ scene, totalDuration, isResizing, onResizeStart }) => {
    const widthPercentage = (scene.duration / totalDuration) * 100;
    const clipBorderColor = scene.type === 'image' ? 'border-cyan-700/50' : 'border-indigo-700/50';

    return (
        <div
            className={`group relative h-full bg-indigo-900/50 rounded-md overflow-hidden border ${clipBorderColor} select-none`}
            style={{ width: `${widthPercentage}%` }}
            title={`Prompt: ${scene.prompt}\nDuration: ${scene.duration.toFixed(1)}s\nType: ${scene.type}`}
        >
            {/* Handles */}
            <div
                onMouseDown={(e) => onResizeStart(e, scene.id, 'left')}
                className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
                <div className="w-0.5 h-1/2 bg-orange-400 rounded-full"></div>
            </div>
            <div
                onMouseDown={(e) => onResizeStart(e, scene.id, 'right')}
                className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
                <div className="w-0.5 h-1/2 bg-orange-400 rounded-full"></div>
            </div>

            <img src={scene.thumbnailUrl} alt={`Scene ${scene.id}`} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            
            {scene.type === 'image' && (
                <div className="absolute top-1 left-1 bg-black/50 p-0.5 rounded" title="Image Placeholder">
                    <ImageIcon className="w-3 h-3 text-cyan-300" />
                </div>
            )}

            <div className="relative z-10 p-1 text-white text-xs overflow-hidden">
                <p className="font-semibold truncate">{scene.prompt}</p>
                <p className="text-gray-300">{scene.duration.toFixed(1)}s</p>
            </div>
             {isResizing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-lg font-bold text-white z-30">
                    {scene.duration.toFixed(1)}s
                </div>
            )}
        </div>
    );
};

const TTSClip: React.FC<{ 
    scene: Scene; 
    totalDuration: number;
    volume: number;
    onVolumeChange: (newVolume: number) => void;
}> = ({ scene, totalDuration, volume, onVolumeChange }) => {
    const widthPercentage = (scene.duration / totalDuration) * 100;

    return (
        <div 
            className="group relative h-full bg-orange-900/50 rounded-md border border-orange-700/50 flex items-center justify-center p-1"
            style={{ width: `${widthPercentage}%` }}
        >
            <div className="w-full h-1/2 bg-orange-500/30 rounded-md" style={{ transform: `scaleY(${volume / 100})` }}></div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 text-white p-2">
                <Volume2Icon className="w-4 h-4" />
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs font-mono w-8 text-right">{volume}%</span>
            </div>
        </div>
    );
};


export const Timeline: React.FC<TimelineProps> = ({ item, onSaveChanges }) => {
    const [scenes, setScenes] = useState(item.scenes);
    const [audioSettings, setAudioSettings] = useState(item.audioSettings);
    const [hasChanges, setHasChanges] = useState(false);
    
    const trackContainerRef = useRef<HTMLDivElement>(null);
    const [dragState, setDragState] = useState<{
        sceneId: string;
        handle: 'left' | 'right';
        startX: number;
        originalDuration: number;
        pixelsPerSecond: number;
    } | null>(null);
    
    useEffect(() => {
        setScenes(item.scenes);
        setAudioSettings(item.audioSettings);
        setHasChanges(false);
    }, [item]);

    useEffect(() => {
        const initialScenesJSON = JSON.stringify(item.scenes.map(s => ({...s, duration: s.duration.toFixed(1) })));
        const currentScenesJSON = JSON.stringify(scenes.map(s => ({...s, duration: s.duration.toFixed(1) })));
        const initialAudioJSON = JSON.stringify(item.audioSettings);
        const currentAudioJSON = JSON.stringify(audioSettings);

        if (initialScenesJSON !== currentScenesJSON || initialAudioJSON !== currentAudioJSON) {
            setHasChanges(true);
        } else {
            setHasChanges(false);
        }
    }, [scenes, audioSettings, item]);

    const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0) || 1;

    const handleResizeStart = useCallback((
        event: React.MouseEvent<HTMLDivElement>,
        sceneId: string,
        handle: 'left' | 'right'
    ) => {
        event.preventDefault();
        const trackWidth = trackContainerRef.current?.offsetWidth;
        if (!trackWidth) return;

        const scene = scenes.find(s => s.id === sceneId);
        if (!scene) return;
        
        setDragState({
            sceneId,
            handle,
            startX: event.clientX,
            originalDuration: scene.duration,
            pixelsPerSecond: trackWidth / totalDuration,
        });
    }, [scenes, totalDuration]);

    const handleResizeMove = useCallback((event: MouseEvent) => {
        if (!dragState) return;
        
        const deltaX = event.clientX - dragState.startX;
        const durationChange = deltaX / dragState.pixelsPerSecond;
        
        let newDuration = dragState.originalDuration + (dragState.handle === 'right' ? durationChange : -durationChange);
        
        newDuration = Math.max(1, Math.round(newDuration * 10) / 10); // Clamp at 1s, round to 1 decimal
        
        setScenes(currentScenes =>
            currentScenes.map(s =>
                s.id === dragState.sceneId ? { ...s, duration: newDuration } : s
            )
        );
    }, [dragState]);

    const handleResizeEnd = useCallback(() => {
        setDragState(null);
    }, []);

    useEffect(() => {
        if (dragState) {
            document.body.style.cursor = 'ew-resize';
            window.addEventListener('mousemove', handleResizeMove);
            window.addEventListener('mouseup', handleResizeEnd);
        }
        
        return () => {
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', handleResizeMove);
            window.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [dragState, handleResizeMove, handleResizeEnd]);


    const handleTtsVolumeChange = (sceneId: string, newVolume: number) => {
        setScenes(currentScenes => currentScenes.map(s => s.id === sceneId ? { ...s, ttsVolume: newVolume } : s));
    };

    const handleMusicVolumeChange = (newVolume: number) => {
        setAudioSettings(currentSettings => ({...currentSettings, musicVolume: newVolume}));
    };

    const handleSave = () => {
        const newTotalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0);
        const updatedItem = {
            ...item,
            scenes,
            audioSettings,
            metadata: {
                ...item.metadata,
                totalDuration: `${newTotalDuration.toFixed(1)}s`,
            },
            duration: `0:${Math.round(newTotalDuration).toString().padStart(2, '0')}`,
        };
        onSaveChanges(updatedItem);
    };

    return (
        <div className="mt-4 flex-shrink-0 p-4 pt-0">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-semibold text-gray-200">Timeline Editor</h3>
                <Button onClick={handleSave} disabled={!hasChanges} size="sm" variant="secondary">
                    Save Changes
                </Button>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2">
                <div className="grid grid-cols-[100px_1fr] gap-x-2">
                    {/* Track Headers */}
                    <div className="space-y-1">
                        <TrackHeader icon={<FilmIcon className="w-5 h-5 text-indigo-400" />} label="Video" />
                        <TrackHeader icon={<MicIcon className="w-5 h-5 text-orange-400" />} label="TTS" />
                        <AudioTrackHeader 
                            icon={<MusicIcon className="w-5 h-5 text-green-400" />} 
                            label="Music"
                            trackName={audioSettings.musicTrack}
                            volume={audioSettings.musicVolume}
                            onVolumeChange={handleMusicVolumeChange}
                        />
                    </div>
                    {/* Tracks */}
                    <div className="space-y-1 overflow-x-auto">
                         {/* Video Track */}
                        <div className="h-20 p-1 bg-gray-900/50 rounded-md border border-gray-700/50">
                            <div ref={trackContainerRef} className="relative w-full h-full flex items-center space-x-1">
                                {scenes.map(scene => (
                                    <SceneClip 
                                        key={scene.id} 
                                        scene={scene} 
                                        totalDuration={totalDuration}
                                        isResizing={dragState?.sceneId === scene.id}
                                        onResizeStart={handleResizeStart}
                                    />
                                ))}
                            </div>
                        </div>
                         {/* TTS Track */}
                        <div className="h-20 p-1 bg-gray-900/50 rounded-md border border-gray-700/50">
                             <div className="relative w-full h-full flex items-center space-x-1">
                                {scenes.map(scene => (
                                    <TTSClip 
                                        key={scene.id} 
                                        scene={scene} 
                                        totalDuration={totalDuration}
                                        volume={scene.ttsVolume}
                                        onVolumeChange={(newVolume) => handleTtsVolumeChange(scene.id, newVolume)}
                                    />
                                ))}
                            </div>
                        </div>
                         {/* Music Track */}
                        <div className="h-20 p-1 bg-gray-900/50 rounded-md border border-gray-700/50 flex items-center">
                            <div 
                                className="w-full h-1/2 bg-green-800/30 rounded-md border border-dashed border-green-600/50"
                                style={{
                                    backgroundImage: `linear-gradient(to right, rgba(16, 185, 129, ${audioSettings.musicVolume/200}) 1px, transparent 1px)`,
                                    backgroundSize: '8px 8px'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};