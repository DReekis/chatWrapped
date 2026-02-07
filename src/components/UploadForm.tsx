'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseChat, AnalysisResult, CustomNicknames, extractFromZip, isZipFile } from '@/lib/parseChat';

interface UploadFormProps {
    onAnalysisComplete: (result: AnalysisResult) => void;
}

export default function UploadForm({ onAnalysisComplete }: UploadFormProps) {
    const [step, setStep] = useState(1); // 1: Upload, 2: Optional nicknames (skip-able)
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [partnerANicknames, setPartnerANicknames] = useState('');
    const [partnerBNicknames, setPartnerBNicknames] = useState('');
    const [showHelpModal, setShowHelpModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback(async (file: File, skipNicknames = false) => {
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
            setStep(1);
        } finally {
            setIsProcessing(false);
        }
    }, [partnerANicknames, partnerBNicknames, onAnalysisComplete]);

    const handleFileUpload = useCallback((file: File) => {
        setPendingFile(file);
        setStep(2); // Go to nicknames step
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    }, [handleFileUpload]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
    }, [handleFileUpload]);

    const handleAnalyze = () => {
        if (pendingFile) {
            processFile(pendingFile);
        }
    };

    const handleSkip = () => {
        if (pendingFile) {
            processFile(pendingFile, true);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto space-y-6">
            {/* Step Indicator */}
            <div className="flex justify-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full transition-colors ${step >= 1 ? 'bg-pink-500' : 'bg-white/20'}`} />
                <div className={`w-3 h-3 rounded-full transition-colors ${step >= 2 ? 'bg-pink-500' : 'bg-white/20'}`} />
            </div>

            <AnimatePresence mode="wait">
                {/* STEP 1: Upload */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        {/* Simple instruction */}
                        <div className="text-center mb-4">
                            <p className="text-white text-lg font-medium">Step 1: Upload your chat</p>
                            <p className="text-gray-400 text-sm">Export from WhatsApp (without media)</p>
                        </div>

                        {/* Drop Zone */}
                        <motion.div
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
                                    {isDragOver ? 'Drop it here! 🔥' : 'Tap to upload'}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    <code className="text-pink-400">.txt</code> or{' '}
                                    <code className="text-purple-400">.zip</code> file
                                </p>
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

                        {/* How to export - Simplified */}
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <p className="text-sm text-gray-400 mb-2">📱 How to export:</p>
                            <p className="text-xs text-gray-500">
                                WhatsApp → Open chat → <span className="text-pink-400">⋮ More</span> →
                                <span className="text-pink-400"> Export Chat</span> →
                                <span className="text-emerald-400"> Without Media</span>
                            </p>
                        </div>

                        {/* Help link */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowHelpModal(true);
                            }}
                            className="w-full text-center text-sm text-gray-500 hover:text-gray-400 transition-colors"
                        >
                            🤔 Need detailed help?
                        </button>
                    </motion.div>
                )}

                {/* STEP 2: Nicknames (Optional) */}
                {step === 2 && !isProcessing && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                    >
                        {/* Header */}
                        <div className="text-center mb-4">
                            <p className="text-white text-lg font-medium">Step 2: Pet names (optional)</p>
                            <p className="text-gray-400 text-sm">
                                Help us count how often you call each other cute names
                            </p>
                        </div>

                        {/* Success badge */}
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
                            <span className="text-emerald-400 text-sm">✓ Chat uploaded: </span>
                            <span className="text-white text-sm font-medium">{pendingFile?.name}</span>
                        </div>

                        {/* Nickname Inputs with better labels */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    💕 What cute names do <span className="text-pink-400">you</span> call them?
                                </label>
                                <input
                                    type="text"
                                    value={partnerANicknames}
                                    onChange={(e) => setPartnerANicknames(e.target.value)}
                                    placeholder="babu, shona, baby, jaan"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                                        text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50
                                        focus:ring-2 focus:ring-pink-500/20 transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    💜 What cute names do <span className="text-purple-400">they</span> call you?
                                </label>
                                <input
                                    type="text"
                                    value={partnerBNicknames}
                                    onChange={(e) => setPartnerBNicknames(e.target.value)}
                                    placeholder="cutie, pookie, love"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                                        text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50
                                        focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <motion.button
                                onClick={handleSkip}
                                className="flex-1 py-3 bg-white/10 rounded-xl text-gray-300 font-medium 
                                    hover:bg-white/20 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Skip →
                            </motion.button>
                            <motion.button
                                onClick={handleAnalyze}
                                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl 
                                    text-white font-bold hover:opacity-90 transition-opacity"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Analyze 💕
                            </motion.button>
                        </div>

                        {/* Back button */}
                        <button
                            onClick={() => setStep(1)}
                            className="w-full text-center text-sm text-gray-500 hover:text-gray-400 transition-colors"
                        >
                            ← Upload different file
                        </button>
                    </motion.div>
                )}

                {/* Processing State */}
                {isProcessing && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12 space-y-4"
                    >
                        {/* Loading spinner */}
                        <motion.div
                            className="w-20 h-20 mx-auto border-4 border-pink-500/30 border-t-pink-500 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-white text-lg font-medium">Analyzing your love story...</p>
                        <p className="text-gray-400 text-sm">This usually takes a few seconds</p>
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
                )}
            </AnimatePresence>

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
                                    <li>Save to <span className="text-blue-400">Files</span></li>
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
                                    <li>Save to <span className="text-blue-400">Downloads</span></li>
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
