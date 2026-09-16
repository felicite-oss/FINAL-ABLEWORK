import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css'; // Added CSS import for the global TalkBack focus styles

import Login from './pages/Login';
import RegisterSelect from './pages/RegisterSelect';
import ApplicantRegister from './pages/ApplicantRegister';
import EmployerRegister from './pages/EmployerRegister';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import ApplicantDashboard from './pages/ApplicantDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AbbyChatbot from './components/AbbyChatbot';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './components/ForgotPassword';

// Navigation Pages & Home
import {
  Home,
  About,
  Policy,
  Terms,
  Contact
} from './pages/NavigationPages';
import { AccessibilityProvider, AccessibilityContext } from './context/AccessibilityContext';

// ======================================================
// ROUTE FOCUS MANAGER & ARIA TALKBACK SPEECH ENGINE
// ======================================================
function RouteFocusManager() {
  const location = useLocation();
  const { talkbackActive } = useContext(AccessibilityContext);

  useEffect(() => {
    // When the screen changes, find the main content wrapper and force focus on it.
    // This triggers TalkBack to automatically read all the content inside the new screen.
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      // Small timeout ensures the DOM has finished rendering the new route before focusing
      setTimeout(() => {
        mainContent.focus();
        
        // If talkbackActive (Aria) is toggled ON, read page title or content aloud
        if (talkbackActive && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const pageName = location.pathname === '/' ? 'Home' : location.pathname.replace('/', '').replace('-', ' ');
          const utterance = new SpeechSynthesisUtterance(`Navigated to ${pageName} page`);
          window.speechSynthesis.speak(utterance);
        }
      }, 100);
    }
  }, [location.pathname, talkbackActive]);

  // Global click reader listener for Aria when TalkBack is active
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!talkbackActive) return;
      
      // Target text, buttons, logos, accessibility elements, or chatbot clicked inside the app
      const targetElement = e.target.closest('button, a, span, p, h1, h2, h3, img, [role="button"]');
      if (targetElement) {
        const textToRead = targetElement.getAttribute('aria-label') || targetElement.alt || targetElement.innerText;
        if (textToRead && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(textToRead.trim());
          window.speechSynthesis.speak(utterance);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [talkbackActive]);

  return null;
}

// --- Wrapper Component to hide overlays on Admin routes ---
function GlobalOverlays() {
  const location = useLocation();
  
  if (location.pathname.includes('/admin')) {
    return null;
  }

  return (
    <>
      <div role="complementary" aria-label="Accessibility Settings and Tools">
        <AccessibilityToolbar />
      </div>
      <div role="region" aria-label="Abby Chatbot Assistant">
        <AbbyChatbot />
      </div>
    </>
  );
}

function App() {
  return (
    <AccessibilityProvider>
      <Router>
        <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300 relative">
          
          {/* Skip to main content */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#2C7FFF] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
          >
            Skip to main content
          </a>

          {/* Manages moving focus to main content on page change */}
          <RouteFocusManager />

          <GlobalOverlays />

          {/* 
            Added tabIndex="-1" to make it focusable by React so TalkBack starts reading here.
            Added outline-none so it doesn't show a blue box when focused by the system.
          */}
          <main 
            id="main-content" 
            role="main" 
            aria-label="Main Application Content" 
            tabIndex="-1" 
            className="outline-none h-full w-full focus:outline-none"
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register-select" element={<RegisterSelect />} />
              <Route path="/register/applicant" element={<ApplicantRegister />} />
              <Route path="/register/employer" element={<EmployerRegister />} />
              <Route path="/applicant-dashboard" element={<ApplicantDashboard />} />
              <Route path="/employer-dashboard" element={<EmployerDashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/policy" element={<Policy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </main>

        </div>
      </Router>
    </AccessibilityProvider>
  );
}

export default App;