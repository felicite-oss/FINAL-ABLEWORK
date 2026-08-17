import React, { useState, useMemo } from 'react';

// Haversine Formula to calculate distance on the frontend
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

// SAFE PARSER: Prevents the entire screen from crashing if a database entry is poorly formatted
const safeParse = (data) => {
  if (!data) return [];
  try { return JSON.parse(data); } 
  catch (e) { return []; }
};

export default function ApplicantExploreJobs({ profile, jobs, refreshData }) {
  const [applyingTo, setApplyingTo] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  // States for the Application Flow
  const [modalView, setModalView] = useState('details'); // 'details' or 'form'
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState('Any');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedAccs, setSelectedAccs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Dynamically extract unique skills and accommodations safely
  const availableSkills = useMemo(() => {
    if (!jobs) return [];
    const all = jobs.flatMap(job => safeParse(job.required_skills));
    return Array.from(new Set(all)).filter(Boolean).sort();
  }, [jobs]);

  const availableAccs = useMemo(() => {
    if (!jobs) return [];
    const all = jobs.flatMap(job => safeParse(job.provided_accommodations));
    return Array.from(new Set(all)).filter(Boolean).sort();
  }, [jobs]);

  // Toggle Handlers
  const toggleSkill = (skill) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const toggleAcc = (acc) => {
    setSelectedAccs(prev => prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]);
  };

  // --- FILTERING LOGIC ---
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter(job => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!job.job_title?.toLowerCase().includes(query) && !job.company_name?.toLowerCase().includes(query)) return false;
      }
      if (maxDistance !== 'Any') {
        const dist = getDistanceFromLatLonInKm(profile?.latitude, profile?.longitude, job.latitude, job.longitude);
        if (dist === null || dist > Number(maxDistance)) return false;
      }
      if (selectedSkills.length > 0) {
        const jobSkills = safeParse(job.required_skills);
        if (!selectedSkills.some(s => jobSkills.includes(s))) return false;
      }
      if (selectedAccs.length > 0) {
        const jobAccs = safeParse(job.provided_accommodations);
        if (!selectedAccs.some(a => jobAccs.includes(a))) return false;
      }
      return true;
    }).map(job => {
      const distance = getDistanceFromLatLonInKm(profile?.latitude, profile?.longitude, job.latitude, job.longitude);
      return { ...job, calculatedDistance: distance ? distance.toFixed(1) : null };
    });
  }, [jobs, searchQuery, maxDistance, selectedSkills, selectedAccs, profile]);

  // Updated Apply Handler using FormData for file upload
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

  const openModal = (job) => {
    setSelectedJob(job);
    setModalView('details');
    setResumeFile(null);
    setCoverLetter('');
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setModalView('form'); // Jumps straight to the application form
    setResumeFile(null);
    setCoverLetter('');
  };

  const closeModal = () => {
    setSelectedJob(null);
    setModalView('details');
    setResumeFile(null);
    setCoverLetter('');
  };

  return (
    <div className="animate-fadeIn max-w-5xl relative pb-10">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#03045E]/10 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#03045E]">Explore All Jobs</h1>
          <p className="opacity-70 font-medium text-[#03045E] mt-1">Browse and filter the complete marketplace.</p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${showFilters ? 'bg-[#03045E] text-white shadow-md' : 'bg-white border border-gray-300 text-[#03045E] hover:bg-gray-50'}`}
        >
          {showFilters ? '✕ Close Filters' : '🔍 Filter Jobs'}
        </button>
      </div>

      {/* FILTER SECTION (with Accessibility enhancements) */}
      {showFilters && (
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-[#03045E]/10 animate-fadeIn flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="job-search" className="text-xs font-bold text-[#03045E]/60 uppercase">Search by Title or Company</label>
              <input 
                id="job-search" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Data Entry, TechNova..."
                aria-label="Search input for job title or company name"
                className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="distance-filter" className="text-xs font-bold text-[#03045E]/60 uppercase">Maximum Distance</label>
              <select 
                id="distance-filter" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)}
                aria-label="Dropdown menu to filter jobs by maximum travel distance"
                className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none bg-white cursor-pointer"
              >
                <option value="Any">Anywhere (Show all)</option>
                <option value="5">Within 5 km</option>
                <option value="15">Within 15 km</option>
                <option value="30">Within 30 km</option>
                <option value="50">Within 50 km</option>
              </select>
            </div>
          </div>
          <hr className="border-gray-200" />
          <div>
            <span className="text-xs font-bold text-[#03045E]/60 uppercase mb-2 block" id="skills-group-label">Filter by Skills</span>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="skills-group-label">
              {availableSkills.map(skill => (
                <button 
                  key={skill} onClick={() => toggleSkill(skill)}
                  aria-pressed={selectedSkills.includes(skill)}
                  aria-label={`Toggle skill filter for ${skill}`}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${selectedSkills.includes(skill) ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] shadow-sm' : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-200'}`}
                >
                  {selectedSkills.includes(skill) ? '✓ ' : ''}{skill}
                </button>
              ))}
              {availableSkills.length === 0 && <span className="text-sm text-gray-400 italic">No skills available.</span>}
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-[#03045E]/60 uppercase mb-2 block" id="acc-group-label">Filter by Accommodations</span>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="acc-group-label">
              {availableAccs.map(acc => (
                <button 
                  key={acc} onClick={() => toggleAcc(acc)}
                  aria-pressed={selectedAccs.includes(acc)}
                  aria-label={`Toggle accommodation filter for ${acc}`}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${selectedAccs.includes(acc) ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'}`}
                >
                  {selectedAccs.includes(acc) ? '✓ ' : ''}{acc}
                </button>
              ))}
              {availableAccs.length === 0 && <span className="text-sm text-gray-400 italic">No accommodations available.</span>}
            </div>
          </div>
          {(searchQuery || maxDistance !== 'Any' || selectedSkills.length > 0 || selectedAccs.length > 0) && (
            <div className="flex justify-end mt-2">
              <button onClick={() => { setSearchQuery(''); setMaxDistance('Any'); setSelectedSkills([]); setSelectedAccs([]); }} aria-label="Clear all applied filters" className="text-sm font-bold text-red-600 hover:underline">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* COMPACT JOB FEED */}
      <div className="flex flex-col gap-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#03045E]/10 transition hover:shadow-md hover:border-[#2C7FFF]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              <div className="flex-1">
                {job.calculatedDistance && (
                   <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-extrabold uppercase rounded-md mb-2">
                     📍 {job.calculatedDistance} km away
                   </span>
                )}
                <h2 className="text-xl font-bold text-[#03045E]">{job.job_title}</h2>
                <p className="text-sm font-semibold text-[#2C7FFF] mb-2">{job.company_name}</p>
                <p className="text-gray-600 text-sm line-clamp-2">{job.job_description}</p>
              </div>

              <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => openModal(job)}
                  className="px-6 py-3 bg-[#f4f4f4] text-[#03045E] font-bold rounded-xl hover:bg-gray-200 transition w-full md:w-auto"
                >
                  View Details
                </button>
                <button 
                  onClick={() => openApplyModal(job)}
                  className="px-6 py-3 bg-[#03045E] text-white font-bold rounded-xl hover:bg-[#2C7FFF] transition w-full md:w-auto shadow-md"
                >
                  Apply Now
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="p-10 text-center font-bold text-gray-500 border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center h-48 bg-white">
             <span className="text-3xl mb-2 opacity-50">🔍</span>
             <p>No jobs match your current filters.</p>
             <button onClick={() => { setSearchQuery(''); setMaxDistance('Any'); setSelectedSkills([]); setSelectedAccs([]); }} className="text-[#2C7FFF] hover:underline mt-2">Clear filters</button>
          </div>
        )}
      </div>

      {/* VIEW DETAILS / APPLY MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white p-8 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            
            <button onClick={closeModal} className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition">
              ✖
            </button>

            {modalView === 'details' ? (
              // --- VIEW 1: JOB DETAILS ---
              <div className="animate-fadeIn">
                <div className="pr-12 mb-8 border-b border-gray-200 pb-6">
                  {selectedJob.calculatedDistance && (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 text-xs font-extrabold uppercase rounded-full mb-3">
                      📍 {selectedJob.calculatedDistance} km away
                    </span>
                  )}
                  <h2 className="text-3xl font-extrabold text-[#03045E]">{selectedJob.job_title}</h2>
                  <p className="text-xl font-semibold text-[#2C7FFF] mt-1">{selectedJob.company_name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 flex flex-col gap-8">
                    <div>
                      <h3 className="text-sm font-bold text-[#03045E]/60 uppercase mb-3">Job Description</h3>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedJob.job_description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-bold text-[#03045E]/60 uppercase mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {safeParse(selectedJob.required_skills).map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg border border-gray-200">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#03045E]/60 uppercase mb-3">Provided Accommodations</h3>
                      <div className="flex flex-wrap gap-2">
                        {safeParse(selectedJob.provided_accommodations).map((acc, i) => (
                          <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-800 text-sm font-bold rounded-lg border border-purple-200">{acc}</span>
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
                        onClick={() => setModalView('form')}
                        className="py-4 px-6 bg-[#03045E] text-white font-bold rounded-xl hover:bg-[#2C7FFF] transition w-full shadow-md"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // --- VIEW 2: APPLICATION UPLOAD FORM ---
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
                        type="file" accept=".pdf,.doc,.docx" required onChange={(e) => setResumeFile(e.target.files[0])}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2C7FFF]/10 file:text-[#2C7FFF] hover:file:bg-[#2C7FFF]/20 cursor-pointer"
                      />
                      <p className="text-xs text-gray-400 mt-3">Supported formats: PDF, DOCX (Max 5MB)</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#03045E]">Pitch / Cover Letter <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <textarea 
                      rows="4" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Briefly explain why you are a great fit for this role, or note any specific accommodations you might want to discuss..."
                      className="p-4 border border-gray-300 rounded-2xl focus:border-[#2C7FFF] outline-none resize-none"
                    ></textarea>
                  </div>

                  <div className="mt-4 pt-6 border-t border-gray-200">
                    <button 
                      type="submit" disabled={applyingTo === selectedJob.id}
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