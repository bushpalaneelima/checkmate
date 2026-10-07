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
  title: "Game of Gambits — Strategic Decision Simulation",
  description:
    "Game of Gambits is a strategic decision simulation by NB Blue Studios. Build your squad, manage resources, make smart bids, and compete through strategy and decision-making.",
  openGraph: {
    title: "Game of Gambits — Strategic Decision Simulation",
    description:
      "Build your squad. Manage resources. Outsmart the competition.",
    url: "https://www.gameofgambits.com",
    siteName: "Game of Gambits",
    images: [
      {
        url: "https://www.gameofgambits.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Game of Gambits",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Game of Gambits — Strategic Decision Simulation",
    description:
      "Build your squad. Manage resources. Outsmart the competition.",
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
