"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/src/components/Header";
import { ViewSwitch, ViewMode } from "@/src/components/ViewSwitch";
import { TrackRow } from "@/src/components/TrackRow";
import { PlayerView } from "@/src/components/PlayerView";
import { LyricsSheet } from "@/src/components/LyricsSheet";
import { MiniPlayer } from "@/src/components/MiniPlayer";
import { TRACKS } from "@/src/data/tracks";
import { useAudio } from "@/src/context/AudioContext";
import { Tape } from "@/src/components/Tape";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("rows");
  const { error } = useAudio();

  // Load view mode from URL search param or localStorage safely
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlMode = params.get("mode");
        if (urlMode === "player" || urlMode === "rows") {
          setViewMode(urlMode);
          return;
        }
      }
      const saved = localStorage.getItem("saiky-view-mode");
      if (saved === "rows" || saved === "player") {
        setViewMode(saved);
      }
    } catch (e) {
      console.warn("Could not read view mode:", e);
    }
  }, []);

  const handleModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
    try {
      localStorage.setItem("saiky-view-mode", newMode);
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
  };

  return (
    <main className="desk-surface">
      <div className="desk-content">
        {/* Header Drawing */}
        <Header />

        {/* View Switch: Rows vs Player */}
        <ViewSwitch mode={viewMode} onChange={handleModeChange} />

        {/* Tracklist Views */}
        {viewMode === "rows" ? (
          <div className="tracklist-rows-view">
            {TRACKS.map((track, idx) => (
              <TrackRow key={track.id} track={track} index={idx} />
            ))}
          </div>
        ) : (
          <PlayerView />
        )}

        {/* Lyrics Sheet Modal */}
        <LyricsSheet />

        {/* Persistent Mini Player when scrolled */}
        <MiniPlayer />

        {/* Audio Error Note */}
        {error && (
          <aside className="audio-error-scrap" role="alert">
            <Tape
              variant="cream"
              angle={-2}
              width={35}
              height={14}
              style={{ position: "absolute", top: -6, left: 10 }}
            />
            <span>{error}</span>
          </aside>
        )}
      </div>
    </main>
  );
}
