'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseChat, AnalysisResult, CustomNicknames, extractFromZip, isZipFile } from '@/lib/parseChat';

interface UploadFormProps {
    onAnalysisComplete: (result: AnalysisResult) => void;
}

export default function UploadForm({ onAnalysisComplete }: UploadFormProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [partnerANicknames, setPartnerANicknames] = useState('');
    const [partnerBNicknames, setPartnerBNicknames] = useState('');
    const [showHelpModal, setShowHelpModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback(async (file: File) => {
        setIsProcessing(true);
        setError(null);

        try {
            let content: string;

            // Handle ZIP files
            if (isZipFile(file)) {
                content = await extractFromZip(file);
            } else if (file.name.endsWith('.txt')) {
                content = await file.text();
            } else {
                throw new Error('Please upload a .txt or .zip file (WhatsApp export)');
            }

            // Parse custom nicknames
            const customNicknames: CustomNicknames = {
                partnerA_Nicknames: partnerANicknames
                    .split(',')
                    .map(n => n.trim())
                    .filter(n => n.length > 0),
                partnerB_Nicknames: partnerBNicknames
                    .split(',')
                    .map(n => n.trim())
                    .filter(n => n.length > 0)
            };

            // Parse the chat
            const result = parseChat(content, customNicknames);
            onAnalysisComplete(result);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process chat');
        } finally {
            setIsProcessing(false);
        }
    }, [partnerANicknames, partnerBNicknames, onAnalysisComplete]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, [processFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    }, [processFile]);

    return (
        <div className="w-full max-w-lg mx-auto space-y-6">
            {/* Nickname Inputs */}
            <div className="space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <span className="text-pink-400">💕</span> What do you call them?
                    </label>
                    <input
                        type="text"
                        value={partnerANicknames}
                        onChange={(e) => setPartnerANicknames(e.target.value)}
                        placeholder="e.g., Babu, Shona, Monkey"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
              text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50
              focus:ring-2 focus:ring-pink-500/20 transition-all"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <span className="text-purple-400">💜</span> What do they call you?
                    </label>
                    <input
                        type="text"
                        value={partnerBNicknames}
                        onChange={(e) => setPartnerBNicknames(e.target.value)}
                        placeholder="e.g., Jaan, Cutie, Pookie"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
              text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50
              focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                </motion.div>
            </div>

            {/* Drop Zone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-8
          transition-all duration-300 overflow-hidden
          ${isDragOver
                        ? 'border-pink-500 bg-pink-500/10 scale-[1.02]'
                        : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                    }
          ${isProcessing ? 'pointer-events-none' : ''}
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.zip"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="text-center">
                    {isProcessing ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            {/* Loading spinner */}
                            <motion.div
                                className="w-16 h-16 mx-auto border-4 border-pink-500/30 border-t-pink-500 rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <p className="text-gray-300">Analyzing your love story...</p>
                            <div className="flex justify-center gap-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.span
                                        key={i}
                                        className="text-2xl"
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{
                                            duration: 0.6,
                                            repeat: Infinity,
                                            delay: i * 0.1
                                        }}
                                    >
                                        💕
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            {/* Upload icon */}
                            <motion.div
                                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 
                  flex items-center justify-center"
                                animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
                            >
                                <svg
                                    className="w-10 h-10 text-pink-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                            </motion.div>

                            <h3 className="text-xl font-semibold text-white mb-2">
                                {isDragOver ? 'Drop it like it\'s hot! 🔥' : 'Upload WhatsApp Chat'}
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Drag & drop your <code className="text-pink-400">.txt</code> or{' '}
                                <code className="text-purple-400">.zip</code> file here
                            </p>

                            {/* How to export hint */}
                            <div className="text-xs text-gray-500 bg-white/5 rounded-lg px-4 py-2 inline-block">
                                <span className="text-gray-400">WhatsApp →</span> Chat →
                                <span className="text-gray-400"> More</span> → Export Chat →
                                <span className="text-emerald-400"> Without Media</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Animated background gradient */}
                <motion.div
                    className="absolute inset-0 -z-10 opacity-50"
                    animate={{
                        background: [
                            'radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.1), transparent 50%)',
                            'radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1), transparent 50%)',
                            'radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.1), transparent 50%)'
                        ]
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                />
            </motion.div>

            {/* Help link */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowHelpModal(true);
                }}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
                🤔 Help: Can&apos;t find the file?
            </motion.button>

            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 
              text-red-400 text-sm text-center"
                    >
                        ⚠️ {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Help Modal */}
            <AnimatePresence>
                {showHelpModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowHelpModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4"
                        >
                            <h3 className="text-xl font-bold text-white">How to Export Chat</h3>

                            {/* iOS Instructions */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">📱</span>
                                    <span className="font-semibold text-white">iPhone / iOS</span>
                                </div>
                                <ol className="text-sm text-gray-400 space-y-1 ml-8 list-decimal">
                                    <li>Open the chat in WhatsApp</li>
                                    <li>Tap the contact name at top</li>
                                    <li>Scroll down → <span className="text-pink-400">Export Chat</span></li>
                                    <li>Select <span className="text-emerald-400">&quot;Without Media&quot;</span></li>
                                    <li>Save to <span className="text-blue-400">Files</span> (not WhatsApp!)</li>
                                </ol>
                            </div>

                            {/* Android Instructions */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🤖</span>
                                    <span className="font-semibold text-white">Android</span>
                                </div>
                                <ol className="text-sm text-gray-400 space-y-1 ml-8 list-decimal">
                                    <li>Open the chat in WhatsApp</li>
                                    <li>Tap ⋮ menu → <span className="text-pink-400">More</span> → <span className="text-pink-400">Export Chat</span></li>
                                    <li>Select <span className="text-emerald-400">&quot;Without Media&quot;</span></li>
                                    <li>Save to <span className="text-blue-400">Drive</span> or <span className="text-blue-400">Downloads</span></li>
                                </ol>
                            </div>

                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="w-full py-3 bg-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-colors"
                            >
                                Got it! 👍
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
