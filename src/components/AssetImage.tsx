import { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// AssetImage — <img> that falls back to a generated placeholder when the
// real asset is missing. This keeps the UI looking intentional even before
// the user drops their art into /public.
// ---------------------------------------------------------------------------

interface AssetImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Rounded-corner radius for the generated placeholder, in px. */
  placeholderRadius?: number;
  /** Optional label drawn on the placeholder (defaults to alt). */
  placeholderLabel?: string;
  draggable?: boolean;
}

export default function AssetImage({
  src,
  alt,
  className,
  placeholderRadius = 16,
  placeholderLabel,
  draggable = false,
}: AssetImageProps) {
  const [failed, setFailed] = useState(false);
  const [resolved, setResolved] = useState(true);

  useEffect(() => {
    setFailed(false);
    setResolved(true);
  }, [src]);

  if (failed || !resolved) {
    const label = placeholderLabel ?? alt;
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontWeight: 700,
          color: 'rgba(0,0,0,0.45)',
          background:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.65), rgba(255,255,255,0.65) 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)',
          borderRadius: placeholderRadius,
          border: '2px dashed rgba(0,0,0,0.18)',
          padding: '0.5rem',
          fontSize: '0.8rem',
          lineHeight: 1.25,
          wordBreak: 'break-all',
        }}
        title={label}
      >
        {label}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={draggable}
      onError={() => setFailed(true)}
    />
  );
}
