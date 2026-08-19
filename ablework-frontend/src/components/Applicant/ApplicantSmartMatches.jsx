import React, { useState } from 'react';

export default function ApplicantSmartMatches({ profile, matches, refreshData }) {
  const [applyingTo, setApplyingTo] = useState(null);

  const handleApply = async (jobId) => {
    setApplyingTo(jobId);
    try {
      const res = await fetch('http://localhost:5001/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicant_id: profile.user_id, job_id: jobId })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Application submitted successfully!");
        refreshData(); // Refresh to update data across the dashboard
      } else {
        alert(data.message || "Failed to apply.");
      }
    } catch (err) {
      alert("Server error while applying.");
    } finally {
      setApplyingTo(null);
    }
  };

  // Helper to color-code the match percentage badge
  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  return (
    <div className="animate-fadeIn max-w-5xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      <div className="mb-8 border-b border-[#03045E]/10 pb-4">
        <h1 className="text-3xl font-extrabold text-[#03045E]">Smart Matches</h1>
        <p className="opacity-70 font-medium text-[#03045E] mt-1">
          Jobs explicitly filtered to meet your requested accommodations and travel radius.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {matches && matches.length > 0 ? (
          matches.map(job => (
            <div key={job.id} className="bg-white p-8 rounded-3xl shadow-md border border-[#03045E]/10 transition hover:shadow-lg flex flex-col md:flex-row gap-8 relative overflow-hidden">
              
              {/* Left Content Area */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-3 mb-3">
                  <span className={`px-3 py-1 text-xs font-extrabold rounded-full border flex items-center gap-1.5 ${getMatchColor(job.match_percentage)}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <circle cx="12" cy="12" r="2" fill="currentColor"/>
                    </svg>
                    {job.match_percentage}% Skill Match
                  </span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {job.distance_km} km away
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-[#03045E]">{job.job_title}</h2>
                <p className="text-lg font-semibold text-[#2C7FFF] mb-4">{job.company_name}</p>
                
                <p className="text-gray-700 mb-6 text-sm whitespace-pre-wrap">{job.job_description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Skills Display */}
                  <div>
                    <h4 className="text-xs font-bold text-[#03045E]/60 uppercase mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills && JSON.parse(job.required_skills).map((skill, i) => {
                        // Highlight skills the applicant actually has vs ones they are missing
                        const applicantSkills = profile.skills ? (typeof profile.skills === 'string' ? JSON.parse(profile.skills) : profile.skills) : [];
                        const hasSkill = applicantSkills.includes(skill);
                        
                        return (
                          <span key={i} className={`px-3 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 ${
                            hasSkill ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}>
                            {hasSkill && (
                              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accommodations Display */}
                  <div>
                    <h4 className="text-xs font-bold text-[#03045E]/60 uppercase mb-2">Verified Accommodations</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.provided_accommodations && JSON.parse(job.provided_accommodations).map((acc, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-50 text-purple-800 text-xs font-bold rounded-lg border border-purple-200">
                          {acc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Action Sidebar */}
              <div className="md:w-64 shrink-0 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-6 bg-gray-50/50 p-6 -m-8 md:m-0 rounded-b-3xl md:rounded-none md:rounded-r-3xl">
                <div>
                  <h4 className="text-xs font-bold text-[#03045E]/60 uppercase mb-1">Salary Range</h4>
                  <p className="font-semibold text-gray-800 text-sm">{job.salary_range || 'Not specified'}</p>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-[#03045E]/60 uppercase mb-1">Benefits</h4>
                  <p className="text-sm text-gray-700">{job.benefits ? JSON.parse(job.benefits).join(', ') : 'Not specified'}</p>
                </div>

                <div className="mt-auto">
                    <button 
                    onClick={() => handleApply(job.id)}
                    disabled={applyingTo === job.id}
                    className="py-4 px-6 bg-[#03045E] text-white font-bold rounded-xl hover:bg-[#2C7FFF] transition w-full disabled:bg-gray-400 shadow-md flex items-center justify-center gap-2"
                    >
                    {applyingTo === job.id ? 'Submitting...' : 'Apply Now'}
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-2 font-medium uppercase">
                        Application is sent directly to employer
                    </p>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="p-10 text-center border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center bg-white h-64">
            <svg className="w-12 h-12 text-gray-400 mb-4 opacity-60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20m10-10H2m15.364-6.364l-14.728 14.728m0-14.728l14.728 14.728"></path>
            </svg>
            <h3 className="text-lg font-bold text-[#03045E] mb-2">No exact matches right now</h3>
            <p className="text-sm font-medium text-gray-500 max-w-md">
              Try expanding your Travel Radius in your profile settings, or visit the "Explore All Jobs" tab to view postings outside your immediate smart parameters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}