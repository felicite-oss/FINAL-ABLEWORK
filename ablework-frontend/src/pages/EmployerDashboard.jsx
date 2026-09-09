import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Import all child components
import EmployerOverview from '../components/Employer/EmployerOverview';
import EmployerPostJob from '../components/Employer/EmployerPostJob';
import EmployerMyJobs from '../components/Employer/EmployerMyJobs';
import EmployerApplications from '../components/Employer/EmployerApplications';
import EmployerProfile from '../components/Employer/EmployerProfile';
import EmployerAccountSettings from '../components/Employer/EmployerAccountSettings';
import FinalLogo from '../assets/Final.png';

// 2. Footer Sub-Pages & Footer Component
function EmployerPolicy({ onBack }) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-[#03045E]/10 shadow-sm animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#03045E]/10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#03045E]">Employer Privacy Policy</h2>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-[#03045E]/5 text-[#03045E] hover:bg-[#2C7FFF] hover:text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
        >
          Back to Overview
        </button>
      </div>
      <div className="space-y-4 text-[#03045E]/80 text-sm sm:text-base leading-relaxed">
        <p>Your privacy is paramount to AbleWork. This policy outlines how we handle corporate data, recruiter details, and applicant communication records securely and transparently.</p>
        <p>We utilize advanced encryption protocols to safeguard your company data and ensure compliance with standard data protection regulations.</p>
      </div>
    </div>
  );
}

function EmployerTerms({ onBack }) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-[#03045E]/10 shadow-sm animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#03045E]/10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#03045E]">Employer Terms of Service</h2>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-[#03045E]/5 text-[#03045E] hover:bg-[#2C7FFF] hover:text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
        >
          Back to Overview
        </button>
      </div>
      <div className="space-y-4 text-[#03045E]/80 text-sm sm:text-base leading-relaxed">
        <p>By posting jobs on AbleWork, employers agree to maintain fair, non-discriminatory hiring practices and provide accurate company profile details.</p>
        <p>Violation of community standards or discriminatory behavior against applicants may result in the suspension of corporate posting privileges.</p>
      </div>
    </div>
  );
}

function EmployerContact({ onBack }) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-[#03045E]/10 shadow-sm animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#03045E]/10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#03045E]">Employer Support & Contact</h2>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-[#03045E]/5 text-[#03045E] hover:bg-[#2C7FFF] hover:text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
        >
          Back to Overview
        </button>
      </div>
      <div className="space-y-4 text-[#03045E]/80 text-sm sm:text-base leading-relaxed">
        <p>Need assistance with your job listings or candidate screening? Our support team is here to help you.</p>
        <div className="p-4 bg-[#f4f4f4] rounded-2xl border border-[#03045E]/10 space-y-2 text-[#03045E]">
          <p><strong>Email Support:</strong> employers@ablework.com</p>
          <p><strong>Partner Helpline:</strong> +1 (800) 555-ABLE</p>
          <p><strong>Hours:</strong> Monday – Friday, 9:00 AM – 6:00 PM EST</p>
        </div>
      </div>
    </div>
  );
}

