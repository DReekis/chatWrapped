'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SafeModeBadgeProps {
    className?: string;
}

export default function SafeModeBadge({ className = '' }: SafeModeBadgeProps) {
    const [isOnline, setIsOnline] = useState(true);
    const [showTip, setShowTip] = useState(false);

    useEffect(() => {
        // Check initial online status
        setIsOnline(navigator.onLine);

        // Listen for online/offline events
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div className={`relative inline-block ${className}`}>
            <motion.div
                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer
          ${isOnline
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                        : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    }`}
                onClick={() => setShowTip(!showTip)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Status indicator */}
                <motion.span
                    className={`w-2 h-2 rounded-full ${isOnline ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Shield icon */}
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                </svg>

                <span className="text-sm font-medium">
                    {isOnline ? 'Safe Mode' : '100% Private'}
                </span>
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
                {showTip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50"
                    >
                        <div className={`
              px-4 py-3 rounded-xl text-sm max-w-[280px] text-center
              backdrop-blur-xl shadow-2xl
              ${isOnline
                                ? 'bg-amber-950/90 border border-amber-500/20 text-amber-100'
                                : 'bg-emerald-950/90 border border-emerald-500/20 text-emerald-100'
                            }
            `}>
                            {isOnline ? (
                                <>
                                    <p className="font-semibold mb-1">🛡️ Your data never leaves your device</p>
                                    <p className="text-xs opacity-80">
                                        For <span className="font-bold">100% privacy</span>, turn off your internet.
                                        The app works completely offline!
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="font-semibold mb-1">✅ Maximum Privacy Mode</p>
                                    <p className="text-xs opacity-80">
                                        You&apos;re offline. Your chat stays on YOUR device only.
                                        Zero chance of any data transfer!
                                    </p>
                                </>
                            )}

                            {/* Arrow */}
                            <div className={`
                absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45
                ${isOnline ? 'bg-amber-950/90 border-l border-t border-amber-500/20' : 'bg-emerald-950/90 border-l border-t border-emerald-500/20'}
              `} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
