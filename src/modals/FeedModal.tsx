import { useState } from 'react';
import { ASSETS, FOOD_EXP } from '../game/constants';
import { getSpecies } from '../game/snakes';
import { useGame } from '../lib/gameState';
import { audio } from '../lib/audio';
import AssetImage from '../components/AssetImage';
import type { PetSnake } from '../game/types';

// ---------------------------------------------------------------------------
// FeedModal — 食物版面 panel (moved down) with snake selection + food.
// Player taps a snake to select it, then taps apple or egg to feed.
// No exit button — tap outside to close.
// ---------------------------------------------------------------------------

const STAGE_LABEL: Record<string, string> = { baby: '幼年', teen: '青年', adult: '成年' };

interface FeedModalProps {
  open: boolean;
  onClose: () => void;
  initialSnake?: PetSnake | null;
}

export default function FeedModal({ open, onClose, initialSnake }: FeedModalProps) {
  const { state, feedSnake } = useGame();
  const [selected, setSelected] = useState<PetSnake | null>(initialSnake ?? null);

  if (!open) return null;

  // Use the latest snake data from state (in case it evolved since opening)
  const activeSnakes = state.active;
  const currentSelected = selected
    ? activeSnakes.find((s) => s.id === selected.id) ?? activeSnakes[0] ?? null
    : activeSnakes[0] ?? null;

  const feed = (food: 'apple' | 'egg') => {
    if (!currentSelected) return;
    audio.playSfx('click');
    feedSnake(currentSelected.id, food);
  };

  if (activeSnakes.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(40,30,50,0.5)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <div className="rounded-3xl bg-white/95 px-8 py-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <p className="text-lg font-bold text-stone-600">目前沒有蛇蛇可以餵食</p>
          <p className="mt-2 text-sm text-stone-400">點擊任意處關閉</p>
        </div>
      </div>
    );
  }

  const selectedSpecies = currentSelected ? getSpecies(currentSelected.speciesId) : null;
  const isAdult = currentSelected?.stage === 'adult';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(40,30,50,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {/* Panel background — moved down */}
        <div className="mt-16">
          <AssetImage
            src={ASSETS.images.foodPanel}
            alt="食物版面"
            className="h-[55vh] w-auto max-w-[90vw] select-none"
            placeholderRadius={24}
            placeholderLabel="食物版面"
          />
        </div>

        {/* Snake selection row — at top of panel */}
        <div className="absolute left-0 right-0 flex items-end justify-center gap-4" style={{ top: '8%' }}>
          {activeSnakes.map((snake) => {
            const sp = getSpecies(snake.speciesId);
            const isSelected = currentSelected?.id === snake.id;
            return (
              <button
                key={snake.id}
                type="button"
                onClick={() => setSelected(snake)}
                className="flex flex-col items-center gap-1 rounded-2xl p-2 transition"
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  outline: isSelected ? `3px solid ${sp.accent}` : 'none',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <AssetImage
                  src={sp.art[snake.stage].normal}
                  alt={sp.name}
                  className="h-20 w-20 object-contain"
                  placeholderRadius={16}
                  placeholderLabel={sp.name}
                />
                <span className="text-xs font-bold text-stone-600">{sp.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected snake info */}
        {currentSelected && selectedSpecies && (
          <div className="absolute left-0 right-0 text-center" style={{ top: '38%' }}>
            <p className="text-sm font-extrabold text-stone-700">
              {selectedSpecies.name} · {STAGE_LABEL[currentSelected.stage]} · EXP {currentSelected.exp}
            </p>
          </div>
        )}

        {/* Food items */}
        {isAdult ? (
          <div className="absolute left-0 right-0 text-center" style={{ top: '50%' }}>
            <p className="mx-auto max-w-[70%] rounded-2xl bg-amber-50/90 px-4 py-3 text-sm font-bold text-amber-600">
              成年蛇已無法再進化，請等待自動畢業。
            </p>
          </div>
        ) : (
          <div className="absolute flex items-center justify-center gap-10" style={{ top: '48%', left: 0, right: 0 }}>
            <button
              type="button"
              onClick={() => feed('apple')}
              disabled={state.apples <= 0}
              className="flex flex-col items-center gap-1 disabled:opacity-40"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <AssetImage src={ASSETS.images.apple} alt="蘋果" className="h-24 w-24" placeholderRadius={999} placeholderLabel="蘋果" />
              <span className="text-sm font-bold text-stone-700">蘋果 x{state.apples}</span>
              <span className="text-xs text-stone-400">+{FOOD_EXP.apple} EXP</span>
            </button>
            <button
              type="button"
              onClick={() => feed('egg')}
              disabled={state.eggs <= 0}
              className="flex flex-col items-center gap-1 disabled:opacity-40"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <AssetImage src={ASSETS.images.egg} alt="雞蛋" className="h-24 w-24" placeholderRadius={999} placeholderLabel="雞蛋" />
              <span className="text-sm font-bold text-stone-700">雞蛋 x{state.eggs}</span>
              <span className="text-xs text-stone-400">+{FOOD_EXP.egg} EXP</span>
            </button>
          </div>
        )}

        {/* Hint */}
        <p className="absolute left-0 right-0 text-center text-xs text-stone-400" style={{ bottom: '6%' }}>
          點擊蛇蛇選擇 · 點擊食物餵食 · 點擊外部關閉
        </p>
      </div>
    </div>
  );
}
