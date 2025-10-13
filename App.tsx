import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { KeyPanel } from './components/KeyPanel';
import { ScriptForm } from './components/ScriptForm';
import { QueuePanel } from './components/QueuePanel';
import { Gallery } from './components/Gallery';
import { ConsoleLog } from './components/ConsoleLog';
import { PreviewPanel } from './components/PreviewPanel';
import { LimitsPanel } from './components/LimitsPanel';
import type { Job, GalleryItem, ApiLimit, GenerationParams } from './types';
import { JobStatus, ModelStatus } from './types';
import { Background } from './components/Background';
import * as MockApiService from './services/mockApiService';

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>('');
    const [apiKeyStatus, setApiKeyStatus] = useState<'invalid' | 'valid' | 'validating' | 'idle'>('idle');
    const [activeKeyTail, setActiveKeyTail] = useState<string>('');
    const [modelStatus, setModelStatus] = useState<ModelStatus>(ModelStatus.AVAILABLE);

    const [jobs, setJobs] = useState<Job[]>([]);
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(MockApiService.getInitialGalleryItems());
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(galleryItems[0] || null);
    const [logs, setLogs] = useState<string[]>(['Welcome to VEO3 Grid Nusantara. Console ready.']);
    const [apiLimits, setApiLimits] = useState<ApiLimit[]>([]);

    const addLog = useCallback((message: string) => {
        setLogs(prev => [...prev.slice(-100), `${new Date().toLocaleTimeString()} - ${message}`]);
    }, []);

    const handleApiKeyValidate = useCallback(async (key: string) => {
        if (!key) return;
        setApiKeyStatus('validating');
        addLog(`Validating API key...`);
        const { valid, keyTail } = await MockApiService.validateApiKey(key);
        if (valid) {
            setApiKey(key);
            setApiKeyStatus('valid');
            setActiveKeyTail(keyTail);
            addLog(`API Key validated successfully. Active key: ****${keyTail}`);
            fetchApiLimits(key);
        } else {
            setApiKey('');
            setApiKeyStatus('invalid');
            setActiveKeyTail('');
            addLog('API Key validation failed. Please check your key and try again.');
        }
    }, [addLog]);

    const fetchApiLimits = useCallback(async (key: string) => {
        if(!key) return;
        addLog('Fetching API limits...');
        const limits = await MockApiService.getApiLimits(key);
        setApiLimits(limits);
        addLog('API limits updated.');
    }, [addLog]);

    const handleGenerate = useCallback(async (params: GenerationParams) => {
        if (apiKeyStatus !== 'valid') {
            addLog('Error: Cannot start generation. API Key is not valid.');
            return;
        }
        addLog(`Starting new generation job for scene: "${params.scenes[0]?.prompt.substring(0, 30)}..."`);
        const newJob = await MockApiService.startSingleJob(apiKey, params);
        setJobs(prev => [newJob, ...prev]);
        addLog(`Job ${newJob.id} enqueued. Status: ${newJob.status}`);
    }, [apiKey, apiKeyStatus, addLog]);

    const handleUpdateItem = useCallback((updatedItem: GalleryItem) => {
        setGalleryItems(prevItems =>
            prevItems.map(item => (item.id === updatedItem.id ? updatedItem : item))
        );
        if (selectedItem?.id === updatedItem.id) {
            setSelectedItem(updatedItem);
        }
        addLog(`Changes saved for video: "${updatedItem.title}".`);
    }, [selectedItem, addLog]);

    useEffect(() => {
        const interval = setInterval(() => {
            const activeJobs = jobs.filter(j => j.status !== JobStatus.COMPLETED && j.status !== JobStatus.FAILED);
            if (activeJobs.length > 0) {
                activeJobs.forEach(async job => {
                    const updatedJob = await MockApiService.getJobStatus(job.id);
                    setJobs(prevJobs => prevJobs.map(j => j.id === updatedJob.id ? updatedJob : j));

                    if (job.status !== updatedJob.status) {
                        addLog(`Job ${job.id} status changed to ${updatedJob.status}. Progress: ${updatedJob.progress}%`);
                    }

                    if (updatedJob.status === JobStatus.COMPLETED && updatedJob.result) {
                        addLog(`Job ${job.id} completed! Adding to gallery.`);
                        setGalleryItems(prev => [updatedJob.result!, ...prev]);
                        // Auto-select the newly created item
                        setSelectedItem(updatedJob.result!);
                        // Refresh limits after a successful generation
                        fetchApiLimits(apiKey);
                    } else if (updatedJob.status === JobStatus.FAILED) {
                         addLog(`Job ${job.id} failed. Error: ${updatedJob.error}`);
                    }
                });
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [jobs, addLog, apiKey, fetchApiLimits]);

    return (
        <div className="bg-gray-900 text-gray-200 font-sans min-h-screen">
            <Background />
            <Header modelStatus={modelStatus} />
            <main className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[calc(100vh-64px)] p-4 relative z-10">
                <aside className="col-span-12 md:col-span-3 flex flex-col space-y-4 overflow-y-auto bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50">
                    <KeyPanel 
                        onValidate={handleApiKeyValidate} 
                        status={apiKeyStatus} 
                        activeKeyTail={activeKeyTail}
                    />
                    <ScriptForm onGenerate={handleGenerate} isDisabled={apiKeyStatus !== 'valid'} />
                    <QueuePanel jobs={jobs} />
                </aside>
                <section className="col-span-12 md:col-span-5 flex flex-col overflow-hidden gap-4">
                    <div className="flex-1 overflow-y-auto bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50">
                        <Gallery items={galleryItems} onSelectItem={setSelectedItem} selectedItemId={selectedItem?.id} />
                    </div>
                    <div className="h-48 md:h-40 bg-black/30 backdrop-blur-sm rounded-lg border border-gray-700/50">
                        <ConsoleLog logs={logs} />
                    </div>
                </section>
                <section className="col-span-12 md:col-span-4 h-full hidden md:flex flex-col">
                   <div className="sticky top-0 h-[calc(100vh-80px)] flex flex-col gap-4">
                       <PreviewPanel item={selectedItem} onUpdateItem={handleUpdateItem} />
                       <LimitsPanel limits={apiLimits} onRefresh={() => fetchApiLimits(apiKey)} />
                   </div>
                </section>
            </main>
        </div>
    );
};

export default App;