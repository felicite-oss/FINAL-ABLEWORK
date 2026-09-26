import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';
import EmployerOverview from '../components/Employer/EmployerOverview';
import EmployerPostJob from '../components/Employer/EmployerPostJob';
import EmployerMyJobs from '../components/Employer/EmployerMyJobs';
import EmployerApplications from '../components/Employer/EmployerApplications';
import EmployerProfile from '../components/Employer/EmployerProfile';
import EmployerAccountSettings from '../components/Employer/EmployerAccountSettings';
import { EmployerPolicy, EmployerTerms, EmployerContact, EmployerFooter } from '../components/Employer/EmployerFooterPages';
import FinalLogo from '../assets/LIGHT MODE.png';

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const dark = isContrast || isDarkMode;
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
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.id) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const profileRes = await fetch(`http://localhost:5001/api/employer/${storedUser.id}/profile`);
        const profileData = await profileRes.json();
        if (profileRes.ok) setProfile({ ...profileData, user_id: storedUser.id });

        const jobsRes = await fetch(`http://localhost:5001/api/employer/${storedUser.id}/jobs`);
        const jobsData = await jobsRes.json();
        if (jobsRes.ok) setJobs(jobsData);

        const statsRes = await fetch(`http://localhost:5001/api/employer/${storedUser.id}/dashboard-stats`);
        const statsData = await statsRes.json();
        if (statsRes.ok) setStats(statsData);

        const notifRes = await fetch(`http://localhost:5001/api/users/${storedUser.id}/notifications`);
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
      const profileRes = await fetch(`http://localhost:5001/api/employer/${profile.user_id}/profile`);
      if (profileRes.ok) setProfile({ ...await profileRes.json(), user_id: profile.user_id });

      const jobsRes = await fetch(`http://localhost:5001/api/employer/${profile.user_id}/jobs`);
      if (jobsRes.ok) setJobs(await jobsRes.json());
      
      const statsRes = await fetch(`http://localhost:5001/api/employer/${profile.user_id}/dashboard-stats`);
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold bg-[#f4f4f4] text-[#03045E]">Loading Employer Workspace...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center font-bold bg-[#f4f4f4] text-red-500">{error}</div>;

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
      const res = await fetch(`http://localhost:5001/api/notifications/${notifId}/read`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === notifId ? { ...n, is_read: 1 } : n));
      }
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className={`min-h-screen flex flex-col w-full overflow-x-hidden ${dark ? 'bg-black text-white' : 'bg-[var(--color-surface,#f4f4f4)] text-[var(--color-text,#03045E)]'}`}>
      
      {isLoggingOut && (
        <div className={`fixed inset-0 backdrop-blur-xs z-[100] flex flex-col items-center justify-center p-4 transition-all duration-300 animate-in fade-in ${isContrast ? 'bg-black/90' : 'bg-[#f4f4f4]/90'}`}>
          <div className={`border-2 px-6 py-8 sm:px-8 sm:py-10 rounded-3xl shadow-[0_20px_50px_rgba(3,4,94,0.18)] flex flex-col items-center max-w-sm w-full mx-auto transform animate-in zoom-in-95 duration-300 ${isContrast ? 'bg-black border-white' : 'bg-white border-[#03045E]/20'}`}>
            <div className="relative w-16 h-16 flex items-center justify-center mb-5">
              <div className={`absolute inset-0 rounded-full border-4 ${isContrast ? 'border-white/30' : 'border-[#2C7FFF]/30'} animate-pulse`}></div>
              <div className={`absolute inset-0 rounded-full border-4 border-t-transparent ${isContrast ? 'border-r-transparent border-b-white border-l-transparent' : 'border-r-transparent border-b-[#03045E] border-l-transparent'} animate-spin`} style={isContrast ? { borderTopColor: '#ffffff' } : { borderTopColor: '#2C7FFF' }}></div>
              <div className={`w-6 h-6 rounded-full shadow-md animate-ping opacity-75 absolute ${isContrast ? 'bg-white' : 'bg-[#03045E]'}`}></div>
            </div>
            <h3 className={`text-lg font-black tracking-tight text-center mb-1 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Logging Out</h3>
            <p className={`text-xs text-center font-bold ${isContrast ? 'text-white/80' : 'text-[#03045E]/80'}`}>Securing your account and ending session...</p>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', filter: 'none' }}
        >
          <div
            className="relative w-full max-w-md rounded-[2rem] shadow-[0_25px_60px_rgba(3,4,94,0.35)] border-2 overflow-hidden transform animate-in zoom-in-95 duration-300"
            style={{
              backgroundColor: isContrast ? '#000000' : 'var(--color-card, #ffffff)',
              borderColor: isContrast ? 'rgba(255,255,255,0.6)' : 'var(--color-border, rgba(3,4,94,0.2))'
            }}
          >
            <div
              className="h-1.5 w-full"
              style={{ backgroundColor: isContrast ? '#ffffff' : 'var(--color-primary, #2c7fff)' }}
            ></div>
            <div className="px-8 pt-8 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: isContrast ? 'rgba(127,29,29,0.4)' : 'var(--color-danger-soft, #fee2e2)' }}
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg bg-red-500 shadow-red-500/40">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                  </div>
                </div>
                <div
                  className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2"
                  style={{
                    backgroundColor: isContrast ? '#ffffff' : 'var(--color-primary, #03045E)',
                    borderColor: isContrast ? '#000000' : 'var(--color-card, #ffffff)'
                  }}
                >
                  <span className={`text-xs font-black ${isContrast ? 'text-black' : 'text-white'}`}>?</span>
                </div>
              </div>
              <h2
                className="text-2xl font-black tracking-tight mb-2"
                style={{ color: isContrast ? '#ffffff' : 'var(--color-text, #03045E)' }}
              >
                Are you sure to logout?
              </h2>
              <p
                className="text-sm font-bold leading-relaxed mb-8 max-w-xs"
                style={{ color: isContrast ? 'rgba(255,255,255,0.75)' : 'var(--color-text, #03045E)', opacity: isContrast ? 1 : 0.75 }}
              >
                You will be signed out of your account and returned to the login page.
              </p>
              <div className="flex flex-row gap-3 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-4 rounded-xl font-black text-sm cursor-pointer border-2 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: isContrast ? '#000000' : 'var(--color-surface, #f4f4f4)',
                    color: isContrast ? '#ffffff' : 'var(--color-text, #03045E)',
                    borderColor: isContrast ? 'rgba(255,255,255,0.6)' : 'var(--color-border, rgba(3,4,94,0.2))'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  No, Stay
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex-1 py-4 rounded-xl font-black text-sm cursor-pointer border-2 flex items-center justify-center gap-2 shadow-lg ${isContrast ? 'hover:bg-red-500 hover:border-red-500 shadow-red-900/40' : 'hover:bg-red-600 hover:border-red-600 shadow-red-500/30'}`}
                  style={{ backgroundColor: isContrast ? '#dc2626' : '#ef4444', color: '#ffffff', borderColor: isContrast ? '#dc2626' : '#ef4444' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className={`w-full fixed top-0 left-0 z-50 ${dark ? 'bg-black border-b-2 border-white' : 'bg-[var(--color-surface,#f4f4f4)] border-b border-[var(--color-border,rgba(3,4,94,0.1))]'}`}>
        <div className="w-full h-16 pl-4 pr-4 md:pr-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center flex-shrink-0 py-1">
              <img
                src={FinalLogo}
                alt="AbleWork Logo"
                className="h-14 w-auto object-contain max-h-full"
              />
            </div>
          </div>


        <div className="flex items-center gap-4">
          
       
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              className={`w-10 h-10 rounded-full border transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 p-0 shadow-[0_2px_10px_rgba(3,4,94,0.04)] hover:shadow-[0_4px_20px_rgba(44,127,255,0.15)] hover:-translate-y-0.5 active:translate-y-0 ${
                dark
                  ? notificationDropdownOpen
                    ? 'bg-black text-white border-white ring-2 ring-white/30'
                    : 'bg-black text-white border-white/30 hover:bg-white/10 hover:border-white'
                  : notificationDropdownOpen
                    ? 'bg-[var(--color-card,#ffffff)] text-[var(--color-primary,#2C7FFF)] border-[var(--color-primary,#2C7FFF)] ring-2 ring-[var(--color-primary,#2C7FFF)]/20'
                    : 'bg-[var(--color-card,#ffffff)] text-[var(--color-text,#03045E)] border-transparent'
              }`}
              title="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
        
              {unreadCount > 0 && (
                <span className={`absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 rounded-full ${dark ? 'border-black' : 'border-white'}`}></span>
              )}
            </button>

    
            {notificationDropdownOpen && (
              <div
                onClick={() => setNotificationDropdownOpen(false)}
                className={`absolute right-0 mt-3 w-80 sm:w-96 max-h-[520px] flex flex-col rounded-3xl shadow-[0_20px_60px_rgba(3,4,94,0.25)] border-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${dark ? 'bg-black border-white/50' : 'bg-[var(--color-card,#ffffff)] border-[var(--color-border,rgba(3,4,94,0.15))]'}`}
              >
                
                <div className={`relative flex-shrink-0 px-5 py-4 overflow-hidden ${dark ? 'bg-black' : 'bg-[var(--color-primary,#03045E)]'}`}>
                  <div className="relative flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${dark ? 'bg-black text-white border-white' : 'bg-[var(--color-button-text,#ffffff)] text-[var(--color-primary,#03045E)] border-[var(--color-button-text,#ffffff)]'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        {unreadCount > 0 && (
                          <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 ${dark ? 'border-black' : 'border-[var(--color-primary,#03045E)]'}`}></span>
                        )}
                      </div>
                      <div>
                        <h3 className={`font-black text-sm tracking-tight leading-tight ${dark ? 'text-white' : 'text-[var(--color-button-text,#ffffff)]'}`}>Notifications</h3>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-white/60' : 'text-[var(--color-button-text,#ffffff)]'}`}>Activity Feed</p>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 ${dark ? 'text-black bg-white' : 'text-[var(--color-primary,#03045E)] bg-[var(--color-button-text,#ffffff)]'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {unreadCount} NEW
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--color-border,rgba(3,4,94,0.2))] [&::-webkit-scrollbar-thumb]:rounded-full">
                  {notifications.length > 0 ? (
                    <div className="flex flex-col">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            if (!notif.is_read) handleMarkAsRead(notif.id);
                            
                            if (notif.type === 'application') {
                              setActiveTab('applications');
                            } else {
                              setActiveTab('overview');
                            }
                            setNotificationDropdownOpen(false);
                          }} 
                          className={`group relative px-5 py-4 border-b transition-all cursor-pointer flex gap-3 ${
                            !notif.is_read 
                              ? (dark ? 'bg-white/10 border-white/20 hover:bg-white/15' : 'bg-[var(--color-surface,#f4f4f4)] border-[var(--color-border,rgba(3,4,94,0.08))]') 
                              : (dark ? 'bg-black border-white/20 hover:bg-white/5' : 'bg-[var(--color-card,#ffffff)] border-[var(--color-border,rgba(3,4,94,0.08))] hover:bg-[var(--color-surface,#f4f4f4)]')
                          }`}
                        >
                          {!notif.is_read && (
                            <span className={`absolute left-0 top-0 bottom-0 w-1 ${dark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></span>
                          )}
                          <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm transition-colors ${
                            !notif.is_read 
                              ? (dark ? 'bg-white text-black border-white' : 'bg-[var(--color-primary,#03045E)] text-[var(--color-button-text,#ffffff)] border-[var(--color-primary,#03045E)]') 
                              : (dark ? 'bg-black text-white border-white/40' : 'bg-[var(--color-surface,#f4f4f4)] text-[var(--color-primary,#03045E)] border-[var(--color-border,rgba(3,4,94,0.15))]')
                          }`}>
                            {notif.type === 'application' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-sm leading-tight ${dark ? 'text-white' : 'text-[var(--color-text,#03045E)]'} ${!notif.is_read ? 'font-black' : 'font-bold'}`}>
                                {notif.title}
                              </h4>
                              {!notif.is_read && (
                                <span className={`shrink-0 w-2 h-2 rounded-full mt-1 ${dark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></span>
                              )}
                            </div>
                            <p className={`text-xs mt-1.5 leading-relaxed line-clamp-3 ${dark ? 'text-white/70' : 'text-[var(--color-text,#03045E)]'} ${!notif.is_read ? 'font-semibold' : 'font-medium'}`}>
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2">
                              <svg className={`w-3 h-3 ${dark ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className={`text-[10px] font-black tracking-widest uppercase ${dark ? 'text-white/60' : 'text-[var(--color-text,#03045E)]/70'}`}>
                                {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-10 text-center flex flex-col items-center justify-center ${dark ? 'bg-black' : 'bg-[var(--color-card,#ffffff)]'}`}>
                      <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                        <div className={`absolute inset-0 rounded-full ${dark ? 'bg-white/10' : 'bg-[var(--color-surface,#f4f4f4)]'}`}></div>
                        <div className={`relative w-14 h-14 rounded-full flex items-center justify-center ${dark ? 'bg-white text-black' : 'bg-[var(--color-primary,#03045E)] text-[var(--color-button-text,#ffffff)]'}`}>
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className={`text-sm font-black ${dark ? 'text-white' : 'text-[var(--color-text,#03045E)]'}`}>You're all caught up!</span>
                      <span className={`text-xs font-semibold mt-1.5 max-w-[200px] ${dark ? 'text-white/70' : 'text-[var(--color-text,#03045E)]'}`}>No new notifications at the moment. We'll let you know when something arrives.</span>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className={`flex-shrink-0 px-5 py-2.5 border-t text-center ${dark ? 'bg-black border-white/30' : 'bg-[var(--color-surface,#f4f4f4)] border-[var(--color-border,rgba(3,4,94,0.1))]'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-white/70' : 'text-[var(--color-text,#03045E)]'}`}>
                      {notifications.length} {notifications.length === 1 ? 'Notification' : 'Notifications'} Total
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:block relative" ref={dropdownRef}>
            <div 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
              className={`flex items-center gap-3 cursor-pointer p-1.5 rounded-xl border transition-all ${dark ? 'bg-black' : 'bg-[var(--color-card,#ffffff)]'} ${
                showProfileDropdown || activeTab === 'profile' || activeTab === 'settings' ? (dark ? 'border-white ring-2 ring-white/20' : 'border-[#2C7FFF] ring-2 ring-[#2C7FFF]/20') : (dark ? 'border-white/30' : 'border-[var(--color-border,rgba(3,4,94,0.1))]')
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold overflow-hidden shadow-md ${dark ? 'bg-white text-black' : 'bg-[var(--color-primary,#03045E)] text-[var(--color-button-text,#f4f4f4)]'}`}>
                {profile?.company_logo ? (
                  <img src={`http://localhost:5001${profile.company_logo}`} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile?.company_name ? profile.company_name.charAt(0).toUpperCase() : 'E'}</span>
                )}
              </div>
              <div className="text-left pr-2">
                <p className={`text-sm font-extrabold leading-tight ${dark ? 'text-white' : 'text-[var(--color-text,#03045E)]'}`}>
                  {profile?.company_name || profile?.contact_person || 'Employer'}
                </p>
                <p className={`text-xs font-semibold ${dark ? 'text-white' : 'text-[#2C7FFF]'}`}>Account Menu</p>
              </div>
            </div>


            {showProfileDropdown && (
              <div
                onClick={() => setShowProfileDropdown(false)}
                className={`absolute right-0 mt-3 w-64 rounded-3xl shadow-[0_20px_50px_rgba(3,4,94,0.25)] border-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${dark ? 'bg-black border-white/60' : 'bg-[var(--color-card,#ffffff)] border-[var(--color-border,rgba(3,4,94,0.15))]'}`}
              >
                
                <div className={`relative p-4 pb-5 bg-gradient-to-br border-b ${dark ? 'from-white/10 via-black to-black border-white/30' : 'from-[var(--color-primary,#2C7FFF)]/15 via-[var(--color-primary,#2C7FFF)]/5 to-[var(--color-card,#ffffff)] border-[var(--color-border,rgba(3,4,94,0.1))]'}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 shadow-md ${dark ? 'border-white' : 'border-[#2C7FFF]'}`}>
                        {profile?.company_logo ? (
                          <img src={`http://localhost:5001${profile.company_logo}`} alt="Company Logo" className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center font-black text-base ${dark ? 'bg-white text-black' : 'bg-[var(--color-primary,#03045E)] text-[var(--color-button-text,#ffffff)]'}`}>
                            {profile?.company_name ? profile.company_name.charAt(0).toUpperCase() : 'E'}
                          </div>
                        )}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 shadow-md ${dark ? 'border-black' : 'border-[var(--color-card,#ffffff)]'}`}></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${dark ? 'text-white' : 'text-[#2C7FFF]'}`}>Welcome back</p>
                      <p className={`text-sm font-black truncate leading-tight mt-0.5 ${dark ? 'text-white' : 'text-[var(--color-text,#03045E)]'}`}>
                        {profile?.company_name || 'Employer'}
                      </p>
                      <p className={`text-[10px] font-semibold truncate mt-0.5 ${dark ? 'text-white/60' : 'text-[var(--color-text,#03045E)]'}`}>
                        {profile?.email || 'employer@ablework.ph'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <p className={`px-3 pt-1.5 pb-2 text-[10px] font-black uppercase tracking-[0.15em] ${dark ? 'text-white/50' : 'text-[var(--color-text,#03045E)]'}`}>Account</p>

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfileDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-black transition-colors text-left cursor-pointer ${
                      activeTab === 'profile'
                        ? (dark ? 'bg-white text-black' : 'bg-[var(--color-primary,#03045E)] text-[var(--color-button-text,#ffffff)]')
                        : (dark ? 'text-white hover:bg-white/10' : 'text-[var(--color-text,#03045E)] hover:bg-[var(--color-primary,#2C7FFF)]/10')
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      activeTab === 'profile'
                        ? (dark ? 'bg-black/20 text-black' : 'bg-[var(--color-button-text,#ffffff)]/20 text-[var(--color-button-text,#ffffff)]')
                        : (dark ? 'bg-white/10 text-white' : 'bg-[var(--color-primary,#2C7FFF)]/15 text-[var(--color-primary,#2C7FFF)]')
                    }`}>
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <span className="truncate flex-1">Edit Profile</span>
                    {activeTab === 'profile' && <span className={`w-2 h-2 rounded-full ${dark ? 'bg-black' : 'bg-[var(--color-button-text,#ffffff)]'}`}></span>}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowProfileDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-black transition-colors text-left cursor-pointer ${
                      activeTab === 'settings'
                        ? (dark ? 'bg-white text-black' : 'bg-[var(--color-primary,#03045E)] text-[var(--color-button-text,#ffffff)]')
                        : (dark ? 'text-white hover:bg-white/10' : 'text-[var(--color-text,#03045E)] hover:bg-[var(--color-primary,#2C7FFF)]/10')
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      activeTab === 'settings'
                        ? (dark ? 'bg-black/20 text-black' : 'bg-[var(--color-button-text,#ffffff)]/20 text-[var(--color-button-text,#ffffff)]')
                        : (dark ? 'bg-white/10 text-white' : 'bg-[var(--color-primary,#2C7FFF)]/15 text-[var(--color-primary,#2C7FFF)]')
                    }`}>
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="truncate flex-1">Account Settings</span>
                    {activeTab === 'settings' && <span className={`w-2 h-2 rounded-full ${dark ? 'bg-black' : 'bg-[var(--color-button-text,#ffffff)]'}`}></span>}
                  </button>

                  <div className={`h-px my-2 mx-2 ${dark ? 'bg-white/30' : 'bg-[var(--color-border,rgba(3,4,94,0.1))]'}`}></div>

                  <button
                    disabled={isLoggingOut}
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setShowLogoutConfirm(true);
                    }}
                    style={{ color: '#DC2626' }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-black transition-colors text-left cursor-pointer disabled:opacity-50"
                  >
                    <div
                      style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    >
                      {isLoggingOut ? (
                        <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="truncate block">{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="block md:hidden relative">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle Menu"
              className={`p-2.5 rounded-2xl transition-all shadow-md flex items-center justify-center cursor-pointer ${dark ? 'bg-white text-black' : 'bg-[var(--color-primary,#03045E)] text-[var(--color-button-text,#f4f4f4)]'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>


            {showMobileMenu && (
              <div
                onClick={() => setShowMobileMenu(false)}
                className={`absolute right-0 mt-3 w-[calc(100vw-3rem)] max-w-sm rounded-3xl shadow-2xl border-2 p-5 z-50 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200 ${dark ? 'bg-black border-white/60' : 'bg-[var(--color-card,#ffffff)] border-[var(--color-border,rgba(3,4,94,0.15))]'}`}
              >
                
  
                <div 
                  onClick={() => {
                    setActiveTab('profile');
                    setShowMobileMenu(false);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br cursor-pointer transition-all border ${dark ? 'from-white/10 via-black to-black border-white/40' : 'from-[var(--color-primary,#2C7FFF)]/15 via-[var(--color-primary,#2C7FFF)]/5 to-[var(--color-surface,#f4f4f4)] border-[var(--color-border,rgba(3,4,94,0.1))]'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold overflow-hidden shadow-md flex-shrink-0 ${dark ? 'bg-white text-black' : 'bg-[var(--color-primary,#03045E)] text-[var(--color-button-text,#f4f4f4)]'}`}>
                    {profile?.company_logo ? (
                      <img src={`http://localhost:5001${profile.company_logo}`} alt="Company Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span>{profile?.company_name ? profile.company_name.charAt(0).toUpperCase() : 'E'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-extrabold truncate ${dark ? 'text-white' : 'text-[var(--color-text,#03045E)]'}`}>
                      {profile?.company_name || profile?.contact_person || 'Employer'}
                    </p>
                    <p className={`text-xs font-semibold ${dark ? 'text-white' : 'text-[#2C7FFF]'}`}>View & Edit Profile</p>
                  </div>
                </div>

            
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowMobileMenu(false);
                  }}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold transition-all text-sm w-full border shadow-sm cursor-pointer ${
                    activeTab === 'settings' 
                      ? 'bg-[#2C7FFF] text-black border-[#2C7FFF]' 
                      : (dark ? 'bg-black text-white border-white/30 hover:bg-white/10' : 'bg-[var(--color-surface,#f4f4f4)] text-[var(--color-text,#03045E)] border-[var(--color-border,rgba(3,4,94,0.1))] hover:bg-[var(--color-primary,#2C7FFF)]/10')
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="flex-1 text-left">Account Settings</span>
                </button>


                <div className="flex flex-col space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {[
                    { id: 'overview', label: 'Analytics Dashboard', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )},
                    { id: 'post-job', label: 'Post a New Job', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )},
                    { id: 'jobs', label: 'My Job Listings', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    )},
                    { id: 'applications', label: 'Review Applicants', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold transition-all text-sm w-full relative group border-2 shadow-sm cursor-pointer ${
                            isActive 
                              ? (dark ? 'bg-white text-black border-white' : 'bg-[var(--color-primary,#03045E)] text-[var(--color-button-text,#ffffff)] border-[var(--color-primary,#03045E)]') 
                              : (dark ? 'bg-black text-white border-white/30 hover:bg-white/10' : 'bg-[var(--color-card,#ffffff)] text-[var(--color-text,#03045E)] border-[var(--color-border,rgba(3,4,94,0.2))] hover:bg-[var(--color-primary,#2C7FFF)]/10')
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-all ${
                            isActive 
                              ? (dark ? 'bg-black/20 text-black' : 'bg-[var(--color-button-text,#ffffff)]/20 text-[var(--color-button-text,#ffffff)]') 
                              : (dark ? 'bg-white/10 text-white' : 'bg-[var(--color-primary,#2C7FFF)]/15 text-[var(--color-primary,#2C7FFF)]')
                        }`}>
                          {tabItem.icon}
                        </div>
                        <span className="flex-1 text-left truncate">{tabItem.label}</span>
                        {isActive && (
                            <span className={`w-1.5 h-6 rounded-full absolute right-2 ${dark ? 'bg-black/40' : 'bg-[var(--color-button-text,#ffffff)]/60'}`}></span>
                        )}
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
                  style={{ backgroundColor: '#FEE2E2', color: '#DC2626', borderColor: '#FCA5A5' }}
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl font-extrabold text-sm transition-colors border-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                    {isLoggingOut ? (
                      <svg className="w-5 h-5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                      </svg>
                    )}
                    {isLoggingOut ? 'Logging out...' : 'Logout Account'}
                </button>

              </div>
            )}
          </div>
        </div>
      </div>
      </header>

      <button
        onClick={() => setShowDesktopSidebar((prev) => !prev)}
        aria-label="Toggle sidebar"
        aria-expanded={showDesktopSidebar}
        title={showDesktopSidebar ? 'Hide navigation' : 'Show navigation'}
        className={`hidden md:flex fixed top-[4.5rem] left-4 z-40 w-11 h-11 items-center justify-center rounded-2xl border-2 shadow-md transition-all duration-200 cursor-pointer ${
          dark
            ? 'bg-black text-white border-white hover:bg-white/10'
            : 'bg-[var(--color-card,#ffffff)] text-[var(--color-primary,#03045E)] border-[var(--color-border,rgba(3,4,94,0.15))] hover:bg-[var(--color-primary,#2C7FFF)]/10'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          {showDesktopSidebar ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

    
      <div className={`flex flex-col md:flex-row flex-1 min-h-screen pt-16 ${dark ? 'bg-black' : ''}`}>
        

        {showDesktopSidebar && (
        <aside className={`hidden md:flex w-72 flex-col z-10 border-r px-4 pt-16 pb-4 justify-between shadow-sm flex-shrink-0 fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto ${dark ? 'bg-black border-white' : 'bg-[var(--color-card,#ffffff)] border-[var(--color-border,rgba(3,4,94,0.1))]'}`}>
          <nav className="flex flex-col space-y-3 w-full">

            {[
              { id: 'overview', label: 'Analytics Dashboard', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )},
              { id: 'post-job', label: 'Post a New Job', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
              { id: 'jobs', label: 'My Job Listings', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              )},
              { id: 'applications', label: 'Review Applicants', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            ].map((tabItem) => {
              const isActive = activeTab === tabItem.id;
              return (
                <button 
                  key={tabItem.id} 
                  onClick={() => setActiveTab(tabItem.id)} 
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl font-black transition-all duration-200 text-sm group relative cursor-pointer border-2 shadow-sm"
                  style={isActive ? (dark ? {
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    borderColor: '#ffffff'
                  } : {
                    backgroundColor: 'var(--color-primary, #2C7FFF)',
                    color: 'var(--color-button-text, #ffffff)',
                    borderColor: 'var(--color-primary, #2C7FFF)'
                  }) : (dark ? {
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    borderColor: 'rgba(255,255,255,0.3)'
                  } : {
                    backgroundColor: 'var(--color-card, #ffffff)',
                    color: 'var(--color-text, #03045E)',
                    borderColor: 'var(--color-border, rgba(3,4,94,0.2))'
                  })}
                >
                  <div 
                    className="p-2 rounded-xl transition-all flex items-center justify-center"
                    style={isActive ? (dark ? {
                      backgroundColor: '#000000',
                      color: '#ffffff'
                    } : {
                      backgroundColor: 'var(--color-button-text, #ffffff)',
                      color: 'var(--color-primary, #2C7FFF)'
                    }) : (dark ? {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#ffffff'
                    } : {
                      backgroundColor: 'var(--color-surface, #f4f4f4)',
                      color: 'var(--color-text, #03045E)'
                    })}
                  >
                    {tabItem.icon}
                  </div>
                  <span className="tracking-wide flex-1 text-left">{tabItem.label}</span>
                  {isActive && (
                    <div 
                      className="w-1.5 h-6 rounded-full absolute right-2"
                      style={{ backgroundColor: dark ? '#000000' : 'var(--color-button-text, #ffffff)' }}
                    ></div>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>
        )}


        <main className={`flex-1 p-6 md:p-10 relative ${showDesktopSidebar ? 'md:ml-72' : ''} ${dark ? 'bg-black text-white' : 'bg-[var(--color-surface,#f4f4f4)] text-[var(--color-text,#03045E)]'}`}>

          {isRejected && (
            <div className={`mb-8 p-6 sm:p-8 border-2 rounded-[2rem] shadow-sm flex flex-col gap-5 animate-fadeIn ${dark ? 'bg-black border-white' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${dark ? 'bg-white text-black' : 'bg-red-100 text-red-600'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <div>
                  <h2 className={`text-xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-red-800'}`}>Account Verification Failed</h2>
                  <p className={`text-sm font-semibold mt-0.5 ${dark ? 'text-white/70' : 'text-red-700/80'}`}>Your platform access is currently suspended. Please review the admin feedback below.</p>
                </div>
              </div>
              <div className={`p-5 rounded-2xl border shadow-inner ${dark ? 'bg-black border-white/40' : 'bg-white border-red-100'}`}>
                <h3 className={`text-xs font-extrabold uppercase tracking-wider mb-2 ${dark ? 'text-white/60' : 'text-red-400'}`}>Admin Feedback</h3>
                <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-[#03045E]'}`}>{profile.rejection_reason || "Your verification document did not meet platform standards."}</p>
              </div>
              <hr className={dark ? 'border-white/40' : 'border-red-200/50'} />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className={`text-sm font-extrabold ${dark ? 'text-white' : 'text-red-800'}`}>Ready to try again?</h3>
                  {!canResubmit ? (
                    <p className={`text-xs font-semibold mt-1 ${dark ? 'text-white/70' : 'text-red-600'}`}>Due to security policies, you must wait <span className={`font-black ${dark ? 'text-white' : 'text-red-800'}`}>{daysLeft} days</span> before uploading a new document.</p>
                  ) : (
                    <p className={`text-xs font-semibold mt-1 ${dark ? 'text-white' : 'text-emerald-600'}`}>Your cooldown period has ended. You may now resubmit your documents.</p>
                  )}
                </div>
                <button 
                  disabled={!canResubmit}
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-3 rounded-xl font-extrabold text-sm transition-all shadow-sm flex items-center gap-2 ${canResubmit ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer' : 'bg-red-200 text-red-400 cursor-not-allowed opacity-70'}`}
                >
                  {!canResubmit && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>}
                  {canResubmit ? 'Go to Profile to Resubmit' : `Locked for ${daysLeft} Days`}
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
        </main>
      </div>


      <div className={`transition-all duration-300 ${showDesktopSidebar ? 'md:ml-72' : ''}`}>
        <EmployerFooter activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
    </div>
  );
}