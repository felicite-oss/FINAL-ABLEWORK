import React, { useState } from 'react';

export default function EmployerAccountSettings({ profile }) {
  // Navigation State
  const [activeMenu, setActiveMenu] = useState('security');

  // Toggle States
  const [notifApplies, setNotifApplies] = useState(true);
  const [notifDigest, setNotifDigest] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [publicVisible, setPublicVisible] = useState(true);

  const handlePasswordReset = (e) => {
    e.preventDefault();
    alert("Password updated successfully!");
  };

  const handleSavePreferences = () => {
    alert("Preferences saved successfully!");
  };

  const handleDeactivate = () => {
    if(window.confirm("Are you absolutely sure you want to deactivate your employer account? This action will hide all active job postings.")) {
      alert("Account deactivated. You will be logged out.");
    }
  };

  return (
    <div className="animate-fadeIn max-w-6xl relative pb-10 bg-[#f4f4f4] min-h-screen p-6 md:p-10 rounded-3xl">
      <div className="mb-8 border-b border-[#03045E]/10 pb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#03045E] tracking-tight">Account Settings</h1>
          <p className="text-[#03045E]/70 font-semibold text-sm md:text-base mt-1">Manage your security, notifications, and platform preferences.</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#03045E]/10 shadow-sm flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#2c7fff] animate-pulse"></div>
          <span className="text-xs font-bold text-[#03045E] uppercase tracking-wider">Secure Workspace</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SETTINGS INNER SIDEBAR */}
        <aside className="w-full lg:w-72 flex flex-col gap-3 shrink-0">
          <button 
            onClick={() => setActiveMenu('security')}
            className={`text-left px-5 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center gap-4 group relative overflow-hidden ${activeMenu === 'security' ? 'bg-[#03045E] text-white shadow-xl shadow-[#03045E]/20 scale-[1.02]' : 'bg-white text-[#03045E] hover:bg-[#03045E]/5 border border-[#03045E]/10'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeMenu === 'security' ? 'bg-[#2c7fff] text-white' : 'bg-[#03045E]/5 text-[#03045E] group-hover:bg-[#2c7fff]/10 group-hover:text-[#2c7fff]'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="block text-sm md:text-base">Security & Login</span>
              <span className={`text-[10px] font-medium block ${activeMenu === 'security' ? 'text-white/70' : 'text-[#03045E]/50'}`}>Password & 2FA</span>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveMenu('notifications')}
            className={`text-left px-5 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center gap-4 group relative overflow-hidden ${activeMenu === 'notifications' ? 'bg-[#03045E] text-white shadow-xl shadow-[#03045E]/20 scale-[1.02]' : 'bg-white text-[#03045E] hover:bg-[#03045E]/5 border border-[#03045E]/10'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeMenu === 'notifications' ? 'bg-[#2c7fff] text-white' : 'bg-[#03045E]/5 text-[#03045E] group-hover:bg-[#2c7fff]/10 group-hover:text-[#2c7fff]'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="block text-sm md:text-base">Notifications</span>
              <span className={`text-[10px] font-medium block ${activeMenu === 'notifications' ? 'text-white/70' : 'text-[#03045E]/50'}`}>Alerts & digests</span>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveMenu('privacy')}
            className={`text-left px-5 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center gap-4 group relative overflow-hidden ${activeMenu === 'privacy' ? 'bg-[#03045E] text-white shadow-xl shadow-[#03045E]/20 scale-[1.02]' : 'bg-white text-[#03045E] hover:bg-[#03045E]/5 border border-[#03045E]/10'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeMenu === 'privacy' ? 'bg-[#2c7fff] text-white' : 'bg-[#03045E]/5 text-[#03045E] group-hover:bg-[#2c7fff]/10 group-hover:text-[#2c7fff]'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="block text-sm md:text-base">Privacy & Visibility</span>
              <span className={`text-[10px] font-medium block ${activeMenu === 'privacy' ? 'text-white/70' : 'text-[#03045E]/50'}`}>Company profile status</span>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveMenu('danger')}
            className={`text-left px-5 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center gap-4 mt-2 group relative overflow-hidden ${activeMenu === 'danger' ? 'bg-red-600 text-white shadow-xl shadow-red-600/20 scale-[1.02]' : 'bg-white text-red-600 hover:bg-red-50 border border-red-200'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeMenu === 'danger' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600 group-hover:bg-red-100'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="block text-sm md:text-base">Danger Zone</span>
              <span className={`text-[10px] font-medium block ${activeMenu === 'danger' ? 'text-white/80' : 'text-red-400'}`}>Deactivate account</span>
            </div>
          </button>
        </aside>

        {/* SETTINGS CONTENT AREA */}
        <div className="flex-1 bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-[#03045E]/5 border border-[#03045E]/10 min-h-[550px] relative overflow-hidden">
          
          {/* Subtle background glow effect */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#2c7fff]/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* --- SECURITY SECTION --- */}
          {activeMenu === 'security' && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 border-b border-[#03045E]/10 pb-4 mb-8">
                <div className="p-2.5 bg-[#03045E]/5 rounded-xl text-[#03045E]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#03045E]">Security & Authentication</h2>
                  <p className="text-xs font-semibold text-[#03045E]/60">Protect your account with robust credentials and 2FA</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-8 max-w-xl">
                <div>
                  <p className="text-xs font-black text-[#03045E]/60 uppercase tracking-wider mb-2.5">Primary Email Address</p>
                  <div className="flex items-center justify-between bg-[#f4f4f4] p-4 rounded-2xl border border-[#03045E]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#03045E]/5 flex items-center justify-center text-[#03045E]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="font-bold text-[#03045E] text-sm md:text-base">{profile?.email}</p>
                    </div>
                    <span className="text-xs font-extrabold text-[#2c7fff] bg-[#2c7fff]/10 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Verified
                    </span>
                  </div>
                </div>
                
                <form onSubmit={handlePasswordReset} className="flex flex-col gap-4">
                  <p className="text-xs font-black text-[#03045E]/60 uppercase tracking-wider mb-0.5">Change Password</p>
                  <div className="relative">
                    <input type="password" placeholder="Current Password" required className="w-full p-4 bg-[#f4f4f4] border border-[#03045E]/10 rounded-2xl focus:border-[#2c7fff] focus:bg-white transition outline-none font-medium text-[#03045E] placeholder:text-[#03045E]/40" />
                  </div>
                  <div className="relative">
                    <input type="password" placeholder="New Password" required className="w-full p-4 bg-[#f4f4f4] border border-[#03045E]/10 rounded-2xl focus:border-[#2c7fff] focus:bg-white transition outline-none font-medium text-[#03045E] placeholder:text-[#03045E]/40" />
                  </div>
                  <div className="relative">
                    <input type="password" placeholder="Confirm New Password" required className="w-full p-4 bg-[#f4f4f4] border border-[#03045E]/10 rounded-2xl focus:border-[#2c7fff] focus:bg-white transition outline-none font-medium text-[#03045E] placeholder:text-[#03045E]/40" />
                  </div>
                  <button type="submit" className="mt-2 py-4 px-8 bg-[#03045E] text-white font-bold rounded-2xl hover:bg-[#2c7fff] transition-all duration-300 shadow-lg shadow-[#03045E]/20 w-full md:w-fit flex items-center justify-center gap-2">
                    <span>Update Password</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>

                <hr className="border-[#03045E]/10" />

                <div className="flex items-center justify-between bg-[#f4f4f4] p-5 rounded-2xl border border-[#03045E]/10">
                  <div className="pr-4">
                    <p className="font-bold text-[#03045E] text-base">Two-Factor Authentication (2FA)</p>
                    <p className="text-xs text-[#03045E]/60 font-semibold mt-0.5">Require an extra security code upon login.</p>
                  </div>
                  <button 
                    onClick={() => setTwoFactor(!twoFactor)}
                    className={`w-14 h-8 rounded-full transition-all duration-300 relative shrink-0 p-1 shadow-inner ${twoFactor ? 'bg-[#2c7fff]' : 'bg-[#03045E]/20'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 transform ${twoFactor ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- NOTIFICATIONS SECTION --- */}
          {activeMenu === 'notifications' && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 border-b border-[#03045E]/10 pb-4 mb-8">
                <div className="p-2.5 bg-[#03045E]/5 rounded-xl text-[#03045E]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#03045E]">Notification Preferences</h2>
                  <p className="text-xs font-semibold text-[#03045E]/60">Customize how and when you receive recruitment updates</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 max-w-xl">
                <label className={`flex items-start gap-4 cursor-pointer group p-5 rounded-2xl border transition-all duration-300 ${notifApplies ? 'bg-[#03045E]/[0.02] border-[#2c7fff]/50 shadow-sm' : 'bg-[#f4f4f4] border-[#03045E]/10 hover:border-[#03045E]/30'}`}>
                  <input type="checkbox" checked={notifApplies} onChange={() => setNotifApplies(!notifApplies)} className="w-5 h-5 mt-1 rounded accent-[#03045E] cursor-pointer" />
                  <div>
                    <span className="font-bold text-[#03045E] text-base group-hover:text-[#2c7fff] transition-colors">New Applications</span>
                    <p className="text-xs text-[#03045E]/60 font-medium mt-1 leading-relaxed">Email me immediately when a PWD applicant submits a resume to one of my active job postings.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-4 cursor-pointer group p-5 rounded-2xl border transition-all duration-300 ${notifDigest ? 'bg-[#03045E]/[0.02] border-[#2c7fff]/50 shadow-sm' : 'bg-[#f4f4f4] border-[#03045E]/10 hover:border-[#03045E]/30'}`}>
                  <input type="checkbox" checked={notifDigest} onChange={() => setNotifDigest(!notifDigest)} className="w-5 h-5 mt-1 rounded accent-[#03045E] cursor-pointer" />
                  <div>
                    <span className="font-bold text-[#03045E] text-base group-hover:text-[#2c7fff] transition-colors">Weekly Digest</span>
                    <p className="text-xs text-[#03045E]/60 font-medium mt-1 leading-relaxed">Send me a Monday morning summary of recruitment analytics and profile views.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-4 cursor-pointer group p-5 rounded-2xl border transition-all duration-300 ${notifMarketing ? 'bg-[#03045E]/[0.02] border-[#2c7fff]/50 shadow-sm' : 'bg-[#f4f4f4] border-[#03045E]/10 hover:border-[#03045E]/30'}`}>
                  <input type="checkbox" checked={notifMarketing} onChange={() => setNotifMarketing(!notifMarketing)} className="w-5 h-5 mt-1 rounded accent-[#03045E] cursor-pointer" />
                  <div>
                    <span className="font-bold text-[#03045E] text-base group-hover:text-[#2c7fff] transition-colors">News & Updates</span>
                    <p className="text-xs text-[#03045E]/60 font-medium mt-1 leading-relaxed">Receive updates about new AbleWork features and accessibility guidelines.</p>
                  </div>
                </label>

                <button onClick={handleSavePreferences} className="mt-4 py-4 bg-[#03045E] text-white font-bold rounded-2xl hover:bg-[#2c7fff] transition-all duration-300 shadow-lg shadow-[#03045E]/20 w-full md:w-fit px-8 flex items-center justify-center gap-2">
                  <span>Save Preferences</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* --- PRIVACY SECTION --- */}
          {activeMenu === 'privacy' && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 border-b border-[#03045E]/10 pb-4 mb-8">
                <div className="p-2.5 bg-[#03045E]/5 rounded-xl text-[#03045E]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#03045E]">Privacy & Visibility</h2>
                  <p className="text-xs font-semibold text-[#03045E]/60">Control how candidates see your company profile</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-6 max-w-xl">
                <div className="flex items-start justify-between bg-[#f4f4f4] p-6 rounded-2xl border border-[#03045E]/10">
                  <div className="pr-6">
                    <p className="font-black text-[#03045E] text-lg">Public Company Profile</p>
                    <p className="text-xs text-[#03045E]/70 font-semibold mt-2 leading-relaxed">
                      Allow job seekers to view your company profile, industry details, and location even when you have no active job postings. Turning this off hides your company from the main directory until you post a new job.
                    </p>
                  </div>
                  <button 
                    onClick={() => setPublicVisible(!publicVisible)}
                    className={`w-14 h-8 rounded-full transition-all duration-300 relative shrink-0 mt-1 p-1 shadow-inner ${publicVisible ? 'bg-[#2c7fff]' : 'bg-[#03045E]/20'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 transform ${publicVisible ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- DANGER ZONE --- */}
          {activeMenu === 'danger' && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-4 border-b border-red-200 pb-4 mb-8">
                <div className="p-2.5 bg-red-100 rounded-xl text-red-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-red-700">Danger Zone</h2>
                  <p className="text-xs font-semibold text-red-500">Irreversible account actions</p>
                </div>
              </div>
              
              <div className="p-6 md:p-8 bg-red-50/70 rounded-3xl border border-red-200 max-w-xl">
                <h3 className="font-extrabold text-red-900 text-lg mb-2">Deactivate Employer Account</h3>
                <p className="text-xs text-red-900/80 font-semibold mb-6 leading-relaxed">
                  Deactivating your account will immediately hide all your active job postings, reject pending applicants, and remove your company from the Smart Matching engine. This action cannot be undone from the dashboard.
                </p>
                <button onClick={handleDeactivate} className="py-4 px-6 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-600/20 w-full flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Deactivate Account</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}