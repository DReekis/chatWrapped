import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface GhostSceneProps {
    ghostingScore: number;
    ghostingByUser: Record<string, number>;
    partnerA: string;
    partnerB: string;
}

export const GhostScene: React.FC<GhostSceneProps> = ({
    ghostingScore,
    ghostingByUser,
    partnerA,
    partnerB
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Entry animation
    const entryOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: 'clamp'
    });

    // Ghost floating animation
    const ghostY = interpolate(frame, [0, 60, 120], [0, -30, 0], {
        extrapolateRight: 'extend'
    });

    const ghostScale = spring({
        frame: frame - 10,
        fps,
        config: { damping: 8, stiffness: 150 }
    });

    // Determine who ghosts more
    const partnerAGhosts = ghostingByUser[partnerA] || 0;
    const partnerBGhosts = ghostingByUser[partnerB] || 0;
    const topGhoster = partnerAGhosts > partnerBGhosts ? partnerA : partnerB;
    const topGhostCount = Math.max(partnerAGhosts, partnerBGhosts);

    // Score animation
    const scoreValue = interpolate(frame, [40, 100], [0, ghostingScore], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    const isHighGhosting = ghostingScore > 20;

    // Exit animation
    const exitOpacity = interpolate(frame, [130, 150], [1, 0], {
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
            {/* Ghost emoji */}
            <div
                style={{
                    fontSize: 180,
                    transform: `scale(${Math.max(0, ghostScale)}) translateY(${ghostY}px)`,
                    filter: 'drop-shadow(0 0 40px rgba(168, 85, 247, 0.5))',
                    marginBottom: 20
                }}
            >
                👻
            </div>

            {/* Title */}
            <h2
                style={{
                    fontSize: 72,
                    fontWeight: 800,
                    color: 'white',
                    marginBottom: 30,
                    textAlign: 'center'
                }}
            >
                The Ghost 👀
            </h2>

            {/* Main stat card */}
            <div
                style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 32,
                    padding: '40px 60px',
                    textAlign: 'center',
                    marginBottom: 30
                }}
            >
                <p
                    style={{
                        fontSize: 100,
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    {Math.round(scoreValue)}
                </p>
                <p
                    style={{
                        fontSize: 24,
                        color: 'rgba(255, 255, 255, 0.6)',
                        marginTop: 8
                    }}
                >
                    times left on delivered for 4+ hours
                </p>
            </div>

            {/* Who ghosts more */}
            {isHighGhosting && topGhostCount > 5 && (
                <p
                    style={{
                        fontSize: 28,
                        color: '#f59e0b',
                        textAlign: 'center'
                    }}
                >
                    {topGhoster} is the certified ghost 💀
                </p>
            )}

            {/* Fun message */}
            <p
                style={{
                    fontSize: 24,
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginTop: 20,
                    textAlign: 'center'
                }}
            >
                {isHighGhosting
                    ? "Busy or just avoiding? 🤔"
                    : "Quick repliers! That's rare 💚"}
            </p>
        </AbsoluteFill>
    );
};
