"use client";

import React, { useState } from "react";
import { Track, TRACKS } from "@/src/data/tracks";
import { useAudio } from "@/src/context/AudioContext";
import { VinylDisc } from "./VinylDisc";
import { Tape } from "./Tape";

export const PlayerView: React.FC = () => {
  const { currentTrack, isPlaying, togglePlay, openLyrics } = useAudio();
  const [hoveredTrackId, setHoveredTrackId] = useState<number | null>(null);

  // Active track shown on the turntable: currently playing or track 1
  const activeTrack = currentTrack || TRACKS[0];
  const isDiscSpinning = isPlaying && currentTrack?.id === activeTrack.id;

  const tilts = [1.2, -1.8, 1.5, -1.4];

  return (
    <div className="player-view-container">
      {/* Center Turntable Area */}
      <div className="player-turntable-card">
        <button
          type="button"
          onClick={() => togglePlay(activeTrack)}
          className="player-disc-button"
          aria-label={`${isDiscSpinning ? "Pause" : "Play"} ${activeTrack.title}`}
          aria-pressed={isDiscSpinning}
        >
          <div
            key={activeTrack.id}
            className="player-vinyl-drop"
          >
            <VinylDisc
              vinylName={activeTrack.vinylName}
              isSpinning={isDiscSpinning}
              isHoveredOrFocused={hoveredTrackId === activeTrack.id}
              isPlaying={isDiscSpinning}
              size={360}
            />
          </div>
        </button>

        {/* Small handwritten cue under the vinyl */}
        <div className="player-hint-scrap" style={{ transform: "rotate(-1deg)" }}>
          <Tape
            variant="cream"
            angle={-1.5}
            width={40}
            height={16}
            style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%) rotate(-1.5deg)" }}
          />
          <span className="player-hint-text">
            {isDiscSpinning ? "click disc to pause" : "click disc to play"}
          </span>
        </div>
      </div>

      {/* Playlist Scraps Beside Disc */}
      <div className="player-titles-column">
        {TRACKS.map((track, idx) => {
          const isSelected = activeTrack.id === track.id;
          const isTrackPlaying = isPlaying && currentTrack?.id === track.id;
          const isHovered = hoveredTrackId === track.id;
          const hasLyrics = track.lyrics && track.lyrics.length > 0;

          return (
            <div
              key={track.id}
              className="player-title-item"
              onMouseEnter={() => setHoveredTrackId(track.id)}
              onMouseLeave={() => setHoveredTrackId(null)}
            >
              <button
                type="button"
                onClick={() => togglePlay(track)}
                className={`player-title-scrap ${
                  isSelected ? "player-title-scrap--selected" : ""
                } ${isTrackPlaying ? "is-playing is-lifted" : ""}`}
                style={{ transform: `rotate(${tilts[idx % tilts.length]}deg)` }}
                aria-pressed={isTrackPlaying}
                aria-label={`${isTrackPlaying ? "Pause" : "Play"} track ${track.titleNum}, ${track.title}`}
              >
                <Tape
                  variant={isSelected ? "cyan" : idx === 1 ? "kraft" : "cream"}
                  angle={idx % 2 === 0 ? -2 : 2.5}
                  width={60}
                  height={20}
                  style={{ position: "absolute", top: -8, left: 16 }}
                />

                <div className="title-image-stack">
                  <picture>
                    <source srcSet={`/assets/title-${track.titleNum}.webp`} type="image/webp" />
                    <img
                      src={`/assets/title-${track.titleNum}.jpg`}
                      alt={`${track.titleNum}. ${track.title}`}
                      width={1200}
                      height={track.titleNum === 4 ? 380 : 490}
                      className="title-img title-img--normal"
                    />
                  </picture>

                  <picture
                    className={`title-img-hover-wrapper ${
                      isHovered || isSelected ? "is-active" : ""
                    } ${isTrackPlaying ? "is-touch-playing" : ""}`}
                    aria-hidden="true"
                  >
                    <source
                      srcSet={`/assets/title-${track.titleNum}_hover.webp`}
                      type="image/webp"
                    />
                    <img
                      src={`/assets/title-${track.titleNum}_hover.jpg`}
                      alt=""
                      width={1200}
                      height={track.titleNum === 4 ? 380 : 490}
                      className="title-img title-img--hover"
                    />
                  </picture>
                </div>
              </button>

              {hasLyrics && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLyrics(track);
                  }}
                  className={`lyrics-tag-button ${
                    isHovered ? "lyrics-tag-button--visible" : ""
                  }`}
                  aria-label={`Open lyrics for ${track.title}`}
                  style={{ transform: "rotate(3deg)" }}
                >
                  <Tape
                    variant="cyan"
                    angle={-2}
                    width={34}
                    height={14}
                    style={{ position: "absolute", top: -5, left: 4 }}
                  />
                  <span className="lyrics-tag-text">lyrics</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

