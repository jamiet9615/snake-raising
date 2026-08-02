import { useState } from 'react';
import { ASSETS } from '../game/constants';
import { SPECIES } from '../game/snakes';
import { audio } from '../lib/audio';
import AssetImage from '../components/AssetImage';

// ---------------------------------------------------------------------------
// DexModal — full-screen 圖鑑 panel. Shows one silhouette per page.
// Tap ANYWHERE to advance pages with a click SFX. Exit button top-left.
// Page 1: 青草蛇剪影 → 草莓蛇 → 天空蛇 → 海蛇 → 地頭蛇 → python
// ---------------------------------------------------------------------------

interface DexModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DexModal({ open, onClose }: DexModalProps) {
  const [page, setPage] = useState(0);
  if (!open) return null;

  const maxPage = SPECIES.length - 1;
  const species = SPECIES[page];

  const next = () => {
    audio.playSfx('click');
    setPage((p) => (p >= maxPage ? 0 : p + 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={next}
    >
      {/* Fallback backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {/* Panel background */}
        <div className="relative" onClick={next}>
          <AssetImage
            src={ASSETS.images.dexPanel}
            alt="圖鑑版面"
            className="h-[70vh] w-auto max-w-[90vw] select-none"
            placeholderRadius={24}
            placeholderLabel="圖鑑版面"
          />

          {/* Exit button — top-left of the panel, enlarged */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="btn-float absolute left-3 top-3 z-10"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
            aria-label="退出圖鑑"
          >
            <AssetImage
              src={ASSETS.images.exitBtn}
              alt="退出"
              className="h-16 w-16"
              placeholderRadius={999}
              placeholderLabel="退出"
            />
          </button>

          {/* Silhouette centered in the panel — enlarged */}
          <div className="absolute inset-0 flex items-center justify-center" onClick={next}>
            <AssetImage
              src={species.art.silhouette}
              alt={species.name}
              className="h-64 w-64 object-contain sm:h-72 sm:w-72"
              placeholderRadius={16}
              placeholderLabel={`${species.name} 剪影`}
            />
          </div>

          {/* Page number */}
          <div className="absolute bottom-6 left-0 right-0 text-center" onClick={next}>
            <span className="rounded-full bg-white/80 px-4 py-1 text-sm font-bold text-stone-600">
              {page + 1} / {SPECIES.length}
            </span>
          </div>
        </div>

        {/* Tap hint */}
        <p className="mt-3 text-center text-sm font-bold text-white/80">點擊畫面翻頁</p>
      </div>
    </div>
  );
}
