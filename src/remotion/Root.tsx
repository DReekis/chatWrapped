import { Composition } from 'remotion';
import { IshqAuditVideo } from './IshqAuditVideo';

// Default props for preview
const defaultProps = {
    totalMessages: 12500,
    partnerA: 'You',
    partnerB: 'Babu',
    partnerAMessages: 7500,
    partnerBMessages: 5000,
    topNicknames: [
        { nickname: 'baby', count: 842 },
        { nickname: 'jaan', count: 456 },
        { nickname: 'shona', count: 234 }
    ],
    nightOwlScore: 35,
    longestStreak: 180,
    averageReplyTime: 4.2,
    emojiCount: 5600,
    verdictText: 'Certified Soulmates',
    verdictEmoji: '💕',
    // Deep stats
    dryTextByUser: { 'You': 245, 'Babu': 189 },
    longMessageByUser: { 'You': 67, 'Babu': 134 },
    ghostingScore: 42,
    ghostingByUser: { 'You': 28, 'Babu': 14 },
    // Viral audit stats
    redFlagCount: 156,
    redFlagByUser: { 'You': 89, 'Babu': 67 },
    topRedFlags: ['theek hai', 'whatever', 'k'],
    apologyCount: 234,
    apologyByUser: { 'You': 178, 'Babu': 56 },
    jealousyCount: 89,
    jealousyByUser: { 'You': 34, 'Babu': 55 },
    mainCharacterScore: { 'You': 45, 'Babu': 28 },
    loveScore: 1256,
    compatibilityScore: 72,
    compatibilityVerdict: 'Couple Goals 💑'
};

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="ChatWrappedVideo"
                component={IshqAuditVideo as unknown as React.ComponentType<Record<string, unknown>>}
                durationInFrames={1500} // 50 seconds at 30fps (12 scenes)
                fps={30}
                width={1080}
                height={1920}
                defaultProps={defaultProps as Record<string, unknown>}
            />
        </>
    );
};
