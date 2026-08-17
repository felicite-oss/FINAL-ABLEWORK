import React from 'react';

export default function ApplicantOverview({ profile, matchesCount, applications, setActiveTab }) {
  
  // Dynamically calculate profile strength based on completed fields
  const calculateProfileStrength = () => {
    let score = 50; // Base score for completing basic registration
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (profile.accommodations && profile.accommodations.length > 0) score += 15;
    if (profile.pwd_document_path) score += 15;
    return score;
  };

  const profileStrength = calculateProfileStrength();
  
  // Grab only the 4 most recent applications for the feed
  const recentApps = applications.slice(0, 4);

  return (
    <div className="animate-fadeIn max-w-6xl">
      
      {/* --- HEADER ROW --- */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-2 text-[#03045E]">Welcome back, {profile.firstname}!</h1>
          <p className="opacity-70 font-medium text-[#03045E]">Here is a quick snapshot of your job search progress today.</p>
        </div>
        
        {/* Profile Quick Button */}
        <button 
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 p-2 pr-5 bg-white rounded-full shadow-sm border border-[#03045E]/10 hover:shadow-md hover:border-[#2C7FFF]/30 transition group"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-[#2C7FFF]/20 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-[#03045E]">
              {profile.firstname.charAt(0)}{profile.lastname.charAt(0)}
            </span>
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-bold text-[#03045E] leading-tight">My Profile</p>
            <p className="text-xs text-[#03045E]/60 font-semibold group-hover:text-[#2C7FFF] transition">Update Skills</p>
          </div>
        </button>
      </div>

      {/* --- TOP STATS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Profile Strength Card */}
        <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-2">
            <p className="text-sm font-bold opacity-60 uppercase text-[#03045E]">Profile Strength</p>
            <p className="text-2xl font-extrabold text-[#03045E]">{profileStrength}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${profileStrength === 100 ? 'bg-green-500' : 'bg-[#2C7FFF]'}`} 
              style={{ width: `${profileStrength}%` }}
            ></div>
          </div>
          {profileStrength < 100 && (
            <p className="text-xs text-[#03045E]/60 mt-3 font-medium">Update your skills and accommodations to reach 100%.</p>
          )}
        </div>

        {/* Smart Matches Card */}
        <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl shrink-0">🎯</div>
          <div>
            <p className="text-sm font-bold opacity-60 uppercase text-[#03045E]">Smart Matches</p>
            <p className="text-3xl font-extrabold text-[#03045E]">{matchesCount}</p>
          </div>
        </div>

        {/* Total Applications Card */}
        <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl shrink-0">📋</div>
          <div>
            <p className="text-sm font-bold opacity-60 uppercase text-[#03045E]">Applications</p>
            <p className="text-3xl font-extrabold text-[#03045E]">{applications.length}</p>
          </div>
        </div>

      </div>

      {/* --- VISUALIZATIONS ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Application Activity */}
        <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#03045E]">Recent Applications</h3>
            <button onClick={() => setActiveTab('tracker')} className="text-sm font-bold text-[#2C7FFF] hover:underline">View All</button>
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            {recentApps.length > 0 ? (
              recentApps.map((app) => (
                <div key={app.application_id} className="p-4 rounded-xl border border-[#03045E]/10 bg-[#f4f4f4]/50 flex justify-between items-center hover:bg-white transition">
                  <div>
                    <p className="font-bold text-[#03045E] text-sm">{app.job_title}</p>
                    <p className="text-xs font-semibold opacity-70">{app.company_name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      app.status === 'Pending' || app.status === 'Under Review' ? 'bg-orange-100 text-orange-800' : 
                      app.status === 'Shortlisted' ? 'bg-green-100 text-green-800' : 
                      app.status === 'Hired' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {app.status}
                    </span>
                    <p className="text-[10px] font-bold opacity-50 mt-2">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-[#03045E]/20 rounded-xl">
                <p className="text-sm font-bold text-[#03045E]/50">You haven't applied to any jobs yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Discovery */}
        <div className="flex flex-col gap-6">
          
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#03045E] to-[#2C7FFF] shadow-lg text-white flex flex-col justify-center relative overflow-hidden h-48">
            <div className="relative z-10">
              <h3 className="text-2xl font-extrabold mb-2">Find Your Perfect Fit</h3>
              <p className="text-sm font-medium opacity-90 mb-4 max-w-[80%]">The Smart Engine has analyzed your skills and travel radius to find jobs tailored for you.</p>
              <button onClick={() => setActiveTab('matches')} className="px-6 py-2 bg-white text-[#03045E] font-bold rounded-lg hover:bg-gray-100 transition shadow">
                View Matches
              </button>
            </div>
            <span className="absolute -right-6 -bottom-6 text-9xl opacity-20">🎯</span>
          </div>

          <div className="p-8 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex flex-col justify-center flex-1">
             <h3 className="text-xl font-bold text-[#03045E] mb-2">Explore the Marketplace</h3>
             <p className="text-sm font-medium text-gray-500 mb-6">Browse all available job postings from verified inclusive employers across the platform.</p>
             <button onClick={() => setActiveTab('explore-jobs')} className="py-3 px-6 bg-gray-100 border border-gray-200 text-[#03045E] font-bold rounded-xl hover:bg-gray-200 transition w-full shadow-sm">
                🌍 Explore All Jobs
             </button>
          </div>

        </div>

      </div>
    </div>
  );
}