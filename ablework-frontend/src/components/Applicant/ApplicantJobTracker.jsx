import React, { useState } from 'react';

export default function ApplicantJobTracker({ applications }) {
  const [filter, setFilter] = useState('All');

  // Helper to color-code the status badge
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shortlisted':
        return 'bg-green-100 text-green-800 border-green-200 shadow-sm';
      case 'Hired':
        return 'bg-emerald-500 text-white border-emerald-600 shadow-md';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200 opacity-80';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Filter the applications based on the selected tab
  const filteredApps = applications.filter(app => {
    if (filter === 'All') return true;
    if (filter === 'Active') return ['Pending', 'Under Review', 'Shortlisted'].includes(app.status);
    if (filter === 'Closed') return ['Hired', 'Rejected'].includes(app.status);
    return true;
  });

  return (
    <div className="animate-fadeIn max-w-5xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      <div className="mb-8 border-b border-[#03045E]/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#03045E]">My Job Tracker</h1>
          <p className="opacity-70 font-medium text-[#03045E] mt-1">
            Monitor the status of your applications in real-time.
          </p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 bg-gray-200 p-1 rounded-xl">
            <button 
                onClick={() => setFilter('All')}
                className={`px-5 py-2 rounded-lg font-bold text-sm transition ${filter === 'All' ? 'bg-[#03045E] text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
            >
                All
            </button>
            <button 
                onClick={() => setFilter('Active')}
                className={`px-5 py-2 rounded-lg font-bold text-sm transition ${filter === 'Active' ? 'bg-[#03045E] text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
            >
                Active
            </button>
            <button 
                onClick={() => setFilter('Closed')}
                className={`px-5 py-2 rounded-lg font-bold text-sm transition ${filter === 'Closed' ? 'bg-[#03045E] text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
            >
                Closed
            </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredApps.length > 0 ? (
          filteredApps.map(app => (
            <div 
              key={app.application_id} 
              className={`bg-white p-6 rounded-2xl shadow-sm border border-[#03045E]/10 transition hover:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${app.status === 'Rejected' ? 'opacity-70' : ''}`}
            >
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#03045E]">{app.job_title}</h3>
                <p className="text-sm font-semibold text-[#2C7FFF] mb-1">{app.company_name}</p>
                <p className="text-xs font-medium text-gray-500">
                  Applied on {new Date(app.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2 min-w-[150px]">
                <span className={`px-4 py-2 text-sm font-bold rounded-full border ${getStatusStyle(app.status)}`}>
                  {app.status}
                </span>
                
                {app.status === 'Shortlisted' && (
                  <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider">
                    Employer may contact you soon
                  </p>
                )}
                {app.status === 'Under Review' && (
                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    Employer is viewing your profile
                  </p>
                )}
              </div>

            </div>
          ))
        ) : (
          <div className="p-10 text-center border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center bg-white h-64">
            <svg className="w-12 h-12 text-gray-400 mb-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
            </svg>
            <h3 className="text-lg font-bold text-[#03045E] mb-2">No {filter.toLowerCase()} applications found</h3>
            <p className="text-sm font-medium text-gray-500 max-w-md">
              {filter === 'All' 
                ? "You haven't submitted any job applications yet. Head over to the Smart Matches or Explore Jobs tab to get started!"
                : `You don't have any applications currently in the ${filter} state.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}