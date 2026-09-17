import React, { useState } from 'react';

export default function ApplicantJobTracker({ applications }) {
  const [filter, setFilter] = useState('All');

 
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Under Review':
        return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Shortlisted':
        return 'bg-[#04AA6D]/10 text-[#04AA6D] border-[#04AA6D]/30';
      case 'Hired':
        return 'bg-emerald-600 text-white border-emerald-600 shadow-sm';
      case 'Rejected':
        return 'bg-red-500/10 text-red-700 border-red-500/40 opacity-90';
      default:
        return 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20';
    }
  };

  
  const trackingTabs = ['All', 'Under Review', 'Shortlisted', 'Hired', 'Rejected'];
  const filteredApps = applications.filter(app => {
    if (filter === 'All') return true;
    return app.status === filter;
  });


  const getTabCount = (tabName) => {
    if (tabName === 'All') return applications.length;
    return applications.filter(app => app.status === tabName).length;
  };

  return (
    <div className="animate-fadeIn w-full space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#03045E]">
            My Job Tracker
          </h2>
          <p className="text-[#2c7fff] mt-1.5 text-sm sm:text-base font-semibold">
            Monitor the status of your applications in real-time.
          </p>
        </div>
        {applications.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f4f4f4] border border-[#03045E]/20">
            <span className="w-2 h-2 rounded-full bg-[#2C7FFF]" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#03045E]">
              {applications.length} application{applications.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <div className="flex overflow-x-auto gap-2 p-1.5 rounded-[1.25rem] bg-[#f4f4f4] border border-[#03045E]/15 w-fit max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {trackingTabs.map(tab => {
          const count = getTabCount(tab);
          return (
            <button 
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                filter === tab 
                  ? 'bg-[#03045E] text-white shadow-md' 
                  : 'text-[#03045E]/70 hover:bg-white hover:text-[#03045E]'
              }`}
            >
              {tab}
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  filter === tab ? 'bg-white/20 text-white' : 'bg-[#03045E]/10 text-[#03045E]'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-6 sm:gap-8">
        {filteredApps.length > 0 ? (
          filteredApps.map(app => (
            <div 
              key={app.application_id} 
              className={`p-6 sm:p-8 rounded-[2rem] bg-white shadow-md border border-[#03045E]/20 transition-all duration-200 hover:shadow-lg hover:border-[#2C7FFF]/40 flex flex-col gap-5 ${app.status === 'Rejected' ? 'opacity-80' : ''}`}
            >
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#03045E] leading-tight">{app.job_title}</h3>
                  <p className="text-sm font-extrabold text-[#2C7FFF] mt-1.5 mb-2">{app.company_name}</p>
                  <p className="text-xs font-semibold text-[#2c7fff]/50">
                    Applied on {new Date(app.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2 min-w-[150px]">
                  <span className={`px-4 py-2 text-sm font-extrabold rounded-full border ${getStatusStyle(app.status)}`}>
                    {app.status}
                  </span>
                  
                  {app.status === 'Shortlisted' && !app.employer_message && (
                    <p className="text-[10px] font-extrabold text-[#03045E] uppercase tracking-wider">
                      Employer may contact you soon
                    </p>
                  )}
                  {app.status === 'Under Review' && (
                    <p className="text-[10px] font-extrabold text-[#2C7FFF] uppercase tracking-wider">
                      Employer is viewing your profile
                    </p>
                  )}
                  {app.status === 'Hired' && !app.employer_message && (
                    <p className="text-[10px] font-extrabold text-[#03045E] uppercase tracking-wider">
                      Congratulations on the new job!
                    </p>
                  )}
                </div>
              </div>

              {app.employer_message && (
                <div className="mt-1 bg-[#f4f4f4] p-5 rounded-[1.25rem] border border-[#03045E]/15 flex flex-col gap-2">
                  <h4 className="text-xs font-extrabold text-[#2C7FFF] uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                    Message from Employer
                  </h4>
                  <p className="text-sm text-[#03045E] font-medium whitespace-pre-wrap leading-relaxed">
                    {app.employer_message}
                  </p>
                </div>
              )}

            </div>
          ))
        ) : (
          <div className="p-8 sm:p-12 rounded-[2rem] border-2 border-dashed border-[#03045E]/30 bg-[#f4f4f4] flex flex-col items-center justify-center text-center min-h-[280px]">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-5 border border-[#03045E]/20 text-[#2C7FFF]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-[#03045E] mb-2">
              No {filter.toLowerCase()} applications found
            </h3>
            <p className="text-sm font-semibold text-[#03045E]/70 max-w-md leading-relaxed">
              {filter === 'All' 
                ? "You haven't submitted any job applications yet. Head over to Smart Matches or Explore Jobs to get started!"
                : `You don't have any applications currently in the "${filter}" state.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}