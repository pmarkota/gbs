import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  hadriaticRegular,
  hadriaticBold,
  hadriaticItalic,
  hadriaticBoldItalic,
} from "./fonts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GambleShield - Shield Your Game, Boost Your Wins",
  description:
    "GambleShield helps casino slot players enhance their skills, maximize earnings, and minimize losses through expert strategies and community support.",
  keywords:
    "gambling, slots, casino, strategy, winnings, gambling tips, online casino",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${hadriaticRegular.variable} ${hadriaticBold.variable} ${hadriaticItalic.variable} ${hadriaticBoldItalic.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
