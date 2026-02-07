import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

interface ApologySceneProps {
    apologyCount: number;
    apologyByUser: Record<string, number>;
    partnerA: string;
    partnerB: string;
}

export const ApologyScene: React.FC<ApologySceneProps> = ({
    apologyCount,
    apologyByUser,
    partnerA,
    partnerB
}) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 15], [0, 1]);
    const scale = interpolate(frame, [0, 20], [0.8, 1], { extrapolateRight: 'clamp' });

    const partnerAApologies = apologyByUser[partnerA] || 0;
    const partnerBApologies = apologyByUser[partnerB] || 0;

    const winner = partnerAApologies >= partnerBApologies ? partnerA : partnerB;
    const loser = partnerAApologies < partnerBApologies ? partnerA : partnerB;
    const winnerCount = Math.max(partnerAApologies, partnerBApologies);
    const loserCount = Math.min(partnerAApologies, partnerBApologies);

    // Calculate the ratio
    const ratio = loserCount > 0 ? Math.round(winnerCount / loserCount) : winnerCount;

    return (
        <AbsoluteFill
            style={{
                background: 'linear-gradient(180deg, #0a0a0a 0%, #0a1a2a 50%, #0a0a0a 100%)',
                justifyContent: 'center',
                alignItems: 'center',
                opacity,
                transform: `scale(${scale})`,
                padding: 40
            }}
        >
            <div style={{ textAlign: 'center', color: 'white' }}>
                {/* Emoji */}
                <div style={{ fontSize: 80, marginBottom: 20 }}>🏆</div>

                {/* Title */}
                <h1 style={{
                    fontSize: 42,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 30
                }}>
                    Apology Olympics
                </h1>

                {/* Scoreboard */}
                <div style={{
                    display: 'flex',
                    gap: 20,
                    justifyContent: 'center',
                    marginBottom: 30
                }}>
                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: 16,
                        padding: '20px 30px',
                        minWidth: 120
                    }}>
                        <p style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>
                            {partnerA.split(' ')[0]}
                        </p>
                        <p style={{ fontSize: 40, fontWeight: 900, color: '#3b82f6' }}>
                            {partnerAApologies}
                        </p>
                    </div>

                    <div style={{
                        alignSelf: 'center',
                        fontSize: 24,
                        color: '#666'
                    }}>
                        vs
                    </div>

                    <div style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: 16,
                        padding: '20px 30px',
                        minWidth: 120
                    }}>
                        <p style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>
                            {partnerB.split(' ')[0]}
                        </p>
                        <p style={{ fontSize: 40, fontWeight: 900, color: '#8b5cf6' }}>
                            {partnerBApologies}
                        </p>
                    </div>
                </div>

                {/* Winner announcement */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                    borderRadius: 16,
                    padding: '16px 24px'
                }}>
                    <p style={{ fontSize: 18, color: '#e5e7eb' }}>
                        <span style={{ fontWeight: 700, color: '#a78bfa' }}>
                            {winner.split(' ')[0]}
                        </span>
                        {' '}said sorry{' '}
                        <span style={{ fontWeight: 700, color: '#60a5fa' }}>
                            {ratio}x more
                        </span>
                        {' '}than{' '}
                        <span style={{ color: '#9ca3af' }}>
                            {loser.split(' ')[0]}
                        </span>
                    </p>
                </div>

                {/* Funny tagline */}
                <p style={{
                    color: '#666',
                    fontSize: 14,
                    marginTop: 20,
                    fontStyle: 'italic'
                }}>
                    {ratio > 5
                        ? "The math ain't mathing... 🤔"
                        : ratio > 2
                            ? "Someone's carrying the relationship 💀"
                            : "Balanced, as all things should be ⚖️"}
                </p>
            </div>
        </AbsoluteFill>
    );
};

export default ApologyScene;
