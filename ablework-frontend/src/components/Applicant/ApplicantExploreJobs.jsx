import React, { useState, useMemo } from 'react';
import AbbyChatbot from '../AbbyChatbot';
import useApplicantTheme from '../../hooks/useApplicantTheme';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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

const getDistanceBadgeStyles = (km, isDarkScreen) => {
  const distance = Number(km);
  if (isNaN(distance)) return { backgroundColor: 'rgba(44,127,255,0.15)', color: '#03045E', borderColor: 'rgba(44,127,255,0.4)' };
  
  if (distance <= 5) {
    if (isDarkScreen) {
      return { backgroundColor: '#ffffff', color: '#10B981', borderColor: '#10B981', filter: 'none' };
    }
    return { backgroundColor: '#ffffff', color: '#10B981', borderColor: '#10B981', filter: 'none' };
  } else if (distance <= 15) {
    return { backgroundColor: 'rgba(44,127,255,0.15)', color: '#03045E', borderColor: 'rgba(44,127,255,0.5)' };
  } else {
    return { backgroundColor: 'rgba(245,158,11,0.15)', color: '#92400E', borderColor: 'rgba(245,158,11,0.5)' };
  }
};

const getMatchColor = (percentage) => {
  if (percentage >= 80) return 'bg-[#2C7FFF]/15 text-[#03045E] border-[#2C7FFF]';
  if (percentage >= 50) return 'bg-[#2C7FFF]/10 text-[#03045E] border-[#03045E]/40';
  return 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20';
};

