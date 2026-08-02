import type { AdultDuration, ExpThresholds, Rarity, Stage, StageYield } from './types';

// ---------------------------------------------------------------------------
// Asset paths — everything lives under /public and is referenced by URL.
// Filenames are the Chinese originals the user provided.
// ---------------------------------------------------------------------------

export const ASSETS = {
  images: {
    coverBg: 'images/封面背景.PNG',
    startBtn: 'images/封面開始按鍵.PNG',
    gameBg: 'images/遊戲背景.PNG',
    gameBg2: 'images/遊戲背景2.PNG',
    gachaBg: 'images/扭蛋背景.PNG',
    gachaMachine: 'images/扭蛋機.PNG',
    gachaBall: 'images/扭蛋.PNG',
    gachaResult: 'images/抽取扭蛋畫面.PNG',
    gardenBg: 'images/花園背景.PNG',
    // Buttons
    settingsBtn: 'images/設定按鍵.PNG',
    dexBtn: 'images/圖鑑按鍵.PNG',
    upgradeBtn: 'images/升級按鍵.PNG',
    foodBtn: 'images/食物按鍵.PNG',
    gachaBtn: 'images/扭蛋按鍵.PNG',
    gardenBtn: 'images/花園按鍵.PNG',
    exitBtn: 'images/退出遊戲按鍵.PNG',
    // Panels
    settingsPanel: 'images/設定版面.PNG',
    dexPanel: 'images/圖鑑版面.PNG',
    upgradePanel: 'images/升級版面.PNG',
    foodPanel: 'images/食物版面.PNG',
    // Toggles
    bgmOn: 'images/背景音樂 on.PNG',
    bgmOff: 'images/背景音樂 off.PNG',
    sfxOn: 'images/音效 on.PNG',
    sfxOff: 'images/音效 off.PNG',
    // Items
    egg: 'images/蛋.PNG',
    apple: 'images/蘋果.PNG',
  },
  audio: {
    coverBgm: 'audio/封面背景音樂.m4a',
    gameBgm: 'audio/遊戲背景音樂.m4a',
    gachaBgm: 'audio/扭蛋抽取音樂.m4a',
    click: 'audio/按鍵音效.m4a',
    babyCry: 'audio/蛇幼年聲.m4a',
    teenCry: 'audio/青年蛇聲.m4a',
    adultCry: 'audio/成年蛇聲.m4a',
    gachaSpin: 'audio/扭蛋抽取聲.m4a',
    gachaDrop: 'audio/扭蛋掉出音效.m4a',
  },
} as const;

// ---------------------------------------------------------------------------
// Gameplay tuning
// ---------------------------------------------------------------------------

export const MAX_ACTIVE_SNAKES = 2;
export const GACHA_COST = 60;
export const GACHA_EXP_GAIN = 30;
export const PETTED_DURATION_MS = 1000;

export const EXP_THRESHOLDS: ExpThresholds = {
  babyToTeen: 100,
  teenToAdult: 250,
};

/** Seconds an adult lives on the main stage before graduating to the garden. */
export const ADULT_DURATION: AdultDuration = 60;

export const STAGE_YIELD: Record<Stage, StageYield> = {
  baby: { item: null, interval: 0 },
  teen: { item: 'apple', interval: 20 },
  adult: { item: 'egg', interval: 30 },
};

/** BGM track per screen. */
export const SCREEN_BGM: Record<string, string> = {
  home: ASSETS.audio.coverBgm,
  game: ASSETS.audio.gameBgm,
  gacha: ASSETS.audio.gachaBgm,
  garden: ASSETS.audio.gameBgm,
};

/** Cry sound per stage. */
export const STAGE_CRY: Record<Stage, string> = {
  baby: ASSETS.audio.babyCry,
  teen: ASSETS.audio.teenCry,
  adult: ASSETS.audio.adultCry,
};

export const FOOD_EXP: Record<'apple' | 'egg', number> = {
  apple: 15,
  egg: 40,
};

export const STARTING_STATE = {
  coins: 200,
  apples: 2,
  eggs: 1,
} as const;

// ---------------------------------------------------------------------------
// Player level system
// ---------------------------------------------------------------------------

export const MAX_PLAYER_LEVEL = 5;
export const PLAYER_EXP_PER_LEVEL = 100;

/** EXP awarded to the player when a snake evolves one stage. */
export const EVOLUTION_PLAYER_EXP = 25;

/** Rewards granted on each level-up. Index 0 = level 1→2. */
export const LEVEL_REWARDS: { apples: number; eggs: number }[] = [
  { apples: 5, eggs: 3 },   // 1 → 2
  { apples: 8, eggs: 4 },   // 2 → 3
  { apples: 10, eggs: 5 },  // 3 → 4
  { apples: 12, eggs: 6 },  // 4 → 5
];

// ---------------------------------------------------------------------------
// Gacha probabilities
// ---------------------------------------------------------------------------

export interface GachaWeight {
  speciesId: string;
  rarity: Rarity;
  weight: number;
}

/**青草蛇,草莓蛇,天空蛇 70% — 地頭蛇,海蛇 24% — python 6% */
export const GACHA_TABLE: GachaWeight[] = [
  { speciesId: 'grass', rarity: 'common', weight: 70 / 3 },
  { speciesId: 'strawberry', rarity: 'common', weight: 70 / 3 },
  { speciesId: 'sky', rarity: 'common', weight: 70 / 3 },
  { speciesId: 'boss', rarity: 'rare', weight: 24 / 2 },
  { speciesId: 'sea', rarity: 'rare', weight: 24 / 2 },
  { speciesId: 'python', rarity: 'legendary', weight: 6 },
];
