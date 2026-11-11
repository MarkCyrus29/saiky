"use client";

import React, { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getTrackBySlug, LyricLine } from "@/src/data/tracks";
import { useAudio } from "@/src/context/AudioContext";
import { Tape } from "@/src/components/Tape";

interface SyncHelperProps {
  params: Promise<{ slug: string }>;
}

export default function SyncHelper({ params }: SyncHelperProps) {
  const resolvedParams = use(params);
  const track = getTrackBySlug(resolvedParams.slug);
  const { playTrack, pause, isPlaying, currentTime } = useAudio();

  const [rawText, setRawText] = useState(
    "Paste your lyrics here\nOne line per row\nThen press start\nAnd tap SPACE at each line!"
  );
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);

  const linesRef = useRef(lines);
  linesRef.current = lines;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const handleStart = () => {
    if (!track) return;
    const splitLines = rawText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((text) => ({ t: 0, text }));

    setLines(splitLines);
    setCurrentIndex(0);
    setIsSyncing(true);
    playTrack(track);
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isSyncing) return;
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        const curIdx = currentIndexRef.current;
        const curLines = [...linesRef.current];

        if (curIdx < curLines.length) {
          curLines[curIdx] = {
            ...curLines[curIdx],
            t: parseFloat(currentTime.toFixed(2)),
          };
          setLines(curLines);
          setCurrentIndex(curIdx + 1);

          if (curIdx + 1 >= curLines.length) {
            setIsSyncing(false);
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSyncing, currentTime]);

  const outputJson = JSON.stringify(lines, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!track) {
    return (
      <main className="desk-surface chords-page-wrapper">
        <p>Track not found.</p>
      </main>
    );
  }

  return (
    <main className="desk-surface chords-page-wrapper">
      <div className="chords-notebook-sheet" style={{ maxWidth: 800 }}>
        <Tape variant="cyan" angle={-2} width={90} height={28} style={{ position: "absolute", top: -14, left: 35 }} />
        
        <div className="chords-header">
          <Link href="/" className="chords-back-link">← back to desk</Link>
          <div className="chords-title-group">
            <h1 className="chords-title">Dev Timestamp Helper: {track.title}</h1>
            <span className="chords-sub">Tap SPACEBAR at the start of each line</span>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          {!isSyncing && lines.length === 0 && (
            <div>
              <p style={{ marginBottom: 8, fontSize: "1.1rem" }}>
                1. Paste lyrics below (one line per row):
              </p>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={8}
                style={{
                  width: "100%",
                  fontFamily: "inherit",
                  fontSize: "1.1rem",
                  padding: 12,
                  borderRadius: 4,
                  border: "2px solid #ccc",
                  background: "#fff",
                }}
              />
              <button
                type="button"
                onClick={handleStart}
                className="chords-play-button"
                style={{ marginTop: 12, fontSize: "1.2rem" }}
              >
                ▶ Start Sync Session (plays audio)
              </button>
            </div>
          )}

          {isSyncing && (
            <div>
              <div style={{ background: "#e8f8fa", padding: 16, borderRadius: 6, marginBottom: 16 }}>
                <p style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#117a8b" }}>
                  Current Time: {currentTime.toFixed(2)}s | Next Line to Stamp: {currentIndex + 1} of {lines.length}
                </p>
                <p style={{ fontSize: "1.1rem", marginTop: 4 }}>
                  👉 Tap <strong>SPACEBAR</strong> right when Saiky begins singing this line:
                </p>
                <div style={{ fontSize: "1.5rem", marginTop: 8, background: "#fff", padding: "8px 12px", border: "1px dashed #19b3c8" }}>
                  "{lines[currentIndex]?.text}"
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSyncing(false);
                  pause();
                }}
                className="chords-play-button"
              >
                ❚❚ Stop Early
              </button>
            </div>
          )}

          {lines.length > 0 && !isSyncing && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ fontSize: "1.3rem" }}>Recorded Lyrics JSON:</h3>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="chords-play-button"
                >
                  {copied ? "✓ Copied to clipboard!" : "Copy JSON"}
                </button>
              </div>
              <pre
                style={{
                  background: "#1e1e1e",
                  color: "#d4d4d4",
                  padding: 16,
                  borderRadius: 6,
                  overflowX: "auto",
                  fontSize: "0.95rem",
                  maxHeight: 400,
                }}
              >
                {outputJson}
              </pre>
              <button
                type="button"
                onClick={() => {
                  setLines([]);
                  setCurrentIndex(0);
                }}
                className="chords-demo-link"
                style={{ marginTop: 16, display: "inline-block" }}
              >
                ↺ Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

