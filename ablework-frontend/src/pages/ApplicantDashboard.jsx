import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Import all child components
import ApplicantOverview from '../components/Applicant/ApplicantOverview';
import ApplicantSmartMatches from '../components/Applicant/ApplicantSmartMatches';
import ApplicantJobTracker from '../components/Applicant/ApplicantJobTracker';
import ApplicantProfile from '../components/Applicant/ApplicantProfile';
import ApplicantAccountSettings from '../components/Applicant/ApplicantAccountSettings';
import ApplicantExploreJobs from '../components/Applicant/ApplicantExploreJobs';
import { ApplicantPolicy, ApplicantTerms, ApplicantContact, ApplicantFooter } from '../components/Applicant/ApplicantFooterPages';

// Import Logo for Header
import headerLogo from '../assets/Final.png';

export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isOpen, setIsOpen] = useState(false); // <-- Header mobile menu state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false); // <-- Desktop profile dropdown state
  const [isLoggingOut, setIsLoggingOut] = useState(false); // <-- Added logout loading state
  const dropdownRef = useRef(null);

  // Shared Data States
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [allJobs, setAllJobs] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.id) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch Profile
        const profileRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/profile`);
        const profileData = await profileRes.json();
        if (profileRes.ok) setProfile({ ...profileData, user_id: storedUser.id });

        // 2. Fetch Smart Matches
        const matchesRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/matches`);
        const matchesData = await matchesRes.json();
        if (matchesRes.ok) setMatches(matchesData);

        // 3. Fetch Job Tracker (Application History)
        const trackerRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/applications`);
        const trackerData = await trackerRes.json();
        if (trackerRes.ok) setApplications(trackerData);

        // 4. Fetch ALL Active Jobs for the Explore Tab
        const allJobsRes = await fetch('http://localhost:5001/api/jobs');
        const allJobsData = await allJobsRes.json();
        if (allJobsRes.ok) setAllJobs(allJobsData);

      } catch (err) {
        setError('Cannot connect to the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Function to refresh data after an action (like applying for a job)
  const refreshData = async () => {
    if(!profile) return;
    try {
      const matchesRes = await fetch(`http://localhost:5001/api/applicant/${profile.user_id}/matches`);
      if (matchesRes.ok) setMatches(await matchesRes.json());
      
      const trackerRes = await fetch(`http://localhost:5001/api/applicant/${profile.user_id}/applications`);
      if (trackerRes.ok) setApplications(await trackerRes.json());
    } catch(err) {
      console.error("Failed to refresh data", err);
    }
  };

  // Logout handler function with 2-second delay
  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('user');
      navigate('/login');
    }, 2000);
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f4f4] relative overflow-x-hidden">
      {/* Absolute Backdrop with Blur matching UI */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 transition-all duration-300">
        <div className="bg-white/90 border border-[#03045E]/10 px-6 py-8 sm:px-8 sm:py-10 rounded-3xl shadow-[0_20px_50px_rgba(3,4,94,0.1)] flex flex-col items-center max-w-sm w-full mx-auto transform animate-in fade-in zoom-in-95 duration-300">
          
          {/* Custom Spinner matching your design system */}
          <div className="relative w-16 h-16 flex items-center justify-center mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-[#2C7FFF]/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#2C7FFF] border-r-transparent border-b-[#03045E] border-l-transparent animate-spin"></div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#03045E] to-[#2C7FFF] shadow-md animate-ping opacity-75 absolute"></div>
          </div>

          <h3 className="text-lg font-bold text-[#03045E] tracking-tight text-center mb-1">Loading Workspace</h3>
          <p className="text-xs text-[#03045E]/60 text-center font-medium">Preparing your dashboard and real-time updates...</p>
        </div>
      </div>
    </div>
  );

  if (error) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500 p-4 text-center">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4] selection:bg-[#2C7FFF]/20 selection:text-[#03045E] relative overflow-x-hidden w-full max-w-[100vw]">
      
      {/* ===== LOGOUT FULL-SCREEN LOADING OVERLAY (Desktop & Mobile Responsive) ===== */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
          <div className="bg-white border border-[#03045E]/10 px-6 py-8 sm:px-8 sm:py-10 rounded-3xl shadow-[0_20px_50px_rgba(3,4,94,0.15)] flex flex-col items-center max-w-sm w-full mx-auto transform animate-in zoom-in-95 duration-300">
            <div className="relative w-16 h-16 flex items-center justify-center mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-[#2C7FFF]/20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-[#2C7FFF] border-r-transparent border-b-[#03045E] border-l-transparent animate-spin"></div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#03045E] to-[#2C7FFF] shadow-md animate-ping opacity-75 absolute"></div>
            </div>
            <h3 className="text-lg font-bold text-[#03045E] tracking-tight text-center mb-1">Logging Out</h3>
            <p className="text-xs text-[#03045E]/60 text-center font-medium">Securing your account and ending session...</p>
          </div>
        </div>
      )}

      {/* ===== HEADER (Fixed to Top) ===== */}
      <header className="w-full bg-[#f4f4f4] border-b border-[#03045E]/10 fixed top-0 left-0 z-50 transition-all duration-300">
        <div className="w-full h-20 px-3 sm:px-6 md:pr-12 flex items-center justify-between max-w-[1700px] mx-auto box-border">
          {/* Left side: Logo */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-6 min-w-0">
            <div className="flex items-center flex-shrink-0 cursor-pointer overflow-hidden max-w-[140px] sm:max-w-none" onClick={() => setActiveTab('overview')}>
              <img
                src={headerLogo}
                alt="AbleWork Logo"
                className="h-14 sm:h-20 md:h-24 w-auto object-contain max-h-full hover:opacity-95 transition-opacity"
              />
            </div>
          </div>

          {/* Desktop Right Side: Notification Icon & Circle Profile Button with Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notification SVG Icon */}
            <button
              onClick={() => console.log('Notification clicked')}
              className="w-10 h-10 rounded-full bg-white text-[#03045E] border border-[#03045E]/10 flex items-center justify-center shadow-[0_2px_10px_rgba(3,4,94,0.04)] hover:shadow-[0_4px_20px_rgba(44,127,255,0.15)] hover:border-[#2C7FFF]/60 hover:text-[#2C7FFF] transition-all duration-200 cursor-pointer shrink-0"
              title="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* Circle Profile Button / Picture Icon with Dropdown Wrapper */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`w-10 h-10 rounded-full overflow-hidden bg-white text-[#03045E] border transition-all duration-200 cursor-pointer shadow-[0_2px_10px_rgba(3,4,94,0.04)] hover:shadow-[0_4px_20px_rgba(44,127,255,0.15)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center shrink-0 p-0 ${
                  profileDropdownOpen || activeTab === 'profile' ? 'border-[#2C7FFF] ring-2 ring-[#2C7FFF]/20' : 'border-transparent'
                }`}
                title="Profile Menu"
              >
                {profile?.profile_picture || profile?.avatar_url ? (
                  <img 
                    src={
                      (profile?.profile_picture || profile?.avatar_url).startsWith('http') || (profile?.profile_picture || profile?.avatar_url).startsWith('blob')
                        ? (profile?.profile_picture || profile?.avatar_url)
                        : `http://localhost:5001${profile?.profile_picture || profile?.avatar_url}`
                    } 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-[#03045E]/10 text-[#03045E] flex items-center justify-center font-bold text-sm">
                    {profile?.firstname?.[0] || profile?.full_name?.[0] || 'U'}
                  </div>
                )}
              </button>

              {/* Desktop Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#03045E]/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#03045E] hover:bg-[#2C7FFF]/10 hover:text-[#2C7FFF] transition-colors text-left cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="truncate">Edit Profile</span>
                  </button>
                  <div className="h-px bg-[#03045E]/10 my-1"></div>
                  <button
                    disabled={isLoggingOut}
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    )}
                    <span className="truncate">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu Button */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-[#03045E] border border-[#03045E]/10 shadow-sm cursor-pointer hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF] transition-all duration-200 shrink-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-lg border-b border-[#03045E]/10 ${
            isOpen ? 'max-h-[600px] opacity-100 shadow-2xl' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="w-full">
            <nav className="flex flex-col px-3 sm:px-6 py-4 sm:py-6 gap-2 text-[15px] sm:text-[16px] font-medium text-[#03045E]">
              {/* Mobile Profile Button / Picture Icon */}
              <button
                onClick={() => { setActiveTab('profile'); setIsOpen(false); }}
                className={`flex items-center gap-3 px-3.5 sm:px-4 py-3 rounded-xl sm:rounded-2xl bg-white text-[#03045E] text-xs sm:text-sm font-bold border transition-all cursor-pointer text-left shadow-sm ${
                  activeTab === 'profile' ? 'border-[#2C7FFF] bg-[#2C7FFF]/5' : 'border-[#03045E]/10 hover:border-[#2C7FFF]'
                }`}
              >
                <div className="shrink-0 flex items-center justify-center border-none w-6 h-6 rounded-full overflow-hidden">
                  {profile?.profile_picture || profile?.avatar_url ? (
                    <img 
                      src={
                        (profile?.profile_picture || profile?.avatar_url).startsWith('http') || (profile?.profile_picture || profile?.avatar_url).startsWith('blob')
                          ? (profile?.profile_picture || profile?.avatar_url)
                          : `http://localhost:5001${profile?.profile_picture || profile?.avatar_url}`
                      } 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-[#03045E]/10 text-[#03045E] flex items-center justify-center font-bold text-xs">
                      {profile?.firstname?.[0] || profile?.full_name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <span className="truncate">Profile</span>
              </button>

              <div className="h-px bg-[#03045E]/10 my-1"></div>

              {/* Navigation Tabs for Mobile */}
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'matches', label: 'Smart Matches' },
                { id: 'explore-jobs', label: 'Explore Jobs' },
                { id: 'tracker', label: 'Job Tracker' },
                { id: 'settings', label: 'Settings' }
              ].map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => { setActiveTab(item.id); setIsOpen(false); }} 
                  className={`flex items-center gap-3 text-left px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold transition-all capitalize cursor-pointer ${
                    activeTab === item.id ? 'bg-gradient-to-r from-[#03045E] to-[#04068A] text-white shadow-[0_4px_15px_rgba(3,4,94,0.25)] translate-x-1' : 'text-[#03045E] hover:bg-[#2C7FFF]/10 hover:translate-x-1'
                  }`}
                >
                  <span className="text-xs sm:text-sm truncate tracking-wide">
                    {item.label}
                  </span>
                </button>
              ))}

              <div className="h-px bg-[#03045E]/10 my-1"></div>

              {/* Mobile Logout Button */}
              <button
                disabled={isLoggingOut}
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className="flex items-center gap-3 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-red-50/80 text-red-600 text-xs sm:text-sm font-bold border border-red-200/60 hover:bg-red-100 transition-all cursor-pointer text-left shadow-sm disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                )}
                <span className="truncate">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      {/* ===== MIDDLE CONTAINER - fills full screen so footer stays below the fold ===== */}
      <div className="flex flex-col w-full max-w-[1700px] mx-auto min-w-0 box-border pt-20 min-h-screen">
        <div className="flex flex-col md:flex-row flex-1 w-full min-w-0">
          
          {/* SIDEBAR NAVIGATION (Hidden on mobile via hidden md:flex) */}
          <aside className="hidden md:flex shrink-0 flex-col z-10 bg-white/70 backdrop-blur-xl border-r border-[#03045E]/10 w-80 shadow-[4px_0_24px_rgba(3,4,94,0.02)]">
            <div className="w-full flex flex-col h-full min-w-0">
              <nav className="flex-1 px-5 py-8 flex flex-col gap-3.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'matches', label: 'Smart Matches' },
                  { id: 'explore-jobs', label: 'Explore Jobs' },
                  { id: 'tracker', label: 'Job Tracker' },
                  { id: 'settings', label: 'Settings' }
                ].map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)} 
                    className={`group relative flex items-center gap-4 text-left px-5 py-4 rounded-2xl font-bold transition-all duration-300 capitalize cursor-pointer overflow-hidden border border-solid ${
                      activeTab === item.id 
                        ? 'bg-gradient-to-r from-[#03045E] to-[#0a0c78] text-white border-[#03045E]/20 shadow-[0_4px_14px_rgba(3,4,94,0.18)] scale-[1.01]' 
                        : 'text-[#03045E]/80 border-[#03045E]/10 shadow-[0_2px_8px_rgba(3,4,94,0.06)] hover:bg-white hover:text-[#03045E] hover:border-[#2C7FFF]/30 hover:shadow-[0_4px_12px_rgba(3,4,94,0.1)] hover:scale-[1.01]'
                    }`}
                  >
                    {/* Subtle active indicator accent bar */}
                    {activeTab === item.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2C7FFF] rounded-r-full shadow-[0_0_8px_#2C7FFF]"></div>
                    )}

                    <div className={`p-2.5 rounded-xl transition-colors duration-200 shrink-0 ${
                      activeTab === item.id ? 'bg-white/10 text-[#2C7FFF]' : 'bg-[#03045E]/5 text-[#03045E] group-hover:bg-[#2C7FFF]/10 group-hover:text-[#2C7FFF]'
                    }`}>
                      {item.id === 'overview' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                      )}
                      {item.id === 'matches' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                      )}
                      {item.id === 'explore-jobs' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      )}
                      {item.id === 'tracker' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                        </svg>
                      )}
                      {item.id === 'settings' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                      )}
                    </div>
                    <span className="text-base tracking-wide font-semibold truncate">
                      {item.label}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 p-3 sm:p-6 md:p-10 relative w-full min-w-0 transition-all duration-300 flex flex-col box-border">
            <div className="flex items-start gap-4 w-full min-w-0">
              <div className="w-full flex-1 min-w-0 overflow-x-hidden">
                {activeTab === 'overview' && profile && (
                  <ApplicantOverview profile={profile} matchesCount={matches.length} applications={applications} setActiveTab={setActiveTab} />
                )}
                
                {activeTab === 'matches' && profile && (
                  <ApplicantSmartMatches profile={profile} matches={matches} refreshData={refreshData} />
                )}

                {activeTab === 'explore-jobs' && profile && (
                  <ApplicantExploreJobs profile={profile} jobs={allJobs} refreshData={refreshData} />
                )}
                
                {activeTab === 'tracker' && (
                  <ApplicantJobTracker applications={applications} />
                )}
                
                {activeTab === 'profile' && profile && (
                  <ApplicantProfile profile={profile} refreshData={refreshData} setProfile={setProfile} />
                )}
                
                {activeTab === 'settings' && profile && (
                  <ApplicantAccountSettings profile={profile} />
                )}

                {activeTab === 'applicant-policy' && (
                  <ApplicantPolicy onBack={() => setActiveTab('overview')} />
                )}

                {activeTab === 'applicant-terms' && (
                  <ApplicantTerms onBack={() => setActiveTab('overview')} />
                )}

                {activeTab === 'applicant-contact' && (
                  <ApplicantContact onBack={() => setActiveTab('overview')} />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ===== FOOTER - only visible after scrolling ===== */}
      <div className="w-full">
        <ApplicantFooter activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}