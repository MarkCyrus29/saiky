"use client";

import React, { useEffect } from "react";
import { HelpCircle, Disc3 } from "lucide-react";
import { Track } from "@/src/data/tracks";
import { useAudio } from "@/src/context/AudioContext";

interface MusicVideoPlayerProps {
  track: Track;
  theaterMode?: boolean;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onSwitchToAudio?: () => void;
}

export const MusicVideoPlayer: React.FC<MusicVideoPlayerProps> = ({
  track,
  onSwitchToAudio,
}) => {
  const { pause: pauseAudio } = useAudio();

  const hasVideo = Boolean(track.youtubeId || track.videoSrc);

  // Pause audio when switching to music video mode or when active track changes
  useEffect(() => {
    pauseAudio();
  }, [track, pauseAudio]);

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
    <div className="music-video-card music-video-card--theater">
      <div className="video-player-wrapper">
        {track.youtubeId ? (
          <iframe
            key={track.youtubeId}
            src={`https://www.youtube-nocookie.com/embed/${track.youtubeId}?autoplay=1&rel=0`}
            title={`${track.title} music video`}
            className="youtube-video-frame"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video
            src={track.videoSrc}
            className="video-element"
            controls
            autoPlay
            playsInline
          />
        )}
      </div>
    </div>
  );
};

