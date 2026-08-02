// Core type definitions for the snake-raising game.

export type Screen = 'home' | 'game' | 'gacha' | 'garden';

/** Snake age stages, in evolutionary order. */
export type Stage = 'baby' | 'teen' | 'adult';

/** Lifecycle state for an owned snake. */
export type SnakeState = 'growing' | 'retired';

export interface StageArt {
  normal: string;
  petted: string;
}

export interface SpeciesArt {
  baby: StageArt;
  teen: StageArt;
  adult: StageArt;
  silhouette: string;
}

/** Static definition of a snake species. */
export interface Species {
  id: string;
  name: string;
  accent: string;
  art: SpeciesArt;
}

/** Production output per stage. `null` means the stage produces nothing. */
export interface StageYield {
  item: 'apple' | 'egg' | null;
  /** Seconds between yields. */
  interval: number;
}

/** An owned snake instance living on the main stage or in the garden. */
export interface PetSnake {
  id: string;
  speciesId: string;
  stage: Stage;
  exp: number;
  /** Unix ms timestamp of last yield. */
  lastYieldAt: number;
  /** Unix ms timestamp the snake graduated (moved to garden). */
  retiredAt?: number;
}

export interface UnlockedEntry {
  speciesId: string;
  /** Unix ms when first unlocked (via gacha or graduation). */
  unlockedAt: number;
}

export interface GameState {
  coins: number;
  apples: number;
  eggs: number;
  /** Snakes currently on the main raising stage (max 2). */
  active: PetSnake[];
  /** Graduated snakes living in the garden. */
  garden: PetSnake[];
  /** Species the player has ever unlocked. */
  unlocked: UnlockedEntry[];
  bgmOn: boolean;
  sfxOn: boolean;
  /** Player level (1–5). */
  playerLevel: number;
  /** Player EXP toward next level. */
  playerExp: number;
}

/** EXP thresholds to evolve between stages. */
export interface ExpThresholds {
  babyToTeen: number;
  teenToAdult: number;
}

/** Seconds of adulthood before auto-graduation. */
export type AdultDuration = number;

/** Gacha rarity bucket. */
export type Rarity = 'common' | 'rare' | 'legendary';
