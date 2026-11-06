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
    icon: [
      { url: "/pomodoro.ico?v=2", type: "image/x-icon" },
    ],
    shortcut: "/pomodoro.ico?v=2",
    apple: "/pomodoro.ico?v=2",
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
