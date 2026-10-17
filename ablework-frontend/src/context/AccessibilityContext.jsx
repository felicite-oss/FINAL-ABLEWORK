import { createContext, useState, useEffect } from 'react';

export const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('ui_preference') || 'Standard';
  });

  const [deviceInfo, setDeviceInfo] = useState({ type: 'Device', isMobile: false });

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setDeviceInfo({ type: 'Mobile / Tablet', isMobile: true });
    } else {
      setDeviceInfo({ type: 'Laptop / Desktop', isMobile: false });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ui_preference', mode);
    const root = document.documentElement;

    root.classList.remove('theme-Standard', 'theme-Dark', 'theme-Assist');

    root.classList.add(`theme-${mode.replace(' ', '-')}`);

    if (mode.toLowerCase().includes('dark')) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
  }, [mode]);

  return (
    <AccessibilityContext.Provider value={{ mode, setMode, deviceInfo }}>
      {children}
    </AccessibilityContext.Provider>
  );
}