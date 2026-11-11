"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Track, TRACKS } from "@/src/data/tracks";
import { useAudio } from "@/src/context/AudioContext";
import { VinylDisc } from "./VinylDisc";

function formatTime(sec: number): string {
  if (isNaN(sec) || !isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export const PlayerView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    seek,
    togglePlay,
    nextTrack,
    prevTrack,
  } = useAudio();

  const [hoveredTrackId, setHoveredTrackId] = useState<number | null>(null);
  const [discHovered, setDiscHovered] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.85);

  // Active track shown on the turntable: currently playing or track 1
  const activeTrack = currentTrack || TRACKS[0];
  const isDiscSpinning = isPlaying && currentTrack?.id === activeTrack.id;

  // Askew angles for hover & active playing states
  const tilts = [-1.8, 1.6, -1.5, 1.7];

  const handleMuteToggle = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume || 0.85);
    }
  };

  return (
    <div className="player-view-container">
      {/* Center Turntable & Audio Controls Area */}
      <div className="player-turntable-card">
        {/* Disc Area with Center Audio Controls on Hover */}
        <div
          className="player-disc-area"
          onMouseEnter={() => setDiscHovered(true)}
          onMouseLeave={() => setDiscHovered(false)}
        >
          <button
            type="button"
            onClick={() => togglePlay(activeTrack)}
            className="player-disc-button"
            aria-label={`${isDiscSpinning ? "Pause" : "Play"} ${activeTrack.title}`}
            aria-pressed={isDiscSpinning}
          >
            <div key={activeTrack.id} className="player-vinyl-drop">
              <VinylDisc
                vinylName={activeTrack.vinylName}
                isSpinning={isDiscSpinning}
                isHoveredOrFocused={discHovered}
                isPlaying={isDiscSpinning}
                size={310}
              />
            </div>
          </button>

          {/* Centered Audio Controls on the Disc (prev, play/pause, next) */}
          {discHovered && (
            <div className="disc-hover-controls" role="group" aria-label="Playback controls">
              <button
                type="button"
                className="disc-control-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  prevTrack();
                }}
                aria-label="Previous track"
                title="Previous track"
              >
                ⏮
              </button>
              <button
                type="button"
                className="disc-control-btn disc-control-btn--play"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay(activeTrack);
                }}
                aria-label={isDiscSpinning ? "Pause" : "Play"}
                title={isDiscSpinning ? "Pause" : "Play"}
              >
                {isDiscSpinning ? "❚❚" : "▶"}
              </button>
              <button
                type="button"
                className="disc-control-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  nextTrack();
                }}
                aria-label="Next track"
                title="Next track"
              >
                ⏭
              </button>
            </div>
          )}
        </div>

        {/* Track Time (Spotify style) & Volume Controller - NOT centered on disc */}
        <div className="player-bottom-controls">
          {/* Track Time scrubber row */}
          <div className="player-progress-row">
            <span className="player-time-text" aria-label="Current time">
              {formatTime(currentTime)}
            </span>
            <div className="player-slider-wrapper">
              <input
                type="range"
                min={0}
                max={duration > 0 ? duration : 100}
                step={0.5}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="player-progress-slider"
                aria-label="Track progress"
              />
            </div>
            <span className="player-time-text" aria-label="Duration">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume Controller row */}
          <div className="player-volume-row">
            <button
              type="button"
              onClick={handleMuteToggle}
              className="player-volume-btn"
              aria-label={volume === 0 ? "Unmute" : "Mute"}
              title={volume === 0 ? "Unmute" : "Mute"}
            >
              {volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="player-volume-slider"
              aria-label="Volume slider"
            />
          </div>
        </div>
      </div>

      {/* Playlist Scraps Beside Disc */}
      <div className="player-titles-column">
        {TRACKS.map((track, idx) => {
          const isSelected = activeTrack.id === track.id;
          const isTrackPlaying = isPlaying && currentTrack?.id === track.id;
          const isHovered = hoveredTrackId === track.id;
          const isAskew = isHovered || isTrackPlaying;

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
                } ${isTrackPlaying ? "is-playing" : ""}`}
                style={{
                  transform: `rotate(${isAskew ? tilts[idx % tilts.length] : 0}deg)`,
                }}
                aria-pressed={isTrackPlaying}
                aria-label={`${isTrackPlaying ? "Pause" : "Play"} track ${track.titleNum}, ${track.title}`}
              >
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

              {/* Tooltip on hovering ANY track name */}
              {isHovered && (
                <Link
                  href={`/track/${track.slug}/lyrics`}
                  className="lyrics-tooltip-pill"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  aria-label={`Open lyrics for ${track.title}`}
                >
                  <span className="lyrics-tooltip-text">open lyrics?</span>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
