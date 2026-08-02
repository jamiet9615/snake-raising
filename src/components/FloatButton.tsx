import { useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import AssetImage from './AssetImage';

// ---------------------------------------------------------------------------
// FloatButton — image-based button with the breathing .btn-float effect
// and the required click SFX. Used for every UI button in the game.
// ---------------------------------------------------------------------------

interface FloatButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  src: string;
  alt: string;
  onClick?: () => void;
  square?: boolean;
}

export default function FloatButton({
  src,
  alt,
  onClick,
  square = false,
  className = '',
  ...rest
}: FloatButtonProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      className={`btn-float group relative inline-flex items-center justify-center bg-transparent p-0 ${className}`}
      style={{ border: 'none', cursor: 'pointer' }}
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      {...rest}
    >
      <AssetImage
        src={src}
        alt={alt}
        className={`pointer-events-none select-none transition-transform duration-150 ease-out ${square ? 'aspect-square' : ''}`}
        placeholderRadius={999}
        placeholderLabel={alt}
      />
      {pressed && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-white/30 mix-blend-overlay"
        />
      )}
    </button>
  );
}
