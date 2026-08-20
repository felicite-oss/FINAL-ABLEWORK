import React, { useContext, useState, useEffect } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';

export default function EmployerOverview({ profile, stats, setActiveTab }) {
  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-10">
      
      {/* --- HEADER ROW (Flexbox splits left and right) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-[#f4f4f4]/90 [.high-contrast_&]:bg-black [.high-contrast_&]:border-white backdrop-blur-md p-6 rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.06)] border border-[#03045E]/20">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#2C7FFF]/15 text-[#2C7FFF] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-[#2C7FFF]/30">Employer Hub</span>
            <span className="text-xs font-bold text-[#03045E] [.high-contrast_&]:text-white bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-[#03045E]/20">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse"></span> Live System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#03045E] [.high-contrast_&]:text-white">Dashboard Overview</h1>
          <p className="text-sm font-semibold text-[#03045E]/80 [.high-contrast_&]:text-gray-300 mt-0.5">Real-time statistics, geofenced recruitment zone, and candidate pipelines for <span className="font-bold text-[#03045E] [.high-contrast_&]:text-white">{profile.company_name}</span>.</p>
        </div>
      </div>
      
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Stat Card 1: Active Jobs */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white shadow-[0_10px_30px_rgba(3,4,94,0.06)] border border-[#03045E]/20 flex items-center justify-between group hover:shadow-[0_20px_40px_rgba(44,127,255,0.15)] hover:border-[#2C7FFF]/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2C7FFF]/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2C7FFF]/15 to-[#2C7FFF]/25 border border-[#2C7FFF]/30 flex items-center justify-center text-[#2C7FFF] shadow-sm group-hover:rotate-6 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
                <p className="text-xs font-bold tracking-wider text-[#03045E]/80 [.high-contrast_&]:text-gray-300 uppercase">Active Postings</p>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-[#03045E] [.high-contrast_&]:text-white tracking-tight">{stats.activeJobs}</p>
            </div>
          </div>
          <div className="relative z-10 hidden sm:flex flex-col items-end justify-center pl-4 border-l border-[#03045E]/20 [.high-contrast_&]:border-white/30">
            <span className="text-[11px] font-extrabold text-[#2C7FFF] bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white px-2.5 py-1 rounded-full mb-1 border border-[#03045E]/20">Live Online</span>
            <span className="text-[10px] font-bold text-[#03045E]/70 [.high-contrast_&]:text-gray-400">Targeted Reach</span>
          </div>
        </div>

        {/* Stat Card 2: Pending Review */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white shadow-[0_10px_30px_rgba(3,4,94,0.06)] border border-[#03045E]/20 flex items-center justify-between group hover:shadow-[0_20px_40px_rgba(44,127,255,0.15)] hover:border-[#2C7FFF]/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2C7FFF]/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2C7FFF]/15 to-[#2C7FFF]/25 border border-[#2C7FFF]/30 flex items-center justify-center text-[#2C7FFF] shadow-sm group-hover:rotate-6 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
                <p className="text-xs font-bold tracking-wider text-[#03045E]/80 [.high-contrast_&]:text-gray-300 uppercase">Pending Review</p>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-[#03045E] [.high-contrast_&]:text-white tracking-tight">{stats.pendingApps}</p>
            </div>
          </div>
          <div className="relative z-10 hidden sm:flex flex-col items-end justify-center pl-4 border-l border-[#03045E]/20 [.high-contrast_&]:border-white/30">
            <span className="text-[11px] font-extrabold text-[#2C7FFF] bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white px-2.5 py-1 rounded-full mb-1 border border-[#03045E]/20">Action Needed</span>
            <span className="text-[10px] font-bold text-[#03045E]/70 [.high-contrast_&]:text-gray-400">New Applicants</span>
          </div>
        </div>

        {/* Stat Card 3: Shortlisted */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white shadow-[0_10px_30px_rgba(3,4,94,0.06)] border border-[#03045E]/20 flex items-center justify-between group hover:shadow-[0_20px_40px_rgba(44,127,255,0.15)] hover:border-[#2C7FFF]/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2C7FFF]/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2C7FFF]/15 to-[#2C7FFF]/25 border border-[#2C7FFF]/30 flex items-center justify-center text-[#2C7FFF] shadow-sm group-hover:rotate-6 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
                <p className="text-xs font-bold tracking-wider text-[#03045E]/80 [.high-contrast_&]:text-gray-300 uppercase">Shortlisted</p>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-[#03045E] [.high-contrast_&]:text-white tracking-tight">{stats.shortlistedApps}</p>
            </div>
          </div>
          <div className="relative z-10 hidden sm:flex flex-col items-end justify-center pl-4 border-l border-[#03045E]/20 [.high-contrast_&]:border-white/30">
            <span className="text-[11px] font-extrabold text-[#2C7FFF] bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white px-2.5 py-1 rounded-full mb-1 border border-[#03045E]/20">Top Talent</span>
            <span className="text-[10px] font-bold text-[#03045E]/70 [.high-contrast_&]:text-gray-400">Ready to Interview</span>
          </div>
        </div>

      </div>

      {/* 2. VISUALIZATIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Geofencing Map Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white shadow-[0_10px_30px_rgba(3,4,94,0.06)] border border-[#03045E]/20 flex flex-col h-[440px] relative overflow-hidden group">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2C7FFF]/15 border border-[#2C7FFF]/30 flex items-center justify-center text-[#2C7FFF] shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-[#03045E] [.high-contrast_&]:text-white">Recruitment Zone</h3>
            </div>
            <span className="bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white text-[#2C7FFF] text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-[#2C7FFF]/40 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-ping"></span> Geofence Active
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#03045E]/80 [.high-contrast_&]:text-gray-300 mb-4 leading-relaxed">
            Your office location baseline. The Smart Engine automatically filters applicants outside their safe travel radius from this point.
          </p>
          
          {profile.latitude && profile.longitude ? (
            <div className="flex-1 rounded-2xl overflow-hidden border-2 border-[#03045E]/20 [.high-contrast_&]:border-white relative shadow-inner group-hover:border-[#2C7FFF]/50 transition-colors">
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="w-48 h-48 bg-gradient-to-r from-[#2C7FFF]/15 to-[#2C7FFF]/25 rounded-full border-2 border-dashed border-[#2C7FFF]/80 animate-pulse flex items-center justify-center">
                  <div className="w-16 h-16 bg-[#2C7FFF]/30 rounded-full animate-ping"></div>
                </div>
              </div>
              <iframe 
                className="pointer-events-none w-full h-full filter contrast-[1.1]"
                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(profile.longitude) - 0.05},${Number(profile.latitude) - 0.05},${Number(profile.longitude) + 0.05},${Number(profile.latitude) + 0.05}&layer=mapnik&marker=${profile.latitude},${profile.longitude}`}
              ></iframe>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#f4f4f4]/60 [.high-contrast_&]:bg-black/60 rounded-2xl border-2 border-dashed border-[#03045E]/30 [.high-contrast_&]:border-white p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white border border-[#03045E]/20 flex items-center justify-center text-[#2C7FFF] mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <p className="text-sm font-bold text-[#03045E] [.high-contrast_&]:text-white">No coordinates saved for this location.</p>
              <p className="text-xs font-medium text-[#03045E]/80 [.high-contrast_&]:text-gray-300 mt-1">Update your company profile to enable geofencing mapping.</p>
            </div>
          )}
        </div>

        {/* Recent Activity Feed Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white shadow-[0_10px_30px_rgba(3,4,94,0.06)] border border-[#03045E]/20 flex flex-col h-[440px] relative">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2C7FFF]/15 border border-[#2C7FFF]/30 flex items-center justify-center text-[#2C7FFF] shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-[#03045E] [.high-contrast_&]:text-white">Recent Activity</h3>
            </div>
            <span className="text-xs font-bold text-[#03045E] [.high-contrast_&]:text-white bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white px-3 py-1 rounded-full border border-[#03045E]/20">Real-time Feed</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#03045E]/80 [.high-contrast_&]:text-gray-300 mb-4">Latest candidate applications submitted to your active postings.</p>
          
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#03045E]/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((app) => (
                <div key={app.id} className="p-4 rounded-2xl border border-[#03045E]/20 [.high-contrast_&]:border-white bg-gradient-to-r from-[#f4f4f4]/40 to-[#f4f4f4] [.high-contrast_&]:from-black [.high-contrast_&]:to-black flex justify-between items-center hover:bg-[#f4f4f4] [.high-contrast_&]:hover:bg-gray-900 hover:border-[#2C7FFF]/50 hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#2C7FFF]/15 border border-[#2C7FFF]/30 text-[#2C7FFF] font-extrabold flex items-center justify-center shrink-0 text-sm group-hover:scale-105 transition-transform">
                      {app.first_name ? app.first_name.charAt(0).toUpperCase() : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-[#03045E] [.high-contrast_&]:text-white text-sm truncate group-hover:text-[#2C7FFF] transition-colors">{app.first_name} {app.last_name}</p>
                      <p className="text-xs font-semibold text-[#03045E]/80 [.high-contrast_&]:text-gray-300 truncate">Applied for: <span className="font-bold text-[#03045E] [.high-contrast_&]:text-white">{app.job_title}</span></p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-3">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full inline-block shadow-sm bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white text-[#2C7FFF] border border-[#2C7FFF]/40">
                      {app.status}
                    </span>
                    <p className="text-[10px] font-bold text-[#03045E]/60 [.high-contrast_&]:text-gray-400 mt-1">
                      {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-[#03045E]/30 [.high-contrast_&]:border-white rounded-2xl p-6 text-center bg-[#f4f4f4]/30 [.high-contrast_&]:bg-black/30">
                <div className="w-12 h-12 rounded-full bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white border border-[#03045E]/20 flex items-center justify-center text-[#2C7FFF] mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a22 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-sm font-extrabold text-[#03045E] [.high-contrast_&]:text-white">No recent applications found.</p>
                <p className="text-xs font-medium text-[#03045E]/80 [.high-contrast_&]:text-gray-300 mt-1">New applicant submissions will appear here instantly.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export function AccessibilityToolbar() {
  const { mode, setMode } = useContext(AccessibilityContext);
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('high-contrast', 'standard');
    if (mode === 'High Contrast') {
      root.classList.add('high-contrast');
    } else {
      root.classList.add('standard');
    }
  }, [mode]);

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    const root = document.documentElement;
    root.classList.remove('font-normal', 'font-large', 'font-xlarge');
    root.classList.add(`font-${size}`);
  };

  const handleThemeChange = (newMode) => {
    setMode(newMode);
  };

  return (
    <div className="fixed bottom-6 left-4 sm:left-6 z-[9999] flex flex-col items-start">
      {isOpen && (
        <div 
          className="mb-3 w-[calc(100vw-2rem)] max-w-72 sm:w-72 bg-white dark:bg-gray-900 border-2 border-blue-500 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 text-gray-800 dark:text-gray-100"
          role="region"
          aria-label="Accessibility Control Panel"
        >
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-sm tracking-wide uppercase text-blue-600">Accessibility Controls</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 font-bold text-lg px-2 cursor-pointer"
              aria-label="Close accessibility menu"
            >
              &times;
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500">Display Theme</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleThemeChange('Standard')}
                className={`py-2 text-xs font-bold rounded border cursor-pointer ${
                  mode === 'Standard' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
                aria-label="Standard Mode"
              >
                Standard
              </button>
              <button
                onClick={() => handleThemeChange('High Contrast')}
                className={`py-2 text-xs font-bold rounded border cursor-pointer ${
                  mode === 'High Contrast' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
                aria-label="High Contrast Mode"
              >
                Contrast
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500">Font Size Adjustment</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleFontSizeChange('normal')}
                className={`py-1.5 text-xs font-bold rounded border cursor-pointer ${
                  fontSize === 'normal' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
                aria-label="Normal Font Size"
              >
                A
              </button>
              <button
                onClick={() => handleFontSizeChange('large')}
                className={`py-1.5 text-sm font-bold rounded border cursor-pointer ${
                  fontSize === 'large' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
                aria-label="Large Font Size"
              >
                A+
              </button>
              <button
                onClick={() => handleFontSizeChange('xlarge')}
                className={`py-1.5 px-1 text-sm font-bold rounded border cursor-pointer flex items-center justify-center whitespace-nowrap ${
                  fontSize === 'xlarge' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
                aria-label="Extra Large Font Size"
              >
                A++
              </button>
            </div>
          </div>

        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 border-2 border-white cursor-pointer"
        aria-label="Open Accessibility Menu"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="4" r="2" />
          <path d="M19 13h-2v-3c0-1.1-.9-2-2-2h-3.5c-.3-.6-.9-1-1.5-1h-2c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h2v4h2v-4h1v4h2v-5.5c0-.8-.7-1.5-1.5-1.5z" />
        </svg>
      </button>

    </div>
  );
}