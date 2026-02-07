import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

interface MainCharacterSceneProps {
    mainCharacterScore: Record<string, number>;
    partnerA: string;
    partnerB: string;
}

export const MainCharacterScene: React.FC<MainCharacterSceneProps> = ({
    mainCharacterScore,
    partnerA,
    partnerB
}) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 15], [0, 1]);
    const scale = interpolate(frame, [0, 20], [0.8, 1], { extrapolateRight: 'clamp' });

    const partnerAScore = mainCharacterScore[partnerA] || 0;
    const partnerBScore = mainCharacterScore[partnerB] || 0;

    const mainCharacter = partnerAScore >= partnerBScore ? partnerA : partnerB;
    const mainScore = Math.max(partnerAScore, partnerBScore);
    const sideCharacter = partnerAScore < partnerBScore ? partnerA : partnerB;
    const sideScore = Math.min(partnerAScore, partnerBScore);

    // Get fun title based on score
    const getTitle = (score: number) => {
        if (score >= 60) return "Protagonist Energy 🌟";
        if (score >= 40) return "Main Character Vibes ✨";
        if (score >= 25) return "Important Side Quest 🎭";
        return "Listening Champion 👂";
    };

    return (
        <AbsoluteFill
            style={{
                background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a0a 50%, #0a0a0a 100%)',
                justifyContent: 'center',
                alignItems: 'center',
                opacity,
                transform: `scale(${scale})`,
                padding: 40
            }}
        >
            <div style={{ textAlign: 'center', color: 'white' }}>
                {/* Emoji */}
                <div style={{ fontSize: 80, marginBottom: 20 }}>✨</div>

                {/* Title */}
                <h1 style={{
                    fontSize: 42,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #fbbf24, #f97316)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 30
                }}>
                    Main Character
                </h1>

                {/* The Main Character */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(249, 115, 22, 0.2))',
                    border: '2px solid rgba(251, 191, 36, 0.5)',
                    borderRadius: 20,
                    padding: '24px 40px',
                    marginBottom: 20
                }}>
                    <p style={{ color: '#999', fontSize: 14, marginBottom: 8 }}>
                        This story is about...
                    </p>
                    <p style={{
                        fontSize: 36,
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #fbbf24, #f97316)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {mainCharacter.split(' ')[0]}
                    </p>
                    <p style={{ color: '#fbbf24', fontSize: 18, marginTop: 8 }}>
                        {getTitle(mainScore)}
                    </p>
                </div>

                {/* Stats comparison */}
                <div style={{
                    display: 'flex',
                    gap: 20,
                    justifyContent: 'center',
                    marginBottom: 20
                }}>
                    <div style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        borderRadius: 12,
                        padding: '16px 24px',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#666', fontSize: 11 }}>{mainCharacter.split(' ')[0]}</p>
                        <p style={{ fontSize: 32, fontWeight: 800, color: '#fbbf24' }}>
                            {mainScore}%
                        </p>
                        <p style={{ color: '#888', fontSize: 10 }}>self-focused</p>
                    </div>

                    <div style={{
                        background: 'rgba(107, 114, 128, 0.1)',
                        borderRadius: 12,
                        padding: '16px 24px',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#666', fontSize: 11 }}>{sideCharacter.split(' ')[0]}</p>
                        <p style={{ fontSize: 32, fontWeight: 800, color: '#6b7280' }}>
                            {sideScore}%
                        </p>
                        <p style={{ color: '#888', fontSize: 10 }}>self-focused</p>
                    </div>
                </div>

                {/* Funny comment */}
                <p style={{
                    color: '#666',
                    fontSize: 14,
                    fontStyle: 'italic',
                    maxWidth: 300,
                    margin: '0 auto'
                }}>
                    {mainScore > 50
                        ? `${mainCharacter.split(' ')[0]} talks about themselves more than the weather app talks about rain 🌧️`
                        : mainScore > 30
                            ? `${mainCharacter.split(' ')[0]} definitely has main character energy ✨`
                            : "You both actually listen to each other! Rare. 💫"}
                </p>
            </div>
        </AbsoluteFill>
    );
};

export default MainCharacterScene;
