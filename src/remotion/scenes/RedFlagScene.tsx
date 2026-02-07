import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { motion } from 'framer-motion';

interface RedFlagSceneProps {
    redFlagCount: number;
    redFlagByUser: Record<string, number>;
    topRedFlags: string[];
    partnerA: string;
    partnerB: string;
}

export const RedFlagScene: React.FC<RedFlagSceneProps> = ({
    redFlagCount,
    redFlagByUser,
    topRedFlags,
    partnerA,
    partnerB
}) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 15], [0, 1]);
    const scale = interpolate(frame, [0, 20], [0.8, 1], { extrapolateRight: 'clamp' });

    // Who has more red flags?
    const partnerAFlags = redFlagByUser[partnerA] || 0;
    const partnerBFlags = redFlagByUser[partnerB] || 0;
    const winner = partnerAFlags >= partnerBFlags ? partnerA : partnerB;
    const winnerCount = Math.max(partnerAFlags, partnerBFlags);

    return (
        <AbsoluteFill
            style={{
                background: 'linear-gradient(180deg, #0a0a0a 0%, #2d0a0a 50%, #0a0a0a 100%)',
                justifyContent: 'center',
                alignItems: 'center',
                opacity,
                transform: `scale(${scale})`,
                padding: 40
            }}
        >
            <div style={{ textAlign: 'center', color: 'white' }}>
                {/* Big emoji */}
                <div style={{ fontSize: 80, marginBottom: 20 }}>🚩</div>

                {/* Title */}
                <h1 style={{
                    fontSize: 48,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #ef4444, #f97316)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 30
                }}>
                    Red Flag Counter
                </h1>

                {/* Total count */}
                <div style={{
                    fontSize: 72,
                    fontWeight: 900,
                    color: '#ef4444',
                    textShadow: '0 0 30px rgba(239, 68, 68, 0.5)'
                }}>
                    {redFlagCount}
                </div>
                <p style={{ color: '#999', fontSize: 16, marginBottom: 30 }}>
                    suspicious messages detected
                </p>

                {/* Winner */}
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 16,
                    padding: '16px 24px',
                    marginBottom: 20
                }}>
                    <p style={{ color: '#999', fontSize: 14 }}>Most Red Flags:</p>
                    <p style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>
                        {winner.split(' ')[0]} ({winnerCount} 🚩)
                    </p>
                </div>

                {/* Top phrases */}
                {topRedFlags.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                        <p style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>
                            Top phrases detected:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                            {topRedFlags.slice(0, 3).map((flag, i) => (
                                <span
                                    key={i}
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        padding: '6px 12px',
                                        borderRadius: 20,
                                        fontSize: 12,
                                        color: '#f87171'
                                    }}
                                >
                                    "{flag}"
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};

export default RedFlagScene;
