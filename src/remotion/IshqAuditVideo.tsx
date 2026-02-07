import { AbsoluteFill, interpolate, useCurrentFrame, Sequence } from 'remotion';
import { IntroScene } from './scenes/IntroScene';
import { SimpMeterScene } from './scenes/SimpMeterScene';
import { NicknameScene } from './scenes/NicknameScene';
import { NightOwlScene } from './scenes/NightOwlScene';
import { TexterTypeScene } from './scenes/TexterTypeScene';
import { GhostScene } from './scenes/GhostScene';
import { RedFlagScene } from './scenes/RedFlagScene';
import { ApologyScene } from './scenes/ApologyScene';
import { JealousyScene } from './scenes/JealousyScene';
import { MainCharacterScene } from './scenes/MainCharacterScene';
import { CompatibilityScene } from './scenes/CompatibilityScene';
import { ScorecardScene } from './scenes/ScorecardScene';

export interface IshqAuditVideoProps {
    totalMessages: number;
    partnerA: string;
    partnerB: string;
    partnerAMessages: number;
    partnerBMessages: number;
    topNicknames: Array<{ nickname: string; count: number }>;
    nightOwlScore: number;
    longestStreak: number;
    averageReplyTime: number;
    emojiCount: number;
    verdictText: string;
    verdictEmoji: string;
    // Deep stats props
    dryTextByUser?: Record<string, number>;
    longMessageByUser?: Record<string, number>;
    ghostingScore?: number;
    ghostingByUser?: Record<string, number>;
    // Viral audit stats
    redFlagCount?: number;
    redFlagByUser?: Record<string, number>;
    topRedFlags?: string[];
    apologyCount?: number;
    apologyByUser?: Record<string, number>;
    jealousyCount?: number;
    jealousyByUser?: Record<string, number>;
    mainCharacterScore?: Record<string, number>;
    loveScore?: number;
    compatibilityScore?: number;
    compatibilityVerdict?: string;
}

