import { useEffect, useState } from 'react';
import { stageArt } from '../game/snakes';
import { PETTED_DURATION_MS } from '../game/constants';
import { audio } from '../lib/audio';
import { useGame } from '../lib/gameState';
import type { PetSnake } from '../game/types';

// ---------------------------------------------------------------------------
// SnakeSprite — renders a snake's stage art. Tapping it plays the stage cry
// and swaps to the "petted" art for PETTED_DURATION_MS. No emoji overlay.
// ---------------------------------------------------------------------------

interface SnakeSpriteProps {
  snake: PetSnake;
  size?: number;
  className?: string;
}

export default function SnakeSprite({ snake, size = 220, className = '' }: SnakeSpriteProps) {
  const { petSnake } = useGame();
  const [petted, setPetted] = useState(false);

  useEffect(() => {
    setPetted(false);
  }, [snake.stage, snake.speciesId]);

  const handlePet = () => {
    petSnake(snake);
    setPetted(true);
    window.setTimeout(() => setPetted(false), PETTED_DURATION_MS);
  };

  const src = stageArt(snake.speciesId, snake.stage, petted);

  return (
    <button
      type="button"
      onClick={handlePet}
      aria-label={`撫摸 ${snake.speciesId}`}
      className={`relative inline-flex items-end justify-center bg-transparent ${className}`}
      style={{ border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <img
        src={src}
        alt={snake.speciesId}
        draggable={false}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = '0.25';
        }}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          transition: 'transform 120ms ease-out, filter 120ms ease-out',
          transform: petted ? 'scale(1.08)' : 'scale(1)',
          filter: petted
            ? 'drop-shadow(0 6px 14px rgba(255,180,200,0.7))'
            : 'drop-shadow(0 4px 8px rgba(0,0,0,0.18))',
        }}
      />
    </button>
  );
}
