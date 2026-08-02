import { ASSETS, EXP_THRESHOLDS, LEVEL_REWARDS, MAX_PLAYER_LEVEL, PLAYER_EXP_PER_LEVEL } from '../game/constants';
import { getSpecies } from '../game/snakes';
import { useGame } from '../lib/gameState';
import { audio } from '../lib/audio';

// ---------------------------------------------------------------------------
// UpgradeModal — player level system (no panel image, custom styled card).
// Circle shows player level number; white bar shows player EXP.
// Snake evolution grants 25 player EXP; 100 EXP = 1 level-up with food rewards.
// Max level 5. Spend coins to boost a snake's EXP.
// ---------------------------------------------------------------------------

const STAGE_LABEL: Record<string, string> = { baby: '幼年', teen: '青年', adult: '成年' };
const UPGRADE_COST = 50;
const UPGRADE_EXP = 25;

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  snake: import('../game/types').PetSnake | null;
}

export default function UpgradeModal({ open, onClose, snake }: UpgradeModalProps) {
  const { state, upgradeSnake, lastLevelUp, clearLevelUp } = useGame();
  if (!open || !snake) return null;
  const species = getSpecies(snake.speciesId);
  const isAdult = snake.stage === 'adult';
  const need = snake.stage === 'baby' ? EXP_THRESHOLDS.babyToTeen : snake.stage === 'teen' ? EXP_THRESHOLDS.teenToAdult : 0;
  const canAfford = state.coins >= UPGRADE_COST;
  const playerExpPct = Math.min(100, (state.playerExp / PLAYER_EXP_PER_LEVEL) * 100);
  const isMaxLevel = state.playerLevel >= MAX_PLAYER_LEVEL;

  const buy = () => {
    audio.playSfx('click');
    upgradeSnake(snake.id);
  };

  const close = () => {
    clearLevelUp();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(40,30,50,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={close}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-amber-50 to-orange-50 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 className="mb-4 text-center text-xl font-black text-stone-700">玩家升級</h2>

        {/* Player level circle */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 shadow-lg"
            style={{ width: 88, height: 88 }}
          >
            <span className="text-3xl font-black text-white drop-shadow">Lv{state.playerLevel}</span>
          </div>

          {/* Player EXP bar (white horizontal bar) */}
          <div className="w-full">
            <div className="h-4 w-full overflow-hidden rounded-full bg-white shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${isMaxLevel ? 100 : playerExpPct}%` }}
              />
            </div>
            <p className="mt-1 text-center text-xs font-bold text-stone-500">
              {isMaxLevel ? '已達最高等級' : `${state.playerExp} / ${PLAYER_EXP_PER_LEVEL} EXP`}
            </p>
          </div>

          {/* Level reward info */}
          <p className="text-center text-xs text-stone-500">
            蛇每進化一階段 +25 EXP · 每 100 EXP 升級送食物
          </p>
          {!isMaxLevel && (
            <p className="text-xs font-bold text-emerald-600">
              下一級獎勵：{nextReward(state.playerLevel)}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="my-4 h-px w-full bg-stone-200" />

        {/* Snake EXP boost section */}
        <div>
          <p className="mb-2 text-center text-sm font-bold text-stone-600">
            {species.name} · {STAGE_LABEL[snake.stage]} · {snake.exp}/{need || '—'} EXP
          </p>
          {isAdult ? (
            <p className="rounded-2xl bg-amber-50 px-4 py-2 text-center text-sm font-bold text-amber-600">
              成年蛇已達最高階，無法再升級。
            </p>
          ) : (
            <button
              type="button"
              onClick={buy}
              disabled={!canAfford}
              className="block w-full rounded-full bg-emerald-500 px-6 py-2.5 font-bold text-white shadow transition active:scale-95 disabled:opacity-40"
            >
              {canAfford ? `花 ${UPGRADE_COST} 金幣 +${UPGRADE_EXP} 蛇EXP` : '金幣不足'}
            </button>
          )}
        </div>

        {/* Level-up notification */}
        {lastLevelUp?.leveledUp && lastLevelUp.reward && (
          <div className="mt-4 text-center">
            <p className="inline-block rounded-full bg-amber-100 px-5 py-2 text-sm font-extrabold text-amber-600 shadow">
              升級！Lv{lastLevelUp.newLevel} · 獲得 {lastLevelUp.reward.apples} 蘋果 {lastLevelUp.reward.eggs} 雞蛋
            </p>
          </div>
        )}

        {/* Close hint */}
        <p className="mt-4 text-center text-xs text-stone-400">點擊外部關閉</p>
      </div>
    </div>
  );
}

function nextReward(currentLevel: number): string {
  const idx = currentLevel - 1;
  const r = LEVEL_REWARDS[idx];
  return r ? `${r.apples} 蘋果 ${r.eggs} 雞蛋` : '—';
}
