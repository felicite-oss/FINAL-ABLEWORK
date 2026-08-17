import React from 'react';

export default function EmployerAccountSettings({ profile }) {
  
  const handlePasswordReset = (e) => {
    e.preventDefault();
    alert("Password reset link sent to your email!");
  };

  return (
    <div className="animate-fadeIn max-w-4xl relative">
      <h1 className="text-3xl font-extrabold mb-8 text-[#03045E]">Account Settings</h1>

      <div className="flex flex-col gap-8">
        
        {/* Security Settings */}
        <div className="p-8 bg-white rounded-3xl shadow-xl border border-[#03045E]/10">
          <h2 className="text-xl font-bold text-[#03045E] border-b border-[#03045E]/10 pb-4 mb-6 flex items-center gap-2">
            🔒 Security & Login
          </h2>
          <div className="flex flex-col gap-4 max-w-md">
            <div>
              <p className="text-sm font-bold text-[#03045E]/60 uppercase mb-1">Account Email</p>
              <p className="font-semibold text-[#03045E] bg-gray-100 p-3 rounded-xl border border-gray-200">
                {profile?.email}
              </p>
            </div>
            
            <form onSubmit={handlePasswordReset} className="flex flex-col gap-2 mt-2">
              <p className="text-sm font-bold text-[#03045E]/60 uppercase mb-1">Update Password</p>
              <input type="password" placeholder="New Password" required className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" />
              <input type="password" placeholder="Confirm New Password" required className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" />
              <button type="submit" className="mt-2 py-3 bg-[#03045E] text-white font-bold rounded-xl hover:bg-[#2C7FFF] transition w-full">
                Change Password
              </button>
            </form>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="p-8 bg-white rounded-3xl shadow-xl border border-[#03045E]/10">
          <h2 className="text-xl font-bold text-[#03045E] border-b border-[#03045E]/10 pb-4 mb-6 flex items-center gap-2">
            🔔 Notification Preferences
          </h2>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-4 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#03045E]" />
              <span className="font-semibold text-[#03045E]">Email me when a new applicant applies</span>
            </label>
            <label className="flex items-center gap-4 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#03045E]" />
              <span className="font-semibold text-[#03045E]">Weekly recruitment summary report</span>
            </label>
            <button className="mt-4 py-3 px-6 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition w-fit">
              Save Preferences
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}