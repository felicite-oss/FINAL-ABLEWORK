import { useState, useEffect, useContext } from 'react';
import { AccessibilityContext } from '../context/AccessibilityContext';
import ColorPalettePicker from './ColorPalettePicker';

export function AccessibilityToolbar() {
  const { mode, setMode } = useContext(AccessibilityContext);
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); 

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark-mode', 'standard');
    
    if (mode === 'Dark') {
      root.classList.add('dark-mode');
    } else {
      root.classList.add('standard');
    }
  }, [mode]);

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    const root = document.documentElement;
    root.classList.remove('font-normal', 'font-large', 'font-xlarge');
    root.classList.add(`font-${size}`);
  };

  const handleThemeChange = (newMode) => {
    setMode(newMode);
  };

  const isDarkMode = mode === 'Dark';

  return (
    <div className="fixed bottom-6 left-4 sm:left-6 z-[9999] flex flex-col items-start">
      
      {isOpen && (
        <div 
          className="mb-3 w-[calc(100vw-2rem)] max-w-72 sm:w-72 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-3xl shadow-2xl p-5 flex flex-col gap-4 text-[var(--color-text)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 max-h-[80vh] overflow-y-auto"
          role="region"
          aria-label="Accessibility Control Panel"
        >
          <div className="flex justify-between items-center border-b-2 border-[var(--color-border)] pb-3">
            <h3 tabIndex="0" className="font-black text-sm tracking-wide uppercase text-[var(--color-accent)]">Accessibility Controls</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[var(--color-textMuted)] hover:text-[var(--color-text)] font-black text-lg px-2 cursor-pointer transition-colors"
              aria-label="Close accessibility menu"
            >
              &times;
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span tabIndex="0" className="text-xs font-black uppercase tracking-wider text-[var(--color-textMuted)]">Display Theme</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleThemeChange('Standard')}
                aria-pressed={mode === 'Standard'}
                className={`py-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer shadow-sm ${
                  mode === 'Standard' 
                    ? 'bg-[var(--color-primary)] text-[var(--color-background)] border-[var(--color-primary)] shadow-md' 
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                }`}
                aria-label="Standard Mode"
              >
                Standard
              </button>
              <button
                onClick={() => handleThemeChange('Dark')}
                aria-pressed={mode === 'Dark'}
                className={`py-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer shadow-sm ${
                  mode === 'Dark' 
                    ? 'bg-[var(--color-primary)] text-[var(--color-background)] border-[var(--color-primary)] shadow-md' 
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                }`}
                aria-label="Toggle Dark Mode"
              >
                Dark Mode
              </button>
            </div>
          </div>

          {!isDarkMode && (
            <div className="flex flex-col gap-2 border-t-2 border-[var(--color-border)] pt-3">
              <ColorPalettePicker />
            </div>
          )}

          <div className="flex flex-col gap-2 border-t-2 border-[var(--color-border)] pt-3">
            <span tabIndex="0" className="text-xs font-black uppercase tracking-wider text-[var(--color-textMuted)]">Font Size Adjustment</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleFontSizeChange('normal')}
                aria-pressed={fontSize === 'normal'}
                className={`py-2 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer shadow-sm ${
                  fontSize === 'normal' 
                    ? 'bg-[var(--color-accent)] text-[var(--color-background)] border-[var(--color-accent)] shadow-md' 
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                }`}
                aria-label="Normal Font Size"
              >
                A
              </button>
              <button
                onClick={() => handleFontSizeChange('large')}
                aria-pressed={fontSize === 'large'}
                className={`py-2 text-sm font-bold rounded-xl border-2 transition-all cursor-pointer shadow-sm ${
                  fontSize === 'large' 
                    ? 'bg-[var(--color-accent)] text-[var(--color-background)] border-[var(--color-accent)] shadow-md' 
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                }`}
                aria-label="Large Font Size"
              >
                A+
              </button>
              <button
                onClick={() => handleFontSizeChange('xlarge')}
                aria-pressed={fontSize === 'xlarge'}
                className={`py-2 px-1 text-sm font-bold rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center whitespace-nowrap shadow-sm ${
                  fontSize === 'xlarge' 
                    ? 'bg-[var(--color-accent)] text-[var(--color-background)] border-[var(--color-accent)] shadow-md' 
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                }`}
                aria-label="Extra Large Font Size"
              >
                A++
              </button>
            </div>
          </div>

        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[var(--color-accent)] hover:bg-[var(--color-primary)] text-[var(--color-background)] p-4 rounded-full shadow-[0_8px_16px_rgba(44,127,255,0.4)] flex items-center justify-center transition-all hover:scale-110 border-[3px] border-[var(--color-border)] cursor-pointer"
        aria-label="Open Accessibility Menu"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="4" r="2" />
          <path d="M19 13h-2v-3c0-1.1-.9-2-2-2h-3.5c-.3-.6-.9-1-1.5-1h-2c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h2v4h2v-4h1v4h2v-5.5c0-.8-.7-1.5-1.5-1.5z" />
        </svg>
      </button>

    </div>
  );
}

export default AccessibilityToolbar;