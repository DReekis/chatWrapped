'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Player, PlayerRef } from '@remotion/player';
import { IshqAuditVideo, IshqAuditVideoProps } from '@/remotion/IshqAuditVideo';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface VideoExporterProps {
    videoProps: IshqAuditVideoProps;
    onClose: () => void;
}

export default function VideoExporter({ videoProps, onClose }: VideoExporterProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'recording' | 'encoding' | 'done' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const playerRef = useRef<PlayerRef>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const framesRef = useRef<Blob[]>([]);

    const FPS = 30;
    const DURATION_FRAMES = 1200; // 40 seconds at 30fps
    const DURATION_SECONDS = DURATION_FRAMES / FPS;

    // Load FFmpeg
    const loadFFmpeg = useCallback(async () => {
        if (ffmpegRef.current) return ffmpegRef.current;

        setStatus('loading');
        setMessage('Loading video encoder...');

        const ffmpeg = new FFmpeg();

        ffmpeg.on('progress', ({ progress }) => {
            setProgress(Math.round(progress * 100));
        });

        ffmpeg.on('log', ({ message }) => {
            console.log('[FFmpeg]', message);
        });

        // Load FFmpeg core from CDN
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        ffmpegRef.current = ffmpeg;
        return ffmpeg;
    }, []);

    // Capture frames from the player
    const captureFrames = useCallback(async (): Promise<Blob[]> => {
        const player = playerRef.current;
        if (!player) throw new Error('Player not ready');

        const frames: Blob[] = [];
        const totalFrames = Math.min(DURATION_FRAMES, 900); // Cap at 30 seconds for performance

        setMessage('Recording video...');

        // Get the canvas from the player
        const playerElement = document.querySelector('.video-exporter-player');
        if (!playerElement) throw new Error('Player element not found');

        const canvas = playerElement.querySelector('canvas');
        if (!canvas) throw new Error('Canvas not found');

        // Create offscreen canvas for frame capture
        const offscreen = document.createElement('canvas');
        offscreen.width = 540; // Half size for performance
        offscreen.height = 960;
        const ctx = offscreen.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');

        // Capture frames by seeking through the video
        for (let frame = 0; frame < totalFrames; frame++) {
            // Seek to frame
            player.seekTo(frame);

            // Wait for render
            await new Promise(resolve => setTimeout(resolve, 50));

            // Draw canvas to offscreen
            ctx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);

            // Convert to blob
            const blob = await new Promise<Blob>((resolve, reject) => {
                offscreen.toBlob(
                    (b) => b ? resolve(b) : reject(new Error('Failed to create blob')),
                    'image/jpeg',
                    0.8
                );
            });

            frames.push(blob);
            setProgress(Math.round((frame / totalFrames) * 50)); // First 50% is recording

            // Update status every 30 frames
            if (frame % 30 === 0) {
                setMessage(`Recording: ${Math.round(frame / FPS)}s / ${Math.round(totalFrames / FPS)}s`);
            }
        }

        return frames;
    }, []);

    // Encode frames to MP4
    const encodeVideo = useCallback(async (frames: Blob[]) => {
        const ffmpeg = await loadFFmpeg();

        setStatus('encoding');
        setMessage('Encoding video...');
        setProgress(50);

        // Write frames to FFmpeg filesystem
        for (let i = 0; i < frames.length; i++) {
            const frameData = await fetchFile(frames[i]);
            await ffmpeg.writeFile(`frame${i.toString().padStart(5, '0')}.jpg`, frameData);

            if (i % 30 === 0) {
                setProgress(50 + Math.round((i / frames.length) * 40));
                setMessage(`Encoding: ${Math.round((i / frames.length) * 100)}%`);
            }
        }

        // Encode to MP4
        setMessage('Creating MP4...');
        await ffmpeg.exec([
            '-framerate', '30',
            '-i', 'frame%05d.jpg',
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-pix_fmt', 'yuv420p',
            '-crf', '28',
            'output.mp4'
        ]);

        // Read output
        const data = await ffmpeg.readFile('output.mp4');
        // Convert to Blob - slice the Uint8Array to get a proper ArrayBuffer
        const uint8Array = data as Uint8Array;
        const blob = new Blob([new Uint8Array(uint8Array)], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);

        // Cleanup
        for (let i = 0; i < frames.length; i++) {
            try {
                await ffmpeg.deleteFile(`frame${i.toString().padStart(5, '0')}.jpg`);
            } catch {
                // Ignore cleanup errors
            }
        }
        try {
            await ffmpeg.deleteFile('output.mp4');
        } catch {
            // Ignore
        }

        return url;
    }, [loadFFmpeg]);

    // Main export function
    const handleExport = useCallback(async () => {
        try {
            setStatus('loading');
            setProgress(0);

            // Load FFmpeg first
            await loadFFmpeg();

            setStatus('recording');

            // Capture frames
            const frames = await captureFrames();
            framesRef.current = frames;

            // Encode to MP4
            const url = await encodeVideo(frames);

            setDownloadUrl(url);
            setStatus('done');
            setProgress(100);
            setMessage('Video ready!');

        } catch (err) {
            console.error('Export failed:', err);
            setStatus('error');
            setMessage(err instanceof Error ? err.message : 'Export failed');
        }
    }, [loadFFmpeg, captureFrames, encodeVideo]);

    // Download the video
    const handleDownload = useCallback(() => {
        if (!downloadUrl) return;

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `ishq-audit-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, [downloadUrl]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        };
    }, [downloadUrl]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 
          flex items-center justify-center text-white transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <h2 className="text-2xl font-bold text-white mb-4">
                {status === 'done' ? '🎉 Video Ready!' : '🎬 Create Shareable Video'}
            </h2>

            {/* Remotion Player (hidden during export, visible for preview) */}
            <div className={`video-exporter-player rounded-2xl overflow-hidden shadow-2xl shadow-pink-500/20 
        ${status !== 'idle' && status !== 'done' ? 'opacity-50' : ''}`}>
                <Player
                    ref={playerRef}
                    component={IshqAuditVideo as unknown as React.ComponentType}
                    inputProps={videoProps as unknown as Record<string, unknown>}
                    durationInFrames={DURATION_FRAMES}
                    compositionWidth={1080}
                    compositionHeight={1920}
                    fps={FPS}
                    style={{
                        width: 270,
                        height: 480
                    }}
                    controls={status === 'idle' || status === 'done'}
                    loop
                />
            </div>

            {/* Progress */}
            {(status === 'loading' || status === 'recording' || status === 'encoding') && (
                <div className="w-full max-w-sm mt-6 space-y-2">
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <p className="text-center text-sm text-gray-400">{message}</p>
                    <p className="text-center text-xs text-gray-500">This may take a minute...</p>
                </div>
            )}

            {/* Error */}
            {status === 'error' && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                    <p className="text-red-400">{message}</p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="mt-2 text-sm text-white underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-6">
                {status === 'idle' && (
                    <motion.button
                        onClick={handleExport}
                        className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl 
              font-semibold text-white hover:opacity-90 transition-opacity"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        🎥 Create MP4 Video
                    </motion.button>
                )}

                {status === 'done' && downloadUrl && (
                    <motion.button
                        onClick={handleDownload}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl 
              font-semibold text-white hover:opacity-90 transition-opacity"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        📥 Download MP4
                    </motion.button>
                )}

                <motion.button
                    onClick={onClose}
                    className="px-6 py-4 bg-white/10 rounded-xl font-semibold text-white 
            hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {status === 'done' ? 'Done' : 'Cancel'}
                </motion.button>
            </div>

            <p className="text-gray-500 text-xs mt-4 max-w-md text-center">
                {status === 'idle'
                    ? 'Creates a 30-second MP4 video perfect for Instagram Stories & WhatsApp Status!'
                    : status === 'done'
                        ? 'Share your Ishq Audit video with friends! 💕'
                        : 'Please wait while we create your video...'}
            </p>
        </motion.div>
    );
}
