import React, { useState } from 'react';

export default function ApplicantExploreJobs({ profile, jobs, refreshData }) {
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
        refreshData(); // Refresh to update the tracker
      } else {
        alert(data.message || "Failed to apply.");
      }
    } catch (err) {
      alert("Server error while applying.");
    } finally {
      setApplyingTo(null);
    }
  };

  return (
    <div className="animate-fadeIn max-w-5xl">
      <div className="mb-8 border-b border-[#03045E]/10 pb-4">
        <h1 className="text-3xl font-extrabold text-[#03045E]">Explore All Jobs</h1>
        <p className="opacity-70 font-medium text-[#03045E] mt-1">Browse the complete marketplace of active job postings.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.length > 0 ? (
          jobs.map(job => (
            <div key={job.id} className="bg-white p-8 rounded-3xl shadow-md border border-[#03045E]/10 transition hover:shadow-lg flex flex-col md:flex-row gap-8">
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#03045E]">{job.job_title}</h2>
                <p className="text-lg font-semibold text-[#2C7FFF] mb-4">{job.company_name}</p>
                
                <p className="text-gray-700 mb-6 whitespace-pre-wrap">{job.job_description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Skills Display */}
                  <div>
                    <h4 className="text-xs font-bold text-[#03045E]/60 uppercase mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills && JSON.parse(job.required_skills).map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Accommodations Display */}
                  <div>
                    <h4 className="text-xs font-bold text-[#03045E]/60 uppercase mb-2">Provided Accommodations</h4>
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

              {/* Action Sidebar */}
              <div className="md:w-64 shrink-0 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-6">
                <div>
                  <h4 className="text-xs font-bold text-[#03045E]/60 uppercase mb-1">Salary Range</h4>
                  <p className="font-semibold text-gray-800">{job.salary_range || 'Not specified'}</p>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-[#03045E]/60 uppercase mb-1">Benefits</h4>
                  <p className="text-sm text-gray-700">{job.benefits ? JSON.parse(job.benefits).join(', ') : 'Not specified'}</p>
                </div>

                <button 
                  onClick={() => handleApply(job.id)}
                  disabled={applyingTo === job.id}
                  className="mt-auto py-3 px-6 bg-[#03045E] text-white font-bold rounded-xl hover:bg-[#2C7FFF] transition w-full disabled:bg-gray-400 shadow-md"
                >
                  {applyingTo === job.id ? 'Applying...' : 'Apply Now'}
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="p-10 text-center font-bold text-gray-500 border-2 border-dashed border-gray-300 rounded-3xl">
            No active jobs available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}