"use client";

import React, { use, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { getTrackBySlug, LyricLine, ChordMarker } from "@/src/data/tracks";
import { useAudio } from "@/src/context/AudioContext";

interface ChordsPageProps {
  params: Promise<{ slug: string }>;
}

interface TextChunk {
  chord?: string;
  text: string;
}

function splitLineIntoChordChunks(line: LyricLine): TextChunk[] {
  const text = line.text;
  const chords = (line.chords || []).slice().sort((a, b) => a.at - b.at);

  if (chords.length === 0) {
    return [{ text }];
  }

  const chunks: TextChunk[] = [];

  // If first chord does not start at 0
  if (chords[0].at > 0) {
    chunks.push({
      chord: undefined,
      text: text.slice(0, chords[0].at),
    });
  }

  for (let i = 0; i < chords.length; i++) {
    const cur = chords[i];
    const nextAt = i + 1 < chords.length ? chords[i + 1].at : text.length;
    chunks.push({
      chord: cur.chord,
      text: text.slice(cur.at, nextAt),
    });
  }

  return chunks;
}

export default function ChordsPage({ params }: ChordsPageProps) {
  const resolvedParams = use(params);
  const track = getTrackBySlug(resolvedParams.slug);

  const { currentTrack, isPlaying, currentTime, seek, togglePlay } = useAudio();
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isUserScrollingRef = useRef(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isCurrentTrackPlaying = currentTrack && track && currentTrack.id === track.id;

  // Track active line
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

  // Auto-scroll to keep active line ~40% from top
  useEffect(() => {
    if (activeLineIndex < 0 || isUserScrollingRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const lineEl = container.querySelector(
      `[data-chord-line="${activeLineIndex}"]`
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
      <main className="desk-surface chords-page-wrapper">
        <div className="chords-notebook-sheet">
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

  const hasLyrics = track.lyrics && track.lyrics.length > 0;

  return (
    <main className="desk-surface chords-page-wrapper">
      <div className="chords-sheet-container">
        {/* Notebook sheet */}
        <div className="chords-notebook-sheet">
          {/* Navigation & Header */}
          <div className="chords-header">
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
              <span className="chords-sub">chords & lyrics</span>
            </div>

            <div className="chords-action-group">
              {(!isCurrentTrackPlaying || !isPlaying) && (
                <button
                  type="button"
                  className="chords-play-button"
                  onClick={() => togglePlay(track)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Play size={15} />
                  <span>play song</span>
                </button>
              )}
            </div>
          </div>

          {/* Chords and Lyrics content */}
          <div
            ref={scrollContainerRef}
            onScroll={handleManualScroll}
            className="chords-content-scroll"
          >
            {!hasLyrics ? (
              <div className="chords-empty-box">
                <p className="chords-empty-title">
                  no chords scribbled down yet!
                </p>
                <p className="chords-empty-desc">
                  Saiky hasn't added the chords and lyrics for this track yet.
                </p>
                <div className="chords-preview-prompt">
                  <p>Want to see how handwritten chords look?</p>
                  <Link
                    href="/track/demo-test/chords"
                    className="chords-demo-link"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <span>view demo chords sheet</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="chords-lines-list">
                {track.lyrics.map((line, idx) => {
                  const isCurrent = idx === activeLineIndex;
                  const chunks = splitLineIntoChordChunks(line);

                  return (
                    <div
                      key={idx}
                      data-chord-line={idx}
                      onClick={() => {
                        if (isCurrentTrackPlaying) {
                          seek(line.t);
                        } else {
                          togglePlay(track);
                        }
                      }}
                      className={`chord-line-row ${
                        isCurrent ? "chord-line-row--active" : ""
                      }`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          if (isCurrentTrackPlaying) seek(line.t);
                          else togglePlay(track);
                        }
                      }}
                      aria-label={`Line ${idx + 1}: ${line.text}`}
                    >
                      <div className="chord-line-chunks">
                        {chunks.map((chunk, cIdx) => (
                          <span key={cIdx} className="chord-chunk">
                            <span className="chord-name">
                              {chunk.chord || "\u00A0"}
                            </span>
                            <span className="chord-text">{chunk.text}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

