import type { Job, GalleryItem, ApiLimit, GenerationParams, Scene } from '../types';
import { JobStatus } from '../types';

// In-memory "database" for mock jobs
const mockJobs: Map<string, Job> = new Map();
const mockJobProgress: Map<string, { statusIndex: number; progress: number }> = new Map();

const jobStatusesCycle = [
    JobStatus.PLANNING,
    JobStatus.GENERATING,
    JobStatus.SYNTHESIZING,
    JobStatus.MIXING,
    JobStatus.STITCHING,
    JobStatus.COMPLETED
];

export const getInitialGalleryItems = (): GalleryItem[] => [
    {
        id: 'vid_init_1',
        title: 'Borobudur Sunrise',
        thumbnailUrl: 'https://picsum.photos/seed/borobudur/400/225',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: '0:15',
        resolution: '1080p',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'Veo',
        scenes: [
            { id: 's1-1', thumbnailUrl: 'https://picsum.photos/seed/boro1/100/56', duration: 5, prompt: 'Wide shot of Borobudur temple at dawn.', ttsVolume: 100, type: 'video' },
            { id: 's1-2', thumbnailUrl: 'https://picsum.photos/seed/boro2/100/56', duration: 4, prompt: 'Close up on a stupa with the sun rising behind it.', ttsVolume: 90, type: 'video' },
            { id: 's1-3', thumbnailUrl: 'https://picsum.photos/seed/boro3/100/56', duration: 6, prompt: 'Drone pulling away from the temple complex.', ttsVolume: 100, type: 'video' },
        ],
        metadata: {
            totalDuration: '15s',
            fps: 24,
            resolution: '1920x1080',
            modelUsed: 'Veo 3',
            mode: 'Veo',
            date: new Date(Date.now() - 3600000).toLocaleDateString()
        },
        audioSettings: {
            musicTrack: 'cinematic-score.mp3',
            musicVolume: 70,
        }
    },
    {
        id: 'vid_init_2',
        title: 'Raja Ampat Drone Shot',
        thumbnailUrl: 'https://picsum.photos/seed/rajaampat/400/225',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        duration: '0:15',
        resolution: '1080p',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'Simulated',
        scenes: [
            { id: 's2-1', thumbnailUrl: 'https://picsum.photos/seed/raja1/100/56', duration: 7, prompt: 'Drone shot flying over the iconic karst islands of Raja Ampat.', ttsVolume: 100, type: 'video' },
            { id: 's2-2', thumbnailUrl: 'https://picsum.photos/seed/raja2/100/56', duration: 8, prompt: 'Underwater shot of coral reefs bustling with fish.', ttsVolume: 80, type: 'image' },
        ],
        metadata: {
            totalDuration: '15s',
            fps: 30,
            resolution: '1920x1080',
            modelUsed: 'Veo 3 + Imagen Fallback',
            mode: 'Simulated',
            date: new Date(Date.now() - 7200000).toLocaleDateString()
        },
        audioSettings: {
            musicTrack: 'ambient-waves.mp3',
            musicVolume: 85,
        }
    },
];


export const validateApiKey = (apiKey: string): Promise<{ valid: boolean, keyTail: string }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (apiKey && apiKey.startsWith('valid-key')) {
                resolve({ valid: true, keyTail: apiKey.slice(-4) });
            } else {
                resolve({ valid: false, keyTail: '' });
            }
        }, 1000);
    });
};

export const startSingleJob = (apiKey: string, params: GenerationParams): Promise<Job> => {
    return new Promise(resolve => {
        const jobId = `job_${Date.now()}`;
        const scriptTitle = params.scenes[0]?.prompt.substring(0, 50) || 'Untitled Scene';
        
        const newJob: Job = {
            id: jobId,
            status: JobStatus.QUEUED,
            progress: 0,
            eta: 120, // 2 minutes
            scriptTitle,
            generationParams: params,
        };
        
        mockJobs.set(jobId, newJob);
        mockJobProgress.set(jobId, { statusIndex: -1, progress: 0 }); // Start before 'PLANNING'
        
        setTimeout(() => {
            const job = mockJobs.get(jobId)!;
            job.status = JobStatus.PLANNING;
            mockJobs.set(jobId, job);
            mockJobProgress.set(jobId, { statusIndex: 0, progress: 0 });
        }, 1500);

        resolve(newJob);
    });
};

