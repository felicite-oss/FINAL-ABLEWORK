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
    <div className="animate-fadeIn w-full space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      
      {/* --- HEADER ROW --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#03045E]">
            Welcome back, {profile.firstname}!
          </h2>
          <p className="text-[#03045E] mt-1.5 text-sm sm:text-base font-semibold">
            Here is a quick snapshot of your job search progress today.
          </p>
        </div>
      </div>

      {/* --- TOP STATS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Profile Strength Card */}
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-[2rem] bg-white shadow-md border border-[#03045E]/20 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#03045E]">Profile Strength</span>
              <span className="text-3xl font-extrabold text-[#03045E]">{profileStrength}%</span>
            </div>
            <div className="w-full bg-[#f4f4f4] rounded-full h-3 overflow-hidden mb-4 border border-[#03045E]/20">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out bg-[#2C7FFF]" 
                style={{ width: `${profileStrength}%` }}
              ></div>
            </div>
            <div className="min-h-[24px] flex items-center">
              {profileStrength < 100 ? (
                <p className="text-xs text-[#03045E] font-bold leading-relaxed">Update your skills and accommodations to reach 100%.</p>
              ) : (
                <p className="text-xs text-[#03045E] font-extrabold flex items-center gap-1.5 bg-[#f4f4f4] py-1.5 px-3 rounded-full w-fit border border-[#03045E]/30">
                  <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Profile fully optimized!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Smart Matches Card */}
        <div className="p-6 sm:p-8 rounded-[2rem] bg-white shadow-md border border-[#03045E]/20 flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.25rem] bg-[#f4f4f4] flex items-center justify-center text-[#2C7FFF] shrink-0 border border-[#03045E]/20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#03045E] mb-1">Smart Matches</span>
            <span className="text-4xl font-black text-[#03045E] tracking-tight">{matchesCount}</span>
          </div>
        </div>

        {/* Total Applications Card */}
        <div className="p-6 sm:p-8 rounded-[2rem] bg-white shadow-md border border-[#03045E]/20 flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.25rem] bg-[#f4f4f4] flex items-center justify-center text-[#03045E] shrink-0 border border-[#03045E]/20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#03045E] mb-1">Applications</span>
            <span className="text-4xl font-black text-[#03045E] tracking-tight">{applications.length}</span>
          </div>
        </div>

      </div>

      {/* --- VISUALIZATIONS ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Recent Application Activity */}
        <div className="p-6 sm:p-8 rounded-[2rem] bg-white shadow-md border border-[#03045E]/20 flex flex-col min-h-[420px]">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-[#03045E]">Recent Applications</h3>
              <p className="text-sm font-semibold text-[#03045E] mt-1">Track your latest moves.</p>
            </div>
            <button onClick={() => setActiveTab('tracker')} className="text-sm font-extrabold text-[#2C7FFF] hover:underline flex items-center gap-1">
              View All 
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {recentApps.length > 0 ? (
              recentApps.map((app) => (
                <div key={app.application_id} className="p-4 rounded-2xl border border-[#03045E]/20 bg-[#f4f4f4] flex justify-between items-center hover:bg-white transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#03045E]/20 text-[#2C7FFF] font-extrabold text-lg">
                      {app.company_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-extrabold text-[#03045E] text-base">{app.job_title}</p>
                      <p className="text-xs font-bold text-[#03045E] mt-0.5">{app.company_name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-full bg-white text-[#03045E] shadow-sm border border-[#03045E]/20">
                      {app.status}
                    </span>
                    <p className="text-[10px] font-bold text-[#03045E] uppercase tracking-wider">
                      {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-[#03045E]/30 rounded-[1.5rem] p-8 bg-[#f4f4f4] text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-[#03045E]/20">
                  <svg className="w-8 h-8 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <p className="text-base font-bold text-[#03045E]">No applications yet.</p>
                <p className="text-xs font-semibold text-[#03045E] mt-1 max-w-[200px]">Start exploring jobs to see your activity here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Discovery */}
        <div className="flex flex-col gap-6 sm:gap-8">
          
          {/* Smart Engine Match Action */}
          <div className="p-6 sm:p-8 rounded-[2rem] bg-white shadow-md border border-[#03045E]/20 flex flex-col justify-center">
            <span className="inline-block px-3 py-1 bg-[#f4f4f4] border border-[#03045E]/20 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-[#2C7FFF] mb-4 w-fit">Smart Engine</span>
            <h3 className="text-2xl font-black mb-2 text-[#03045E] leading-tight">Find Your Perfect Fit</h3>
            <p className="text-sm font-semibold text-[#03045E] mb-6 max-w-[90%] leading-relaxed">
              We've analyzed your skills and travel radius to pinpoint jobs tailored exactly for you.
            </p>
            <button onClick={() => setActiveTab('matches')} className="flex items-center justify-center gap-2 w-max px-6 py-3.5 bg-[#2C7FFF] text-[#f4f4f4] font-extrabold text-sm rounded-xl hover:bg-[#03045E] transition-all duration-200 shadow-sm">
              View Your Matches
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>

          {/* General Explore Action */}
          <div className="p-6 sm:p-8 rounded-[2rem] bg-white shadow-md border border-[#03045E]/20 flex flex-col justify-center flex-1">
             <div className="mb-2 w-12 h-12 rounded-xl bg-[#f4f4f4] border border-[#03045E]/20 flex items-center justify-center text-[#03045E]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
             </div>
             <h3 className="text-xl font-extrabold text-[#03045E] mb-2">Explore the Marketplace</h3>
             <p className="text-sm font-semibold text-[#03045E] mb-6 leading-relaxed">
              Browse all available job postings from verified inclusive employers across the platform.
             </p>
             <button onClick={() => setActiveTab('explore-jobs')} className="flex items-center justify-center gap-2 py-3.5 px-6 bg-[#f4f4f4] border border-[#03045E]/30 text-[#03045E] font-extrabold text-sm rounded-xl hover:bg-[#03045E] hover:text-[#f4f4f4] hover:border-[#03045E] transition-all duration-200 w-full">
                <span>Explore All Jobs</span>
             </button>
          </div>

        </div>

      </div>
    </div>
  );
}