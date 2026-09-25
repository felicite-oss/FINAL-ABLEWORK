import React from 'react';
import { useColorPalette } from '../context/ColorPaletteContext';

export default function ColorPalettePicker() {
  const { paletteKey, setPaletteKey, palettes } = useColorPalette();
  const isHighContrast = paletteKey === 'highContrast';

  return (
    <div className="flex flex-col gap-2">
      <span tabIndex="0" className="text-xs font-black uppercase tracking-wider text-[var(--color-textMuted)]">
        Color Vision Palette
      </span>
      <p className="text-[10px] font-bold text-[var(--color-textMuted)] -mt-1 mb-1 leading-snug">
        Choose colors that work best for your eyes
      </p>
      <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto pr-1 bg-[var(--color-surface)] border-2 border-[var(--color-border)] p-2 rounded-2xl">
        {Object.entries(palettes).map(([key, p]) => {
          const selected = key === paletteKey;
          return (
            <button
              key={key}
              onClick={() => setPaletteKey(key)}
              aria-pressed={selected}
              aria-label={`Select ${p.name} color palette`}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all cursor-pointer border-2 ${
                selected
                  ? isHighContrast
                    ? 'bg-[var(--color-surface)] border-[var(--color-text)] shadow-sm'
                    : 'bg-[var(--color-accentSoft)] border-[var(--color-accent)] shadow-sm'
                  : isHighContrast
                    ? 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-text)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
              }`}
            >
              <div className="flex items-center gap-0.5 shrink-0">
                {p.swatch.map((color, i) => (
                  <span
                    key={i}
                    className="w-3.5 h-3.5 rounded-full border border-[var(--color-border)]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-[var(--color-text)] truncate">{p.name}</p>
                <p className={`text-[9px] font-bold truncate ${isHighContrast ? 'text-[var(--color-text)]' : 'text-[var(--color-textMuted)]'}`}>{p.description}</p>
              </div>
              {selected && (
                <svg className="w-3.5 h-3.5 shrink-0 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}