import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nerd Night Jeopardy! — League of Legends & Anime Edition",
  description:
    "Real-time multiplayer Jeopardy game for game night. Featuring League of Legends and Anime & Manga categories with Final Jeopardy.",
  keywords: ["jeopardy", "league of legends", "anime", "game show", "multiplayer"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} h-full`}>
      <body className="min-h-full bg-[#060818] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
