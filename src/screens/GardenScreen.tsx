import { ASSETS } from '../game/constants';
import { SPECIES } from '../game/snakes';
import { useGame } from '../lib/gameState';
import AssetImage from '../components/AssetImage';
import FloatButton from '../components/FloatButton';
import HudBar from '../components/HudBar';

// ---------------------------------------------------------------------------
// GardenScreen — 花園背景 showing retired/graduated snakes.
// Entered via the garden button on the main screen.
// ---------------------------------------------------------------------------

export default function GardenScreen() {
  const { state, setScreen } = useGame();

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-emerald-50 to-green-200" />
      <div
        className="absolute inset-x-0 top-[6%] h-[88%] bg-cover bg-center"
        style={{ backgroundImage: `url(${ASSETS.images.gardenBg})` }}
      />

      <HudBar />

      {/* Exit button — enlarged, moved down */}
      <div className="absolute left-3 top-8 z-20">
        <FloatButton src={ASSETS.images.exitBtn} alt="返回" square onClick={() => setScreen('game')} className="h-20 w-20 sm:h-24 sm:w-24" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center px-4 pt-24">
        <h2 className="text-2xl font-black text-emerald-600 drop-shadow-[0_2px_0_rgba(255,255,255,0.8)]">退休花園</h2>

        {/* Retired snakes — anchored to the bottom third of the screen */}
        <div className="flex flex-wrap items-end justify-center gap-6 px-4 absolute bottom-[8%] left-0 right-0">
          {state.garden.length === 0 && (
            <p className="text-sm font-bold text-emerald-600/70">花園尚無退休蛇蛇，讓成年蛇畢業後就會入住喔！</p>
          )}
          {state.garden.map((s) => {
            const sp = SPECIES.find((x) => x.id === s.speciesId);
            return (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <AssetImage
                  src={sp ? sp.art.adult.normal : ''}
                  alt={s.speciesId}
                  className="h-32 w-32 object-contain"
                  placeholderRadius={20}
                  placeholderLabel={s.speciesId}
                />
                <span className="text-xs font-bold text-emerald-700">{sp ? sp.name : s.speciesId}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
