import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Import all child components
import EmployerOverview from '../components/Employer/EmployerOverview';
import EmployerPostJob from '../components/Employer/EmployerPostJob';
import EmployerMyJobs from '../components/Employer/EmployerMyJobs';
import EmployerApplications from '../components/Employer/EmployerApplications';
import EmployerProfile from '../components/Employer/EmployerProfile';
import EmployerAccountSettings from '../components/Employer/EmployerAccountSettings';
import FinalLogo from '../assets/Final.png';

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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#03045E]">Loading Employer Workspace...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">{error}</div>;

  if (isLoggingOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F4F4]">
        <div className="w-16 h-16 border-4 border-[#2C7FFF] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-[#03045E] text-lg">Logging out...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
      
      {/* HEADER SECTION */}
      <header className="w-full bg-white border-b border-[#03045E]/10 px-6 py-4 flex items-center justify-between shadow-sm z-20">
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
          {/* Notification SVG Icon (Always visible) */}
          <button 
            type="button" 
            className="p-2 rounded-xl text-[#03045E] hover:bg-[#2C7FFF]/10 hover:text-[#2C7FFF] transition-colors relative"
            aria-label="Notifications"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2C7FFF] rounded-full"></span>
          </button>

          {/* Desktop Profile Section with Dropdown Menu */}
          <div className="hidden md:block relative">
            <div 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
              className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-[#2C7FFF]/10 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#03045E] text-white flex items-center justify-center font-bold overflow-hidden shadow-md shadow-[#03045E]/20">
                {profile?.company_logo ? (
                  <img src={profile.company_logo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile?.company_name ? profile.company_name.charAt(0).toUpperCase() : 'E'}</span>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-extrabold text-[#03045E] leading-tight">
                  {profile?.company_name || profile?.contact_person || 'Employer'}
                </p>
                <p className="text-xs text-[#2C7FFF] font-semibold">View Profile</p>
              </div>
            </div>

            {/* Desktop Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#03045E]/10 py-2 z-50">
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
              className="p-2.5 rounded-2xl bg-[#03045E] text-white hover:bg-[#2C7FFF] transition-all shadow-md shadow-[#03045E]/20 flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Unique Mobile Hamburger Drawer/Dropdown - Sized and Aligned Correctly */}
            {showMobileMenu && (
              <div className="absolute right-0 mt-3 w-[calc(100vw-3rem)] max-w-sm bg-white rounded-3xl shadow-2xl border border-[#03045E]/10 p-5 z-50 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
                
                {/* Profile Header Inside Hamburger */}
                <div 
                  onClick={() => {
                    setActiveTab('profile');
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#F4F4F4] cursor-pointer hover:bg-[#2C7FFF]/10 transition-all border border-[#03045E]/5"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#03045E] text-white flex items-center justify-center font-bold overflow-hidden shadow-md flex-shrink-0">
                    {profile?.company_logo ? (
                      <img src={profile.company_logo} alt="Profile" className="w-full h-full object-cover" />
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
                <div className="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto pr-1">
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
                        className={`flex items-center gap-3.5 p-3.5 rounded-2xl font-bold transition-all text-sm w-full ${
                          isActive 
                            ? 'bg-[#03045E] text-white shadow-md shadow-[#03045E]/20' 
                            : 'text-[#03045E] hover:bg-[#2C7FFF]/10 hover:text-[#2C7FFF]'
                        }`}
                      >
                        <div className={`p-2 rounded-xl flex-shrink-0 ${
                          isActive ? 'bg-[#2C7FFF] text-white' : 'bg-[#F4F4F4] text-[#03045E]'
                        }`}>
                          {tabItem.icon}
                        </div>
                        <span className="flex-1 text-left truncate">{tabItem.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Logout Button Inside Hamburger */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-sm transition-colors border border-red-200"
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

      <div className="min-h-[calc(100vh-73px)] flex flex-col md:flex-row">
        
        {/* DESKTOP SIDEBAR NAVIGATION (Hidden on mobile) */}
        <aside className="hidden md:flex w-72 flex-col shadow-xl z-10 bg-white border-r border-[#03045E]/10">
          <nav className="flex-1 p-4 flex flex-col gap-2">
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
                onClick={() => setActiveTab(tabItem.id)} 
                className={`flex items-center gap-3.5 p-4 rounded-2xl font-bold transition-all duration-300 text-sm group relative ${
                  isActive 
                    ? 'bg-[#03045E] text-white shadow-lg shadow-[#03045E]/25 scale-[1.02]' 
                    : 'text-[#03045E] hover:bg-[#2C7FFF]/10 hover:text-[#2C7FFF]'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive ? 'bg-[#2C7FFF] text-white' : 'bg-[#F4F4F4] text-[#03045E] group-hover:bg-[#2C7FFF] group-hover:text-white'
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
        <main className="flex-1 p-6 md:p-10 overflow-y-auto relative">
          {activeTab === 'overview' && profile && <EmployerOverview profile={profile} stats={stats} setActiveTab={setActiveTab} />}
          {activeTab === 'post-job' && <EmployerPostJob profile={profile} refreshData={refreshJobsAndStats} setActiveTab={setActiveTab} />}
          {activeTab === 'jobs' && <EmployerMyJobs jobs={jobs} refreshData={refreshJobsAndStats} />}
          {activeTab === 'applications' && profile && <EmployerApplications profile={profile} refreshStats={refreshJobsAndStats} />}
          {activeTab === 'profile' && profile && <EmployerProfile profile={profile} refreshData={refreshJobsAndStats} />}
          {activeTab === 'settings' && profile && <EmployerAccountSettings profile={profile} />}
        </main>
      </div>
      
    </div>
  );
}