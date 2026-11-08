import React, { useState, useEffect } from 'react';

export default function ApplicantJobTracker({ applications }) {
  const [filter, setFilter] = useState('All');
  const [expandedApp, setExpandedApp] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Received':
        return 'bg-gray-100 text-gray-600 border-gray-300';
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

  const trackingTabs = ['All', 'Received', 'Under Review', 'Shortlisted', 'Hired', 'Rejected'];
  const filteredApps = applications.filter(app => {
    if (filter === 'All') return true;
    return app.status === filter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApps = filteredApps.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);

  const getTabCount = (tabName) => {
    if (tabName === 'All') return applications.length;
    return applications.filter(app => app.status === tabName).length;
  };

  const getStatusMessage = (app) => {
    if (app.employer_message) return app.employer_message;
    switch (app.status) {
      case 'Received':
        return 'Application submitted. Waiting for employer review.';
      case 'Under Review':
        return 'Employer is viewing your profile';
      case 'Shortlisted':
        return 'Employer may contact you soon';
      case 'Hired':
        return 'Congratulations on the new job!';
      case 'Rejected':
        return 'Unfortunately, your application was not selected.';
      default:
        return 'Application submitted.';
    }
  };

  const renderCard = (app) => {
    const isOpen = expandedApp === app.application_id;
    return (
      <div key={app.application_id} role="listitem" className="w-full">
        <div
          className={`overflow-hidden rounded-lg sm:rounded-xl bg-white shadow-md border border-[#03045E]/20 transition-all duration-200 hover:shadow-lg ${app.status === 'Rejected' ? 'opacity-80' : ''}`}
        >
          {/* Header with fixed height for consistent sizing */}
          <button
            type="button"
            onClick={() => setExpandedApp(isOpen ? null : app.application_id)}
            aria-expanded={isOpen}
            aria-label={`${app.job_title} at ${app.company_name}. Status: ${app.status}. Click to ${isOpen ? 'hide' : 'show'} status message.`}
            className="w-full text-left h-[140px] sm:h-[160px] p-3 sm:p-4 flex flex-col justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-inset"
          >
            <span className="sr-only">
              Job Title: {app.job_title}. Company: {app.company_name}. Applied on: {new Date(app.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Status: {app.status}.
              {app.status === 'Shortlisted' && !app.employer_message ? ' Employer may contact you soon.' : ''}
              {app.status === 'Under Review' ? ' Employer is viewing your profile.' : ''}
              {app.status === 'Hired' && !app.employer_message ? ' Congratulations on the new job!' : ''}
              {app.employer_message ? ` Message from Employer: ${app.employer_message}` : ''}
            </span>

            <div aria-hidden="true" className="flex flex-row justify-between items-start gap-2 sm:gap-4 w-full min-w-0">
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="text-sm sm:text-2xl font-extrabold text-[#03045E] leading-tight break-words line-clamp-2 w-full">
                  {app.job_title}
                </h3>
                <p className="text-[10px] sm:text-sm font-extrabold text-[#2C7FFF] mt-0.5 sm:mt-1 break-words line-clamp-1">
                  {app.company_name}
                </p>
              </div>

                         <div className="flex shrink-0 items-start">
                <div
                  tabIndex="0"
                  role="text"
                  aria-label={`Status: ${app.status}`}
                  title={`Status: ${app.status}`}
                  className={`px-2 py-0.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-sm font-extrabold rounded-lg border whitespace-nowrap flex items-center gap-1.5 sm:gap-2 focus:outline-none ${getStatusStyle(app.status)}`}
                  style={getRejectedStyle(app.status)}
                >
                  {app.status}
                  <svg
                    className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              {/* Fixed the invisible text color so it shows up correctly */}
              <p tabIndex="0" aria-label={`Applied on ${new Date(app.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`} title={`Applied on ${new Date(app.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`} className="text-[9px] sm:text-xs font-semibold text-[#03045E]/60 focus:outline-none">
                Applied on {new Date(app.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </button>

          {/* Separated slide panel */}
          <div
            className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          >
            <div className="overflow-hidden">
                        <div
                className="border-t border-[#03045E]/15 bg-[#f4f4f4] px-3 py-2 sm:px-4 sm:py-2.5 flex flex-col gap-0.5"
              >
                <h4 tabIndex="0" aria-label={app.employer_message ? 'Message from Employer' : 'Status Update'} title={app.employer_message ? 'Message from Employer' : 'Status Update'} className="text-[9px] sm:text-xs font-extrabold text-[#2C7FFF] uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 focus:outline-none">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                  </svg>
                  {app.employer_message ? 'Message from Employer' : 'Status Update'}
                </h4>
                <p tabIndex="0" aria-label={getStatusMessage(app)} title={getStatusMessage(app)} className="text-[11px] sm:text-sm text-[#03045E] font-medium whitespace-pre-wrap leading-snug break-words focus:outline-none">
                  {getStatusMessage(app)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fadeIn w-full space-y-4 sm:space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-4">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div className="min-w-0 w-full">
                     <h2 tabIndex="0" aria-label="My Job Tracker" title="My Job Tracker" className="text-xl sm:text-3xl md:text-4xl font-extrabold text-[#03045E] break-words focus:outline-none">
            My Job Tracker
          </h2>
          <p tabIndex="0" aria-label="Monitor the status of your applications in real-time." title="Monitor the status of your applications in real-time." className="text-[#03045e] mt-0.5 sm:mt-1.5 text-[11px] sm:text-sm md:text-base font-semibold focus:outline-none">
            Monitor the status of your applications in real-time.
          </p>
        </div>
        {applications.length > 0 && (
                    <div tabIndex="0" role="status" aria-label={`${applications.length} application${applications.length !== 1 ? 's' : ''}`} title={`${applications.length} application${applications.length !== 1 ? 's' : ''}`} className="flex items-center gap-1.5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full bg-[#f4f4f4] border border-[#03045E]/20 shrink-0 focus:outline-none">
            <span aria-hidden="true" className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF]" />
            <span aria-hidden="true" className="text-[9px] sm:text-xs font-extrabold uppercase tracking-widest text-[#03045E]">
              {applications.length} application{applications.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

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
                <span className={`min-w-[16px] h-4 sm:min-w-[20px] sm:h-5 px-1 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-black shrink-0 ${
                  filter === tab ? 'bg-white text-[#03045E]' : 'bg-[#03045E]/10 text-[#03045E]'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filteredApps.length > 0 ? (
        <>
          {/* Mobile view - single column in exact order */}
          <div role="list" className="md:hidden flex flex-col gap-3 w-full">
            {currentApps.map(app => renderCard(app))}
          </div>

          {/* Desktop view - independent flex columns to prevent items swapping sides */}
          <div role="list" className="hidden md:flex flex-row gap-3 sm:gap-6 w-full items-start">
            <div className="flex-1 flex flex-col gap-3 sm:gap-6 w-full">
              {currentApps.filter((_, i) => i % 2 === 0).map(app => renderCard(app))}
            </div>
            <div className="flex-1 flex flex-col gap-3 sm:gap-6 w-full">
              {currentApps.filter((_, i) => i % 2 === 1).map(app => renderCard(app))}
            </div>
          </div>
        </>
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

      {totalPages > 1 && (
        <div className="flex justify-between items-center gap-3 w-full pt-4 mt-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer border-2 bg-white text-[#03045E] border-[#03045E]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-[10px] sm:text-xs font-black text-[#03045E]/70">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer border-2 bg-white text-[#03045E] border-[#03045E]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}