import { useState, useContext, useEffect } from 'react';
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';
import { useColorPalette } from '../context/ColorPaletteContext';
import { AccessibilityWelcome } from '../components/AccessibilityWelcome';
import lightLogo from '../assets/LIGHT MODE.png';
import darkLogo from '../assets/DARK MODE.png';
import backgroundImg from '../assets/BG.png';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  alt: ''
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();

  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isAccessibilityMode = paletteKey === 'highContrast' || paletteKey === 'darkComfort';

  return (
    <header className={`w-full ${isContrast ? 'bg-black border-b-2 border-[#2C7FFF]' : 'bg-white border-b-2 border-[#03045E]/15'} fixed top-0 left-0 z-50 transition-all duration-300 shadow-sm`}>
      <div className="w-full h-14 sm:h-16 pl-3 pr-3 sm:pl-4 sm:pr-4 md:pr-8 flex items-center justify-between max-w-[1700px] mx-auto box-border">

        <div className="flex items-center gap-8">
          <div className="flex items-center flex-shrink-0 py-1">
            <img
              src={(isAccessibilityMode || (mode && typeof mode === 'string' && mode.toLowerCase().includes('dark'))) ? darkLogo : lightLogo}
              alt="AbleWork logo"
              role="img"
              aria-label="AbleWork logo"
              tabIndex="0"
              className="h-9 sm:h-12 md:h-14 w-auto object-contain max-h-full"
            />
          </div>
          <nav className={`hidden md:flex items-center gap-6 text-[15px] font-semibold ${isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]'}`} aria-label="Main navigation">
            <NavLink 
              to="/" 
              aria-label="Home"
              className={({ isActive }) => 
                `transition-colors duration-200 hover:text-[var(--color-accent)] hover:scale-105 transform ${isActive ? `font-bold border-b-2 ${isContrast ? 'border-[var(--color-text)] text-[var(--color-text)]' : 'border-[#03045E] text-[#03045E]'} pb-0.5` : (isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]')}`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/about" 
              aria-label="About Us"
              className={({ isActive }) => 
                `transition-colors duration-200 hover:text-[var(--color-accent)] hover:scale-105 transform ${isActive ? `font-bold border-b-2 ${isContrast ? 'border-[var(--color-text)] text-[var(--color-text)]' : 'border-[#03045E] text-[#03045E]'} pb-0.5` : (isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]')}`
              }
            >
              About Us
            </NavLink>
            <NavLink 
              to="/policy" 
              aria-label="Policy"
              className={({ isActive }) => 
                `transition-colors duration-200 hover:text-[var(--color-accent)] hover:scale-105 transform ${isActive ? `font-bold border-b-2 ${isContrast ? 'border-[var(--color-text)] text-[var(--color-text)]' : 'border-[#03045E] text-[#03045E]'} pb-0.5` : (isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]')}`
              }
            >
              Policy
            </NavLink>
          </nav>
        </div>

        <div className="hidden md:flex items-center">
          <Link
            to="/login"
            aria-label="Log In"
            className={`login-btn px-5 py-2 rounded-full bg-transparent text-sm font-bold border-2 transition transform duration-200 ${
              isContrast 
                ? 'text-[var(--color-text)] border-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-[var(--color-background)] hover:border-[var(--color-accent)] hover:brightness-125' 
                : 'text-[#03045E] border-[#03045E] hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF] hover:brightness-125'
            }`}
          >
            Log In
          </Link>
        </div>

        <button
          className={`md:hidden flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-2 shadow-sm cursor-pointer transition-all duration-200 shrink-0 ${isContrast ? 'bg-zinc-900 text-white border-white/30' : 'bg-white text-[#03045E] border-[#03045E]/20'}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
          aria-expanded={isOpen}
          aria-controls="site-mobile-menu"
        >
          {isOpen ? (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div
        id="site-mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b-2 ${
          isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#03045E]/20'
        } ${
          isOpen ? 'max-h-96 opacity-100 shadow-xl' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={`w-full ${isContrast ? 'bg-black' : 'bg-white'}`}>
          <nav className={`flex flex-col px-2.5 pt-2.5 pb-2.5 gap-2 sm:px-3 sm:pt-3 sm:pb-3 sm:gap-2.5 ${isContrast ? 'text-white' : 'text-[#03045E]'}`} aria-label="Mobile navigation">
            <NavLink
              to="/"
              aria-label="Home"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-2xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${isActive ? 'bg-white text-[#03045E] border-[#03045E] shadow-md' : 'bg-white text-[#03045E] border-[#03045E]/25'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>}
                  <div aria-hidden="true" className="p-1.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div aria-hidden="true" className="flex-1 min-w-0">
                    <span className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">Home</span>
                  </div>
                  <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </NavLink>

            <NavLink
              to="/about"
              aria-label="About Us"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-2xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${isActive ? 'bg-white text-[#03045E] border-[#03045E] shadow-md' : 'bg-white text-[#03045E] border-[#03045E]/25'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>}
                  <div aria-hidden="true" className="p-1.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div aria-hidden="true" className="flex-1 min-w-0">
                    <span className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">About Us</span>
                  </div>
                  <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </NavLink>

            <NavLink
              to="/policy"
              aria-label="Policy"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-2xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${isActive ? 'bg-white text-[#03045E] border-[#03045E] shadow-md' : 'bg-white text-[#03045E] border-[#03045E]/25'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>}
                  <div aria-hidden="true" className="p-1.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div aria-hidden="true" className="flex-1 min-w-0">
                    <span className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">Policy</span>
                  </div>
                  <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </NavLink>

            <div aria-hidden="true" className={`h-px my-0.5 ${isContrast ? 'bg-[#2C7FFF]/30' : 'bg-[#03045E]/15'}`}></div>

            <NavLink
              to="/login"
              aria-label="Log In"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-2xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${isActive ? 'bg-white text-[#03045E] border-[#03045E] shadow-md' : 'bg-white text-[#03045E] border-[#03045E]/25'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>}
                  <div aria-hidden="true" className="p-1.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div aria-hidden="true" className="flex-1 min-w-0">
                    <span className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">Log In</span>
                  </div>
                  <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

export function Home() {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();

  const isAccessibilityContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && mode.toLowerCase().includes('dark');
  const isPaletteContrast = paletteKey === 'highContrast';
  const isDarkComfort = paletteKey === 'darkComfort';
  const isContrast = isAccessibilityContrast || isPaletteContrast || isDarkComfort;
  const usePlainWhiteText = isContrast || isDarkMode;

  const [jobs, setJobs] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState('');

  const [satelliteView, setSatelliteView] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);

  const defaultCenter = [10.6766, 122.9509];

  useEffect(() => {
    const fetchActiveJobs = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/jobs');
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (err) {
        console.error("Failed to fetch jobs for landing map:", err);
      }
    };

    fetchActiveJobs();
    handleDetectUserLocation(false); 
  }, []);

  const handleDetectUserLocation = (alertOnError = true) => {
    if (!navigator.geolocation) {
      if (alertOnError) setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsDetecting(false);
      },
      (error) => {
        console.warn("Geolocation notice:", error.message);
        setIsDetecting(false);
        if (alertOnError) {
          setLocationError("Location permission was denied. You can still explore all jobs on the map!");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const mappedJobs = jobs.filter(j => j.latitude && j.longitude);

  return (
    <div role="main" aria-label="Home Screen" className={`min-h-screen flex flex-col ${isContrast ? 'dark-mode-fix bg-[var(--color-background)] text-[var(--color-text)]' : 'bg-white text-[#03045E]'}`}>

      {usePlainWhiteText && (
        <style>{`
          .dark-mode-fix, .dark-mode-fix * {
            text-shadow: none !important;
            filter: none !important;
            -webkit-text-stroke: 0 !important;
            -webkit-text-fill-color: #FFFFFF !important;
            color: #FFFFFF !important;
            mix-blend-mode: normal !important;
          }
          .dark-mode-fix *:not(.hero-bg-img) {
            background-image: none !important;
          }
          .dark-mode-fix .leaflet-popup,
          .dark-mode-fix .leaflet-popup * {
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
            text-shadow: none !important;
            stroke: #000000 !important;
          }
          .dark-mode-fix .leaflet-popup svg,
          .dark-mode-fix .leaflet-popup svg * {
            stroke: #000000 !important;
            color: #000000 !important;
          }
        `}</style>
      )}

      {isDarkMode && !isContrast && (
        <style>{`
          .learn-more-btn, .learn-more-btn:hover,
          .get-started-btn, .get-started-btn:hover,
          .find-jobs-btn, .find-jobs-btn:hover,
          .register-btn, .register-btn:hover {
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }
        `}</style>
      )}

      {isDarkMode && isContrast && (
        <style>{`
          .learn-more-btn, .learn-more-btn:hover, .learn-more-btn *,
          .get-started-btn, .get-started-btn:hover, .get-started-btn *,
          .find-jobs-btn, .find-jobs-btn:hover, .find-jobs-btn *,
          .register-btn, .register-btn:hover, .register-btn *,
          .login-btn, .login-btn:hover, .login-btn * {
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }
          .get-started-btn svg, .get-started-btn svg *,
          .find-jobs-btn svg, .find-jobs-btn svg * {
            stroke: #000000 !important;
            color: #000000 !important;
          }
        `}</style>
      )}

      <SiteHeader />

      <div className="flex-1 overflow-y-auto flex flex-col pt-16">

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 w-full relative">
          <div
            className={`hero-bg-img absolute inset-0 rounded-2xl sm:rounded-[3rem] bg-no-repeat bg-center bg-[size:600px_auto] md:bg-[size:1100px_auto] md:bg-left ${isContrast ? 'bg-[var(--color-background)]/60' : 'bg-white/10'}`}
            style={{ backgroundImage: `url(${backgroundImg})` }}
            aria-hidden="true"
          ></div>

          <div className={`relative z-10 p-4 sm:p-12 rounded-2xl sm:rounded-[3rem] shadow-2xl border backdrop-blur-[1px] ${isContrast ? 'bg-[var(--color-surface)]/80 border-[var(--color-border)] text-[var(--color-text)]' : 'bg-[var(--color-surface)]/50 border-white/40 text-[#03045E]'}`}>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-12 items-start">
              <div>
                <span tabIndex="0" className={`inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full ${isContrast ? 'bg-[var(--color-accentSoft)] text-[var(--color-text)] border border-[var(--color-accent)]' : 'bg-[#2C7FFF]/15 text-[#2C7FFF] bg-white/10'} font-black text-[10px] sm:text-xs uppercase tracking-widest mb-3 sm:mb-4 backdrop-blur-sm shadow-sm`}>
                  Welcome to AbleWork
                </span>

                <h1 className={`text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4 sm:mb-6 ${isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]'} [text-shadow:0_0_8px_rgba(255,255,255,0.95),0_0_16px_rgba(255,255,255,0.85),0_0_24px_rgba(255,255,255,0.7),0_2px_4px_rgba(255,255,255,0.9)]`} style={(isContrast || isDarkMode) ? { textShadow: 'none' } : undefined}>
                  Building an Inclusive Workforce for Everyone
                </h1>

                <p className={`text-sm sm:text-lg font-semibold leading-relaxed mb-5 sm:mb-8 p-2.5 sm:p-3 rounded-xl ${isContrast ? 'text-[var(--color-text)] bg-[var(--color-surface)]/80 border border-[var(--color-border)]' : 'text-[#03045E] bg-[var(--color-surface)]/50'} [text-shadow:0_0_8px_rgba(255,255,255,0.95),0_0_14px_rgba(255,255,255,0.85),0_0_24px_rgba(255,255,255,0.7),0_2px_4px_rgba(255,255,255,0.9)]`} style={(isContrast || isDarkMode) ? { textShadow: 'none' } : undefined}>
                  AbleWork helps persons with disabilities find suitable employment opportunities based on their unique skills, qualifications, and preferred locations.
                </p>

                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <Link
                    to="/register-select"
                    aria-label="Get Started Today"
                    className={`get-started-btn px-5 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 group text-sm sm:text-base ${
                      isContrast 
                        ? 'bg-[#1a1a1a] text-white border-2 border-white hover:bg-[#2C7FFF] hover:border-[#2C7FFF]' 
                        : 'bg-[#03045E] text-[#f4f4f4] border-2 border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF] hover:brightness-125'
                    }`}
                  >
                    Get Started Today
                    <svg aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                  </Link>

                  <Link
                    to="/about"
                    aria-label="Learn More"
                    className={`learn-more-btn px-5 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all shadow-sm text-sm sm:text-base ${
                      isContrast
                        ? 'bg-[#1a1a1a] text-white border-2 border-white hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'
                        : `bg-[var(--color-surface)]/50 ${isDarkMode ? 'text-black' : 'text-[#03045E]'} border-2 border-[#f4f4f4] hover:bg-[#2c7fff] hover:text-[#f4f4f4] hover:brightness-125`
                    }`}
                  >
                    Learn More
                  </Link>
                </div>

                <div className={`grid grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 pt-6 sm:pt-10 border-t ${isContrast ? 'border-[var(--color-border)]' : 'border-[#03045E]/20'}`}>
                  <div tabIndex="0">
                    <h4 className={`text-xl sm:text-3xl font-black ${isContrast || isDarkMode ? 'text-[var(--color-text)]' : 'text-[var(--color-accent)]'} ${!isDarkMode ? 'max-md:[text-shadow:0_0_8px_rgba(255,255,255,0.95),0_0_16px_rgba(255,255,255,0.85),0_0_24px_rgba(255,255,255,0.7),0_2px_4px_rgba(255,255,255,0.9)]' : ''}`}>100%</h4>
                    <p className={`text-[10px] sm:text-xs font-black uppercase tracking-wider mt-1 ${isContrast || isDarkMode ? 'text-[var(--color-text)]' : 'text-[#03045E]'} ${!isDarkMode ? 'max-md:[text-shadow:0_0_8px_rgba(255,255,255,0.95),0_0_16px_rgba(255,255,255,0.85),0_0_24px_rgba(255,255,255,0.7),0_2px_4px_rgba(255,255,255,0.9)]' : ''}`}>Accessible</p>
                  </div>
                  <div tabIndex="0">
                    <h4 className={`text-xl sm:text-3xl font-black ${isContrast || isDarkMode ? 'text-[var(--color-text)]' : 'text-[var(--color-accent)]'} ${!isDarkMode ? 'max-md:[text-shadow:0_0_8px_rgba(255,255,255,0.95),0_0_16px_rgba(255,255,255,0.85),0_0_24px_rgba(255,255,255,0.7),0_2px_4px_rgba(255,255,255,0.9)]' : ''}`}>24/7</h4>
                    <p className={`text-[10px] sm:text-xs font-black uppercase tracking-wider mt-1 ${isContrast || isDarkMode ? 'text-[var(--color-text)]' : 'text-[#03045E]'} ${!isDarkMode ? 'max-md:[text-shadow:0_0_8px_rgba(255,255,255,0.95),0_0_16px_rgba(255,255,255,0.85),0_0_24px_rgba(255,255,255,0.7),0_2px_4px_rgba(255,255,255,0.9)]' : ''}`}>Support</p>
                  </div>
                  <div tabIndex="0">
                    <h4 className={`text-xl sm:text-3xl font-black ${isContrast || isDarkMode ? 'text-[var(--color-text)]' : 'text-[var(--color-accent)]'} ${!isDarkMode ? 'max-md:[text-shadow:0_0_8px_rgba(255,255,255,0.95),0_0_16px_rgba(255,255,255,0.85),0_0_24px_rgba(255,255,255,0.7),0_2px_4px_rgba(255,255,255,0.9)]' : ''}`}>Secure</h4>
                    <p className={`text-[10px] sm:text-xs font-black uppercase tracking-wider mt-1 ${isContrast || isDarkMode ? 'text-[var(--color-text)]' : 'text-[#03045E]'} ${!isDarkMode ? 'max-md:[text-shadow:0_0_8px_rgba(255,255,255,0.95),0_0_16px_rgba(255,255,255,0.85),0_0_24px_rgba(255,255,255,0.7),0_2px_4px_rgba(255,255,255,0.9)]' : ''}`}>Platform</p>
                  </div>
                </div>
              </div>

              <div className={`h-full flex flex-col justify-center rounded-xl sm:rounded-[2rem] p-4 sm:p-8 shadow-xl border ${isContrast ? 'bg-[var(--color-surface)]/70 border-[var(--color-border)] text-[var(--color-text)]' : 'bg-[var(--color-surface)]/70 border-[#03045E]/20 text-[#03045E]'}`}>
                <h2 className={`text-lg sm:text-2xl font-black mb-4 sm:mb-6 tracking-tight flex items-center gap-3 ${isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]'}`}>
                  <span aria-hidden="true" className="w-3 h-3 rounded-full bg-[var(--color-accent)]"></span>
                  Why Choose AbleWork?
                </h2>

                <div className="space-y-4 sm:space-y-6">
                  <Feature
                    title="Smart Job Matching"
                    text="Find employment opportunities customized specifically to match your professional skills."
                  />
                  <Feature
                    title="Inclusive Employment"
                    text="Directly connect persons with disabilities with certified inclusive and supportive employers."
                  />
                  <Feature
                    title="Streamlined Application"
                    text="Search, track, and apply for available jobs easily through one centralized platform."
                  />
                  <Feature
                    title="Direct Employer Network"
                    text="Empower forward-thinking employers to discover your verified qualified profile."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
          <div className={`p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border-2 shadow-xl backdrop-blur-sm ${isContrast ? 'bg-[var(--color-surface)]/50 text-[var(--color-text)] border-[var(--color-border)]' : 'bg-[var(--color-surface)]/50 text-[#03045E] border-[#03045E]/20'}`}>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div>
                <span tabIndex="0" className="inline-block px-3 py-1 rounded-full bg-[var(--color-accentSoft)] text-[var(--color-accent)] font-black text-[10px] sm:text-xs uppercase tracking-widest mb-2 sm:mb-3 border border-[var(--color-accent)]">
                  Live Opportunities Map
                </span>
                <h2 className="text-xl sm:text-4xl font-black tracking-tight">
                  Explore Inclusive Jobs Around You
                </h2>
                <p className={`text-xs sm:text-base font-bold mt-2 max-w-2xl ${isContrast ? 'text-[var(--color-textMuted)]' : 'text-[#03045E]/80'}`}>
                  See verified hiring workplaces near your location before creating an account. Click any marker to view workplace details!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDetectUserLocation(true)}
                  disabled={isDetecting}
                  aria-label={isDetecting ? 'Locating' : 'Find Jobs Near Me'}
                  className="find-jobs-btn px-4 py-2.5 sm:px-6 sm:py-3.5 bg-[var(--color-accent)] text-[var(--color-background)] font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-md hover:brightness-125 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {isDetecting ? 'Locating...' : 'Find Jobs Near Me'}
                </button>
              </div>
            </div>

            {locationError && (
              <div role="alert" aria-live="assertive" className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] sm:text-xs font-bold rounded-xl">
                {locationError}
              </div>
            )}

            <div className="h-[320px] sm:h-[480px] w-full rounded-2xl sm:rounded-[2rem] overflow-hidden border-2 border-[var(--color-border)] shadow-inner relative z-10">
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[1000] flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setSatelliteView(prev => !prev)}
                  aria-label={satelliteView ? 'Switch to street view' : 'Switch to satellite view'}
                  title={satelliteView ? 'Street view' : 'Satellite view'}
                  className="relative flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(3,4,94,0.15)] border border-[#03045E]/15 cursor-pointer"
                >
                  <span aria-hidden="true" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#2C7FFF]/10 border border-[#2C7FFF]/30 flex items-center justify-center text-[#2C7FFF] shrink-0">
                    {satelliteView ? (
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </span>
                  <span aria-hidden="true" className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#03045E] whitespace-nowrap">
                    {satelliteView ? 'Street' : 'Satellite'}
                  </span>
                </button>
              </div>

              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-[1000]">
                <div className="w-[200px] sm:w-[228px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-[#03045E]/20 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setLegendOpen(open => !open)}
                    aria-label="Map Legend"
                    aria-expanded={legendOpen}
                    aria-controls="home-map-legend-panel"
                    className="w-full flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                  >
                    <span aria-hidden="true" className="w-6 h-6 rounded-lg bg-[#f4f4f4] border border-[#03045E]/20 flex items-center justify-center text-[#2C7FFF] shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </span>
                    <span aria-hidden="true" className="flex-1 text-left text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#03045E]">
                      Map Legend
                    </span>
                    <svg
                      aria-hidden="true"
                      className={`w-3.5 h-3.5 text-[#03045E] transition-transform duration-300 ${legendOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className={`grid transition-all duration-300 ease-out ${legendOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div id="home-map-legend-panel" className="px-3 pb-3 flex flex-col gap-2">
                        <div aria-hidden="true" className="h-px w-full bg-[#03045E]/10 mb-0.5"></div>

                        <div className="flex items-center gap-2.5">
                          <span aria-hidden="true" className="w-3 h-3 rounded-full bg-[#2C7FFF] border-2 border-white shadow-sm shrink-0"></span>
                          <span className="flex-1 text-[11px] font-bold text-[#03045E] leading-tight">Active Job Pin</span>
                          <span aria-hidden="true" className="text-[10px] font-black text-[#2C7FFF] bg-[#2C7FFF]/10 px-1.5 py-0.5 rounded-full min-w-[22px] text-center">
                            {mappedJobs.length}
                          </span>
                        </div>

                        {userLocation && (
                          <div className="flex items-center gap-2.5">
                            <span aria-hidden="true" className="w-3 h-3 rounded-full bg-[#10B981] border-2 border-white shadow-sm shrink-0"></span>
                            <span className="flex-1 text-[11px] font-bold text-[#03045E] leading-tight">Your Location</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2.5">
                          <span aria-hidden="true" className="w-3 h-3 rounded-full border-2 border-dashed border-[#2C7FFF]/70 shrink-0"></span>
                          <span className="flex-1 text-[11px] font-bold text-[#03045E] leading-tight">10 km Radius</span>
                        </div>

                        {mappedJobs.length === 0 && (
                          <p className="text-[10px] font-semibold text-[#03045E]/60 leading-snug pt-0.5">
                            No active jobs on the map yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

             <MapContainer 
  aria-hidden="true"
  tabIndex="-1"
  center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter} 
  zoom={userLocation ? 12 : 10} 
  scrollWheelZoom={false} 
  style={{ height: '100%', width: '100%' }}
>
                {satelliteView ? (
                  <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                ) : (
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                )}

                {userLocation && (
                  <>
                    <MapRecenter lat={userLocation.lat} lng={userLocation.lng} />
                    <Marker position={[userLocation.lat, userLocation.lng]}>
                      <Popup>
                        <div className="p-0 min-w-[220px] rounded-2xl overflow-hidden bg-white shadow-xl" tabIndex="-1">
                          <div aria-hidden="true" className="h-1.5 w-full bg-[#03045E]"></div>
                          <div className="px-4 pt-3.5 pb-3">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm bg-[#03045E]">
                                <svg aria-hidden="true" className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" /></svg>
                                Home Base
                              </span>
                              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#03045E] animate-pulse"></span>
                            </div>
                            <h4 className="font-black text-[15px] text-[#03045E] leading-tight m-0 mb-1">Your Home Location</h4>
                            <p className="text-xs font-bold text-[#03045E]/70 m-0 leading-relaxed">
                              Jobs within 10 km of this address are shown on the map.
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle 
                      center={[userLocation.lat, userLocation.lng]} 
                      radius={10000} 
                      pathOptions={{ color: '#2C7FFF', fillColor: '#2C7FFF', fillOpacity: 0.15, weight: 2 }} 
                    />
                  </>
                )}

                {mappedJobs.map((job) => (
                  <Marker 
                    key={job.id} 
                    position={[Number(job.latitude), Number(job.longitude)]}
                  >
                    <Popup>
                      <div className="p-0 min-w-[240px] rounded-2xl overflow-hidden bg-white shadow-xl" tabIndex="-1">
                        <div aria-hidden="true" className="h-1.5 w-full bg-[#2C7FFF]"></div>

                        <div className="px-4 pt-3.5 pb-3">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm bg-[#2C7FFF]">
                              <svg aria-hidden="true" className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" /></svg>
                              Opportunity
                            </span>
                            <span aria-hidden="true" className="w-2 h-2 rounded-full animate-pulse bg-[#2C7FFF]"></span>
                          </div>

                          <h4 className="font-black text-[15px] text-[#03045E] leading-tight m-0 mb-1">{job.job_title}</h4>

                          <div className="flex items-center gap-1.5 mb-2">
                            <svg aria-hidden="true" className="w-3.5 h-3.5 text-[#2C7FFF] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 12h.01M9 15h.01M9 18h.01M15 9h.01M15 12h.01M15 15h.01M15 18h.01" />
                            </svg>
                            <p className="text-xs font-bold text-[#03045E]/70 m-0 truncate">{job.company_name}</p>
                          </div>

                          <div className="flex items-start gap-1.5 mb-2">
                            <svg aria-hidden="true" className="w-3.5 h-3.5 text-[#2C7FFF] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-xs font-semibold text-[#03045E]/70 m-0 leading-snug">
                              {job.workplace_address || job.company_address || job.address || 'Address provided upon application'}
                            </p>
                          </div>

                          {job.salary_range && (
                            <div className="flex items-center gap-1.5 mb-3">
                              <svg aria-hidden="true" className="w-3.5 h-3.5 text-[#2C7FFF] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-xs font-black text-[#03045E] m-0">{job.salary_range}</p>
                            </div>
                          )}

                          <Link
                            to="/register-select"
                            aria-label={`View job details for ${job.job_title} at ${job.company_name}`}
                            className="w-full py-2.5 text-white text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-md bg-[#2C7FFF]"
                          >
                            View Job Details
                            <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

          </div>
        </section>

        <section className={`py-10 sm:py-16 px-4 sm:px-6 my-6 sm:my-8 ${isContrast ? 'bg-[var(--color-background)] border-y border-[var(--color-border)]' : 'bg-[#f4f4f4] border-y border-[#d1d5db]'}`}>
          <div className="max-w-5xl mx-auto text-center space-y-4 sm:space-y-6">
            <h2 className={`text-xl sm:text-4xl font-black tracking-tight ${isContrast ? '!text-white' : 'text-[#03045E]'}`}>Ready to Take the Next Step in Your Career?</h2>
            <p className={`text-xs sm:text-lg font-semibold max-w-2xl mx-auto ${isContrast ? '!text-white' : 'text-[#03045E]'}`}>
              Join our growing community of empowered candidates and inclusive companies building a barrier-free workplace.
            </p>
            <div className="pt-2">
              <Link
                to="/register-select"
                aria-label="Create Your Free Account"
                className={`inline-block px-6 py-3 sm:px-9 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-xl hover:bg-[var(--color-accent)] hover:text-[var(--color-background)] hover:scale-105 hover:brightness-125 transition-all border-2 text-sm sm:text-base ${
                  isContrast 
                    ? 'bg-[var(--color-surface)]/50 !text-black border-[var(--color-accent)]' 
                    : 'bg-[#03045E] text-[#f4f4f4] border-[#2C7FFF]'
                }`}
              >
                Create Your Free Account
              </Link>
            </div>
          </div>
        </section>

        <SimpleFooter />

      </div>

    </div>
  );
}

export function About() {
  return (
    <PageLayout title="About Us">

      <div className="grid md:grid-cols-2 gap-4 sm:gap-8">

        <InfoBox>
          <h2 className="text-lg sm:text-2xl font-black mb-3 sm:mb-5">
            About AbleWork
          </h2>
          <p className="text-xs sm:text-base font-semibold leading-6 sm:leading-7">
            AbleWork is a web-based employment assistance system
            designed to help persons with disabilities find
            appropriate employment opportunities.
          </p>
          <p className="text-xs sm:text-base font-semibold leading-6 sm:leading-7 mt-3 sm:mt-5">
            The system connects applicants and employers while
            helping employers find qualified candidates based on
            skills, qualifications, and location.
          </p>
        </InfoBox>

        <InfoBox>
          <h2 className="text-lg sm:text-2xl font-black mb-3 sm:mb-5">
            What We Do
          </h2>
          <ul className="space-y-3 sm:space-y-4 text-xs sm:text-base font-semibold">
            <li>✓ Connect applicants with employers</li>
            <li>✓ Provide suitable job recommendations</li>
            <li>✓ Help applicants search and apply for jobs</li>
            <li>✓ Help employers find qualified applicants</li>
            <li>✓ Promote an inclusive workforce</li>
          </ul>
        </InfoBox>

      </div>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-8">
        <InfoCard
          title="Our Mission"
          text="To make employment opportunities more accessible and inclusive."
        />
        <InfoCard
          title="Our Vision"
          text="A workforce where everyone has an equal opportunity to work."
        />
        <InfoCard
          title="Our Goal"
          text="To connect qualified applicants with suitable employers."
        />
      </div>

    </PageLayout>
  );
}

export function Policy() {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  return (
    <PageLayout title="Privacy Policy">
      <div className="w-full">
        <div className={`p-4 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl border-2 backdrop-blur-sm ${isContrast ? 'bg-[var(--color-surface)]/50 text-[var(--color-text)] border-[var(--color-border)]' : 'bg-[var(--color-surface)]/50 text-[#03045E] border-white/40'}`}>

          <div className={`pb-6 sm:pb-8 mb-6 sm:mb-8 border-b ${isContrast ? 'border-[var(--color-border)]' : 'border-[#03045E]/10'}`}>
            <span className="text-[var(--color-accent)] font-black text-[10px] sm:text-xs uppercase tracking-widest block mb-2">Transparency and Commitment</span>
            <h2 className={`text-lg sm:text-2xl font-black mb-2 sm:mb-3 ${isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]'}`}>Your Privacy Matters to Us</h2>
            <p className={`text-xs sm:text-base font-semibold leading-relaxed ${isContrast ? 'text-[var(--color-textMuted)]' : 'text-[#03045E]/90'}`}>
              ABLEWORK ("the Platform", "we", "us") is dedicated to safeguarding the privacy and data security of all users, specifically Persons with Disabilities (PWDs) and participating employers. This Privacy Policy outlines our practices regarding the collection, use, storage, and protection of personal data in compliance with the Republic Act No. 10173, otherwise known as the Data Privacy Act of 2012 (DPA) of the Philippines, and its Implementing Rules and Regulations (IRR).
            </p>
            <p className={`text-xs sm:text-base font-semibold leading-relaxed ${isContrast ? 'text-[var(--color-textMuted)]' : 'text-[#03045E]/90'} mt-3`}>
              By registering an account or accessing the platform, you acknowledge and consent to the data processing practices described herein.
            </p>
          </div>

          <div className={`space-y-6 sm:space-y-8 text-sm sm:text-base leading-relaxed ${isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]'}`}>
            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">1. Information We Collect</h3>
              <p className="font-medium mb-3">
                We collect only the personal information reasonably necessary to facilitate inclusive employment matching, account verification, and secure platform operations:
              </p>
              <div className="space-y-3 pl-2">
                <div>
                  <p className="font-bold mb-1">For Applicants (Job Seekers):</p>
                  <ul className="list-disc pl-6 space-y-1 font-medium">
                    <li><strong>Personal Identifiers:</strong> Full name, contact number, residential address, and email address.</li>
                    <li><strong>Sensitive Personal Information (SPI):</strong> Birthdate, specific disability type/classification, required workplace accommodations, and uploaded government-issued PWD identification cards.</li>
                    <li><strong>Professional Credentials:</strong> Educational background, skills, work preferences, and uploaded resumes/curriculum vitae.</li>
                    <li><strong>Location Data:</strong> Approximate geographical coordinates (latitude and longitude) and user-defined travel radius preferences (in kilometers).</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold mb-1">For Employers:</p>
                  <ul className="list-disc pl-6 space-y-1 font-medium">
                    <li><strong>Company and Representative Details:</strong> Company name, company description, industry classification, representative full name, business email, and contact number.</li>
                    <li><strong>Verification Records:</strong> Uploaded business registration documents (e.g., DTI, SEC registration, or Mayor's or Business Permit).</li>
                    <li><strong>Job Listing Data:</strong> Job vacancies, job descriptions, required skills, guaranteed workplace accommodations, and accepted disability types.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold mb-1">System and Technical Metadata (All Users):</p>
                  <p className="font-medium">Network Internet Protocol (IP) addresses, verification attempt logs, system security timestamps, accessibility settings (e.g., high-contrast theme, font scale), and in-app notification logs.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">2. Legal Basis and Purpose of Processing</h3>
              <p className="font-medium mb-2">
                In accordance with Sections 12 and 13 of the Data Privacy Act of 2012, personal and sensitive personal information is collected and processed based on explicit user consent and legitimate operational interests for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-1 font-medium">
                <li>Authenticating user credentials using cryptographic hashing (bcrypt).</li>
                <li>Enforcing administrator document verification to maintain a verified, safe talent marketplace.</li>
                <li>Powering the automated, rule-based Smart Matching Engine (evaluating skill alignments, accommodation guarantees, and Haversine distance calculations).</li>
                <li>Enforcing system security protocols, such as cooldown intervals and network rate-limiting against fraudulent submissions.</li>
                <li>Delivering transactional email notifications and One-Time Password (OTP) verifications via automated SMTP services.</li>
                <li>Facilitating AI chatbot interactions through the ABBY assistant.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">3. Processing of Sensitive Personal Information (Disability and PWD Records)</h3>
              <p className="font-medium">
                Disability classifications and PWD ID documents are processed strictly to verify eligibility and ensure that matched workplaces meet necessary physical and sensory accommodations. PWD IDs and business verification files are stored in restricted server storage directories and are accessible exclusively to authorized system administrators for audit and approval purposes. Disability-related details are never sold, rented, or made visible to third-party advertising networks.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">4. Artificial Intelligence and Third-Party Service Providers</h3>
              <p className="font-medium mb-2">
                To deliver modern web capabilities, ABLEWORK interfaces with selected third-party service providers under data protection principles:
              </p>
              <ul className="list-disc pl-6 space-y-1 font-medium">
                <li><strong>Google Gemini API:</strong> Powers the ABBY conversational assistant. Real-time account metadata (e.g., application count, current verification standing) is supplied contextually during active chat queries to provide dynamic help. No passwords, credentials, or official government documents are transmitted to the AI engine.</li>
                <li><strong>Email Dispatch (Nodemailer and Google SMTP):</strong> Delivers automated system alerts, application updates, and security OTPs to user-registered email addresses.</li>
                <li><strong>Mapping and Geolocation Services:</strong> Processes device-derived or user-selected coordinates to calculate distance scores relative to employer workplaces.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">5. Data Access, Disclosure, and Visibility</h3>
              <ul className="list-disc pl-6 space-y-1 font-medium">
                <li><strong>Between Users:</strong> When an applicant applies for an active job vacancy, their profile details (name, contact number, resume, skills, and accommodation requests) become accessible to that specific employer.</li>
                <li><strong>Administrative Access:</strong> System administrators have role-restricted access to user directories, verification documents, and audit logs to approve accounts and manage operational integrity.</li>
                <li><strong>Legal Compliance:</strong> We do not disclose personal information to external parties unless legally mandated by a valid subpoena, court order, or regulatory authority under Philippine jurisdiction.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">6. Data Storage, Security, and Protection Measures</h3>
              <p className="font-medium mb-2">
                ABLEWORK implements organizational, physical, and technical measures to protect stored data:
              </p>
              <ul className="list-disc pl-6 space-y-1 font-medium">
                <li><strong>Cryptographic Protection:</strong> Passwords are mathematically hashed with unique cryptographic salts using bcrypt before database storage.</li>
                <li><strong>Header and Transport Security:</strong> HTTP security headers (Helmet) and Cross-Origin Resource Sharing (CORS) rules protect API communication channels.</li>
                <li><strong>Access Segregation:</strong> Verification documents and candidate resumes are isolated within designated upload directories linked only to validated database records.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">7. Data Retention and Account Deletion</h3>
              <ul className="list-disc pl-6 space-y-1 font-medium">
                <li>Personal data, application histories, and profile records are retained for the duration of the user's active participation on the platform.</li>
                <li><strong>Account Deactivation:</strong> Users may deactivate their profile, rendering their account and job listings inactive (Disabled).</li>
                <li><strong>Permanent Erasure:</strong> Users retain the right to request permanent account deletion via system settings. Account deletion permanently purges user profile records, application submissions, and authentication data from the production database upon password re-verification.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">8. User Rights under Republic Act No. 10173</h3>
              <p className="font-medium mb-2">
                As a data subject under the Philippine Data Privacy Act of 2012, you are entitled to:
              </p>
              <ul className="list-disc pl-6 space-y-1 font-medium">
                <li><strong>Right to be Informed:</strong> The right to know how your personal and sensitive data is gathered, stored, and utilized.</li>
                <li><strong>Right to Access:</strong> The right to review your registered data, job history, and application records.</li>
                <li><strong>Right to Rectification:</strong> The right to update or correct inaccurate profile details and submit verification documents.</li>
                <li><strong>Right to Erasure or Blocking:</strong> The right to deactivate or permanently delete your account records.</li>
                <li><strong>Right to Damages:</strong> The right to seek indemnification for damages sustained due to inaccurate, incomplete, outdated, false, or unlawfully obtained personal data.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">9. Changes to This Privacy Policy</h3>
              <p className="font-medium">
                ABLEWORK reserves the right to revise this Privacy Policy to accommodate system improvements, algorithmic enhancements, or updates in legal statutes. Updates will be reflected directly on the platform with an updated effective date.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">10. Contact Information and Inquiries</h3>
              <p className="font-medium mb-2">
                For questions, data access requests, or privacy-related concerns regarding ABLEWORK, contact the project data custody team:
              </p>
              <ul className="list-disc pl-6 space-y-1 font-medium">
                <li><strong>Platform:</strong> ABLEWORK Capstone Project</li>
                <li><strong>Data Custody Team and Proponents:</strong> Paquio, Loueala Jean H., Pagado, Jesie Marie D., Astodillo, Felicite S., Gonzales, John Greg A., Gamboa, John Bryan T.</li>
                <li><strong>Institution:</strong> STIWNU</li>
                <li><strong>Official Support Email:</strong> ableworksys5i@gmail.com</li>
              </ul>
            </section>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}

export function Terms() {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  return (
    <PageLayout title="Terms and Conditions">
      <div className="w-full">
        <div className={`p-4 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl border-2 backdrop-blur-sm ${isContrast ? 'bg-[var(--color-surface)]/50 text-[var(--color-text)] border-[var(--color-border)]' : 'bg-[var(--color-surface)]/50 text-[#03045E] border-white/40'}`}>

          <div className={`pb-6 sm:pb-8 mb-6 sm:mb-8 border-b ${isContrast ? 'border-[var(--color-border)]' : 'border-[#03045E]/10'}`}>
            <span className="text-[var(--color-accent)] font-black text-[10px] sm:text-xs uppercase tracking-widest block mb-2">User Guidelines</span>
            <h2 className={`text-lg sm:text-2xl font-black mb-2 sm:mb-3 ${isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]'}`}>Platform Rules and Conditions</h2>
            <p className={`text-xs sm:text-base font-semibold leading-relaxed ${isContrast ? 'text-[var(--color-textMuted)]' : 'text-[#03045E]/90'}`}>
              Welcome to ABLEWORK, a web-based employment assistance system designed to connect persons with disabilities (PWDs) with suitable employment opportunities and help employers manage job vacancies and applications. By accessing or using ABLEWORK, you agree to comply with these Terms and Conditions. If you do not agree with any part of these terms, please do not use the system.
            </p>
          </div>

          <div className={`space-y-6 sm:space-y-8 text-sm sm:text-base leading-relaxed ${isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]'}`}>
            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">1. Acceptance of Terms</h3>
              <p className="font-medium">
                By creating an account or using ABLEWORK, you confirm that you have read, understood, and agreed to these Terms and Conditions. These terms apply to all applicants, employers, and authorized administrators using the platform.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">2. Eligibility and User Accounts</h3>
              <p className="font-medium">
                Applicants must provide accurate and truthful information during registration. Applicants should provide information relevant to their skills, qualifications, work preferences, and workplace accommodation needs. Employers must provide accurate company information and valid business or verification documents when required. Users are responsible for keeping their login credentials confidential. Each user should maintain only one account unless otherwise authorized by the system administrator. ABLEWORK reserves the right to suspend or disable accounts that contain false information, violate these terms, or pose a security risk.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">3. Account Verification</h3>
              <p className="font-medium">
                ABLEWORK requires applicants and employers to submit specific documents for account verification. Applicants must submit a valid PWD ID, and Employers must submit valid business registration documents (e.g., DTI, SEC, or Business Permit). Submitted documents must be authentic and belong to the account holder or registered organization. Administrators may review submitted documents before approving an account. An account may remain restricted or pending until verification is completed. In the event a verification document is rejected by an administrator, the account will be subject to a mandatory 7-day security cooldown before a new document can be submitted. The system also actively monitors and limits repeated failed verification attempts to prevent abuse. Verification does not guarantee employment, hiring, or acceptance of any application.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">4. Use of the System</h3>
              <p className="font-medium mb-2">
                Users agree to use ABLEWORK only for lawful employment-related purposes. Users must not:
              </p>
              <ul className="list-disc pl-6 space-y-1 font-medium">
                <li>Submit false, misleading, or fraudulent information.</li>
                <li>Post fake, discriminatory, or misleading job vacancies.</li>
                <li>Use the system to harass, threaten, or discriminate against other users.</li>
                <li>Access another person's account without permission.</li>
                <li>Attempt to damage, disrupt, or gain unauthorized access to the system.</li>
                <li>Upload harmful files, malicious code, or inappropriate content.</li>
                <li>Collect or misuse another user's personal information.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">5. Job Listings and Applications</h3>
              <p className="font-medium">
                Employers are responsible for ensuring that their job postings are accurate, complete, and up to date. Applicants are responsible for reviewing job requirements before submitting an application. ABLEWORK provides employment assistance and job-matching services but does not guarantee that an applicant will be hired. Employers are responsible for their own recruitment process, interviews, and final hiring decisions. ABLEWORK does not guarantee the availability, legitimacy, or continued existence of every job opportunity unless it has been specifically verified by the system or its administrators. Applicants should independently verify important employment details before accepting a job offer.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">6. Job Matching and Recommendations</h3>
              <p className="font-medium">
                ABLEWORK provides job recommendations based on information such as user profiles, skills, qualifications, preferences, workplace requirements, and location. Recommendations are intended to assist users in finding potentially suitable opportunities but are not guarantees of employment or suitability. The matching algorithm strictly enforces specific requirements. If an employer cannot provide an applicant's required workplace accommodations, or if an applicant falls outside the employer's designated travel radius, the system will intentionally hide the job posting from that applicant to ensure safe and viable employment. Users should review the complete job description and determine whether the opportunity meets their needs. Location-based recommendations may depend on the accuracy of the location information provided or permitted by the user.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">7. Accessibility Features</h3>
              <p className="font-medium">
                ABLEWORK may provide accessibility features such as display themes, font-size adjustments, and color-blindness support. These features are intended to improve usability but may not meet every user's individual accessibility needs. Users are encouraged to report accessibility problems so the system can be improved.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">8. Chatbot and Automated Assistance</h3>
              <p className="font-medium mb-2">
                ABLEWORK includes ABBY, a chatbot that provides guidance and assistance during the job-search and application process.
              </p>
              <ul className="list-disc pl-6 space-y-1 font-medium">
                <li>ABBY is powered by third-party Artificial Intelligence (Google Gemini). While the chatbot is configured to assist with platform navigation and job inquiries, AI-generated responses can occasionally be inaccurate. Users should not rely on ABBY for binding legal or employment agreements.</li>
                <li>Chatbot responses are intended for general assistance and may not always be accurate or complete. Users should verify important employment, account, and application information through the appropriate source.</li>
                <li>The chatbot does not make final hiring decisions.</li>
                <li>Users should not share passwords, payment information, or other unnecessary sensitive information through the chatbot.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">9. Location Services</h3>
              <p className="font-medium mb-2">
                If enabled, ABLEWORK uses location-related information to provide nearby job recommendations and location-based services.
              </p>
              <ul className="list-disc pl-6 space-y-1 font-medium">
                <li>Users may be asked to allow location access to utilize the Travel Radius feature, which filters job recommendations based on maximum geographical distance. This data is strictly used for the matching algorithm.</li>
                <li>Location-based features may not function accurately if location access is disabled or unavailable.</li>
                <li>Users should only enable location services when they are comfortable sharing the required location information.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">10. Intellectual Property</h3>
              <p className="font-medium">
                The ABLEWORK name, system design, interface, content, and software components are owned by the project proponents or their respective rights holders, unless otherwise stated. Users may not copy, reproduce, modify, distribute, or commercially use the system or its materials without proper authorization.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">11. System Availability and Limitations</h3>
              <p className="font-medium">
                ABLEWORK is provided as an employment assistance platform. The system may occasionally experience interruptions due to maintenance, technical issues, internet connectivity, or third-party services. The proponents do not guarantee that the system will always be available, error-free, or uninterrupted.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">12. Account Suspension or Termination</h3>
              <p className="font-medium mb-2">
                ABLEWORK may suspend, restrict, or terminate an account if the user:
              </p>
              <ul className="list-disc pl-6 space-y-1 font-medium">
                <li>Violates these Terms and Conditions.</li>
                <li>Provides false or fraudulent information.</li>
                <li>Misuses personal data or system features.</li>
                <li>Attempts unauthorized access.</li>
                <li>Engages in harmful, abusive, or unlawful activities.</li>
              </ul>
              <p className="font-medium mt-2">
                Users may contact the system administrator regarding account concerns or requests for account review.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">13. Changes to These Terms</h3>
              <p className="font-medium">
                ABLEWORK may update these Terms and Conditions when necessary to improve the system, address security concerns, or comply with applicable regulations and legal requirements. Continued use of the platform after such updates constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-xl font-black tracking-tight mb-2">14. Contact Information</h3>
              <p className="font-medium mb-2">
                For questions, concerns, or reports regarding these Terms and Conditions, please contact:
              </p>
              <ul className="list-disc pl-6 space-y-1 font-medium">
                <li><strong>System Name:</strong> ABLEWORK</li>
                <li><strong>Project Team:</strong> 5i</li>
                <li><strong>Email:</strong> ableworksys5i@gmail.com</li>
                <li><strong>Address:</strong> Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</li>
              </ul>
            </section>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}

export function Contact() {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  return (
    <PageLayout title="Contact Us">
      <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
        
        <InfoBox>
          <h2 className="text-lg sm:text-2xl font-black mb-4 sm:mb-6">Get in Touch</h2>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-xs sm:text-base font-black">Email</h3>
              <p className="text-xs sm:text-base font-semibold">ableworksys5@gmail.com</p>
            </div>
            <div>
              <h3 className="text-xs sm:text-base font-black">Phone</h3>
              <p className="text-xs sm:text-base font-semibold">+63 900 000 0000</p>
            </div>
            <div>
              <h3 className="text-xs sm:text-base font-black">Address</h3>
              <p className="text-xs sm:text-base font-semibold">Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</p>
            </div>
          </div>
        </InfoBox>

        <InfoBox>
          <h2 className="text-lg sm:text-2xl font-black mb-4 sm:mb-6">Send Us a Message</h2>
          <form className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="contact-name" className="sr-only">Your Name</label>
              <input
                id="contact-name"
                type="text"
                placeholder="Your Name"
                aria-label="Your Name"
                className={`w-full p-2.5 sm:p-3 bg-transparent border-2 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-[var(--color-accent)] ${
                  isContrast ? 'border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-textSubtle)]' : 'border-[#03045E]/30 text-[#03045E] placeholder-[#03045E]/70'
                }`}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="sr-only">Your Email</label>
              <input
                id="contact-email"
                type="email"
                placeholder="Your Email"
                aria-label="Your Email"
                className={`w-full p-2.5 sm:p-3 bg-transparent border-2 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-[var(--color-accent)] ${
                  isContrast ? 'border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-textSubtle)]' : 'border-[#03045E]/30 text-[#03045E] placeholder-[#03045E]/70'
                }`}
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="sr-only">Your Message</label>
              <textarea
                id="contact-message"
                rows="5"
                placeholder="Your Message"
                aria-label="Your Message"
                className={`w-full p-2.5 sm:p-3 bg-transparent border-2 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-[var(--color-accent)] ${
                  isContrast ? 'border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-textSubtle)]' : 'border-[#03045E]/30 text-[#03045E] placeholder-[#03045E]/70'
                }`}
              />
            </div>
            <button
              type="button"
              aria-label="Send Message"
              className={`w-full py-2.5 sm:py-3 rounded-full font-bold transition border-2 hover:brightness-125 text-xs sm:text-sm ${
                isContrast 
                  ? 'bg-[var(--color-surface)]/50 text-[var(--color-text)] border-[var(--color-surface)] hover:text-[var(--color-background)] hover:border-[var(--color-accent)]' 
                  : 'bg-[#03045E] text-[#f4f4f4] border-[#03045E] hover:text-[#f4f4f4] hover:border-[#2C7FFF]'
              }`}
            >
              Send Message
            </button>
          </form>
        </InfoBox>

      </div>
    </PageLayout>
  );
}

function InfoBox({ children, className = "p-5 sm:p-8" }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  return (
    <div className={`rounded-2xl sm:rounded-3xl shadow-xl border-2 backdrop-blur-sm ${isContrast ? 'bg-[var(--color-surface)]/50 text-[var(--color-text)] border-[var(--color-border)]' : 'bg-[var(--color-surface)]/50 text-[#03045E] border-white/40'} ${className}`}>
      {children}
    </div>
  );
}

function PageLayout({ title, children }) {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && mode.toLowerCase().includes('dark');
  const isPaletteContrast = paletteKey === 'highContrast';
  const isDarkComfort = paletteKey === 'darkComfort';

  return (
    <div className={`min-h-screen flex flex-col ${isContrast ? 'bg-[var(--color-background)] text-[var(--color-text)]' : 'bg-white text-[#03045E]'}`}>

      {(isPaletteContrast || isDarkComfort) && (
        <style>{`
          .login-btn, .login-btn:hover,
          .login-btn svg, .login-btn svg *,
          .register-btn, .register-btn:hover,
          .register-btn svg, .register-btn svg * {
            color: #FFFFFF !important;
            -webkit-text-fill-color: #FFFFFF !important;
            stroke: #FFFFFF !important;
          }
        `}</style>
      )}

      {isDarkMode && (
        <style>{`
          .login-btn, .login-btn:hover, .login-btn *,
          .register-btn, .register-btn:hover, .register-btn * {
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }
        `}</style>
      )}

      <SiteHeader />

      <div className="flex-1 overflow-y-auto flex flex-col pt-16">

        <main role="main" aria-label={`${title} Screen`} className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">

          <h1 className={`text-2xl sm:text-4xl md:text-5xl font-black text-center mb-8 sm:mb-12 ${isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]'}`}>
            {title}
          </h1>

          {children}

        </main>

        <SimpleFooter />

      </div>

    </div>
  );
}

function SimpleFooter() {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isAccessibilityMode = paletteKey === 'highContrast' || paletteKey === 'darkComfort';

  return (
    <footer role="contentinfo" className={`py-6 sm:py-12 px-4 sm:px-6 mt-auto border-t-2 shadow-inner ${isContrast ? 'bg-[var(--color-background)] border-[var(--color-border)]' : 'bg-[#03045E] border-[#03045E]/20'}`}>

      <div className={`max-w-[1700px] mx-auto grid grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8 pb-6 sm:pb-10 border-b ${isContrast ? 'border-[var(--color-border)]' : 'border-[#03045E]/10'}`}>
        
        <div className="col-span-3 md:col-span-1 space-y-2 sm:space-y-3">
          <img
            src={darkLogo}
            alt="AbleWork logo"
            role="img"
            aria-label="AbleWork logo"
            tabIndex="0"
            className="h-8 sm:h-10 w-auto object-contain"
          />
          <p className={`text-[10px] sm:text-sm font-semibold leading-relaxed text-white`}>
            Building an inclusive workforce and equal employment opportunities for everyone.
          </p>
          <div className={`pt-1 flex items-center space-x-3 text-[9px] sm:text-xs font-bold uppercase tracking-wider text-white`}>
            <span> Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div>
          <h4 className={`text-xs sm:text-base font-black mb-2 sm:mb-4 text-white`}>Quick Links</h4>
          <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-sm font-semibold">
            <li>
              <Link to="/" aria-label="Home Dashboard" className={`transition-colors text-white hover:text-white`}>
                Home Dashboard
              </Link>
            </li>
            <li>
              <Link to="/about" aria-label="About Our Mission" className={`transition-colors text-white hover:text-white`}>
                About Our Mission
              </Link>
            </li>
            <li>
              <Link to="/contact" aria-label="Contact Support" className={`transition-colors text-white hover:text-white`}>
                Contact Support
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className={`text-xs sm:text-base font-black mb-2 sm:mb-4 text-white`}>Legal and Support</h4>
          <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-sm font-semibold">
            <li>
              <Link to="/policy" aria-label="Privacy Policy" className={`transition-colors text-white hover:text-white`}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" aria-label="Terms and Conditions" className={`transition-colors text-white hover:text-white`}>
                Terms and Conditions
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className={`text-xs sm:text-base font-black mb-2 sm:mb-4 text-white`}>Get Started</h4>
          <p className={`text-[10px] sm:text-sm font-semibold mb-2 sm:mb-4 text-white`}>
            Are you an applicant or employer looking to join our network?
          </p>
          <Link
            to="/register-select"
            aria-label="Register Now"
            className="register-btn inline-block bg-[var(--color-accent)] text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl font-bold text-[9px] sm:text-xs uppercase tracking-wider shadow-md hover:brightness-125 hover:text-white transition-all border-2 border-[var(--color-accent)] hover:border-[var(--color-background)]"
          >
            Register Now
          </Link>
        </div>

      </div>

      <div className={`max-w-[1700px] mx-auto pt-3 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-[9px] sm:text-xs font-bold text-white`}>
        <p>© {new Date().getFullYear()} AgileWork Inc. All rights reserved.</p>
        <p className="font-bold">Empowering Abilities, Connecting Opportunities.</p>
      </div>

    </footer>
  );
}

function Feature({ title, text }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const id = `feature-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div role="group" aria-labelledby={id} className="flex gap-3 sm:gap-4 items-start p-2 sm:p-3 rounded-xl sm:rounded-2xl">
      <div aria-hidden="true" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[var(--color-accentSoft)] text-[var(--color-accent)] flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 mt-0.5">
        ✓
      </div>
      <div>
        <h3 id={id} className={`text-sm sm:text-base font-black mb-1 ${isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]'}`}>
          {title}
        </h3>
        <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${isContrast ? 'text-[var(--color-textMuted)]' : 'text-[#03045E]'}`}>
          {text}
        </p>
      </div>
    </div>
  );
}

function InfoCard({ title, text }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const id = `info-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div
      className={`rounded-2xl shadow-xl p-5 sm:p-7 border-2 backdrop-blur-sm ${isContrast ? 'bg-[var(--color-surface)]/50 text-[var(--color-text)] border-[var(--color-border)]' : 'bg-[var(--color-surface)]/50 text-[#03045E] border-white/40'}`}
      role="region"
      aria-labelledby={id}
    >
      <h3 id={id} className={`text-base sm:text-xl font-black mb-2 sm:mb-3 ${isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]'}`}>
        {title}
      </h3>
      <p className={`text-xs sm:text-base font-semibold leading-6 ${isContrast ? 'text-[var(--color-textMuted)]' : 'text-[#03045E]'}`}>
        {text}
      </p>
    </div>
  );
}

export default function ApplicantRegister() {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isAccessibilityMode = paletteKey === 'highContrast' || paletteKey === 'darkComfort';

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [radius, setRadius] = useState(10);
  
  const [independence, setIndependence] = useState('');

  const [pwdFile, setPwdFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [satelliteView, setSatelliteView] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);

  const toggleSelection = (item, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(item)) {
      setSelectedArray(selectedArray.filter(i => i !== item));
    } else {
      setSelectedArray([...selectedArray, item]);
    }
  };

  const availableDisabilities = [
    'Deafness', 'Blindness', 'Low Vision', 'Hard of Hearing', 'Color Blindness',
    'Paraplegia (Lower Body)', 'Hemiplegia (One Side)', 'Upper Limb Amputation',
    'Lower Limb Amputation', 'Cerebral Palsy', 'Limited Fine Motor Skills', 'Wheelchair User'
  ];
  const extendedDisabilities = [
    'Speech Impairment', 'Neurodivergent', 'Chronic Pain', 'Multiple Sclerosis', 
    'Muscular Dystrophy', 'Spina Bifida', 'Dwarfism', 'Autism Spectrum', 'ADHD'
  ];
  const [selectedDisabilities, setSelectedDisabilities] = useState([]);
  const [showOtherDisability, setShowOtherDisability] = useState(false);
  const [otherDisability, setOtherDisability] = useState('');

  const handleCustomDisabilityKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (otherDisability.trim() && !selectedDisabilities.includes(otherDisability.trim())) {
        setSelectedDisabilities([...selectedDisabilities, otherDisability.trim()]);
        setOtherDisability('');
      }
    }
  };

  const availableAccommodations = ['Screen Reader', 'Wheelchair Access', 'Sign Language Interpreter', 'Flexible Hours', 'Quiet Workspace'];
  const extendedAccommodations = [
    'Ergonomic Setup', 'Noise-Cancelling Headphones', 'Screen Magnifier', 'Braille Keyboard', 
    'Captioning Services', 'Remote Work', 'Frequent Breaks', 'Service Animal',
    'Adjustable Desk', 'Voice-to-Text Software', 'Large Print Documents', 'Step-Free Access'
  ];
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  const [showOtherAccommodation, setShowOtherAccommodation] = useState(false);
  const [otherAccommodation, setOtherAccommodation] = useState('');

  const defaultAvailable = [
    'Customer Service', 
    'Data Entry', 
    'Communication', 
    'Time Management', 
    'Microsoft Office', 
    'Teamwork'
  ];
  
  const defaultExtended = [
    'Virtual Assistance', 
    'Social Media Management', 
    'Problem Solving', 
    'Writing', 
    'Inventory Management', 
    'Graphic Design', 
    'Scheduling', 
    'Project Management', 
    'Retail Sales',
    'Copywriting'
  ];
  const [availableSkills, setAvailableSkills] = useState(defaultAvailable);
  const [extendedSkills, setExtendedSkills] = useState(defaultExtended);
  
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showOtherSkill, setShowOtherSkill] = useState(false);
  const [otherSkill, setOtherSkill] = useState('');

  useEffect(() => {
    const fetchPopularSkills = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/skills/popular');
        if (response.ok) {
          const popularSkills = await response.json();
          
          const combinedSkills = Array.from(new Set([...popularSkills, ...defaultAvailable, ...defaultExtended]));
          
          setAvailableSkills(combinedSkills.slice(0, 6));
          setExtendedSkills(combinedSkills.slice(6));
        }
      } catch (error) {
        console.error("Failed to fetch popular skills:", error);
      }
    };

    fetchPopularSkills();
  }, []);

  const handleCustomSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (otherSkill.trim() && !selectedSkills.includes(otherSkill.trim())) {
        setSelectedSkills([...selectedSkills, otherSkill.trim()]);
        setOtherSkill('');
      }
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please type your address.");
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setStatusMessage({ type: 'error', text: "Could not pinpoint exact address name. Please type it manually." });
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          setStatusMessage({ type: 'error', text: "Network error fetching address name." });
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setStatusMessage({ type: 'error', text: "Location access denied. Please type your address manually." });
        setIsDetecting(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    
    if (password !== confirmPassword) {
      setStatusMessage({ type: 'error', text: "Passwords do not match. Please check and try again." });
      return;
    }

    const birthYear = new Date(birthdate).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 18) {
      setStatusMessage({ type: 'error', text: "You must be 18 years or older to register on AbleWork." });
      return;
    }
    if (!pwdFile) {
      setStatusMessage({ type: 'error', text: "Please upload your PWD ID or Certification." });
      return;
    }
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('middleName', middleName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('birthdate', birthdate);
    formData.append('address', address);
    formData.append('latitude', lat);
    formData.append('longitude', lng);
    formData.append('radius', radius);
    formData.append('independence', independence);
    formData.append('disabilities', JSON.stringify(selectedDisabilities));
    formData.append('accommodations', JSON.stringify(selectedAccommodations));
    formData.append('skills', JSON.stringify(selectedSkills));
    formData.append('pwdDocument', pwdFile);

    try {
      const response = await fetch('http://localhost:5001/api/auth/register/applicant', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate('/login');
        }, 2000);
      } else {
        setStatusMessage({ type: 'error', text: data.message || "Registration failed. Please try again." });
      }
    } catch (error) {
      console.error("Server Error:", error);
      setStatusMessage({ type: 'error', text: "Cannot connect to the server. Is your Express backend running?" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[#03045E] overflow-x-hidden relative font-sans antialiased"
      role="main"
      aria-label="Applicant Registration Screen"
    >
      <header className="w-full bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[#03045E]/10 sticky top-0 left-0 z-50">
        <div className="w-full h-14 px-4 flex items-center justify-between max-w-md mx-auto box-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center flex-shrink-0 py-1">
              <img src={(isAccessibilityMode || (mode && typeof mode === 'string' && mode.toLowerCase().includes('dark'))) ? darkLogo : lightLogo} alt="AbleWork logo" role="img" aria-label="AbleWork logo" tabIndex="0" className="h-9 w-auto object-contain max-h-full" />
            </div>
          </div>
          <div className="flex items-center">
            <NavLink
              to="/login"
              aria-label="Log In"
              className={({ isActive }) => 
                `px-3 py-1.5 rounded-full bg-transparent text-[#03045E] text-xs font-bold border border-[#03045E]/30 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF] transition whitespace-nowrap ${
                  isActive 
                    ? 'bg-[#2C7FFF] text-white border-[#2C7FFF]' 
                    : ''
                }`
              }
            >
              Log In
            </NavLink>
          </div>
        </div>
      </header>

      <div 
        className="w-full flex-1 flex flex-col items-center justify-start px-4 py-6 max-w-md mx-auto relative z-30"
        role="region"
        aria-label="Applicant registration area"
      >
        <div
          className="absolute inset-0 w-full h-full bg-no-repeat bg-center bg-[size:auto] pointer-events-none opacity-40 fixed"
          style={{
            backgroundImage: `url(${backgroundImg})`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md pointer-events-none fixed" aria-hidden="true" />

        <div className="w-full flex flex-col bg-[var(--color-surface)] text-[#03045E] rounded-3xl shadow-xl border border-[#03045E]/10 overflow-hidden relative z-50 animate-fadeIn p-5 sm:p-6 mb-10">
          
          <div className="flex-shrink-0 pb-4 mb-4 border-b border-[#03045E]/10 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black tracking-tight text-[#03045E]">
                Job Seeker Registration
            </h1>
            <p className="text-xs font-semibold text-[#03045E] mt-0.5">
              Build your accessible career profile
            </p>
          </div>
          <Link
            to="/register-select"
            aria-label="Back to Role Selection"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#03045E]/5 text-[#03045E] hover:bg-[#03045E] hover:text-white transition text-sm font-bold"
          >
            ✕
          </Link>
        </div>

        <div className="w-full">
          {statusMessage.text && (
            <div
              role="alert"
              aria-live="assertive"
              className={`p-3 mb-4 rounded-xl font-bold text-xs text-center border ${
                statusMessage.type === 'success'
                ? 'bg-green-100 text-green-800 border-green-500'
                : 'bg-red-100 text-red-800 border-red-500'
            }`}
            >
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" autoComplete="off">
            
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label htmlFor="firstName" className="text-xs font-bold text-[#03045E]">First Name <span aria-hidden="true" className="text-[#2C7FFF]">*</span></label>
                <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter your First Name" aria-label="Enter your First Name" required className="w-full p-2.5 text-sm font-semibold border border-[#03045E]/20 rounded-xl bg-[var(--color-surface)] text-[#03045E] placeholder-[#03045E]/50 focus:outline-none focus:border-[#2C7FFF] transition shadow-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="middleName" className="text-xs font-bold text-[#03045E]">Middle Name (Optional)</label>
                <input id="middleName" type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Enter your Middle Name" aria-label="Enter your Middle Name" className="w-full p-2.5 text-sm font-semibold border border-[#03045E]/20 rounded-xl bg-[var(--color-surface)] text-[#03045E] placeholder-[#03045E]/50 focus:outline-none focus:border-[#2C7FFF] transition shadow-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="lastName" className="text-xs font-bold text-[#03045E]">Last Name <span aria-hidden="true" className="text-[#2C7FFF]">*</span></label>
                <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter your Last Name" aria-label="Enter your Last Name" required className="w-full p-2.5 text-sm font-semibold border border-[#03045E]/20 rounded-xl bg-[var(--color-surface)] text-[#03045E] placeholder-[#03045E]/50 focus:outline-none focus:border-[#2C7FFF] transition shadow-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="phone" className="text-xs font-bold text-[#03045E]">Phone Number <span aria-hidden="true" className="text-[#2C7FFF]">*</span></label>
                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your Phone Number" aria-label="Enter your Phone Number" required className="w-full p-2.5 text-sm font-semibold border border-[#03045E]/20 rounded-xl bg-[var(--color-surface)] text-[#03045E] placeholder-[#03045E]/50 focus:outline-none focus:border-[#2C7FFF] transition shadow-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-xs font-bold text-[#03045E]">Email Address <span aria-hidden="true" className="text-[#2C7FFF]">*</span></label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your Email Address" aria-label="Enter your Email Address" required className="w-full p-2.5 text-sm font-semibold border border-[#03045E]/20 rounded-xl bg-[var(--color-surface)] text-[#03045E] placeholder-[#03045E]/50 focus:outline-none focus:border-[#2C7FFF] transition shadow-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-xs font-bold text-[#03045E]">Password <span aria-hidden="true" className="text-[#2C7FFF]">*</span></label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your Password" aria-label="Enter your Password" required className="w-full p-2.5 text-sm font-semibold border border-[#03045E]/20 rounded-xl bg-[var(--color-surface)] text-[#03045E] placeholder-[#03045E]/50 focus:outline-none focus:border-[#2C7FFF] transition shadow-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="confirmPassword" className="text-xs font-bold text-[#03045E]">Confirm Password <span aria-hidden="true" className="text-[#2C7FFF]">*</span></label>
                <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your Password" aria-label="Confirm your Password" required className="w-full p-2.5 text-sm font-semibold border border-[#03045E]/20 rounded-xl bg-[var(--color-surface)] text-[#03045E] placeholder-[#03045E]/50 focus:outline-none focus:border-[#2C7FFF] transition shadow-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="birthdate" className="text-xs font-bold text-[#03045E]">Birthdate (Must be 18+) <span aria-hidden="true" className="text-[#2C7FFF]">*</span></label>
                <input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} placeholder="Enter your Birthdate" aria-label="Enter your Birthdate" required className="w-full p-2.5 text-sm font-semibold border border-[#03045E]/20 rounded-xl bg-[var(--color-surface)] text-[#03045E] placeholder-[#03045E]/50 focus:outline-none focus:border-[#2C7FFF] transition shadow-sm" />
              </div>
            </div>

            <hr aria-hidden="true" className="border-[#03045E]/10 my-1" />

            <div className="flex flex-col gap-3.5 p-3.5 border border-[#2C7FFF]/20 rounded-2xl bg-[#2C7FFF]/5 shadow-sm">
              <label htmlFor="address" className="text-xs font-bold text-[#03045E]">Residential Address <span aria-hidden="true" className="text-[#2C7FFF]">*</span></label>
              <button type="button" onClick={handleDetectLocation} disabled={isDetecting} aria-label={isDetecting ? 'Detecting Location' : 'Detect My Location'} className="bg-[#2C7FFF] text-white px-4 py-2 rounded-xl text-xs font-bold shadow hover:brightness-125 transition w-full flex items-center justify-center gap-1.5">
                {isDetecting ? 'Detecting Location...' : '📍 Detect My Location'}
              </button>
              <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your Residential Address (e.g. Block 4, Main Street, Manila)" aria-label="Enter your Residential Address" required className="w-full p-2.5 text-xs font-semibold border border-[#03045E]/20 rounded-xl bg-[var(--color-surface)] text-[#03045E] placeholder-[#03045E]/50 shadow-sm" />
               
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="radius" className="text-xs font-bold text-[#03045E]">
                    Max Travel Radius:
                  </label>
                  <span aria-hidden="true" className="text-[#2C7FFF] font-black text-sm bg-[var(--color-surface)] px-2.5 py-0.5 rounded-lg border border-[#2C7FFF]/20 shadow-sm">{radius} km</span>
                </div>
                <input 
                  id="radius" type="range" min="1" max="50" 
                  value={radius} onChange={(e) => setRadius(Number(e.target.value))} 
                  aria-label="Max Travel Radius"
                  className="w-full h-2 accent-[#2C7FFF] cursor-pointer" 
                />
                <p className="text-[11px] font-semibold text-[#03045E]">Jobs beyond this distance will be filtered out automatically.</p>
              </div>

              {lat && lng ? (
                <div 
                  role="region"
                  aria-label={`Interactive map showing your home location and a ${radius} kilometer travel radius.`}
                  className="h-48 w-full mt-2 rounded-xl overflow-hidden border border-[#03045E]/25 z-0 relative shadow-inner">
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[1000] flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setSatelliteView(prev => !prev)}
                      aria-label={satelliteView ? 'Switch to street view' : 'Switch to satellite view'}
                      title={satelliteView ? 'Street view' : 'Satellite view'}
                      className="relative flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(3,4,94,0.15)] border border-[#03045E]/15 cursor-pointer"
                    >
                      <span aria-hidden="true" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#2C7FFF]/10 border border-[#2C7FFF]/30 flex items-center justify-center text-[#2C7FFF] shrink-0">
                        {satelliteView ? (
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </span>
                      <span aria-hidden="true" className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#03045E] whitespace-nowrap">
                        {satelliteView ? 'Street' : 'Satellite'}
                      </span>
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-[1000]">
                    <div className="w-[200px] sm:w-[228px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-[#03045E]/20 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setLegendOpen(open => !open)}
                        aria-label="Map Legend"
                        aria-expanded={legendOpen}
                        aria-controls="applicant-reg-map-legend-panel"
                        className="w-full flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                      >
                        <span aria-hidden="true" className="w-6 h-6 rounded-lg bg-[#f4f4f4] border border-[#03045E]/20 flex items-center justify-center text-[#2C7FFF] shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                        </span>
                        <span aria-hidden="true" className="flex-1 text-left text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#03045E]">
                          Map Legend
                        </span>
                        <svg
                          aria-hidden="true"
                          className={`w-3.5 h-3.5 text-[#03045E] transition-transform duration-300 ${legendOpen ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <div className={`grid transition-all duration-300 ease-out ${legendOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                          <div id="applicant-reg-map-legend-panel" className="px-3 pb-3 flex flex-col gap-2">
                            <div aria-hidden="true" className="h-px w-full bg-[#03045E]/10 mb-0.5"></div>

                            <div className="flex items-center gap-2.5">
                              <span aria-hidden="true" className="w-3 h-3 rounded-full bg-[#03045E] border-2 border-white shadow-sm shrink-0"></span>
                              <span className="flex-1 text-[11px] font-bold text-[#03045E] leading-tight">Your Home Base</span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span aria-hidden="true" className="w-3 h-3 rounded-full bg-[#2C7FFF] border-2 border-white shadow-sm shrink-0"></span>
                              <span className="flex-1 text-[11px] font-bold text-[#03045E] leading-tight">Search Radius</span>
                              <span aria-hidden="true" className="text-[10px] font-black text-[#2C7FFF] bg-[#2C7FFF]/10 border border-[#2C7FFF]/20 px-1.5 py-0.5 rounded-full">
                                {radius} km
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                <MapContainer center={[lat, lng]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    {satelliteView ? (
                      <TileLayer
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      />
                    ) : (
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                    )}
                    <Marker position={[lat, lng]} />
                    <Circle center={[lat, lng]} radius={radius * 1000} pathOptions={{ color: '#2C7FFF', fillColor: '#2C7FFF', fillOpacity: 0.2, weight: 2 }} />
                    <MapRecenter lat={lat} lng={lng} />
                  </MapContainer>
                </div>
              ) : (
                <div className="h-32 w-full mt-2 rounded-xl border border-dashed border-[#03045E]/20 bg-gray-50 flex flex-col items-center justify-center text-[#03045E] p-3 text-center">
                  <svg aria-hidden="true" className="w-6 h-6 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span className="text-xs font-semibold">Click 'Detect My Location' to view your travel zone.</span>
                </div>
              )}
            </div>

            <hr aria-hidden="true" className="border-[#03045E]/10 my-1" />

            <fieldset className="flex flex-col gap-2.5">
              <legend className="text-xs font-bold text-[#03045E]">Physical and Sensory Profile (Work-Enabled) <span aria-hidden="true" className="text-[#2C7FFF]">*</span></legend>
              <p className="text-[11px] font-semibold text-[#03045E]">Select applicable physical or sensory categories for tailored job accommodation matching.</p>
               
              {selectedDisabilities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#03045E]/5 rounded-xl border border-[#03045E]/15 shadow-sm">
                  <span aria-hidden="true" className="w-full text-[10px] font-bold text-[#03045E] uppercase tracking-wider mb-0.5">Selected Profile:</span>
                  {selectedDisabilities.map(disability => (
                    <span key={disability} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#2C7FFF] text-white text-[11px] font-bold rounded-full shadow-sm">
                      {disability}
                      <button 
                        type="button" 
                        aria-label={`Remove ${disability}`}
                        onClick={() => setSelectedDisabilities(selectedDisabilities.filter(d => d !== disability))}
                        className="hover:text-red-200 font-bold ml-0.5 text-xs"
                      >
                        ✕
                      </button>
                    </span>
                ))}
              </div>
            )}

              <div className="flex flex-wrap gap-1.5">
                {availableDisabilities.map((disability) => (
                  <button
                    type="button"
                    key={disability}
                    onClick={() => toggleSelection(disability, selectedDisabilities, setSelectedDisabilities)}
                    aria-label={disability}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition shadow-xs ${
                      selectedDisabilities.includes(disability)
                        ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] hover:brightness-125'
                        : 'bg-[var(--color-surface)] text-[#03045E] border-[#03045E]/20 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                    }`}
                  >
                    {disability} <span aria-hidden="true">{selectedDisabilities.includes(disability) ? '✓' : '+'}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowOtherDisability(!showOtherDisability)}
                  aria-label="Other"
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition shadow-xs ${
                  showOtherDisability
                    ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] hover:brightness-125'
                    : 'bg-[var(--color-surface)] text-[#03045E] border-[#03045E]/20 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                }`}
              >
                Other <span aria-hidden="true">{showOtherDisability ? '✓' : '+'}</span>
              </button>
            </div>

            {showOtherDisability && (
              <div className="flex flex-col gap-2 mt-1">
                <input
                  type="text"
                  value={otherDisability}
                  onChange={(e) => setOtherDisability(e.target.value)}
                  onKeyDown={handleCustomDisabilityKeyDown}
                  placeholder="Type custom condition and press Enter..."
                  aria-label="Type custom condition and press Enter"
                  className="w-full p-2.5 text-xs font-semibold border border-[#03045E]/20 rounded-xl bg-[var(--color-surface)] text-[#03045E] placeholder-[#03045E]/50 shadow-sm"
                />
                {otherDisability.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 animate-fadeIn">
                    {extendedDisabilities
                      .filter(d => d.toLowerCase().includes(otherDisability.toLowerCase()) && !selectedDisabilities.includes(d))
                      .slice(0, 6)
                      .map(suggestion => (
                        <button
                          key={suggestion}
                          type="button"
                          aria-label={suggestion}
                          onClick={() => {
                            toggleSelection(suggestion, selectedDisabilities, setSelectedDisabilities);
                            setOtherDisability(''); 
                          }}
                          className="px-3 py-1 rounded-full text-[11px] font-bold border transition bg-[var(--color-surface)] text-[#03045E] border-[#03045E]/20 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF] shadow-xs"
                        >
                          + {suggestion}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </fieldset>

          <fieldset className="flex flex-col gap-2.5">
            <legend className="text-xs font-bold text-[#03045E]">Workplace Independence <span aria-hidden="true" className="text-[#2C7FFF]">*</span></legend>
            <div className="flex flex-wrap gap-1.5">
              {['Independent', 'Requires Assistance'].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setIndependence(option)}
                  aria-label={option}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition shadow-xs ${
                    independence === option
                      ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] hover:brightness-125'
                      : 'bg-[var(--color-surface)] text-[#03045E] border-[#03045E]/20 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                  }`}
                >
                  {option} <span aria-hidden="true">{independence === option ? '✓' : ''}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2.5">
            <legend className="text-xs font-bold text-[#03045E]"> Accommodations <span className="text-[#03045E] font-bold ml-1">(Optional)</span></legend>
            <div className="flex flex-wrap gap-1.5">
              {availableAccommodations.map((acc) => (
                <button
                  type="button"
                  key={acc}
                  onClick={() => toggleSelection(acc, selectedAccommodations, setSelectedAccommodations)}
                  aria-label={acc}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition shadow-xs ${
                    selectedAccommodations.includes(acc)
                      ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] hover:brightness-125'
                      : 'bg-[var(--color-surface)] text-[#03045E] border-[#03045E]/20 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                  }`}
                >
                  {acc} <span aria-hidden="true">{selectedAccommodations.includes(acc) ? '✓' : '+'}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowOtherAccommodation(!showOtherAccommodation)}
                aria-label="Other"
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition shadow-xs ${
                  showOtherAccommodation
                    ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] hover:brightness-125'
                    : 'bg-[var(--color-surface)] text-[#03045E] border-[#03045E]/20 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                }`}
              >
                Other <span aria-hidden="true">{showOtherAccommodation ? '✓' : '+'}</span>
              </button>
            </div>

            {showOtherAccommodation && (
              <div className="flex flex-col gap-2 mt-1">
                <input
                  type="text"
                  value={otherAccommodation}
                  onChange={(e) => setOtherAccommodation(e.target.value)}
                  placeholder="Type custom accommodation and press Enter..."
                  aria-label="Type custom accommodation and press Enter"
                  className="w-full p-2.5 text-xs font-semibold border border-[#03045E]/20 rounded-xl bg-[var(--color-surface)] text-[#03045E] placeholder-[#03045E]/50 shadow-sm"
                />
                {otherAccommodation.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 animate-fadeIn">
                    {extendedAccommodations
                      .filter(a => a.toLowerCase().includes(otherAccommodation.toLowerCase()) && !selectedAccommodations.includes(a))
                      .slice(0, 6)
                      .map(suggestion => (
                        <button
                          key={suggestion}
                          type="button"
                          aria-label={suggestion}
                          onClick={() => {
                            toggleSelection(suggestion, selectedAccommodations, setSelectedAccommodations);
                            setOtherAccommodation(''); 
                          }}
                          className="px-3 py-1 rounded-full text-[11px] font-bold border transition bg-[var(--color-surface)] text-[#03045E] border-[#03045E]/20 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF] shadow-xs"
                        >
                          + {suggestion}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </fieldset>

          <fieldset className="flex flex-col gap-2.5">
            <legend className="text-xs font-bold text-[#03045E]">Your Skills <span aria-hidden="true" className="text-[#2C7FFF]">*</span></legend>
              
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#03045E]/5 rounded-xl border border-[#03045E]/15 shadow-sm">
                <span aria-hidden="true" className="w-full text-[10px] font-bold text-[#03045E] uppercase tracking-wider mb-0.5">Selected Skills:</span>
                {selectedSkills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#2C7FFF] text-white text-[11px] font-bold rounded-full shadow-sm">
                    {skill}
                    <button 
                      type="button" 
                      aria-label={`Remove ${skill}`}
                      onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                      className="hover:text-red-200 font-bold ml-0.5 text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {availableSkills.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSelection(skill, selectedSkills, setSelectedSkills)}
                  aria-label={skill}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition shadow-xs ${
                    selectedSkills.includes(skill)
                      ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] hover:brightness-125'
                      : 'bg-[var(--color-surface)] text-[#03045E] border-[#03045E]/20 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                  }`}
                >
                  {skill} <span aria-hidden="true">{selectedSkills.includes(skill) ? '✓' : '+'}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowOtherSkill(!showOtherSkill)}
                aria-label="Other"
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition shadow-xs ${
                  showOtherSkill
                    ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] hover:brightness-125'
                    : 'bg-[var(--color-surface)] text-[#03045E] border-[#03045E]/20 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                }`}
              >
                Other <span aria-hidden="true">{showOtherSkill ? '✓' : '+'}</span>
              </button>
            </div>

            {showOtherSkill && (
              <div className="flex flex-col gap-2 mt-1">
                <input
                  type="text"
                  value={otherSkill}
                  onChange={(e) => setOtherSkill(e.target.value)}
                  onKeyDown={handleCustomSkillKeyDown}
                  placeholder="Type custom skill and press Enter..."
                  aria-label="Type custom skill and press Enter"
                  className="w-full p-2.5 text-xs font-semibold border border-[#03045E]/20 rounded-xl bg-[var(--color-surface)] text-[#03045E] placeholder-[#03045E]/50 shadow-sm"
                />
                {otherSkill.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 animate-fadeIn">
                    {extendedSkills
                      .filter(s => s.toLowerCase().includes(otherSkill.toLowerCase()) && !selectedSkills.includes(s))
                      .slice(0, 6)
                      .map(suggestion => (
                        <button
                          key={suggestion}
                          type="button"
                          aria-label={suggestion}
                          onClick={() => {
                            toggleSelection(suggestion, selectedSkills, setSelectedSkills);
                            setOtherSkill(''); 
                          }}
                          className="px-3 py-1 rounded-full text-[11px] font-bold border transition bg-[var(--color-surface)] text-[#03045E] border-[#03045E]/20 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF] shadow-xs"
                        >
                          + {suggestion}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </fieldset>

          <hr aria-hidden="true" className="border-[#03045E]/10 my-1" />

          <div className="p-3.5 rounded-2xl border border-dashed border-[#03045E]/20 bg-gray-50 shadow-xs">
            <label htmlFor="pwdId" className="block text-xs font-bold text-[#03045E] mb-1.5">Upload PWD ID or Certificates <span aria-hidden="true" className="text-[#2C7FFF]">*</span></label>
            <input
              id="pwdId"
              type="file"
              accept=".jpg,.jpeg"
              onChange={(e) => setPwdFile(e.target.files[0])}
              aria-label="Upload PWD ID or Certificates"
              className="w-full text-xs font-semibold text-[#03045E] file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-[#2C7FFF] file:text-white file:font-bold cursor-pointer"
              required
            />
            <p className="text-[11px] font-semibold text-[#03045E] mt-1.5">
              Supported formats: .jpg, .jpeg (Max size: 5MB)
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            aria-label={isLoading ? 'Submitting' : 'Complete Registration'}
            className="mt-2 py-3 bg-[#03045E] text-white hover:bg-[#2C7FFF] hover:text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Complete Registration'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs font-semibold text-[#03045E]">
          <Link to="/register-select" aria-label="Back to Role Selection" className="font-bold text-[#2C7FFF] hover:underline">
            ← Back to Role Selection
          </Link>
        </p>
      </div>
    </div>
  </div>

  {showSuccessModal && (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
    >
      <div className="relative w-full max-w-xs bg-[var(--color-surface)] text-[#03045E] rounded-3xl shadow-2xl border border-[#03045E]/20 overflow-hidden animate-fadeIn p-6 text-center">
        <div aria-hidden="true" className="h-1.5 w-full bg-gradient-to-r from-white via-[#2C7FFF] to-white -mx-6 -mt-6 mb-6" />

        <div className="flex flex-col items-center">
          <div aria-hidden="true" className="relative mb-4">
            <div className="w-16 h-16 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#2C7FFF] flex items-center justify-center shadow-lg shadow-[#2C7FFF]/40">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <h2 id="success-title" className="text-xl font-black text-[#03045E] tracking-tight mb-1.5">
            You’re all set!
          </h2>
          <p className="text-xs font-semibold text-[#03045E] leading-relaxed mb-3">
            Registration completed successfully.
          </p>

          <div aria-hidden="true" className="flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:300ms]" />
          </div>
          <p className="text-[11px] text-[#2C7FFF] font-bold">
            Taking you to Log In…
          </p>
        </div>
      </div>
    </div>
  )}
</main>
);
}