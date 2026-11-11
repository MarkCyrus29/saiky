"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Track, TRACKS } from "@/src/data/tracks";

interface AudioContextValue {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  error: string | null;
  activeLyricsTrack: Track | null;
  playTrack: (track: Track) => void;
  togglePlay: (track?: Track) => void;
  pause: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  openLyrics: (track: Track) => void;
  closeLyrics: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [error, setError] = useState<string | null>(null);
  const [activeLyricsTrack, setActiveLyricsTrack] = useState<Track | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  // Play a specific track from start
  const playTrack = useCallback((track: Track) => {
    setError(null);
    setCurrentTrack(track);
    if (!audioRef.current) return;

    if (audioRef.current.src !== window.location.origin + track.audioSrc && !audioRef.current.src.endsWith(track.audioSrc)) {
      audioRef.current.src = track.audioSrc;
    }
    audioRef.current.currentTime = 0;
    setCurrentTime(0);

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Audio play prevented:", err);
          setIsPlaying(false);
          // If autoplay blocked or error
          if (err.name !== "AbortError") {
            setError("couldn't load this one");
          }
        });
    }
  }, []);

  // Toggle play/pause or switch track
  const togglePlay = useCallback(
    (track?: Track) => {
      setError(null);
      if (!audioRef.current) return;

      // If no track provided or same track clicked
      if (!track || (currentTrack && track.id === currentTrack.id)) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          // If nothing was loaded yet, start track 1
          if (!currentTrack) {
            playTrack(TRACKS[0]);
            return;
          }
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => setIsPlaying(true))
              .catch((err) => {
                console.warn("Audio play error:", err);
                setIsPlaying(false);
                if (err.name !== "AbortError") {
                  setError("couldn't load this one");
                }
              });
          }
        }
      } else {
        // Different track clicked: switch and play from start
        playTrack(track);
      }
    },
    [currentTrack, isPlaying, playTrack]
  );

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  const nextTrack = useCallback(() => {
    if (!currentTrack) {
      playTrack(TRACKS[0]);
      return;
    }
    const idx = TRACKS.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % TRACKS.length;
    playTrack(TRACKS[nextIdx]);
  }, [currentTrack, playTrack]);

  const prevTrack = useCallback(() => {
    if (!currentTrack) {
      playTrack(TRACKS[0]);
      return;
    }
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const idx = TRACKS.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + TRACKS.length) % TRACKS.length;
    playTrack(TRACKS[prevIdx]);
  }, [currentTrack, playTrack]);

  const openLyrics = useCallback((track: Track) => {
    setActiveLyricsTrack(track);
  }, []);

  const closeLyrics = useCallback(() => {
    setActiveLyricsTrack(null);
  }, []);

  // Handle track ended -> auto advance 1..4, then loop back to 1
  const handleEnded = useCallback(() => {
    if (!currentTrack) return;
    const currentIndex = TRACKS.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % TRACKS.length;
    playTrack(TRACKS[nextIndex]);
  }, [currentTrack, playTrack]);

  // Wire up Media Session API
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    if (currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: "Saiky",
        album: "Saiky's Space",
        artwork: [
          {
            src: `/assets/vinyl-${currentTrack.vinylName}.png`,
            sizes: "900x900",
            type: "image/png",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        if (audioRef.current) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        handleEnded();
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        if (audioRef.current && currentTrack) {
          const idx = TRACKS.findIndex((t) => t.id === currentTrack.id);
          if (idx > 0) {
            playTrack(TRACKS[idx - 1]);
          } else {
            audioRef.current.currentTime = 0;
          }
        }
      });
    }
  }, [currentTrack, handleEnded, playTrack]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        error,
        activeLyricsTrack,
        playTrack,
        togglePlay,
        pause,
        seek,
        setVolume,
        nextTrack,
        prevTrack,
        openLyrics,
        closeLyrics,
      }}
    >
      {/* Hidden audio element persisted in root */}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onDurationChange={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={handleEnded}
        onError={() => {
          console.error("Audio failed to load file");
          setError("couldn't load this one");
          setIsPlaying(false);
        }}
      />
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return ctx;
}

