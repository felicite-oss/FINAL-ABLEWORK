import React, { useContext, useState, useEffect } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


const mockChartData = [
  { name: 'Mon', applications: 4 },
  { name: 'Tue', applications: 7 },
  { name: 'Wed', applications: 2 },
  { name: 'Thu', applications: 12 },
  { name: 'Fri', applications: 8 },
  { name: 'Sat', applications: 3 },
  { name: 'Sun', applications: 9 },
];

export default function EmployerOverview({ profile, stats, setActiveTab }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isDark = isContrast || isDarkMode;

  const cardBg = isDark
    ? 'bg-black border-[#2C7FFF]/40'
    : 'bg-[#F4F4F4] border-[#03045E]';
  const textMain = isDark ? 'text-white' : 'text-[#03045E]';
  const textMuted = isDark ? 'text-white/80' : 'text-[#03045E]/80';
  const pillBg = isDark
    ? 'text-white bg-zinc-900 border-[#2C7FFF]/40'
    : 'text-[#03045E] bg-white border-[#03045E]';

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-10">

      <div className={`relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-6 sm:p-8 rounded-3xl border-2 ${cardBg}`}>
        <div className={`absolute top-0 left-0 h-full w-1.5 bg-[#2C7FFF]`}></div>
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${isDark ? 'bg-[#2C7FFF]/10' : 'bg-[#2C7FFF]/10'} pointer-events-none`}></div>
        <div className={`absolute -bottom-24 -right-4 w-40 h-40 rounded-full ${isDark ? 'bg-[#2C7FFF]/5' : 'bg-[#03045E]/5'} pointer-events-none`}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border-2 ${isDark ? 'text-white bg-black border-[#2C7FFF]' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>Employer Hub</span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 border-2 ${pillBg}`}>
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse"></span>
              Live System
            </span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${textMain}`}>Dashboard Overview</h1>
          <p className={`text-sm font-bold mt-2 max-w-xl ${textMuted}`}>
            Real-time statistics, geofenced recruitment zone, and candidate pipelines for <span className={`font-black ${textMain}`}>{profile.company_name}</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('jobs')}
          className={`text-left relative overflow-hidden p-6 rounded-3xl border-2 flex items-center justify-between group transition-all duration-300 cursor-pointer ${cardBg} ${isDark ? 'hover:border-[#2C7FFF]' : 'hover:border-[#2C7FFF]'}`}
        >
          <div className={`absolute top-0 right-0 w-40 h-40 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110 ${isDark ? 'bg-[#2C7FFF]/10' : 'bg-[#2C7FFF]/10'}`}></div>
          <div className="absolute bottom-0 left-0 w-20 h-1 bg-[#2C7FFF]"></div>
          <div className="flex items-center gap-4 relative z-10 w-full">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 ${isDark ? 'bg-[#2C7FFF] text-black' : 'bg-[#2C7FFF] text-white'}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
                <p className={`text-[10px] font-black tracking-[0.15em] uppercase ${textMuted}`}>Active Postings</p>
              </div>
              <p className={`text-4xl font-black tracking-tight ${textMain}`}>{stats.activeJobs}</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('applications')}
          className={`text-left relative overflow-hidden p-6 rounded-3xl border-2 flex items-center justify-between group transition-all duration-300 cursor-pointer ${cardBg} ${isDark ? 'hover:border-[#2C7FFF]' : 'hover:border-[#2C7FFF]'}`}
        >
          <div className={`absolute top-0 right-0 w-40 h-40 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110 ${isDark ? 'bg-[#2C7FFF]/10' : 'bg-[#2C7FFF]/10'}`}></div>
          <div className="absolute bottom-0 left-0 w-20 h-1 bg-[#2C7FFF]"></div>
          <div className="flex items-center gap-4 relative z-10 w-full">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 ${isDark ? 'bg-[#2C7FFF] text-black' : 'bg-[#2C7FFF] text-white'}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
                <p className={`text-[10px] font-black tracking-[0.15em] uppercase ${textMuted}`}>Pending Review</p>
              </div>
              <p className={`text-4xl font-black tracking-tight ${textMain}`}>{stats.pendingApps}</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('applications')}
          className={`text-left relative overflow-hidden p-6 rounded-3xl border-2 flex items-center justify-between group transition-all duration-300 cursor-pointer ${cardBg} ${isDark ? 'hover:border-[#2C7FFF]' : 'hover:border-[#2C7FFF]'}`}
        >
          <div className={`absolute top-0 right-0 w-40 h-40 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110 ${isDark ? 'bg-[#2C7FFF]/10' : 'bg-[#2C7FFF]/10'}`}></div>
          <div className="absolute bottom-0 left-0 w-20 h-1 bg-[#2C7FFF]"></div>
          <div className="flex items-center gap-4 relative z-10 w-full">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 ${isDark ? 'bg-[#2C7FFF] text-black' : 'bg-[#2C7FFF] text-white'}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
                <p className={`text-[10px] font-black tracking-[0.15em] uppercase ${textMuted}`}>Shortlisted</p>
              </div>
              <p className={`text-4xl font-black tracking-tight ${textMain}`}>{stats.shortlistedApps}</p>
            </div>
          </div>
        </button>

      </div>

      <div className="grid grid-cols-1 gap-8">

        <div className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl border-2 flex flex-col h-[440px] ${cardBg}`}>
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-[#2C7FFF]`}></div>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#2C7FFF] text-black' : 'bg-[#03045E] text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-black tracking-tight ${textMain}`}>Application Trends</h3>
                <p className={`text-[10px] font-black uppercase tracking-[0.15em] text-[#2C7FFF]`}>Weekly Report</p>
              </div>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-2 ${pillBg}`}>Last 7 Days</span>
          </div>

          <p className={`text-xs sm:text-sm font-semibold mb-6 ${textMuted}`}>Volume of candidate applications received over the last 7 days.</p>

          <div className="flex-1 w-full h-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData || mockChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#2C7FFF' : '#03045E'} strokeOpacity={0.15} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: isDark ? '#ffffff' : '#03045E', fontWeight: 'bold' }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10} 
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: isDark ? '#ffffff' : '#03045E', fontWeight: 'bold' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: '#2C7FFF', opacity: 0.1 }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '2px solid #2C7FFF', 
                    boxShadow: '0 10px 30px rgba(3,4,94,0.15)', 
                    backgroundColor: isDark ? '#000000' : '#F4F4F4', 
                    color: isDark ? '#ffffff' : '#03045E', 
                    fontWeight: 'bold' 
                  }}
                />
                <Bar 
                  dataKey="applications" 
                  fill="#2C7FFF" 
                  radius={[8, 8, 8, 8]} 
                  barSize={28} 
                  animationDuration={1500} 
                />
              </BarChart>
            </ResponsiveContainer>
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