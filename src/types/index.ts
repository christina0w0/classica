export type MusicEra =
  | "renaissance"
  | "baroque"
  | "classical"
  | "romantic"
  | "modern";

export interface Composer {
  id: string;
  name: string;
  pronunciation?: string;
  era: MusicEra;
  birthYear: number;
  deathYear?: number;
  bio?: string;
  imageUrl?: string;
}

export interface MusicPiece {
  id: string;
  title: string;
  composerId: string;
  composerName: string;
  era: MusicEra;
  identifiedDate: string;
  isFavorite: boolean;
  acoustId?: string;
  appleMusicUrl?: string;
  spotifyUrl?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
}

export interface SheetMusic {
  title: string;
  url: string;
  composer: string;
}

export interface RecognitionResult {
  title: string;
  artist: string;
  album?: string;
  composerName?: string;
  pieceName?: string;
  era?: MusicEra;
  externalIds?: Record<string, string>;
}

export interface ComposerRelationship {
  from: string;
  to: string;
  type: "teacher" | "influence" | "contemporary";
  description?: string;
}

export interface PracticeReflection {
  whatWentWell?: string;
  needsWork?: string;
  nextFocus?: string;
  journal?: string;
}

export interface PracticeSession {
  id: string;
  pieceId: string;
  pieceName: string;
  composerName: string;
  date: string;
  duration: number;
  notes?: string;
  reflection?: PracticeReflection;
  thumbnailDataUrl?: string;
}

export const ERA_CONFIG: Record<
  MusicEra,
  { label: string; yearStart: number; yearEnd: number; color: string }
> = {
  renaissance: {
    label: "Renaissance",
    yearStart: 1400,
    yearEnd: 1600,
    color: "#d4b896",
  },
  baroque: {
    label: "Baroque",
    yearStart: 1600,
    yearEnd: 1750,
    color: "#a8d8c8",
  },
  classical: {
    label: "Classical",
    yearStart: 1750,
    yearEnd: 1820,
    color: "#c5c960",
  },
  romantic: {
    label: "Romantic",
    yearStart: 1820,
    yearEnd: 1910,
    color: "#d4a574",
  },
  modern: {
    label: "Modern",
    yearStart: 1910,
    yearEnd: 2000,
    color: "#b8a9c9",
  },
};
