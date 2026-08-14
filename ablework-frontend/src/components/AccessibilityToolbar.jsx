import { useContext, useState } from 'react';
import { AccessibilityContext } from '../context/AccessibilityContext';

export default function AccessibilityToolbar() {
  const { mode, setMode } = useContext(AccessibilityContext);
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'normal', 'large', 'xlarge'

  // Apply font size class to the document root
  const handleFontSizeChange = (size) => {
    setFontSize(size);
    const root = document.documentElement;
    root.classList.remove('font-normal', 'font-large', 'font-xlarge');
    root.classList.add(`font-${size}`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Control Panel */}
      {isOpen && (
        <div 
          className="mb-3 w-72 bg-white dark:bg-gray-900 border-2 border-blue-500 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 text-gray-800 dark:text-gray-100"
          role="region"
          aria-label="Accessibility Control Panel"
        >
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-sm tracking-wide uppercase text-blue-600">Accessibility Controls</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 font-bold text-lg px-2 cursor-pointer"
              aria-label="Close accessibility menu"
            >
              &times;
            </button>
          </div>

          {/* Theme Switcher Section (Standard & High Contrast Only) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500">Display Theme</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('Standard')}
                className={`py-2 text-xs font-bold rounded border cursor-pointer ${
                  mode === 'Standard' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
                aria-label="Standard Mode"
              >
                Standard
              </button>
              <button
                onClick={() => setMode('High Contrast')}
                className={`py-2 text-xs font-bold rounded border cursor-pointer ${
                  mode === 'High Contrast' ? 'bg-yellow-400 text-black border-black' : 'bg-black text-yellow-400 border-yellow-400'
                }`}
                aria-label="High Contrast Mode"
              >
                Contrast
              </button>
            </div>
          </div>

          {/* Font Adjustment Section */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500">Font Size Adjustment</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleFontSizeChange('normal')}
                className={`py-1.5 text-xs font-bold rounded border cursor-pointer ${
                  fontSize === 'normal' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
                aria-label="Normal Font Size"
              >
                A
              </button>
              <button
                onClick={() => handleFontSizeChange('large')}
                className={`py-1.5 text-sm font-bold rounded border cursor-pointer ${
                  fontSize === 'large' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
                aria-label="Large Font Size"
              >
                A+
              </button>
              <button
                onClick={() => handleFontSizeChange('xlarge')}
                className={`py-1.5 text-base font-bold rounded border cursor-pointer ${
                  fontSize === 'xlarge' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
                aria-label="Extra Large Font Size"
              >
                A++
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Main Floating Accessibility Toggle Button with Universal Accessibility Logo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 border-2 border-white cursor-pointer"
        aria-label="Open Accessibility Menu"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="4" r="2" />
          <path d="M19 13h-2v-3c0-1.1-.9-2-2-2h-3.5c-.3-.6-.9-1-1.5-1h-2c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h2v4h2v-4h1v4h2v-5.5c0-.8-.7-1.5-1.5-1.5z" />
        </svg>
      </button>

    </div>
  );
}