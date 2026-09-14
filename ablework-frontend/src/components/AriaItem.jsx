import React, { useContext } from 'react';
import { AccessibilityContext } from '../context/AccessibilityContext';

export default function AriaItem({ children, label, tag = 'div', className = '', onClick }) {
  const { talkbackActive } = useContext(AccessibilityContext);

  const handleClick = (e) => {
    if (talkbackActive) {
      
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(label || e.currentTarget.innerText);
        window.speechSynthesis.speak(utterance);
      }
    }
    if (onClick) onClick(e);
  };

  const Component = tag;

  return (
    <Component
      tabIndex={0}
      aria-label={label}
      onClick={handleClick}
      className={`${className} ${talkbackActive ? 'talkback-focusable' : ''}`}
    >
      {children}
    </Component>
  );
}