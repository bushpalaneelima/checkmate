import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Checkmate — Fantasy Cricket Auction",
  description: "The ultimate fantasy cricket auction platform. Bid on IPL players, build your squad, and win the league. Powered by NB Blue Studios.",
  openGraph: {
    title: "Checkmate — Fantasy Cricket Auction",
    description: "Bid smart. Build the perfect squad. Outsmart every manager in the room.",
    url: "https://checkmate.nbbluestudios.com",
    siteName: "Checkmate",
    images: [
      {
        url: "https://checkmate.nbbluestudios.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Checkmate Fantasy Cricket Auction",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Checkmate — Fantasy Cricket Auction",
    description: "Bid smart. Build the perfect squad. Outsmart every manager in the room.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
  suppressHydrationWarning
  className="min-h-full flex flex-col"
>
  {children}
</body>
    </html>
  );
}
