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
    <div className="animate-fadeIn max-w-6xl relative pb-10">
      <div className="mb-8 border-b border-[#03045E]/10 pb-4">
        <h1 className="text-3xl font-extrabold text-[#03045E]">Account Settings</h1>
        <p className="opacity-70 font-medium text-[#03045E] mt-1">Manage your security and notification preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        
        {/* SETTINGS INNER SIDEBAR */}
        <aside className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          <button onClick={() => setActiveMenu('security')} className={`text-left px-5 py-4 rounded-xl font-bold transition flex items-center gap-3 ${activeMenu === 'security' ? 'bg-[#03045E] text-white shadow-md' : 'text-[#03045E] hover:bg-gray-200'}`}>
            <span>🔒</span> Security & Login
          </button>
          <button onClick={() => setActiveMenu('notifications')} className={`text-left px-5 py-4 rounded-xl font-bold transition flex items-center gap-3 ${activeMenu === 'notifications' ? 'bg-[#03045E] text-white shadow-md' : 'text-[#03045E] hover:bg-gray-200'}`}>
            <span>🔔</span> Notifications
          </button>
          <button onClick={() => setActiveMenu('privacy')} className={`text-left px-5 py-4 rounded-xl font-bold transition flex items-center gap-3 ${activeMenu === 'privacy' ? 'bg-[#03045E] text-white shadow-md' : 'text-[#03045E] hover:bg-gray-200'}`}>
            <span>👁️</span> Privacy
          </button>
          <button onClick={() => setActiveMenu('danger')} className={`text-left px-5 py-4 rounded-xl font-bold transition flex items-center gap-3 mt-4 ${activeMenu === 'danger' ? 'bg-red-600 text-white shadow-md' : 'text-red-700 hover:bg-red-50'}`}>
            <span>⚠️</span> Danger Zone
          </button>
        </aside>

        {/* SETTINGS CONTENT AREA */}
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-md border border-[#03045E]/10 min-h-[500px]">
          
          {/* SECURITY SECTION */}
          {activeMenu === 'security' && (
            <div className="animate-fadeIn max-w-lg">
              <h2 className="text-2xl font-bold text-[#03045E] border-b border-[#03045E]/10 pb-4 mb-6">Security & Authentication</h2>
              <div className="flex flex-col gap-8">
                <div>
                  <p className="text-sm font-bold text-[#03045E]/60 uppercase mb-2">Account Email</p>
                  <p className="font-semibold text-[#03045E] bg-gray-50 p-4 rounded-xl border border-gray-200">{profile?.email}</p>
                </div>
                
                <form onSubmit={handlePasswordReset} className="flex flex-col gap-3">
                  <p className="text-sm font-bold text-[#03045E]/60 uppercase mb-1">Change Password</p>
                  <input type="password" placeholder="Current Password" required className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" />
                  <input type="password" placeholder="New Password" required className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" />
                  <button type="submit" className="mt-2 py-3 bg-[#03045E] text-white font-bold rounded-xl hover:bg-[#2C7FFF]">Update Password</button>
                </form>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeMenu === 'notifications' && (
            <div className="animate-fadeIn max-w-lg">
              <h2 className="text-2xl font-bold text-[#03045E] border-b border-[#03045E]/10 pb-4 mb-6">Notification Preferences</h2>
              <div className="flex flex-col gap-6">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-[#2C7FFF]/50">
                  <div>
                    <p className="font-bold text-[#03045E]">New Smart Matches</p>
                    <p className="text-sm text-gray-500">Email me when a new job matches my profile.</p>
                  </div>
                  <input type="checkbox" checked={notifMatches} onChange={() => setNotifMatches(!notifMatches)} className="w-5 h-5 accent-[#03045E]" />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-[#2C7FFF]/50">
                  <div>
                    <p className="font-bold text-[#03045E]">Application Updates</p>
                    <p className="text-sm text-gray-500">Email me when an employer changes my status.</p>
                  </div>
                  <input type="checkbox" checked={notifStatus} onChange={() => setNotifStatus(!notifStatus)} className="w-5 h-5 accent-[#03045E]" />
                </label>
              </div>
            </div>
          )}

          {/* PRIVACY SECTION */}
          {activeMenu === 'privacy' && (
            <div className="animate-fadeIn max-w-lg">
              <h2 className="text-2xl font-bold text-[#03045E] border-b border-[#03045E]/10 pb-4 mb-6">Privacy Options</h2>
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="pr-4">
                  <p className="font-bold text-[#03045E]">Make Profile Discoverable</p>
                  <p className="text-sm text-gray-500">Allow verified employers to view your profile and invite you to apply for jobs.</p>
                </div>
                <button onClick={() => setProfileVisible(!profileVisible)} className={`w-14 h-7 rounded-full relative shrink-0 ${profileVisible ? 'bg-[#2C7FFF]' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${profileVisible ? 'left-8' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          )}

          {/* DANGER ZONE */}
          {activeMenu === 'danger' && (
            <div className="animate-fadeIn max-w-lg">
              <h2 className="text-2xl font-bold text-red-700 border-b border-red-200 pb-4 mb-6">Danger Zone</h2>
              <div className="p-6 bg-red-50 rounded-2xl border border-red-200">
                <h3 className="font-bold text-red-800 text-lg mb-2">Deactivate Account</h3>
                <p className="text-sm text-red-900/70 mb-6">This will instantly withdraw all your active applications and hide your profile.</p>
                <button onClick={handleDeactivate} className="py-3 px-6 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 w-full">Deactivate Account</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}