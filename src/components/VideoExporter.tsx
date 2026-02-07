'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Player, PlayerRef } from '@remotion/player';
import { IshqAuditVideo, IshqAuditVideoProps } from '@/remotion/IshqAuditVideo';

interface VideoExporterProps {
    videoProps: IshqAuditVideoProps;
    onClose: () => void;
}

export default function VideoExporter({ videoProps, onClose }: VideoExporterProps) {
    const [status, setStatus] = useState<'idle' | 'recording' | 'done' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [mimeType, setMimeType] = useState<string>('video/webm');

    const playerRef = useRef<PlayerRef>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const FPS = 30;
    const DURATION_FRAMES = 1500; // 50 seconds at 30fps
    const DURATION_SECONDS = DURATION_FRAMES / FPS;

    // Determine supported mime type
    useEffect(() => {
        const types = [
            'video/mp4',
            'video/webm;codecs=h264',
            'video/webm',
            'video/x-matroska'
        ];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                setMimeType(type);
                break;
            }
        }
    }, []);

    // Start recording
    const startRecording = useCallback(() => {
        const player = playerRef.current;
        if (!player) return;

        try {
            setStatus('recording');
            setMessage('Getting ready...');
            setProgress(0);

            // Find canvas
            const playerElement = document.querySelector('.video-exporter-player');
            const canvas = playerElement?.querySelector('canvas');
            if (!canvas) throw new Error('Could not find video canvas');

            // Get stream
            const stream = canvas.captureStream(30); // 30 FPS

            // Setup recorder
            const recorder = new MediaRecorder(stream, {
                mimeType,
                videoBitsPerSecond: 5000000 // 5 Mbps
            });

            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                setDownloadUrl(url);
                setStatus('done');
                setMessage('Video ready!');

                // Stop player
                player.pause();
            };

            mediaRecorderRef.current = recorder;

            // Start everything
            player.seekTo(0);
            recorder.start();
            player.play();
            setMessage('Recording your story...');

            // Monitor progress
            const checkProgress = setInterval(() => {
                const currentFrame = player.getCurrentFrame();
                const progressPercent = Math.min(99, Math.round((currentFrame / DURATION_FRAMES) * 100));
                setProgress(progressPercent);

                if (currentFrame >= DURATION_FRAMES) {
                    clearInterval(checkProgress);
                    recorder.stop();
                    player.pause();
                }
            }, 100);

            // Safety timeout
            setTimeout(() => {
                clearInterval(checkProgress);
                if (recorder.state === 'recording') {
                    recorder.stop();
                }
            }, (DURATION_SECONDS + 2) * 1000);

        } catch (err) {
            console.error('Recording failed:', err);
            setStatus('error');
            setMessage('Failed to start recording. Please try screen recording manually.');
        }
    }, [mimeType, DURATION_FRAMES, DURATION_SECONDS]);

    // Download the video
    const handleDownload = useCallback(() => {
        if (!downloadUrl) return;

        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `chatwrapped-${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, [downloadUrl, mimeType]);

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
                disabled={status === 'recording'}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <h2 className="text-2xl font-bold text-white mb-4">
                {status === 'done' ? '🎉 Video Ready!' : '🎬 Share Your ChatWrapped'}
            </h2>

            {/* Remotion Player */}
            <div className={`video-exporter-player rounded-2xl overflow-hidden shadow-2xl shadow-pink-500/20 relative
                ${status === 'recording' ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-black' : ''}
            `}>
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
                    loop={status !== 'recording'}
                />

                {/* Recording Overlay */}
                {status === 'recording' && (
                    <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 backdrop-blur px-2 py-1 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-mono text-white">REC</span>
                    </div>
                )}
            </div>

            {/* Progress */}
            {status === 'recording' && (
                <div className="w-full max-w-sm mt-6 space-y-2">
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-pink-500 to-red-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <p className="text-center text-sm text-gray-400">{message}</p>
                    <p className="text-center text-xs text-gray-500">Please keep this window open</p>
                </div>
            )}

            {/* Error */}
            {status === 'error' && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center max-w-sm">
                    <p className="text-red-400 mb-2">⚠️ {message}</p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="px-4 py-2 bg-white/10 rounded-lg text-sm text-white hover:bg-white/20"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-6">
                {status === 'idle' && (
                    <motion.button
                        onClick={startRecording}
                        className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl 
              font-semibold text-white hover:opacity-90 transition-opacity flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span>🎥</span>
                        <span>Start Recording</span>
                    </motion.button>
                )}

                {status === 'done' && downloadUrl && (
                    <motion.button
                        onClick={handleDownload}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl 
              font-semibold text-white hover:opacity-90 transition-opacity flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span>📥</span>
                        <span>Download Video</span>
                    </motion.button>
                )}

                {status !== 'recording' && (
                    <motion.button
                        onClick={onClose}
                        className="px-6 py-4 bg-white/10 rounded-xl font-semibold text-white 
            hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {status === 'done' ? 'Done' : 'Cancel'}
                    </motion.button>
                )}
            </div>

            <p className="text-gray-500 text-xs mt-4 max-w-md text-center">
                {status === 'idle'
                    ? 'Records the video in real-time for high quality export.'
                    : status === 'done'
                        ? `Saved as ${mimeType.includes('mp4') ? 'MP4' : 'WebM'}. Works best on laptop/desktop.`
                        : 'Recording in progress... Make sure sound is on!'}
            </p>
        </motion.div>
    );
}
