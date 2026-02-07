'use client';

import { useEffect } from 'react';
import { seoTitles, landingPageTitles } from '@/lib/sentiment_data';

interface SeoManagerProps {
    detectedLanguage?: string;
    isResultsPage?: boolean;
}

// Dynamic SEO meta tags based on detected language
export default function SeoManager({
    detectedLanguage = 'en',
    isResultsPage = false
}: SeoManagerProps) {
    useEffect(() => {
        // Get appropriate title
        let title: string;

        if (isResultsPage) {
            // Use language-specific title for results page
            title = seoTitles[detectedLanguage] || seoTitles['en'];
        } else {
            // A/B test with random title on landing page
            title = landingPageTitles[Math.floor(Math.random() * landingPageTitles.length)];
        }

        // Update document title
        document.title = title;

        // Update meta description
        const description = getMetaDescription(detectedLanguage);
        updateMetaTag('description', description);

        // Update Open Graph tags
        updateMetaTag('og:title', title, 'property');
        updateMetaTag('og:description', description, 'property');
        updateMetaTag('og:type', 'website', 'property');

        // Update Twitter Card tags
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);

        // Update language meta
        const htmlLang = getHtmlLang(detectedLanguage);
        document.documentElement.lang = htmlLang;

    }, [detectedLanguage, isResultsPage]);

    return null; // This component only modifies the head
}

function updateMetaTag(name: string, content: string, type: 'name' | 'property' = 'name') {
    const selector = type === 'property'
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;

    let meta = document.querySelector(selector) as HTMLMetaElement;

    if (!meta) {
        meta = document.createElement('meta');
        if (type === 'property') {
            meta.setAttribute('property', name);
        } else {
            meta.name = name;
        }
        document.head.appendChild(meta);
    }

    meta.content = content;
}

function getMetaDescription(lang: string): string {
    const descriptions: Record<string, string> = {
        en: "Analyze your WhatsApp chats to discover who loves who more. 100% private, works offline. The viral couple test for Valentine's 2026!",
        hi: "Apne WhatsApp chats ka analysis karo aur jano ki sachha pyar hai ya timepass! 100% private, offline kaam karta hai.",
        es: "Analiza tus chats de WhatsApp y descubre quién ama más. 100% privado, funciona sin conexión. ¡La prueba viral para parejas!",
        fr: "Analysez vos conversations WhatsApp pour découvrir qui aime le plus. 100% privé, fonctionne hors ligne.",
        mr: "तुमच्या WhatsApp चॅट्सचे विश्लेषण करा आणि जाणून घ्या कोण जास्त प्रेम करतो. 100% खाजगी!",
        bn: "আপনার WhatsApp চ্যাট বিশ্লেষণ করুন এবং জানুন কে বেশি ভালোবাসে। 100% প্রাইভেট!",
        ta: "உங்கள் WhatsApp சாட்களை பகுப்பாய்வு செய்து யார் அதிகம் நேசிக்கிறார் என்று கண்டறியுங்கள்!",
        te: "మీ WhatsApp చాట్‌లను విశ్లేషించండి మరియు ఎవరు ఎక్కువ ప్రేమిస్తారో కనుగొనండి!"
    };

    return descriptions[lang] || descriptions['en'];
}

function getHtmlLang(lang: string): string {
    const langMap: Record<string, string> = {
        en: 'en',
        hi: 'hi',
        es: 'es',
        fr: 'fr',
        mr: 'mr',
        bn: 'bn',
        ta: 'ta',
        te: 'te'
    };

    return langMap[lang] || 'en';
}

// Static SEO metadata for Next.js
export const staticMetadata = {
    title: "ChatWrapped 2026 - Your Relationship Wrapped",
    description: "Analyze your WhatsApp chats to discover who loves who more. 100% private, works in airplane mode. Your chats never leave your phone!",
    keywords: [
        "chatwrapped",
        "chat wrapped",
        "relationship wrapped",
        "whatsapp chat analyzer",
        "couple quiz",
        "valentine 2026",
        "love calculator",
        "couple goals test",
        "who texts more",
        "relationship test",
        "whatsapp analysis",
        "offline chat analyzer"
    ].join(", "),
    openGraph: {
        title: "ChatWrapped 2026 - Who Loves Who More?",
        description: "Analyze your WhatsApp chats. 100% private - works in airplane mode!",
        type: "website",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "ChatWrapped 2026"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "ChatWrapped 2026 - The Viral Couple Test",
        description: "Analyze your WhatsApp chats. 100% private - works in airplane mode!"
    }
};
