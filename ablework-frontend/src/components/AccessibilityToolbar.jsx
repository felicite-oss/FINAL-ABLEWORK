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
          className="mb-3 w-[calc(100vw-2rem)] max-w-80 sm:w-80 relative rounded-[2rem] border-2 border-[var(--color-border)] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-300 max-h-[82vh] flex flex-col bg-[var(--color-surface)]"
          role="region"
          aria-label="Accessibility Control Panel"
        >
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[var(--color-accent)] opacity-20 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-[var(--color-primary)] opacity-20 blur-2xl pointer-events-none"></div>

          <div className="relative px-5 pt-5 pb-4 border-b-2 border-[var(--color-border)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent)] text-[var(--color-background)] flex items-center justify-center border-2 border-[var(--color-border)] shadow-md">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="12" cy="4" r="2" />
                    <path d="M19 13h-2v-3c0-1.1-.9-2-2-2h-3.5c-.3-.6-.9-1-1.5-1h-2c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h2v4h2v-4h1v4h2v-5.5c0-.8-.7-1.5-1.5-1.5z" />
                  </svg>
                </div>
                <div>
                  <h3 tabIndex="0" className="font-black text-sm tracking-tight uppercase text-[var(--color-text)] leading-none">Accessibility</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-accent)] mt-1">Control Center</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl border-2 border-[var(--color-border)] text-[var(--color-textMuted)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)] font-black text-lg flex items-center justify-center cursor-pointer transition-all"
                aria-label="Close accessibility menu"
              >
                &times;
              </button>
            </div>
          </div>

          <div className="relative px-5 py-4 flex flex-col gap-4 overflow-y-auto">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"></span>
                <span tabIndex="0" className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-textMuted)]">Display Theme</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleThemeChange('Standard')}
                  aria-pressed={mode === 'Standard'}
                  className={`group relative py-3 px-3 rounded-2xl border-2 transition-all cursor-pointer shadow-sm flex flex-col items-center gap-1.5 ${
                    mode === 'Standard' 
                      ? 'bg-[var(--color-primary)] text-[var(--color-background)] border-[var(--color-primary)] shadow-md scale-[1.02]' 
                      : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                  }`}
                  aria-label="Standard Mode"
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 ${
                    mode === 'Standard' ? 'bg-[var(--color-background)] text-[var(--color-primary)] border-[var(--color-background)]' : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]'
                  }`}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="4" />
                      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-black tracking-wide">Standard</span>
                </button>
                <button
                  onClick={() => handleThemeChange('Dark')}
                  aria-pressed={mode === 'Dark'}
                  className={`group relative py-3 px-3 rounded-2xl border-2 transition-all cursor-pointer shadow-sm flex flex-col items-center gap-1.5 ${
                    mode === 'Dark' 
                      ? 'bg-[var(--color-primary)] text-[var(--color-background)] border-[var(--color-primary)] shadow-md scale-[1.02]' 
                      : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                  }`}
                  aria-label="Toggle Dark Mode"
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 ${
                    mode === 'Dark' ? 'bg-[var(--color-background)] text-[var(--color-primary)] border-[var(--color-background)]' : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]'
                  }`}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-black tracking-wide">Dark Mode</span>
                </button>
              </div>
            </div>

            {!isDarkMode && (
              <div className="flex flex-col gap-2.5 border-t-2 border-[var(--color-border)] pt-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"></span>
                  <span tabIndex="0" className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-textMuted)]">Color Palette</span>
                </div>
                <ColorPalettePicker />
              </div>
            )}

            <div className="flex flex-col gap-2.5 border-t-2 border-[var(--color-border)] pt-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"></span>
                <span tabIndex="0" className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-textMuted)]">Text Size</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleFontSizeChange('normal')}
                  aria-pressed={fontSize === 'normal'}
                  className={`py-3 rounded-2xl border-2 transition-all cursor-pointer shadow-sm flex flex-col items-center justify-center gap-1 ${
                    fontSize === 'normal' 
                      ? 'bg-[var(--color-accent)] text-[var(--color-background)] border-[var(--color-accent)] shadow-md scale-[1.02]' 
                      : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                  }`}
                  aria-label="Normal Font Size"
                >
                  <span className="text-sm font-black leading-none">A</span>
                  <span className="text-[9px] font-black uppercase tracking-wider opacity-80">Normal</span>
                </button>
                <button
                  onClick={() => handleFontSizeChange('large')}
                  aria-pressed={fontSize === 'large'}
                  className={`py-3 rounded-2xl border-2 transition-all cursor-pointer shadow-sm flex flex-col items-center justify-center gap-1 ${
                    fontSize === 'large' 
                      ? 'bg-[var(--color-accent)] text-[var(--color-background)] border-[var(--color-accent)] shadow-md scale-[1.02]' 
                      : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                  }`}
                  aria-label="Large Font Size"
                >
                  <span className="text-base font-black leading-none">A+</span>
                  <span className="text-[9px] font-black uppercase tracking-wider opacity-80">Large</span>
                </button>
                <button
                  onClick={() => handleFontSizeChange('xlarge')}
                  aria-pressed={fontSize === 'xlarge'}
                  className={`py-3 rounded-2xl border-2 transition-all cursor-pointer shadow-sm flex flex-col items-center justify-center gap-1 whitespace-nowrap ${
                    fontSize === 'xlarge' 
                      ? 'bg-[var(--color-accent)] text-[var(--color-background)] border-[var(--color-accent)] shadow-md scale-[1.02]' 
                      : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                  }`}
                  aria-label="Extra Large Font Size"
                >
                  <span className="text-base font-black leading-none">A++</span>
                  <span className="text-[9px] font-black uppercase tracking-wider opacity-80">Max</span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative px-5 py-3 border-t-2 border-[var(--color-border)] flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-textMuted)]">Settings Auto-Save</span>
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse"></span>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative bg-[var(--color-accent)] hover:bg-[var(--color-primary)] text-[var(--color-background)] p-4 rounded-full shadow-[0_8px_16px_rgba(44,127,255,0.4)] flex items-center justify-center transition-all hover:scale-110 border-[3px] border-[var(--color-border)] cursor-pointer"
        aria-label="Open Accessibility Menu"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="absolute inset-0 rounded-full bg-[var(--color-accent)] opacity-40 animate-ping"></span>
        <svg xmlns="http://www.w3.org/2000/svg" className="relative h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="4" r="2" />
          <path d="M19 13h-2v-3c0-1.1-.9-2-2-2h-3.5c-.3-.6-.9-1-1.5-1h-2c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h2v4h2v-4h1v4h2v-5.5c0-.8-.7-1.5-1.5-1.5z" />
        </svg>
      </button>

    </div>
  );
}

export default AccessibilityToolbar;