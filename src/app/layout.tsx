import type { Metadata } from "next";
import "./globals.css";
import "../styles/game.css";

export const metadata: Metadata = {
  title: "MV Escape - K-pop Music Video Escape Room",
  description:
    "Rescue the members trapped inside the music video before the song ends!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-white antialiased">
        {children}
      </body>
    </html>
  );
}
