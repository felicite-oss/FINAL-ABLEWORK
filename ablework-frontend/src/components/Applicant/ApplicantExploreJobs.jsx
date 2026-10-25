import React, { useState, useMemo, useEffect, useRef } from 'react';
import AbbyChatbot from '../AbbyChatbot';
import useApplicantTheme from '../../hooks/useApplicantTheme';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
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

export default function ApplicantExploreJobs({ profile, jobs, applications = [], refreshData, initialSelectedJob, clearJobFromMap }) {
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
  const [distanceOpen, setDistanceOpen] = useState(false);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (initialSelectedJob) {
      setSelectedJob(initialSelectedJob);
      setModalView('details');
      
      if (clearJobFromMap) {
        clearJobFromMap(); 
      }
    }
  }, [initialSelectedJob, clearJobFromMap]);

  useEffect(() => {
    if (selectedJob && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [selectedJob]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

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
    <main
      role="main"
      aria-label="Explore Jobs page. Your smart-matched marketplace filtered to your profile and accommodations."
      className="animate-fadeIn w-full space-y-6 sm:space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-10"
    >
      
      <section
        role="region"
        aria-label="Explore Jobs heading section"
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6"
      >
        <div className="min-w-0 w-full">
          <div className="flex flex-col items-start gap-2 w-fit text-left">
            <h1
              tabIndex="0"
              role="heading"
              aria-level="1"
              aria-label="Explore Jobs"
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#03045E] break-words transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
            >
              Explore Jobs
            </h1>
            <p tabIndex="0" aria-label="Your smart-matched marketplace filtered to your profile and accommodations." className="text-[#03045E] mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1">
              Your smart-matched marketplace filtered to your profile and accommodations.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto shrink-0">
          {filteredJobs.length > 0 && (
            <div
              tabIndex="0"
              aria-label={`${filteredJobs.length} matches found.`}
              className="flex items-center gap-1.5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full bg-[#f4f4f4] border-2 border-[#03045E]/30 shrink-0 cursor-pointer hover:border-[#2C7FFF] transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2"
            >
              <span aria-hidden="true" className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#10B981]" />
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#03045E] group-hover:text-[#2C7FFF] transition-all">
                {filteredJobs.length} match{filteredJobs.length !== 1 ? 'es' : ''}
              </span>
            </div>
          )}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="explore-jobs-filters"
            aria-label={showFilters ? 'Close Filters' : 'Filter Matches'}
            className={`px-3.5 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl font-extrabold text-[11px] sm:text-sm transition-all duration-200 flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-sm border-2 shrink-0 ${
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
      </section>

      {showFilters && (
        <section
          id="explore-jobs-filters"
          role="region"
          aria-label="Job filters panel"
          className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white shadow-md border-2 border-[#03045E]/20 animate-fadeIn flex flex-col gap-4 sm:gap-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label htmlFor="job-search" className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-widest ${isDarkScreen ? 'text-white' : 'text-[#03045E]'} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded`} tabIndex="0">Search by Title or Company</label>
              <input 
                id="job-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Data Entry, TechNova..."
                aria-label="Search jobs by title or company. Example: Data Entry, TechNova."
                title="Search jobs by title or company. Example: Data Entry, TechNova."
                className={`p-3 sm:p-3.5 border-2 border-[#03045E]/25 rounded-xl sm:rounded-2xl bg-white font-bold focus:border-[#2C7FFF] outline-none transition text-xs sm:text-sm text-[#03045E] placeholder:text-gray-400`}
              />
              {searchSuggestions.length > 0 && (
                <div role="list" aria-label="Search suggestions" className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 animate-fadeIn">
                  {searchSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      role="listitem"
                      onClick={() => setSearchQuery(suggestion)}
                      aria-label={`Use suggestion ${suggestion}`}
                      className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-[#f4f4f4] text-[#03045E] text-[10px] sm:text-xs font-extrabold rounded-full border-2 border-[#03045E]/25 hover:border-[#2C7FFF] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 sm:gap-1.5 relative">
              <label htmlFor="distance-filter" className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-widest ${isDarkScreen ? 'text-white' : 'text-[#03045E]'} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded`} tabIndex="0">Maximum Distance</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDistanceOpen(!distanceOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={distanceOpen}
                  aria-label="Filter by maximum distance"
                  className={`w-full flex items-center justify-between gap-2 p-3 sm:p-3.5 border-2 border-[#03045E]/25 rounded-xl sm:rounded-2xl bg-white font-bold focus:border-[#2C7FFF] outline-none transition text-xs sm:text-sm text-[#03045E] cursor-pointer`}
                >
                  <span>{maxDistance === 'Any' ? 'Within Profile Radius' : `Within ${maxDistance} km`}</span>
                  <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#03045E] transition-transform duration-200 ${distanceOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {distanceOpen && (
                  <div role="listbox" aria-label="Maximum distance options" className="absolute z-50 mt-2 w-full rounded-xl border-2 border-[#2C7FFF] bg-white shadow-[0_15px_40px_rgba(3,4,94,0.15)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {[
                      { value: 'Any', label: 'Within Profile Radius' },
                      { value: '5', label: 'Within 5 km' },
                      { value: '15', label: 'Within 15 km' },
                      { value: '30', label: 'Within 30 km' }
                    ].map((option) => {
                      const isSelected = maxDistance === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setMaxDistance(option.value);
                            setDistanceOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 p-3 text-left transition-colors cursor-pointer border-b border-[#03045E]/10 last:border-b-0 text-xs sm:text-sm font-bold ${
                            isSelected ? 'bg-[#2C7FFF]/10 text-[#03045E]' : 'bg-white text-[#03045E] hover:bg-[#f4f4f4]'
                          }`}
                        >
                          <span aria-hidden="true" className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-[#2C7FFF] bg-[#2C7FFF]' : 'border-[#03045E]/30 bg-white'
                          }`}>
                            {isSelected && (
                              <svg className="w-2.5 h-2.5" fill="none" stroke={isDarkMode ? '#000000' : '#ffffff'} strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr aria-hidden="true" className="border-[#03045E]/15" />

          <div role="group" aria-label="Filter by skills">
            <span aria-hidden="true" className={`text-[10px] sm:text-xs font-extrabold text-[#03045E] uppercase tracking-widest mb-2 sm:mb-3 block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded`} tabIndex="0">Filter by Skills</span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {availableSkills.map(skill => (
                <button 
                  key={skill} onClick={() => toggleSkill(skill)}
                  aria-label={`Filter by skill ${skill}`}
                  aria-pressed={selectedSkills.includes(skill)}
                  className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-extrabold rounded-lg border-2 transition-all cursor-pointer inline-flex items-center gap-1 ${
                    selectedSkills.includes(skill)
                      ? `bg-[#2C7FFF] ${isDarkScreen ? '!text-black' : '!text-white'} border-[#2C7FFF]`
                      : 'bg-white text-[#03045E] border-[#03045E]/25 hover:border-[#2C7FFF]'
                  }`}
                >
                  {selectedSkills.includes(skill) && (
                    <svg aria-hidden="true" className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div role="group" aria-label="Filter by accommodations">
            <span aria-hidden="true" className={`text-[10px] sm:text-xs font-extrabold text-[#03045E] uppercase tracking-widest mb-2 sm:mb-3 block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded`} tabIndex="0">Filter by Accommodations</span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {availableAccs.map(acc => (
                <button 
                  key={acc} onClick={() => toggleAcc(acc)}
                  aria-label={`Filter by accommodation ${acc}`}
                  aria-pressed={selectedAccs.includes(acc)}
                  className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-extrabold rounded-lg border-2 transition-all cursor-pointer inline-flex items-center gap-1 ${
                    selectedAccs.includes(acc)
                      ? `bg-[#2C7FFF] ${isDarkScreen ? '!text-black' : '!text-white'} border-[#2C7FFF]`
                      : 'bg-white text-[#03045E] border-[#03045E]/25 hover:border-[#2C7FFF]'
                  }`}
                >
                  {selectedAccs.includes(acc) && (
                    <svg aria-hidden="true" className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
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
                aria-label="Clear All Filters"
                className="text-[11px] sm:text-sm font-extrabold text-[#2C7FFF] hover:text-[#03045E] hover:underline cursor-pointer transition"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </section>
      )}

      <section role="region" aria-label="Job listings" className="flex flex-col gap-4 sm:gap-8">
        {filteredJobs.length > 0 ? (
          <div role="list" className="flex flex-col gap-4 sm:gap-8 w-full">
            {filteredJobs.map(job => {
              const hasApplied = applications.some(app => app.job_id === job.id);

              return (
                <div
                  key={job.id}
                  role="listitem"
                  tabIndex={0}
                  className={`p-4 sm:p-8 rounded-xl sm:rounded-2xl bg-white shadow-md border-2 border-[#03045E]/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 ${hasApplied ? 'opacity-85 bg-[#f4f4f4]' : ''}`}
                >
                  <span className="sr-only">
                    Job posting: {job.job_title} at {job.company_name}.
                    {job.match_percentage ? ` Match ${job.match_percentage} percent.` : ''}
                    {job.distance_km ? ` Distance ${job.distance_km} kilometers away.` : ''}
                    {hasApplied ? ' You have applied to this job.' : ''}
                    {job.job_description ? ` Description: ${job.job_description}` : ''}
                  </span>
                  <div aria-hidden="true" className="flex-1 w-full min-w-0">
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
                      aria-label={`View details of ${job.job_title} at ${job.company_name}`}
                      className="flex-1 md:flex-none px-3 py-2.5 sm:px-6 sm:py-3.5 bg-white border-2 border-[#03045E] text-[#03045E] font-black text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => openApplyModal(job)}
                      disabled={hasApplied}
                      aria-label={hasApplied ? `Already applied to ${job.job_title} at ${job.company_name}` : `Apply now to ${job.job_title} at ${job.company_name}`}
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
            })}
          </div>
        ) : (
          <div role="status" aria-label="No jobs match your filters. Try adjusting your search criteria." className="p-6 sm:p-12 rounded-2xl sm:rounded-3xl border-2 border-dashed border-[#03045E]/30 bg-white flex flex-col items-center justify-center text-center min-h-[220px] sm:min-h-[280px]">
            <div aria-hidden="true" className="w-12 h-12 sm:w-16 sm:h-16 bg-[#2C7FFF]/15 rounded-full flex items-center justify-center mb-4 sm:mb-5 border-2 border-[#2C7FFF]/30 text-[#2C7FFF]">
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
              aria-label="Clear all filters"
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#2C7FFF] text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl transition border-2 border-[#2C7FFF] cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {selectedJob && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-modal-title"
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: isDarkScreen ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div
            ref={modalRef}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-[0_25px_60px_rgba(3,4,94,0.25)] border-2 border-[#03045E]/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] focus:outline-none"
          >
            
            <button
              ref={closeButtonRef}
              onClick={closeModal}
              aria-label="Close dialog"
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 sm:w-10 sm:h-10 bg-black border-2 border-white text-white rounded-full flex items-center justify-center font-black transition cursor-pointer text-xs sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2"
            >
              ✕
            </button>

            {modalView === 'details' ? (

              <section aria-label={`Job details for ${selectedJob.job_title} at ${selectedJob.company_name}`} className="animate-fadeIn">
                <div className="pr-10 sm:pr-12 mb-4 sm:mb-6 border-b-2 border-[#03045E]/15 pb-4 sm:pb-6">
                  <div 
                    tabIndex="0" 
                    aria-label={`Job title: ${selectedJob.job_title} at ${selectedJob.company_name}`}
                    className="flex flex-col items-start gap-2 w-fit group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
                  >
                    <h2 id="job-modal-title" className="text-lg sm:text-3xl font-black text-[#03045E] break-words transition-all group-hover:text-[#03045e]">{selectedJob.job_title}</h2>
                    <p className="text-sm sm:text-xl font-black text-[#2C7FFF] mt-0.5 sm:mt-1 break-words transition-all group-hover:text-[#2C7FFF]">{selectedJob.company_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
                  <div className="md:col-span-2 min-w-0 w-full flex flex-col gap-5 sm:gap-8">
                    
                    {selectedJob.latitude && selectedJob.longitude && (
                      <div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                          {selectedJob.match_percentage && (
                            <span tabIndex="0" aria-label={`Match score ${selectedJob.match_percentage} percent`} className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-black rounded-full border-2 flex items-center gap-1 sm:gap-1.5 uppercase tracking-wide w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 ${getMatchColor(selectedJob.match_percentage)} ${isDarkScreen ? 'text-black' : ''}`}>
                              <svg aria-hidden="true" className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                              </svg>
                              {selectedJob.match_percentage}% Overall Match
                            </span>
                          )}
                          {selectedJob.distance_km && (
                            <span
                              tabIndex="0"
                              aria-label={`Distance ${selectedJob.distance_km} kilometers away`}
                              style={getDistanceBadgeStyles(selectedJob.distance_km, isDarkScreen)}
                              className="inline-flex px-2.5 py-1 sm:px-3.5 sm:py-1.5 border-2 text-[10px] sm:text-xs font-black uppercase tracking-wide rounded-full items-center gap-1 sm:gap-1.5 w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2"
                            >
                              <svg aria-hidden="true" className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                              {selectedJob.distance_km} km away
                            </span>
                          )}
                        </div>
                        <h3 className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-2 sm:mb-3">Job Location</h3>
                        
                        <div role="region" aria-label={`Map showing job location for ${selectedJob.job_title}`} className="w-full max-w-full min-w-0 h-40 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#03045E]/20 shadow-sm relative z-0">
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
                            <Marker position={[Number(selectedJob.latitude), Number(selectedJob.longitude)]}>
                              <Popup>
                                <div className="flex flex-col items-center justify-center gap-2 p-1 min-w-[140px]">
                                  <span className="font-extrabold text-[#03045E] text-xs text-center leading-tight">
                                    {selectedJob.company_name}
                                  </span>
                                  <a
                                    href={`https://www.google.com/maps?q=${selectedJob.latitude},${selectedJob.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#2C7FFF] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-[#03045E] transition-colors flex items-center justify-center gap-1.5 no-underline shadow-sm w-full"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    Open in Maps
                                  </a>
                                </div>
                              </Popup>
                            </Marker>
                          </MapContainer>
                        </div>

                      </div>
                    )}

                    <div role="region" aria-label="Job description">
                      <h3 tabIndex="0" aria-label="Job Description" className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-2 sm:mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit">Job Description</h3>
                      <p tabIndex="0" aria-label={`Job Description: ${selectedJob.job_description}`} className="text-xs sm:text-base text-[#03045E] font-bold whitespace-pre-wrap leading-relaxed break-words focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded p-1 -m-1">{selectedJob.job_description}</p>
                    </div>
                    
                    <div role="region" aria-label="Skill comparison">
                      <h3 tabIndex="0" aria-label="Skill Comparison" className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-2 sm:mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit">Skill Comparison</h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full min-w-0">
                        {safeParse(selectedJob.required_skills).map((skill, i) => {
                          const hasSkill = applicantSkills.includes(skill.toLowerCase());
                          return (
                            <span key={i} tabIndex="0" aria-label={`${skill}. ${hasSkill ? 'You have this skill' : 'You do not have this skill'}`} className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-sm font-black rounded-lg sm:rounded-xl border-2 flex items-center gap-1 sm:gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 ${hasSkill ? `bg-[#2C7FFF]/15 border-[#2C7FFF] ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}` : 'bg-[#f4f4f4] text-[#03045E]/70 border-[#03045E]/20'}`}>
                              {hasSkill && <svg aria-hidden="true" className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}`} fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                              {!hasSkill && <span aria-hidden="true" className="text-[#03045E]/50 font-extrabold">✕</span>}
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div role="region" aria-label="Accommodations comparison">
                      <h3 tabIndex="0" aria-label="Accommodations Comparison" className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-2 sm:mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit">Accommodations Comparison</h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {safeParse(selectedJob.provided_accommodations).map((acc, i) => {
                          const hasAcc = applicantAccoms.includes(acc.toLowerCase());
                          return (
                            <span key={i} tabIndex="0" aria-label={`${acc}. ${hasAcc ? 'You need this accommodation' : 'You do not need this accommodation'}`} className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-sm font-black rounded-lg sm:rounded-xl border-2 flex items-center gap-1 sm:gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 ${hasAcc ? `bg-[#2C7FFF]/15 border-[#2C7FFF] ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}` : 'bg-[#f4f4f4] text-[#03045E]/70 border-[#03045E]/20'}`}>
                              {hasAcc && <svg aria-hidden="true" className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}`} fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                              {!hasAcc && <span aria-hidden="true" className="text-[#03045E]/50 font-extrabold">✕</span>}
                              {acc}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div role="region" aria-label="Accepted disabilities comparison">
                      <h3 tabIndex="0" aria-label="Accepted Disabilities Comparison" className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-2 sm:mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit">Accepted Disabilities Comparison</h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {safeParse(selectedJob.accepted_disabilities).length > 0 ? (
                          safeParse(selectedJob.accepted_disabilities).map((disability, i) => {
                            const isSupported = applicantDisabilities.some(d => d.includes(disability.toLowerCase()));
                            return (
                              <span key={i} tabIndex="0" aria-label={`${disability}. ${isSupported ? 'Supported for you' : 'Not supported for you'}`} className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-sm font-black rounded-lg sm:rounded-xl border-2 flex items-center gap-1 sm:gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 ${isSupported ? `bg-[#2C7FFF]/15 border-[#2C7FFF] ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}` : 'bg-[#f4f4f4] text-[#03045E]/70 border-[#03045E]/20'}`}>
                                {isSupported && <svg aria-hidden="true" className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}`} fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                                {!isSupported && <span aria-hidden="true" className="text-[#03045E]/50 font-extrabold">✕</span>}
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

                  <aside role="region" aria-label="Job summary and contact information" className="flex flex-col gap-4 sm:gap-6 bg-[#f4f4f4] p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-[#03045E]/20 h-fit">
                    <div>
                      <h3 tabIndex="0" aria-label="Salary Range" className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit">Salary Range</h3>
                      <p tabIndex="0" aria-label={`Salary Range: ${selectedJob.salary_range || 'Not specified'}`} className="font-black text-[#03045E] text-sm sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded p-1 -m-1">{selectedJob.salary_range || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 tabIndex="0" aria-label="Benefits" className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit">Benefits</h3>
                      <p tabIndex="0" aria-label={`Benefits: ${safeParse(selectedJob.benefits).join(', ') || 'Not specified'}`} className="text-xs sm:text-sm text-[#03045E] font-bold leading-relaxed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded p-1 -m-1">
                        {safeParse(selectedJob.benefits).join(' • ') || 'Not specified'}
                      </p>
                    </div>

                    <div className="pt-4 border-t-2 border-[#03045E]/15">
                      <h3 tabIndex="0" aria-label="Contact Info" className="text-[10px] sm:text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-2 sm:mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit">Contact Info</h3>
                      <div className="flex flex-col gap-2 sm:gap-3">
                        <div tabIndex="0" role="text" aria-label={`Email: ${selectedJob.contact_email || selectedJob.email || 'Not provided'}`} className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-[#03045E] font-bold break-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded p-1 -m-1">
                          <svg aria-hidden="true" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          {selectedJob.contact_email || selectedJob.email || 'Not provided'}
                        </div>
                        <div tabIndex="0" role="text" aria-label={`Phone: ${selectedJob.contact_number || selectedJob.phone || 'Not provided'}`} className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-[#03045E] font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded p-1 -m-1">
                          <svg aria-hidden="true" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                          {selectedJob.contact_number || selectedJob.phone || 'Not provided'}
                        </div>
                        
                        <div tabIndex="0" role="text" aria-label={`Address: ${selectedJob.workplace_address || selectedJob.company_address || selectedJob.address || selectedJob.location || 'Address not provided'}`} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-[#03045E] font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded p-1 -m-1">
                          <svg aria-hidden="true" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#2C7FFF] mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
                        aria-label={applications.some(app => app.job_id === selectedJob.id) ? 'Already applied' : 'Apply now'}
                        style={!applications.some(app => app.job_id === selectedJob.id) ? { color: '#ffffff' } : undefined}
                        className={`py-3 sm:py-4 px-4 sm:px-6 font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl transition w-full cursor-pointer border-2 ${
                          applications.some(app => app.job_id === selectedJob.id) 
                            ? 'bg-[#f4f4f4] text-[#03045E]/50 border-[#03045E]/20 cursor-not-allowed' 
                            : `${isDarkScreen ? 'bg-black border-white' : 'bg-[#2C7FFF] border-[#2C7FFF]'}`
                        }`}
                      >
                        {applications.some(app => app.job_id === selectedJob.id) ? (
                          <span className="inline-flex items-center justify-center gap-1 sm:gap-1.5">
                            <svg aria-hidden="true" className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            Already Applied
                          </span>
                        ) : (
                          'Apply Now'
                        )}
                      </button>
                    </div>
                  </aside>
                </div>
              </section>
            ) : modalView === 'unverified' ? (
              <section role="status" aria-label="Verification Pending. Your PWD ID is currently being reviewed by our admin." className="animate-fadeIn max-w-lg mx-auto text-center py-6 sm:py-8">
                <div aria-hidden="true" className="w-16 h-16 sm:w-20 sm:h-20 bg-[#2C7FFF]/15 text-[#2C7FFF] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-2 border-[#2C7FFF]/40">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-[#03045E] mb-2 sm:mb-3">Verification Pending</h2>
                <p className="text-xs sm:text-base text-[#03045E] font-bold mb-6 sm:mb-8 leading-relaxed">
                  Your PWD ID is currently being reviewed by our admin. Once your account is fully verified, this security lock will be removed and you can start applying to jobs!
                </p>
                <button onClick={() => setModalView('details')} aria-label="Back to Job Details" className="py-3 sm:py-3.5 px-4 sm:px-6 bg-[#2C7FFF] text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl border-2 border-[#2C7FFF] transition cursor-pointer w-full">
                  Back to Job Details
                </button>
              </section>
            ) : (
              <section aria-label="Application form" className="animate-fadeIn w-full">
                <button onClick={() => setModalView('details')} aria-label="Back to Job Details" className="text-xs sm:text-sm font-black text-[#2C7FFF] hover:underline mb-4 sm:mb-6 flex items-center gap-1 sm:gap-1.5 cursor-pointer">
                  <svg aria-hidden="true" className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  Back to Job Details
                </button>
                <h2 className="text-lg sm:text-3xl font-black text-[#03045E] mb-1 sm:mb-2">Submit Application</h2>
                <p className="text-xs sm:text-base text-[#03045E] mb-6 sm:mb-8 font-bold">Applying for <span className="font-black text-[#2C7FFF]">{selectedJob.job_title}</span> at {selectedJob.company_name}</p>
                <form onSubmit={submitApplication} className="flex flex-col gap-4 sm:gap-6">
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label htmlFor="resume-upload" className="text-xs sm:text-sm font-black text-[#03045E]">Upload Resume / CV <span className="text-red-500">*</span></label>
                    <div className="border-2 border-dashed border-gray-300 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white flex flex-col items-center justify-center text-center">
                      <svg aria-hidden="true" className="w-8 h-8 sm:w-10 sm:h-10 text-[#2C7FFF] mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <input id="resume-upload" type="file" accept=".pdf,.doc,.docx" required onChange={(e) => setResumeFile(e.target.files[0])} aria-label="Upload Resume or CV" className={`text-[10px] sm:text-sm text-[#03045E] file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2.5 file:px-3 sm:file:px-5 file:rounded-lg file:text-[10px] sm:file:text-sm file:font-black cursor-pointer !file:bg-white !file:text-[#03045E] file:border-2 file:border-gray-300`} />
                      <p className="text-[10px] sm:text-xs text-[#03045E]/70 mt-2 sm:mt-3 font-bold">Supported formats: PDF, DOCX (Max 5MB)</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label htmlFor="cover-letter" className="text-xs sm:text-sm font-black text-[#03045E]">Pitch / Cover Letter <span className="text-[#03045E]/70 font-semibold">(Optional)</span></label>
                    <textarea id="cover-letter" rows="3" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Briefly explain why you are a great fit for this role..." aria-label="Cover Letter. Briefly explain why you are a great fit for this role." className="p-3 sm:p-4 border-2 border-[#03045E]/30 rounded-xl sm:rounded-2xl bg-white text-[#03045E] focus:border-[#2C7FFF] outline-none resize-none font-bold placeholder:text-gray-400 text-xs sm:text-sm"></textarea>
                  </div>
                  <div className="mt-2 sm:mt-4 pt-4 sm:pt-6 border-t-2 border-[#03045E]/15">
                    <button type="submit" disabled={applyingTo === selectedJob.id} aria-label={applyingTo === selectedJob.id ? 'Uploading and Submitting' : 'Submit Application'} className="py-3 sm:py-4 px-4 sm:px-6 bg-[#2C7FFF] !text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl transition w-full disabled:bg-[#2C7FFF]/50 border-2 border-[#2C7FFF] cursor-pointer">
                      {applyingTo === selectedJob.id ? 'Uploading & Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </section>
            )}

          </div>
        </div>
      )}

      {sweetAlert.isOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="sweet-alert-title"
          aria-describedby="sweet-alert-text"
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isDarkScreen) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className="relative w-full max-w-md rounded-xl sm:rounded-2xl shadow-[0_25px_60px_rgba(3,4,94,0.25)] overflow-hidden animate-in zoom-in-95 duration-300 bg-[var(--color-card,#ffffff)] border-2 border-[#2C7FFF]">
            <div aria-hidden="true" className="h-2 w-full bg-[#2C7FFF]" />

            <div className="relative px-6 pt-8 pb-6 flex flex-col items-center text-center">
              <div aria-hidden="true" className="relative mb-5">
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

              <span aria-hidden="true" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border-2 text-[#2C7FFF] bg-transparent border-[#2C7FFF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                {sweetAlert.type === 'success' ? 'Success' : 'Notice'}
              </span>

              <h2 id="sweet-alert-title" className="text-xl font-black tracking-tight mb-2 text-[#03045E]">
                {sweetAlert.title}
              </h2>
              <p id="sweet-alert-text" className="text-xs font-bold leading-relaxed mb-6 max-w-xs text-[#03045E]/80">
                {sweetAlert.text}
              </p>

              <button
                onClick={closeSweetAlert}
                aria-label="Got It. Close alert."
                className="w-full py-3 rounded-lg sm:rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer text-[#03045E] bg-transparent border-2 border-[#03045E]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div role="alertdialog" aria-modal="true" aria-labelledby="apply-success-title" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#03045E]/60 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[var(--color-card,#ffffff)] rounded-xl sm:rounded-2xl shadow-2xl border-2 border-[#2C7FFF]/30 overflow-hidden animate-fadeIn">
            <div aria-hidden="true" className="h-1.5 w-full bg-gradient-to-r from-[#03045E] via-[#2C7FFF] to-[#03045E]" />
            <div className="px-5 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-8 flex flex-col items-center text-center">
              <div aria-hidden="true" className="relative mb-4 sm:mb-5">
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
                <span aria-hidden="true" className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                <span aria-hidden="true" className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:150ms]" />
                <span aria-hidden="true" className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:300ms]" />
              </div>
              <p className="text-[10px] sm:text-xs text-[#2C7FFF] font-bold mt-2 sm:mt-3">Closing in a moment…</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}