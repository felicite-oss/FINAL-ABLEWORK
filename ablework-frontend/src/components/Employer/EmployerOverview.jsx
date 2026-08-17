import React from 'react';

export default function EmployerOverview({ profile, stats, setActiveTab }) {
  return (
    <div className="animate-fadeIn max-w-6xl">
      
      {/* --- HEADER ROW (Flexbox splits left and right) --- */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-2 text-[#03045E]">Dashboard Overview</h1>
          <p className="opacity-70 font-medium text-[#03045E]">Real-time statistics and geographic reach for {profile.company_name}.</p>
        </div>
        
        {/* --- TOP RIGHT PROFILE BUTTON --- */}
        <button 
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 p-2 pr-5 bg-white rounded-full shadow-sm border border-[#03045E]/10 hover:shadow-md hover:border-[#2C7FFF]/30 transition group"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-[#2C7FFF]/20 flex items-center justify-center shrink-0">
            {profile.company_logo ? (
              <img src={`http://localhost:5001${profile.company_logo}`} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">🏢</span>
            )}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-bold text-[#03045E] leading-tight">{profile.company_name}</p>
            <p className="text-xs text-[#03045E]/60 font-semibold group-hover:text-[#2C7FFF] transition">👤 Edit Profile</p>
          </div>
        </button>
      </div>
      
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl">📋</div>
          <div>
            <p className="text-sm font-bold opacity-60 uppercase">Active Jobs</p>
            <p className="text-3xl font-extrabold text-[#03045E]">{stats.activeJobs}</p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl">⏳</div>
          <div>
            <p className="text-sm font-bold opacity-60 uppercase">Pending Review</p>
            <p className="text-3xl font-extrabold text-[#03045E]">{stats.pendingApps}</p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">⭐</div>
          <div>
            <p className="text-sm font-bold opacity-60 uppercase">Shortlisted</p>
            <p className="text-3xl font-extrabold text-[#03045E]">{stats.shortlistedApps}</p>
          </div>
        </div>
      </div>

      {/* 2. VISUALIZATIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Geofencing Map Card */}
        <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#03045E]">Recruitment Zone</h3>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">Geofence Active</span>
          </div>
          <p className="text-sm font-medium opacity-70 mb-4">
            Your office location. The Smart Engine filters applicants outside their safe travel radius from this point.
          </p>
          
          {profile.latitude && profile.longitude ? (
            <div className="flex-1 rounded-xl overflow-hidden border border-[#03045E]/20 relative">
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="w-40 h-40 bg-blue-500/20 rounded-full border border-blue-500/50"></div>
              </div>
              <iframe 
                className="pointer-events-none"
                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(profile.longitude) - 0.05},${Number(profile.latitude) - 0.05},${Number(profile.longitude) + 0.05},${Number(profile.latitude) + 0.05}&layer=mapnik&marker=${profile.latitude},${profile.longitude}`}
              ></iframe>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-xl border border-gray-200">
              <p className="text-sm font-bold text-gray-500">No coordinates saved for this location.</p>
            </div>
          )}
        </div>

        {/* Recent Activity Feed Card */}
        <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-[#03045E] mb-1">Recent Activity</h3>
          <p className="text-sm font-medium opacity-70 mb-4">Latest applications submitted to your postings.</p>
          
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((app) => (
                <div key={app.id} className="p-4 rounded-xl border border-[#03045E]/10 bg-[#f4f4f4]/50 flex justify-between items-center hover:bg-white transition">
                  <div>
                    <p className="font-bold text-[#03045E] text-sm">{app.first_name} {app.last_name}</p>
                    <p className="text-xs font-semibold opacity-70">Applied for: {app.job_title}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      app.status === 'Pending' || app.status === 'Under Review' ? 'bg-orange-100 text-orange-800' : 
                      app.status === 'Shortlisted' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {app.status}
                    </span>
                    <p className="text-[10px] font-bold opacity-50 mt-1">
                      {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-[#03045E]/20 rounded-xl">
                <p className="text-sm font-bold text-[#03045E]/50">No recent applications found.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}