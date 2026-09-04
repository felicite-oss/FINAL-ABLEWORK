import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Main Tabs
  const [activeTab, setActiveTab] = useState('Overview');
  const [listFilter, setListFilter] = useState('Pending'); 

  // Data States
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Rejection Modal State
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
    localStorage.removeItem('user'); 
    navigate('/login'); 
  };

  // Handler for Verification (Approve/Reject)
  const handleVerification = async (userId, newStatus, reason = null) => {
    // Only prompt standard confirm if it's an approval. Rejection uses the modal.
    if (newStatus !== 'Rejected' && !window.confirm(`Mark this account as ${newStatus}?`)) return;
    
    try {
      const res = await fetch(`http://localhost:5001/api/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejection_reason: reason })
      });
      if (res.ok) {
        setRejectModal({ isOpen: false, userId: null, reason: '' }); // Close modal if open
        fetchAdminData();
      }
    } catch (error) { 
      alert("Failed to update status."); 
    }
  };

  // Submit handler specifically for the Rejection Modal
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

  if (isLoading) return <div className="p-10 font-bold text-[#03045E]">Loading Admin Console...</div>;

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn p-4 sm:p-6 relative">
      
      {/* --- HEADER WITH LOGOUT BUTTON --- */}
      <div className="mb-8 border-b border-[#03045E]/10 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#03045E]">Admin Control Center</h1>
          <p className="opacity-70 font-medium text-[#03045E] mt-1">
            Manage platform integrity, verify documents, and control account access.
          </p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 font-bold text-sm rounded-xl border border-red-200 hover:bg-red-100 hover:text-red-700 transition shadow-sm self-start"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      {/* MAIN TAB NAVIGATION */}
      <div className="mt-[-1rem] mb-6 flex flex-wrap gap-2">
        {['Overview', 'Employers', 'Applicants'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setListFilter('Pending'); 
            }}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab ? 'bg-[#03045E] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW STATS & ANALYTICS */}
      {activeTab === 'Overview' && stats && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Applicants" value={stats.totalApplicants} icon="👨‍🎓" />
            <StatCard title="Total Employers" value={stats.totalEmployers} icon="🏢" />
            <StatCard title="Pending Employers" value={stats.pendingEmployers} icon="⏳" alert={stats.pendingEmployers > 0} />
            <StatCard title="Pending Applicants" value={stats.pendingApplicants} icon="⏳" alert={stats.pendingApplicants > 0} />
          </div>

          {/* Annual Analytics Chart (Users Only) */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#03045E]/10">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-[#03045E]">Annual Platform Growth</h2>
              <p className="text-sm font-medium text-gray-500">Monthly registration volume for new users.</p>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12, fontWeight: 600}} />
                  <Tooltip 
                    cursor={{fill: '#F3F4F6'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  />
                  <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}}/>
                  <Bar dataKey="users" name="New Users" fill="#03045E" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TABS 2 & 3: USER MANAGEMENT */}
      {(activeTab === 'Employers' || activeTab === 'Applicants') && (
        <div className="flex flex-col gap-4">
          
          {/* SUB-FILTER TABS */}
          <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl w-fit">
            {['Pending', 'Approved', 'Rejected', 'Disabled'].map(filter => {
               const targetList = activeTab === 'Employers' ? employers : applicants;
               let count = 0;
               if (filter === 'Disabled') {
                 count = targetList.filter(i => i.account_status === 'Disabled').length;
               } else {
                 count = targetList.filter(i => i.verification_status === filter && i.account_status !== 'Disabled').length;
               }

               return (
                <button 
                  key={filter} 
                  onClick={() => setListFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
                    listFilter === filter ? 'bg-white text-[#03045E] shadow-sm' : 'text-gray-500 hover:text-[#03045E]'
                  }`}
                >
                  {filter}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${listFilter === filter ? 'bg-gray-200' : 'bg-gray-300/50'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* RENDER THE FILTERED LIST */}
          {filterList(activeTab === 'Employers' ? employers : applicants).length > 0 ? (
            filterList(activeTab === 'Employers' ? employers : applicants).map(user => (
              <div key={user.user_id} className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${listFilter === 'Disabled' ? 'opacity-70' : ''}`}>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#03045E]">
                    {activeTab === 'Employers' ? user.company_name : `${user.firstname} ${user.lastname}`}
                  </h3>
                  <p className="text-sm font-medium text-gray-500">
                    {activeTab === 'Employers' ? `Industry: ${user.industry}` : `Disability: ${user.disability_type}`} | Email: {user.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Registered: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  {activeTab === 'Employers' && user.verification_document && (
                    <a href={`http://localhost:5001/uploads/${user.verification_document.replace(/^uploads[\\/]/, '')}`} 
      target="_blank" rel="noopener noreferrer" className="text-center px-4 py-2 bg-blue-50 text-[#2C7FFF] font-bold text-sm rounded-lg border border-blue-100 hover:bg-blue-100 transition">📄 View Business Document</a>
                  )}
                  {activeTab === 'Applicants' && user.pwd_document_path && (
                    <a href={`http://localhost:5001/uploads/${user.pwd_document_path.replace(/^uploads[\\/]/, '')}`} target="_blank" rel="noopener noreferrer" className="text-center px-4 py-2 bg-purple-50 text-purple-700 font-bold text-sm rounded-lg border border-purple-100 hover:bg-purple-100 transition">🆔 View PWD ID</a>
                  )}
                  {(!user.verification_document && !user.pwd_document_path) && (
                    <span className="text-center px-4 py-2 bg-gray-50 text-gray-400 font-bold text-sm rounded-lg border border-gray-200">No Document Attached</span>
                  )}
                  
                  <div className="flex gap-2">
                    {listFilter === 'Pending' && (
                      <>
                        <button 
                          onClick={() => setRejectModal({ isOpen: true, userId: user.user_id, reason: '' })} 
                          className="flex-1 py-2 bg-red-100 text-red-700 font-bold text-sm rounded-lg hover:bg-red-200 transition"
                        >
                          Reject
                        </button>
                        <button onClick={() => handleVerification(user.user_id, 'Approved')} className="flex-1 py-2 bg-emerald-500 text-white font-bold text-sm rounded-lg hover:bg-emerald-600 shadow-sm transition">Approve</button>
                      </>
                    )}
                    {listFilter === 'Approved' && (
                      <button onClick={() => handleAccountStatus(user.user_id, 'Disabled')} className="flex-1 py-2 bg-gray-800 text-white font-bold text-sm rounded-lg hover:bg-black shadow-sm">Disable Account</button>
                    )}
                    {listFilter === 'Rejected' && (
                      <button onClick={() => handleVerification(user.user_id, 'Approved')} className="flex-1 py-2 bg-emerald-100 text-emerald-800 font-bold text-sm rounded-lg hover:bg-emerald-200 shadow-sm transition">Approve (Re-evaluate)</button>
                    )}
                    {listFilter === 'Disabled' && (
                      <button onClick={() => handleAccountStatus(user.user_id, 'Active')} className="flex-1 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 shadow-sm">Restore Account</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50">
              <p className="text-sm font-bold text-gray-500">No {listFilter.toLowerCase()} users found in this category.</p>
            </div>
          )}
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl flex flex-col gap-5 animate-fadeIn">
            <div>
              <h2 className="text-xl font-extrabold text-[#03045E]">Reject Application & Trigger Cooldown</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">Select a document issue. A 7-day reapplication cooldown will be automatically applied to this user.</p>
            </div>
            
            {/* Quick-Select Standard Reasons (Includes Cooldown Messaging) */}
            <div className="flex flex-wrap gap-2">
              {[
                "Uploaded document is blurry or illegible. Please resubmit a clear copy after your 7-day cooldown period.",
                "Uploaded document is expired. Please provide a valid, up-to-date document after your 7-day cooldown period.",
                "Name on the document does not match the registered profile name. You may resubmit after your 7-day cooldown period.",
                "Invalid document type. Please upload a valid PWD ID or Business Registration after your 7-day cooldown period.",
                "Document is cropped and missing important verification details. Please try again after your 7-day cooldown period."
              ].map((standardReason, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setRejectModal({ ...rejectModal, reason: standardReason })}
                  className="text-left px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition"
                >
                  + {standardReason.split('.')[0]} {/* Shows a shorter label on the chip */}
                </button>
              ))}
            </div>
            
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="Select a reason above or type a custom reason here..."
              className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition min-h-[140px] text-sm text-[#03045E] leading-relaxed"
            ></textarea>
            
            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => setRejectModal({ isOpen: false, userId: null, reason: '' })}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={submitRejection}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md transition flex justify-center items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Reject & Lock (7 Days)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, icon, alert }) {
  return (
    <div className={`p-6 rounded-3xl shadow-sm border ${alert ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xs font-extrabold uppercase tracking-wider ${alert ? 'text-red-700' : 'text-gray-500'}`}>{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-4xl font-black tracking-tight ${alert ? 'text-red-600' : 'text-[#03045E]'}`}>{value}</p>
    </div>
  );
}