function EmployerFooter({ activeTab, setActiveTab }) {
  return (
    <footer className="w-full bg-white border-t border-[#03045E]/10 py-6 px-4 sm:px-10 mt-auto flex-shrink-0">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#03045E]/70">
        <p>© {new Date().getFullYear()} AbleWork Inc. Employer Portal. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-6 font-bold">
          <button 
            onClick={() => setActiveTab('employer-contact')} 
            className={`transition-colors cursor-pointer ${activeTab === 'employer-contact' ? 'text-[#2C7FFF]' : 'hover:text-[#2C7FFF]'}`}
          >
            Contact Support
          </button>
          <button 
            onClick={() => setActiveTab('employer-policy')} 
            className={`transition-colors cursor-pointer ${activeTab === 'employer-policy' ? 'text-[#2C7FFF]' : 'hover:text-[#2C7FFF]'}`}
          >
            Privacy Policy
          </button>
          <button 
            onClick={() => setActiveTab('employer-terms')} 
            className={`transition-colors cursor-pointer ${activeTab === 'employer-terms' ? 'text-[#2C7FFF]' : 'hover:text-[#2C7FFF]'}`}
          >
            Terms of Service
          </button>
        </div>
      </div>
    </footer>
  );
}

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Shared Data States
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ activeJobs: 0, pendingApps: 0, shortlistedApps: 0, recentActivity: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Dropdown, Mobile Menu, and Logout Loading States
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // --- ADDED: Close dropdowns when clicking outside ---
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

  // Initial Data Fetch
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

  // Function to refresh data after an action (like posting a job or editing a profile)
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

  // Logout handler with 2 seconds loading screen
  const handleLogout = () => {
    setShowProfileDropdown(false);
    setShowMobileMenu(false);
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('user');
      navigate('/login');
    }, 2000);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold bg-[#f4f4f4] text-[#03045E]">Loading Employer Workspace...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center font-bold bg-[#f4f4f4] text-red-500">{error}</div>;

  if (isLoggingOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f4f4]">
        <div className="w-16 h-16 border-4 border-[#2C7FFF] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-[#03045E] text-lg">Logging out...</p>
      </div>
    );
  }

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
    <div className="min-h-screen flex flex-col bg-[#f4f4f4] text-[#03045E] w-full overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <header className="w-full bg-[#f4f4f4] border-b border-[#03045E]/10 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#03045E]/10 flex items-center justify-center overflow-hidden shadow-md shadow-[#03045E]/10">
            <img src={FinalLogo} alt="AbleWork Logo" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#03045E]">AbleWork</h2>
            <p className="text-xs mt-0.5 text-[#2C7FFF] font-bold uppercase tracking-wider">Employer Portal</p>
          </div>
        </div>

        {/* RIGHT SIDE OF HEADER */}
        <div className="flex items-center gap-4">
          
          {/* --- REPLACED: NEW NOTIFICATION BELL & DROPDOWN --- */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              className={`w-10 h-10 rounded-full bg-white text-[#03045E] border transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 p-0 shadow-[0_2px_10px_rgba(3,4,94,0.04)] hover:shadow-[0_4px_20px_rgba(44,127,255,0.15)] hover:-translate-y-0.5 active:translate-y-0 ${
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
                          
                          // --- DIRECT NAVIGATION LOGIC ---
                          // Send employers straight to the applications management tab
                          if (notif.type === 'application') {
                            setActiveTab('applications');
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
          {/* --- END OF REPLACED NOTIFICATION BELL --- */}

          {/* Desktop Profile Section with Dropdown Menu */}
          <div className="hidden md:block relative" ref={dropdownRef}>
            <div 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
              className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl bg-white border border-[#03045E]/10 hover:bg-[#2C7FFF]/10 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#03045E] text-[#f4f4f4] flex items-center justify-center font-bold overflow-hidden shadow-md shadow-[#03045E]/20">
                {/* --- FIXED: Fetches Real Company Logo for Desktop --- */}
                {profile?.company_logo ? (
                  <img src={`http://localhost:5001${profile.company_logo}`} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile?.company_name ? profile.company_name.charAt(0).toUpperCase() : 'E'}</span>
                )}
              </div>
              <div className="text-left pr-2">
                <p className="text-sm font-extrabold text-[#03045E] leading-tight">
                  {profile?.company_name || profile?.contact_person || 'Employer'}
                </p>
                <p className="text-xs text-[#2C7FFF] font-semibold">View Profile</p>
              </div>
            </div>

            {/* Desktop Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#f4f4f4] rounded-2xl shadow-xl border border-[#03045E]/10 py-2 z-50">
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#03045E] hover:bg-[#2C7FFF]/10 hover:text-[#2C7FFF] transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button (Only visible on mobile screens) */}
          <div className="block md:hidden relative">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle Menu"
              className="p-2.5 rounded-2xl bg-[#03045E] text-[#f4f4f4] hover:bg-[#2C7FFF] transition-all shadow-md shadow-[#03045E]/20 flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Unique Mobile Hamburger Drawer/Dropdown */}
            {showMobileMenu && (
              <div className="absolute right-0 mt-3 w-[calc(100vw-3rem)] max-w-sm bg-white rounded-3xl shadow-2xl border border-[#03045E]/10 p-5 z-50 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
                
                {/* Profile Header Inside Hamburger */}
                <div 
                  onClick={() => {
                    setActiveTab('profile');
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#f4f4f4] cursor-pointer hover:bg-[#2C7FFF]/10 transition-all border border-[#03045E]/10"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#03045E] text-[#f4f4f4] flex items-center justify-center font-bold overflow-hidden shadow-md flex-shrink-0">
                    {/* --- FIXED: Fetches Real Company Logo for Mobile --- */}
                    {profile?.company_logo ? (
                      <img src={`http://localhost:5001${profile.company_logo}`} alt="Company Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span>{profile?.company_name ? profile.company_name.charAt(0).toUpperCase() : 'E'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-[#03045E] truncate">
                      {profile?.company_name || profile?.contact_person || 'Employer'}
                    </p>
                    <p className="text-xs text-[#2C7FFF] font-semibold">View & Edit Profile</p>
                  </div>
                </div>

                {/* Sidebar Navigation Tabs Inside Hamburger */}
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
                    )},
                    { id: 'settings', label: 'Account Settings', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold transition-all text-sm w-full relative group border border-[#03045E]/30 shadow-sm ${
                            isActive 
                              ? 'bg-gradient-to-r from-[#03045E] to-[#07098c] text-white shadow-lg shadow-[#03045E]/25' 
                              : 'bg-white text-[#03045E]/80 hover:bg-[#2C7FFF]/10 hover:text-[#2C7FFF]'
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-all ${
                            isActive ? 'bg-[#2C7FFF] text-white shadow' : 'bg-[#f4f4f4] text-[#03045E] group-hover:bg-[#2C7FFF] group-hover:text-white'
                        }`}>
                          {tabItem.icon}
                        </div>
                        <span className="flex-1 text-left truncate">{tabItem.label}</span>
                        {isActive && (
                            <span className="w-1.5 h-6 bg-[#2C7FFF] rounded-full absolute right-2"></span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Logout Button Inside Hamburger */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-sm transition-colors border border-red-200 shadow-sm"
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout Account
                </button>

              </div>
            )}
          </div>
        </div>
      </header>

      {/* PAGE BODY CONTAINER WRAPPING SIDEBAR & CONTENT */}
      <div className="flex flex-col md:flex-row flex-1 min-h-screen">
        
        {/* REDESIGNED DESKTOP SIDEBAR NAVIGATION */}
        <aside className="hidden md:flex w-72 flex-col z-10 bg-white border-r border-[#03045E]/10 p-4 justify-between shadow-sm flex-shrink-0">
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              )},
              { id: 'applications', label: 'Review Applicants', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )},
              { id: 'settings', label: 'Account Settings', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            ].map((tabItem) => {
              const isActive = activeTab === tabItem.id;
              return (
                <button 
                  key={tabItem.id} 
                  onClick={() => setActiveTab(tabItem.id)} 
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition-all duration-200 text-sm group relative cursor-pointer border border-[#03045E]/30 shadow-sm ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#03045E] to-[#07098c] text-white shadow-md shadow-[#03045E]/20' 
                      : 'bg-white text-[#03045E]/80 hover:bg-[#2C7FFF]/10 hover:text-[#2C7FFF]'
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-all ${
                    isActive ? 'bg-[#2C7FFF] text-white shadow' : 'bg-[#f4f4f4] text-[#03045E] group-hover:bg-[#2C7FFF] group-hover:text-white'
                  }`}>
                    {tabItem.icon}
                  </div>
                  <span className="tracking-wide flex-1 text-left">{tabItem.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-6 bg-[#2C7FFF] rounded-full absolute right-2"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 md:p-10 relative bg-[#f4f4f4] text-[#03045E]">

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
          
          {activeTab === 'overview' && profile && <EmployerOverview profile={profile} stats={stats} setActiveTab={setActiveTab} />}
          {activeTab === 'post-job' && <EmployerPostJob profile={profile} refreshData={refreshJobsAndStats} setActiveTab={setActiveTab} />}
          {activeTab === 'jobs' && <EmployerMyJobs jobs={jobs} refreshData={refreshJobsAndStats} />}
          {activeTab === 'applications' && profile && <EmployerApplications profile={profile} refreshStats={refreshJobsAndStats} />}
          {activeTab === 'profile' && profile && <EmployerProfile profile={profile} refreshData={refreshJobsAndStats} />}
          {activeTab === 'settings' && profile && <EmployerAccountSettings profile={profile} />}
          
          {/* Footer View Sub-pages */}
          {activeTab === 'employer-policy' && <EmployerPolicy onBack={() => setActiveTab('overview')} />}
          {activeTab === 'employer-terms' && <EmployerTerms onBack={() => setActiveTab('overview')} />}
          {activeTab === 'employer-contact' && <EmployerContact onBack={() => setActiveTab('overview')} />}
        </main>
      </div>

      {/* FOOTER BAR PLACED CLEANLY AT THE VERY BOTTOM */}
      <EmployerFooter activeTab={activeTab} setActiveTab={setActiveTab} />
      
    </div>
  );
}