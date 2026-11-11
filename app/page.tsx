"use client";

import React from "react";
import { Header } from "@/src/components/Header";
import { PlayerView } from "@/src/components/PlayerView";
import { LyricsSheet } from "@/src/components/LyricsSheet";
import { useAudio } from "@/src/context/AudioContext";

export default function Home() {
  const { error } = useAudio();

  return (
    <main className="desk-surface">
      <div className="desk-content">
        {/* Header Drawing */}
        <Header />

        {/* Player View */}
        <PlayerView />

        {/* Lyrics Sheet Modal */}
        <LyricsSheet />

        {/* Audio Error Note */}
        {error && (
          <aside className="audio-error-scrap" role="alert">
            <span>{error}</span>
          </aside>
        )}
      </div>
    </main>
  );
}
