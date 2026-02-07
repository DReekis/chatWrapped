import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

interface JealousySceneProps {
    jealousyCount: number;
    jealousyByUser: Record<string, number>;
    partnerA: string;
    partnerB: string;
}

export const JealousyScene: React.FC<JealousySceneProps> = ({
    jealousyCount,
    jealousyByUser,
    partnerA,
    partnerB
}) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 15], [0, 1]);
    const scale = interpolate(frame, [0, 20], [0.8, 1], { extrapolateRight: 'clamp' });

    const partnerAJealousy = jealousyByUser[partnerA] || 0;
    const partnerBJealousy = jealousyByUser[partnerB] || 0;
    const totalMessages = 1; // Will be passed in actual use

    // Jealousy score out of 100
    const jealousyScore = Math.min(100, Math.round((jealousyCount / 500) * 100));

    // Who is the FBI agent?
    const fbiAgent = partnerAJealousy >= partnerBJealousy ? partnerA : partnerB;
    const fbiScore = Math.max(partnerAJealousy, partnerBJealousy);

    // Get verdict based on score
    const getVerdict = () => {
        if (jealousyScore >= 70) return { text: "FBI Agent Level 🕵️", color: "#ef4444" };
        if (jealousyScore >= 50) return { text: "Suspiciously Curious 🤨", color: "#f97316" };
        if (jealousyScore >= 30) return { text: "Just Checking In 👀", color: "#eab308" };
        if (jealousyScore >= 15) return { text: "Mildly Invested 🙂", color: "#22c55e" };
        return { text: "Secure & Chill 😌", color: "#3b82f6" };
    };

    const verdict = getVerdict();

    return (
        <AbsoluteFill
            style={{
                background: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a1a 50%, #0a0a0a 100%)',
                justifyContent: 'center',
                alignItems: 'center',
                opacity,
                transform: `scale(${scale})`,
                padding: 40
            }}
        >
            <div style={{ textAlign: 'center', color: 'white' }}>
                {/* Emoji */}
                <div style={{ fontSize: 80, marginBottom: 20 }}>👀</div>

                {/* Title */}
                <h1 style={{
                    fontSize: 48,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 20
                }}>
                    Jealousy Radar
                </h1>

                {/* Big score */}
                <div style={{
                    position: 'relative',
                    width: 180,
                    height: 180,
                    margin: '0 auto 20px',
                    borderRadius: '50%',
                    background: `conic-gradient(${verdict.color} ${jealousyScore}%, rgba(255,255,255,0.1) ${jealousyScore}%)`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        background: '#0a0a0a',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: 48, fontWeight: 900, color: verdict.color }}>
                            {jealousyScore}
                        </span>
                        <span style={{ fontSize: 14, color: '#999' }}>/100</span>
                    </div>
                </div>

                {/* Verdict */}
                <p style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: verdict.color,
                    marginBottom: 20
                }}>
                    {verdict.text}
                </p>

                {/* FBI Agent */}
                <div style={{
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: 16,
                    padding: '16px 24px'
                }}>
                    <p style={{ color: '#999', fontSize: 14 }}>The FBI Agent:</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#a855f7' }}>
                        {fbiAgent.split(' ')[0]} 🔍
                    </p>
                    <p style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                        {fbiScore} "where are you" type messages
                    </p>
                </div>

                {/* Breakdown */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 30,
                    marginTop: 20
                }}>
                    <div>
                        <p style={{ color: '#666', fontSize: 12 }}>{partnerA.split(' ')[0]}</p>
                        <p style={{ fontSize: 24, fontWeight: 700, color: '#a855f7' }}>
                            {partnerAJealousy}
                        </p>
                    </div>
                    <div>
                        <p style={{ color: '#666', fontSize: 12 }}>{partnerB.split(' ')[0]}</p>
                        <p style={{ fontSize: 24, fontWeight: 700, color: '#ec4899' }}>
                            {partnerBJealousy}
                        </p>
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};

export default JealousyScene;
