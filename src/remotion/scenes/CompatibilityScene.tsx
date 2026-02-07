import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

interface CompatibilitySceneProps {
    compatibilityScore: number;
    compatibilityVerdict: string;
    loveScore: number;
    redFlagCount: number;
    jealousyCount: number;
    apologyCount: number;
}

export const CompatibilityScene: React.FC<CompatibilitySceneProps> = ({
    compatibilityScore,
    compatibilityVerdict,
    loveScore,
    redFlagCount,
    jealousyCount,
    apologyCount
}) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 15], [0, 1]);
    const scale = interpolate(frame, [0, 20], [0.8, 1], { extrapolateRight: 'clamp' });

    // Animate the score counting up
    const displayScore = Math.min(
        compatibilityScore,
        Math.round(interpolate(frame, [20, 60], [0, compatibilityScore], { extrapolateRight: 'clamp' }))
    );

    // Get color based on score
    const getScoreColor = () => {
        if (compatibilityScore >= 80) return '#22c55e';
        if (compatibilityScore >= 60) return '#84cc16';
        if (compatibilityScore >= 40) return '#eab308';
        if (compatibilityScore >= 25) return '#f97316';
        return '#ef4444';
    };

    const scoreColor = getScoreColor();

    return (
        <AbsoluteFill
            style={{
                background: 'linear-gradient(180deg, #0a0a0a 0%, #0a0a1a 50%, #0a0a0a 100%)',
                justifyContent: 'center',
                alignItems: 'center',
                opacity,
                transform: `scale(${scale})`,
                padding: 40
            }}
        >
            <div style={{ textAlign: 'center', color: 'white' }}>
                {/* Title */}
                <h1 style={{
                    fontSize: 36,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 20
                }}>
                    Compatibility Score
                </h1>

                {/* Big circular score */}
                <div style={{
                    position: 'relative',
                    width: 200,
                    height: 200,
                    margin: '0 auto 20px',
                    borderRadius: '50%',
                    background: `conic-gradient(${scoreColor} ${displayScore}%, rgba(255,255,255,0.05) ${displayScore}%)`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: `0 0 60px ${scoreColor}40`
                }}>
                    <div style={{
                        width: 160,
                        height: 160,
                        borderRadius: '50%',
                        background: '#0a0a0a',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <span style={{
                            fontSize: 64,
                            fontWeight: 900,
                            color: scoreColor
                        }}>
                            {displayScore}
                        </span>
                        <span style={{ fontSize: 18, color: '#999', marginTop: -5 }}>/ 100</span>
                    </div>
                </div>

                {/* Verdict */}
                <p style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: scoreColor,
                    marginBottom: 30
                }}>
                    {compatibilityVerdict}
                </p>

                {/* Stats grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 12,
                    maxWidth: 280,
                    margin: '0 auto'
                }}>
                    <div style={{
                        background: 'rgba(236, 72, 153, 0.1)',
                        borderRadius: 12,
                        padding: '12px 16px',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: 10, color: '#888' }}>Love</p>
                        <p style={{ fontSize: 24, fontWeight: 700, color: '#ec4899' }}>
                            💕 {loveScore}
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: 12,
                        padding: '12px 16px',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: 10, color: '#888' }}>Red Flags</p>
                        <p style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>
                            🚩 {redFlagCount}
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(168, 85, 247, 0.1)',
                        borderRadius: 12,
                        padding: '12px 16px',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: 10, color: '#888' }}>Jealousy</p>
                        <p style={{ fontSize: 24, fontWeight: 700, color: '#a855f7' }}>
                            👀 {jealousyCount}
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: 12,
                        padding: '12px 16px',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: 10, color: '#888' }}>Apologies</p>
                        <p style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>
                            🙏 {apologyCount}
                        </p>
                    </div>
                </div>

                {/* App promotion */}
                <p style={{
                    color: '#666',
                    fontSize: 12,
                    marginTop: 24
                }}>
                    ishq-audit.vercel.app 💕
                </p>
            </div>
        </AbsoluteFill>
    );
};

export default CompatibilityScene;
