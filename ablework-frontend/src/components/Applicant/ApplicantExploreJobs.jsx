import React, { useState, useMemo } from 'react';
import AbbyChatbot from '../AbbyChatbot';


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


const safeParse = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  let parsed = data;
  while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
    try { parsed = JSON.parse(parsed); } catch (e) { break; }
  }
  if (Array.isArray(parsed)) return parsed;
  if (typeof parsed === 'string') {
    const cleaned = parsed.replace(/[\[\]"\\]/g, ''); 
    return cleaned.split(',').map(item => item.trim()).filter(item => item);
  }
  return [];
};

export default function ApplicantExploreJobs({ profile, jobs, applications = [], refreshData }) {
  const [applyingTo, setApplyingTo] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const [modalView, setModalView] = useState('details'); 
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sweetAlert, setSweetAlert] = useState({ isOpen: false, title: '', text: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState('Any');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedAccs, setSelectedAccs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

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

  const availableSearchTerms = useMemo(() => {
    if (!jobs) return [];
    const terms = new Set();
    jobs.forEach(job => {
      if (job.job_title) terms.add(job.job_title.trim());
      if (job.company_name) terms.add(job.company_name.trim());
    });
    return Array.from(terms).filter(Boolean).sort();
  }, [jobs]);

  const searchSuggestions = useMemo(() => {
    if (searchQuery.trim().length < 1) return [];
    const query = searchQuery.toLowerCase();
    return availableSearchTerms
      .filter(term => term.toLowerCase().includes(query) && term.toLowerCase() !== query)
      .slice(0, 4);
  }, [searchQuery, availableSearchTerms]);

  const toggleSkill = (skill) => setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  const toggleAcc = (acc) => setSelectedAccs(prev => prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]);

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

  const closeSweetAlert = () => {
    setSweetAlert({ ...sweetAlert, isOpen: false });
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
        setSweetAlert({
          isOpen: true,
          title: 'Resume Required',
          text: 'Please upload your resume / CV before submitting your application.'
        });
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
        closeModal();
        setShowSuccessModal(true);
        refreshData();
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      } else {
        setSweetAlert({
          isOpen: true,
          title: 'Application Notice',
          text: data.message || "Failed to apply."
        });
      }
    } catch (err) {
      setSweetAlert({
        isOpen: true,
        title: 'Server Error',
        text: "Server error while applying."
      });
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
    const hasApplied = applications.some(app => app.job_id === job.id);
    if (hasApplied) {
      setSweetAlert({
        isOpen: true,
        title: 'Already Applied',
        text: 'You have already applied for this job.'
      });
      return;
    }

    setSelectedJob(job);
    setResumeFile(null);
    setCoverLetter('');
    const isVerified = profile.verification_status === 'Approved';
    setModalView(isVerified ? 'form' : 'unverified');
  };

  const closeModal = () => {
    setSelectedJob(null);
    setModalView('details');
    setResumeFile(null);
    setCoverLetter('');
  };

  return (
    <div className="animate-fadeIn w-full space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-10">
      

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#03045E]">
            Explore All Jobs
          </h2>
          <p className="text-[#03045E] mt-1.5 text-sm sm:text-base font-bold">
            Browse and filter the complete marketplace from inclusive employers.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {filteredJobs.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f4f4f4] border border-[#03045E]/30">
              <span className="w-2 h-2 rounded-full bg-[#2c7fff]" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#03045E]">
                {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-3 rounded-xl font-extrabold text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm ${
              showFilters
                ? 'bg-[#03045E] text-white border border-[#03045E]'
                : 'bg-[#f4f4f4] border border-[#03045E]/30 text-[#03045E] hover:bg-[#03045E] hover:text-white hover:border-[#03045E]'
            }`}
          >
            {showFilters ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Close Filters
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Filter Jobs
              </>
            )}
          </button>
        </div>
      </div>


      {showFilters && (
        <div className="p-6 sm:p-8 rounded-[2rem] bg-white shadow-md border border-[#03045E]/30 animate-fadeIn flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="job-search" className="text-xs font-extrabold text-[#03045E] uppercase tracking-widest">Search by Title or Company</label>
              <input 
                id="job-search" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Data Entry, TechNova..."
                className="p-3.5 border border-[#03045E]/30 rounded-xl bg-[#f4f4f4] text-[#03045E] font-bold focus:border-[#2c7fff] focus:bg-white outline-none transition"
              />
              {searchSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 animate-fadeIn">
                  {searchSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearchQuery(suggestion)}
                      className="px-3 py-1.5 bg-[#2c7FFF]/10 text-[#2c7fff] text-xs font-extrabold rounded-full hover:bg-[#2c7fff] hover:text-white transition-colors border border-[#2c7fff]/30 flex items-center gap-1 cursor-pointer"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="distance-filter" className="text-xs font-extrabold text-[#03045E] uppercase tracking-widest">Maximum Distance</label>
              <select 
                id="distance-filter" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)}
                className="p-3.5 border border-[#03045E]/30 rounded-xl bg-[#f4f4f4] text-[#03045E] font-bold focus:border-[#2c7fff] focus:bg-white outline-none cursor-pointer transition"
              >
                <option value="Any">Anywhere (Show all)</option>
                <option value="5">Within 5 km</option>
                <option value="15">Within 15 km</option>
                <option value="30">Within 30 km</option>
                <option value="50">Within 50 km</option>
              </select>
            </div>
          </div>

          <hr className="border-[#03045E]/15" />

          <div>
            <span className="text-xs font-extrabold text-[#03045E] uppercase tracking-widest mb-3 block">Filter by Skills</span>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map(skill => (
                <button 
                  key={skill} onClick={() => toggleSkill(skill)}
                  className={`px-3.5 py-1.5 text-xs font-extrabold rounded-full border transition-all cursor-pointer inline-flex items-center gap-1 ${
                    selectedSkills.includes(skill)
                      ? 'bg-[#03045E] text-white border-[#03045E] shadow-sm'
                      : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/30 hover:border-[#2c7fff] hover:bg-[#2c7fff]/10'
                  }`}
                >
                  {selectedSkills.includes(skill) && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-extrabold text-[#03045E] uppercase tracking-widest mb-3 block">Filter by Accommodations</span>
            <div className="flex flex-wrap gap-2">
              {availableAccs.map(acc => (
                <button 
                  key={acc} onClick={() => toggleAcc(acc)}
                  className={`px-3.5 py-1.5 text-xs font-extrabold rounded-full border transition-all cursor-pointer inline-flex items-center gap-1 ${
                    selectedAccs.includes(acc)
                      ? 'bg-[#2c7fff] text-white border-[#2c7fff] shadow-sm'
                      : 'bg-[#f4f4f4] text-[#2c7fff] border-[#2c7fff]/40 hover:bg-[#2c7fff]/15'
                  }`}
                >
                  {selectedAccs.includes(acc) && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                  {acc}
                </button>
              ))}
            </div>
          </div>

          {(searchQuery || maxDistance !== 'Any' || selectedSkills.length > 0 || selectedAccs.length > 0) && (
            <div className="flex justify-end pt-2 border-t border-[#03045E]/15">
              <button
                onClick={() => { setSearchQuery(''); setMaxDistance('Any'); setSelectedSkills([]); setSelectedAccs([]); }}
                className="text-sm font-extrabold text-[#03045E] hover:text-[#2c7fff] hover:underline cursor-pointer transition"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}


      <div className="flex flex-col gap-6 sm:gap-8">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => {
            const hasApplied = applications.some(app => app.job_id === job.id);

            return (
              <div
                key={job.id}
                className={`p-6 sm:p-8 rounded-[2rem] bg-white shadow-md border border-[#03045E]/30 transition-all duration-200 hover:shadow-lg hover:border-[#2c7fff]/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${hasApplied ? 'opacity-85' : ''}`}
              >
                <div className="flex-1 w-full min-w-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.calculatedDistance && (
                      <span className="px-3 py-1.5 bg-[#2c7fff]/10 text-[#2c7fff] border border-[#2c7fff]/40 text-xs font-extrabold rounded-full flex items-center gap-1.5 uppercase tracking-wide w-fit">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        {job.calculatedDistance} km away
                      </span>
                    )}
                    {hasApplied && (
                      <span className="px-3 py-1.5 bg-[#f4f4f4] text-[#03045E] border border-[#03045E]/30 text-xs font-extrabold rounded-full uppercase tracking-wide w-fit inline-flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Applied
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#03045E] leading-tight">{job.job_title}</h2>
                  <p className="text-sm font-extrabold text-[#2c7fff] mt-1.5 mb-3">{job.company_name}</p>
                  <p className="text-[#03045E] text-sm font-bold line-clamp-2 leading-relaxed">{job.job_description}</p>
                </div>

                <div className="shrink-0 w-full md:w-auto flex flex-row gap-3">
                  <button 
                    onClick={() => openModal(job)}
                    className="flex-1 md:flex-none px-6 py-3.5 bg-[#f4f4f4] border border-[#03045E]/30 text-[#03045E] font-extrabold text-sm rounded-xl hover:bg-[#03045E] hover:text-[#f4f4f4] hover:border-[#03045E] transition-all duration-200 whitespace-nowrap cursor-pointer"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => openApplyModal(job)}
                    disabled={hasApplied}
                    className={`flex-1 md:flex-none px-6 py-3.5 font-extrabold text-sm rounded-xl transition-all duration-200 whitespace-nowrap shadow-sm cursor-pointer ${
                      hasApplied 
                        ? 'bg-[#f4f4f4] text-[#03045E]/50 border border-[#03045E]/20 cursor-not-allowed' 
                        : 'bg-[#03045E] text-white hover:bg-[#2c7fff] border border-transparent'
                    }`}
                  >
                    {hasApplied ? (
                      <span className="inline-flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Applied
                      </span>
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 sm:p-12 rounded-[2rem] border-2 border-dashed border-[#03045E]/40 bg-[#f4f4f4] flex flex-col items-center justify-center text-center min-h-[280px]">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-5 border border-[#03045E]/30 text-[#2c7fff]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-[#03045E] mb-2">No jobs match your filters</h3>
            <p className="text-sm font-bold text-[#03045E] max-w-md mb-4 leading-relaxed">
              Try adjusting search, distance, skills, or accommodations.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setMaxDistance('Any'); setSelectedSkills([]); setSelectedAccs([]); }}
              className="px-5 py-2.5 bg-[#2c7fff] text-white font-extrabold text-sm rounded-xl hover:bg-[#03045E] transition shadow-sm cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03045E]/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border border-[#03045E]/20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 w-10 h-10 bg-[#f4f4f4] border border-[#03045E]/30 rounded-full flex items-center justify-center text-[#03045E] hover:bg-[#03045E] hover:text-white transition cursor-pointer"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {modalView === 'details' ? (

              <div className="animate-fadeIn">
                <div className="pr-12 mb-6 border-b border-[#03045E]/15 pb-6">
                  {selectedJob.calculatedDistance && (
                    <span className="inline-flex px-3 py-1.5 bg-[#2c7fff]/10 text-[#2c7fff] border border-[#2c7fff]/40 text-xs font-extrabold uppercase tracking-wide rounded-full mb-3 items-center gap-1.5 w-fit">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      {selectedJob.calculatedDistance} km away
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#03045E]">{selectedJob.job_title}</h2>
                  <p className="text-lg sm:text-xl font-extrabold text-[#2c7fff] mt-1">{selectedJob.company_name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 flex flex-col gap-8">
                    <div>
                      <h3 className="text-xs font-extrabold text-[#03045E] uppercase tracking-widest mb-3">Job Description</h3>
                      <p className="text-[#03045E] font-bold whitespace-pre-wrap leading-relaxed">{selectedJob.job_description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xs font-extrabold text-[#03045E] uppercase tracking-widest mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {safeParse(selectedJob.required_skills).map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-[#f4f4f4] text-[#03045E] text-sm font-extrabold rounded-xl border border-[#03045E]/25">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-extrabold text-[#03045E] uppercase tracking-widest mb-3">Provided Accommodations</h3>
                      <div className="flex flex-wrap gap-2">
                        {safeParse(selectedJob.provided_accommodations).map((acc, i) => (
                          <span key={i} className="px-3 py-1.5 bg-[#2c7fff]/10 text-[#2c7fff] text-sm font-extrabold rounded-xl border border-[#2c7fff]/30">{acc}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-extrabold text-[#03045E] uppercase tracking-widest mb-3">Accepted Disabilities</h3>
                      <div className="flex flex-wrap gap-2">
                        {safeParse(selectedJob.accepted_disabilities).length > 0 ? (
                          safeParse(selectedJob.accepted_disabilities).map((disability, i) => (
                            <span key={i} className="px-3 py-1.5 bg-[#03045E]/5 text-[#03045E] text-sm font-extrabold rounded-xl border border-[#03045E]/25">
                              {disability}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm font-bold text-[#03045E]/60 italic">None specified for this posting</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 bg-[#f4f4f4] p-6 rounded-[1.5rem] border border-[#03045E]/20 h-fit">
                    <div>
                      <h3 className="text-xs font-extrabold text-[#03045E] uppercase tracking-widest mb-1">Salary Range</h3>
                      <p className="font-extrabold text-[#03045E] text-lg">{selectedJob.salary_range || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xs font-extrabold text-[#03045E] uppercase tracking-widest mb-1">Benefits</h3>
                      <p className="text-sm text-[#03045E] font-bold leading-relaxed">
                        {safeParse(selectedJob.benefits).join(' • ') || 'Not specified'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#03045E]/20">
                      <h3 className="text-xs font-extrabold text-[#03045E] uppercase tracking-widest mb-3">Contact Info</h3>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5 text-sm text-[#03045E] font-bold break-all">
                          <svg className="w-4 h-4 shrink-0 text-[#2c7fff]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          {selectedJob.contact_email || selectedJob.email || 'Not provided'}
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-[#03045E] font-bold">
                          <svg className="w-4 h-4 shrink-0 text-[#2c7fff]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                          {selectedJob.contact_number || selectedJob.phone || 'Not provided'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 pt-6 border-t border-[#03045E]/20">
                      <button 
                        onClick={() => openApplyModal(selectedJob)}
                        disabled={applications.some(app => app.job_id === selectedJob.id)}
                        className={`py-4 px-6 font-extrabold text-sm rounded-xl transition w-full shadow-sm cursor-pointer ${
                          applications.some(app => app.job_id === selectedJob.id) 
                            ? 'bg-white text-[#03045E]/50 border border-[#03045E]/20 cursor-not-allowed' 
                            : 'bg-[#03045E] text-white hover:bg-[#2c7fff]'
                        }`}
                      >
                        {applications.some(app => app.job_id === selectedJob.id) ? (
                          <span className="inline-flex items-center justify-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            Already Applied
                          </span>
                        ) : (
                          'Apply Now'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : modalView === 'unverified' ? (
              <div className="animate-fadeIn max-w-lg mx-auto text-center py-8">
                <div className="w-20 h-20 bg-[#2c7fff]/10 text-[#2c7fff] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#2c7fff]/30">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h2 className="text-2xl font-extrabold text-[#03045E] mb-3">Verification Pending</h2>
                <p className="text-[#03045E] font-bold mb-8 leading-relaxed">
                  Your PWD ID is currently being reviewed by our admin. Once your account is fully verified, this security lock will be removed and you can start applying to jobs!
                </p>
                <button onClick={() => setModalView('details')} className="py-3.5 px-6 bg-[#03045E] text-white font-extrabold text-sm rounded-xl hover:bg-[#2c7fff] transition shadow-sm w-full cursor-pointer">
                  Back to Job Details
                </button>
              </div>
            ) : (
              <div className="animate-fadeIn max-w-2xl mx-auto">
                <button onClick={() => setModalView('details')} className="text-sm font-extrabold text-[#2c7fff] hover:underline mb-6 flex items-center gap-1.5 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  Back to Job Details
                </button>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#03045E] mb-2">Submit Application</h2>
                <p className="text-[#03045E] mb-8 font-bold">Applying for <span className="font-extrabold text-[#2c7fff]">{selectedJob.job_title}</span> at {selectedJob.company_name}</p>
                <form onSubmit={submitApplication} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-extrabold text-[#03045E]">Upload Resume / CV <span className="text-red-500">*</span></label>
                    <div className="border-2 border-dashed border-[#03045E]/30 p-6 rounded-[1.5rem] bg-[#f4f4f4] flex flex-col items-center justify-center text-center">
                      <svg className="w-10 h-10 text-[#2c7fff] mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <input type="file" accept=".pdf,.doc,.docx" required onChange={(e) => setResumeFile(e.target.files[0])} className="text-sm text-[#03045E] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#2c7fff]/20 file:text-[#2c7fff] hover:file:bg-[#2c7fff]/30 cursor-pointer"/>
                      <p className="text-xs text-[#03045E]/70 mt-3 font-bold">Supported formats: PDF, DOCX (Max 5MB)</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-extrabold text-[#03045E]">Pitch / Cover Letter <span className="text-[#2c7fff]/60 font-semibold">(Optional)</span></label>
                    <textarea rows="4" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Briefly explain why you are a great fit for this role..." className="p-4 border border-[#03045E]/30 rounded-[1.25rem] bg-white text-[#03045E] focus:border-[#2c7fff] outline-none resize-none font-bold placeholder:text-[#2c7fff]/40"></textarea>
                  </div>
                  <div className="mt-4 pt-6 border-t border-[#03045E]/15">
                    <button type="submit" disabled={applyingTo === selectedJob.id} className="py-4 px-6 bg-[#03045E] text-white font-extrabold text-sm rounded-xl hover:bg-[#2c7fff] transition w-full shadow-sm disabled:bg-[#03045E]/50 cursor-pointer">
                      {applyingTo === selectedJob.id ? 'Uploading & Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            )}

        
            <AbbyChatbot />

          </div>
        </div>
      )}


      {sweetAlert.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#03045E]/60 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#f4f4f4] rounded-[2rem] shadow-2xl border-2 border-[#2c7fff]/40 overflow-hidden transform transition-all animate-in zoom-in duration-200">
            <div className="h-2 w-full bg-gradient-to-r from-[#03045E] via-[#2c7fff] to-[#03045E]" />
            
            <div className="px-8 pt-8 pb-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#2c7fff]/15 flex items-center justify-center mb-5 border border-[#2c7fff]/30">
                <div className="w-14 h-14 rounded-full bg-[#2c7fff] flex items-center justify-center shadow-lg shadow-[#2c7fff]/40">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-black text-[#03045E] tracking-tight mb-2">
                {sweetAlert.title}
              </h2>
              <p className="text-sm font-bold text-[#03045E] mb-8 leading-relaxed">
                {sweetAlert.text}
              </p>

              <button 
                onClick={closeSweetAlert}
                className="w-full py-3.5 bg-[#03045E] text-white font-black rounded-xl hover:bg-[#2c7fff] transition-all shadow-md border-2 border-[#03045E] hover:border-[#2c7fff] cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}


      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#03045E]/60 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="apply-success-title"
        >
          <div className="relative w-full max-w-sm bg-[#f4f4f4] rounded-3xl shadow-2xl border-2 border-[#2c7fff]/30 overflow-hidden animate-fadeIn">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#03045E] via-[#2c7fff] to-[#03045E]" />

            <div className="px-8 pt-8 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-full bg-[#2c7fff]/15 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#2c7fff] flex items-center justify-center shadow-lg shadow-[#2c7fff]/40">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#03045E] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>

              <h2 id="apply-success-title" className="text-2xl font-black text-[#03045E] tracking-tight mb-2">
                Application sent!
              </h2>
              <p className="text-sm text-[#03045E] font-bold leading-relaxed mb-4">
                Your application was submitted successfully.
              </p>

              <div className="flex items-center gap-1.5" aria-label="Closing shortly">
                <span className="w-2 h-2 rounded-full bg-[#2c7fff] animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-[#2c7fff] animate-pulse [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-[#2c7fff] animate-pulse [animation-delay:300ms]" />
              </div>
              <p className="text-xs text-[#2c7fff] font-bold mt-3">
                Closing in a moment…
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}