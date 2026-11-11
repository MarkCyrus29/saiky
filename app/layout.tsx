import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AudioProvider } from "@/src/context/AudioContext";
import { MiniPlayer } from "@/src/components/MiniPlayer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "saiky's space",
  description: "check out saiky's music!",
  icons: {
    icon: [
      { url: "/assets/favicon.png", type: "image/png" },
      { url: "/favicon.ico" }
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Caveat:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AudioProvider>
          {children}
          <MiniPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}
