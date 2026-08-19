import React from 'react';

export default function EmployerOverview({ profile, stats, setActiveTab }) {
  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-10">
      
      {/* --- HEADER ROW (Flexbox splits left and right) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-[#f4f4f4]/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.04)] border border-[#03045E]/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#2C7FFF]/10 text-[#2C7FFF] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Employer Hub</span>
            <span className="text-xs font-bold text-[#03045E] bg-[#f4f4f4] px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-[#03045E]/10">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse"></span> Live System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#03045E]">Dashboard Overview</h1>
          <p className="text-sm font-medium text-[#03045E]/70 mt-0.5">Real-time statistics, geofenced recruitment zone, and candidate pipelines for <span className="font-bold text-[#03045E]">{profile.company_name}</span>.</p>
        </div>
      </div>
      
      {/* 1. TOP STATS ROW - Redesigned with Unique Accents, Glassmorphism & Hover Micro-interactions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Stat Card 1: Active Jobs */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#f4f4f4] shadow-[0_10px_30px_rgba(3,4,94,0.04)] border border-[#03045E]/10 flex items-center justify-between group hover:shadow-[0_20px_40px_rgba(44,127,255,0.1)] hover:border-[#2C7FFF]/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2C7FFF]/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2C7FFF]/10 to-[#2C7FFF]/20 border border-[#2C7FFF]/20 flex items-center justify-center text-[#2C7FFF] shadow-sm group-hover:rotate-6 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
                <p className="text-xs font-bold tracking-wider text-[#03045E]/60 uppercase">Active Postings</p>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-[#03045E] tracking-tight">{stats.activeJobs}</p>
            </div>
          </div>
          <div className="relative z-10 hidden sm:flex flex-col items-end justify-center pl-4 border-l border-[#03045E]/10">
            <span className="text-[11px] font-extrabold text-[#2C7FFF] bg-[#f4f4f4] px-2.5 py-1 rounded-full mb-1 border border-[#03045E]/10">Live Online</span>
            <span className="text-[10px] font-bold text-[#03045E]/50">Targeted Reach</span>
          </div>
        </div>

        {/* Stat Card 2: Pending Review */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#f4f4f4] shadow-[0_10px_30px_rgba(3,4,94,0.04)] border border-[#03045E]/10 flex items-center justify-between group hover:shadow-[0_20px_40px_rgba(44,127,255,0.1)] hover:border-[#2C7FFF]/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2C7FFF]/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2C7FFF]/10 to-[#2C7FFF]/20 border border-[#2C7FFF]/20 flex items-center justify-center text-[#2C7FFF] shadow-sm group-hover:rotate-6 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
                <p className="text-xs font-bold tracking-wider text-[#03045E]/60 uppercase">Pending Review</p>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-[#03045E] tracking-tight">{stats.pendingApps}</p>
            </div>
          </div>
          <div className="relative z-10 hidden sm:flex flex-col items-end justify-center pl-4 border-l border-[#03045E]/10">
            <span className="text-[11px] font-extrabold text-[#2C7FFF] bg-[#f4f4f4] px-2.5 py-1 rounded-full mb-1 border border-[#03045E]/10">Action Needed</span>
            <span className="text-[10px] font-bold text-[#03045E]/50">New Applicants</span>
          </div>
        </div>

        {/* Stat Card 3: Shortlisted */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#f4f4f4] shadow-[0_10px_30px_rgba(3,4,94,0.04)] border border-[#03045E]/10 flex items-center justify-between group hover:shadow-[0_20px_40px_rgba(44,127,255,0.1)] hover:border-[#2C7FFF]/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2C7FFF]/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2C7FFF]/10 to-[#2C7FFF]/20 border border-[#2C7FFF]/20 flex items-center justify-center text-[#2C7FFF] shadow-sm group-hover:rotate-6 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
                <p className="text-xs font-bold tracking-wider text-[#03045E]/60 uppercase">Shortlisted</p>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-[#03045E] tracking-tight">{stats.shortlistedApps}</p>
            </div>
          </div>
          <div className="relative z-10 hidden sm:flex flex-col items-end justify-center pl-4 border-l border-[#03045E]/10">
            <span className="text-[11px] font-extrabold text-[#2C7FFF] bg-[#f4f4f4] px-2.5 py-1 rounded-full mb-1 border border-[#03045E]/10">Top Talent</span>
            <span className="text-[10px] font-bold text-[#03045E]/50">Ready to Interview</span>
          </div>
        </div>

      </div>

      {/* 2. VISUALIZATIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Geofencing Map Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#f4f4f4] shadow-[0_10px_30px_rgba(3,4,94,0.04)] border border-[#03045E]/10 flex flex-col h-[440px] relative overflow-hidden group">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2C7FFF]/10 border border-[#2C7FFF]/20 flex items-center justify-center text-[#2C7FFF] shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-[#03045E]">Recruitment Zone</h3>
            </div>
            <span className="bg-[#f4f4f4] text-[#2C7FFF] text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-[#2C7FFF]/30 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-ping"></span> Geofence Active
            </span>

          </div>
          <p className="text-xs sm:text-sm font-medium text-[#03045E]/70 mb-4 leading-relaxed">
            Your office location baseline. The Smart Engine automatically filters applicants outside their safe travel radius from this point.
          </p>
          
          {profile.latitude && profile.longitude ? (
            <div className="flex-1 rounded-2xl overflow-hidden border-2 border-[#03045E]/10 relative shadow-inner group-hover:border-[#2C7FFF]/40 transition-colors">
              {/* Radar scanner visual overlay effect */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="w-48 h-48 bg-gradient-to-r from-[#2C7FFF]/10 to-[#2C7FFF]/20 rounded-full border-2 border-dashed border-[#2C7FFF]/60 animate-pulse flex items-center justify-center">
                  <div className="w-16 h-16 bg-[#2C7FFF]/20 rounded-full animate-ping"></div>
                </div>
              </div>
              <iframe 
                className="pointer-events-none w-full h-full filter contrast-[1.05]"
                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(profile.longitude) - 0.05},${Number(profile.latitude) - 0.05},${Number(profile.longitude) + 0.05},${Number(profile.latitude) + 0.05}&layer=mapnik&marker=${profile.latitude},${profile.longitude}`}
              ></iframe>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#f4f4f4]/60 rounded-2xl border-2 border-dashed border-[#03045E]/15 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#f4f4f4] border border-[#03045E]/10 flex items-center justify-center text-[#2C7FFF] mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <p className="text-sm font-bold text-[#03045E]">No coordinates saved for this location.</p>
              <p className="text-xs text-[#03045E]/60 mt-1">Update your company profile to enable geofencing mapping.</p>
            </div>
          )}
        </div>

        {/* Recent Activity Feed Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#f4f4f4] shadow-[0_10px_30px_rgba(3,4,94,0.04)] border border-[#03045E]/10 flex flex-col h-[440px] relative">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2C7FFF]/10 border border-[#2C7FFF]/20 flex items-center justify-center text-[#2C7FFF] shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-[#03045E]">Recent Activity</h3>
            </div>
            <span className="text-xs font-bold text-[#03045E]/60 bg-[#f4f4f4] px-3 py-1 rounded-full border border-[#03045E]/10">Real-time Feed</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#03045E]/70 mb-4">Latest candidate applications submitted to your active postings.</p>
          
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#03045E]/10 [&::-webkit-scrollbar-thumb]:rounded-full">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((app) => (
                <div key={app.id} className="p-4 rounded-2xl border border-[#03045E]/10 bg-gradient-to-r from-[#f4f4f4]/40 to-[#f4f4f4] flex justify-between items-center hover:bg-[#f4f4f4] hover:border-[#2C7FFF]/40 hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#2C7FFF]/10 border border-[#2C7FFF]/20 text-[#2C7FFF] font-extrabold flex items-center justify-center shrink-0 text-sm group-hover:scale-105 transition-transform">
                      {app.first_name ? app.first_name.charAt(0).toUpperCase() : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-[#03045E] text-sm truncate group-hover:text-[#2C7FFF] transition-colors">{app.first_name} {app.last_name}</p>
                      <p className="text-xs font-semibold text-[#03045E]/60 truncate">Applied for: <span className="font-bold text-[#03045E]">{app.job_title}</span></p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-3">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full inline-block shadow-sm bg-[#f4f4f4] text-[#2C7FFF] border border-[#2C7FFF]/30">
                      {app.status}
                    </span>
                    <p className="text-[10px] font-bold text-[#03045E]/40 mt-1">
                      {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-[#03045E]/15 rounded-2xl p-6 text-center bg-[#f4f4f4]/30">
                <div className="w-12 h-12 rounded-full bg-[#f4f4f4] border border-[#03045E]/10 flex items-center justify-center text-[#2C7FFF] mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-sm font-extrabold text-[#03045E]">No recent applications found.</p>
                <p className="text-xs text-[#03045E]/60 mt-1">New applicant submissions will appear here instantly.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}