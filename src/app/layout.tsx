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

export const metadata: Metadata = {
  title: "Pomodoro Timer",
  description: "A beautifully designed, minimalist Pomodoro timer to help you stay focused and productive.",
  icons: {
    icon: "/pomodoro.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pomodoro",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF6B6B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Navigation />
        {/* Desktop: top padding only. Mobile: no extra padding needed with floating button */}
        <main className="pt-14 md:pt-14">
          {children}
        </main>
        <MusicPlayer />
        <TimerProvider />
      </body>
    </html>
  );
}
