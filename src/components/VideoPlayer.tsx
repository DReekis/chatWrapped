'use client';

import { Player } from '@remotion/player';
import { IshqAuditVideo, IshqAuditVideoProps } from '@/remotion/IshqAuditVideo';
import { AnalysisResult } from '@/lib/parseChat';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface VideoPlayerProps {
    result: AnalysisResult;
    onClose: () => void;
}

export default function VideoPlayer({ result, onClose }: VideoPlayerProps) {
    const [isRendering, setIsRendering] = useState(false);

    // Transform analysis result to video props
    const users = Object.entries(result.messagesByUser);
    const [partnerA, partnerAMessages] = users[0] || ['Partner A', 0];
    const [partnerB, partnerBMessages] = users[1] || ['Partner B', 0];

    const topNicknames = Object.entries(result.nicknameCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([nickname, count]) => ({ nickname, count }));

    // Determine verdict
    const getVerdict = () => {
        if (result.nightOwlScore > 30) return { text: "Certified Vampires", emoji: "🧛" };
        if (result.sentimentStats.romance > result.sentimentStats.fight * 3) return { text: "Certified Soulmates", emoji: "💕" };
        if (result.sentimentStats.fight > result.sentimentStats.romance) return { text: "Drama Royalty", emoji: "👑" };
        if (result.sentimentStats.food > 50) return { text: "Foodies in Love", emoji: "🍕" };
        return { text: "Madly in Love", emoji: "💘" };
    };

    const verdict = getVerdict();

    const videoProps: IshqAuditVideoProps = {
        totalMessages: result.totalMessages,
        partnerA,
        partnerB,
        partnerAMessages,
        partnerBMessages,
        topNicknames,
        nightOwlScore: result.nightOwlScore,
        longestStreak: result.longestStreak,
        averageReplyTime: result.averageReplyTime,
        emojiCount: result.emojiCount,
        verdictText: verdict.text,
        verdictEmoji: verdict.emoji,
        // Deep stats for new scenes
        dryTextByUser: result.deepStats?.dryTextByUser,
        longMessageByUser: result.deepStats?.longMessageByUser,
        ghostingScore: result.deepStats?.ghostingScore,
        ghostingByUser: result.deepStats?.ghostingByUser,
        // Viral stats
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
    };

    const handleDownload = async () => {
        setIsRendering(true);
        // Note: Full Remotion rendering requires server-side processing
        // For client-side, we can only screenshot the player
        alert('Video rendering requires the Remotion CLI. Run: npx remotion render IshqAuditVideo out.mp4');
        setIsRendering(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4"
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

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-4">Your ChatWrapped Video 🎬</h2>

            {/* Remotion Player */}
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-pink-500/20">
                <Player
                    component={IshqAuditVideo as unknown as React.ComponentType<Record<string, unknown>>}
                    inputProps={videoProps as unknown as Record<string, unknown>}
                    durationInFrames={1500}
                    compositionWidth={1080}
                    compositionHeight={1920}
                    fps={30}
                    style={{
                        width: 320,
                        height: 568 // 9:16 aspect ratio
                    }}
                    controls
                    autoPlay
                    loop
                />
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-6">
                <motion.button
                    onClick={handleDownload}
                    disabled={isRendering}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl 
            font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isRendering ? 'Rendering...' : 'Download Video 📥'}
                </motion.button>

                <motion.button
                    onClick={onClose}
                    className="px-6 py-3 bg-white/10 rounded-xl font-semibold text-white 
            hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Back to Results
                </motion.button>
            </div>

            <p className="text-gray-500 text-sm mt-4 max-w-md text-center">
                Tip: Take a screen recording to save the video on mobile! 📱
            </p>
        </motion.div>
    );
}
