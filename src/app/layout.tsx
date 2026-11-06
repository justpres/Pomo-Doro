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
    "flow state"
  ],
  authors: [{ name: "PomodoFocus Team" }],
  creator: "PomodoFocus",
  publisher: "PomodoFocus",
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
    <html lang="en">
      <body
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
