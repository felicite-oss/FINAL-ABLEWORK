import { createContext, useState, useEffect } from 'react';

export const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('ui_preference') || 'Standard';
  });

  useEffect(() => {
    localStorage.setItem('ui_preference', mode);
    const root = document.documentElement;
    root.classList.remove('theme-Standard', 'theme-High-Contrast', 'theme-Assist');
    root.classList.add(`theme-${mode.replace(' ', '-')}`);
  }, [mode]);

  return (
    <AccessibilityContext.Provider value={{ mode, setMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
}