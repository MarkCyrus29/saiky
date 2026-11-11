export interface ChordMarker {
  at: number; // character index in `text` where the chord changes
  chord: string; // e.g. "Am", "F", "Cmaj7"
}

export interface LyricLine {
  t: number; // seconds into the song when the line starts
  text: string;
  chords?: ChordMarker[];
}

export interface Track {
  id: number;
  slug: string;
  title: string;
  audioSrc: string;
  vinylName: string;
  titleNum: number;
  lyrics: LyricLine[];
}

// 4 official tracks on Saiky's EP
// Real lyrics and chords are left empty as instructed: Saiky will fill them in!
export const TRACKS: Track[] = [
  {
    id: 1,
    slug: "you-looked-away",
    title: "you looked away",
    audioSrc: "/music/1_youlookedaway.mp3",
    vinylName: "youlookedaway",
    titleNum: 1,
    lyrics: [],
  },
  {
    id: 2,
    slug: "wrightway",
    title: "wrightway",
    audioSrc: "/music/2_wrightway.mp3",
    vinylName: "wrightway",
    titleNum: 2,
    lyrics: [],
  },
  {
    id: 3,
    slug: "question-mark",
    title: "question mark!",
    audioSrc: "/music/3_question_mark.mp3",
    vinylName: "question",
    titleNum: 3,
    lyrics: [],
  },
  {
    id: 4,
    slug: "traffic-cones",
    title: "TRAFFIC CONES / it's just hiccup",
    audioSrc: "/music/4_itsjusthiccup.mp3",
    vinylName: "traffic",
    titleNum: 4,
    lyrics: [],
  },
];

// Clearly marked placeholder track entry used ONLY for testing lyrics and chords rendering.
// Excluded from live tracklist.
export const PLACEHOLDER_TEST_TRACK: Track = {
  id: 99,
  slug: "demo-test",
  title: "DEMO TEST / notebook sketch",
  audioSrc: "/music/1_youlookedaway.wav",
  vinylName: "youlookedaway",
  titleNum: 1,
  lyrics: [
    {
      t: 1.0,
      text: "waiting in the morning light",
      chords: [
        { at: 0, chord: "C" },
        { at: 15, chord: "G" },
      ],
    },
    {
      t: 5.2,
      text: "coffee stains upon the desk",
      chords: [
        { at: 0, chord: "Am" },
        { at: 14, chord: "F" },
      ],
    },
    {
      t: 9.8,
      text: "looking for the paper scraps we tore",
      chords: [
        { at: 0, chord: "C" },
        { at: 16, chord: "G" },
        { at: 32, chord: "C" },
      ],
    },
    {
      t: 14.5,
      text: "spinning records on the wooden floor",
      chords: [
        { at: 0, chord: "F" },
        { at: 17, chord: "G" },
        { at: 29, chord: "C" },
      ],
    },
  ],
};

export function getTrackBySlug(slug: string): Track | undefined {
  if (slug === PLACEHOLDER_TEST_TRACK.slug) {
    return PLACEHOLDER_TEST_TRACK;
  }
  return TRACKS.find((t) => t.slug === slug);
}

