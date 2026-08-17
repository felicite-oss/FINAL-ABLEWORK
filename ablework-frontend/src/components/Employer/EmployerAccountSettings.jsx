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
    <div className="animate-fadeIn max-w-6xl relative pb-10">
      <div className="mb-8 border-b border-[#03045E]/10 pb-4">
        <h1 className="text-3xl font-extrabold text-[#03045E]">Account Settings</h1>
        <p className="opacity-70 font-medium text-[#03045E] mt-1">Manage your security, notifications, and platform preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        
        {/* SETTINGS INNER SIDEBAR */}
        <aside className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          <button 
            onClick={() => setActiveMenu('security')}
            className={`text-left px-5 py-4 rounded-xl font-bold transition flex items-center gap-3 ${activeMenu === 'security' ? 'bg-[#03045E] text-white shadow-md' : 'text-[#03045E] hover:bg-gray-200'}`}
          >
            <span>🔒</span> Security & Login
          </button>
          
          <button 
            onClick={() => setActiveMenu('notifications')}
            className={`text-left px-5 py-4 rounded-xl font-bold transition flex items-center gap-3 ${activeMenu === 'notifications' ? 'bg-[#03045E] text-white shadow-md' : 'text-[#03045E] hover:bg-gray-200'}`}
          >
            <span>🔔</span> Notifications
          </button>
          
          <button 
            onClick={() => setActiveMenu('privacy')}
            className={`text-left px-5 py-4 rounded-xl font-bold transition flex items-center gap-3 ${activeMenu === 'privacy' ? 'bg-[#03045E] text-white shadow-md' : 'text-[#03045E] hover:bg-gray-200'}`}
          >
            <span>👁️</span> Privacy & Visibility
          </button>
          
          <button 
            onClick={() => setActiveMenu('danger')}
            className={`text-left px-5 py-4 rounded-xl font-bold transition flex items-center gap-3 mt-4 ${activeMenu === 'danger' ? 'bg-red-600 text-white shadow-md' : 'text-red-700 hover:bg-red-50'}`}
          >
            <span>⚠️</span> Danger Zone
          </button>
        </aside>

        {/* SETTINGS CONTENT AREA */}
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-md border border-[#03045E]/10 min-h-[500px]">
          
          {/* --- SECURITY SECTION --- */}
          {activeMenu === 'security' && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-[#03045E] border-b border-[#03045E]/10 pb-4 mb-6">Security & Authentication</h2>
              
              <div className="flex flex-col gap-8 max-w-lg">
                <div>
                  <p className="text-sm font-bold text-[#03045E]/60 uppercase mb-2">Primary Email Address</p>
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="font-semibold text-[#03045E]">{profile?.email}</p>
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">Verified</span>
                  </div>
                </div>
                
                <form onSubmit={handlePasswordReset} className="flex flex-col gap-3">
                  <p className="text-sm font-bold text-[#03045E]/60 uppercase mb-1">Change Password</p>
                  <input type="password" placeholder="Current Password" required className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" />
                  <input type="password" placeholder="New Password" required className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" />
                  <input type="password" placeholder="Confirm New Password" required className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" />
                  <button type="submit" className="mt-2 py-3 px-6 bg-[#03045E] text-white font-bold rounded-xl hover:bg-[#2C7FFF] transition w-full md:w-fit">
                    Update Password
                  </button>
                </form>

                <hr className="border-gray-200" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#03045E]">Two-Factor Authentication (2FA)</p>
                    <p className="text-sm text-gray-500 font-medium">Require a secure code upon login.</p>
                  </div>
                  <button 
                    onClick={() => setTwoFactor(!twoFactor)}
                    className={`w-14 h-7 rounded-full transition-colors relative shrink-0 ${twoFactor ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${twoFactor ? 'left-8' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- NOTIFICATIONS SECTION --- */}
          {activeMenu === 'notifications' && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-[#03045E] border-b border-[#03045E]/10 pb-4 mb-6">Notification Preferences</h2>
              
              <div className="flex flex-col gap-6 max-w-lg">
                <label className="flex items-start gap-4 cursor-pointer group bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-[#2C7FFF]/50 transition">
                  <input type="checkbox" checked={notifApplies} onChange={() => setNotifApplies(!notifApplies)} className="w-5 h-5 mt-1 accent-[#03045E]" />
                  <div>
                    <span className="font-bold text-[#03045E] group-hover:text-[#2C7FFF] transition">New Applications</span>
                    <p className="text-sm text-gray-500 font-medium mt-1">Email me immediately when a PWD applicant submits a resume to one of my active job postings.</p>
                  </div>
                </label>

                <label className="flex items-start gap-4 cursor-pointer group bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-[#2C7FFF]/50 transition">
                  <input type="checkbox" checked={notifDigest} onChange={() => setNotifDigest(!notifDigest)} className="w-5 h-5 mt-1 accent-[#03045E]" />
                  <div>
                    <span className="font-bold text-[#03045E] group-hover:text-[#2C7FFF] transition">Weekly Digest</span>
                    <p className="text-sm text-gray-500 font-medium mt-1">Send me a Monday morning summary of recruitment analytics and profile views.</p>
                  </div>
                </label>

                <label className="flex items-start gap-4 cursor-pointer group bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-[#2C7FFF]/50 transition">
                  <input type="checkbox" checked={notifMarketing} onChange={() => setNotifMarketing(!notifMarketing)} className="w-5 h-5 mt-1 accent-[#03045E]" />
                  <div>
                    <span className="font-bold text-[#03045E] group-hover:text-[#2C7FFF] transition">News & Updates</span>
                    <p className="text-sm text-gray-500 font-medium mt-1">Receive updates about new AbleWork features and accessibility guidelines.</p>
                  </div>
                </label>

                <button onClick={handleSavePreferences} className="mt-4 py-3 bg-[#03045E] text-white font-bold rounded-xl hover:bg-[#2C7FFF] transition w-full md:w-fit px-8">
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* --- PRIVACY SECTION --- */}
          {activeMenu === 'privacy' && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-[#03045E] border-b border-[#03045E]/10 pb-4 mb-6">Privacy & Visibility</h2>
              
              <div className="flex flex-col gap-6 max-w-lg">
                <div className="flex items-start justify-between bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="pr-6">
                    <p className="font-bold text-[#03045E] text-lg">Public Company Profile</p>
                    <p className="text-sm text-gray-500 font-medium mt-2">
                      Allow job seekers to view your company profile, industry details, and location even when you have no active job postings. Turning this off hides your company from the main directory until you post a new job.
                    </p>
                  </div>
                  <button 
                    onClick={() => setPublicVisible(!publicVisible)}
                    className={`w-14 h-7 rounded-full transition-colors relative shrink-0 mt-1 ${publicVisible ? 'bg-[#2C7FFF]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${publicVisible ? 'left-8' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- DANGER ZONE --- */}
          {activeMenu === 'danger' && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-red-700 border-b border-red-200 pb-4 mb-6">Danger Zone</h2>
              
              <div className="p-6 bg-red-50 rounded-2xl border border-red-200 max-w-lg">
                <h3 className="font-bold text-red-800 text-lg mb-2">Deactivate Employer Account</h3>
                <p className="text-sm text-red-900/70 font-medium mb-6">
                  Deactivating your account will immediately hide all your active job postings, reject pending applicants, and remove your company from the Smart Matching engine. This action cannot be undone from the dashboard.
                </p>
                <button onClick={handleDeactivate} className="py-3 px-6 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition w-full">
                  Deactivate Account
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}