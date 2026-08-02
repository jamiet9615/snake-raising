import { useState } from 'react';
import { ASSETS, GACHA_COST, MAX_ACTIVE_SNAKES } from '../game/constants';
import { getSpecies } from '../game/snakes';
import { useGame } from '../lib/gameState';
import { audio } from '../lib/audio';
import AssetImage from '../components/AssetImage';
import FloatButton from '../components/FloatButton';
import HudBar from '../components/HudBar';

// ---------------------------------------------------------------------------
// GachaScreen — 扭蛋背景 + 扭蛋機 (with 扭蛋 ball inside).
// Tap the MACHINE to pull. Machine shakes, ball shakes 0.5s later,
// then result shows 抽取扭蛋畫面 + the drawn species' adult art.
// Tap anywhere to dismiss the result. Exit button in bottom-left.
// ---------------------------------------------------------------------------

export default function GachaScreen() {
  const { state, setScreen, pullGacha } = useGame();
  const [shaking, setShaking] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const canPull = state.coins >= GACHA_COST && state.active.length < MAX_ACTIVE_SNAKES && !shaking;

  const handlePull = () => {
    if (!canPull) {
      audio.playSfx('click');
      if (state.active.length >= MAX_ACTIVE_SNAKES) setToast('主畫面已滿，請先讓蛇畢業');
      else setToast('金幣不足');
      window.setTimeout(() => setToast(null), 2500);
      return;
    }
    audio.playSfx('click');
    setShaking(true);
    setResult(null);
    audio.playSfx('gachaSpin');
    window.setTimeout(() => {
      const res = pullGacha();
      setShaking(false);
      if (res.ok && res.speciesId) {
        audio.playSfx('gachaDrop');
        setResult(res.speciesId);
      } else {
        setToast(res.reason ?? '無法抽取');
        window.setTimeout(() => setToast(null), 2500);
      }
    }, 1800);
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-100 via-pink-100 to-rose-200" />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${ASSETS.images.gachaBg})` }}
      />

      <HudBar />

      {/* Exit button — bottom-left, enlarged */}
      <div className="absolute bottom-5 left-4 z-20">
        <FloatButton src={ASSETS.images.exitBtn} alt="返回" square onClick={() => setScreen('game')} className="h-20 w-20 sm:h-24 sm:w-24" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-4">
        {/* Gacha machine with ball inside — tap machine to pull */}
        <button
          type="button"
          onClick={handlePull}
          disabled={shaking}
          className="relative flex items-center justify-center"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          aria-label="扭蛋機"
        >
          {/* Machine */}
          <div className={shaking ? 'animate-shake' : ''}>
            <AssetImage
              src={ASSETS.images.gachaMachine}
              alt="扭蛋機"
              className="h-80 w-80 select-none sm:h-96 sm:w-96"
              placeholderRadius={24}
              placeholderLabel="扭蛋機"
            />
          </div>
          {/* Ball inside the machine — centered, delayed shake */}
          <div
            className={`absolute flex items-center justify-center ${shaking ? 'animate-shake-delayed' : ''}`}
            style={{ top: 0, left: 0, right: 0, bottom: 0, paddingTop: '15%' }}
          >
            <AssetImage
              src={ASSETS.images.gachaBall}
              alt="扭蛋"
              className="h-32 w-32 select-none sm:h-36 sm:w-36"
              placeholderRadius={999}
              placeholderLabel="扭蛋"
            />
          </div>
          {shaking && (
            <p className="absolute -bottom-8 text-sm font-bold text-rose-500 animate-pulse">抽取中…</p>
          )}
        </button>

        <p className="text-sm font-bold text-stone-600">點擊扭蛋機抽取 · 每次 {GACHA_COST} 金幣</p>

        {toast && (
          <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-rose-500 shadow">{toast}</div>
        )}
      </div>

      {/* Result overlay — tap anywhere to dismiss */}
      {result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setResult(null)}
          style={{ background: 'rgba(40,30,50,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <div className="relative flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* Result panel */}
            <AssetImage
              src={ASSETS.images.gachaResult}
              alt="抽取扭蛋畫面"
              className="h-[65vh] w-auto max-w-[90vw] select-none"
              placeholderRadius={24}
              placeholderLabel="抽取扭蛋畫面"
            />
            {/* Adult snake art on top of the panel — enlarged */}
            <div className="absolute inset-0 flex items-center justify-center">
              <AssetImage
                src={getSpecies(result).art.adult.normal}
                alt={getSpecies(result).name}
                className="h-60 w-60 object-contain sm:h-72 sm:w-72"
                placeholderRadius={16}
                placeholderLabel={`${getSpecies(result).name} 成蛇`}
              />
            </div>
            <p className="mt-4 text-lg font-extrabold text-white drop-shadow">{getSpecies(result).name}</p>
            <p className="mt-1 text-sm text-white/80">點擊任意處關閉</p>
          </div>
        </div>
      )}
    </div>
  );
}
