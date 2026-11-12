"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Disc3,
  Film,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  VolumeX,
  Volume1,
  Volume2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Track, TRACKS } from "@/src/data/tracks";
import { useAudio } from "@/src/context/AudioContext";
import { VinylDisc } from "./VinylDisc";
import { MusicVideoPlayer } from "./MusicVideoPlayer";

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
    playTrack,
    nextTrack,
    prevTrack,
  } = useAudio();

  const [mediaMode, setMediaMode] = useState<"audio" | "video">("audio");
  const [hoveredTrackId, setHoveredTrackId] = useState<number | null>(null);
  const [discHovered, setDiscHovered] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.85);

  // Active track shown on the turntable / video player: currently playing or track 1
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

  const handleTrackSelect = (track: Track) => {
    playTrack(track);
  };

  return (
    <div className="player-section-wrapper">
      {/* Media Mode Toggle (bottom of socials, top of disc/tracklist) */}
      <div className="media-mode-toggle-bar">
        <div className="media-mode-toggle-scrap">
          <button
            type="button"
            className={`media-mode-toggle-btn ${
              mediaMode === "audio" ? "is-active" : ""
            }`}
            onClick={() => setMediaMode("audio")}
            aria-pressed={mediaMode === "audio"}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Disc3 size={15} />
            <span>spinning disc</span>
          </button>
          <button
            type="button"
            className={`media-mode-toggle-btn ${
              mediaMode === "video" ? "is-active" : ""
            }`}
            onClick={() => setMediaMode("video")}
            aria-pressed={mediaMode === "video"}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Film size={15} />
            <span>music video</span>
          </button>
        </div>
      </div>

      {/* Main View Container (Side-by-Side OR Full Theater Mode for Video) */}
      <div
        className={`player-view-container ${
          mediaMode === "video" ? "player-view-container--theater" : ""
        }`}
      >
        {/* Left Side (or Full Width in Theater): Vinyl Turntable OR Music Video */}
        {mediaMode === "audio" ? (
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
                    size={345}
                  />
                </div>
              </button>

              {/* Centered Audio Controls on the Disc (prev, play/pause, next) */}
              {discHovered && (
                <div
                  className="disc-hover-controls"
                  role="group"
                  aria-label="Playback controls"
                >
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
                    <SkipBack size={16} />
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
                    {isDiscSpinning ? <Pause size={18} /> : <Play size={18} />}
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
                    <SkipForward size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Small handwritten cue under the vinyl */}
            <div
              className="player-hint-scrap"
              style={{ transform: "rotate(-1deg)" }}
            >
              <span className="player-hint-text">
                {isDiscSpinning ? "click disc to pause" : "click disc to play"}
              </span>
            </div>

            {/* Track Time (Spotify style) & Volume Controller */}
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
                  {volume === 0 ? (
                    <VolumeX size={16} />
                  ) : volume < 0.5 ? (
                    <Volume1 size={16} />
                  ) : (
                    <Volume2 size={16} />
                  )}
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
        ) : (
          <div className="player-video-column">
            <MusicVideoPlayer
              track={activeTrack}
              theaterMode={true}
              onPrevTrack={prevTrack}
              onNextTrack={nextTrack}
              onSwitchToAudio={() => setMediaMode("audio")}
            />

            {/* Theater Mode: Tracklist is removed, and ONLY the currently playing track displays at the bottom */}
            <div className="theater-bottom-bar">
              <div className="theater-track-info">
                <div className="theater-track-scrap">
                  <span className="theater-track-badge">
                    {activeTrack.titleNum}.
                  </span>
                  <h2 className="theater-track-title">{activeTrack.title}</h2>
                </div>

                <div className="theater-track-actions">
                  <button
                    type="button"
                    className="theater-action-btn"
                    onClick={prevTrack}
                    aria-label="Previous track"
                    title="Previous track"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <SkipBack size={14} />
                    <span>prev</span>
                  </button>
                  <button
                    type="button"
                    className="theater-action-btn"
                    onClick={nextTrack}
                    aria-label="Next track"
                    title="Next track"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <span>next</span>
                    <SkipForward size={14} />
                  </button>
                  <Link
                    href={`/track/${activeTrack.slug}/lyrics`}
                    className="theater-lyrics-link"
                    aria-label={`Open lyrics for ${activeTrack.title}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <span>lyrics</span>
                    <FileText size={14} />
                  </Link>
                  {activeTrack.youtubeId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${activeTrack.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="theater-action-btn"
                      title="Watch on YouTube"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <span>YouTube</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Playlist Scraps (Hidden in Video Theater Mode) */}
        {mediaMode === "audio" && (
          <div className="player-titles-column">
            {TRACKS.map((track, idx) => {
              const isSelected = activeTrack.id === track.id;
              const isTrackPlaying =
                isPlaying && currentTrack?.id === track.id;
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
                    onClick={() => handleTrackSelect(track)}
                    className={`player-title-scrap ${
                      isSelected ? "player-title-scrap--selected" : ""
                    } ${isTrackPlaying ? "is-playing" : ""}`}
                    style={{
                      transform: `rotate(${
                        isAskew ? tilts[idx % tilts.length] : 0
                      }deg)`,
                    }}
                    aria-pressed={isSelected}
                    aria-label={`Select track ${track.titleNum}, ${track.title}`}
                  >
                    <div className="title-image-stack">
                      <Image
                        src={`/assets/title-${track.titleNum}.jpg`}
                        alt={`${track.titleNum}. ${track.title}`}
                        width={1200}
                        height={track.titleNum === 4 ? 380 : 490}
                        className="title-img title-img--normal"
                      />

                      <div
                        className={`title-img-hover-wrapper ${
                          isHovered || isSelected ? "is-active" : ""
                        } ${isTrackPlaying ? "is-touch-playing" : ""}`}
                        aria-hidden="true"
                      >
                        <Image
                          src={`/assets/title-${track.titleNum}_hover.jpg`}
                          alt=""
                          width={1200}
                          height={track.titleNum === 4 ? 380 : 490}
                          className="title-img title-img--hover"
                        />
                      </div>
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
        )}
      </div>
    </div>
  );
};
