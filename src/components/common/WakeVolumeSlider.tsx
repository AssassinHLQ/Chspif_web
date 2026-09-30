import { useEffect, useMemo, useRef, useState } from 'react';

interface WakeVolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const clamp = (value: number) => Math.min(100, Math.max(0, value));

const WakeVolumeSlider = ({ value, onChange }: WakeVolumeSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const bars = useMemo(() => Array.from({ length: 24 }, (_, index) => {
    const wave = Math.sin(index * 1.7) * 0.18 + Math.sin(index * 0.43) * 0.14;
    return Math.max(0.24, 0.42 + wave + (index % 5 === 0 ? 0.15 : 0));
  }), []);

  const updateFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    onChange(Math.round(clamp(((clientX - rect.left) / rect.width) * 100)));
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => updateFromClientX(event.clientX);
    const stop = () => setDragging(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop, { once: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
  }, [dragging]);

  return (
    <div className='wake-volume'>
      <div
        ref={trackRef}
        className={`wake-volume-track${dragging ? ' is-dragging' : ''}`}
        role='slider'
        tabIndex={0}
        aria-label='音量'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        onPointerDown={(event) => {
          setDragging(true);
          updateFromClientX(event.clientX);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault();
            onChange(clamp(value + 1));
          }
          if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            onChange(clamp(value - 1));
          }
          if (event.key === 'Home') onChange(0);
          if (event.key === 'End') onChange(100);
        }}
      >
        {bars.map((height, index) => {
          const threshold = (index / (bars.length - 1)) * 100;
          const active = threshold <= value;
          return (
            <span
              key={index}
              className={`wake-volume-bar${active ? ' is-active' : ''}`}
              style={{ '--bar-height': `${height * 100}%` } as React.CSSProperties}
            />
          );
        })}
        <span className='wake-volume-fill' style={{ width: `${value}%` }} />
      </div>
      <span className='wake-volume-value'>{value}%</span>
    </div>
  );
};

export default WakeVolumeSlider;
