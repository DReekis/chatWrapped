'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeModeBadge from '@/components/SafeModeBadge';
import UploadForm from '@/components/UploadForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import SeoManager from '@/components/SeoManager';
import { AnalysisResult } from '@/lib/parseChat';
import { landingPageTitles } from '@/lib/sentiment_data';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentTitle, setCurrentTitle] = useState(0);

  // Rotate titles for A/B testing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitle((prev) => (prev + 1) % landingPageTitles.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
  };

  const handleReset = () => {
    setAnalysisResult(null);
  };

  // If we have results, show the results display
  if (analysisResult) {
    return (
      <>
        <SeoManager
          detectedLanguage={analysisResult.language.dominantLanguage}
          isResultsPage={true}
        />
        <ResultsDisplay result={analysisResult} onReset={handleReset} />
      </>
    );
  }

  return (
    <>
      <SeoManager />

      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 
        flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 -left-32 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          {/* Floating hearts */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl opacity-20"
              style={{
                left: `${10 + i * 15}%`,
                top: '80%'
              }}
              animate={{
                y: [0, -500],
                opacity: [0, 0.3, 0],
                rotate: [0, 360]
              }}
              transition={{
                duration: 8 + i,
                repeat: Infinity,
                delay: i * 2,
                ease: "easeOut"
              }}
            >
              {['💕', '❤️', '💜', '💗', '🩷', '💘'][i]}
            </motion.div>
          ))}
        </div>

        {/* Safe Mode Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <SafeModeBadge />
        </motion.div>

        {/* PRIVACY BANNER - Airplane Mode */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 w-full max-w-md"
        >
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">✈️</span>
              <div className="text-center">
                <p className="text-emerald-400 font-bold text-sm">Works in Airplane Mode</p>
                <p className="text-gray-400 text-xs">Your chats NEVER leave your phone</p>
              </div>
              <span className="text-2xl">🔒</span>
            </div>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8 relative z-10"
        >
          {/* Logo/Brand */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
              bg-white/5 border border-white/10 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-2xl">💬</span>
            <span className="text-sm font-medium text-gray-300">ChatWrapped 2026</span>
          </motion.div>

          {/* Main headline - Animated */}
          <div className="relative h-24 md:h-28 overflow-hidden mb-4">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentTitle}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="text-3xl md:text-5xl font-black text-white leading-tight"
              >
                {landingPageTitles[currentTitle]}
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg max-w-md mx-auto"
          >
            Upload your WhatsApp export. Find out who loves who more.
            <span className="text-emerald-400 font-medium"> 100% Private.</span>
          </motion.p>
        </motion.div>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-lg relative z-10"
        >
          <UploadForm onAnalysisComplete={handleAnalysisComplete} />
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex flex-wrap justify-center gap-4 text-sm text-gray-500"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            No data uploaded
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Works offline
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Open source
          </span>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-4 text-center text-xs text-gray-600"
        >
          Made with 💕 for Valentine&apos;s 2026
        </motion.footer>
      </main>
    </>
  );
}
