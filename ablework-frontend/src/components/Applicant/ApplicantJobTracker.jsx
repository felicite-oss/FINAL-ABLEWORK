import React, { useState } from 'react';

export default function ApplicantJobTracker({ applications }) {
  const [filter, setFilter] = useState('All');
  const [expandedApp, setExpandedApp] = useState(null);

 
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Under Review':
        return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Shortlisted':
        return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Hired':
        return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Rejected':
        return 'opacity-90';
      default:
        return 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20';
    }
  };

  const getRejectedStyle = (status) => {
    if (status !== 'Rejected') return undefined;
    return {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#b91c1c',
      borderColor: 'rgba(239, 68, 68, 0.5)'
    };
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

  const getStatusMessage = (app) => {
    if (app.employer_message) return app.employer_message;
    switch (app.status) {
      case 'Shortlisted':
        return 'Employer may contact you soon';
      case 'Under Review':
        return 'Employer is viewing your profile';
      case 'Hired':
        return 'Congratulations on the new job!';
      case 'Rejected':
        return 'Unfortunately, your application was not selected.';
      default:
        return 'Application submitted.';
    }
  };

  return (
    <div className="animate-fadeIn w-full space-y-4 sm:space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div className="min-w-0 w-full">
          <h2 aria-label="My Job Tracker" className="text-xl sm:text-3xl md:text-4xl font-extrabold text-[#03045E] break-words">
            My Job Tracker
          </h2>
          <p aria-label="Monitor the status of your applications in real-time." className="text-[#03045e] mt-0.5 sm:mt-1.5 text-[11px] sm:text-sm md:text-base font-semibold">
            Monitor the status of your applications in real-time.
          </p>
        </div>
        {applications.length > 0 && (
          <div role="status" aria-label={`${applications.length} total application${applications.length !== 1 ? 's' : ''}`} className="flex items-center gap-1.5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full bg-[#f4f4f4] border border-[#03045E]/20 shrink-0">
            <span aria-hidden="true" className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF]" />
            <span aria-hidden="true" className="text-[9px] sm:text-xs font-extrabold uppercase tracking-widest text-[#03045E]">
              {applications.length} application{applications.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Adjusted container to allow full-width distribution */}
      <div className="flex gap-1 p-1 sm:gap-2 sm:p-2 rounded-lg sm:rounded-xl bg-[#f4f4f4] border border-[#03045E]/15 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {trackingTabs.map(tab => {
          const count = getTabCount(tab);
          return (
            <button 
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 min-w-fit px-1.5 py-1.5 sm:px-4 sm:py-2.5 rounded-md sm:rounded-lg font-extrabold text-[9px] min-[380px]:text-[10px] sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                filter === tab 
                  ? 'bg-[#03045E] text-white shadow-md' 
                  : 'text-[#03045E]/70 hover:bg-white hover:text-[#03045E]'
              }`}
            >
              {tab}
              {count > 0 && (
                <span className={`px-1 py-0 sm:px-1.5 sm:py-0.5 rounded-full text-[8px] sm:text-[10px] font-black shrink-0 ${
                  filter === tab ? 'bg-white text-[#03045E]' : 'bg-[#03045E]/10 text-[#03045E]'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div role="list" className="flex flex-col gap-3 sm:gap-8">
        {filteredApps.length > 0 ? (
          filteredApps.map(app => (
            <div 
              key={app.application_id} 
              role="listitem"
              tabIndex={0}
              className={`p-3.5 sm:p-8 rounded-lg sm:rounded-xl bg-white shadow-md border border-[#03045E]/20 transition-all duration-200 hover:shadow-lg flex flex-col gap-2.5 sm:gap-5 ${app.status === 'Rejected' ? 'opacity-80' : ''}`}
            >
              <span className="sr-only">
                Job Title: {app.job_title}. Company: {app.company_name}. Applied on: {new Date(app.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Status: {app.status}.
                {app.status === 'Shortlisted' && !app.employer_message ? ' Employer may contact you soon.' : ''}
                {app.status === 'Under Review' ? ' Employer is viewing your profile.' : ''}
                {app.status === 'Hired' && !app.employer_message ? ' Congratulations on the new job!' : ''}
                {app.employer_message ? ` Message from Employer: ${app.employer_message}` : ''}
              </span>
              <div aria-hidden="true" className="flex flex-col gap-2.5 sm:gap-5 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 sm:gap-4 w-full min-w-0">
                  <div className="flex-1 min-w-0 w-full">
                    <h3 className="text-sm sm:text-2xl font-extrabold text-[#03045E] leading-tight break-words w-full">
                      {app.job_title}
                    </h3>
                    <p className="text-[10px] sm:text-sm font-extrabold text-[#2C7FFF] mt-0.5 sm:mt-1.5 mb-1 sm:mb-2 break-words">
                      {app.company_name}
                    </p>
                    <p className="text-[9px] sm:text-xs font-semibold !text-white">
                      Applied on {new Date(app.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end gap-2 sm:gap-2 min-w-0 w-full md:w-auto shrink-0">
                    <button
                      onClick={() => setExpandedApp(expandedApp === app.application_id ? null : app.application_id)}
                      className={`px-2.5 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-sm font-extrabold rounded-lg border whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 sm:gap-2 ${getStatusStyle(app.status)}`}
                      style={getRejectedStyle(app.status)}
                    >
                      {app.status}
                      <svg className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 transition-transform ${expandedApp === app.application_id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {expandedApp === app.application_id && (
                  <div className="mt-1 bg-[#f4f4f4] p-3 sm:p-5 rounded-md sm:rounded-lg border border-[#03045E]/15 flex flex-col gap-1.5 sm:gap-2">
                    <h4 tabIndex="0" aria-label={app.employer_message ? 'Message from Employer' : 'Status Update'} className="text-[9px] sm:text-xs font-extrabold text-[#2C7FFF] uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                      </svg>
                      {app.employer_message ? 'Message from Employer' : 'Status Update'}
                    </h4>
                    <p tabIndex="0" aria-label={getStatusMessage(app)} className="text-[11px] sm:text-sm text-[#03045E] font-medium whitespace-pre-wrap leading-relaxed break-words focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded p-1 -m-1">
                      {getStatusMessage(app)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-5 sm:p-12 rounded-lg sm:rounded-xl border-2 border-dashed border-[#03045E]/30 bg-[#f4f4f4] flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[280px]">
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 sm:mb-5 border border-[#03045E]/20 text-[#2C7FFF]">
              <svg className="w-5 h-5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-base sm:text-xl font-extrabold text-[#03045E] mb-1.5 sm:mb-2">
              No {filter.toLowerCase()} applications found
            </h3>
            <p className="text-[11px] sm:text-sm font-semibold text-[#03045E]/70 max-w-md leading-relaxed px-2">
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