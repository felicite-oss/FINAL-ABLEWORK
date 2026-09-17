import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

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

import {
  Home,
  About,
  Policy,
  Terms,
  Contact
} from './pages/NavigationPages';
import { AccessibilityProvider, AccessibilityContext } from './context/AccessibilityContext';
import { ColorPaletteProvider } from './context/ColorPaletteContext';

function RouteFocusManager() {
  const location = useLocation();
  const { talkbackActive } = useContext(AccessibilityContext);

  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      setTimeout(() => {
        mainContent.focus();
        
        if (talkbackActive && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const pageName = location.pathname === '/' ? 'Home' : location.pathname.replace('/', '').replace('-', ' ');
          const utterance = new SpeechSynthesisUtterance(`Navigated to ${pageName} page`);
          window.speechSynthesis.speak(utterance);
        }
      }, 100);
    }
  }, [location.pathname, talkbackActive]);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!talkbackActive) return;
      
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
      <ColorPaletteProvider>
        <Router>
          <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300 relative">
            
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#2C7FFF] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
            >
              Skip to main content
            </a>

            <RouteFocusManager />

            <GlobalOverlays />

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
      </ColorPaletteProvider>
    </AccessibilityProvider>
  );
}

export default App;