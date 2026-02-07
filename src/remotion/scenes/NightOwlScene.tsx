import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface NightOwlSceneProps {
    nightOwlScore: number;
}

export const NightOwlScene: React.FC<NightOwlSceneProps> = ({ nightOwlScore }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Entry animation
    const entryOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: 'clamp'
    });

    // Emoji animation
    const emojiScale = spring({
        frame: frame - 10,
        fps,
        config: { damping: 8, stiffness: 150 }
    });

    const emojiY = interpolate(frame, [30, 60, 90, 120], [0, -30, 0, -15], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    const emojiRotation = interpolate(frame, [30, 60, 90, 120], [0, 10, -10, 5], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    // Score animation
    const scoreValue = interpolate(frame, [40, 100], [0, nightOwlScore], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    const isVampire = nightOwlScore > 20;

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
            {/* Main emoji */}
            <div
                style={{
                    fontSize: 200,
                    transform: `scale(${Math.max(0, emojiScale)}) translateY(${emojiY}px) rotate(${emojiRotation}deg)`,
                    filter: 'drop-shadow(0 0 40px rgba(168, 85, 247, 0.5))',
                    marginBottom: 40
                }}
            >
                {isVampire ? '🧛' : '☀️'}
            </div>

            {/* Title */}
            <h2
                style={{
                    fontSize: 72,
                    fontWeight: 800,
                    color: 'white',
                    marginBottom: 40,
                    textAlign: 'center'
                }}
            >
                {isVampire ? 'Vampire Couple' : 'Early Birds'}
            </h2>

            {/* Score card */}
            <div
                style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 32,
                    padding: '50px 80px',
                    textAlign: 'center'
                }}
            >
                <p
                    style={{
                        fontSize: 120,
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    {Math.round(scoreValue)}%
                </p>
                <p
                    style={{
                        fontSize: 28,
                        color: 'rgba(255, 255, 255, 0.6)',
                        marginTop: 10
                    }}
                >
                    of your texts are between 1-5 AM
                </p>
            </div>

            {/* Fun message */}
            <p
                style={{
                    fontSize: 32,
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginTop: 40,
                    maxWidth: 700,
                    textAlign: 'center',
                    lineHeight: 1.4
                }}
            >
                {isVampire
                    ? "Sleep is for the weak when you have love! 🦇"
                    : "Healthy sleep schedule = Healthy relationship? 🤔"}
            </p>
        </AbsoluteFill>
    );
};
