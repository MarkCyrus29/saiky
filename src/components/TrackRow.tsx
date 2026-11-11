"use client";

import React, { useState } from "react";
import { Track } from "@/src/data/tracks";
import { useAudio } from "@/src/context/AudioContext";
import { VinylDisc } from "./VinylDisc";
import { Tape } from "./Tape";

interface TrackRowProps {
  track: Track;
  index: number;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, index }) => {
  const { currentTrack, isPlaying, togglePlay, openLyrics } = useAudio();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;
  const isHighlighted = isHovered || isFocused;

  // Alternating sides: 0 & 2 (rows 1 & 3) vinyl on left; 1 & 3 (rows 2 & 4) vinyl on right
  const isVinylLeft = index % 2 === 0;

  // Fixed slight tilts between -3 and +3
  const tilts = [
    { vinyl: -1.8, title: 1.4, tape1: -2.5, tape2: 3.1 },
    { vinyl: 2.2, title: -1.9, tape1: 2.0, tape2: -3.0 },
    { vinyl: -1.2, title: 1.8, tape1: -1.5, tape2: 2.8 },
    { vinyl: 1.6, title: -2.2, tape1: 3.2, tape2: -2.4 },
  ][index % 4];

  // Has lyrics check
  const hasLyrics = track.lyrics && track.lyrics.length > 0;

  return (
    <div
      className={`track-row ${isVinylLeft ? "track-row--vinyl-left" : "track-row--vinyl-right"} ${
        isCurrentlyPlaying ? "track-row--playing" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main interactive button controlling the track playback */}
      <button
        type="button"
        className={`track-row-button ${isHighlighted ? "is-highlighted" : ""} ${
          isCurrentlyPlaying ? "is-playing" : ""
        }`}
        onClick={() => togglePlay(track)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-pressed={isCurrentlyPlaying}
        aria-label={`${isCurrentlyPlaying ? "Pause" : "Play"} track ${track.titleNum}, ${track.title}`}
      >
        {/* The Vinyl Disc */}
        <div
          className="track-vinyl-box"
          style={{ transform: `rotate(${tilts.vinyl}deg)` }}
        >
          <VinylDisc
            vinylName={track.vinylName}
            isSpinning={isCurrentlyPlaying}
            isHoveredOrFocused={isHighlighted}
            isPlaying={isCurrentlyPlaying}
            size={220}
          />
        </div>

        {/* The Title Scrap */}
        <div
          className={`track-title-scrap ${isCurrentlyPlaying ? "is-lifted" : ""}`}
          style={{ transform: `rotate(${tilts.title}deg)` }}
        >
          {/* Taped pieces */}
          <Tape
            variant={index === 1 ? "cyan" : "cream"}
            angle={tilts.tape1}
            width={75}
            height={24}
            style={{ position: "absolute", top: -10, left: 24, zIndex: 5 }}
          />
          <Tape
            variant={index === 3 ? "kraft" : "paper"}
            angle={tilts.tape2}
            width={80}
            height={24}
            style={{ position: "absolute", bottom: -10, right: 30, zIndex: 5 }}
          />

          <div className="title-image-stack">
            {/* Normal title slice */}
            <picture>
              <source srcSet={`/assets/title-${track.titleNum}.webp`} type="image/webp" />
              <img
                src={`/assets/title-${track.titleNum}.jpg`}
                alt={`${track.titleNum}. ${track.title}`}
                width={1200}
                height={index === 3 ? 380 : 490}
                className="title-img title-img--normal"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </picture>

            {/* Hover marker wipe overlay */}
            <picture
              className={`title-img-hover-wrapper ${
                isHighlighted ? "is-active" : ""
              } ${isCurrentlyPlaying ? "is-touch-playing" : ""}`}
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
                height={index === 3 ? 380 : 490}
                className="title-img title-img--hover"
              />
            </picture>
          </div>
        </div>
      </button>

      {/* Lyrics note scrap (if lyrics exist) */}
      {hasLyrics && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openLyrics(track);
          }}
          className={`lyrics-tag-button ${
            isHighlighted ? "lyrics-tag-button--visible" : ""
          }`}
          aria-label={`Open lyrics for ${track.title}`}
          style={{ transform: `rotate(${tilts.title + 4}deg)` }}
        >
          <Tape
            variant="cyan"
            angle={-3}
            width={38}
            height={16}
            style={{ position: "absolute", top: -6, left: 6, zIndex: 2 }}
          />
          <span className="lyrics-tag-text">lyrics</span>
        </button>
      )}
    </div>
  );
};

