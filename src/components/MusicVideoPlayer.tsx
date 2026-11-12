"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  HelpCircle,
  Disc3,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  VolumeX,
  Volume1,
  Volume2,
  Maximize,
} from "lucide-react";
import { Track } from "@/src/data/tracks";
import { useAudio } from "@/src/context/AudioContext";

interface MusicVideoPlayerProps {
  track: Track;
  theaterMode?: boolean;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onSwitchToAudio?: () => void;
}

function formatTime(sec: number): string {
  if (isNaN(sec) || !isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export const MusicVideoPlayer: React.FC<MusicVideoPlayerProps> = ({
  track,
  onPrevTrack,
  onNextTrack,
  onSwitchToAudio,
}) => {
  const { pause: pauseAudio, volume, setVolume } = useAudio();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const hasVideo = Boolean(track.videoSrc);

  // Sync volume with global audio context
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Pause background audio when video component mounts or track changes
  useEffect(() => {
    pauseAudio();
    setIsPlaying(false);
    setCurrentTime(0);
  }, [track, pauseAudio]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      pauseAudio(); // ensure MP3 audio is never playing at the same time
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [pauseAudio]);

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      video.requestFullscreen().catch(() => {});
    }
  };

  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setIsControlsVisible(false);
      }
    }, 3000);
  };

  // If track doesn't have a video (Track 3: question mark!)
  if (!hasVideo) {
    return (
      <div className="music-video-card music-video-card--no-video music-video-card--theater">
        <div className="no-video-notebook-scrap">
          <div className="no-video-icon">
            <HelpCircle size={38} color="var(--color-cyan)" />
          </div>
          <h3 className="no-video-title">{track.title}</h3>
          <p className="no-video-desc">
            no music video for this song yet!
          </p>
          <p className="no-video-sub">
            enjoy the audio on the spinning disc instead ~
          </p>
          {onSwitchToAudio && (
            <button
              type="button"
              onClick={onSwitchToAudio}
              className="no-video-switch-btn"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Disc3 size={16} />
              <span>switch to vinyl player</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="music-video-card music-video-card--theater"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setIsControlsVisible(false)}
    >
      <div className="video-player-wrapper">
        <video
          ref={videoRef}
          src={track.videoSrc}
          className="video-element"
          playsInline
          onClick={togglePlay}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onDurationChange={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration || 0);
            }
          }}
          onPlay={() => {
            pauseAudio();
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            onNextTrack();
          }}
        />

        {/* Big center play icon overlay when paused */}
        {!isPlaying && (
          <button
            type="button"
            className="video-big-play-btn"
            onClick={togglePlay}
            aria-label="Play video"
          >
            <Play size={28} />
          </button>
        )}

        {/* Controls Overlay Bar */}
        <div
          className={`video-controls-overlay ${
            isControlsVisible || !isPlaying ? "is-visible" : ""
          }`}
        >
          {/* Progress scrubber */}
          <div className="video-progress-container">
            <input
              type="range"
              min={0}
              max={duration > 0 ? duration : 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="video-progress-slider"
              aria-label="Seek video"
            />
          </div>

          <div className="video-controls-row">
            {/* Left: Play/Pause, Prev, Next, Time */}
            <div className="video-controls-left">
              <button
                type="button"
                className="video-ctrl-btn"
                onClick={onPrevTrack}
                aria-label="Previous track"
                title="Previous track"
              >
                <SkipBack size={16} />
              </button>

              <button
                type="button"
                className="video-ctrl-btn video-ctrl-btn--play"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>

              <button
                type="button"
                className="video-ctrl-btn"
                onClick={onNextTrack}
                aria-label="Next track"
                title="Next track"
              >
                <SkipForward size={16} />
              </button>

              <span className="video-time-text">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right: Volume & Fullscreen */}
            <div className="video-controls-right">
              <button
                type="button"
                className="video-ctrl-btn"
                onClick={() => setVolume(volume > 0 ? 0 : 0.85)}
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
                className="video-volume-slider"
                aria-label="Video volume"
              />

              {/* Fullscreen Button */}
              <button
                type="button"
                className="video-ctrl-btn"
                onClick={handleFullscreen}
                aria-label="Full screen"
                title="Full screen (f)"
              >
                <Maximize size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

