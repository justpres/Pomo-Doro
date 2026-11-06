import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { MusicPlayer } from "@/components/MusicPlayer";
import { TimerProvider } from "@/components/TimerProvider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://pomodofocus.vercel.app');

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#webapp`,
      "name": "PomodoFocus",
      "url": siteUrl,
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "softwareVersion": "1.0.0",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "description":
        "A refined, minimalist Pomodoro timer featuring ambient lofi radio, organic dynamic island controls, task management, and deep work presets.",
      "featureList": [
        "24/7 Lofi Hip Hop & Jazz Radio Streams",
        "Single-Path Liquid Meniscus Dynamic Island Audio Player",
        "Customizable Focus & Break Intervals",
        "Local-First Task Management with Pomodoro Estimation",
        "Picture-in-Picture Document PiP Support",
        "Session Rating & Daily Productivity Heatmap",
        "100% Privacy-First with Local Storage",
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${siteUrl}/#howto`,
      "name": "How to Use the Pomodoro Technique with PomodoFocus",
      "description":
        "Step-by-step methodology to boost deep work and sustain cognitive focus using PomodoFocus.",
      "totalTime": "PT30M",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Select Your Task",
          "text":
            "Choose a single objective from your task list and set an estimated number of Pomodoros.",
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Start the 25-Minute Focus Session",
          "text":
            "Start the timer and optionally select an ambient soundscape (Lofi 24/7, Chillhop Radio, Smooth Jazz, or Cafe Vibes) to induce flow state.",
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Work with Unbroken Focus",
          "text":
            "Immerse in your work until the timer reaches zero. Avoid multitasking or context switching.",
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "name": "Take a 5-Minute Short Break",
          "text":
            "Step away from the screen, stretch, or hydrate while the ambient audio relaxes.",
        },
        {
          "@type": "HowToStep",
          "position": 5,
          "name": "Complete 4 Cycles and Take a Long Break",
          "text":
            "After completing 4 consecutive Pomodoro intervals, take an extended 15-to-30 minute rest to recharge.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is PomodoFocus?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "PomodoFocus is a free, minimalist Pomodoro timer application that combines deep-focus work intervals with integrated 24/7 ambient lofi and jazz radio stations hosted in an organic Dynamic Island interface.",
          },
        },
        {
          "@type": "Question",
          "name": "How does the Pomodoro Technique work in PomodoFocus?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "The Pomodoro Technique breaks work into 25-minute focused sprints separated by 5-minute short breaks. After completing four sprints, you take a longer 15-30 minute break to sustain cognitive stamina.",
          },
        },
        {
          "@type": "Question",
          "name": "What soundscapes and music stations are included in PomodoFocus?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "PomodoFocus features 4 curated streams: Lofi 24/7 (chill beats to relax/study to), Chillhop Radio (jazzy & lofi hip hop), Smooth Chill (relaxing smooth jazz & beats), and Coffee Shop Vibes (cafe ambiance & jazz).",
          },
        },
        {
          "@type": "Question",
          "name": "Is PomodoFocus free and private?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Yes, PomodoFocus is 100% free with no ads, tracking, or account registration. All task data, presets, and productivity statistics are stored locally on your device via browser storage.",
          },
        },
        {
          "@type": "Question",
          "name": "Does PomodoFocus support Picture-in-Picture (PiP)?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Yes, PomodoFocus supports Document Picture-in-Picture on compatible browsers, allowing you to float a mini timer on top of code editors, spreadsheets, and other apps.",
          },
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PomodoFocus — Minimalist Timer & Lofi Soundscapes",
    template: "%s | PomodoFocus",
  },
  description:
    "A beautifully designed, minimalist Pomodoro timer featuring ambient lofi radio, organic dynamic island controls, task management, and deep work presets.",
  keywords: [
    "pomodoro timer",
    "lofi music",
    "lofi radio",
    "study timer",
    "focus timer",
    "productivity app",
    "pomodofocus",
    "chillhop",
    "ambient soundscapes",
    "flow state",
    "deep work timer",
    "minimalist timer",
  ],
  authors: [{ name: "PomodoFocus Team" }],
  creator: "PomodoFocus",
  publisher: "PomodoFocus",
  category: "productivity",
  classification: "Productivity Application",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/pomodoro.ico?v=2", type: "image/x-icon" },
    ],
    shortcut: "/pomodoro.ico?v=2",
    apple: "/pomodoro.ico?v=2",
  },
  openGraph: {
    title: "PomodoFocus — Minimalist Timer & Lofi Soundscapes",
    description:
      "A beautifully designed, minimalist Pomodoro timer featuring ambient lofi radio, organic dynamic island controls, task management, and deep work presets.",
    url: siteUrl,
    siteName: "PomodoFocus",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PomodoFocus — Minimalist Timer & Lofi Soundscapes",
    description:
      "A beautifully designed, minimalist Pomodoro timer featuring ambient lofi radio, organic dynamic island controls, task management, and deep work presets.",
    creator: "@pomodofocus",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PomodoFocus",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF6363",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased min-h-screen text-[var(--text-dark)] bg-[var(--background)] transition-colors duration-500`}
      >
        <Navigation />
        <main className="pt-20 pb-28 md:pt-32 md:pb-16 min-h-screen">
          {children}
        </main>
        <MusicPlayer />
        <TimerProvider />
      </body>
    </html>
  );
}
