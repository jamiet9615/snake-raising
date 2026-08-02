import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { GameState, PetSnake, Screen, Stage } from '../game/types';
import {
  ADULT_DURATION,
  EVOLUTION_PLAYER_EXP,
  EXP_THRESHOLDS,
  GACHA_COST,
  GACHA_EXP_GAIN,
  GACHA_TABLE,
  LEVEL_REWARDS,
  MAX_ACTIVE_SNAKES,
  MAX_PLAYER_LEVEL,
  PLAYER_EXP_PER_LEVEL,
  STARTING_STATE,
  STAGE_YIELD,
} from '../game/constants';
import { SPECIES } from '../game/snakes';
import { audio } from './audio';

// ---------------------------------------------------------------------------
// Game state — persisted to localStorage, ticked every second for yields,
// evolutions, and auto-graduation. Exposes typed actions used by the UI.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'cute-snake-game-v2';

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function freshState(): GameState {
  return {
    coins: STARTING_STATE.coins,
    apples: STARTING_STATE.apples,
    eggs: STARTING_STATE.eggs,
    active: [],
    garden: [],
    unlocked: [],
    bgmOn: true,
    sfxOn: true,
    playerLevel: 1,
    playerExp: 0,
  };
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return { ...freshState(), ...parsed };
  } catch {
    return freshState();
  }
}

function expForNext(stage: Stage): number | null {
  if (stage === 'baby') return EXP_THRESHOLDS.babyToTeen;
  if (stage === 'teen') return EXP_THRESHOLDS.teenToAdult;
  return null;
}

/** Returns [updatedSnake, evolved: boolean]. */
function evolveIfReady(snake: PetSnake): { snake: PetSnake; evolved: boolean } {
  const need = expForNext(snake.stage);
  if (need === null || snake.exp < need) return { snake, evolved: false };
  const nextStage: Stage = snake.stage === 'baby' ? 'teen' : 'adult';
  return { snake: { ...snake, stage: nextStage, exp: 0, lastYieldAt: Date.now() }, evolved: true };
}

/** Weighted gacha pick following GACHA_TABLE. */
function pickGachaSpecies(): string {
  const total = GACHA_TABLE.reduce((sum, g) => sum + g.weight, 0);
  let roll = Math.random() * total;
  for (const entry of GACHA_TABLE) {
    roll -= entry.weight;
    if (roll <= 0) return entry.speciesId;
  }
  return GACHA_TABLE[0].speciesId;
}

interface LevelUpInfo {
  leveledUp: boolean;
  newLevel: number;
  reward?: { apples: number; eggs: number };
}

/** Grant player EXP; level up repeatedly if enough. Returns level-up info. */
function grantPlayerExp(state: GameState, amount: number): { state: GameState; levelUp: LevelUpInfo } {
  if (state.playerLevel >= MAX_PLAYER_LEVEL) {
    return { state, levelUp: { leveledUp: false, newLevel: state.playerLevel } };
  }
  let level = state.playerLevel;
  let exp = state.playerExp + amount;
  let reward: { apples: number; eggs: number } | undefined;
  while (level < MAX_PLAYER_LEVEL && exp >= PLAYER_EXP_PER_LEVEL) {
    exp -= PLAYER_EXP_PER_LEVEL;
    level += 1;
    const r = LEVEL_REWARDS[level - 2];
    if (r) reward = r;
  }
  if (level >= MAX_PLAYER_LEVEL) exp = 0;
  return {
    state: { ...state, playerLevel: level, playerExp: exp },
    levelUp: { leveledUp: reward !== undefined, newLevel: level, reward },
  };
}

