// FIX: Removed self-import of 'GenerationParams' which conflicts with its local declaration.
export enum ModelStatus {
    AVAILABLE = "Veo 3 Available",
    FALLBACK = "Fallback Model Active",
    SIMULATION = "Simulation Mode",
}

export enum JobStatus {
    QUEUED = "Queued",
    PLANNING = "Scene Planning",
    GENERATING = "Generating Clips",
    SYNTHESIZING = "Synthesizing Voice",
    MIXING = "Mixing Audio",
    STITCHING = "Stitching Video",
    COMPLETED = "Completed",
    FAILED = "Failed",
}

export interface Scene {
    id: string;
    thumbnailUrl: string;
    duration: number; // in seconds
    prompt: string;
    ttsVolume: number; // 0-100
    type: 'video' | 'image';
}

export interface SceneGenerationParam {
    id: string;
    prompt: string;
    duration: number; // in seconds
    visualStyle: 'cinematic' | 'documentary' | 'natural' | 'anime' | 'default';
    ttsVolume: number; // 0-100
}

export interface Job {
    id: string;
    status: JobStatus;
    progress: number;
    eta: number; // in seconds
    scriptTitle: string;
    error?: string;
    result?: GalleryItem;
    generationParams: GenerationParams;
}

export interface GalleryItem {
    id:string;
    title: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: string;
    resolution: string;
    timestamp: string;
    status: 'Veo' | 'Simulated';
    scenes: Scene[];
    metadata: {
        totalDuration: string;
        fps: number;
        resolution: string;
        modelUsed: string;
        mode: 'Veo' | 'Simulated';
        date: string;
    };
    audioSettings: {
        musicTrack: string;
        musicVolume: number; // 0-100
    };
}

export interface GenerationParams {
    scenes: SceneGenerationParam[];
    aspectRatio: '16:9' | '9:16' | '1:1';
    resolution: '720p' | '1080p';
    fps: 24 | 25 | 30;
    visualStyle: 'cinematic' | 'documentary' | 'natural' | 'anime';
    language: 'id-ID';
    ttsVoice: string;
    musicMood: 'cheerful' | 'calm' | 'dramatic';
    musicTrack: string;
    musicVolume: number; // 0-100
    seed?: number;
    simulationMode: boolean;
}

export interface ApiLimit {
    service: string;
    limitPerMinute: number;
    limitPerDay: number;
    usedToday: number;
    source: 'real' | 'estimated';
}