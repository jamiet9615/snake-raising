import { ASSETS } from '../game/constants';
import { useGame } from '../lib/gameState';
import AssetImage from '../components/AssetImage';
import { Trash2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// SettingsModal — 設定版面 panel with BGM/SFX toggles + reset.
// Toggles are overlaid on the panel, positioned to the left.
// Tap anywhere outside the panel to close.
// ---------------------------------------------------------------------------

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { state, toggleBgm, toggleSfx, resetGame } = useGame();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(40,30,50,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {/* Panel background */}
        <AssetImage
          src={ASSETS.images.settingsPanel}
          alt="設定版面"
          className="h-[60vh] w-auto max-w-[90vw] select-none"
          placeholderRadius={24}
          placeholderLabel="設定版面"
        />

        {/* BGM toggle — positioned on the left side of the panel */}
        <button
          type="button"
          onClick={toggleBgm}
          className="btn-float absolute"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', top: '25%', left: '12%' }}
          aria-label="背景音樂開關"
        >
          <AssetImage
            src={state.bgmOn ? ASSETS.images.bgmOn : ASSETS.images.bgmOff}
            alt="背景音樂"
            className="h-16 w-16"
            placeholderRadius={999}
            placeholderLabel={state.bgmOn ? 'BGM ON' : 'BGM OFF'}
          />
        </button>

        {/* SFX toggle — positioned on the left side, below BGM */}
        <button
          type="button"
          onClick={toggleSfx}
          className="btn-float absolute"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', top: '50%', left: '12%' }}
          aria-label="音效開關"
        >
          <AssetImage
            src={state.sfxOn ? ASSETS.images.sfxOn : ASSETS.images.sfxOff}
            alt="音效"
            className="h-16 w-16"
            placeholderRadius={999}
            placeholderLabel={state.sfxOn ? 'SFX ON' : 'SFX OFF'}
          />
        </button>

        {/* Reset button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('確定要重置整個遊戲進度嗎？所有蛇蛇與資源將消失。')) resetGame();
          }}
          className="absolute flex items-center gap-2 rounded-2xl bg-rose-50/90 px-4 py-2 font-bold text-rose-500 shadow"
          style={{ bottom: '10%', left: '50%', transform: 'translateX(-50%)' }}
        >
          <Trash2 size={18} /> 重置進度
        </button>
      </div>
    </div>
  );
}
