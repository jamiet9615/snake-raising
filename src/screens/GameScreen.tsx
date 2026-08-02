import { useState } from 'react';
import { ASSETS, EXP_THRESHOLDS, MAX_ACTIVE_SNAKES } from '../game/constants';
import { getSpecies } from '../game/snakes';
import { useGame } from '../lib/gameState';
import FloatButton from '../components/FloatButton';
import HudBar from '../components/HudBar';
import SnakeSprite from '../components/SnakeSprite';
import SettingsModal from '../modals/SettingsModal';
import FeedModal from '../modals/FeedModal';
import UpgradeModal from '../modals/UpgradeModal';
import DexModal from '../modals/DexModal';
import type { PetSnake } from '../game/types';

// ---------------------------------------------------------------------------
// GameScreen — main raising area. Shows up to 2 snakes, lets the player pet,
// feed, and upgrade them.
// Right side (top→bottom): 設定 → 圖鑑 → 退出遊戲
// Bottom (left→right): 扭蛋 → 餵食 → 升級 → 花園
// ---------------------------------------------------------------------------

const STAGE_LABEL: Record<string, string> = { baby: '幼年', teen: '青年', adult: '成年' };

export default function GameScreen() {
  const { state, setScreen } = useGame();
  const [feedOpen, setFeedOpen] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<PetSnake | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dexOpen, setDexOpen] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-lime-100 via-emerald-50 to-green-200" />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${ASSETS.images.gameBg})` }}
      />

      <HudBar />

      {/* Right side: settings → dex → exit (top to bottom) */}
      <div className="absolute right-3 top-20 z-20 flex flex-col gap-3">
        <FloatButton src={ASSETS.images.settingsBtn} alt="設定" square onClick={() => setSettingsOpen(true)} className="h-16 w-16 sm:h-20 sm:w-20" />
        <FloatButton src={ASSETS.images.dexBtn} alt="圖鑑" square onClick={() => setDexOpen(true)} className="h-16 w-16 sm:h-20 sm:w-20" />
        <FloatButton src={ASSETS.images.exitBtn} alt="退出遊戲" square onClick={() => setScreen('home')} className="h-16 w-16 sm:h-20 sm:w-20" />
      </div>

      {/* Bottom: gacha → feed → upgrade → garden (left to right) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-center gap-4 px-4 pb-5 sm:gap-6">
        <FloatButton src={ASSETS.images.gachaBtn} alt="扭蛋" square onClick={() => setScreen('gacha')} className="h-20 w-20 sm:h-24 sm:w-24" />
        <FloatButton src={ASSETS.images.foodBtn} alt="餵食" square onClick={() => setFeedOpen(true)} className="h-20 w-20 sm:h-24 sm:w-24" />
        <FloatButton src={ASSETS.images.upgradeBtn} alt="升級" square onClick={() => state.active[0] && setUpgradeTarget(state.active[0])} className="h-20 w-20 sm:h-24 sm:w-24" />
        <FloatButton src={ASSETS.images.gardenBtn} alt="花園" square onClick={() => setScreen('garden')} className="h-20 w-20 sm:h-24 sm:w-24" />
      </div>

      {/* Snake stage */}
      <div className="relative z-10 flex h-full items-center justify-center gap-8 px-4 pb-36 pt-24">
        {state.active.length === 0 && <EmptyStage />}
        {state.active.map((snake) => (
          <SnakeCard key={snake.id} snake={snake} onFeed={() => setFeedOpen(true)} onUpgrade={() => setUpgradeTarget(snake)} />
        ))}
      </div>

      <FeedModal open={feedOpen} onClose={() => setFeedOpen(false)} />
      <UpgradeModal open={!!upgradeTarget} onClose={() => setUpgradeTarget(null)} snake={upgradeTarget} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <DexModal open={dexOpen} onClose={() => setDexOpen(false)} />
    </div>
  );
}

function EmptyStage() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="text-6xl">🥚</div>
      <p className="text-lg font-bold text-emerald-700/80">主畫面尚無蛇蛇，去扭蛋抽一隻吧！</p>
      <p className="text-sm text-emerald-600/70">上限 {MAX_ACTIVE_SNAKES} 隻</p>
    </div>
  );
}

function SnakeCard({ snake, onFeed, onUpgrade }: { snake: PetSnake; onFeed: () => void; onUpgrade: () => void }) {
  const species = getSpecies(snake.speciesId);
  const need = snake.stage === 'baby' ? EXP_THRESHOLDS.babyToTeen : snake.stage === 'teen' ? EXP_THRESHOLDS.teenToAdult : null;
  const progress = need ? Math.min(100, (snake.exp / need) * 100) : 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="rounded-3xl px-5 py-2 text-center text-base font-extrabold text-white shadow-lg"
        style={{ background: species.accent }}
      >
        {species.name} · {STAGE_LABEL[snake.stage]}
      </div>
      <SnakeSprite snake={snake} size={240} />
      {need !== null ? (
        <div className="w-48">
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/70 shadow-inner">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: species.accent }} />
          </div>
          <p className="mt-1 text-center text-xs font-bold text-emerald-700">{snake.exp} / {need} EXP</p>
        </div>
      ) : (
        <p className="rounded-full bg-amber-100 px-4 py-1 text-sm font-bold text-amber-700">已成年 · 等待畢業</p>
      )}
      <div className="flex gap-3">
        <button onClick={onFeed} className="rounded-full bg-rose-400 px-5 py-2 text-sm font-bold text-white shadow active:scale-95">餵食</button>
        <button onClick={onUpgrade} className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white shadow active:scale-95">升級</button>
      </div>
    </div>
  );
}
