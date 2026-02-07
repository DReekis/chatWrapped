import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ishq Audit 2026 - Relationship Wrapped",
  description: "Analyze your WhatsApp chats to discover who loves who more. 100% private, works offline. The viral couple test for Valentine's 2026!",
  keywords: [
    "relationship wrapped",
    "whatsapp chat analyzer",
    "couple quiz",
    "long distance relationship games",
    "valentine gift ideas 2026",
    "ishq audit",
    "love calculator",
    "situationship test",
    "who texts more",
    "couple goals test",
    "is he cheating test",
    "love meter",
    "relationship test"
  ],
  openGraph: {
    title: "Ishq Audit 2026 - Who Loves Who More?",
    description: "Analyze your WhatsApp chats. 100% private & offline. The viral couple test!",
    type: "website",
    siteName: "Ishq Audit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ishq Audit 2026 - Relationship Wrapped"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Ishq Audit 2026 - The Viral Couple Test",
    description: "Analyze your WhatsApp chats. 100% private & offline.",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true
  },
  authors: [{ name: "Ishq Audit" }],
  creator: "Ishq Audit",
  publisher: "Ishq Audit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#0f0f0f" />
        <meta name="color-scheme" content="dark" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-900 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