export const IshqAuditVideo: React.FC<IshqAuditVideoProps> = (props) => {
    const frame = useCurrentFrame();

    // Scene durations (in frames at 30fps)
    const SCENE_DURATIONS = {
        intro: 90,           // 3 seconds
        simpMeter: 120,      // 4 seconds
        texterType: 120,     // 4 seconds
        redFlag: 120,        // 4 seconds (NEW)
        apology: 120,        // 4 seconds (NEW)
        jealousy: 120,       // 4 seconds (NEW)
        mainChar: 120,       // 4 seconds (NEW)
        nickname: 120,       // 4 seconds
        nightOwl: 120,       // 4 seconds
        ghost: 120,          // 4 seconds
        compatibility: 150,  // 5 seconds (NEW)
        scorecard: 180       // 6 seconds
    };

    // Calculate scene start frames
    let runningTotal = 0;
    const startFrames = {
        intro: (runningTotal = 0),
        simpMeter: (runningTotal += SCENE_DURATIONS.intro),
        texterType: (runningTotal += SCENE_DURATIONS.simpMeter),
        redFlag: (runningTotal += SCENE_DURATIONS.texterType),
        apology: (runningTotal += SCENE_DURATIONS.redFlag),
        jealousy: (runningTotal += SCENE_DURATIONS.apology),
        mainChar: (runningTotal += SCENE_DURATIONS.jealousy),
        nickname: (runningTotal += SCENE_DURATIONS.mainChar),
        nightOwl: (runningTotal += SCENE_DURATIONS.nickname),
        ghost: (runningTotal += SCENE_DURATIONS.nightOwl),
        compatibility: (runningTotal += SCENE_DURATIONS.ghost),
        scorecard: (runningTotal += SCENE_DURATIONS.compatibility)
    };

    // Background gradient animation
    const totalFrames = runningTotal + SCENE_DURATIONS.scorecard;
    const gradientRotation = interpolate(frame, [0, totalFrames], [0, 360]);

    return (
        <AbsoluteFill
            style={{
                background: `
          radial-gradient(ellipse at 30% 20%, rgba(236, 72, 153, 0.2) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 50%),
          linear-gradient(${gradientRotation}deg, #0f0f0f 0%, #1a0a1a 50%, #0f0f0f 100%)
        `,
                fontFamily: 'Inter, system-ui, sans-serif'
            }}
        >
            {/* Floating particles background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                opacity: 0.3
            }}>
                {[...Array(20)].map((_, i) => {
                    const x = (i * 137.5) % 100;
                    const delay = i * 50;
                    const size = 4 + (i % 4) * 2;
                    const yOffset = interpolate(
                        (frame + delay) % 200,
                        [0, 200],
                        [110, -10],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    );

                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${x}%`,
                                top: `${yOffset}%`,
                                width: size,
                                height: size,
                                borderRadius: '50%',
                                background: i % 2 === 0 ? '#ec4899' : '#a855f7'
                            }}
                        />
                    );
                })}
            </div>

            {/* Scene 1: Intro */}
            <Sequence from={startFrames.intro} durationInFrames={SCENE_DURATIONS.intro}>
                <IntroScene />
            </Sequence>

            {/* Scene 2: Simp Meter */}
            <Sequence from={startFrames.simpMeter} durationInFrames={SCENE_DURATIONS.simpMeter}>
                <SimpMeterScene
                    partnerA={props.partnerA}
                    partnerB={props.partnerB}
                    partnerAMessages={props.partnerAMessages}
                    partnerBMessages={props.partnerBMessages}
                    totalMessages={props.totalMessages}
                />
            </Sequence>

            {/* Scene 3: Texter Type */}
            <Sequence from={startFrames.texterType} durationInFrames={SCENE_DURATIONS.texterType}>
                <TexterTypeScene
                    partnerA={props.partnerA}
                    partnerB={props.partnerB}
                    dryTextByUser={props.dryTextByUser || {}}
                    longMessageByUser={props.longMessageByUser || {}}
                />
            </Sequence>

            {/* Scene 4: Red Flag Counter (NEW) */}
            <Sequence from={startFrames.redFlag} durationInFrames={SCENE_DURATIONS.redFlag}>
                <RedFlagScene
                    redFlagCount={props.redFlagCount || 0}
                    redFlagByUser={props.redFlagByUser || {}}
                    topRedFlags={props.topRedFlags || []}
                    partnerA={props.partnerA}
                    partnerB={props.partnerB}
                />
            </Sequence>

            {/* Scene 5: Apology Olympics (NEW) */}
            <Sequence from={startFrames.apology} durationInFrames={SCENE_DURATIONS.apology}>
                <ApologyScene
                    apologyCount={props.apologyCount || 0}
                    apologyByUser={props.apologyByUser || {}}
                    partnerA={props.partnerA}
                    partnerB={props.partnerB}
                />
            </Sequence>

            {/* Scene 6: Jealousy Radar (NEW) */}
            <Sequence from={startFrames.jealousy} durationInFrames={SCENE_DURATIONS.jealousy}>
                <JealousyScene
                    jealousyCount={props.jealousyCount || 0}
                    jealousyByUser={props.jealousyByUser || {}}
                    partnerA={props.partnerA}
                    partnerB={props.partnerB}
                />
            </Sequence>

            {/* Scene 7: Main Character (NEW) */}
            <Sequence from={startFrames.mainChar} durationInFrames={SCENE_DURATIONS.mainChar}>
                <MainCharacterScene
                    mainCharacterScore={props.mainCharacterScore || {}}
                    partnerA={props.partnerA}
                    partnerB={props.partnerB}
                />
            </Sequence>

            {/* Scene 8: Nickname Exposé */}
            <Sequence from={startFrames.nickname} durationInFrames={SCENE_DURATIONS.nickname}>
                <NicknameScene topNicknames={props.topNicknames} />
            </Sequence>

            {/* Scene 9: Night Owl */}
            <Sequence from={startFrames.nightOwl} durationInFrames={SCENE_DURATIONS.nightOwl}>
                <NightOwlScene nightOwlScore={props.nightOwlScore} />
            </Sequence>

            {/* Scene 10: Ghost */}
            <Sequence from={startFrames.ghost} durationInFrames={SCENE_DURATIONS.ghost}>
                <GhostScene
                    ghostingScore={props.ghostingScore || 0}
                    ghostingByUser={props.ghostingByUser || {}}
                    partnerA={props.partnerA}
                    partnerB={props.partnerB}
                />
            </Sequence>

            {/* Scene 11: Compatibility Score (NEW) */}
            <Sequence from={startFrames.compatibility} durationInFrames={SCENE_DURATIONS.compatibility}>
                <CompatibilityScene
                    compatibilityScore={props.compatibilityScore || 50}
                    compatibilityVerdict={props.compatibilityVerdict || 'Unknown'}
                    loveScore={props.loveScore || 0}
                    redFlagCount={props.redFlagCount || 0}
                    jealousyCount={props.jealousyCount || 0}
                    apologyCount={props.apologyCount || 0}
                />
            </Sequence>

            {/* Scene 12: Final Scorecard */}
            <Sequence from={startFrames.scorecard} durationInFrames={SCENE_DURATIONS.scorecard}>
                <ScorecardScene
                    totalMessages={props.totalMessages}
                    longestStreak={props.longestStreak}
                    averageReplyTime={props.averageReplyTime}
                    emojiCount={props.emojiCount}
                    verdictText={props.verdictText}
                    verdictEmoji={props.verdictEmoji}
                />
            </Sequence>
        </AbsoluteFill>
    );
};
