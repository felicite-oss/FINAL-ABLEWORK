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
  const [isOpen, setIsOpen] = useState(false); 
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false); 
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); 
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null); 

  // Shared Data States
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [allJobs, setAllJobs] = useState([]); 
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
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
        const profileRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/profile`);
        const profileData = await profileRes.json();
        if (profileRes.ok) setProfile({ ...profileData, user_id: storedUser.id });

        const matchesRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/matches`);
        const matchesData = await matchesRes.json();
        if (matchesRes.ok) setMatches(matchesData);

        const trackerRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/applications`);
        const trackerData = await trackerRes.json();
        if (trackerRes.ok) setApplications(trackerData);

        const allJobsRes = await fetch('http://localhost:5001/api/jobs');
        const allJobsData = await allJobsRes.json();
        if (allJobsRes.ok) setAllJobs(allJobsData);

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

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('user');
      navigate('/login');
    }, 2000);
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f4f4] relative overflow-x-hidden">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 transition-all duration-300">
        <div className="bg-white/90 border border-[#03045E]/10 px-6 py-8 sm:px-8 sm:py-10 rounded-3xl shadow-[0_20px_50px_rgba(3,4,94,0.1)] flex flex-col items-center max-w-sm w-full mx-auto transform animate-in fade-in zoom-in-95 duration-300">
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

  const isRejected = profile?.verification_status === 'Rejected';
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
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

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4] selection:bg-[#2C7FFF]/20 selection:text-[#03045E] relative overflow-x-hidden w-full max-w-[100vw]">
      
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

      <header className="w-full bg-[#f4f4f4] border-b border-[#03045E]/10 fixed top-0 left-0 z-50 transition-all duration-300">
        <div className="w-full h-20 px-3 sm:px-6 md:pr-12 flex items-center justify-between max-w-[1700px] mx-auto box-border">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-6 min-w-0">
            <div className="flex items-center flex-shrink-0 cursor-pointer overflow-hidden max-w-[140px] sm:max-w-none" onClick={() => setActiveTab('overview')}>
              <img
                src={headerLogo}
                alt="AbleWork Logo"
                className="h-14 sm:h-20 md:h-24 w-auto object-contain max-h-full hover:opacity-95 transition-opacity"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            
            {/* --- NOTIFICATION BELL --- */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#03045E] border transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 p-0 shadow-[0_2px_10px_rgba(3,4,94,0.04)] hover:shadow-[0_4px_20px_rgba(44,127,255,0.15)] hover:-translate-y-0.5 active:translate-y-0 ${
                  notificationDropdownOpen ? 'border-[#2C7FFF] ring-2 ring-[#2C7FFF]/20 text-[#2C7FFF]' : 'border-transparent'
                }`}
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Unread Badge */}
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[400px] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-[#03045E]/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                  <div className="px-5 py-3 border-b border-[#03045E]/10 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                    <h3 className="font-extrabold text-[#03045E] text-base">Notifications</h3>
                    {unreadCount > 0 && <span className="text-xs font-bold text-[#2C7FFF] bg-[#2C7FFF]/10 px-2.5 py-1 rounded-full">{unreadCount} New</span>}
                  </div>
                  <div className="flex flex-col">
                    {notifications.length > 0 ? notifications.map(notif => (
                      <div 
                            key={notif.id} 
                            onClick={() => {
                              if (!notif.is_read) handleMarkAsRead(notif.id);
                              
                              if (notif.type === 'update' || notif.type === 'application') {
                                setActiveTab('tracker');
                              } else if (notif.type === 'match') {
                                setActiveTab('matches');
                              } else {
                                setActiveTab('overview');
                              }
                              setNotificationDropdownOpen(false);
                            }} 
                            className={`p-5 border-b border-[#03045E]/5 transition-colors cursor-pointer ${!notif.is_read ? 'bg-[#2C7FFF]/5 hover:bg-[#2C7FFF]/10' : 'bg-white hover:bg-gray-50'}`}
                          >
                            <h4 className={`text-sm font-extrabold ${!notif.is_read ? 'text-[#03045E]' : 'text-gray-500'}`}>{notif.title}</h4>
                            <p className={`text-xs mt-1.5 leading-relaxed ${!notif.is_read ? 'text-[#03045E]/80 font-semibold' : 'text-gray-500'}`}>{notif.message}</p>
                            <span className="text-[10px] text-gray-400 mt-2 block font-extrabold tracking-wider uppercase">
                              {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )) : (
                        <div className="p-8 text-center flex flex-col items-center justify-center">
                          <div className="w-12 h-12 bg-[#f4f4f4] rounded-full flex items-center justify-center mb-3 text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                          </div>
                          <span className="text-sm font-bold text-[#03045E]">You're all caught up!</span>
                          <span className="text-xs font-semibold text-gray-500 mt-1">No new notifications at the moment.</span>
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown (Desktop Only) */}
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`w-10 h-10 rounded-full overflow-hidden bg-white text-[#03045E] border transition-all duration-200 cursor-pointer shadow-[0_2px_10px_rgba(3,4,94,0.04)] hover:shadow-[0_4px_20px_rgba(44,127,255,0.15)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center shrink-0 p-0 ${
                  profileDropdownOpen || activeTab === 'profile' || activeTab === 'settings' ? 'border-[#2C7FFF] ring-2 ring-[#2C7FFF]/20' : 'border-transparent'
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
                  
                  {/* --- NEW: SETTINGS OPTION --- */}
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#03045E] hover:bg-[#2C7FFF]/10 hover:text-[#2C7FFF] transition-colors text-left cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">Settings</span>
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
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-lg border-b border-[#03045E]/10 ${
            isOpen ? 'max-h-[600px] opacity-100 shadow-2xl' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="w-full">
            <nav className="flex flex-col px-3 sm:px-6 py-4 sm:py-6 gap-2 text-[15px] sm:text-[16px] font-medium text-[#03045E]">
              
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

              {/* --- NEW: SETTINGS OPTION FOR MOBILE NAV --- */}
              <button
                onClick={() => { setActiveTab('settings'); setIsOpen(false); }}
                className={`flex items-center gap-3 px-3.5 sm:px-4 py-3 rounded-xl sm:rounded-2xl bg-white text-[#03045E] text-xs sm:text-sm font-bold border transition-all cursor-pointer text-left shadow-sm ${
                  activeTab === 'settings' ? 'border-[#2C7FFF] bg-[#2C7FFF]/5' : 'border-[#03045E]/10 hover:border-[#2C7FFF]'
                }`}
              >
                <div className="shrink-0 flex items-center justify-center border-none w-6 h-6 rounded-full overflow-hidden bg-[#03045E]/5 text-[#03045E]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <span className="truncate">Settings</span>
              </button>

              <div className="h-px bg-[#03045E]/10 my-1"></div>

              {[
                { id: 'overview', label: 'Overview' },
                { id: 'matches', label: 'Smart Matches' },
                { id: 'explore-jobs', label: 'Explore Jobs' },
                { id: 'tracker', label: 'Job Tracker' }
                // Removed 'settings' from the main list here!
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
      
      <div className="flex flex-col w-full max-w-[1700px] mx-auto min-w-0 box-border pt-20 min-h-screen">
        <div className="flex flex-col md:flex-row flex-1 w-full min-w-0">
          
          <aside className="hidden md:flex shrink-0 flex-col z-10 bg-white/70 backdrop-blur-xl border-r border-[#03045E]/10 w-80 shadow-[4px_0_24px_rgba(3,4,94,0.02)]">
            <div className="w-full flex flex-col h-full min-w-0">
              <nav className="flex-1 px-5 py-8 flex flex-col gap-3.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'matches', label: 'Smart Matches' },
                  { id: 'explore-jobs', label: 'Explore Jobs' },
                  { id: 'tracker', label: 'Job Tracker' }
                  // Removed 'settings' from the desktop sidebar array here!
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
                    {activeTab === item.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2C7FFF] rounded-r-full shadow-[0_0_8px_#2C7FFF]"></div>
                    )}

                    <div className={`p-2.5 rounded-xl transition-colors duration-200 shrink-0 ${
                      activeTab === item.id ? 'bg-white/10 text-[#2C7FFF]' : 'bg-[#03045E]/5 text-[#03045E] group-hover:bg-[#2C7FFF]/10 group-hover:text-[#2C7FFF]'
                    }`}>
                      {item.id === 'overview' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                      )}
                      {item.id === 'matches' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                      )}
                      {item.id === 'explore-jobs' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      )}
                      {item.id === 'tracker' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                      )}
                    </div>
                    <span className="text-base tracking-wide font-semibold truncate">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1 p-3 sm:p-6 md:p-10 relative w-full min-w-0 transition-all duration-300 flex flex-col box-border">
            <div className="flex items-start gap-4 w-full min-w-0">
              <div className="w-full flex-1 min-w-0 overflow-x-hidden">

                {isRejected && (
                  <div className="mb-8 p-6 sm:p-8 bg-red-50 border-2 border-red-200 rounded-[2rem] shadow-sm flex flex-col gap-5 animate-fadeIn">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-red-800 tracking-tight">Account Verification Failed</h2>
                        <p className="text-sm font-semibold text-red-700/80 mt-0.5">Your platform access is currently suspended. Please review the admin feedback below.</p>
                      </div>
                    </div>
                    <div className="p-5 bg-white rounded-2xl border border-red-100 shadow-inner">
                      <h3 className="text-xs font-extrabold text-red-400 uppercase tracking-wider mb-2">Admin Feedback</h3>
                      <p className="text-sm font-bold text-[#03045E]">{profile.rejection_reason || "Your verification document did not meet platform standards."}</p>
                    </div>
                    <hr className="border-red-200/50" />
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-red-800">Ready to try again?</h3>
                        {!canResubmit ? (
                          <p className="text-xs font-semibold text-red-600 mt-1">Due to security policies, you must wait <span className="font-black text-red-800">{daysLeft} days</span> before uploading a new document.</p>
                        ) : (
                          <p className="text-xs font-semibold text-emerald-600 mt-1">Your cooldown period has ended. You may now resubmit your documents.</p>
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
                
                {activeTab === 'overview' && profile && (
                  <ApplicantOverview profile={profile} matches={matches} jobs={allJobs} matchesCount={matches.length} applications={applications} setActiveTab={setActiveTab} />
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

      <div className="w-full">
        <ApplicantFooter activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}