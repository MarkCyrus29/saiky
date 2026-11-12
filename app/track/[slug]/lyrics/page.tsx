"use client";

import React, { use, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Play, Pause } from "lucide-react";
import { getTrackBySlug } from "@/src/data/tracks";
import { useAudio } from "@/src/context/AudioContext";

interface LyricsPageProps {
  params: Promise<{ slug: string }>;
}

export default function LyricsPage({ params }: LyricsPageProps) {
  const resolvedParams = use(params);
  const track = getTrackBySlug(resolvedParams.slug);

  const { currentTrack, isPlaying, currentTime, seek, togglePlay } = useAudio();
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isUserScrollingRef = useRef(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isCurrentTrackPlaying = Boolean(currentTrack && track && currentTrack.id === track.id);

  // Sync active lyric line
  useEffect(() => {
    if (!track || !track.lyrics || track.lyrics.length === 0 || !isCurrentTrackPlaying) {
      setActiveLineIndex(-1);
      return;
    }

    const lines = track.lyrics;
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].t) {
        idx = i;
      } else {
        break;
      }
    }
    setActiveLineIndex(idx);
  }, [currentTime, track, isCurrentTrackPlaying]);

  // Auto-scroll to keep active lyric line ~40% from top
  useEffect(() => {
    if (activeLineIndex < 0 || isUserScrollingRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const lineEl = container.querySelector(
      `[data-lyric-line="${activeLineIndex}"]`
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

  const handleManualScroll = useCallback(() => {
    isUserScrollingRef.current = true;
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    userScrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 3500);
  }, []);

  if (!track) {
    return (
      <main className="lyrics-fullpage">
        <div className="lyrics-fullpage-inner">
          <p>Track not found.</p>
          <Link
            href="/"
            className="chords-back-link"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeft size={16} />
            <span>back to desk</span>
          </Link>
        </div>
      </main>
    );
  }

  const hasLyrics = Boolean(track.lyrics && track.lyrics.length > 0);

  return (
    <main className="lyrics-fullpage">
      {/* Navigation & Header */}
      <div className="lyrics-fullpage-header">
        <Link
          href="/"
          className="chords-back-link"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={16} />
          <span>back to desk</span>
        </Link>

        <div className="chords-title-group">
          <span className="chords-track-badge">
            {track.titleNum ? `${track.titleNum}. ` : ""}
          </span>
          <h1 className="chords-title">{track.title}</h1>
          <span className="chords-sub">synced lyrics</span>
        </div>

        <div className="chords-action-group" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link
            href={`/track/${track.slug}/chords`}
            className="chords-play-button"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>chords</span>
            <ArrowRight size={14} />
          </Link>

          <button
            type="button"
            className="chords-play-button"
            onClick={() => togglePlay(track)}
            aria-label={isCurrentTrackPlaying && isPlaying ? "Pause song" : "Play song"}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            {isCurrentTrackPlaying && isPlaying ? (
              <>
                <Pause size={15} />
                <span>pause</span>
              </>
            ) : (
              <>
                <Play size={15} />
                <span>play song</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Synced lyrics scrollable body */}
      <div
        ref={scrollContainerRef}
        onScroll={handleManualScroll}
        className="lyrics-fullpage-scroll"
      >
        {!hasLyrics ? (
          <div className="chords-empty-box">
            <p className="chords-empty-title">
              no lyrics synced yet!
            </p>
            <p className="chords-empty-desc">
              Saiky hasn't scribbled down the synced timestamps for this track yet.
            </p>
            <div className="chords-preview-prompt">
              <p>Check back soon or listen along with the music!</p>
              <Link
                href={`/track/${track.slug}/chords`}
                className="chords-demo-link"
                style={{
                  marginTop: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>view chords page</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="lyrics-lines-list" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {track.lyrics.map((line, idx) => {
              const isCurrent = idx === activeLineIndex;

              return (
                <div
                  key={idx}
                  data-lyric-line={idx}
                  onClick={() => {
                    if (isCurrentTrackPlaying) {
                      seek(line.t);
                    } else {
                      togglePlay(track);
                    }
                  }}
                  className={`lyric-line-row ${
                    isCurrent ? "lyric-line-row--active" : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      if (isCurrentTrackPlaying) seek(line.t);
                      else togglePlay(track);
                    }
                  }}
                  aria-label={`Seek to ${line.text}`}
                  style={{ cursor: "pointer", padding: "8px 12px", borderRadius: 4 }}
                >
                  <span className="lyric-line-text" style={{ fontSize: "1.7rem", lineHeight: 1.4 }}>
                    {line.text}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
