import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';
import { useColorPalette } from '../context/ColorPaletteContext';
import EmployerOverview from '../components/Employer/EmployerOverview';
import EmployerPostJob from '../components/Employer/EmployerPostJob';
import EmployerMyJobs from '../components/Employer/EmployerMyJobs';
import EmployerApplications from '../components/Employer/EmployerApplications';
import EmployerProfile from '../components/Employer/EmployerProfile';
import EmployerAccountSettings from '../components/Employer/EmployerAccountSettings';
import { EmployerPolicy, EmployerTerms, EmployerContact, EmployerFooter } from '../components/Employer/EmployerFooterPages';
import headerLogo from '../assets/LIGHT MODE.png';
import darkHeaderLogo from '../assets/DARK MODE.png';
import { API_BASE_URL } from '../config';

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const dark = isContrast || isDarkMode;
  const isAccessibilityMode = paletteKey === 'highContrast' || paletteKey === 'darkComfort';
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ activeJobs: 0, pendingApps: 0, shortlistedApps: 0, recentActivity: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const notifPanelRef = useRef(null);
  const profilePanelRef = useRef(null);

 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (notificationDropdownOpen && notifPanelRef.current) {
      const timer = setTimeout(() => {
        notifPanelRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [notificationDropdownOpen]);

  useEffect(() => {
    if (showProfileDropdown && profilePanelRef.current) {
      const timer = setTimeout(() => {
        profilePanelRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showProfileDropdown]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.id) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const profileRes = await fetch(`${API_BASE_URL}/api/employer/${storedUser.id}/profile`);
        const profileData = await profileRes.json();
        if (profileRes.ok) setProfile({ ...profileData, user_id: storedUser.id });

        const jobsRes = await fetch(`${API_BASE_URL}/api/employer/${storedUser.id}/jobs`);
        const jobsData = await jobsRes.json();
        if (jobsRes.ok) setJobs(jobsData);

        const statsRes = await fetch(`${API_BASE_URL}/api/employer/${storedUser.id}/dashboard-stats`);
        const statsData = await statsRes.json();
        if (statsRes.ok) setStats(statsData);

        const notifRes = await fetch(`${API_BASE_URL}/api/users/${storedUser.id}/notifications`);
        const notifData = await notifRes.json();
        if (notifRes.ok) setNotifications(notifData);

      } catch (err) {
        setError('Cannot connect to the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);


  const refreshJobsAndStats = async () => {
    if(!profile) return;
    try {
      const profileRes = await fetch(`${API_BASE_URL}/api/employer/${profile.user_id}/profile`);
      if (profileRes.ok) setProfile({ ...await profileRes.json(), user_id: profile.user_id });

      const jobsRes = await fetch(`${API_BASE_URL}/api/employer/${profile.user_id}/jobs`);
      if (jobsRes.ok) setJobs(await jobsRes.json());
      
      const statsRes = await fetch(`${API_BASE_URL}/api/employer/${profile.user_id}/dashboard-stats`);
      if (statsRes.ok) setStats(await statsRes.json());
    } catch(err) {
      console.error("Failed to refresh data", err);
    }
  };


  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setShowProfileDropdown(false);
    setShowMobileMenu(false);
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('user');
      navigate('/login');
    }, 3000);
  };

  if (isLoading) return <div className={`min-h-screen flex items-center justify-center font-bold ${dark ? 'bg-black text-white' : 'bg-[#f4f4f4] text-[#03045E]'}`}>Loading Employer Workspace...</div>;
  if (error) return <div className={`min-h-screen flex items-center justify-center font-bold ${dark ? 'bg-black text-red-400' : 'bg-[#f4f4f4] text-red-500'}`}>{error}</div>;

  const isRejected = profile?.verification_status === 'Rejected';
  
  let daysLeft = 0;
  let canResubmit = false;

  if (isRejected && profile?.rejection_timestamp) {
    const rejectDate = new Date(profile.rejection_timestamp);
    const today = new Date();
    const diffTime = Math.abs(today - rejectDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    daysLeft = 8 - diffDays;
    canResubmit = daysLeft <= 0;
  }

  const handleMarkAsRead = async (notifId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${notifId}/read`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === notifId ? { ...n, is_read: 1 } : n));
      }
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className={`min-h-screen flex flex-col w-full overflow-x-hidden ${dark ? 'bg-black text-white' : 'bg-[#f4f4f4] text-[#03045E]'}`}>
      
      {isLoggingOut && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logging-title"
          aria-describedby="logging-desc"
          tabIndex="-1"
        >
          <div className={`relative w-full max-w-md rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${(isContrast || isDarkMode) ? 'bg-black border-2 border-white' : 'bg-white border-2 border-[#2C7FFF]'}`}>
            <div className="h-1.5 sm:h-2 w-full bg-[#2C7FFF]" />

            <div className="relative px-4 pt-6 pb-5 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
              <div className="relative mb-3 sm:mb-5">
                <div className={`w-14 h-14 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${(isContrast || isDarkMode) ? 'bg-transparent border-4 border-white' : 'bg-transparent border-4 border-[#2C7FFF]'}`}>
                  <svg className={`w-7 h-7 sm:w-12 sm:h-12 animate-spin ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold ${(isContrast || isDarkMode) ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>✓</div>
              </div>

              <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-2.5 sm:mb-4 border-2 ${(isContrast || isDarkMode) ? 'text-white bg-transparent border-white' : 'text-[#2C7FFF] bg-transparent border-[#2C7FFF]'}`}>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#10B981]"></span>
                Notice
              </span>

              <h2 id="logging-title" className={`text-lg sm:text-3xl font-black tracking-tight mb-1 sm:mb-2 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                Logging Out...
              </h2>
              <p id="logging-desc" className={`text-[11px] sm:text-sm font-bold leading-relaxed mb-5 sm:mb-8 max-w-xs ${(isContrast || isDarkMode) ? 'text-white/80' : 'text-[#03045E]/80'}`}>
                Please wait while we secure your account and end the session.
              </p>

              <div className="flex items-center gap-1 sm:gap-1.5" aria-label="Logging out">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          aria-describedby="logout-desc"
          tabIndex="-1"
        >
          <div className={`relative w-full max-w-md rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${(isContrast || isDarkMode) ? 'bg-black border-2 border-white' : 'bg-white border-2 border-[#2C7FFF]'}`}>
            <div className="h-1.5 sm:h-2 w-full bg-[#2C7FFF]" />

            <div className="relative px-4 pt-6 pb-5 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
              <div className="relative mb-3 sm:mb-5">
                <div className={`w-14 h-14 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${(isContrast || isDarkMode) ? 'bg-transparent border-4 border-white' : 'bg-transparent border-4 border-[#2C7FFF]'}`}>
                  <svg className={`w-7 h-7 sm:w-12 sm:h-12 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold ${(isContrast || isDarkMode) ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>!</div>
              </div>

              <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-2.5 sm:mb-4 border-2 ${(isContrast || isDarkMode) ? 'text-white bg-transparent border-white' : 'text-[#2C7FFF] bg-transparent border-[#2C7FFF]'}`}>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#10B981]"></span>
                Notice
              </span>

              <h2 id="logout-title" className={`text-lg sm:text-3xl font-black tracking-tight mb-1 sm:mb-2 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                Are you sure to logout?
              </h2>
              <p id="logout-desc" className={`text-[11px] sm:text-sm font-bold leading-relaxed mb-5 sm:mb-8 max-w-xs ${(isContrast || isDarkMode) ? 'text-white/80' : 'text-[#03045E]/80'}`}>
                You will be signed out of your account and returned to the login page.
              </p>

              <div className="flex flex-row gap-2 sm:gap-3 w-full">
                                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  aria-label="Cancel logout and stay on page"
                  className={`flex-1 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2`}
                  style={{ color: '#16a34a', borderColor: '#16a34a' }}
                >
                  No, Stay
                </button>
                <button
                  onClick={handleLogout}
                  aria-label="Confirm logout and end session"
                  className={`flex-1 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2`}
                  style={{ color: '#DC2626', borderColor: '#DC2626' }}
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header role="banner" className={`w-full fixed top-0 left-0 z-50 ${dark ? 'bg-black border-b-2 border-[#2C7FFF]' : 'bg-white border-b border-[#03045E]/15'}`}>
        <div className="w-full h-14 sm:h-16 pl-3 pr-3 sm:pl-4 sm:pr-4 md:pr-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center flex-shrink-0 py-1">
              <img
                src={(dark || isAccessibilityMode) ? darkHeaderLogo : headerLogo}
                alt="AbleWork logo"
                role="img"
                aria-label="AbleWork logo"
                tabIndex="0"
                className="h-9 sm:h-12 md:h-14 w-auto object-contain max-h-full hover:opacity-95 transition-opacity"
              />
            </div>
          </div>


        <div className="flex items-center gap-2 sm:gap-4">
          
       
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              aria-expanded={notificationDropdownOpen}
              aria-haspopup="true"
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications, no unread'}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 p-0 shadow-sm ${
                dark
                  ? notificationDropdownOpen
                    ? 'bg-zinc-900 text-[#2C7FFF] border-[#2C7FFF] ring-2 ring-[#2C7FFF]/30'
                    : 'bg-zinc-900 text-white border-white/30'
                  : notificationDropdownOpen
                    ? 'bg-[#f4f4f4] text-[#2C7FFF] border-[#2C7FFF] ring-2 ring-[#2C7FFF]/30'
                    : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20'
              }`}
              title="Notifications"
            >
              <svg aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
        
              {unreadCount > 0 && (
                <span aria-hidden="true" className={`absolute top-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 rounded-full ${dark ? 'bg-[#2C7FFF] border-black' : 'bg-[#2C7FFF] border-white'}`}></span>
              )}
            </button>

    
            {notificationDropdownOpen && (
              <div 
                ref={notifPanelRef}
                tabIndex={-1}
                role="region" 
                aria-label={`Notifications panel. ${unreadCount} unread notifications.`} 
                className={`fixed left-1/2 -translate-x-1/2 top-16 sm:top-20 w-[calc(100vw-2rem)] max-w-sm sm:absolute sm:left-auto sm:translate-x-0 sm:top-auto sm:right-0 sm:mt-3 sm:w-96 sm:max-w-none rounded-2xl shadow-[0_15px_40px_rgba(3,4,94,0.2)] border-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden focus:outline-none ${dark ? 'bg-black border-[#2C7FFF]/50' : 'bg-white border-[#03045E]/20'}`}>
                <div className={`px-5 py-3.5 border-b-2 flex justify-between items-center rounded-t-2xl relative z-20 ${dark ? 'bg-black border-[#2C7FFF]/40' : 'bg-[#f4f4f4] border-[#03045E]/15'}`}>
                  <div className="flex items-center gap-2">
                    <div aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-[#2C7FFF]"></div>
                    <h3 className={`font-black text-base tracking-tight ${dark ? 'text-white' : 'text-[#03045E]'}`}>Notifications</h3>
                  </div>
                  {unreadCount > 0 ? (
                    <span className="text-[11px] font-black tracking-wide text-[#2c7fff] px-3 py-1 rounded-full uppercase">
                      {unreadCount} New
                    </span>
                  ) : (
                    <span className={`text-[11px] font-black uppercase tracking-wider ${dark ? 'text-white/70' : 'text-[#03045E]/70'}`}>All Read</span>
                  )}
                </div>
                
                <div className={`max-h-[340px] overflow-y-auto flex flex-col divide-y-2 ${dark ? 'divide-[#2C7FFF]/20' : 'divide-[#03045E]/10'}`}>
                  {notifications.length > 0 ? notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      role="menuitem"
                      tabIndex={0}
                      aria-label={`Notification: ${notif.title}. Message: ${notif.message}. Status: ${!notif.is_read ? 'Unread' : 'Read'}. Received: ${new Date(notif.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                      onClick={() => {
                        if (!notif.is_read) handleMarkAsRead(notif.id);
                        if (notif.type === 'application') {
                          setActiveTab('applications');
                        } else {
                          setActiveTab('overview');
                        }
                        setNotificationDropdownOpen(false);
                      }} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (!notif.is_read) handleMarkAsRead(notif.id);
                          if (notif.type === 'application') {
                            setActiveTab('applications');
                          } else {
                            setActiveTab('overview');
                          }
                          setNotificationDropdownOpen(false);
                        }
                      }}
                      className={`p-4 sm:p-5 cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-[#2C7FFF] focus:ring-inset ${
                        !notif.is_read 
                          ? (dark ? 'bg-[#2C7FFF]/15' : 'bg-[#2C7FFF]/10') 
                          : (dark ? 'bg-black' : 'bg-white')
                      }`}
                    >
                      {!notif.is_read && (
                        <div aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2C7FFF]"></div>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm tracking-tight ${!notif.is_read ? (dark ? 'font-black text-white' : 'font-black text-[#03045E]') : (dark ? 'font-bold text-white/80' : 'font-bold text-[#03045E]/80')}`}>
                          {notif.title}
                        </h4>
                        {!notif.is_read && (
                          <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-[#2C7FFF] shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className={`text-xs mt-1.5 leading-relaxed ${!notif.is_read ? (dark ? 'text-white font-bold' : 'text-[#03045E] font-bold') : (dark ? 'text-white/70 font-semibold' : 'text-[#03045E]/70 font-semibold')}`}>
                        {notif.message}
                      </p>
                      <span className="text-[11px] text-[#2C7FFF] font-black tracking-wider uppercase mt-2.5 block">
                        {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )) : (
                    <div className={`p-10 text-center flex flex-col items-center justify-center ${dark ? 'bg-black' : 'bg-white'}`}>
                      <div aria-hidden="true" className="w-12 h-12 bg-[#2C7FFF]/15 text-[#2C7FFF] rounded-2xl flex items-center justify-center mb-3">
                        <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                      </div>
                      <span className={`text-sm font-black ${dark ? 'text-white' : 'text-[#03045E]'}`}>You're all caught up!</span>
                      <span className={`text-xs font-bold mt-1 ${dark ? 'text-white/70' : 'text-[#03045E]/70'}`}>No new notifications at the moment.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              aria-expanded={showProfileDropdown}
              aria-haspopup="true"
              aria-label={`Profile Menu for ${profile?.company_name || 'Employer'}`}
              className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center shrink-0 p-0 ${
                showProfileDropdown || activeTab === 'profile' || activeTab === 'settings' ? 'border-[#2C7FFF] ring-2 ring-[#2C7FFF]/30' : (isContrast ? 'bg-zinc-900 border-white/30' : 'bg-white border-[#03045E]/20')
              }`}
              title="Profile Menu"
            >
              {profile?.company_logo ? (
                <img src={`${API_BASE_URL}${profile.company_logo}`} alt={`Company Logo of ${profile?.company_name || 'Employer'}`} className="w-full h-full object-cover" />
              ) : (
                <div aria-hidden="true" className={`w-full h-full flex items-center justify-center font-black text-sm ${isContrast ? 'bg-[#2C7FFF] text-white' : 'bg-[#03045E] text-white'}`}>
                  {profile?.company_name ? profile.company_name.charAt(0).toUpperCase() : 'E'}
                </div>
              )}
            </button>

            {showProfileDropdown && (
              <div 
                ref={profilePanelRef}
                tabIndex={-1}
                role="region" 
                aria-label={`Profile menu panel. Logged in as ${profile?.company_name || 'Employer'}.`} 
                className={`absolute right-0 mt-3 w-72 rounded-3xl shadow-[0_20px_50px_rgba(3,4,94,0.25)] border-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 focus:outline-none ${isContrast ? 'bg-black border-[#2C7FFF]/60' : 'bg-white border-[#03045E]/20'}`}>
                <div className={`relative p-4 pb-5 ${isContrast ? 'bg-black border-b border-[#2C7FFF]/30' : 'bg-[#f4f4f4] border-b border-[#03045E]/10'}`}>
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#2C7FFF] shadow-md`}>
                        {profile?.company_logo ? (
                          <img src={`${API_BASE_URL}${profile.company_logo}`} alt={`Company Logo of ${profile?.company_name || 'Employer'}`} className="w-full h-full object-cover" />
                        ) : (
                          <div aria-hidden="true" className={`w-full h-full flex items-center justify-center font-black text-lg ${isContrast ? 'bg-[#2C7FFF] text-white' : 'bg-[#03045E] text-white'}`}>
                            {profile?.company_name ? profile.company_name.charAt(0).toUpperCase() : 'E'}
                          </div>
                        )}
                      </div>
                      <span aria-hidden="true" className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md"></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${isContrast ? 'text-[#2C7FFF]' : 'text-[#2C7FFF]'}`}>Welcome back</p>
                      <p className={`text-sm font-black truncate leading-tight mt-0.5 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
                        {profile?.company_name || 'Employer'}
                      </p>
                      <p className={`text-[11px] font-semibold truncate mt-0.5 ${isContrast ? 'text-white/60' : 'text-[#03045E]/60'}`}>
                        {profile?.email || 'employer@ablework.ph'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <p aria-hidden="true" className={`px-3 pt-1.5 pb-2 text-[10px] font-black uppercase tracking-[0.15em] ${isContrast ? 'text-white/50' : 'text-[#03045E]/50'}`}>Account</p>
                  <button
                    role="menuitem"
                    onClick={() => { setActiveTab('profile'); setShowProfileDropdown(false); }}
                    aria-label="Edit Profile"
                    aria-current={activeTab === 'profile' ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-black transition-colors text-left cursor-pointer focus:outline-none ${
                      activeTab === 'profile'
                        ? (isContrast ? 'bg-[#2C7FFF] text-white' : 'bg-[#03045E] text-white')
                        : (isContrast ? 'text-white' : 'text-[#03045E]')
                    }`}
                  >
                    <div aria-hidden="true" className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      activeTab === 'profile'
                        ? (isContrast ? 'bg-white text-[#2C7FFF]' : 'bg-white text-[#03045E]')
                        : (isContrast ? 'bg-[#2C7FFF] text-white' : 'bg-[#03045E] text-white')
                    }`}>
                      <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0"><span className="truncate block">Edit Profile</span></div>
                    {activeTab === 'profile' && <span aria-hidden="true" className={`w-2 h-2 rounded-full shrink-0 ${isContrast ? 'bg-[#2C7FFF]' : 'bg-white'}`}></span>}
                  </button>

                  <button
                    role="menuitem"
                    onClick={() => { setActiveTab('settings'); setShowProfileDropdown(false); }}
                    aria-label="Settings"
                    aria-current={activeTab === 'settings' ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-black transition-colors text-left cursor-pointer focus:outline-none ${
                      activeTab === 'settings'
                        ? (isContrast ? 'bg-[#2C7FFF] text-white' : 'bg-[#03045E] text-white')
                        : (isContrast ? 'text-white' : 'text-[#03045E]')
                    }`}
                  >
                    <div aria-hidden="true" className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      activeTab === 'settings'
                        ? (isContrast ? 'bg-white text-[#2C7FFF]' : 'bg-white text-[#03045E]')
                        : (isContrast ? 'bg-[#2C7FFF] text-white' : 'bg-[#03045E] text-white')
                    }`}>
                      <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0"><span className="truncate block">Settings</span></div>
                    {activeTab === 'settings' && <span aria-hidden="true" className={`w-2 h-2 rounded-full shrink-0 ${isContrast ? 'bg-[#2C7FFF]' : 'bg-white'}`}></span>}
                  </button>

                  <div aria-hidden="true" className={`h-px my-2 mx-2 ${isContrast ? 'bg-[#2C7FFF]/30' : 'bg-[#03045E]/10'}`}></div>

                  <button
                    role="menuitem"
                    disabled={isLoggingOut}
                    onClick={() => { setShowProfileDropdown(false); setShowLogoutConfirm(true); }}
                    style={{ color: '#DC2626' }}
                    aria-label={isLoggingOut ? 'Logging out' : 'Log Out'}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-black transition-colors text-left cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:ring-inset`}
                  >
                    <div aria-hidden="true" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }} className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0`}>
                      {isLoggingOut ? (
                        <svg aria-hidden="true" className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                      ) : (
                        <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0"><span className="truncate block">{isLoggingOut ? 'Logging out...' : 'Log Out'}</span></div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="block md:hidden relative">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label={showMobileMenu ? "Close menu" : "Open menu"}
              aria-expanded={showMobileMenu}
              aria-controls="mobile-menu"
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-2 shadow-sm transition-all flex items-center justify-center cursor-pointer shrink-0 ${dark ? 'bg-zinc-900 text-white border-white/30' : 'bg-white text-[#03045E] border-[#03045E]/20'}`}
            >
              <svg aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>


            <div
              id="mobile-menu"
              aria-hidden={!showMobileMenu}
              className={`fixed left-2 right-2 top-16 sm:absolute sm:right-0 sm:left-auto sm:top-auto sm:mt-3 sm:w-[22rem] max-w-[calc(100vw-1rem)] rounded-2xl sm:rounded-3xl shadow-2xl border-2 p-3 sm:p-4 z-50 flex flex-col gap-2.5 sm:gap-3 overflow-hidden transition-all duration-300 ease-in-out ${dark ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#03045E]/20'} ${showMobileMenu ? 'max-h-[calc(100vh-5rem)] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 pointer-events-none'}`}
            >
                
  
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setActiveTab('profile');
                    setShowMobileMenu(false);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTab('profile'); setShowMobileMenu(false); } }}
                  aria-label="View and Edit Profile"
                  className={`flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all border-2 shrink-0 ${dark ? 'bg-zinc-900 border-white/30' : 'bg-[#f4f4f4] border-[#03045E]/10'}`}
                >
                  <div aria-hidden="true" className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold overflow-hidden shadow-md flex-shrink-0 border-2 ${dark ? 'bg-[#2C7FFF] text-white border-white' : 'bg-[#03045E] text-white border-[#03045E]'}`}>
                    {profile?.company_logo ? (
                      <img src={`${API_BASE_URL}${profile.company_logo}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{profile?.company_name ? profile.company_name.charAt(0).toUpperCase() : 'E'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] sm:text-xs font-extrabold truncate ${dark ? 'text-white' : 'text-[#03045E]'}`}>
                      {profile?.company_name || profile?.contact_person || 'Employer'}
                    </p>
                    <p className={`text-[9px] sm:text-[10px] font-semibold ${dark ? 'text-[#2C7FFF]' : 'text-[#2C7FFF]'}`}>View & Edit Profile</p>
                  </div>
                </div>

            
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowMobileMenu(false);
                  }}
                  aria-label="Account Settings"
                  aria-current={activeTab === 'settings' ? 'page' : undefined}
                  className={`flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold transition-all text-[11px] sm:text-xs w-full border-2 shadow-sm cursor-pointer shrink-0 ${
                    activeTab === 'settings' 
                      ? 'bg-[#2C7FFF] text-white border-[#2C7FFF]' 
                      : (dark ? 'bg-zinc-900 text-white border-white/30' : 'bg-white text-[#03045E] border-[#03045E]/20')
                  }`}
                >
                  <svg aria-hidden="true" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="flex-1 text-left">Account Settings</span>
                </button>


                <div className="flex flex-col gap-1.5 sm:gap-2 pr-0.5 sm:pr-1">
                  {[
                    { id: 'overview', label: 'Analytics Dashboard', icon: (
                      <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )},
                    { id: 'post-job', label: 'Post a New Job', icon: (
                      <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )},
                    { id: 'jobs', label: 'My Job Listings', icon: (
                      <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    )},
                    { id: 'applications', label: 'Review Applicants', icon: (
                      <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                  ].map((tabItem) => {
                    const isActive = activeTab === tabItem.id;
                    return (
                      <button 
                        key={tabItem.id} 
                        onClick={() => {
                            setActiveTab(tabItem.id);
                            setShowMobileMenu(false);
                        }} 
                        aria-label={tabItem.label}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold transition-all text-[11px] sm:text-xs w-full relative group border-2 cursor-pointer text-left shrink-0 ${
                            isActive 
                              ? (isContrast ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] shadow-md' : isDarkMode ? 'bg-[#03045E] text-white border-[#03045E] shadow-md' : 'bg-[#03045E] text-white border-[#03045E] shadow-md') 
                              : (dark ? 'bg-zinc-900 text-white border-white/30' : 'bg-white text-[#03045E] border-[#03045E]/20')
                        }`}
                      >
                        <div aria-hidden="true" className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg transition-all shrink-0 ${
                            isActive 
                              ? (isContrast ? 'bg-white text-[#2C7FFF]' : 'bg-white text-[#03045E]') 
                              : (dark ? 'bg-[#2C7FFF] text-white' : 'bg-[#03045E] text-white')
                        }`}>
                          {tabItem.icon}
                        </div>
                        <span className="flex-1 leading-tight">{tabItem.label}</span>
                      </button>
                    );
                  })}
                </div>

        
                <button
                  disabled={isLoggingOut}
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowLogoutConfirm(true);
                  }}
                  aria-label={isLoggingOut ? "Logging out" : "Logout Account"}
                  style={{ backgroundColor: '#FEE2E2', color: '#DC2626', borderColor: '#FCA5A5' }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl font-extrabold text-[11px] sm:text-xs transition-colors border-2 shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
                >
                    {isLoggingOut ? (
                      <svg aria-hidden="true" className="w-4 h-4 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                    ) : (
                      <svg aria-hidden="true" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                      </svg>
                    )}
                    {isLoggingOut ? 'Logging out...' : 'Logout Account'}
                </button>

              </div>
          </div>
        </div>
      </div>
      </header>

      <button
        onClick={() => setShowDesktopSidebar((prev) => !prev)}
        aria-label="Toggle sidebar"
        aria-expanded={showDesktopSidebar}
        aria-controls="sidebar-navigation"
        title={showDesktopSidebar ? 'Hide navigation' : 'Show navigation'}
        className={`hidden md:flex fixed top-[4.5rem] left-4 z-40 w-11 h-11 items-center justify-center rounded-2xl border-2 shadow-md transition-all duration-200 cursor-pointer ${
          dark
            ? 'bg-black text-white border-white'
            : 'bg-white text-[#03045E] border-[#03045E]/15'
        }`}
      >
        <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          {showDesktopSidebar ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

    
      <div className={`flex flex-col md:flex-row flex-1 min-h-screen pt-20 transition-all duration-300 ${dark ? 'bg-black' : ''}`}>
        

        <aside id="sidebar-navigation" role="complementary" aria-label="Sidebar navigation" className={`hidden md:flex w-72 flex-col z-10 border-r-2 px-4 pt-16 pb-4 justify-between shadow-sm flex-shrink-0 fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto transition-transform duration-300 ease-in-out ${dark ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#03045E]/15'} ${showDesktopSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
          <nav className="flex flex-col space-y-3 w-full" aria-label="Sidebar navigation links">

            {[
              { id: 'overview', label: 'Analytics Dashboard', icon: (
                <svg aria-hidden="true" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )},
              { id: 'post-job', label: 'Post a New Job', icon: (
                <svg aria-hidden="true" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
              { id: 'jobs', label: 'My Job Listings', icon: (
                <svg aria-hidden="true" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              )},
              { id: 'applications', label: 'Review Applicants', icon: (
                <svg aria-hidden="true" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            ].map((tabItem) => {
              const isActive = activeTab === tabItem.id;
              return (
                <button 
                  key={tabItem.id} 
                  onClick={() => setActiveTab(tabItem.id)} 
                  aria-label={tabItem.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center gap-3.5 text-left pl-4 pr-3.5 py-3.5 rounded-2xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${
                    isActive
                      ? 'bg-white text-[#03045E] border-[#03045E] shadow-md'
                      : 'bg-white text-[#03045E] border-[#03045E]/25'
                  }`}
                >
                  {isActive && (
                    <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>
                  )}
                  <div 
                    aria-hidden="true"
                    className={`p-2.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 ${
                      isActive
                        ? 'bg-[#03045E] text-white border-[#03045E]'
                        : 'bg-[#03045E] text-white border-[#03045E]'
                    }`}
                  >
                    {tabItem.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[15px] tracking-wide font-black block leading-tight text-[#03045E] break-words">{tabItem.label}</span>
                  </div>
                  <svg 
                    aria-hidden="true"
                    className="w-4 h-4 shrink-0 transition-transform duration-300 text-[#03045E]"
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </nav>
        </aside>


        <main role="main" aria-label="Dashboard content area" className={`flex-1 p-3 pt-6 sm:p-6 sm:pt-10 md:p-10 md:pt-14 relative min-w-0 transition-all duration-300 ease-in-out flex flex-col box-border ${showDesktopSidebar ? 'md:ml-72' : 'md:ml-0'} ${dark ? 'bg-black' : ''}`}>
          <div className="flex items-start gap-4 w-full min-w-0">
            <div className="w-full flex-1 min-w-0 overflow-x-hidden">

              {isRejected && (
                <div 
                  role="alert"
                  aria-live="assertive"
                  aria-label={`Account Verification Failed. ${profile.rejection_reason || "Your verification document did not meet platform standards."}`}
                  className={`mb-8 p-6 sm:p-8 border-2 rounded-[2rem] shadow-sm flex flex-col gap-5 animate-fadeIn transition-all`}
                  style={{
                    backgroundColor: dark ? '#1a0505' : 'rgba(239, 68, 68, 0.08)',
                    borderColor: dark ? '#ef4444' : '#fca5a5'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      aria-hidden="true"
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: dark ? '#ef4444' : '#fee2e2',
                        color: dark ? '#000000' : '#b91c1c'
                      }}
                    >
                      <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight" style={{ color: dark ? '#ffffff' : '#991b1b' }}>Account Verification Failed</h2>
                      <p className="text-sm font-bold mt-0.5" style={{ color: dark ? 'rgba(255,255,255,0.8)' : '#b91c1c' }}>Your platform access is currently suspended. Please review the admin feedback below.</p>
                    </div>
                  </div>
                  
                  <div 
                    className="p-5 rounded-2xl border-2 shadow-inner backdrop-blur-md transition-all"
                    style={{
                      backgroundColor: (dark || isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.26)',
                      borderColor: (dark || isContrast || isDarkMode) ? 'rgba(239, 68, 68, 0.4)' : 'rgba(254, 202, 202, 0.99)'
                    }}
                  >
                    <h3 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: (dark || isContrast || isDarkMode) ? '#fca5a5' : '#b91c1c' }}>Admin Feedback</h3>
                    <p className="text-sm font-black" style={{ color: (dark || isContrast || isDarkMode) ? '#ffffff' : '#03045E' }}>
                      {profile.rejection_reason || "Your verification document did not meet platform standards."}
                    </p>
                  </div>
                  
                  <hr aria-hidden="true" style={{ borderColor: dark ? 'rgba(239, 68, 68, 0.4)' : '#fca5a5' }} />
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-sm font-black" style={{ color: dark ? '#ffffff' : '#991b1b' }}>Ready to try again?</h3>
                      {!canResubmit ? (
                        <p className="text-xs font-bold mt-1" style={{ color: dark ? 'rgba(255,255,255,0.7)' : '#b91c1c' }}>
                          Due to security policies, you must wait <span className="font-black" style={{ color: dark ? '#ffffff' : '#7f1d1d' }}>{daysLeft} days</span> before uploading a new document.
                        </p>
                      ) : (
                        <p className="text-xs font-bold mt-1" style={{ color: '#10b981' }}>Your cooldown period has ended. You may now resubmit your documents.</p>
                      )}
                    </div>
                    <button 
                      disabled={!canResubmit}
                      onClick={() => setActiveTab('settings')}
                      aria-label={canResubmit ? 'Go to Settings to Resubmit' : `Locked for ${daysLeft} Days`}
                      className="px-6 py-3 rounded-xl font-black text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                      style={{
                        backgroundColor: canResubmit ? '#ef4444' : (dark ? '#18181b' : '#f64c4c5c'),
                        color: canResubmit ? '#ffffff' : (dark ? 'rgba(255, 255, 255, 0.72)' : '#f30606ff'),
                        border: '2px solid',
                        borderColor: canResubmit ? '#ef4444' : 'transparent'
                      }}
                    >
                      {!canResubmit && <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>}
                      {canResubmit ? 'Go to Settings to Resubmit' : `Locked for ${daysLeft} Days`}
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'overview' && profile && <EmployerOverview profile={profile} stats={stats} setActiveTab={setActiveTab} />}
              {activeTab === 'post-job' && <EmployerPostJob profile={profile} refreshData={refreshJobsAndStats} setActiveTab={setActiveTab} />}
              {activeTab === 'jobs' && <EmployerMyJobs jobs={jobs} refreshData={refreshJobsAndStats} />}
              {activeTab === 'applications' && profile && <EmployerApplications profile={profile} refreshStats={refreshJobsAndStats} />}
              {activeTab === 'profile' && profile && <EmployerProfile profile={profile} refreshData={refreshJobsAndStats} />}
              {activeTab === 'settings' && profile && <EmployerAccountSettings profile={profile} />}
              {activeTab === 'employer-policy' && <EmployerPolicy onBack={() => setActiveTab('overview')} />}
              {activeTab === 'employer-terms' && <EmployerTerms onBack={() => setActiveTab('overview')} />}
              {activeTab === 'employer-contact' && <EmployerContact onBack={() => setActiveTab('overview')} />}
            </div>
          </div>
        </main>
      </div>


      <div className={`transition-all duration-300 ease-in-out ${showDesktopSidebar ? 'md:ml-72' : 'md:ml-0'}`}>
        <EmployerFooter activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
    </div>
  );
}