export default function ApplicantExploreJobs({ profile, jobs, applications = [], refreshData }) {
  const {
    isContrast,
    isDarkMode,
    isDarkScreen,
    isColorVisionPalette,
  } = useApplicantTheme();

  const colorUI = isColorVisionPalette && !isDarkScreen;

  const [applyingTo, setApplyingTo] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const [modalView, setModalView] = useState('details'); 
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sweetAlert, setSweetAlert] = useState({ isOpen: false, title: '', text: '', type: 'notice' });
  
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
        if (!job.distance_km || Number(job.distance_km) > Number(maxDistance)) return false;
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
    });
  }, [jobs, searchQuery, maxDistance, selectedSkills, selectedAccs]);

  const closeSweetAlert = () => {
    setSweetAlert({ ...sweetAlert, isOpen: false });
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
        setSweetAlert({
          isOpen: true,
          type: 'notice',
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
        setSweetAlert({
          isOpen: true,
          type: 'success',
          title: 'Application Sent!',
          text: 'Your application was submitted successfully. The employer will review your profile soon. Good luck!'
        });
        refreshData();
      } else {
        setSweetAlert({
          isOpen: true,
          type: 'notice',
          title: 'Application Notice',
          text: data.message || "Failed to apply."
        });
      }
    } catch (err) {
      setSweetAlert({
        isOpen: true,
        type: 'notice',
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
      setSelectedJob(null);
      setSweetAlert({
        isOpen: true,
        type: 'notice',
        title: 'Application Notice',
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

  const applicantSkills = profile?.skills ? (typeof profile.skills === 'string' ? safeParse(profile.skills) : profile.skills).map(s => s.toLowerCase()) : [];
  const applicantAccoms = profile?.accommodations_needed ? (typeof profile.accommodations_needed === 'string' ? safeParse(profile.accommodations_needed) : profile.accommodations_needed).map(a => a.toLowerCase()) : [];
  const applicantDisabilities = profile?.disability_type ? (typeof profile.disability_type === 'string' ? safeParse(profile.disability_type) : [profile.disability_type]).map(d => d.toLowerCase()) : [];

  return (
    <div className="animate-fadeIn w-full space-y-6 sm:space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0 w-full">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#03045E] break-words">
            Explore Jobs
          </h2>
          <p className="text-[#03045E] mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-base font-bold">
            Your smart-matched marketplace filtered to your profile and accommodations.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
          {filteredJobs.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full bg-[#f4f4f4] border border-[#03045E]/30">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: '#10B981', filter: 'none' }} />
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#03045E]">
                {filteredJobs.length} match{filteredJobs.length !== 1 ? 'es' : ''}
              </span>
            </div>
          )}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3.5 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl font-extrabold text-[11px] sm:text-sm transition-all duration-200 flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-sm border-2 ${
              showFilters
                ? 'bg-black text-white border-white'
                : 'bg-white border-[#03045E] text-[#03045E]'
            }`}
          >
            {showFilters ? (
              <>
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Close Filters
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Filter Matches
              </>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="p-4 sm:p-8 rounded-xl sm:rounded-[2rem] bg-white shadow-md border-2 border-[#03045E]/20 animate-fadeIn flex flex-col gap-4 sm:gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label htmlFor="job-search" className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-widest ${isDarkScreen ? 'text-white' : 'text-[#03045E]'}`}>Search by Title or Company</label>
              <input 
                id="job-search" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Data Entry, TechNova..."
                className={`p-3 sm:p-3.5 border-2 border-[#03045E]/25 rounded-lg sm:rounded-xl bg-white font-bold focus:border-[#2C7FFF] outline-none transition text-xs sm:text-sm text-[#03045E] placeholder:text-gray-400`}
              />
              {searchSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 animate-fadeIn">
                  {searchSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearchQuery(suggestion)}
                      className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-[#f4f4f4] text-[#03045E] text-[10px] sm:text-xs font-extrabold rounded-full border-2 border-[#03045E]/25 hover:border-[#2C7FFF] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label htmlFor="distance-filter" className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-widest ${isDarkScreen ? 'text-white' : 'text-[#03045E]'}`}>Maximum Distance</label>
              <select 
                id="distance-filter" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)}
                className={`p-3 sm:p-3.5 border-2 border-[#03045E]/25 rounded-lg sm:rounded-xl bg-white font-bold focus:border-[#2C7FFF] outline-none cursor-pointer transition text-xs sm:text-sm ${isDarkScreen ? 'text-white' : 'text-[#03045E]'}`}
              >
                <option value="Any">Within Profile Radius</option>
                <option value="5">Within 5 km</option>
                <option value="15">Within 15 km</option>
                <option value="30">Within 30 km</option>
              </select>
            </div>
          </div>

          <hr className="border-[#03045E]/15" />

          <div>
            <span className="text-[10px] sm:text-xs font-extrabold text-[#03045E] uppercase tracking-widest mb-2 sm:mb-3 block">Filter by Skills</span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {availableSkills.map(skill => (
                <button 
                  key={skill} onClick={() => toggleSkill(skill)}
                  className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-extrabold rounded-full border-2 transition-all cursor-pointer inline-flex items-center gap-1 ${
                    selectedSkills.includes(skill)
                      ? `bg-[#2C7FFF] ${isDarkScreen ? '!text-black' : '!text-white'} border-[#2C7FFF]`
                      : 'bg-white text-[#03045E] border-[#03045E]/25 hover:border-[#2C7FFF]'
                  }`}
                >
                  {selectedSkills.includes(skill) && (
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] sm:text-xs font-extrabold text-[#03045E] uppercase tracking-widest mb-2 sm:mb-3 block">Filter by Accommodations</span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {availableAccs.map(acc => (
                <button 
                  key={acc} onClick={() => toggleAcc(acc)}
                  className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-extrabold rounded-full border-2 transition-all cursor-pointer inline-flex items-center gap-1 ${
                    selectedAccs.includes(acc)
                      ? `bg-[#2C7FFF] ${isDarkScreen ? '!text-black' : '!text-white'} border-[#2C7FFF]`
                      : 'bg-white text-[#03045E] border-[#03045E]/25 hover:border-[#2C7FFF]'
                  }`}
                >
                  {selectedAccs.includes(acc) && (
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                  {acc}
                </button>
              ))}
            </div>
          </div>

          {(searchQuery || maxDistance !== 'Any' || selectedSkills.length > 0 || selectedAccs.length > 0) && (
            <div className="flex justify-end pt-1.5 sm:pt-2 border-t border-[#03045E]/15">
              <button
                onClick={() => { setSearchQuery(''); setMaxDistance('Any'); setSelectedSkills([]); setSelectedAccs([]); }}
                className="text-[11px] sm:text-sm font-extrabold text-[#2C7FFF] hover:text-[#03045E] hover:underline cursor-pointer transition"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:gap-8">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => {
            const hasApplied = applications.some(app => app.job_id === job.id);

            return (
              <div
                key={job.id}
                className={`p-4 sm:p-8 rounded-xl sm:rounded-[2rem] bg-white shadow-md border-2 border-[#03045E]/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 ${hasApplied ? 'opacity-85 bg-[#f4f4f4]' : ''}`}
              >
                <div className="flex-1 w-full min-w-0">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    {job.match_percentage && (
                      <span className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-black rounded-full border-2 flex items-center gap-1 sm:gap-1.5 uppercase tracking-wide w-fit ${getMatchColor(job.match_percentage)} ${isDarkScreen ? 'text-black' : ''}`}>
                        <svg className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                          <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                          <circle cx="12" cy="12" r="2" fill="currentColor"/>
                        </svg>
                        {job.match_percentage}% Match
                      </span>
                    )}
                    {job.distance_km && (
                      <span
                        style={getDistanceBadgeStyles(job.distance_km, isDarkScreen)}
                        className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 border-2 text-[10px] sm:text-xs font-black rounded-full flex items-center gap-1 sm:gap-1.5 uppercase tracking-wide w-fit"
                      >
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        {job.distance_km} km away
                      </span>
                    )}
                    {hasApplied && (
                      <span className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-[#f4f4f4] text-[#03045E] border-2 border-[#03045E]/30 text-[10px] sm:text-xs font-black rounded-full uppercase tracking-wide w-fit inline-flex items-center gap-1">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Applied
                      </span>
                    )}
                  </div>
                  <h2 className="text-base sm:text-2xl font-black text-[#03045E] leading-tight break-words w-full">{job.job_title}</h2>
                  <p className="text-xs sm:text-base font-black text-[#2C7FFF] mt-0.5 sm:mt-1 mb-2 sm:mb-3 break-words">{job.company_name}</p>
                  <p className="text-[#03045E] text-xs sm:text-sm font-semibold line-clamp-2 leading-relaxed">{job.job_description}</p>
                </div>

                <div className="shrink-0 w-full md:w-auto flex flex-row gap-2 sm:gap-3">
                  <button 
                    onClick={() => openModal(job)}
                    className="flex-1 md:flex-none px-3 py-2.5 sm:px-6 sm:py-3.5 bg-white border-2 border-[#03045E] text-[#03045E] font-black text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => openApplyModal(job)}
                    disabled={hasApplied}
                    style={!hasApplied ? { color: '#ffffff' } : undefined}
                    className={`flex-1 md:flex-none px-3 py-2.5 sm:px-6 sm:py-3.5 font-black text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer border-2 ${
                      hasApplied 
                        ? 'bg-[#f4f4f4] text-[#03045E]/50 border-[#03045E]/20 cursor-not-allowed' 
                        : `${isDarkScreen ? 'bg-black border-white' : 'bg-[#2C7FFF] border-[#2C7FFF]'}`
                    }`}
                  >
                    {hasApplied ? (
                      <span className="inline-flex items-center gap-1 sm:gap-1.5">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
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
          <div className="p-6 sm:p-12 rounded-xl sm:rounded-[2rem] border-2 border-dashed border-[#03045E]/30 bg-white flex flex-col items-center justify-center text-center min-h-[220px] sm:min-h-[280px]">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#2C7FFF]/15 rounded-full flex items-center justify-center mb-4 sm:mb-5 border-2 border-[#2C7FFF]/30 text-[#2C7FFF]">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 className="text-base sm:text-xl font-black text-[#03045E] mb-2">No jobs match your filters</h3>
            <p className="text-xs sm:text-sm font-bold text-[#03045E]/70 max-w-md mb-4 leading-relaxed">
              Try adjusting your search criteria, or ensure your profile settings reflect your true availability.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setMaxDistance('Any'); setSelectedSkills([]); setSelectedAccs([]); }}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#2C7FFF] text-white font-black text-xs sm:text-sm rounded-lg sm:rounded-xl transition border-2 border-[#2C7FFF] cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {selectedJob && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[0.5px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: isDarkScreen ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.6)', filter: 'none' }}
        >
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border-2 border-[#03045E]/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            
            <button
              onClick={closeModal}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 sm:w-10 sm:h-10 bg-black border-2 border-white text-white rounded-full flex items-center justify-center font-black transition cursor-pointer text-xs sm:text-base"
              aria-label="Close"
            >
              ✕
            </button>

            {modalView === 'details' ? (

              <div className="animate-fadeIn">
                <div className="pr-10 sm:pr-12 mb-4 sm:mb-6 border-b-2 border-[#03045E]/15 pb-4 sm:pb-6">
                  <h2 className="text-lg sm:text-3xl font-black text-[#03045E] break-words">{selectedJob.job_title}</h2>
                  <p className="text-sm sm:text-xl font-black text-[#2C7FFF] mt-0.5 sm:mt-1 break-words">{selectedJob.company_name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
                  <div className="md:col-span-2 flex flex-col gap-5 sm:gap-8">
                    
                    {selectedJob.latitude && selectedJob.longitude && (
                      <div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                          {selectedJob.match_percentage && (
                            <span className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-black rounded-full border-2 flex items-center gap-1 sm:gap-1.5 uppercase tracking-wide w-fit ${getMatchColor(selectedJob.match_percentage)} ${isDarkScreen ? 'text-black' : ''}`}>
                              <svg className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                              </svg>
                              {selectedJob.match_percentage}% Overall Match
                            </span>
                          )}
                          {selectedJob.distance_km && (
                            <span
                              style={getDistanceBadgeStyles(selectedJob.distance_km, isDarkScreen)}
                              className="inline-flex px-2.5 py-1 sm:px-3.5 sm:py-1.5 border-2 text-[10px] sm:text-xs font-black uppercase tracking-wide rounded-full items-center gap-1 sm:gap-1.5 w-fit"
                            >
                              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                              {selectedJob.distance_km} km away
                            </span>
                          )}
                        </div>
                        <h3 className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-2 sm:mb-3">Job Location</h3>
                        
                        <div className="w-full h-40 sm:h-48 rounded-xl sm:rounded-[1.25rem] overflow-hidden border-2 border-[#03045E]/20 shadow-sm relative z-0">
                          <MapContainer 
                            center={[Number(selectedJob.latitude), Number(selectedJob.longitude)]} 
                            zoom={15} 
                            scrollWheelZoom={false} 
                            style={{ height: '100%', width: '100%', zIndex: 1 }}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; OpenStreetMap contributors'
                            />
                            <Marker position={[Number(selectedJob.latitude), Number(selectedJob.longitude)]} />
                          </MapContainer>
                        </div>

                      </div>
                    )}

                    <div>
                      <h3 className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-2 sm:mb-3">Job Description</h3>
                      <p className="text-xs sm:text-base text-[#03045E] font-bold whitespace-pre-wrap leading-relaxed break-words">{selectedJob.job_description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-2 sm:mb-3">Skill Comparison</h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {safeParse(selectedJob.required_skills).map((skill, i) => {
                          const hasSkill = applicantSkills.includes(skill.toLowerCase());
                          return (
                            <span key={i} className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-sm font-black rounded-lg sm:rounded-xl border-2 flex items-center gap-1 sm:gap-1.5 ${hasSkill ? `bg-[#2C7FFF]/15 border-[#2C7FFF] ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}` : 'bg-[#f4f4f4] text-[#03045E]/70 border-[#03045E]/20'}`}>
                              {hasSkill && <svg className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}`} fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                              {!hasSkill && <span className="text-[#03045E]/50 font-extrabold">✕</span>}
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-2 sm:mb-3">Accommodations Comparison</h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {safeParse(selectedJob.provided_accommodations).map((acc, i) => {
                          const hasAcc = applicantAccoms.includes(acc.toLowerCase());
                          return (
                            <span key={i} className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-sm font-black rounded-lg sm:rounded-xl border-2 flex items-center gap-1 sm:gap-1.5 ${hasAcc ? `bg-[#2C7FFF]/15 border-[#2C7FFF] ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}` : 'bg-[#f4f4f4] text-[#03045E]/70 border-[#03045E]/20'}`}>
                              {hasAcc && <svg className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}`} fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                              {!hasAcc && <span className="text-[#03045E]/50 font-extrabold">✕</span>}
                              {acc}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-2 sm:mb-3">Accepted Disabilities Comparison</h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {safeParse(selectedJob.accepted_disabilities).length > 0 ? (
                          safeParse(selectedJob.accepted_disabilities).map((disability, i) => {
                            const isSupported = applicantDisabilities.some(d => d.includes(disability.toLowerCase()));
                            return (
                              <span key={i} className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-sm font-black rounded-lg sm:rounded-xl border-2 flex items-center gap-1 sm:gap-1.5 ${isSupported ? `bg-[#2C7FFF]/15 border-[#2C7FFF] ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}` : 'bg-[#f4f4f4] text-[#03045E]/70 border-[#03045E]/20'}`}>
                                {isSupported && <svg className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}`} fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                                {!isSupported && <span className="text-[#03045E]/50 font-extrabold">✕</span>}
                                {disability}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs sm:text-sm font-bold text-[#03045E]/60 italic">None specified for this posting</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:gap-6 bg-[#f4f4f4] p-4 sm:p-6 rounded-xl sm:rounded-[1.5rem] border-2 border-[#03045E]/20 h-fit">
                    <div>
                      <h3 className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-1">Salary Range</h3>
                      <p className="font-black text-[#03045E] text-sm sm:text-lg">{selectedJob.salary_range || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-1">Benefits</h3>
                      <p className="text-xs sm:text-sm text-[#03045E] font-bold leading-relaxed">
                        {safeParse(selectedJob.benefits).join(' • ') || 'Not specified'}
                      </p>
                    </div>

                    <div className="pt-4 border-t-2 border-[#03045E]/15">
                      <h3 className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-2 sm:mb-3">Contact Info</h3>
                      <div className="flex flex-col gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-[#03045E] font-bold break-all">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          {selectedJob.contact_email || selectedJob.email || 'Not provided'}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-[#03045E] font-bold">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                          {selectedJob.contact_number || selectedJob.phone || 'Not provided'}
                        </div>
                        
                        <div className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-[#03045E] font-bold">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#2C7FFF] mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <span className="leading-tight">
                            {selectedJob.workplace_address || selectedJob.company_address || selectedJob.address || selectedJob.location || 'Address not provided'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 pt-4 sm:pt-6 border-t-2 border-[#03045E]/15">
                      <button 
                        onClick={() => openApplyModal(selectedJob)}
                        disabled={applications.some(app => app.job_id === selectedJob.id)}
                        style={!applications.some(app => app.job_id === selectedJob.id) ? { color: '#ffffff' } : undefined}
                        className={`py-3 sm:py-4 px-4 sm:px-6 font-black text-xs sm:text-sm rounded-lg sm:rounded-xl transition w-full cursor-pointer border-2 ${
                          applications.some(app => app.job_id === selectedJob.id) 
                            ? 'bg-[#f4f4f4] text-[#03045E]/50 border-[#03045E]/20 cursor-not-allowed' 
                            : `${isDarkScreen ? 'bg-black border-white' : 'bg-[#2C7FFF] border-[#2C7FFF]'}`
                        }`}
                      >
                        {applications.some(app => app.job_id === selectedJob.id) ? (
                          <span className="inline-flex items-center justify-center gap-1 sm:gap-1.5">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
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
              <div className="animate-fadeIn max-w-lg mx-auto text-center py-6 sm:py-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#2C7FFF]/15 text-[#2C7FFF] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-2 border-[#2C7FFF]/40">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-[#03045E] mb-2 sm:mb-3">Verification Pending</h2>
                <p className="text-xs sm:text-base text-[#03045E] font-bold mb-6 sm:mb-8 leading-relaxed">
                  Your PWD ID is currently being reviewed by our admin. Once your account is fully verified, this security lock will be removed and you can start applying to jobs!
                </p>
                <button onClick={() => setModalView('details')} className="py-3 sm:py-3.5 px-4 sm:px-6 bg-[#2C7FFF] text-white font-black text-xs sm:text-sm rounded-lg sm:rounded-xl border-2 border-[#2C7FFF] transition cursor-pointer w-full">
                  Back to Job Details
                </button>
              </div>
            ) : (
              <div className="animate-fadeIn w-full">
                <button onClick={() => setModalView('details')} className="text-xs sm:text-sm font-black text-[#2C7FFF] hover:underline mb-4 sm:mb-6 flex items-center gap-1 sm:gap-1.5 cursor-pointer">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  Back to Job Details
                </button>
                <h2 className="text-lg sm:text-3xl font-black text-[#03045E] mb-1 sm:mb-2">Submit Application</h2>
                <p className="text-xs sm:text-base text-[#03045E] mb-6 sm:mb-8 font-bold">Applying for <span className="font-black text-[#2C7FFF]">{selectedJob.job_title}</span> at {selectedJob.company_name}</p>
                <form onSubmit={submitApplication} className="flex flex-col gap-4 sm:gap-6">
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-xs sm:text-sm font-black text-[#03045E]">Upload Resume / CV <span className="text-red-500">*</span></label>
                    <div className="border-2 border-dashed border-[#03045E]/30 p-4 sm:p-6 rounded-xl sm:rounded-[1.5rem] bg-[#f4f4f4] flex flex-col items-center justify-center text-center">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#2C7FFF] mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <input type="file" accept=".pdf,.doc,.docx" required onChange={(e) => setResumeFile(e.target.files[0])} className={`text-[10px] sm:text-sm text-[#03045E] file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2.5 file:px-3 sm:file:px-5 file:rounded-lg sm:file:rounded-[10px] file:border-0 file:text-[10px] sm:file:text-sm file:font-black cursor-pointer !file:bg-[#03045e] !file:text-[#f4f4f4]`} />
                      <p className="text-[10px] sm:text-xs text-[#03045E]/70 mt-2 sm:mt-3 font-bold">Supported formats: PDF, DOCX (Max 5MB)</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-xs sm:text-sm font-black text-[#03045E]">Pitch / Cover Letter <span className="text-[#03045E]/70 font-semibold">(Optional)</span></label>
                    <textarea rows="3" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Briefly explain why you are a great fit for this role..." className="p-3 sm:p-4 border-2 border-[#03045E]/30 rounded-xl sm:rounded-[1.25rem] bg-white text-[#03045E] focus:border-[#2C7FFF] outline-none resize-none font-bold placeholder:text-gray-400 text-xs sm:text-sm"></textarea>
                  </div>
                  <div className="mt-2 sm:mt-4 pt-4 sm:pt-6 border-t-2 border-[#03045E]/15">
                    <button type="submit" disabled={applyingTo === selectedJob.id} className="py-3 sm:py-4 px-4 sm:px-6 bg-[#2C7FFF] !text-white font-black text-xs sm:text-sm rounded-lg sm:rounded-xl transition w-full disabled:bg-[#2C7FFF]/50 border-2 border-[#2C7FFF] cursor-pointer">
                      {applyingTo === selectedJob.id ? 'Uploading & Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {sweetAlert.isOpen && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className="relative w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-[var(--color-card,#ffffff)] border-2 border-[#2C7FFF]">
            <div className="h-2 w-full bg-[#2C7FFF]" />

            <div className="relative px-6 pt-8 pb-6 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-transparent border-4 border-[#2C7FFF]">
                  {sweetAlert.type === 'success' ? (
                    <svg className="w-10 h-10 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#03045E] text-white">{sweetAlert.type === 'success' ? '✓' : '!'}</div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border-2 text-[#2C7FFF] bg-transparent border-[#2C7FFF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                {sweetAlert.type === 'success' ? 'Success' : 'Notice'}
              </span>

              <h2 className="text-xl font-black tracking-tight mb-2 text-[#03045E]">
                {sweetAlert.title}
              </h2>
              <p className="text-xs font-bold leading-relaxed mb-6 max-w-xs text-[#03045E]/80">
                {sweetAlert.text}
              </p>

              <button
                onClick={closeSweetAlert}
                className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer text-[#03045E] bg-transparent border-2 border-[#03045E]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#03045E]/60 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="apply-success-title">
          <div className="relative w-full max-w-sm bg-[var(--color-card,#ffffff)] rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-[#2C7FFF]/30 overflow-hidden animate-fadeIn">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#03045E] via-[#2C7FFF] to-[#03045E]" />
            <div className="px-5 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-8 flex flex-col items-center text-center">
              <div className="relative mb-4 sm:mb-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#2C7FFF] flex items-center justify-center shadow-lg shadow-[#2C7FFF]/40">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#03045E] flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <h2 id="apply-success-title" className="text-lg sm:text-2xl font-black text-[#03045E] tracking-tight mb-1.5 sm:mb-2">Application sent!</h2>
              <p className="text-xs sm:text-sm text-[#03045E] font-bold leading-relaxed mb-3 sm:mb-4">Your application was submitted successfully.</p>
              <div className="flex items-center gap-1 sm:gap-1.5" aria-label="Closing shortly">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:300ms]" />
              </div>
              <p className="text-[10px] sm:text-xs text-[#2C7FFF] font-bold mt-2 sm:mt-3">Closing in a moment…</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}