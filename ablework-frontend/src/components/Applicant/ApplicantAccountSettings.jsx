import React, { useState } from 'react';

export default function ApplicantAccountSettings({ profile }) {
  const [activeMenu, setActiveMenu] = useState('security');
  
  // Toggle States
  const [notifMatches, setNotifMatches] = useState(true);
  const [notifStatus, setNotifStatus] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);

  const handlePasswordReset = (e) => {
    e.preventDefault();
    alert("Password updated successfully!");
  };

  const handleDeactivate = () => {
    if(window.confirm("Are you sure you want to deactivate your account? Your applications will be withdrawn.")) {
      alert("Account deactivated.");
    }
  };

  return (
    <div className="animate-fadeIn max-w-6xl relative pb-10 text-[#03045E]">
      <div className="mb-8 border-b border-[#03045E]/20 pb-4">
        <h1 className="text-3xl font-extrabold text-[#03045E]">Account Settings</h1>
        <p className="font-semibold text-[#03045E] mt-1">Manage your security and notification preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        
        {/* SETTINGS INNER SIDEBAR */}
        <aside className="w-full md:w-64 flex flex-col gap-3 shrink-0">
          <button onClick={() => setActiveMenu('security')} className={`text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 cursor-pointer ${activeMenu === 'security' ? 'bg-[#03045E] text-[#f4f4f4] shadow-md' : 'bg-[#f4f4f4] text-[#03045E] border border-[#03045E]/20 hover:bg-[#2C7FFF]/10'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security & Login
          </button>
          <button onClick={() => setActiveMenu('notifications')} className={`text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 cursor-pointer ${activeMenu === 'notifications' ? 'bg-[#03045E] text-[#f4f4f4] shadow-md' : 'bg-[#f4f4f4] text-[#03045E] border border-[#03045E]/20 hover:bg-[#2C7FFF]/10'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
          </button>
          <button onClick={() => setActiveMenu('privacy')} className={`text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 cursor-pointer ${activeMenu === 'privacy' ? 'bg-[#03045E] text-[#f4f4f4] shadow-md' : 'bg-[#f4f4f4] text-[#03045E] border border-[#03045E]/20 hover:bg-[#2C7FFF]/10'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Privacy
          </button>
          <button onClick={() => setActiveMenu('danger')} className={`text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 mt-4 cursor-pointer ${activeMenu === 'danger' ? 'bg-[#03045E] text-[#f4f4f4] shadow-md' : 'bg-[#f4f4f4] text-[#03045E] border border-[#03045E]/20 hover:bg-[#2C7FFF]/10'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Danger Zone
          </button>
        </aside>

        {/* SETTINGS CONTENT AREA */}
        <div className="flex-1 bg-[#f4f4f4] p-8 rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.04)] border border-[#03045E]/20 min-h-[500px]">
          
          {/* SECURITY SECTION */}
          {activeMenu === 'security' && (
            <div className="animate-fadeIn max-w-lg">
              <h2 className="text-2xl font-extrabold text-[#03045E] border-b border-[#03045E]/20 pb-4 mb-6">Security & Authentication</h2>
              <div className="flex flex-col gap-8">
                <div>
                  <p className="text-sm font-bold text-[#03045E] uppercase mb-2">Account Email</p>
                  <p className="font-semibold text-[#03045E] bg-white p-4 rounded-2xl border border-[#03045E]/20">{profile?.email}</p>
                </div>
                
                <form onSubmit={handlePasswordReset} className="flex flex-col gap-3">
                  <p className="text-sm font-bold text-[#03045E] uppercase mb-1">Change Password</p>
                  <input type="password" placeholder="Current Password" required className="p-3.5 pl-4 bg-white border border-[#03045E]/20 rounded-2xl focus:border-[#2C7FFF] focus:ring-4 focus:ring-[#2C7FFF]/20 outline-none text-[#03045E] placeholder:text-[#03045E]/40 font-medium text-sm transition-all" />
                  <input type="password" placeholder="New Password" required className="p-3.5 pl-4 bg-white border border-[#03045E]/20 rounded-2xl focus:border-[#2C7FFF] focus:ring-4 focus:ring-[#2C7FFF]/20 outline-none text-[#03045E] placeholder:text-[#03045E]/40 font-medium text-sm transition-all" />
                  <button type="submit" className="mt-2 py-4 bg-[#03045E] text-[#f4f4f4] font-bold rounded-2xl hover:bg-[#2C7FFF] transition-all shadow-[0_10px_25px_rgba(3,4,94,0.15)] cursor-pointer">Update Password</button>
                </form>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeMenu === 'notifications' && (
            <div className="animate-fadeIn max-w-lg">
              <h2 className="text-2xl font-extrabold text-[#03045E] border-b border-[#03045E]/20 pb-4 mb-6">Notification Preferences</h2>
              <div className="flex flex-col gap-6">
                <label className="flex items-center justify-between p-5 bg-white rounded-2xl border border-[#03045E]/20 cursor-pointer hover:border-[#2C7FFF] transition-all shadow-sm">
                  <div>
                    <p className="font-bold text-[#03045E]">New Smart Matches</p>
                    <p className="text-sm font-semibold text-[#03045E]">Email me when a new job matches my profile.</p>
                  </div>
                  <input type="checkbox" checked={notifMatches} onChange={() => setNotifMatches(!notifMatches)} className="w-5 h-5 accent-[#2C7FFF] cursor-pointer" />
                </label>

                <label className="flex items-center justify-between p-5 bg-white rounded-2xl border border-[#03045E]/20 cursor-pointer hover:border-[#2C7FFF] transition-all shadow-sm">
                  <div>
                    <p className="font-bold text-[#03045E]">Application Updates</p>
                    <p className="text-sm font-semibold text-[#03045E]">Email me when an employer changes my status.</p>
                  </div>
                  <input type="checkbox" checked={notifStatus} onChange={() => setNotifStatus(!notifStatus)} className="w-5 h-5 accent-[#2C7FFF] cursor-pointer" />
                </label>
              </div>
            </div>
          )}

          {/* PRIVACY SECTION */}
          {activeMenu === 'privacy' && (
            <div className="animate-fadeIn max-w-lg">
              <h2 className="text-2xl font-extrabold text-[#03045E] border-b border-[#03045E]/20 pb-4 mb-6">Privacy Options</h2>
              <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-[#03045E]/20 shadow-sm">
                <div className="pr-4">
                  <p className="font-bold text-[#03045E]">Make Profile Discoverable</p>
                  <p className="text-sm font-semibold text-[#03045E] mt-0.5">Allow verified employers to view your profile and invite you to apply for jobs.</p>
                </div>
                <button onClick={() => setProfileVisible(!profileVisible)} className={`w-14 h-7 rounded-full relative shrink-0 transition-all cursor-pointer ${profileVisible ? 'bg-[#2C7FFF]' : 'bg-[#03045E]/20'}`}>
                  <div className={`w-5 h-5 bg-[#f4f4f4] rounded-full absolute top-1 transition-all shadow-sm ${profileVisible ? 'left-8' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          )}

          {/* DANGER ZONE */}
          {activeMenu === 'danger' && (
            <div className="animate-fadeIn max-w-lg">
              <h2 className="text-2xl font-extrabold text-[#03045E] border-b border-[#03045E]/20 pb-4 mb-6">Danger Zone</h2>
              <div className="p-6 bg-white rounded-2xl border border-[#03045E]/20 shadow-sm">
                <h3 className="font-bold text-[#03045E] text-lg mb-2">Deactivate Account</h3>
                <p className="text-sm font-semibold text-[#03045E] mb-6">This will instantly withdraw all your active applications and hide your profile.</p>
                <button onClick={handleDeactivate} className="py-4 px-6 bg-[#03045E] text-[#f4f4f4] font-bold rounded-2xl hover:bg-[#2C7FFF] transition-all w-full cursor-pointer shadow-md">Deactivate Account</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}