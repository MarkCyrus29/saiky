"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useAudio } from "@/src/context/AudioContext";

export const LyricsSheet: React.FC = () => {
  const {
    activeLyricsTrack,
    closeLyrics,
    currentTrack,
    isPlaying,
    currentTime,
    seek,
    togglePlay,
  } = useAudio();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const userScrolledTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserScrollingRef = useRef(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);

  const isCurrentPlayingTrack =
    currentTrack && activeLyricsTrack && currentTrack.id === activeLyricsTrack.id;

  // Calculate current active lyric line
  useEffect(() => {
    if (!activeLyricsTrack || !activeLyricsTrack.lyrics || activeLyricsTrack.lyrics.length === 0) {
      setActiveLineIndex(-1);
      return;
    }

    if (!isCurrentPlayingTrack) {
      setActiveLineIndex(-1);
      return;
    }

    const lines = activeLyricsTrack.lyrics;
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].t) {
        idx = i;
      } else {
        break;
      }
    }
    setActiveLineIndex(idx);
  }, [currentTime, activeLyricsTrack, isCurrentPlayingTrack]);

  // Auto-scroll to 40% from the top
  useEffect(() => {
    if (activeLineIndex < 0 || isUserScrollingRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const lineEl = container.querySelector(
      `[data-lyric-index="${activeLineIndex}"]`
    ) as HTMLElement | null;

    if (lineEl) {
      const lineTop = lineEl.offsetTop;
      const targetScroll = lineTop - container.clientHeight * 0.4;
      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: "smooth",
      });
    }
  }, [activeLineIndex]);

  // Handle manual scroll to pause auto-scroll for 3.5s
  const handleScroll = useCallback(() => {
    isUserScrollingRef.current = true;
    if (userScrolledTimeoutRef.current) {
      clearTimeout(userScrolledTimeoutRef.current);
    }
    userScrolledTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 3500);
  }, []);

  // Trap focus and close on Escape
  useEffect(() => {
    if (!activeLyricsTrack) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeLyrics();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLyricsTrack, closeLyrics]);

  if (!activeLyricsTrack) return null;

  const lyrics = activeLyricsTrack.lyrics || [];

  return (
    <div
      className="lyrics-modal-backdrop"
      onClick={closeLyrics}
      role="dialog"
      aria-modal="true"
      aria-label={`Lyrics for ${activeLyricsTrack.title}`}
    >
      <div
        ref={modalRef}
        className="lyrics-sheet-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sheet Header */}
        <div className="lyrics-sheet-header">
          <div className="lyrics-title-group">
            <span className="lyrics-track-number">
              {activeLyricsTrack.titleNum}.
            </span>
            <h2 className="lyrics-track-title">{activeLyricsTrack.title}</h2>
          </div>

          <div className="lyrics-header-actions">
            {/* Play button if this song is not currently playing */}
            {(!isCurrentPlayingTrack || !isPlaying) && (
              <button
                type="button"
                className="lyrics-play-button"
                onClick={() => togglePlay(activeLyricsTrack)}
                aria-label={`Play ${activeLyricsTrack.title}`}
              >
                ▶ play track
              </button>
            )}

            {/* Link to dedicated chords page */}
            <Link
              href={`/track/${activeLyricsTrack.slug}/chords`}
              className="lyrics-chords-link"
              onClick={closeLyrics}
            >
              chords →
            </Link>

            {/* Close button */}
            <button
              type="button"
              className="lyrics-close-button"
              onClick={closeLyrics}
              aria-label="Close lyrics sheet"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Lyrics Content Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="lyrics-lines-container"
        >
          {lyrics.length === 0 ? (
            <div className="lyrics-empty-note">
              <p>no lyrics scribbled down yet!</p>
              <p className="lyrics-empty-sub">
                Saiky hasn't added lyrics for this track yet.
              </p>
            </div>
          ) : (
            lyrics.map((line, idx) => {
              const isCurrent = idx === activeLineIndex;

              return (
                <div
                  key={idx}
                  data-lyric-index={idx}
                  onClick={() => {
                    if (isCurrentPlayingTrack) {
                      seek(line.t);
                    } else {
                      togglePlay(activeLyricsTrack);
                    }
                  }}
                  className={`lyric-line-row ${
                    isCurrent ? "lyric-line-row--active" : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      if (isCurrentPlayingTrack) seek(line.t);
                      else togglePlay(activeLyricsTrack);
                    }
                  }}
                  aria-label={`Seek to ${line.text}`}
                >
                  <span className="lyric-line-text">{line.text}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

