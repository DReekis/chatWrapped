import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

export const IntroScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title animation
    const titleScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 }
    });

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: 'clamp'
    });

    // Glitch effect
    const glitchOffset = Math.sin(frame * 0.5) * (frame < 60 ? 5 : 0);

    // Year text animation
    const yearOpacity = interpolate(frame, [30, 50], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    // Heart animation
    const heartScale = spring({
        frame: frame - 60,
        fps,
        config: { damping: 8, stiffness: 150 }
    });

    const heartRotation = interpolate(frame, [60, 150], [0, 15], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    // Exit animation
    const exitScale = interpolate(frame, [120, 150], [1, 1.5], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    const exitOpacity = interpolate(frame, [120, 150], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    return (
        <AbsoluteFill
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                opacity: exitOpacity,
                transform: `scale(${exitScale})`
            }}
        >
            {/* Main title with glitch effect */}
            <div
                style={{
                    textAlign: 'center',
                    transform: `scale(${titleScale})`,
                    opacity: titleOpacity
                }}
            >
                {/* Glitch layers */}
                <div style={{ position: 'relative' }}>
                    {/* Red glitch layer */}
                    <h1
                        style={{
                            position: 'absolute',
                            left: glitchOffset,
                            top: 0,
                            fontSize: 110,
                            fontWeight: 900,
                            color: 'rgba(255, 0, 100, 0.5)',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        CHATWRAPPED
                    </h1>

                    {/* Blue glitch layer */}
                    <h1
                        style={{
                            position: 'absolute',
                            left: -glitchOffset,
                            top: 0,
                            fontSize: 110,
                            fontWeight: 900,
                            color: 'rgba(100, 0, 255, 0.5)',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        CHATWRAPPED
                    </h1>

                    {/* Main text */}
                    <h1
                        style={{
                            fontSize: 110,
                            fontWeight: 900,
                            background: 'linear-gradient(135deg, #ec4899, #a855f7, #ec4899)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em',
                            textShadow: '0 0 60px rgba(236, 72, 153, 0.5)'
                        }}
                    >
                        CHATWRAPPED
                    </h1>
                </div>

                {/* Year */}
                <p
                    style={{
                        fontSize: 48,
                        color: 'rgba(255, 255, 255, 0.6)',
                        marginTop: 20,
                        opacity: yearOpacity,
                        letterSpacing: '0.5em'
                    }}
                >
                    2026
                </p>
            </div>

            {/* Animated heart */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 300,
                    fontSize: 150,
                    transform: `scale(${Math.max(0, heartScale)}) rotate(${heartRotation}deg)`,
                    filter: 'drop-shadow(0 0 30px rgba(236, 72, 153, 0.5))'
                }}
            >
                💕
            </div>
        </AbsoluteFill>
    );
};
