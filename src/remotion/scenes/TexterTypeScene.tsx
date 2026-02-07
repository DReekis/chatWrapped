import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface TexterTypeSceneProps {
    partnerA: string;
    partnerB: string;
    dryTextByUser: Record<string, number>;
    longMessageByUser: Record<string, number>;
}

export const TexterTypeScene: React.FC<TexterTypeSceneProps> = ({
    partnerA,
    partnerB,
    dryTextByUser,
    longMessageByUser
}) => {
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

    // Calculate who is the yapper vs dry texter
    const partnerADry = dryTextByUser[partnerA] || 0;
    const partnerBDry = dryTextByUser[partnerB] || 0;
    const partnerALong = longMessageByUser[partnerA] || 0;
    const partnerBLong = longMessageByUser[partnerB] || 0;

    const yapperName = partnerALong > partnerBLong ? partnerA : partnerB;
    const yapperCount = Math.max(partnerALong, partnerBLong);
    const dryTexterName = partnerADry > partnerBDry ? partnerA : partnerB;
    const dryCount = Math.max(partnerADry, partnerBDry);

    // Animations for cards
    const yapperCardOpacity = interpolate(frame, [30, 50], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    const dryCardOpacity = interpolate(frame, [50, 70], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    // Exit animation
    const exitOpacity = interpolate(frame, [140, 160], [1, 0], {
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
                The Texter Type 📱
            </h2>

            {/* Cards container */}
            <div style={{ width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 30 }}>
                {/* Yapper Card */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 24,
                        padding: 40,
                        textAlign: 'center',
                        opacity: yapperCardOpacity
                    }}
                >
                    <div style={{ fontSize: 80, marginBottom: 16 }}>🗣️</div>
                    <h3 style={{ fontSize: 36, fontWeight: 700, color: '#a855f7', marginBottom: 8 }}>
                        The Yapper
                    </h3>
                    <p style={{ fontSize: 28, color: 'white', fontWeight: 600 }}>{yapperName}</p>
                    <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
                        {yapperCount} long messages (50+ words)
                    </p>
                </div>

                {/* Dry Texter Card */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 24,
                        padding: 40,
                        textAlign: 'center',
                        opacity: dryCardOpacity
                    }}
                >
                    <div style={{ fontSize: 80, marginBottom: 16 }}>🌵</div>
                    <h3 style={{ fontSize: 36, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>
                        The Dry Texter
                    </h3>
                    <p style={{ fontSize: 28, color: 'white', fontWeight: 600 }}>{dryTexterName}</p>
                    <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
                        {dryCount} short replies (&lt;3 words)
                    </p>
                </div>
            </div>
        </AbsoluteFill>
    );
};