export interface GameContextValue {
  state: GameState;
  screen: Screen;
  setScreen: (s: Screen) => void;
  petSnake: (snake: PetSnake) => void;
  feedSnake: (id: string, food: 'apple' | 'egg') => boolean;
  upgradeSnake: (id: string) => boolean;
  pullGacha: () => { ok: boolean; speciesId?: string; reason?: string };
  toggleBgm: () => void;
  toggleSfx: () => void;
  resetGame: () => void;
  lastLevelUp: LevelUpInfo | null;
  clearLevelUp: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(loadState);
  const [screen, setScreenState] = useState<Screen>('home');
  const [lastLevelUp, setLastLevelUp] = useState<LevelUpInfo | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state]);

  useEffect(() => {
    audio.setBgmOn(state.bgmOn);
  }, [state.bgmOn]);
  useEffect(() => {
    audio.setSfxOn(state.sfxOn);
  }, [state.sfxOn]);

  // Heartbeat: yields, evolutions, graduation, and player EXP from evolutions.
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setState((prev) => {
        let changed = false;
        let apples = prev.apples;
        let eggs = prev.eggs;
        let coins = prev.coins;
        let playerExp = prev.playerExp;
        let playerLevel = prev.playerLevel;

        const active = prev.active.map((snake) => {
          let s = snake;
          const y = STAGE_YIELD[s.stage];
          if (y.item && y.interval > 0 && now - s.lastYieldAt >= y.interval * 1000) {
            if (y.item === 'apple') apples += 1;
            else if (y.item === 'egg') eggs += 1;
            coins += 5;
            s = { ...s, lastYieldAt: now };
            changed = true;
          }
          const { snake: evolved, evolved: didEvolve } = evolveIfReady(s);
          if (didEvolve) {
            s = evolved;
            changed = true;
            // Award player EXP on evolution.
            if (playerLevel < MAX_PLAYER_LEVEL) {
              playerExp += EVOLUTION_PLAYER_EXP;
            }
          }
          return s;
        });

        // Resolve player level-ups from accumulated EXP.
        let levelReward: { apples: number; eggs: number } | undefined;
        while (playerLevel < MAX_PLAYER_LEVEL && playerExp >= PLAYER_EXP_PER_LEVEL) {
          playerExp -= PLAYER_EXP_PER_LEVEL;
          playerLevel += 1;
          const r = LEVEL_REWARDS[playerLevel - 2];
          if (r) {
            levelReward = r;
            apples += r.apples;
            eggs += r.eggs;
          }
          changed = true;
        }
        if (playerLevel >= MAX_PLAYER_LEVEL) playerExp = 0;

        // Graduate adults who've lived out their adulthood.
        const stillActive: PetSnake[] = [];
        const newlyRetired: PetSnake[] = [];
        for (const s of active) {
          if (s.stage === 'adult' && s.retiredAt && now - s.retiredAt >= ADULT_DURATION * 1000) {
            newlyRetired.push(s);
            changed = true;
          } else {
            stillActive.push(s);
          }
        }
        const withRetireStart = stillActive.map((s) =>
          s.stage === 'adult' && !s.retiredAt ? { ...s, retiredAt: now } : s,
        );

        const garden = newlyRetired.length
          ? [...prev.garden, ...newlyRetired.map((s) => ({ ...s }))]
          : prev.garden;

        let unlocked = prev.unlocked;
        if (newlyRetired.length) {
          const known = new Set(unlocked.map((u) => u.speciesId));
          const adds = newlyRetired
            .map((s) => s.speciesId)
            .filter((id) => !known.has(id))
            .map((id) => ({ speciesId: id, unlockedAt: now }));
          if (adds.length) unlocked = [...unlocked, ...adds];
        }

        if (levelReward) {
          setLastLevelUp({ leveledUp: true, newLevel: playerLevel, reward: levelReward });
        }

        if (!changed && newlyRetired.length === 0) return prev;
        return { ...prev, active: withRetireStart, garden, unlocked, apples, eggs, coins, playerExp, playerLevel };
      });
    };
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const setScreen = useCallback((s: Screen) => {
    audio.unlock();
    audio.playSfx('click');
    setScreenState(s);
  }, []);

  const petSnake = useCallback((snake: PetSnake) => {
    audio.playSfx(snake.stage === 'baby' ? 'babyCry' : snake.stage === 'teen' ? 'teenCry' : 'adultCry');
  }, []);

  const feedSnake = useCallback((id: string, food: 'apple' | 'egg'): boolean => {
    let success = false;
    setState((prev) => {
      if (food === 'apple' && prev.apples <= 0) return prev;
      if (food === 'egg' && prev.eggs <= 0) return prev;
      const idx = prev.active.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const snake = prev.active[idx];
      if (snake.stage === 'adult') return prev;
      const gain = food === 'apple' ? 15 : 40;
      const { snake: evolved, evolved: didEvolve } = evolveIfReady({ ...snake, exp: snake.exp + gain });
      const active = [...prev.active];
      active[idx] = evolved;

      let apples = food === 'apple' ? prev.apples - 1 : prev.apples;
      let eggs = food === 'egg' ? prev.eggs - 1 : prev.eggs;
      let playerExp = prev.playerExp;
      let playerLevel = prev.playerLevel;

      if (didEvolve && playerLevel < MAX_PLAYER_LEVEL) {
        playerExp += EVOLUTION_PLAYER_EXP;
        let levelReward: { apples: number; eggs: number } | undefined;
        while (playerLevel < MAX_PLAYER_LEVEL && playerExp >= PLAYER_EXP_PER_LEVEL) {
          playerExp -= PLAYER_EXP_PER_LEVEL;
          playerLevel += 1;
          const r = LEVEL_REWARDS[playerLevel - 2];
          if (r) {
            levelReward = r;
            apples += r.apples;
            eggs += r.eggs;
          }
        }
        if (playerLevel >= MAX_PLAYER_LEVEL) playerExp = 0;
        if (levelReward) {
          setLastLevelUp({ leveledUp: true, newLevel: playerLevel, reward: levelReward });
        }
      }

      success = true;
      return { ...prev, active, apples, eggs, playerExp, playerLevel };
    });
    return success;
  }, []);

  const upgradeSnake = useCallback((id: string): boolean => {
    const UPGRADE_COST = 50;
    const UPGRADE_EXP = 25;
    let success = false;
    setState((prev) => {
      if (prev.coins < UPGRADE_COST) return prev;
      const idx = prev.active.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const snake = prev.active[idx];
      if (snake.stage === 'adult') return prev;
      const { snake: evolved, evolved: didEvolve } = evolveIfReady({ ...snake, exp: snake.exp + UPGRADE_EXP });
      const active = [...prev.active];
      active[idx] = evolved;

      let apples = prev.apples;
      let eggs = prev.eggs;
      let playerExp = prev.playerExp;
      let playerLevel = prev.playerLevel;

      if (didEvolve && playerLevel < MAX_PLAYER_LEVEL) {
        playerExp += EVOLUTION_PLAYER_EXP;
        let levelReward: { apples: number; eggs: number } | undefined;
        while (playerLevel < MAX_PLAYER_LEVEL && playerExp >= PLAYER_EXP_PER_LEVEL) {
          playerExp -= PLAYER_EXP_PER_LEVEL;
          playerLevel += 1;
          const r = LEVEL_REWARDS[playerLevel - 2];
          if (r) {
            levelReward = r;
            apples += r.apples;
            eggs += r.eggs;
          }
        }
        if (playerLevel >= MAX_PLAYER_LEVEL) playerExp = 0;
        if (levelReward) {
          setLastLevelUp({ leveledUp: true, newLevel: playerLevel, reward: levelReward });
        }
      }

      success = true;
      return { ...prev, coins: prev.coins - UPGRADE_COST, active, apples, eggs, playerExp, playerLevel };
    });
    return success;
  }, []);

  const pullGacha = useCallback((): { ok: boolean; speciesId?: string; reason?: string } => {
    let result: { ok: boolean; speciesId?: string; reason?: string } = { ok: false };
    setState((prev) => {
      if (prev.coins < GACHA_COST) {
        result = { ok: false, reason: '金幣不足' };
        return prev;
      }
      if (prev.active.length >= MAX_ACTIVE_SNAKES) {
        result = { ok: false, reason: '主畫面已滿，請先讓蛇畢業' };
        return prev;
      }
      const speciesId = pickGachaSpecies();
      const snake: PetSnake = {
        id: makeId(),
        speciesId,
        stage: 'baby',
        exp: GACHA_EXP_GAIN,
        lastYieldAt: Date.now(),
      };
      const known = new Set(prev.unlocked.map((u) => u.speciesId));
      const unlocked = known.has(speciesId)
        ? prev.unlocked
        : [...prev.unlocked, { speciesId, unlockedAt: Date.now() }];
      result = { ok: true, speciesId };
      return {
        ...prev,
        coins: prev.coins - GACHA_COST,
        active: [...prev.active, snake],
        unlocked,
      };
    });
    return result;
  }, []);

  const toggleBgm = useCallback(() => {
    audio.playSfx('click');
    setState((prev) => ({ ...prev, bgmOn: !prev.bgmOn }));
  }, []);

  const toggleSfx = useCallback(() => {
    setState((prev) => ({ ...prev, sfxOn: !prev.sfxOn }));
  }, []);

  const resetGame = useCallback(() => {
    audio.playSfx('click');
    setState(freshState());
  }, []);

  const clearLevelUp = useCallback(() => setLastLevelUp(null), []);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      screen,
      setScreen,
      petSnake,
      feedSnake,
      upgradeSnake,
      pullGacha,
      toggleBgm,
      toggleSfx,
      resetGame,
      lastLevelUp,
      clearLevelUp,
    }),
    [state, screen, setScreen, petSnake, feedSnake, upgradeSnake, pullGacha, toggleBgm, toggleSfx, resetGame, lastLevelUp, clearLevelUp],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
