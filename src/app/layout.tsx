import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeoPet — AI Virtual Companion",
  description: "An AI-powered virtual pet with thoughts, feelings, and evolving personality. Feed, play, chat, and watch it grow!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <div className="scanlines" />
        {children}
      </body>
    </html>
  );
}
