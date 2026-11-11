"use client";

import React from "react";
import { useAudio } from "@/src/context/AudioContext";
import { VinylDisc } from "./VinylDisc";
import { Tape } from "./Tape";

export const MiniPlayer: React.FC = () => {
  const { currentTrack, isPlaying, togglePlay } = useAudio();

  if (!currentTrack) return null;

  return (
    <aside
      className="mini-player-scrap"
      aria-label="Audio playback controls"
    >
      <Tape
        variant="cyan"
        angle={-2}
        width={42}
        height={16}
        style={{ position: "absolute", top: -7, left: 16 }}
      />

      <div className="mini-player-content">
        {/* Tiny spinning vinyl */}
        <div className="mini-player-disc-box">
          <VinylDisc
            vinylName={currentTrack.vinylName}
            isSpinning={isPlaying}
            isPlaying={isPlaying}
            size={52}
          />
        </div>

        {/* Info */}
        <div className="mini-player-info">
          <span className="mini-player-track">
            {currentTrack.titleNum}. {currentTrack.title}
          </span>
          <span className="mini-player-artist">Saiky</span>
        </div>

        {/* Play/pause button */}
        <button
          type="button"
          onClick={() => togglePlay()}
          className="mini-player-toggle"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
      </div>
    </aside>
  );
};

