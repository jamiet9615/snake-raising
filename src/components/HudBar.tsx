import { useGame } from '../lib/gameState';

// ---------------------------------------------------------------------------
// HudBar — top resource strip: coins, apples, eggs. Shared across screens.
// ---------------------------------------------------------------------------

export default function HudBar() {
  const { state } = useGame();
  const items: { icon: string; label: string; value: number }[] = [
    { icon: '🪙', label: '金幣', value: state.coins },
    { icon: '🍎', label: '蘋果', value: state.apples },
    { icon: '🥚', label: '雞蛋', value: state.eggs },
  ];
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-center justify-center gap-2 px-3 pt-3 sm:justify-start sm:px-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 shadow-md backdrop-blur"
        >
          <span className="text-base leading-none">{it.icon}</span>
          <span className="text-sm font-extrabold text-stone-700 tabular-nums">{it.value}</span>
        </div>
      ))}
    </div>
  );
}
