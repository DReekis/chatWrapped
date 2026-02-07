import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface ScorecardSceneProps {
    totalMessages: number;
    longestStreak: number;
    averageReplyTime: number;
    emojiCount: number;
    verdictText: string;
    verdictEmoji: string;
}

export const ScorecardScene: React.FC<ScorecardSceneProps> = ({
    totalMessages,
    longestStreak,
    averageReplyTime,
    emojiCount,
    verdictText,
    verdictEmoji
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Entry animation
    const entryOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: 'clamp'
    });

    // Trophy animation
    const trophyScale = spring({
        frame,
        fps,
        config: { damping: 10, stiffness: 200 }
    });

    const trophyPulse = interpolate(
        frame % 40,
        [0, 20, 40],
        [1, 1.15, 1]
    );

    // Stats grid animation
    const stats = [
        { label: 'Total Messages', value: totalMessages.toLocaleString(), emoji: '💬' },
        { label: 'Longest Streak', value: `${longestStreak} days`, emoji: '🔥' },
        { label: 'Avg Reply Time', value: `${averageReplyTime} min`, emoji: '⏱️' },
        { label: 'Emojis Used', value: emojiCount.toLocaleString(), emoji: '😍' }
    ];

    return (
        <AbsoluteFill
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 60,
                opacity: entryOpacity
            }}
        >
            {/* Trophy */}
            <div
                style={{
                    fontSize: 150,
                    transform: `scale(${Math.max(0, trophyScale) * trophyPulse})`,
                    filter: 'drop-shadow(0 0 40px rgba(255, 200, 0, 0.5))',
                    marginBottom: 30
                }}
            >
                🏆
            </div>

            {/* Verdict */}
            <h2
                style={{
                    fontSize: 64,
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #ec4899, #f472b6, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 50,
                    textAlign: 'center'
                }}
            >
                {verdictText} {verdictEmoji}
            </h2>

            {/* Stats grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 20,
                    width: '100%',
                    maxWidth: 800
                }}
            >
                {stats.map((stat, index) => {
                    const cardDelay = 40 + index * 15;

                    const cardOpacity = interpolate(frame, [cardDelay, cardDelay + 20], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp'
                    });

                    const cardScale = spring({
                        frame: frame - cardDelay,
                        fps,
                        config: { damping: 12, stiffness: 100 }
                    });

                    return (
                        <div
                            key={stat.label}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 24,
                                padding: 30,
                                opacity: cardOpacity,
                                transform: `scale(${Math.max(0, cardScale)})`
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                <span style={{ fontSize: 28 }}>{stat.emoji}</span>
                                <span style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.6)' }}>
                                    {stat.label}
                                </span>
                            </div>
                            <p style={{ fontSize: 36, fontWeight: 700, color: 'white' }}>
                                {stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Watermark */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 60,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    opacity: 0.5
                }}
            >
                <span style={{ fontSize: 24 }}>💕</span>
                <span style={{ fontSize: 20, color: 'white' }}>Ishq Audit 2026</span>
            </div>
        </AbsoluteFill>
    );
};
