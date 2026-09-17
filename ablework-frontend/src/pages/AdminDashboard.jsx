import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import headerLogo from '../assets/LIGHT MODE.png';

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

  const fetchAdminData = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
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
    fetchAdminData();
  }, [navigate]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('user'); 
      navigate('/login'); 
    }, 2000);
  };

  const handleVerification = async (userId, newStatus, reason = null) => {
    if (newStatus !== 'Rejected' && !window.confirm(`Mark this account as ${newStatus}?`)) return;
    
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
        fetchAdminData();
      }
    } catch (error) { 
      alert("Failed to update status."); 
    }
  };

  const submitRejection = () => {
    if (!rejectModal.reason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    handleVerification(rejectModal.userId, 'Rejected', rejectModal.reason);
  };

  const handleAccountStatus = async (userId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus === 'Disabled' ? 'DISABLE' : 'ENABLE'} this account?`)) return;
    try {
      const res = await fetch(`http://localhost:5001/api/admin/users/${userId}/account-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_status: newStatus })
      });
      if (res.ok) fetchAdminData();
    } catch (error) { alert("Failed to update account status."); }
  };

  const filterList = (list) => {
    return list.filter(item => {
      if (listFilter === 'Disabled') return item.account_status === 'Disabled';
      if (item.account_status === 'Disabled') return false;
      return item.verification_status === listFilter;
    });
  };

  if (isLoggingOut) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f4f4] relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[#f4f4f4]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 transition-all duration-300">
        <div className="bg-white border-2 border-[#03045E]/20 px-6 py-8 sm:px-8 sm:py-10 rounded-3xl shadow-[0_20px_50px_rgba(3,4,94,0.15)] flex flex-col items-center max-w-sm w-full mx-auto transform animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-16 h-16 flex items-center justify-center mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-red-500 border-r-transparent border-b-[#03045E] border-l-transparent animate-spin"></div>
            <div className="w-6 h-6 rounded-full bg-red-500 shadow-md animate-ping opacity-75 absolute"></div>
          </div>
          <h3 className="text-lg font-black text-red-600 tracking-tight text-center mb-1">Logging out...</h3>
          <p className="text-xs text-[#03045E]/80 text-center font-bold">Please wait while we securely end your session.</p>
        </div>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f4f4] relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[#f4f4f4]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 transition-all duration-300">
        <div className="bg-white border-2 border-[#03045E]/20 px-6 py-8 sm:px-8 sm:py-10 rounded-3xl shadow-[0_20px_50px_rgba(3,4,94,0.15)] flex flex-col items-center max-w-sm w-full mx-auto transform animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-16 h-16 flex items-center justify-center mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-[#2C7FFF]/30 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#2C7FFF] border-r-transparent border-b-[#03045E] border-l-transparent animate-spin"></div>
            <div className="w-6 h-6 rounded-full bg-[#03045E] shadow-md animate-ping opacity-75 absolute"></div>
          </div>
          <h3 className="text-lg font-black text-[#03045E] tracking-tight text-center mb-1">Loading Admin Console</h3>
          <p className="text-xs text-[#03045E]/80 text-center font-bold">Preparing workspace and analytics...</p>
        </div>
      </div>
    </div>
  );
  
  const allUsers = [...employers.map(e => ({ ...e, userType: 'Employer' })), ...applicants.map(a => ({ ...a, userType: 'Applicant' }))];

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4] text-[#03045E] selection:bg-[#2C7FFF] selection:text-white relative overflow-x-clip w-full max-w-[100vw]">
      
      <header className="w-full bg-white border-b-2 border-[#03045E]/15 fixed top-0 left-0 z-50 transition-all duration-300 shadow-sm">
        <div className="w-full h-16 pl-4 pr-4 md:pr-8 flex items-center justify-between max-w-[1700px] mx-auto box-border">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-6 min-w-0">
            <div className="flex items-center flex-shrink-0 cursor-pointer overflow-hidden py-1" onClick={() => setActiveTab('Overview')}>
              <img
                src={headerLogo}
                alt="AbleWork Logo"
                className="h-14 w-auto object-contain max-h-full hover:opacity-95 transition-opacity"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-700 font-extrabold text-sm rounded-xl border-2 border-red-500/40 hover:bg-red-500 hover:text-white hover:border-red-500 transition shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>

            <button
              className="md:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-[#03045E] border-2 border-[#03045E]/20 shadow-sm cursor-pointer hover:bg-[#03045E] hover:text-white transition-all duration-200 shrink-0"
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
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-b-2 border-[#03045E]/20 ${
            isOpen ? 'max-h-[400px] opacity-100 shadow-xl' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="w-full">
            <nav className="flex flex-col px-3 sm:px-6 py-4 sm:py-6 gap-2 text-[15px] sm:text-[16px] font-bold text-[#03045E]">
              {['Overview', 'Employers', 'Applicants'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => { setActiveTab(tab); setListFilter('Pending'); setIsOpen(false); }} 
                  className={`flex items-center gap-3 text-left px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-black transition-all capitalize cursor-pointer border-2 ${
                    activeTab === tab 
                      ? 'bg-[#03045E] text-white border-[#03045E] shadow-md' 
                      : 'border-[#03045E]/20 text-[#03045E] hover:bg-[#2C7FFF]/15 hover:border-[#2C7FFF]'
                  }`}
                >
                  <span className="text-xs sm:text-sm truncate tracking-wide">{tab}</span>
                </button>
              ))}
              <div className="h-0.5 bg-[#03045E]/15 my-1"></div>
              <button
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className="flex items-center gap-3 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-red-500/10 text-red-700 text-xs sm:text-sm font-black border-2 border-red-500/40 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer text-left shadow-sm"
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

      <div className="flex flex-col w-full max-w-[1700px] mx-auto min-w-0 box-border pt-16 flex-1">
        <div className="flex flex-col md:flex-row flex-1 w-full min-w-0">
          
          <aside className="hidden md:flex shrink-0 flex-col z-10 bg-white border-r-2 border-[#03045E]/15 w-72 lg:w-80 sticky top-16 h-[calc(100vh-4rem)] self-start shadow-[4px_0_24px_rgba(3,4,94,0.05)]">
            <div className="w-full flex flex-col h-full min-w-0">
              <nav className="flex-1 px-5 py-8 flex flex-col gap-3.5 overflow-y-auto">
                {['Overview', 'Employers', 'Applicants'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => { setActiveTab(tab); setListFilter('Pending'); }} 
                    className={`group flex items-center gap-3.5 text-left px-4 py-3.5 rounded-xl font-extrabold transition-all duration-200 capitalize cursor-pointer border-2 ${
                      activeTab === tab 
                        ? 'bg-[#03045E] text-white border-[#03045E] shadow-sm' 
                        : 'bg-white text-[#03045E] border-[#03045E]/20 hover:bg-[#2C7FFF]/10 hover:border-[#2C7FFF] hover:text-[#2C7FFF]'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors duration-200 shrink-0 ${
                      activeTab === tab 
                        ? 'bg-[#2C7FFF] text-white' 
                        : 'bg-[#03045E]/5 text-[#03045E] group-hover:bg-[#2C7FFF]/20 group-hover:text-[#2C7FFF]'
                    }`}>
                      {tab === 'Overview' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                      )}
                      {tab === 'Employers' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      )}
                      {tab === 'Applicants' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                      )}
                    </div>
                    <span className="text-base tracking-wide font-extrabold truncate">{tab}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1 p-4 sm:p-6 md:p-10 relative w-full min-w-0 transition-all duration-300 flex flex-col box-border">
            
            <div className="mb-8 border-b-2 border-[#03045E]/15 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-[#03045E] tracking-tight">Admin Control Center</h1>
                <p className="text-sm font-bold text-[#03045E]/70 mt-1">
                  Manage platform integrity, verify documents, and control account access securely.
                </p>
              </div>
            </div>

            {activeTab === 'Overview' && stats && (
              <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-[#03045E]/15">
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-[#03045E] tracking-tight">Annual Platform Growth</h2>
                    <p className="text-xs font-bold text-[#03045E]/70 mt-0.5">Monthly registration volume for new users.</p>
                  </div>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#03045E/10" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#03045E', fontSize: 12, fontWeight: 700}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#03045E', fontSize: 12, fontWeight: 700}} />
                        <Tooltip 
                          cursor={{fill: 'rgba(44,127,255,0.1)'}}
                          contentStyle={{borderRadius: '16px', border: '2px solid rgba(3,4,94,0.15)', boxShadow: '0 10px 25px rgba(3,4,94,0.1)', fontWeight: 'bold', color: '#03045E'}}
                        />
                        <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontWeight: 'bold'}}/>
                        <Bar dataKey="users" name="New Users" fill="#03045E" radius={[6, 6, 0, 0]} barSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-[#03045E]/15 flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#03045E]/10 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-[#03045E] tracking-tight">All Registered Users Overview</h2>
                      <p className="text-xs font-bold text-[#03045E]/70 mt-0.5">Comprehensive list of all platform applicants and employers.</p>
                    </div>
                    <span className="px-4 py-1.5 bg-[#03045E]/10 text-[#03045E] font-black text-xs rounded-xl border border-[#03045E]/20 w-fit">
                      Total: {allUsers.length} Users
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                    {allUsers.length > 0 ? (
                      allUsers.map((user) => (
                        <div key={user.user_id} className="p-4 sm:p-5 rounded-2xl bg-[#f4f4f4] border-2 border-[#03045E]/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#2C7FFF] transition-all">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#03045E] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                              {user.userType === 'Employer' ? (user.company_name?.[0] || 'E') : (user.firstname?.[0] || 'A')}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-[#03045E] truncate">
                                {user.userType === 'Employer' ? user.company_name : `${user.firstname} ${user.lastname}`}
                              </h4>
                              <p className="text-xs font-bold text-[#03045E]/70 truncate">{user.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase ${user.userType === 'Employer' ? 'bg-violet-500/15 text-violet-700 border border-violet-500/30' : 'bg-blue-500/15 text-blue-700 border border-blue-500/30'}`}>
                              {user.userType}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase ${
                              user.account_status === 'Disabled' ? 'bg-red-500/10 text-red-700 border border-red-500/40' :
                              user.verification_status === 'Approved' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/40' :
                              user.verification_status === 'Rejected' ? 'bg-red-500/10 text-red-700 border border-red-500/40' :
                              'bg-amber-500/10 text-amber-700 border border-amber-500/40'
                            }`}>
                              {user.account_status === 'Disabled' ? 'Disabled' : (user.verification_status || 'Pending')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs font-bold text-[#03045E]/70">No registered users found.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'Employers' || activeTab === 'Applicants') && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                
                <div className="flex flex-wrap items-center gap-2 bg-white p-3 sm:p-4 rounded-[2rem] border-2 border-[#03045E]/15 w-full shadow-sm">
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

                     return (
                      <button 
                        key={filter} 
                        onClick={() => setListFilter(filter)}
                        className={`flex-1 min-w-[110px] px-4 py-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          listFilter === filter 
                            ? (isRedFilter ? 'bg-red-500 text-white shadow-md ring-2 ring-red-500/25' : isGreenFilter ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-500/25' : 'bg-[#03045E] text-white shadow-md ring-2 ring-[#03045E]/25')
                            : (isRedFilter ? 'bg-transparent text-red-600 hover:bg-red-500/10 hover:text-red-700' : isGreenFilter ? 'bg-transparent text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700' : 'bg-transparent text-[#03045E]/70 hover:bg-[#2C7FFF]/10 hover:text-[#2C7FFF]')
                        }`}
                      >
                        <span className="truncate">{filter}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
                          listFilter === filter 
                            ? (isRedFilter ? 'bg-white/20 text-white' : isGreenFilter ? 'bg-white/20 text-white' : 'bg-[#2C7FFF] text-white') 
                            : (isRedFilter ? 'bg-red-500/15 text-red-700' : isGreenFilter ? 'bg-emerald-500/15 text-emerald-700' : 'bg-[#03045E]/10 text-[#03045E]')
                        }`}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="flex flex-col gap-4">
                  {filterList(activeTab === 'Employers' ? employers : applicants).length > 0 ? (
                    filterList(activeTab === 'Employers' ? employers : applicants).map(user => (
                      <div key={user.user_id} className={`bg-white p-6 sm:p-7 rounded-[2rem] shadow-sm border-2 border-[#03045E]/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all hover:shadow-md hover:border-[#2C7FFF]/40 ${listFilter === 'Disabled' ? 'opacity-70 bg-[#f4f4f4]/50' : ''}`}>
                        
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 font-black text-lg ${
                            activeTab === 'Employers' 
                              ? 'bg-violet-500/10 text-violet-700 border-violet-500/20' 
                              : 'bg-blue-500/10 text-blue-700 border-blue-500/20'
                          }`}>
                            {activeTab === 'Employers' ? (user.company_name?.[0] || 'E') : (user.firstname?.[0] || 'A')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-black text-[#03045E] tracking-tight truncate">
                              {activeTab === 'Employers' ? user.company_name : `${user.firstname} ${user.lastname}`}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-[#03045E]/70 mt-1">
                              <span className="bg-[#f4f4f4] px-2.5 py-1 rounded-lg border border-[#03045E]/10">
                                {activeTab === 'Employers' ? 'Industry:' : 'Disability:'} <strong className="text-[#03045E]">{activeTab === 'Employers' ? (user.industry || 'N/A') : (user.disability_type || 'N/A')}</strong>
                              </span>
                              <span>•</span>
                              <span className="truncate">Email: <strong className="text-[#03045E]">{user.email}</strong></span>
                            </div>
                            <div className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider mt-2.5 ${activeTab === 'Employers' ? 'text-violet-600' : 'text-blue-600'}`}>
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              Registered: {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[240px] w-full md:w-auto shrink-0">
                          {activeTab === 'Employers' && user.verification_document && (
                            <button 
                              onClick={() => setEmployerModal({ isOpen: true, user: user })} 
                              className="text-center px-4 py-2.5 bg-violet-500/10 text-violet-700 font-black text-xs sm:text-sm rounded-xl border-2 border-violet-500/30 hover:bg-violet-500/20 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                            >
                              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                              View Business Document
                            </button>
                          )}
                          
                          {activeTab === 'Applicants' && user.pwd_document_path && (
                            <button 
                              onClick={() => setPwdModal({ isOpen: true, user: user })} 
                              className="text-center px-4 py-2.5 bg-blue-500/10 text-blue-700 font-black text-xs sm:text-sm rounded-xl border-2 border-blue-500/30 hover:bg-blue-500/20 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                            >
                              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                              </svg>
                              View PWD ID
                            </button>
                          )}

                          {(!user.verification_document && !user.pwd_document_path) && (
                            <div className="text-center px-4 py-2.5 bg-[#f4f4f4] text-[#03045E]/50 font-black text-xs sm:text-sm rounded-xl border-2 border-[#03045E]/10 flex items-center justify-center gap-2">
                              No Document Attached
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            {listFilter === 'Pending' && (
                              <>
                                <button 
                                  onClick={() => setRejectModal({ isOpen: true, userId: user.user_id, reason: '' })} 
                                  className="flex-1 py-2.5 bg-red-500/10 text-red-700 font-black text-xs sm:text-sm rounded-xl border-2 border-red-500/40 hover:bg-red-500 hover:text-white transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                                >
                                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                  Reject
                                </button>
                                <button 
                                  onClick={() => handleVerification(user.user_id, 'Approved')} 
                                  className="flex-1 py-2.5 bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl border-2 border-emerald-500 hover:bg-emerald-600 shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  Approve
                                </button>
                              </>
                            )}
                            {listFilter === 'Approved' && (
                              <button 
                                onClick={() => handleAccountStatus(user.user_id, 'Disabled')} 
                                className="w-full py-2.5 bg-red-500/10 text-red-700 font-black text-xs sm:text-sm rounded-xl border-2 border-red-500/40 hover:bg-red-500 hover:text-white shadow-sm cursor-pointer flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                                </svg>
                                Disable Account
                              </button>
                            )}
                            {listFilter === 'Rejected' && (
                              <button 
                                onClick={() => handleVerification(user.user_id, 'Approved')} 
                                className="w-full py-2.5 bg-emerald-500/10 text-emerald-700 font-black text-xs sm:text-sm rounded-xl border-2 border-emerald-500/40 hover:bg-emerald-500 hover:text-white shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                Approve (Re-evaluate)
                              </button>
                            )}
                            {listFilter === 'Disabled' && (
                              <button 
                                onClick={() => handleAccountStatus(user.user_id, 'Active')} 
                                className="w-full py-2.5 bg-[#2C7FFF] text-white font-black text-xs sm:text-sm rounded-xl border-2 border-[#2C7FFF] hover:bg-[#2C7FFF]/90 shadow-sm cursor-pointer flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                Restore Account
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-16 text-center border-2 border-dashed border-[#03045E]/20 rounded-[2rem] bg-white shadow-sm flex flex-col items-center justify-center">
                      <div className="w-14 h-14 bg-[#2C7FFF]/15 text-[#2C7FFF] rounded-2xl flex items-center justify-center mb-4 border-2 border-[#2C7FFF]/30">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                        </svg>
                      </div>
                      <p className="text-base font-black text-[#03045E]">No {listFilter.toLowerCase()} {activeTab.toLowerCase()} found.</p>
                      <p className="text-xs font-bold text-[#03045E]/70 mt-1">Check back later for new registrations in this category.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {pwdModal.isOpen && pwdModal.user && (
              <div className="fixed inset-0 bg-[#03045E]/60 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
                <div className="bg-white rounded-[2.5rem] w-full max-w-7xl h-[90vh] shadow-[0_25px_60px_rgba(3,4,94,0.4)] border-2 border-[#03045E]/20 flex flex-col overflow-hidden">
                  
                  <div className="px-6 py-4 bg-[#f4f4f4] border-b-2 border-[#03045E]/15 flex items-center justify-between shrink-0">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-[#03045E] tracking-tight">
                        PWD ID Verification: {pwdModal.user.firstname} {pwdModal.user.lastname}
                      </h2>
                      <p className="text-xs font-bold text-[#03045E]/70">
                        Review applicant PWD ID and cross-reference with the official portal.
                      </p>
                    </div>
                    <button
                      onClick={() => setPwdModal({ isOpen: false, user: null })}
                      className="w-10 h-10 rounded-full bg-white text-[#03045E] border-2 border-[#03045E]/20 flex items-center justify-center font-black hover:bg-[#03045E] hover:text-white transition cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x-2 divide-[#03045E]/15 overflow-hidden">
                    
                    <div className="lg:col-span-2 flex flex-col h-full bg-white overflow-y-auto p-6 gap-6">
                      <div className="flex items-center justify-between shrink-0">
                        <span className="text-xs font-black uppercase tracking-wider text-[#03045E]">Applicant Uploaded ID</span>
                        <span className="px-3 py-1 rounded-lg text-xs font-black bg-blue-500/10 text-blue-700">
                          Disability: {pwdModal.user.disability_type || 'N/A'}
                        </span>
                      </div>

                      <div className="flex-1 min-h-[350px] bg-[#f4f4f4] rounded-2xl border-2 border-[#03045E]/15 overflow-hidden flex items-center justify-center relative shadow-inner p-2">
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
                          <p className="text-sm font-bold text-[#03045E]/50">No document uploaded.</p>
                        )}
                      </div>

                      <div className="flex gap-3 pt-4 border-t-2 border-[#03045E]/10 shrink-0">
                        <button
                          onClick={() => {
                            const userId = pwdModal.user.user_id;
                            setPwdModal({ isOpen: false, user: null });
                            setRejectModal({ isOpen: true, userId: userId, reason: '' });
                          }}
                          className="flex-1 py-3.5 bg-red-500/10 text-red-700 font-black text-sm rounded-xl border-2 border-red-500/40 hover:bg-red-500 hover:text-white transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
                        >
                          ✕ Reject & Cooldown
                        </button>
                        <button
                          onClick={() => handleVerification(pwdModal.user.user_id, 'Approved')}
                          className="flex-1 py-3.5 bg-emerald-500 text-white font-black text-sm rounded-xl border-2 border-emerald-500 hover:bg-emerald-600 shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          ✓ Approve PWD ID
                        </button>
                      </div>

                    </div>

                    <div className="lg:col-span-1 flex flex-col h-full bg-[#f4f4f4]/50 overflow-y-auto p-6 justify-center items-center text-center">
                      <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 mb-4 border border-blue-500/30 shadow-sm">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                      </div>
                      <h3 className="text-base font-black text-[#03045E] mb-2">DOH Verification Portal</h3>
                      <p className="text-xs font-bold text-[#03045E]/70 mb-6 leading-relaxed">
                        Government security policies prevent direct website embedding. Open the portal in a new tab to cross-check details.
                      </p>
                      <a
                        href="https://pwd.doh.gov.ph"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 bg-[#03045E] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-[#2C7FFF] transition flex items-center justify-center gap-2"
                      >
                        Launch Portal ↗
                      </a>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {employerModal.isOpen && employerModal.user && (
              <div className="fixed inset-0 bg-[#03045E]/60 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
                <div className="bg-white rounded-[2.5rem] w-full max-w-4xl h-[85vh] shadow-[0_25px_60px_rgba(3,4,94,0.4)] border-2 border-[#03045E]/20 flex flex-col overflow-hidden">
                  
                  <div className="px-6 py-4 bg-[#f4f4f4] border-b-2 border-[#03045E]/15 flex items-center justify-between shrink-0">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-[#03045E] tracking-tight">
                        Business Registration: {employerModal.user.company_name}
                      </h2>
                      <p className="text-xs font-bold text-[#03045E]/70">
                        Review company registration permit or DTI/SEC document.
                      </p>
                    </div>
                    <button
                      onClick={() => setEmployerModal({ isOpen: false, user: null })}
                      className="w-10 h-10 rounded-full bg-white text-[#03045E] border-2 border-[#03045E]/20 flex items-center justify-center font-black hover:bg-[#03045E] hover:text-white transition cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col bg-white p-6 gap-6 overflow-hidden">
                    <div className="flex items-center justify-between shrink-0">
                      <span className="text-xs font-black uppercase tracking-wider text-[#03045E]">Uploaded Verification File</span>
                      <span className="px-3 py-1 rounded-lg text-xs font-black bg-violet-500/10 text-violet-700">
                        Industry: {employerModal.user.industry || 'N/A'}
                      </span>
                    </div>

                    <div className="flex-1 bg-[#f4f4f4] rounded-2xl border-2 border-[#03045E]/15 overflow-hidden flex items-center justify-center relative shadow-inner p-2">
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
                        <p className="text-sm font-bold text-[#03045E]/50">No document uploaded.</p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2 border-t-2 border-[#03045E]/10 shrink-0">
                      <button
                        onClick={() => {
                          const userId = employerModal.user.user_id;
                          setEmployerModal({ isOpen: false, user: null });
                          setRejectModal({ isOpen: true, userId: userId, reason: '' });
                        }}
                        className="flex-1 py-3.5 bg-red-500/10 text-red-700 font-black text-sm rounded-xl border-2 border-red-500/40 hover:bg-red-500 hover:text-white transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
                      >
                        ✕ Reject & Cooldown
                      </button>
                      <button
                        onClick={() => {
                          handleVerification(employerModal.user.user_id, 'Approved');
                          setEmployerModal({ isOpen: false, user: null });
                        }}
                        className="flex-1 py-3.5 bg-emerald-500 text-white font-black text-sm rounded-xl border-2 border-emerald-500 hover:bg-emerald-600 shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        ✓ Approve Employer Permit
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {rejectModal.isOpen && (
              <div className="fixed inset-0 bg-[#03045E]/50 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
                <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 sm:p-8 shadow-[0_25px_60px_rgba(3,4,94,0.3)] border-2 border-red-500/30 flex flex-col gap-5">
                  <div>
                    <h2 className="text-xl font-black text-red-700 tracking-tight">Reject Application & Cooldown</h2>
                    <p className="text-xs sm:text-sm font-bold text-[#03045E]/70 mt-1">Select a document issue. A 7-day reapplication cooldown will be automatically applied.</p>
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
                        onClick={() => setRejectModal({ ...rejectModal, reason: standardReason })}
                        className="text-left px-3 py-2 bg-red-500/10 text-red-700 text-xs font-black rounded-xl border-2 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition cursor-pointer"
                      >
                        + {standardReason.split('.')[0]}
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    value={rejectModal.reason}
                    onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                    placeholder="Select a reason above or type a custom reason here..."
                    className="w-full p-4 border-2 border-[#03045E]/20 rounded-2xl resize-none focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition min-h-[140px] text-sm font-bold text-[#03045E] leading-relaxed bg-[#f4f4f4]"
                  ></textarea>
                  
                  <div className="flex gap-3 mt-2">
                    <button 
                      onClick={() => setRejectModal({ isOpen: false, userId: null, reason: '' })}
                      className="flex-1 py-3 bg-[#f4f4f4] text-[#03045E] font-black text-sm rounded-xl border-2 border-[#03045E]/20 hover:bg-[#03045E]/10 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={submitRejection}
                      className="flex-1 py-3 bg-red-500 text-white font-black text-sm rounded-xl border-2 border-red-500 hover:bg-red-600 shadow-md transition flex justify-center items-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      Reject & Lock (7 Days)
                    </button>
                  </div>
                </div>
              </div>
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
      text: 'text-blue-700',
      iconBg: 'bg-blue-500/10',
      iconBorder: 'border-blue-500/30',
      alertBg: 'bg-blue-500/5',
      alertBorder: 'border-blue-500/40'
    },
    violet: {
      text: 'text-violet-700',
      iconBg: 'bg-violet-500/10',
      iconBorder: 'border-violet-500/30',
      alertBg: 'bg-violet-500/5',
      alertBorder: 'border-violet-500/40'
    },
    amber: {
      text: 'text-amber-700',
      iconBg: 'bg-amber-500/10',
      iconBorder: 'border-amber-500/30',
      alertBg: 'bg-amber-500/5',
      alertBorder: 'border-amber-500/40'
    },
    rose: {
      text: 'text-rose-700',
      iconBg: 'bg-rose-500/10',
      iconBorder: 'border-rose-500/30',
      alertBg: 'bg-rose-500/5',
      alertBorder: 'border-rose-500/40'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div 
      onClick={onClick}
      className={`p-6 sm:p-7 rounded-[2rem] shadow-sm border-2 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''} ${alert ? scheme.alertBorder + ' ' + scheme.alertBg : 'border-[#03045E]/15 bg-white'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xs font-black uppercase tracking-wider ${scheme.text}`}>{title}</h3>
        <div className={`p-2.5 rounded-2xl ${scheme.iconBg} border ${scheme.iconBorder} flex items-center justify-center ${scheme.text}`}>
          {icon}
        </div>
      </div>
      <p className={`text-4xl font-black tracking-tight ${scheme.text}`}>{value}</p>
    </div>
  );
}