export const getJobStatus = (jobId: string): Promise<Job> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const job = mockJobs.get(jobId);
            if (!job) return reject('Job not found');

            const progressState = mockJobProgress.get(jobId)!;

            // FIX: Changed Job.FAILED to JobStatus.FAILED, as Job is a type and not a value.
            if (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) {
                return resolve(job);
            }

            progressState.progress += Math.random() * 15 + 5;
            job.progress = Math.min(100, Math.floor(progressState.progress));
            
            if (job.progress >= 100) {
                progressState.statusIndex++;
                const nextStatus = jobStatusesCycle[progressState.statusIndex];
                job.status = nextStatus;
                job.progress = 0;
                progressState.progress = 0;

                if(job.status === JobStatus.COMPLETED) {
                    job.progress = 100;
                    job.eta = 0;
                    
                    let hasImageFallback = false;
                    // FIX: Explicitly type `generatedScenes` as `Scene[]` to provide a contextual type for the object literal returned by the map function.
                    const generatedScenes: Scene[] = job.generationParams.scenes.map((sceneParam, index) => {
                        // Simulate video generation failure for some scenes if not in full simulation mode
                        const videoFailed = !job.generationParams.simulationMode && Math.random() < 0.2; // 20% chance of failure
                        if (videoFailed) {
                            hasImageFallback = true;
                        }
                        return {
                            id: `${jobId}-s${index + 1}`,
                            thumbnailUrl: `https://picsum.photos/seed/${jobId}s${index + 1}/100/56`,
                            duration: sceneParam.duration,
                            prompt: sceneParam.prompt,
                            ttsVolume: sceneParam.ttsVolume,
                            type: videoFailed ? 'image' : 'video',
                        };
                    });

                    const totalDuration = generatedScenes.reduce((acc, s) => acc + s.duration, 0);

                    const isSimulated = job.generationParams.simulationMode || hasImageFallback;
                    const modelUsed = job.generationParams.simulationMode 
                        ? 'Imagen-3 + Ken Burns' 
                        : hasImageFallback 
                            ? 'Veo 3 + Imagen Fallback' 
                            : 'Veo 3';

                    job.result = {
                        id: `vid_${jobId}`,
                        title: job.scriptTitle,
                        thumbnailUrl: `https://picsum.photos/seed/${jobId}/400/225`,
                        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                        duration: `0:${totalDuration < 10 ? '0' : ''}${totalDuration}`,
                        resolution: job.generationParams.resolution,
                        timestamp: new Date().toISOString(),
                        status: isSimulated ? 'Simulated' : 'Veo',
                        scenes: generatedScenes,
                        metadata: {
                            totalDuration: `${totalDuration}s`,
                            fps: job.generationParams.fps,
                            resolution: job.generationParams.resolution === '1080p' ? '1920x1080' : '1280x720',
                            modelUsed: modelUsed,
                            mode: isSimulated ? 'Simulated' : 'Veo',
                            date: new Date().toLocaleDateString()
                        },
                        audioSettings: {
                            musicTrack: job.generationParams.musicTrack,
                            musicVolume: job.generationParams.musicVolume,
                        }
                    };
                }
            }
            
            job.eta = Math.max(0, job.eta - 2);

            mockJobs.set(jobId, job);
            mockJobProgress.set(jobId, progressState);
            resolve({ ...job });
        }, 1000);
    });
};

export const getApiLimits = (apiKey: string): Promise<ApiLimit[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { service: 'Generative (Gemini)', limitPerMinute: 60, limitPerDay: 1500, usedToday: Math.floor(Math.random() * 500), source: 'estimated' },
                { service: 'Video (Veo)', limitPerMinute: 10, limitPerDay: 200, usedToday: Math.floor(Math.random() * 50), source: 'real' },
                { service: 'TTS', limitPerMinute: 300, limitPerDay: 10000, usedToday: Math.floor(Math.random() * 1000), source: 'estimated' }
            ]);
        }, 800);
    });
};