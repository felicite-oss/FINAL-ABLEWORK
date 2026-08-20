import React, { useState } from 'react';

// SAFE PARSER: Prevents the screen from crashing if database entries are poorly formatted
const safeParse = (data) => {
  if (!data) return [];
  try { return JSON.parse(data); } 
  catch (e) { return []; }
};

// ADDED applications = [] TO PROPS
export default function ApplicantSmartMatches({ profile, matches, applications = [], refreshData }) {
  const [applyingTo, setApplyingTo] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // States for the Application Flow
  const [modalView, setModalView] = useState('details'); // 'details', 'form', or 'unverified'
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  // Apply Handler using FormData for file upload
  const submitApplication = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
        alert("Please upload your resume.");
        return;
    }

    setApplyingTo(selectedJob.id);

    const formData = new FormData();
    formData.append('applicant_id', profile.user_id);
    formData.append('job_id', selectedJob.id);
    formData.append('resume', resumeFile);
    formData.append('cover_letter', coverLetter);

    try {
      const res = await fetch('http://localhost:5001/api/applications/apply', {
        method: 'POST',
        body: formData 
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("Application submitted successfully!");
        refreshData(); 
        closeModal();
      } else {
        alert(data.message || "Failed to apply.");
      }
    } catch (err) {
      alert("Server error while applying.");
    } finally {
      setApplyingTo(null);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  const openModal = (job) => {
    setSelectedJob(job);
    setModalView('details');
    setResumeFile(null);
    setCoverLetter('');
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setResumeFile(null);
    setCoverLetter('');

    // SOFT GATE CHECK:
    const isVerified = profile.verification_status === 'Approved';

    if (!isVerified) {
      setModalView('unverified'); // Triggers the soft lock screen
    } else {
      setModalView('form'); // Lets them upload the resume
    }
  };

  const closeModal = () => {
    setSelectedJob(null);
    setModalView('details');
    setResumeFile(null);
    setCoverLetter('');
  };

  // Check if selected job in modal is already applied to
  const isSelectedJobApplied = applications.some(app => app.job_id === selectedJob?.id);

  return (
    <div className="animate-fadeIn max-w-5xl relative pb-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      <div className="mb-8 border-b border-[#03045E]/10 pb-4">
        <h1 className="text-3xl font-extrabold text-[#03045E]">Smart Matches</h1>
        <p className="opacity-70 font-medium text-[#03045E] mt-1">
          Jobs explicitly filtered to meet your requested accommodations and travel radius.
        </p>
      </div>

      {/* COMPACT SMART FEED */}
      <div className="flex flex-col gap-4">
        {matches && matches.length > 0 ? (
          matches.map(job => {
            // CHECK IF ALREADY APPLIED HERE
            const hasApplied = applications.some(app => app.job_id === job.id);

            return (
              <div key={job.id} className={`bg-white p-6 rounded-2xl shadow-sm border border-[#03045E]/10 transition hover:shadow-md hover:border-[#2C7FFF]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${hasApplied ? 'opacity-70' : ''}`}>
                
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 text-xs font-extrabold rounded-full border flex items-center gap-1.5 uppercase ${getMatchColor(job.match_percentage)} w-fit`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <circle cx="12" cy="12" r="2" fill="currentColor"/>
                      </svg>
                      {job.match_percentage}% OVERALL MATCH
                    </span>
                    {job.distance_km && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-full flex items-center gap-1.5 uppercase w-fit">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        {job.distance_km} km away
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-[#03045E]">{job.job_title}</h2>
                  <p className="text-sm font-semibold text-[#2C7FFF] mb-2">{job.company_name}</p>
                  <p className="text-gray-600 text-sm line-clamp-2">{job.job_description}</p>
                </div>

                <div className="shrink-0 w-full md:w-auto flex flex-row gap-3 mt-2 md:mt-0">
                  <button 
                    onClick={() => openModal(job)}
                    className="px-6 py-2.5 bg-[#f4f4f4] text-[#03045E] font-bold rounded-xl hover:bg-gray-200 transition whitespace-nowrap"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => openApplyModal(job)}
                    disabled={hasApplied}
                    className={`px-6 py-2.5 font-bold rounded-xl transition whitespace-nowrap shadow-md ${
                      hasApplied 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-[#03045E] text-white hover:bg-[#2C7FFF]'
                    }`}
                  >
                    {hasApplied ? '✓ Applied' : 'Apply Now'}
                  </button>
                </div>

              </div>
            );
          })
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

      {/* VIEW DETAILS / APPLY MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white p-8 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            
            <button onClick={closeModal} className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition">
              ✖
            </button>

            {modalView === 'details' ? (
              // --- VIEW 1: JOB DETAILS ---
              <div className="animate-fadeIn">
                <div className="pr-12 mb-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 text-xs font-extrabold rounded-full border flex items-center gap-1.5 uppercase ${getMatchColor(selectedJob.match_percentage)} w-fit`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <circle cx="12" cy="12" r="2" fill="currentColor"/>
                      </svg>
                      {selectedJob.match_percentage}% OVERALL MATCH
                    </span>
                    {selectedJob.distance_km && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-full flex items-center gap-1.5 uppercase w-fit">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        {selectedJob.distance_km} km away
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#03045E]">{selectedJob.job_title}</h2>
                  <p className="text-xl font-semibold text-[#2C7FFF] mt-1 border-b border-gray-200 pb-6">{selectedJob.company_name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 flex flex-col gap-8">
                    <div>
                      <h3 className="text-sm font-bold text-[#03045E]/60 uppercase mb-3">Job Description</h3>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedJob.job_description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-bold text-[#03045E]/60 uppercase mb-3">Skill Comparison</h3>
                      <div className="flex flex-wrap gap-2">
                        {safeParse(selectedJob.required_skills).map((skill, i) => {
                          const applicantSkills = profile.skills ? (typeof profile.skills === 'string' ? safeParse(profile.skills) : profile.skills) : [];
                          const hasSkill = applicantSkills.includes(skill);
                          return (
                            <span key={i} className={`px-3 py-1.5 text-sm font-bold rounded-lg border flex items-center gap-1.5 ${hasSkill ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                              {hasSkill && (
                                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                              {!hasSkill && <span className="opacity-50">×</span>}
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#03045E]/60 uppercase mb-3">Verified Accommodations</h3>
                      <div className="flex flex-wrap gap-2">
                        {safeParse(selectedJob.provided_accommodations).map((acc, i) => (
                          <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-800 text-sm font-bold rounded-lg border border-purple-200">
                            {acc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 bg-[#f4f4f4]/50 p-6 rounded-2xl border border-gray-200 h-fit">
                    <div>
                      <h3 className="text-xs font-bold text-[#03045E]/60 uppercase mb-1">Salary Range</h3>
                      <p className="font-semibold text-[#03045E] text-lg">{selectedJob.salary_range || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xs font-bold text-[#03045E]/60 uppercase mb-1">Benefits</h3>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">
                        {safeParse(selectedJob.benefits).join(' • ') || 'Not specified'}
                      </p>
                    </div>

                    <div className="mt-4 pt-6 border-t border-gray-300">
                      <button 
                        onClick={() => openApplyModal(selectedJob)}
                        disabled={isSelectedJobApplied}
                        className={`py-4 px-6 font-bold rounded-xl transition w-full shadow-md ${
                          isSelectedJobApplied 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#03045E] text-white hover:bg-[#2C7FFF]'
                        }`}
                      >
                        {isSelectedJobApplied ? '✓ Already Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : modalView === 'unverified' ? (
              // --- VIEW 2: SOFT GATE (UNVERIFIED ACCOUNT) ---
              <div className="animate-fadeIn max-w-lg mx-auto text-center py-8">
                <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-[#03045E] mb-3">Verification Pending</h2>
                <p className="text-gray-600 font-medium mb-8 leading-relaxed">
                  Your PWD ID is currently being reviewed by our admin. Once your account is fully verified, this security lock will be removed and you can start applying to jobs!
                </p>
                <button 
                  onClick={() => setModalView('details')}
                  className="py-3 px-6 bg-[#03045E] text-white font-bold rounded-xl hover:bg-[#2C7FFF] transition shadow-md w-full"
                >
                  Back to Job Details
                </button>
              </div>
            ) : (
              // --- VIEW 3: APPLICATION UPLOAD FORM ---
              <div className="animate-fadeIn max-w-2xl mx-auto">
                <button onClick={() => setModalView('details')} className="text-sm font-bold text-[#2C7FFF] hover:underline mb-6 block">
                  ← Back to Job Details
                </button>
                
                <h2 className="text-3xl font-extrabold text-[#03045E] mb-2">Submit Application</h2>
                <p className="text-gray-600 mb-8 font-medium">Applying for <span className="font-bold text-[#2C7FFF]">{selectedJob.job_title}</span> at {selectedJob.company_name}</p>

                <form onSubmit={submitApplication} className="flex flex-col gap-6">
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#03045E]">Upload Resume / CV <span className="text-red-500">*</span></label>
                    <div className="border-2 border-dashed border-gray-300 p-6 rounded-2xl bg-gray-50 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl mb-2">📄</span>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        required
                        onChange={(e) => setResumeFile(e.target.files[0])}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2C7FFF]/10 file:text-[#2C7FFF] hover:file:bg-[#2C7FFF]/20 cursor-pointer"
                      />
                      <p className="text-xs text-gray-400 mt-3">Supported formats: PDF, DOCX (Max 5MB)</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#03045E]">Pitch / Cover Letter <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <textarea 
                      rows="4" 
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Briefly explain why you are a great fit for this role, or note any specific accommodations you might want to discuss..."
                      className="p-4 border border-gray-300 rounded-2xl focus:border-[#2C7FFF] outline-none resize-none"
                    ></textarea>
                  </div>

                  <div className="mt-4 pt-6 border-t border-gray-200">
                    <button 
                      type="submit"
                      disabled={applyingTo === selectedJob.id}
                      className="py-4 px-6 bg-[#03045E] text-white font-bold rounded-xl hover:bg-[#2C7FFF] transition w-full shadow-md disabled:bg-gray-400"
                    >
                      {applyingTo === selectedJob.id ? 'Uploading & Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}