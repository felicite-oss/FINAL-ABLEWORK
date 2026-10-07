import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import headerLogo from '../assets/LIGHT MODE.png';
import profileImage from '../assets/5i.png';
import NotificationsButton from '../components/Admin/NotificationsButton';
import ProfileMenu from '../components/Admin/ProfileMenu';
import SettingsModal from '../components/Admin/SettingsModal';
import DarkModeToggle from '../components/Admin/DarkModeToggle';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [listFilter, setListFilter] = useState('Pending'); 
  const [isOpen, setIsOpen] = useState(false); 
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  const [pwdModal, setPwdModal] = useState({
    isOpen: false,
    user: null
  });

  const [employerModal, setEmployerModal] = useState({
    isOpen: false,
    user: null
  });

  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    userId: null,
    reason: ''
  });

  const [approveModal, setApproveModal] = useState({
    isOpen: false,
    userId: null
  });

  const [disableModal, setDisableModal] = useState({
    isOpen: false,
    userId: null
  });

  const [restoreModal, setRestoreModal] = useState({
    isOpen: false,
    userId: null
  });

  const [approveLoading, setApproveLoading] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const fetchAdminData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const statsRes = await fetch('http://localhost:5001/api/admin/stats');
      const chartRes = await fetch('http://localhost:5001/api/admin/analytics/annual');
      const empRes = await fetch('http://localhost:5001/api/admin/employers/all');
      const appRes = await fetch('http://localhost:5001/api/admin/applicants/all'); 
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (chartRes.ok) setChartData(await chartRes.json());
      if (empRes.ok) setEmployers(await empRes.json());
      if (appRes.ok) setApplicants(await appRes.json());
    } catch (error) {
      console.error("Failed to load admin data");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { navigate('/login'); return; }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      alert("Unauthorized Access. Admin privileges required.");
      navigate('/'); return;
    }
    setAdminUser(user);
    fetchAdminData();
  }, [navigate]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('user'); 
      navigate('/login'); 
    }, 3000);
  };

  const handleVerification = async (userId, newStatus, reason = null) => {
    try {
      const res = await fetch(`http://localhost:5001/api/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejection_reason: reason })
      });
      if (res.ok) {
        setRejectModal({ isOpen: false, userId: null, reason: '' }); 
        setPwdModal({ isOpen: false, user: null });
        setEmployerModal({ isOpen: false, user: null });
        setApproveModal({ isOpen: false, userId: null });
        fetchAdminData(true);
      }
    } catch (error) { 
      alert("Failed to update status."); 
    }
  };

  const confirmApproval = () => {
    if (approveModal.userId) {
      setApproveLoading(true);
      setTimeout(() => {
        handleVerification(approveModal.userId, 'Approved');
        setApproveLoading(false);
      }, 2000);
    }
  };

  const confirmDisable = () => {
    if (disableModal.userId) {
      setDisableLoading(true);
      setTimeout(() => {
        handleAccountStatus(disableModal.userId, 'Disabled');
        setDisableLoading(false);
      }, 2000);
    }
  };

  const confirmRestore = () => {
    if (restoreModal.userId) {
      setRestoreLoading(true);
      setTimeout(() => {
        handleAccountStatus(restoreModal.userId, 'Active');
        setRestoreLoading(false);
      }, 2000);
    }
  };

  const submitRejection = () => {
    if (!rejectModal.reason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setRejectLoading(true);
    setTimeout(() => {
      handleVerification(rejectModal.userId, 'Rejected', rejectModal.reason);
      setRejectLoading(false);
    }, 2000);
  };

  const handleAccountStatus = async (userId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/api/admin/users/${userId}/account-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_status: newStatus })
      });
      if (res.ok) {
        setDisableModal({ isOpen: false, userId: null });
        setRestoreModal({ isOpen: false, userId: null });
        fetchAdminData(true);
      }
    } catch (error) { alert("Failed to update account status."); }
  };

  const filterList = (list) => {
    return list.filter(item => {
      if (listFilter === 'Disabled') return item.account_status === 'Disabled';
      if (item.account_status === 'Disabled') return false;
      return item.verification_status === listFilter;
    });
  };

const handleDohPortalLaunch = (e) => {
    e.preventDefault();
    
    const popupWidth = 650; 
    const popupHeight = window.screen.availHeight;
    const leftPosition = window.screen.availWidth - popupWidth;

    window.open(
      'https://pwd.doh.gov.ph/tbl_pwd_id_verificationlist.php',
      'DOH_Verification_Window',
      `width=${popupWidth},height=${popupHeight},left=${leftPosition},top=0,menubar=no,toolbar=no,location=yes,status=no,scrollbars=yes,resizable=yes`
    );
  };

  const allUsers = [...employers.map(e => ({ ...e, userType: 'Employer' })), ...applicants.map(a => ({ ...a, userType: 'Applicant' }))];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface,#f4f4f4)] text-[var(--color-text,#03045E)] selection:bg-[var(--color-primary,#2C7FFF)] selection:text-[var(--color-button-text,#ffffff)] relative overflow-x-clip w-full max-w-[100vw]">
      
      {isLoggingOut && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className="relative w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-white border-2 border-[#2C7FFF]">
            <div className="h-2 w-full bg-[#2C7FFF]" />
            <div className="relative px-8 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-transparent border-4 border-[#2C7FFF]">
                  <svg className="w-12 h-12 animate-spin text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#03045E] text-white">✓</div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border-2 text-[#2C7FFF] bg-transparent border-[#2C7FFF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Notice
              </span>
              <h2 className="text-3xl font-black tracking-tight mb-2 text-[#03045E]">
                Logging Out...
              </h2>
              <p className="text-sm font-bold leading-relaxed mb-8 max-w-xs text-[#03045E]/80">
                Please wait while we secure your account and end the session.
              </p>
              <div className="flex items-center gap-1.5" aria-label="Logging out">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className="relative w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-white border-2 border-[#2C7FFF]">
            <div className="h-2 w-full bg-[#2C7FFF]" />
            <div className="relative px-8 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-transparent border-4 border-[#2C7FFF]">
                  <svg className="w-12 h-12 animate-spin text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#03045E] text-white">✓</div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border-2 text-[#2C7FFF] bg-transparent border-[#2C7FFF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Notice
              </span>
              <h2 className="text-3xl font-black tracking-tight mb-2 text-[#03045E]">
                Loading Workspace...
              </h2>
              <p className="text-sm font-bold leading-relaxed mb-8 max-w-xs text-[#03045E]/80">
                Please wait while we set up your dashboard and analytics.
              </p>
              <div className="flex items-center gap-1.5" aria-label="Loading">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className="relative w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-white border-2 border-[#2C7FFF]">
            <div className="h-2 w-full bg-[#2C7FFF]" />

            <div className="relative px-8 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-transparent border-4 border-[#2C7FFF]">
                  <svg className="w-12 h-12 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#03045E] text-white">!</div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border-2 text-[#2C7FFF] bg-transparent border-[#2C7FFF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Notice
              </span>

              <h2 className="text-3xl font-black tracking-tight mb-2 text-[#03045E]">
                Are you sure to logout?
              </h2>
              <p className="text-sm font-bold leading-relaxed mb-8 max-w-xs text-[#03045E]/80">
                You will be signed out of your account and returned to the login page.
              </p>

              <div className="flex flex-row gap-3 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2 text-[#03045E] border-[#03045E]"
                >
                  No, Stay
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2 text-[#03045E] border-[#03045E]"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="w-full bg-[var(--color-card,#ffffff)] border-b-2 border-[var(--color-border,rgba(3,4,94,0.15))] fixed top-0 left-0 z-50 transition-all duration-300 shadow-sm">
  <div className="w-full h-16 px-2 sm:px-4 md:pr-8 flex items-center justify-between max-w-[1700px] mx-auto box-border gap-2">
    <div className="flex items-center gap-2 sm:gap-3 md:gap-6 min-w-0 flex-shrink overflow-hidden">
      <div className="flex items-center flex-shrink min-w-0 cursor-pointer overflow-hidden py-1" onClick={() => setActiveTab('Overview')}>
        <img
          src={headerLogo}
          alt="AbleWork Logo"
          className="h-10 sm:h-12 md:h-14 w-auto object-contain max-h-full hover:opacity-95 transition-opacity"
        />
      </div>
    </div>

    <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
      <NotificationsButton pendingCount={(stats?.pendingEmployers || 0) + (stats?.pendingApplicants || 0)} />

      <DarkModeToggle />

      <ProfileMenu
        adminUser={adminUser}
        isLoggingOut={isLoggingOut}
        onLogoutClick={() => setShowLogoutConfirm(true)}
        onSettingsClick={() => {
          setShowProfile(false);
          setShowSettings(true);
        }}
        onProfileClick={() => {
          setShowSettings(false);
          setShowProfile(true);
        }}
      />

      <button
        className="md:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-card,#ffffff)] text-[var(--color-text,#03045E)] border-2 border-[var(--color-border,rgba(3,4,94,0.2))] shadow-sm cursor-pointer hover:bg-[var(--color-primary,#03045E)] hover:text-[var(--color-button-text,#ffffff)] transition-all duration-200 shrink-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </div>
  </div>

  <div
    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[var(--color-card,#ffffff)] border-b-2 border-[var(--color-border,rgba(3,4,94,0.2))] ${
      isOpen ? 'max-h-[600px] opacity-100 shadow-xl' : 'max-h-0 opacity-0'
    }`}
  >
    <div className="w-full">
      <nav className="flex flex-col px-3 sm:px-6 py-4 sm:py-6 gap-3 text-[15px] sm:text-[16px] font-bold text-[var(--color-text,#03045E)]">
        {[
          { id: 'Overview', label: 'Overview', desc: 'Dashboard summary' },
          { id: 'Employers', label: 'Employers', desc: 'Manage companies' },
          { id: 'Applicants', label: 'Applicants', desc: 'Manage job seekers' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setListFilter('Pending'); setIsOpen(false); }}
              className={`relative flex items-center gap-3.5 text-left pl-4 pr-3.5 py-3.5 rounded-2xl font-extrabold transition-all duration-300 capitalize cursor-pointer border-2 group overflow-hidden ${
                isActive
                  ? 'bg-white text-[#03045E] border-[#03045E] shadow-md'
                  : 'bg-white text-[#03045E] border-[#03045E]/25'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>
              )}
              <div
                className={`p-2.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 ${
                  isActive
                    ? 'bg-[#03045E] text-white border-[#03045E]'
                    : 'bg-[#03045E] text-white border-[#03045E]'
                }`}
              >
                {tab.id === 'Overview' && (
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                )}
                {tab.id === 'Employers' && (
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                )}
                {tab.id === 'Applicants' && (
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-[15px] tracking-wide font-black truncate block leading-tight ${isActive ? 'text-[#03045E]' : 'text-[#03045E]'}`}>{tab.label}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest block mt-0.5 truncate ${isActive ? 'text-[#03045E]/85' : 'text-[#03045E]/70'}`}>{tab.desc}</span>
              </div>
              <svg
                className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isActive ? 'text-[#03045E]' : 'text-[#03045E]'}`}
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
        <div className="h-0.5 bg-[var(--color-border,rgba(3,4,94,0.15))] my-1"></div>
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-2">
          <span className="text-xs sm:text-sm font-bold text-[var(--color-text,#03045E)]">Dark Mode</span>
          <DarkModeToggle />
        </div>
        <div className="h-0.5 bg-[var(--color-border,rgba(3,4,94,0.15))] my-1"></div>
        <button
          disabled={isLoggingOut}
          onClick={() => { setIsOpen(false); setShowLogoutConfirm(true); }}
          style={{ color: '#DC2626', backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}
          className="flex items-center gap-3 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black border-2 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer text-left shadow-sm disabled:opacity-50"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="truncate">Logout</span>
        </button>
      </nav>
    </div>
  </div>
</header>

      <button
        onClick={() => setShowDesktopSidebar((prev) => !prev)}
        aria-label="Toggle sidebar"
        aria-expanded={showDesktopSidebar}
        title={showDesktopSidebar ? 'Hide navigation' : 'Show navigation'}
        className={`hidden md:flex fixed top-[4.5rem] left-4 z-40 w-11 h-11 items-center justify-center rounded-2xl border-2 shadow-md transition-all duration-200 cursor-pointer bg-[var(--color-card,#ffffff)] text-[var(--color-text,#03045E)] border-[var(--color-border,rgba(3,4,94,0.15))]`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          {showDesktopSidebar ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <div className={`flex flex-col w-full max-w-[1700px] mx-auto min-w-0 box-border pt-16 flex-1 transition-all duration-300 ${isOpen ? 'mt-[440px] md:mt-0' : ''}`}>
        <div className="flex flex-col md:flex-row flex-1 w-full min-w-0">
          
          {showDesktopSidebar && (
          <aside className="!hidden md:!flex shrink-0 flex-col z-10 bg-[#f4f4f4] border-r-2 border-[#f4f4f4] !w-72 sticky top-16 h-[calc(100vh-4rem)] self-start shadow-[4px_0_24px_rgba(3,4,94,0.2)]">
            <div className="w-full flex flex-col h-full min-w-0">
              <nav className="flex-1 pl-4 pr-3 pt-20 pb-6 flex flex-col gap-3 overflow-y-auto">
                {[
                  { id: 'Overview', label: 'Overview', desc: 'Dashboard summary' },
                  { id: 'Employers', label: 'Employers', desc: 'Manage companies' },
                  { id: 'Applicants', label: 'Applicants', desc: 'Manage job seekers' }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button 
                      key={tab.id} 
                      onClick={() => { setActiveTab(tab.id); setListFilter('Pending'); }} 
                      className={`relative flex items-center gap-3.5 text-left pl-4 pr-3.5 py-3.5 rounded-2xl font-extrabold transition-all duration-300 capitalize cursor-pointer border-2 group overflow-hidden ${
                        isActive
                          ? 'bg-white text-[#03045E] border-[#03045E] shadow-md'
                          : 'bg-white text-[#03045E] border-[#03045E]/25'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>
                      )}
                      <div 
                        className={`p-2.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 ${
                          isActive
                            ? 'bg-[#03045E] text-white border-[#03045E]'
                            : 'bg-[#03045E] text-white border-[#03045E]'
                        }`}
                      >
                        {tab.id === 'Overview' && (
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        )}
                        {tab.id === 'Employers' && (
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        )}
                        {tab.id === 'Applicants' && (
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[15px] tracking-wide font-black truncate block leading-tight ${isActive ? 'text-[#03045E]' : 'text-[#03045E]'}`}>{tab.label}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest block mt-0.5 truncate ${isActive ? 'text-[#03045E]/85' : 'text-[#03045E]/70'}`}>{tab.desc}</span>
                      </div>
                      <svg 
                        className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isActive ? 'text-[#03045E]' : 'text-[#03045E]'}`}
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

                <div className="mt-auto flex flex-col gap-3 pt-6 border-t-2 border-[#2C7FFF]/30">
                  <div className="relative p-4 rounded-2xl bg-[#f4f4f4] border-2 border-[#2C7FFF] shadow-lg overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#2C7FFF]/10"></div>
                    <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-[#2C7FFF]/10"></div>
                    <div className="relative flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse"></span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#03045E]/70">Pending Reviews</span>
                    </div>
                    <p className="relative text-3xl font-black text-[#03045E] tracking-tight">
                      {(stats?.pendingEmployers || 0) + (stats?.pendingApplicants || 0)}
                    </p>
                    <p className="relative text-[10px] font-bold text-[#03045E]/60 mt-1">
                      Documents waiting for your verification
                    </p>
                    <button
                      onClick={() => { setActiveTab('Employers'); setListFilter('Pending'); }}
                      className="relative mt-3 w-full py-2.5 rounded-xl bg-[#2C7FFF] text-[#f4f4f4] text-[11px] font-black uppercase tracking-wider hover:bg-[#03045E] transition-all duration-200 cursor-pointer shadow-sm"
                    >
                      Review Now →
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#2C7FFF]/15 border-2 border-[#2C7FFF]/40 flex flex-col gap-2">
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-black uppercase tracking-widest text-[#03045E]/70">Total Users</span>
    <span className="text-xs font-black text-[#03045E]">{allUsers.length}</span>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-black uppercase tracking-widest text-[#03045E]/70">Employers</span>
    <span className="text-xs font-black text-[#03045E]">{employers.length}</span>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-black uppercase tracking-widest text-[#03045E]/70">Applicants</span>
    <span className="text-xs font-black text-[#03045E]">{applicants.length}</span>
  </div>
</div>

                  <div className="px-2 pt-2 flex items-center justify-between">
  <span className="text-[10px] font-black uppercase tracking-widest text-[#03045E]/40">AbleWork Admin</span>
  <span className="text-[10px] font-black uppercase tracking-widest text-[#03045E]/40">v1.0</span>
</div>
                </div>
              </nav>
            </div>
          </aside>
          )}

          <main className={`!flex-1 px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5 pt-9 sm:pt-12 md:pt-14 relative w-full min-w-0 transition-all duration-300 flex flex-col box-border ${showDesktopSidebar ? '!md:ml-72' : ''}`}>
            
                        {showProfile ? (
  <div className="w-full max-w-6xl mx-auto relative pb-6 sm:pb-12 px-1 sm:px-0 animate-in fade-in duration-300 text-[#03045E]">

    <div className="mb-4 sm:mb-10 bg-[#f4f4f4] p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.06)] border border-[#03045E]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
        <div className="relative group shrink-0">
          <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
            <img src={profileImage} alt="Admin Profile" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold bg-[#10B981] text-white border-2 border-white shadow-md">✓</div>
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#03045E] tracking-tight break-words">
            {adminUser?.firstname ? `${adminUser.firstname} ${adminUser.lastname || ''}`.trim() : 'Administrator'}
          </h1>
          <p className="text-[11px] sm:text-sm font-semibold text-[#03045E] mt-1">
            Manage your personal info and account settings
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white text-[#03045E] border border-[#03045E]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              {adminUser?.role || 'admin'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white text-[#03045E] border border-[#03045E]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              Active
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">

      <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-8 bg-[#f4f4f4] rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.04)] border border-[#03045E]/20 h-fit transition-all duration-300 hover:shadow-[0_20px_40px_rgba(3,4,94,0.08)]">
        <div className="flex items-center gap-3 border-b border-[#03045E]/20 pb-3 sm:pb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-[#2C7FFF] border border-[#03045E]/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-base sm:text-xl font-bold text-[#03045E]">Personal Information</h2>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-bold text-[#03045E]">Full Name</label>
          <input
            type="text"
            value={adminUser?.firstname ? `${adminUser.firstname} ${adminUser.lastname || ''}`.trim() : 'Administrator'}
            readOnly
            className="w-full p-3 sm:p-3.5 bg-white border border-[#03045E]/20 rounded-xl sm:rounded-2xl outline-none text-[#03045E] font-medium text-xs sm:text-sm cursor-not-allowed opacity-75 truncate"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-bold text-[#03045E]">Email Address</label>
          <input
            type="text"
            value={adminUser?.email || 'admin@ablework.com'}
            readOnly
            className="w-full p-3 sm:p-3.5 bg-white border border-[#03045E]/20 rounded-xl sm:rounded-2xl outline-none text-[#03045E] font-medium text-xs sm:text-sm cursor-not-allowed opacity-75 truncate"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-bold text-[#03045E]">Account Type</label>
          <input
            type="text"
            value={adminUser?.role ? `${adminUser.role} Account` : 'Admin Account'}
            readOnly
            className="w-full p-3 sm:p-3.5 bg-white border border-[#03045E]/20 rounded-xl sm:rounded-2xl outline-none text-[#03045E] font-medium text-xs sm:text-sm cursor-not-allowed opacity-75 capitalize truncate"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-bold text-[#03045E]">Account ID</label>
          <input
            type="text"
            value={adminUser?.user_id ? `ADM-${String(adminUser.user_id).padStart(4, '0')}` : 'ADM-0001'}
            readOnly
            className="w-full p-3 sm:p-3.5 bg-white border border-[#03045E]/20 rounded-xl sm:rounded-2xl outline-none text-[#03045E] font-medium text-xs sm:text-sm cursor-not-allowed opacity-75 truncate"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-bold text-[#03045E]">Profile Completion</label>
          <div className="p-3 sm:p-4 bg-white border border-[#03045E]/20 rounded-xl sm:rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#03045E]/60">Progress</span>
              <span className="text-xs sm:text-sm font-black text-[#2C7FFF]">100%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#03045E]/10 overflow-hidden">
              <div className="h-full w-full rounded-full bg-[#2C7FFF]"></div>
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-[#03045E]/60 mt-2">Your account is fully set up and secure 🎉</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-8 bg-[#f4f4f4] rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.04)] border border-[#03045E]/20 h-fit transition-all duration-300 hover:shadow-[0_20px_40px_rgba(3,4,94,0.08)]">
        <div className="flex items-center gap-3 border-b border-[#03045E]/20 pb-3 sm:pb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-[#2C7FFF] border border-[#03045E]/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-base sm:text-xl font-bold text-[#03045E]">Account Status & Access</h2>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="flex flex-col items-center gap-1.5 px-1.5 sm:px-2 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white border border-[#03045E]/10">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#2C7FFF] text-white flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#03045E]/60">Access</p>
            <p className="text-[11px] sm:text-xs md:text-sm font-black text-[#03045E]">Full</p>
          </div>

          <div className="flex flex-col items-center gap-1.5 px-1.5 sm:px-2 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white border border-[#03045E]/10">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#10b981] text-white flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#03045E]/60">Status</p>
            <p className="text-[11px] sm:text-xs md:text-sm font-black text-[#047857]">Online</p>
          </div>

          <div className="flex flex-col items-center gap-1.5 px-1.5 sm:px-2 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white border border-[#03045E]/10">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#f59e0b] text-white flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#03045E]/60">Session</p>
            <p className="text-[11px] sm:text-xs md:text-sm font-black text-[#b45309]">Active</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-bold text-[#03045E]">Quick Actions</label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button className="flex flex-col items-center gap-1.5 px-1.5 sm:px-2 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#2C7FFF]/10 text-[#2C7FFF] cursor-pointer border border-[#2C7FFF]/20">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider">Alerts</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 px-1.5 sm:px-2 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#10b981]/10 text-[#047857] cursor-pointer border border-[#10b981]/20">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider">Reports</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 px-1.5 sm:px-2 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#f59e0b]/10 text-[#b45309] cursor-pointer border border-[#f59e0b]/20">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider">Help</span>
            </button>
          </div>
        </div>

        <div className="mt-2 pt-4 border-t border-[#03045E]/20 flex flex-col gap-2 sm:gap-3">
          <button
            onClick={() => {
              setShowProfile(false);
              setShowSettings(true);
            }}
            className="w-full py-3 sm:py-4 bg-[#03045E] text-white font-bold rounded-xl sm:rounded-2xl hover:bg-[#2C7FFF] transition-all shadow-[0_10px_25px_rgba(3,4,94,0.15)] flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Open Settings</span>
          </button>

          <button
  onClick={() => setShowProfile(false)}
  className="w-full py-3 sm:py-3.5 bg-transparent border-2 border-[#03045E]/25 text-[#03045E] font-bold rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
>
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
  <span>Close Profile</span>
</button>
        </div>
      </div>
    </div>
  </div>
) : showSettings ? (
              <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                adminUser={adminUser}
              />
            ) : (
            <>

            <div className="mb-6 border-b-2 border-[var(--color-border,rgba(3,4,94,0.15))] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-[var(--color-text,#03045E)] tracking-tight">Admin Control Center</h1>
                <p className="text-sm font-bold text-[var(--color-text,#03045E)]/70 mt-1">
                  Manage platform integrity, verify documents, and control account access securely.
                </p>
              </div>
            </div>

            {activeTab === 'Overview' && stats && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  <StatCard 
                    title="Total Applicants" 
                    value={stats.totalApplicants} 
                    onClick={() => { setActiveTab('Applicants'); setListFilter('Approved'); }}
                    color="blue"
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                    } 
                  />
                  <StatCard 
                    title="Total Employers" 
                    value={stats.totalEmployers} 
                    onClick={() => { setActiveTab('Employers'); setListFilter('Approved'); }}
                    color="violet"
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                    } 
                  />
                  <StatCard 
                    title="Pending Employers" 
                    value={stats.pendingEmployers} 
                    onClick={() => { setActiveTab('Employers'); setListFilter('Pending'); }}
                    color="amber"
                    icon={
                      <svg className={`w-6 h-6 ${stats.pendingEmployers > 0 ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    } 
                    alert={stats.pendingEmployers > 0} 
                  />
                  <StatCard 
                    title="Pending Applicants" 
                    value={stats.pendingApplicants} 
                    onClick={() => { setActiveTab('Applicants'); setListFilter('Pending'); }}
                    color="rose"
                    icon={
                      <svg className={`w-6 h-6 ${stats.pendingApplicants > 0 ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    } 
                    alert={stats.pendingApplicants > 0} 
                  />
                </div>

                <div className="bg-[var(--color-card,#ffffff)] p-3 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-sm border-2 border-[var(--color-border,rgba(3,4,94,0.15))]">
  <div className="mb-4 sm:mb-6">
    <h2 className="text-base sm:text-xl font-black text-[var(--color-text,#03045E)] tracking-tight">Annual Platform Growth</h2>
    <p className="text-[10px] sm:text-xs font-bold text-[var(--color-text,#03045E)]/70 mt-0.5">Monthly registration volume for new users.</p>
  </div>
  <div className="h-[260px] sm:h-[400px] w-full -ml-2 sm:ml-0">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(3,4,94,0.1)" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--color-text, #03045E)', fontSize: 10, fontWeight: 700 }}
          dy={8}
          interval="preserveStartEnd"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--color-text, #03045E)', fontSize: 10, fontWeight: 700 }}
          width={28}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(44,127,255,0.1)' }}
          contentStyle={{
            borderRadius: '12px',
            border: '2px solid rgba(3,4,94,0.15)',
            boxShadow: '0 10px 25px rgba(3,4,94,0.1)',
            fontWeight: 'bold',
            color: '#03045E',
            fontSize: '11px',
            padding: '6px 10px'
          }}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ paddingTop: '12px', fontWeight: 'bold', fontSize: '11px' }}
        />
        <Bar
          dataKey="users"
          name="New Users"
          fill="var(--color-primary, #03045E)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

                <div className="bg-[var(--color-card,#ffffff)] p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-sm border-2 border-[var(--color-border,rgba(3,4,94,0.15))] flex flex-col gap-4 sm:gap-6">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b-2 border-[var(--color-border,rgba(3,4,94,0.1))] pb-3 sm:pb-4">
    <div>
      <h2 className="text-base sm:text-xl font-black text-[var(--color-text,#03045E)] tracking-tight leading-tight">All Registered Users Overview</h2>
      <p className="text-[10px] sm:text-xs font-bold text-[var(--color-text,#03045E)]/70 mt-1">Comprehensive list of all platform applicants and employers.</p>
    </div>
    <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-[var(--color-primary,#03045E)]/10 text-[var(--color-text,#03045E)] font-black text-[10px] sm:text-xs rounded-lg sm:rounded-xl border border-[var(--color-border,rgba(3,4,94,0.2))] w-fit">
      Total: {allUsers.length} Users
    </span>
  </div>

  <div className="flex flex-col gap-2.5 sm:gap-3 max-h-[500px] overflow-y-auto pr-1">
    {allUsers.length > 0 ? (
      allUsers.map((user) => (
        <div key={user.user_id} className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[var(--color-surface,#f4f4f4)] border-2 border-[var(--color-border,rgba(3,4,94,0.15))] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 hover:border-[var(--color-primary,#2C7FFF)] transition-all">

          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 w-full sm:w-auto">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[var(--color-primary,#03045E)] text-[var(--color-button-text,#ffffff)] flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-sm">
              {user.userType === 'Employer' ? (user.company_name?.[0] || 'E') : (user.firstname?.[0] || 'A')}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-black text-[var(--color-text,#03045E)] truncate">
                {user.userType === 'Employer' ? user.company_name : `${user.firstname} ${user.lastname}`}
              </h4>
              <p className="text-[10px] sm:text-xs font-bold text-[var(--color-text,#03045E)]/70 truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 w-full sm:w-auto justify-start sm:justify-end flex-wrap">
            <span
              className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-black tracking-wider uppercase border"
              style={{
                backgroundColor: user.userType === 'Employer' ? 'rgba(44,127,255,0.15)' : 'rgba(59,130,246,0.15)',
                color: user.userType === 'Employer' ? '#2c7fff' : '#1d4ed8',
                borderColor: user.userType === 'Employer' ? '#2c7fff' : '#3b82f6'
              }}
            >
              {user.userType}
            </span>
            <span
              className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-black tracking-wider uppercase border"
              style={{
                backgroundColor: user.account_status === 'Disabled' ? 'rgba(220,38,38,0.1)' :
                  user.verification_status === 'Approved' ? 'rgba(16,185,129,0.1)' :
                  user.verification_status === 'Rejected' ? 'rgba(220,38,38,0.1)' :
                  'rgba(245,158,11,0.1)',
                color: user.account_status === 'Disabled' ? '#b91c1c' :
                  user.verification_status === 'Approved' ? '#047857' :
                  user.verification_status === 'Rejected' ? '#b91c1c' :
                  '#b45309',
                borderColor: user.account_status === 'Disabled' ? '#dc2626' :
                  user.verification_status === 'Approved' ? '#10b981' :
                  user.verification_status === 'Rejected' ? '#dc2626' :
                  '#f59e0b'
              }}
            >
              {user.account_status === 'Disabled' ? 'Disabled' : (user.verification_status || 'Pending')}
            </span>
          </div>
        </div>
      ))
    ) : (
      <div className="p-8 text-center text-xs font-bold text-[var(--color-text,#03045E)]/70">No registered users found.</div>
    )}
  </div>
</div>
              </div>
            )}

     {(activeTab === 'Employers' || activeTab === 'Applicants') && (
  <div className="flex flex-col gap-3 sm:gap-6 animate-in fade-in duration-300">

    <div className="flex items-center gap-0.5 sm:gap-2 bg-[var(--color-card,#ffffff)] p-1 sm:p-4 rounded-xl sm:rounded-[2rem] border-2 border-[var(--color-border,rgba(3,4,94,0.15))] w-full shadow-sm overflow-hidden">
      {['Pending', 'Approved', 'Rejected', 'Disabled'].map(filter => {
         const targetList = activeTab === 'Employers' ? employers : applicants;
         let count = 0;
         if (filter === 'Disabled') {
           count = targetList.filter(i => i.account_status === 'Disabled').length;
         } else {
           count = targetList.filter(i => i.verification_status === filter && i.account_status !== 'Disabled').length;
         }

         const isRedFilter = filter === 'Rejected' || filter === 'Disabled';
         const isGreenFilter = filter === 'Approved';

         let activeBg = '#03045E';
         let activeText = '#ffffff';
         let inactiveText = '#03045E';
         let badgeActiveBg = '#2C7FFF';
         let badgeActiveText = '#ffffff';
         let badgeInactiveBg = 'rgba(3,4,94,0.1)';
         let badgeInactiveText = '#03045E';

         if (isRedFilter) {
           activeBg = '#dc2626';
           activeText = '#ffffff';
           inactiveText = '#dc2626';
           badgeActiveBg = 'rgba(255,255,255,0.25)';
           badgeActiveText = '#ffffff';
           badgeInactiveBg = 'rgba(220,38,38,0.15)';
           badgeInactiveText = '#b91c1c';
         } else if (isGreenFilter) {
           activeBg = '#10b981';
           activeText = '#ffffff';
           inactiveText = '#047857';
           badgeActiveBg = 'rgba(255,255,255,0.25)';
           badgeActiveText = '#ffffff';
           badgeInactiveBg = 'rgba(16,185,129,0.15)';
           badgeInactiveText = '#047857';
         }

         const isActive = listFilter === filter;

         return (
          <button
            key={filter}
            onClick={() => setListFilter(filter)}
            className="flex-1 min-w-0 px-0.5 sm:px-4 py-1.5 sm:py-3 rounded-md sm:rounded-xl text-[8px] sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 sm:gap-2 tracking-tight sm:tracking-normal"
            style={{
              backgroundColor: isActive ? activeBg : 'transparent',
              color: isActive ? activeText : inactiveText
            }}
          >
            <span>{filter}</span>
            <span
              className="px-1 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[10px] font-black tracking-wider inline-flex items-center justify-center min-w-[12px] sm:min-w-[24px] shrink-0"
              style={{
                backgroundColor: isActive ? badgeActiveBg : badgeInactiveBg,
                color: isActive ? badgeActiveText : badgeInactiveText
              }}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>

    <div className="flex flex-col gap-2.5 sm:gap-4">
      {filterList(activeTab === 'Employers' ? employers : applicants).length > 0 ? (
        filterList(activeTab === 'Employers' ? employers : applicants).map(user => (
          <div key={user.user_id} className={`bg-[var(--color-card,#ffffff)] p-3 sm:p-7 rounded-2xl sm:rounded-[2rem] shadow-sm border-2 border-[var(--color-border,rgba(3,4,94,0.15))] flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-6 transition-all hover:shadow-md hover:border-[var(--color-primary,#2C7FFF)]/40 ${listFilter === 'Disabled' ? 'opacity-70 bg-[var(--color-surface,#f4f4f4)]/50' : ''}`}>

            <div className="flex items-start gap-2.5 sm:gap-4 flex-1 min-w-0 w-full">
              <div
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border-2 font-black text-sm sm:text-lg"
                style={{
                  backgroundColor: activeTab === 'Employers' ? 'rgba(44,127,255,0.1)' : 'rgba(59,130,246,0.1)',
                  color: activeTab === 'Employers' ? '#2c7fff' : '#1d4ed8',
                  borderColor: activeTab === 'Employers' ? '#2c7fff' : '#3b82f6'
                }}
              >
                {activeTab === 'Employers' ? (user.company_name?.[0] || 'E') : (user.firstname?.[0] || 'A')}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-xl font-black text-[var(--color-text,#03045E)] tracking-tight truncate">
                  {activeTab === 'Employers' ? user.company_name : `${user.firstname} ${user.lastname}`}
                </h3>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[9px] sm:text-sm font-bold text-[var(--color-text,#03045E)]/70 mt-1">
                  <span className="bg-[var(--color-surface,#f4f4f4)] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-[var(--color-border,rgba(3,4,94,0.1))]">
                    {activeTab === 'Employers' ? 'Industry:' : 'Disability:'} <strong className="text-[var(--color-text,#03045E)]">{activeTab === 'Employers' ? (user.industry || 'N/A') : (user.disability_type || 'N/A')}</strong>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="truncate w-full sm:w-auto">Email: <strong className="text-[var(--color-text,#03045E)]">{user.email}</strong></span>
                </div>
                <div
                  className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[11px] font-black uppercase tracking-wider mt-1 sm:mt-2.5"
                  style={{ color: activeTab === 'Employers' ? '#2c7fff' : '#1d4ed8' }}
                >
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Registered: {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-2 w-full md:w-auto shrink-0 items-stretch sm:items-center justify-stretch sm:justify-end">
              <div className="flex flex-row gap-1.5 sm:gap-2 w-full sm:w-auto">
                {activeTab === 'Employers' && user.verification_document && (
                  <button
                    onClick={() => setEmployerModal({ isOpen: true, user: user })}
                    className="flex-1 min-w-0 text-center px-2 sm:px-4 py-2 sm:py-2.5 font-black text-[10px] sm:text-sm rounded-lg sm:rounded-xl border-2 transition flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(44,127,255,0.1)',
                      color: '#2c7fff',
                      borderColor: '#2c7fff'
                    }}
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span className="truncate">View Business Document</span>
                  </button>
                )}

                {activeTab === 'Applicants' && user.pwd_document_path && (
                  <button
                    onClick={() => setPwdModal({ isOpen: true, user: user })}
                    className="flex-1 min-w-0 text-center px-2 sm:px-4 py-2 sm:py-2.5 font-black text-[10px] sm:text-sm rounded-lg sm:rounded-xl border-2 transition flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(44,127,255,0.1)',
                      color: '#2c7fff',
                      borderColor: '#2c7fff'
                    }}
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                    </svg>
                    <span className="truncate">View PWD ID</span>
                  </button>
                )}

                {(!user.verification_document && !user.pwd_document_path) && (
                  <div className="flex-1 min-w-0 text-center px-2 sm:px-4 py-2 sm:py-2.5 bg-[var(--color-surface,#f4f4f4)] text-[var(--color-text,#03045E)]/50 font-black text-[10px] sm:text-sm rounded-lg sm:rounded-xl border-2 border-[var(--color-border,rgba(3,4,94,0.1))] flex items-center justify-center gap-1.5 sm:gap-2">
                    No Document Attached
                  </div>
                )}
              </div>

              {(listFilter === 'Pending' || listFilter === 'Approved' || listFilter === 'Rejected' || listFilter === 'Disabled') && (
                <div className="flex flex-row gap-1.5 sm:gap-2 w-full sm:w-auto">
                  {listFilter === 'Pending' && (
                    <>
                      <button
                        onClick={() => setRejectModal({ isOpen: true, userId: user.user_id, reason: '' })}
                        className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2 font-black text-[10px] sm:text-sm rounded-lg sm:rounded-xl border-2 transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                        style={{
                          backgroundColor: 'rgba(220,38,38,0.1)',
                          color: '#b91c1c',
                          borderColor: '#dc2626'
                        }}
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <span className="truncate">Reject</span>
                      </button>
                      <button
                        onClick={() => setApproveModal({ isOpen: true, userId: user.user_id })}
                        className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2 font-black text-[10px] sm:text-sm rounded-lg sm:rounded-xl border-2 shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                        style={{
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          borderColor: '#10b981'
                        }}
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="truncate">Approve</span>
                      </button>
                    </>
                  )}
                  {listFilter === 'Approved' && (
                    <button
                      onClick={() => setDisableModal({ isOpen: true, userId: user.user_id })}
                      className="flex-1 min-w-0 py-2 sm:py-2.5 px-3 sm:px-4 font-black text-[10px] sm:text-sm rounded-lg sm:rounded-xl border-2 shadow-sm cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
                      style={{
                        backgroundColor: 'rgba(220,38,38,0.1)',
                        color: '#b91c1c',
                        borderColor: '#dc2626'
                      }}
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                      </svg>
                      <span className="truncate">Disable Account</span>
                    </button>
                  )}
                  {listFilter === 'Rejected' && (
                    <button
                      onClick={() => setApproveModal({ isOpen: true, userId: user.user_id })}
                      className="flex-1 min-w-0 py-2 sm:py-2.5 px-3 sm:px-4 font-black text-[10px] sm:text-sm rounded-lg sm:rounded-xl border-2 shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
                      style={{
                        backgroundColor: 'rgba(16,185,129,0.1)',
                        color: '#047857',
                        borderColor: '#10b981'
                      }}
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      <span className="truncate">Approve (Re-evaluate)</span>
                    </button>
                  )}
                  {listFilter === 'Disabled' && (
                    <button
                      onClick={() => setRestoreModal({ isOpen: true, userId: user.user_id })}
                      className="flex-1 min-w-0 py-2 sm:py-2.5 px-3 sm:px-4 font-black text-[10px] sm:text-sm rounded-lg sm:rounded-xl border-2 shadow-sm cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
                      style={{
                        backgroundColor: '#2C7FFF',
                        color: '#ffffff',
                        borderColor: '#2C7FFF'
                      }}
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      <span className="truncate">Restore Account</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="p-8 sm:p-16 text-center border-2 border-dashed border-[var(--color-border,rgba(3,4,94,0.2))] rounded-2xl sm:rounded-[2rem] bg-[var(--color-card,#ffffff)] shadow-sm flex flex-col items-center justify-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[var(--color-primary,#2C7FFF)]/15 text-[var(--color-primary,#2C7FFF)] rounded-2xl flex items-center justify-center mb-3 sm:mb-4 border-2 border-[var(--color-primary,#2C7FFF)]/30">
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
          </div>
          <p className="text-sm sm:text-base font-black text-[var(--color-text,#03045E)]">No {listFilter.toLowerCase()} {activeTab.toLowerCase()} found.</p>
          <p className="text-[10px] sm:text-xs font-bold text-[var(--color-text,#03045E)]/70 mt-1">Check back later for new registrations in this category.</p>
        </div>
      )}
    </div>
  </div>
)}

            {pwdModal.isOpen && pwdModal.user && (
              <div
                className="fixed inset-0 z-[9999999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300 overflow-y-auto"
                style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
              >
                <div className="bg-[var(--color-card,#ffffff)] rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-[95vw] sm:max-w-7xl my-4 sm:my-0 shadow-[0_25px_60px_rgba(3,4,94,0.4)] border-2 border-[var(--color-border,rgba(3,4,94,0.2))] flex flex-col overflow-hidden h-auto max-h-[95vh] sm:h-[90vh]">
                  
                  <div className="px-3 sm:px-6 py-3 sm:py-4 bg-[var(--color-surface,#f4f4f4)] border-b-2 border-[var(--color-border,rgba(3,4,94,0.15))] flex items-center justify-between shrink-0 gap-2">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xs sm:text-lg md:text-xl font-black text-[var(--color-text,#03045E)] tracking-tight truncate">
                        PWD ID Verification: {pwdModal.user.firstname} {pwdModal.user.lastname}
                      </h2>
                      <p className="text-[9px] sm:text-xs font-bold text-[var(--color-text,#03045E)]/70 truncate">
                        Review applicant PWD ID and cross-reference with the official portal.
                      </p>
                    </div>
                    <button
                      onClick={() => setPwdModal({ isOpen: false, user: null })}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--color-card,#ffffff)] text-[var(--color-text,#03045E)] border-2 border-[var(--color-border,rgba(3,4,94,0.2))] flex items-center justify-center font-black hover:bg-[var(--color-primary,#03045E)] hover:text-[var(--color-button-text,#ffffff)] transition cursor-pointer shrink-0 text-xs sm:text-base"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 lg:divide-x-2 divide-[var(--color-border,rgba(3,4,94,0.15))] overflow-y-auto lg:overflow-hidden">
                    
                    <div className="lg:col-span-2 flex flex-col bg-[var(--color-card,#ffffff)] p-3 sm:p-6 gap-3 sm:gap-6 lg:h-full lg:overflow-y-auto">
                      <div className="flex items-center justify-between shrink-0 gap-2 flex-wrap">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[var(--color-text,#03045E)]">Applicant Uploaded ID</span>
                        <span 
                          className="px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black border whitespace-nowrap"
                          style={{
                            backgroundColor: 'rgba(59,130,246,0.1)',
                            color: '#1d4ed8',
                            borderColor: '#3b82f6'
                          }}
                        >
                          Disability: {pwdModal.user.disability_type || 'N/A'}
                        </span>
                      </div>

                      <div className="min-h-[200px] sm:min-h-[350px] lg:flex-1 bg-[var(--color-surface,#f4f4f4)] rounded-2xl border-2 border-[var(--color-border,rgba(3,4,94,0.15))] overflow-hidden flex items-center justify-center relative shadow-inner p-2">
                        {pwdModal.user.pwd_document_path ? (
                          pwdModal.user.pwd_document_path.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                            <img
                              src={`http://localhost:5001/uploads/${pwdModal.user.pwd_document_path.replace(/^uploads[\\/]/, '')}`}
                              alt="Applicant PWD ID"
                              className="max-h-full max-w-full object-contain rounded-xl shadow-md"
                            />
                          ) : (
                            <iframe
                              src={`http://localhost:5001/uploads/${pwdModal.user.pwd_document_path.replace(/^uploads[\\/]/, '')}`}
                              title="PWD ID Document PDF"
                              className="w-full h-full rounded-xl"
                            ></iframe>
                          )
                        ) : (
                          <p className="text-sm font-bold text-[var(--color-text,#03045E)]/50">No document uploaded.</p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t-2 border-[var(--color-border,rgba(3,4,94,0.1))] shrink-0">
                        <button
                          onClick={() => {
                            const userId = pwdModal.user.user_id;
                            setPwdModal({ isOpen: false, user: null });
                            setRejectModal({ isOpen: true, userId: userId, reason: '' });
                          }}
                          className="flex-1 py-3 sm:py-3.5 font-black text-xs sm:text-sm rounded-xl border-2 transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
                          style={{
                            backgroundColor: 'rgba(220,38,38,0.1)',
                            color: '#b91c1c',
                            borderColor: '#dc2626'
                          }}
                        >
                          ✕ Reject & Cooldown
                        </button>
                        <button
                          onClick={() => setApproveModal({ isOpen: true, userId: pwdModal.user.user_id })}
                          className="flex-1 py-3 sm:py-3.5 font-black text-xs sm:text-sm rounded-xl border-2 shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                          style={{
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            borderColor: '#10b981'
                          }}
                        >
                          ✓ Approve PWD ID
                        </button>
                      </div>

                    </div>

                    <div className="lg:col-span-1 flex flex-col bg-[var(--color-surface,#f4f4f4)]/50 p-3 sm:p-6 justify-center items-center text-center lg:h-full lg:overflow-y-auto">
                      <div 
                        className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-2 sm:mb-4 border shadow-sm"
                        style={{
                          backgroundColor: 'rgba(59,130,246,0.1)',
                          color: '#1d4ed8',
                          borderColor: '#3b82f6'
                        }}
                      >
                        <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                      </div>
                      <h3 className="text-xs sm:text-base font-black text-[var(--color-text,#03045E)] mb-1 sm:mb-2">DOH Verification Portal</h3>
                      <p className="text-[10px] sm:text-xs font-bold text-[var(--color-text,#03045E)]/70 mb-3 sm:mb-6 leading-relaxed px-2 sm:px-0">
                        Government security policies prevent direct website embedding. Open the portal in a side-by-side view to cross-check details.
                      </p>
                      <button
                        onClick={handleDohPortalLaunch}
                        className="w-full py-2.5 sm:py-3.5 bg-[var(--color-primary,#03045E)] text-[var(--color-button-text,#ffffff)] font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-[var(--color-primary,#2C7FFF)] transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Launch Portal ↗
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {employerModal.isOpen && employerModal.user && (
              <div
                className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
                style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
              >
                <div className="bg-[var(--color-card,#ffffff)] rounded-[2.5rem] w-full max-w-4xl h-[85vh] shadow-[0_25px_60px_rgba(3,4,94,0.4)] border-2 border-[var(--color-border,rgba(3,4,94,0.2))] flex flex-col overflow-hidden">
                  
                  <div className="px-6 py-4 bg-[var(--color-surface,#f4f4f4)] border-b-2 border-[var(--color-border,rgba(3,4,94,0.15))] flex items-center justify-between shrink-0">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-[var(--color-text,#03045E)] tracking-tight">
                        Business Registration: {employerModal.user.company_name}
                      </h2>
                      <p className="text-xs font-bold text-[var(--color-text,#03045E)]/70">
                        Review company registration permit or DTI/SEC document.
                      </p>
                    </div>
                    <button
                      onClick={() => setEmployerModal({ isOpen: false, user: null })}
                      className="w-10 h-10 rounded-full bg-[var(--color-card,#ffffff)] text-[var(--color-text,#03045E)] border-2 border-[var(--color-border,rgba(3,4,94,0.2))] flex items-center justify-center font-black hover:bg-[var(--color-primary,#03045E)] hover:text-[var(--color-button-text,#ffffff)] transition cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col bg-[var(--color-card,#ffffff)] p-6 gap-6 overflow-hidden">
                    <div className="flex items-center justify-between shrink-0">
                      <span className="text-xs font-black uppercase tracking-wider text-[var(--color-text,#03045E)]">Uploaded Verification File</span>
                      <span 
                        className="px-3 py-1 rounded-lg text-xs font-black border"
                        style={{
                          backgroundColor: 'rgba(139,92,246,0.1)',
                          color: '#6d28d9',
                          borderColor: '#8b5cf6'
                        }}
                      >
                        Industry: {employerModal.user.industry || 'N/A'}
                      </span>
                    </div>

                    <div className="flex-1 bg-[var(--color-surface,#f4f4f4)] rounded-2xl border-2 border-[var(--color-border,rgba(3,4,94,0.15))] overflow-hidden flex items-center justify-center relative shadow-inner p-2">
                      {employerModal.user.verification_document ? (
                        employerModal.user.verification_document.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                          <img
                            src={`http://localhost:5001/uploads/${employerModal.user.verification_document.replace(/^uploads[\\/]/, '')}`}
                            alt="Business Verification Document"
                            className="max-h-full max-w-full object-contain rounded-xl shadow-md"
                          />
                        ) : (
                          <iframe
                            src={`http://localhost:5001/uploads/${employerModal.user.verification_document.replace(/^uploads[\\/]/, '')}`}
                            title="Business Document PDF"
                            className="w-full h-full rounded-xl"
                          ></iframe>
                        )
                      ) : (
                        <p className="text-sm font-bold text-[var(--color-text,#03045E)]/50">No document uploaded.</p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2 border-t-2 border-[var(--color-border,rgba(3,4,94,0.1))] shrink-0">
                      <button
                        onClick={() => {
                          const userId = employerModal.user.user_id;
                          setEmployerModal({ isOpen: false, user: null });
                          setRejectModal({ isOpen: true, userId: userId, reason: '' });
                        }}
                        className="flex-1 py-3.5 font-black text-sm rounded-xl border-2 transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: 'rgba(220,38,38,0.1)',
                          color: '#b91c1c',
                          borderColor: '#dc2626'
                        }}
                      >
                        ✕ Reject & Cooldown
                      </button>
                      <button
                        onClick={() => setApproveModal({ isOpen: true, userId: employerModal.user.user_id })}
                        className="flex-1 py-3.5 font-black text-sm rounded-xl border-2 shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          borderColor: '#10b981'
                        }}
                      >
                        ✓ Approve Employer Permit
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {approveModal.isOpen && (
              <div
                className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
                style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
              >
                <div className="relative w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-white border-2 border-[#10b981]">
                  <div className="h-2 w-full bg-[#10b981]" />

                  <div className="relative px-8 pt-10 pb-8 flex flex-col items-center text-center">
                    <div className="relative mb-5">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center bg-transparent border-4 border-[#10b981]">
                        <svg className="w-12 h-12 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#03045E] text-white">✓</div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border-2 text-[#10b981] bg-transparent border-[#10b981]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
                      Confirm
                    </span>

                    <h2 className="text-3xl font-black tracking-tight mb-2 text-[#03045E]">
                      Approve this account?
                    </h2>
                    <p className="text-sm font-bold leading-relaxed mb-8 max-w-xs text-[#03045E]/80">
                      This will mark the account as <span className="font-black text-[#047857]">Approved</span> and grant the user full platform access.
                    </p>

                    <div className="flex flex-row gap-3 w-full">
                      <button
                        disabled={approveLoading}
                        onClick={() => setApproveModal({ isOpen: false, userId: null })}
                        className="flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2 text-[#03045E] border-[#03045E] disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={approveLoading}
                        onClick={confirmApproval}
                        className="flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer text-white flex items-center justify-center gap-2 disabled:opacity-80"
                        style={{ backgroundColor: '#10b981', borderColor: '#10b981', border: '2px solid #10b981' }}
                      >
                        {approveLoading ? (
                          <>
                            <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            Loading...
                          </>
                        ) : (
                          'Yes, Approve'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {disableModal.isOpen && (
              <div
                className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
                style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
              >
                <div className="relative w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-white border-2 border-[#dc2626]">
                  <div className="h-2 w-full bg-[#dc2626]" />

                  <div className="relative px-8 pt-10 pb-8 flex flex-col items-center text-center">
                    <div className="relative mb-5">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center bg-transparent border-4 border-[#dc2626]">
                        <svg className="w-12 h-12 text-[#dc2626]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#03045E] text-white">!</div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border-2 text-[#dc2626] bg-transparent border-[#dc2626]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] animate-pulse"></span>
                      Warning
                    </span>

                    <h2 className="text-3xl font-black tracking-tight mb-2 text-[#03045E]">
                      Disable this account?
                    </h2>
                    <p className="text-sm font-bold leading-relaxed mb-8 max-w-xs text-[#03045E]/80">
                      This will <span className="font-black text-[#b91c1c]">DISABLE</span> the account and the user will lose access to the platform.
                    </p>

                    <div className="flex flex-row gap-3 w-full">
                      <button
                        disabled={disableLoading}
                        onClick={() => setDisableModal({ isOpen: false, userId: null })}
                        className="flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2 text-[#03045E] border-[#03045E] disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={disableLoading}
                        onClick={confirmDisable}
                        className="flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer text-white flex items-center justify-center gap-2 disabled:opacity-80"
                        style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', border: '2px solid #dc2626' }}
                      >
                        {disableLoading ? (
                          <>
                            <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            Loading...
                          </>
                        ) : (
                          'Yes, Disable'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {restoreModal.isOpen && (
              <div
                className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
                style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
              >
                <div className="relative w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-white border-2 border-[#2C7FFF]">
                  <div className="h-2 w-full bg-[#2C7FFF]" />

                  <div className="relative px-8 pt-10 pb-8 flex flex-col items-center text-center">
                    <div className="relative mb-5">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center bg-transparent border-4 border-[#2C7FFF]">
                        <svg className="w-12 h-12 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#03045E] text-white">✓</div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border-2 text-[#2C7FFF] bg-transparent border-[#2C7FFF]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                      Confirm
                    </span>

                    <h2 className="text-3xl font-black tracking-tight mb-2 text-[#03045E]">
                      Restore this account?
                    </h2>
                    <p className="text-sm font-bold leading-relaxed mb-8 max-w-xs text-[#03045E]/80">
                      This will <span className="font-black text-[#2C7FFF]">RESTORE</span> the account and the user will regain full access to the platform.
                    </p>

                    <div className="flex flex-row gap-3 w-full">
                      <button
                        disabled={restoreLoading}
                        onClick={() => setRestoreModal({ isOpen: false, userId: null })}
                        className="flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2 text-[#03045E] border-[#03045E] disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={restoreLoading}
                        onClick={confirmRestore}
                        className="flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer text-white flex items-center justify-center gap-2 disabled:opacity-80"
                        style={{ backgroundColor: '#2C7FFF', borderColor: '#2C7FFF', border: '2px solid #2C7FFF' }}
                      >
                        {restoreLoading ? (
                          <>
                            <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            Loading...
                          </>
                        ) : (
                          'Yes, Restore'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {rejectModal.isOpen && (
              <div
                className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
                style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
              >
                <div 
                  className="bg-[var(--color-card,#ffffff)] rounded-[2rem] w-full max-w-lg p-6 sm:p-8 shadow-[0_25px_60px_rgba(3,4,94,0.3)] border-2 flex flex-col gap-5"
                  style={{ borderColor: '#dc2626' }}
                >
                  <div>
                    <h2 className="text-xl font-black tracking-tight" style={{ color: '#b91c1c' }}>Reject Application & Cooldown</h2>
                    <p className="text-xs sm:text-sm font-bold text-[var(--color-text,#03045E)]/70 mt-1">Select a document issue. A 7-day reapplication cooldown will be automatically applied.</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Uploaded document is blurry or illegible. Please resubmit a clear copy after your 7-day cooldown period.",
                      "Uploaded document is expired. Please provide a valid, up-to-date document after your 7-day cooldown period.",
                      "Name on the document does not match profile name. You may resubmit after your 7-day cooldown period.",
                      "Invalid document type. Please upload a valid PWD ID or Business Registration after your 7-day cooldown period.",
                      "Document is cropped and missing important details. Please try again after your 7-day cooldown period."
                    ].map((standardReason, index) => (
                      <button
                        key={index}
                        type="button"
                        disabled={rejectLoading}
                        onClick={() => setRejectModal({ ...rejectModal, reason: standardReason })}
                        className="text-left px-3 py-2 text-xs font-black rounded-xl border-2 transition cursor-pointer disabled:opacity-50"
                        style={{
                          backgroundColor: 'rgba(220,38,38,0.1)',
                          color: '#b91c1c',
                          borderColor: '#dc2626'
                        }}
                      >
                        + {standardReason.split('.')[0]}
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    disabled={rejectLoading}
                    value={rejectModal.reason}
                    onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                    placeholder="Select a reason above or type a custom reason here..."
                    className="w-full p-4 border-2 border-[var(--color-border,rgba(3,4,94,0.2))] rounded-2xl resize-none focus:outline-none focus:ring-2 transition min-h-[140px] text-sm font-bold text-[var(--color-text,#03045E)] leading-relaxed bg-[var(--color-surface,#f4f4f4)] disabled:opacity-50"
                  ></textarea>
                  
                  <div className="flex gap-3 mt-2">
                    <button 
                      disabled={rejectLoading}
                      onClick={() => setRejectModal({ isOpen: false, userId: null, reason: '' })}
                      className="flex-1 py-3 bg-[var(--color-surface,#f4f4f4)] text-[var(--color-text,#03045E)] font-black text-sm rounded-xl border-2 border-[var(--color-border,rgba(3,4,94,0.2))] hover:bg-[var(--color-primary,#03045E)]/10 transition cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={rejectLoading}
                      onClick={submitRejection}
                      className="flex-1 py-3 font-black text-sm rounded-xl border-2 shadow-md transition flex justify-center items-center gap-2 cursor-pointer disabled:opacity-80"
                      style={{
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        borderColor: '#dc2626'
                      }}
                    >
                      {rejectLoading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                          Reject & Lock (7 Days)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, alert, onClick, color = 'blue' }) {
  const colorMap = {
    blue: {
      accent: '#1d4ed8',
      soft: 'rgba(29,78,216,0.08)',
      border: '#3b82f6',
      alertSoft: 'rgba(29,78,216,0.14)',
      alertBorder: '#3b82f6'
    },
    violet: {
      accent: '#2c7fff',
      soft: 'rgba(44,127,255,0.08)',
      border: '#2c7fff',
      alertSoft: 'rgba(44,127,255,0.14)',
      alertBorder: '#2c7fff'
    },
    amber: {
      accent: '#b45309',
      soft: 'rgba(180,83,9,0.08)',
      border: '#f59e0b',
      alertSoft: 'rgba(180,83,9,0.14)',
      alertBorder: '#f59e0b'
    },
    rose: {
      accent: '#be123c',
      soft: 'rgba(190,18,60,0.08)',
      border: '#dc2626',
      alertSoft: 'rgba(190,18,60,0.14)',
      alertBorder: '#dc2626'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;
  const isAlert = Boolean(alert);

  return (
    <div
      onClick={onClick}
      className={`p-3 sm:p-7 rounded-2xl sm:rounded-[2rem] shadow-sm border-2 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}`}
      style={{
        backgroundColor: 'var(--color-card, #ffffff)',
        borderColor: 'var(--color-border, rgba(3,4,94,0.15))'
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-4">
        <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider leading-tight" style={{ color: '#2c7fff' }}>
          {title}
        </h3>
        <div
          className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-2xl border flex items-center justify-center shrink-0"
          style={{
            borderColor: scheme.border,
            color: scheme.accent
          }}
        >
          <div className="w-3.5 h-3.5 sm:w-6 sm:h-6 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
            {icon}
          </div>
        </div>
      </div>
      <p className="text-2xl sm:text-4xl font-black tracking-tight leading-none" style={{ color: '#2c7fff' }}>
        {value}
      </p>
    </div>
  );
}