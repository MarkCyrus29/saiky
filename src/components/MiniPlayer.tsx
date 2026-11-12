"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useAudio } from "@/src/context/AudioContext";
import { VinylDisc } from "./VinylDisc";

export const MiniPlayer: React.FC = () => {
  const pathname = usePathname();
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack } = useAudio();

  // ONLY show when user is NOT on the main page
  if (pathname === "/") return null;

  if (!currentTrack) return null;

  return (
    <aside
      className="mini-player-scrap"
      aria-label="Audio playback controls"
    >
      <div className="mini-player-content">
        {/* Rolling vinyl disc */}
        <div className="mini-player-disc-box">
          <VinylDisc
            vinylName={currentTrack.vinylName}
            isSpinning={isPlaying}
            isPlaying={isPlaying}
            size={48}
          />
        </div>

        {/* Track info */}
        <div className="mini-player-info">
          <span className="mini-player-track">
            {currentTrack.titleNum ? `${currentTrack.titleNum}. ` : ""}{currentTrack.title}
          </span>
          <span className="mini-player-artist">Saiky</span>
        </div>

        {/* Playback Controls */}
        <div className="mini-player-controls">
          <button
            type="button"
            onClick={prevTrack}
            className="mini-player-ctrl-btn mini-player-btn--prev"
            aria-label="Last song"
            title="Last song"
          >
            <SkipBack size={14} />
          </button>

          <button
            type="button"
            onClick={() => togglePlay()}
            className="mini-player-toggle"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>

          <button
            type="button"
            onClick={nextTrack}
            className="mini-player-ctrl-btn mini-player-btn--next"
            aria-label="Next song"
            title="Next song"
          >
            <SkipForward size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

