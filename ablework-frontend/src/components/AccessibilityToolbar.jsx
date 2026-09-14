import { useState, useEffect, useContext } from 'react';
import { AccessibilityContext } from '../context/AccessibilityContext';

export function AccessibilityToolbar() {
  const { mode, setMode } = useContext(AccessibilityContext);
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); 

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('high-contrast', 'standard', 'color-blind');
    
    if (mode === 'High Contrast') {
      root.classList.add('high-contrast');
    } else if (mode === 'Color Blind') {
      root.classList.add('color-blind');
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

  return (
    <div className="fixed bottom-6 left-4 sm:left-6 z-[9999] flex flex-col items-start">
      

      {isOpen && (
        <div 
          className="mb-3 w-[calc(100vw-2rem)] max-w-72 sm:w-72 bg-brand-bg border-2 border-brand-primary/20 rounded-3xl shadow-2xl p-5 flex flex-col gap-4 text-brand-primary backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200"
          role="region"
          aria-label="Accessibility Control Panel"
        >
          <div className="flex justify-between items-center border-b-2 border-brand-primary/10 pb-3">
            <h3 tabIndex="0" className="font-black text-sm tracking-wide uppercase text-brand-accent">Accessibility Controls</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-brand-primary/60 hover:text-brand-primary font-black text-lg px-2 cursor-pointer transition-colors"
              aria-label="Close accessibility menu"
            >
              &times;
            </button>
          </div>


          <div className="flex flex-col gap-2">
            <span tabIndex="0" className="text-xs font-black uppercase tracking-wider text-brand-primary/70">Display Theme</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleThemeChange('Standard')}
                aria-pressed={mode === 'Standard'}
                className={`py-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer shadow-sm ${
                  mode === 'Standard' 
                    ? 'bg-brand-primary text-brand-bg border-brand-primary shadow-md' 
                    : 'bg-white text-brand-primary border-brand-primary/20 hover:border-brand-accent'
                }`}
                aria-label="Standard Mode"
              >
                Standard
              </button>
              <button
                onClick={() => handleThemeChange('High Contrast')}
                aria-pressed={mode === 'High Contrast'}
                className={`py-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer shadow-sm ${
                  mode === 'High Contrast' 
                    ? 'bg-brand-primary text-brand-bg border-brand-primary shadow-md' 
                    : 'bg-white text-brand-primary border-brand-primary/20 hover:border-brand-accent'
                }`}
                aria-label="Toggle High Contrast Mode"
              >
                Contrast
              </button>
              <button
                onClick={() => handleThemeChange('Color Blind')}
                aria-pressed={mode === 'Color Blind'}
                className={`py-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer shadow-sm ${
                  mode === 'Color Blind' 
                    ? 'bg-brand-primary text-brand-bg border-brand-primary shadow-md' 
                    : 'bg-white text-brand-primary border-brand-primary/20 hover:border-brand-accent'
                }`}
                aria-label="Toggle Color Blind Mode"
              >
                Color Blind
              </button>
            </div>
          </div>


          <div className="flex flex-col gap-2">
            <span tabIndex="0" className="text-xs font-black uppercase tracking-wider text-brand-primary/70">Font Size Adjustment</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleFontSizeChange('normal')}
                aria-pressed={fontSize === 'normal'}
                className={`py-2 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer shadow-sm ${
                  fontSize === 'normal' 
                    ? 'bg-brand-accent text-brand-bg border-brand-accent shadow-md' 
                    : 'bg-white text-brand-primary border-brand-primary/20 hover:border-brand-accent'
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
                    ? 'bg-brand-accent text-brand-bg border-brand-accent shadow-md' 
                    : 'bg-white text-brand-primary border-brand-primary/20 hover:border-brand-accent'
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
                    ? 'bg-brand-accent text-brand-bg border-brand-accent shadow-md' 
                    : 'bg-white text-brand-primary border-brand-primary/20 hover:border-brand-accent'
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
        className="bg-brand-accent hover:bg-brand-primary text-brand-bg p-4 rounded-full shadow-[0_8px_16px_rgba(44,127,255,0.4)] flex items-center justify-center transition-all hover:scale-110 border-[3px] border-brand-primary cursor-pointer"
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