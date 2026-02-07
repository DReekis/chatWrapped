import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface NicknameSceneProps {
    topNicknames: Array<{ nickname: string; count: number }>;
}

export const NicknameScene: React.FC<NicknameSceneProps> = ({ topNicknames }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Entry animation
    const entryOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: 'clamp'
    });

    const titleScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 }
    });

    // Exit animation
    const exitOpacity = interpolate(frame, [160, 180], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    return (
        <AbsoluteFill
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 60,
                opacity: entryOpacity * exitOpacity
            }}
        >
            {/* Title */}
            <h2
                style={{
                    fontSize: 72,
                    fontWeight: 800,
                    color: 'white',
                    marginBottom: 60,
                    textAlign: 'center',
                    transform: `scale(${titleScale})`
                }}
            >
                The Nickname Exposé 🙈
            </h2>

            {/* Nickname cards */}
            <div style={{ width: '100%', maxWidth: 800 }}>
                {topNicknames.slice(0, 3).map((item, index) => {
                    const cardDelay = 30 + index * 30;

                    const cardOpacity = interpolate(frame, [cardDelay, cardDelay + 20], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp'
                    });

                    const cardX = interpolate(frame, [cardDelay, cardDelay + 20], [-100, 0], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp'
                    });

                    const countValue = interpolate(
                        frame,
                        [cardDelay + 20, cardDelay + 60],
                        [0, item.count],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    );

                    return (
                        <div
                            key={item.nickname}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 24,
                                padding: '40px 50px',
                                marginBottom: 24,
                                opacity: cardOpacity,
                                transform: `translateX(${cardX}px)`,
                                textAlign: 'center'
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 56,
                                    color: '#ec4899',
                                    fontWeight: 700
                                }}
                            >
                                &quot;{item.nickname}&quot;
                            </span>
                            <p
                                style={{
                                    fontSize: 32,
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    marginTop: 16
                                }}
                            >
                                used{' '}
                                <span style={{ color: 'white', fontWeight: 800, fontSize: 48 }}>
                                    {Math.round(countValue)}
                                </span>
                                {' '}times
                            </p>
                        </div>
                    );
                })}

                {topNicknames.length === 0 && (
                    <p style={{
                        fontSize: 36,
                        color: 'rgba(255, 255, 255, 0.5)',
                        textAlign: 'center'
                    }}>
                        No special nicknames detected 😢
                    </p>
                )}
            </div>
        </AbsoluteFill>
    );
};
