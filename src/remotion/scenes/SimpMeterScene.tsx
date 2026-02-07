import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface SimpMeterSceneProps {
    partnerA: string;
    partnerB: string;
    partnerAMessages: number;
    partnerBMessages: number;
    totalMessages: number;
}

export const SimpMeterScene: React.FC<SimpMeterSceneProps> = ({
    partnerA,
    partnerB,
    partnerAMessages,
    partnerBMessages,
    totalMessages
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Entry animation
    const entryOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: 'clamp'
    });

    const titleY = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 100 }
    });

    // Bar animations
    const partnerAPercentage = (partnerAMessages / totalMessages) * 100;
    const partnerBPercentage = (partnerBMessages / totalMessages) * 100;

    const barAWidth = interpolate(frame, [30, 90], [0, partnerAPercentage], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    const barBWidth = interpolate(frame, [50, 110], [0, partnerBPercentage], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    // Verdict animation
    const verdictOpacity = interpolate(frame, [120, 140], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    const isSimp = partnerAPercentage > 55;
    const simpName = partnerAMessages > partnerBMessages ? partnerA : partnerB;

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
                    marginBottom: 80,
                    transform: `translateY(${(1 - titleY) * 50}px)`,
                    textAlign: 'center'
                }}
            >
                The Simp Meter 📊
            </h2>

            {/* Bars container */}
            <div style={{ width: '100%', maxWidth: 900 }}>
                {/* Partner A bar */}
                <div style={{ marginBottom: 40 }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                        fontSize: 32
                    }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{partnerA}</span>
                        <span style={{ color: '#ec4899', fontWeight: 700 }}>
                            {partnerAMessages.toLocaleString()} msgs
                        </span>
                    </div>
                    <div style={{
                        height: 60,
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 30,
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${barAWidth}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #ec4899, #a855f7)',
                            borderRadius: 30
                        }} />
                    </div>
                </div>

                {/* Partner B bar */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                        fontSize: 32
                    }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{partnerB}</span>
                        <span style={{ color: '#a855f7', fontWeight: 700 }}>
                            {partnerBMessages.toLocaleString()} msgs
                        </span>
                    </div>
                    <div style={{
                        height: 60,
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 30,
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${barBWidth}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #a855f7, #6366f1)',
                            borderRadius: 30
                        }} />
                    </div>
                </div>
            </div>

            {/* Verdict */}
            <p
                style={{
                    fontSize: 42,
                    fontWeight: 600,
                    color: '#ec4899',
                    marginTop: 60,
                    opacity: verdictOpacity,
                    textAlign: 'center'
                }}
            >
                {isSimp
                    ? `${simpName} is the certified simp 🥺`
                    : "Perfectly balanced ⚖️"}
            </p>
        </AbsoluteFill>
    );
};
