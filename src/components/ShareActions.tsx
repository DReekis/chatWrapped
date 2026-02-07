'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { domToPng } from 'modern-screenshot';

interface ShareActionsProps {
    scorecardRef: React.RefObject<HTMLDivElement | null>;
    onCreateVideo: () => void;
}

export default function ShareActions({ scorecardRef, onCreateVideo }: ShareActionsProps) {
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureSuccess, setCaptureSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Download image using modern-screenshot
    const handleDownloadImage = useCallback(async () => {
        setError(null);
        setCaptureSuccess(false);

        const targetElement = scorecardRef.current;

        if (!targetElement) {
            setError('Could not find content. Please try again.');
            return;
        }

        setIsCapturing(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 200));

            const dataUrl = await domToPng(targetElement, {
                scale: 2,
                backgroundColor: '#0a0a0a',
                style: { transform: 'none' }
            });

            const link = document.createElement('a');
            link.download = `ishq-audit-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setCaptureSuccess(true);
            setTimeout(() => setCaptureSuccess(false), 3000);

        } catch (err) {
            console.error('Screenshot failed:', err);
            setError('Screenshot failed. Try the video option!');
        } finally {
            setIsCapturing(false);
        }
    }, [scorecardRef]);

    // Share via Web Share API
    const handleShare = useCallback(async () => {
        setError(null);

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Ishq Audit 2026',
                    text: 'Check out my relationship analysis! 💕',
                    url: window.location.href
                });
            } catch {
                // User cancelled
            }
        } else {
            try {
                await navigator.clipboard.writeText('Check out Ishq Audit! 💕 https://ishq-audit.vercel.app');
                setCaptureSuccess(true);
                setTimeout(() => setCaptureSuccess(false), 3000);
            } catch {
                setError('Could not copy link.');
            }
        }
    }, []);

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Error message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs text-center bg-red-500/10 rounded-lg py-1.5 px-2"
                >
                    ⚠️ {error}
                </motion.div>
            )}

            {/* Success message */}
            {captureSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-400 text-xs text-center bg-green-500/10 rounded-lg py-1.5 px-2"
                >
                    ✅ Done!
                </motion.div>
            )}

            {/* Create Video Button - Primary Action */}
            <motion.button
                onClick={onCreateVideo}
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl 
          font-semibold text-white hover:opacity-90 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <span className="flex items-center justify-center gap-2">
                    🎥 Create Video
                </span>
            </motion.button>

            {/* Secondary Actions Row */}
            <div className="flex gap-2">
                {/* Screenshot Button */}
                <motion.button
                    onClick={handleDownloadImage}
                    disabled={isCapturing}
                    className="flex-1 py-2.5 px-3 bg-white/10 rounded-xl font-medium text-white text-sm
            hover:bg-white/20 transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isCapturing ? '...' : '📸 Image'}
                </motion.button>

                {/* Share Button */}
                <motion.button
                    onClick={handleShare}
                    className="flex-1 py-2.5 px-3 bg-white/10 rounded-xl font-medium text-white text-sm
            hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    🔗 Share
                </motion.button>
            </div>
        </div>
    );
}
