'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult } from '@/lib/parseChat';
import { languageNames } from '@/lib/sentiment_data';
import ShareActions from './ShareActions';
import VideoExporter from './VideoExporter';
import { IshqAuditVideoProps } from '@/remotion/IshqAuditVideo';

interface ResultsDisplayProps {
    result: AnalysisResult;
    onReset: () => void;
}

export default function ResultsDisplay({ result, onReset }: ResultsDisplayProps) {
    const [currentScene, setCurrentScene] = useState(0);
    const [showVideoExporter, setShowVideoExporter] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const scorecardRef = useRef<HTMLDivElement>(null);
    const storyContainerRef = useRef<HTMLDivElement>(null);

    // Calculate who is the "simp" (sends more messages)
    const users = Object.entries(result.messagesByUser);
    const [topUser, topCount] = users.sort((a, b) => b[1] - a[1])[0] || ['Partner A', 0];
    const [otherUser, otherCount] = users[1] || ['Partner B', 0];
    const simpPercentage = Math.round((topCount / result.totalMessages) * 100);

    // Get top nicknames
    const topNicknames = Object.entries(result.nicknameCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // Deep stats
    const deepStats = result.deepStats;
    const yapperName = (deepStats?.longMessageByUser?.[result.partnerA] || 0) >
        (deepStats?.longMessageByUser?.[result.partnerB] || 0) ? result.partnerA : result.partnerB;
    const dryTexterName = (deepStats?.dryTextByUser?.[result.partnerA] || 0) >
        (deepStats?.dryTextByUser?.[result.partnerB] || 0) ? result.partnerA : result.partnerB;

    // Determine relationship verdict
    const getVerdict = () => {
        if (result.nightOwlScore > 30) return { text: "Certified Vampires 🧛", color: "text-purple-400" };
        if (result.sentimentStats.romance > result.sentimentStats.fight * 3) return { text: "Certified Soulmates 💕", color: "text-pink-400" };
        if (result.sentimentStats.fight > result.sentimentStats.romance) return { text: "Drama Kings & Queens 👑", color: "text-orange-400" };
        if (result.sentimentStats.food > 50) return { text: "Foodies in Love 🍕", color: "text-yellow-400" };
        return { text: "Madly in Love 💘", color: "text-pink-400" };
    };

    const verdict = getVerdict();

    const scenes = [
        // Scene 0: Intro
        {
            id: 'intro',
            content: (
                <motion.div
                    key="intro"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="text-center space-y-4"
                >
                    <motion.h1
                        className="text-5xl md:text-7xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 
              bg-clip-text text-transparent"
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ backgroundSize: '200% 200%' }}
                    >
                        CHATWRAPPED
                    </motion.h1>
                    <motion.p
                        className="text-2xl text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        2026
                    </motion.p>
                    <motion.div
                        className="text-6xl"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                    >
                        💕
                    </motion.div>
                </motion.div>
            )
        },
        // Scene 1: The Simp Meter
        {
            id: 'simp-meter',
            content: (
                <motion.div
                    key="simp"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="space-y-6"
                >
                    <h2 className="text-3xl font-bold text-center text-white">
                        The Simp Meter 📊
                    </h2>

                    <div className="space-y-4">
                        {/* Top sender bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-300">{topUser}</span>
                                <span className="text-pink-400 font-bold">{topCount.toLocaleString()} msgs</span>
                            </div>
                            <div className="h-8 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${simpPercentage}%` }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                />
                            </div>
                        </div>

                        {/* Other sender bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-300">{otherUser}</span>
                                <span className="text-purple-400 font-bold">{otherCount.toLocaleString()} msgs</span>
                            </div>
                            <div className="h-8 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${100 - simpPercentage}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                        </div>
                    </div>

                    <motion.p
                        className="text-center text-xl font-semibold text-pink-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        {simpPercentage > 55
                            ? `${topUser} is the certified simp 🥺`
                            : "Perfectly balanced, as all things should be ⚖️"}
                    </motion.p>
                </motion.div>
            )
        },
        // Scene 2: Texter Type (NEW)
        {
            id: 'texter-type',
            content: (
                <motion.div
                    key="texter"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center space-y-6"
                >
                    <h2 className="text-3xl font-bold text-white">The Texter Type 📱</h2>

                    <div className="space-y-4">
                        {/* Yapper */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30"
                        >
                            <span className="text-4xl">🗣️</span>
                            <h3 className="text-xl font-bold text-purple-400 mt-2">The Yapper</h3>
                            <p className="text-white font-semibold">{yapperName}</p>
                            <p className="text-gray-400 text-sm">
                                {deepStats?.longMessageByUser?.[yapperName] || 0} long messages (50+ words)
                            </p>
                        </motion.div>

                        {/* Dry Texter */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-orange-500/20 rounded-xl p-4 border border-orange-500/30"
                        >
                            <span className="text-4xl">🌵</span>
                            <h3 className="text-xl font-bold text-orange-400 mt-2">The Dry Texter</h3>
                            <p className="text-white font-semibold">{dryTexterName}</p>
                            <p className="text-gray-400 text-sm">
                                {deepStats?.dryTextByUser?.[dryTexterName] || 0} short replies (&lt;3 words)
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            )
        },
        // Scene 3: Nickname Exposé
        {
            id: 'nickname',
            content: (
                <motion.div
                    key="nickname"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center space-y-6"
                >
                    <h2 className="text-3xl font-bold text-white">
                        The Nickname Exposé 🙈
                    </h2>

                    <div className="space-y-4">
                        {topNicknames.length > 0 ? (
                            topNicknames.map(([nickname, count], index) => (
                                <motion.div
                                    key={nickname}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.3 }}
                                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                                >
                                    <span className="text-2xl text-pink-400">&quot;{nickname}&quot;</span>
                                    <p className="text-gray-400 mt-1">
                                        used <span className="text-white font-bold text-xl">{count}</span> times
                                    </p>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-gray-400">No special nicknames detected 😢</p>
                        )}
                    </div>
                </motion.div>
            )
        },
        // Scene 4: Night Owl
        {
            id: 'night-owl',
            content: (
                <motion.div
                    key="nightowl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-6"
                >
                    <motion.div
                        className="text-8xl"
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {result.nightOwlScore > 20 ? '🧛' : '☀️'}
                    </motion.div>

                    <h2 className="text-3xl font-bold text-white">
                        {result.nightOwlScore > 20 ? 'Vampire Couple' : 'Early Birds'}
                    </h2>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <p className="text-5xl font-black text-purple-400">
                            {result.nightOwlScore}%
                        </p>
                        <p className="text-gray-400 mt-2">
                            of your texts are between 1-5 AM
                        </p>
                    </div>

                    <p className="text-gray-300">
                        {result.nightOwlScore > 20
                            ? "Sleep is for the weak when you have love! 🦇"
                            : "Healthy sleep schedule = Healthy relationship? 🤔"}
                    </p>
                </motion.div>
            )
        },
        // Scene 5: Ghost (NEW)
        {
            id: 'ghost',
            content: (
                <motion.div
                    key="ghost"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-6"
                >
                    <motion.div
                        className="text-8xl"
                        animate={{
                            y: [0, -30, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        👻
                    </motion.div>

                    <h2 className="text-3xl font-bold text-white">The Ghost 👀</h2>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <p className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {deepStats?.ghostingScore || 0}
                        </p>
                        <p className="text-gray-400 mt-2">
                            times left on delivered for 4+ hours
                        </p>
                    </div>

                    <p className="text-gray-300">
                        {(deepStats?.ghostingScore || 0) > 20
                            ? "Busy or just avoiding? 🤔"
                            : "Quick repliers! That's rare 💚"}
                    </p>
                </motion.div>
            )
        },
        // Scene 6: Red Flag Counter
        {
            id: 'red-flag',
            content: (
                <motion.div
                    key="red-flag"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                >
                    <motion.div
                        className="text-7xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                    >
                        🚩
                    </motion.div>

                    <h2 className="text-3xl font-bold text-white">Red Flag Counter</h2>

                    <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-6 border border-red-500/30">
                        <p className="text-6xl font-black text-red-400">
                            {result.viralStats?.redFlagCount || 0}
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                            suspicious messages detected
                        </p>
                    </div>

                    <div className="flex justify-center gap-4 text-sm">
                        <div className="bg-white/5 rounded-lg px-3 py-2">
                            <span className="text-gray-400">{result.partnerA.split(' ')[0]}:</span>
                            <span className="text-red-400 font-bold ml-1">
                                {result.viralStats?.redFlagByUser?.[result.partnerA] || 0}
                            </span>
                        </div>
                        <div className="bg-white/5 rounded-lg px-3 py-2">
                            <span className="text-gray-400">{result.partnerB.split(' ')[0]}:</span>
                            <span className="text-red-400 font-bold ml-1">
                                {result.viralStats?.redFlagByUser?.[result.partnerB] || 0}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )
        },
        // Scene 7: Apology Olympics
        {
            id: 'apology',
            content: (
                <motion.div
                    key="apology"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="text-7xl">🏆</div>

                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        Apology Olympics
                    </h2>

                    <div className="flex justify-center gap-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 min-w-[100px]">
                            <p className="text-xs text-gray-400">{result.partnerA.split(' ')[0]}</p>
                            <p className="text-3xl font-black text-blue-400">
                                {result.viralStats?.apologyByUser?.[result.partnerA] || 0}
                            </p>
                        </div>
                        <div className="self-center text-gray-500 text-lg">vs</div>
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 min-w-[100px]">
                            <p className="text-xs text-gray-400">{result.partnerB.split(' ')[0]}</p>
                            <p className="text-3xl font-black text-purple-400">
                                {result.viralStats?.apologyByUser?.[result.partnerB] || 0}
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm italic">
                        {(() => {
                            const aCount = result.viralStats?.apologyByUser?.[result.partnerA] || 0;
                            const bCount = result.viralStats?.apologyByUser?.[result.partnerB] || 0;
                            const ratio = Math.max(aCount, bCount) / Math.max(Math.min(aCount, bCount), 1);
                            if (ratio > 5) return "The math ain't mathing... 🤔";
                            if (ratio > 2) return "Someone's carrying the relationship 💀";
                            return "Balanced, as all things should be ⚖️";
                        })()}
                    </p>
                </motion.div>
            )
        },
        // Scene 8: Jealousy Radar
        {
            id: 'jealousy',
            content: (
                <motion.div
                    key="jealousy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                >
                    <motion.div
                        className="text-7xl"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        👀
                    </motion.div>

                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        Jealousy Radar
                    </h2>

                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
                        <p className="text-5xl font-black text-purple-400">
                            {Math.min(100, Math.round((result.viralStats?.jealousyCount || 0) / 5))}
                        </p>
                        <p className="text-gray-400 text-sm">/100 suspicion level</p>
                    </div>

                    <p className="text-lg font-semibold text-purple-300">
                        {(() => {
                            const score = Math.min(100, Math.round((result.viralStats?.jealousyCount || 0) / 5));
                            if (score >= 70) return "FBI Agent Level 🕵️";
                            if (score >= 50) return "Suspiciously Curious 🤨";
                            if (score >= 30) return "Just Checking In 👀";
                            return "Secure & Chill 😌";
                        })()}
                    </p>
                </motion.div>
            )
        },
        // Scene 9: Main Character
        {
            id: 'main-character',
            content: (
                <motion.div
                    key="main-character"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                >
                    <motion.div
                        className="text-7xl"
                        animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        ✨
                    </motion.div>

                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                        Main Character
                    </h2>

                    <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-4 border border-amber-500/30">
                        <p className="text-sm text-gray-400">This story is about...</p>
                        <p className="text-2xl font-black text-amber-400">
                            {(() => {
                                const aScore = result.viralStats?.mainCharacterScore?.[result.partnerA] || 0;
                                const bScore = result.viralStats?.mainCharacterScore?.[result.partnerB] || 0;
                                return aScore >= bScore ? result.partnerA.split(' ')[0] : result.partnerB.split(' ')[0];
                            })()}
                        </p>
                    </div>

                    <div className="flex justify-center gap-4 text-sm">
                        <div className="bg-white/5 rounded-lg px-3 py-2">
                            <span className="text-gray-400">{result.partnerA.split(' ')[0]}:</span>
                            <span className="text-amber-400 font-bold ml-1">
                                {result.viralStats?.mainCharacterScore?.[result.partnerA] || 0}%
                            </span>
                        </div>
                        <div className="bg-white/5 rounded-lg px-3 py-2">
                            <span className="text-gray-400">{result.partnerB.split(' ')[0]}:</span>
                            <span className="text-amber-400 font-bold ml-1">
                                {result.viralStats?.mainCharacterScore?.[result.partnerB] || 0}%
                            </span>
                        </div>
                    </div>
                </motion.div>
            )
        },
        // Scene 10: Compatibility Score
        {
            id: 'compatibility',
            content: (
                <motion.div
                    key="compatibility"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                >
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                        Compatibility Score
                    </h2>

                    <motion.div
                        className="relative w-40 h-40 mx-auto"
                        initial={{ rotate: -90 }}
                        animate={{ rotate: -90 }}
                    >
                        <svg className="w-full h-full">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="12"
                            />
                            <motion.circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={440}
                                initial={{ strokeDashoffset: 440 }}
                                animate={{ strokeDashoffset: 440 - (440 * (result.viralStats?.compatibilityScore || 50)) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                            <defs>
                                <linearGradient id="gradient">
                                    <stop offset="0%" stopColor="#ec4899" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-white">
                                {result.viralStats?.compatibilityScore || 50}
                            </span>
                            <span className="text-gray-400 text-sm">/100</span>
                        </div>
                    </motion.div>

                    <p className="text-xl font-bold text-pink-400">
                        {result.viralStats?.compatibilityVerdict || 'Unknown'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-pink-500/10 rounded px-2 py-1">
                            💕 Love: {result.viralStats?.loveScore || 0}
                        </div>
                        <div className="bg-red-500/10 rounded px-2 py-1">
                            🚩 Flags: {result.viralStats?.redFlagCount || 0}
                        </div>
                    </div>
                </motion.div>
            )
        },
        // Scene 11: Final Scorecard
        {
            id: 'scorecard',
            content: (
                <motion.div
                    ref={scorecardRef}
                    key="scorecard"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                >
                    <motion.div
                        className="text-5xl"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.5, repeat: 3 }}
                    >
                        🏆
                    </motion.div>

                    <h2 className={`text-3xl font-black ${verdict.color}`}>
                        {verdict.text}
                    </h2>

                    <div className="grid grid-cols-2 gap-3 text-left">
                        <StatCard label="Total Messages" value={result.totalMessages.toLocaleString()} emoji="💬" />
                        <StatCard label="Avg Reply" value={`${result.averageReplyTime} min`} emoji="⏱️" />
                        <StatCard label="Streak" value={`${result.longestStreak} days`} emoji="🔥" />
                        <StatCard label="Emojis" value={result.emojiCount.toLocaleString()} emoji="😍" />
                        <StatCard label="Most Active" value={result.mostActiveDay} emoji="📅" />
                        <StatCard label="Language" value={languageNames[result.language.dominantLanguage] || 'Mixed'} emoji="🌍" />
                    </div>

                    {/* Share Actions */}
                    <div className="pt-2">
                        <ShareActions
                            scorecardRef={storyContainerRef}
                            onCreateVideo={() => setShowVideoExporter(true)}
                        />
                    </div>

                    <motion.button
                        onClick={onReset}
                        className="w-full py-3 px-6 bg-white/10 rounded-xl font-semibold text-white 
              hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Analyze Another Chat 💕
                    </motion.button>
                </motion.div>
            )
        }
    ];

    const nextScene = () => {
        if (currentScene < scenes.length - 1) {
            setCurrentScene(currentScene + 1);
        }
    };

    const prevScene = () => {
        if (currentScene > 0) {
            setCurrentScene(currentScene - 1);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 
      flex flex-col items-center justify-center p-4">

            {/* Story-like container */}
            <div
                ref={storyContainerRef}
                className="w-full max-w-md aspect-[9/16] bg-black/50 backdrop-blur-xl rounded-3xl 
          border border-white/10 overflow-hidden relative flex flex-col">


                {/* Progress indicators */}
                <div className="flex gap-1 p-3">
                    {scenes.map((_, index) => (
                        <div
                            key={index}
                            className="h-1 flex-1 rounded-full overflow-hidden bg-white/20"
                        >
                            <motion.div
                                className="h-full bg-white"
                                initial={{ width: index < currentScene ? '100%' : '0%' }}
                                animate={{
                                    width: index < currentScene ? '100%' : index === currentScene ? '100%' : '0%'
                                }}
                                transition={{ duration: index === currentScene ? 5 : 0.3 }}
                            />
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {scenes[currentScene].content}
                    </AnimatePresence>
                </div>

                {/* Navigation overlay */}
                <div className="absolute inset-0 flex pointer-events-none">
                    <button
                        className="w-1/3 h-full pointer-events-auto"
                        onClick={prevScene}
                        aria-label="Previous"
                    />
                    <div className="w-1/3" />
                    <button
                        className="w-1/3 h-full pointer-events-auto"
                        onClick={nextScene}
                        aria-label="Next"
                    />
                </div>

                {/* Scene indicator + Info button */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <span className="text-xs text-gray-500">Tap sides to navigate</span>
                    <button
                        onClick={() => setShowInfoModal(true)}
                        className="text-xs text-pink-400 hover:text-pink-300 underline"
                    >
                        ❓ What do these mean?
                    </button>
                </div>
            </div>

            {/* Info/Legend Modal */}
            <AnimatePresence>
                {showInfoModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowInfoModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 border border-white/10 rounded-2xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">📊 What Do These Stats Mean?</h3>

                            <div className="space-y-4 text-sm">
                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-pink-400 font-bold">💘 Simp Meter</p>
                                    <p className="text-gray-400">Who sends more messages in the chat. The higher percentage = more invested in conversations.</p>
                                </div>

                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-red-400 font-bold">🚩 Red Flag Counter</p>
                                    <p className="text-gray-400">Counts phrases like "k", "whatever", "theek hai" - signs of passive aggression or disinterest.</p>
                                </div>

                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-blue-400 font-bold">🏆 Apology Olympics</p>
                                    <p className="text-gray-400">Who says sorry more. Could mean they care more... or they mess up more! 😅</p>
                                </div>

                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-green-400 font-bold">👀 Jealousy Radar</p>
                                    <p className="text-gray-400">Detects messages about "who was that", "why didn&apos;t you reply", checking up behavior.</p>
                                </div>

                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-amber-400 font-bold">✨ Main Character Energy</p>
                                    <p className="text-gray-400">% of messages that are self-focused ("I", "me", "my"). Higher = more main character vibes.</p>
                                </div>

                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-purple-400 font-bold">🌙 Night Owl Score</p>
                                    <p className="text-gray-400">% of messages sent between midnight and 5 AM. Late night chats = special bond.</p>
                                </div>

                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-gray-300 font-bold">👻 Ghost Score</p>
                                    <p className="text-gray-400">Messages left on "seen" for hours. Higher = more ghosting behavior.</p>
                                </div>

                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-pink-400 font-bold">👯 Compatibility Score</p>
                                    <p className="text-gray-400">A weighted score based on love words, red flags, jealousy, and communication balance.</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowInfoModal(false)}
                                className="w-full mt-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-medium"
                            >
                                Got it! 👍
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video Exporter Modal */}
            <AnimatePresence>
                {showVideoExporter && (
                    <VideoExporter
                        videoProps={{
                            totalMessages: result.totalMessages,
                            partnerA: result.partnerA,
                            partnerB: result.partnerB,
                            partnerAMessages: result.messagesByUser[result.partnerA] || 0,
                            partnerBMessages: result.messagesByUser[result.partnerB] || 0,
                            topNicknames: Object.entries(result.nicknameCount)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([nickname, count]) => ({ nickname, count })),
                            nightOwlScore: result.nightOwlScore,
                            longestStreak: result.longestStreak,
                            averageReplyTime: result.averageReplyTime,
                            emojiCount: result.emojiCount,
                            verdictText: verdict.text,
                            verdictEmoji: verdict.color.includes('purple') ? '🧛' : verdict.color.includes('orange') ? '👑' : '💘',
                            // Deep stats
                            dryTextByUser: result.deepStats?.dryTextByUser,
                            longMessageByUser: result.deepStats?.longMessageByUser,
                            ghostingScore: result.deepStats?.ghostingScore,
                            ghostingByUser: result.deepStats?.ghostingByUser,
                            // Viral audit stats
                            redFlagCount: result.viralStats?.redFlagCount,
                            redFlagByUser: result.viralStats?.redFlagByUser,
                            topRedFlags: result.viralStats?.topRedFlags,
                            apologyCount: result.viralStats?.apologyCount,
                            apologyByUser: result.viralStats?.apologyByUser,
                            jealousyCount: result.viralStats?.jealousyCount,
                            jealousyByUser: result.viralStats?.jealousyByUser,
                            mainCharacterScore: result.viralStats?.mainCharacterScore,
                            loveScore: result.viralStats?.loveScore,
                            compatibilityScore: result.viralStats?.compatibilityScore,
                            compatibilityVerdict: result.viralStats?.compatibilityVerdict
                        }}
                        onClose={() => setShowVideoExporter(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
    return (
        <div className="bg-white/5 rounded-xl p-2 border border-white/10">
            <div className="flex items-center gap-1">
                <span className="text-sm">{emoji}</span>
                <span className="text-gray-400 text-xs">{label}</span>
            </div>
            <p className="text-white font-bold text-sm mt-0.5">{value}</p>
        </div>
    );
}
