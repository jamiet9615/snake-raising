import { ASSETS } from '../game/constants';
import { useGame } from '../lib/gameState';
import AssetImage from '../components/AssetImage';

// ---------------------------------------------------------------------------
// HomeScreen — cover background (full screen, original position) + large start.
// BGM autoplays on first user gesture (browser policy requires a click).
// ---------------------------------------------------------------------------

export default function HomeScreen() {
  const { setScreen } = useGame();
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-pink-200 via-rose-100 to-amber-100" />

      {/* Cover background — full screen, original position */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${ASSETS.images.coverBg})` }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-end pb-[14vh]">
        <button
          type="button"
          onClick={() => setScreen('game')}
          className="btn-float group relative bg-transparent p-0"
          style={{ border: 'none', cursor: 'pointer' }}
          aria-label="開始遊戲"
        >
          <AssetImage
            src={ASSETS.images.startBtn}
            alt="開始"
            className="pointer-events-none h-auto w-80 select-none transition-transform duration-150 group-active:scale-90 sm:w-96"
            placeholderRadius={999}
            placeholderLabel="開始按鍵"
          />
        </button>
      </div>
    </div>
  );
}
