import React, { useState } from 'react';
import type { GenerationParams, SceneGenerationParam } from '../types';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { XCircleIcon } from './icons';

interface ScriptFormProps {
    onGenerate: (params: GenerationParams) => void;
    isDisabled: boolean;
}

export const ScriptForm: React.FC<ScriptFormProps> = ({ onGenerate, isDisabled }) => {
    const [scenes, setScenes] = useState<SceneGenerationParam[]>([
        { id: `scene-${Date.now()}`, prompt: 'Sebuah adegan sinematik seekor elang terbang di atas kawah gunung Bromo saat matahari terbit.', duration: 7, visualStyle: 'default', ttsVolume: 100 }
    ]);
    const [aspectRatio, setAspectRatio] = useState<GenerationParams['aspectRatio']>('16:9');
    const [resolution, setResolution] = useState<GenerationParams['resolution']>('1080p');
    const [fps, setFps] = useState<GenerationParams['fps']>(24);
    const [visualStyle, setVisualStyle] = useState<GenerationParams['visualStyle']>('cinematic');
    const [ttsVoice, setTtsVoice] = useState('id-ID-Wavenet-A');
    const [musicMood, setMusicMood] = useState<GenerationParams['musicMood']>('dramatic');
    const [musicTrack, setMusicTrack] = useState('cinematic-score.mp3');
    const [musicVolume, setMusicVolume] = useState(70);
    const [simulationMode, setSimulationMode] = useState(false);

    const addScene = () => {
        setScenes(prev => [...prev, { id: `scene-${Date.now()}`, prompt: '', duration: 5, visualStyle: 'default', ttsVolume: 100 }]);
    };

    const removeScene = (id: string) => {
        setScenes(prev => prev.filter(scene => scene.id !== id));
    };

    const updateScene = (id: string, field: keyof Omit<SceneGenerationParam, 'id'>, value: string | number) => {
        setScenes(prev => prev.map(scene => {
            if (scene.id === id) {
                if (field === 'duration' || field === 'ttsVolume') {
                    const newValue = Math.max(0, parseInt(value as string, 10) || 0);
                    return { ...scene, [field]: newValue };
                }
                return { ...scene, [field]: value };
            }
            return scene;
        }));
    };

    const handleSubmit = (isBatch: boolean) => {
        // Batch mode is not fully implemented in this mock, but the button is here.
        const params: GenerationParams = {
            scenes,
            aspectRatio,
            resolution,
            fps,
            visualStyle,
            language: 'id-ID',
            ttsVoice,
            musicMood,
            musicTrack,
            musicVolume,
            simulationMode,
        };
        onGenerate(params);
    };

    return (
        <div className="space-y-4 p-3 bg-gray-800/50 rounded-lg">
            <h2 className="text-sm font-semibold text-gray-300">Generate Video</h2>
            
            <div className="space-y-3 max-h-[25vh] overflow-y-auto pr-2 custom-scrollbar">
                {scenes.map((scene, index) => (
                    <div key={scene.id} className="p-3 bg-gray-900/70 rounded-lg space-y-2 relative border border-gray-700/50">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-gray-400">Scene {index + 1}</label>
                            {scenes.length > 1 && (
                                <button onClick={() => removeScene(scene.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                                    <XCircleIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <Textarea 
                            placeholder={`Enter prompt for scene ${index + 1}...`}
                            value={scene.prompt}
                            onChange={(e) => updateScene(scene.id, 'prompt', e.target.value)}
                            className="min-h-[60px] text-xs"
                        />
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Duration (s)</label>
                                <Input 
                                    type="number" 
                                    value={scene.duration}
                                    onChange={(e) => updateScene(scene.id, 'duration', e.target.value)}
                                    min="1"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">TTS Vol (%)</label>
                                <Input 
                                    type="number" 
                                    value={scene.ttsVolume}
                                    onChange={(e) => updateScene(scene.id, 'ttsVolume', e.target.value)}
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <Select label="Visual Style" id={`visualStyle-${scene.id}`} value={scene.visualStyle} onChange={e => updateScene(scene.id, 'visualStyle', e.target.value as SceneGenerationParam['visualStyle'])}>
                                <option value="default">Default ({visualStyle.charAt(0).toUpperCase() + visualStyle.slice(1)})</option>
                                <option value="cinematic">Cinematic</option>
                                <option value="documentary">Documentary</option>
                                <option value="natural">Natural</option>
                                <option value="anime">Anime</option>
                            </Select>
                        </div>
                    </div>
                ))}
            </div>
            <Button onClick={addScene} variant="ghost" size="sm" className="w-full">
                + Add Scene
            </Button>

            <h3 className="text-sm font-semibold text-gray-300 pt-2 border-t border-gray-700/50">Global Settings</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
                <Select label="Aspect Ratio" id="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as GenerationParams['aspectRatio'])}>
                    <option>16:9</option>
                    <option>9:16</option>
                    <option>1:1</option>
                </Select>
                <Select label="Resolution" id="resolution" value={resolution} onChange={e => setResolution(e.target.value as GenerationParams['resolution'])}>
                    <option>720p</option>
                    <option>1080p</option>
                </Select>
                <Select label="FPS" id="fps" value={fps} onChange={e => setFps(parseInt(e.target.value) as GenerationParams['fps'])}>
                    <option>24</option>
                    <option>25</option>
                    <option>30</option>
                </Select>
                <Select label="Default Visual Style" id="visualStyle" value={visualStyle} onChange={e => setVisualStyle(e.target.value as GenerationParams['visualStyle'])}>
                    <option value="cinematic">Cinematic</option>
                    <option value="documentary">Documentary</option>
                    <option value="natural">Natural</option>
                    <option value="anime">Anime</option>
                </Select>
                 <Select label="TTS Voice (id-ID)" id="ttsVoice" value={ttsVoice} onChange={e => setTtsVoice(e.target.value)}>
                    <option>id-ID-Wavenet-A</option>
                    <option>id-ID-Wavenet-B</option>
                    <option>id-ID-Standard-A</option>
                </Select>
                <Select label="Music Mood" id="musicMood" value={musicMood} onChange={e => setMusicMood(e.target.value as GenerationParams['musicMood'])}>
                    <option value="cheerful">Cheerful</option>
                    <option value="calm">Calm</option>
                    <option value="dramatic">Dramatic</option>
                </Select>
                 <Select label="Music Track" id="musicTrack" value={musicTrack} onChange={e => setMusicTrack(e.target.value)}>
                    <option value="cinematic-score.mp3">Cinematic Score</option>
                    <option value="ambient-waves.mp3">Ambient Waves</option>
                    <option value="lofi-beats.mp3">Lofi Beats</option>
                </Select>
                 <div>
                    <label htmlFor="musicVolume" className="block text-xs font-medium text-gray-400 mb-1">Music Volume ({musicVolume}%)</label>
                    <input type="range" id="musicVolume" min="0" max="100" value={musicVolume} onChange={e => setMusicVolume(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                 </div>
            </div>
             <div className="flex items-center space-x-2 pt-2">
                <input
                    type="checkbox"
                    id="simulation-mode"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={simulationMode}
                    onChange={(e) => setSimulationMode(e.target.checked)}
                />
                <label htmlFor="simulation-mode" className="text-xs text-gray-300">
                    Mode Simulasi (Slideshow)
                </label>
            </div>
            <div className="flex space-x-2 pt-2">
                <Button onClick={() => handleSubmit(false)} className="w-full" variant="primary" disabled={isDisabled || scenes.length === 0 || !scenes.some(s => s.prompt)}>
                    Generate 1 Video
                </Button>
                <Button onClick={() => handleSubmit(true)} className="w-full" variant="secondary" disabled={isDisabled || scenes.length === 0 || !scenes.some(s => s.prompt)}>
                    Generate Batch
                </Button>
            </div>
        </div>
    );
};