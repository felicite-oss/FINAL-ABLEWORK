import React, { useState, useContext } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';

export default function EmployerPostJob({ profile, refreshData, setActiveTab }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isDark = isContrast || isDarkMode;

  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState(''); 
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  const [currentAccommodation, setCurrentAccommodation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [currentBenefit, setCurrentBenefit] = useState('');
  const [selectedDisabilities, setSelectedDisabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' }); 
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [publishedJobTitle, setPublishedJobTitle] = useState('');

  const availableDisabilities = [
    'Deafness', 'Blindness', 'Low Vision', 'Hard of Hearing', 'Color Blindness', 
    'Paralysis', 'Amputation', 'Cerebral Palsy', 'Limited Fine Motor Skills', 'Wheelchair User'
  ];

  const skillSuggestions = [
    'Customer Service', 'Data Entry', 'Communication', 'Time Management', 'Microsoft Office', 
    'Teamwork', 'Virtual Assistance', 'Problem Solving', 'Writing', 'Graphic Design', 
    'Project Management', 'Copywriting', 'Python', 'React', 'Node.js', 'UI/UX Design'
  ];

  const accommodationSuggestions = [
    'Wheelchair Access', 'Screen Reader', 'Sign Language Interpreter', 'Flexible Hours', 
    'Quiet Workspace', 'Ergonomic Setup', 'Step-Free Access', 'Noise-Cancelling Headphones',
    'Captioning Services', 'Remote Work'
  ];

  const toggleSelection = (item, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(item)) {
      setSelectedArray(selectedArray.filter(i => i !== item));
    } else {
      setSelectedArray([...selectedArray, item]);
    }
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(currentSkill);
    }
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const activeSkillQuery = currentSkill.trim().toLowerCase();
  const filteredSkills = activeSkillQuery === '' ? [] : skillSuggestions.filter(s => 
    s.toLowerCase().includes(activeSkillQuery) && !selectedSkills.some(selected => selected.toLowerCase() === s.toLowerCase())
  );

  const handleAccommodationKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAccommodation(currentAccommodation);
    }
  };

  const addAccommodation = (acc) => {
    const trimmed = acc.trim();
    if (trimmed && !selectedAccommodations.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedAccommodations([...selectedAccommodations, trimmed]);
      setCurrentAccommodation('');
    }
  };

  const removeAccommodation = (accToRemove) => {
    setSelectedAccommodations(selectedAccommodations.filter(acc => acc !== accToRemove));
  };

  const activeAccQuery = currentAccommodation.trim().toLowerCase();
  const filteredAccommodations = activeAccQuery === '' ? [] : accommodationSuggestions.filter(a => 
    a.toLowerCase().includes(activeAccQuery) && !selectedAccommodations.some(selected => selected.toLowerCase() === a.toLowerCase())
  );

  const handleBenefitKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBenefit(currentBenefit);
    }
  };

  const addBenefit = (benefit) => {
    const trimmed = benefit.trim();
    if (trimmed && !selectedBenefits.some(b => b.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedBenefits([...selectedBenefits, trimmed]);
      setCurrentBenefit('');
    }
  };

  const removeBenefit = (benefitToRemove) => {
    setSelectedBenefits(selectedBenefits.filter(b => b !== benefitToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (selectedDisabilities.length === 0) {
      return setStatusMessage({ type: 'error', text: 'Please select at least one accepted disability.' });
    }
    
    if (selectedSkills.length === 0) {
      return setStatusMessage({ type: 'error', text: 'Please add at least one required skill.' });
    }

    setIsLoading(true);

    const payload = {
      employer_id: profile.user_id,
      company_name: profile.company_name,
      job_title: jobTitle,
      job_description: jobDescription,
      required_skills: selectedSkills,
      provided_accommodations: selectedAccommodations, 
      accepted_disabilities: selectedDisabilities, 
      salary_range: salaryRange,
      benefits: selectedBenefits,
      latitude: profile.latitude,
      longitude: profile.longitude,
      status: 'Active'
    };

    try {
      const response = await fetch('http://localhost:5001/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setPublishedJobTitle(jobTitle);
        setStatusMessage({ type: 'success', text: 'Job posted successfully! Redirecting to dashboard...' });
        setJobTitle('');
        setJobDescription('');
        setSelectedSkills([]);
        setCurrentSkill('');
        setSelectedAccommodations([]);
        setCurrentAccommodation('');
        setSelectedDisabilities([]);
        setSalaryRange('');
        setSelectedBenefits([]);
        setCurrentBenefit('');
        
        setShowSuccessAlert(true);
        await refreshData();
        setTimeout(() => {
          setShowSuccessAlert(false);
          setActiveTab('overview');
        }, 3500);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to post job.' });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Server Error:", error);
      setStatusMessage({ type: 'error', text: 'Cannot connect to the server.' });
      setIsLoading(false);
    }
  };

  const pageText = isDark ? 'text-white' : 'text-[#03045E]';
  const muted = isDark ? 'text-white/70' : 'text-[#03045E]/70';
  const subtle = isDark ? 'text-white/50' : 'text-[#03045E]/50';
  const cardBg = isDark ? 'bg-black border-white' : 'bg-[#F4F4F4] border-[#03045E]';
  const formBg = isDark ? 'bg-black border-white' : 'bg-white border-[#03045E]';
  const sectionBg = isDark ? 'bg-black border-white/40' : 'bg-[#F4F4F4] border-[#03045E]/30';
  const pillBg = isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#03045E]';
  const inputCls = isDark
    ? 'w-full p-4 border-2 border-white rounded-2xl bg-black text-white placeholder-white/40 font-semibold focus:outline-none focus:border-white transition-all'
    : 'w-full p-4 border-2 border-[#03045E] rounded-2xl bg-[#F4F4F4] text-[#03045E] placeholder-[#03045E]/40 font-semibold focus:outline-none focus:border-[#2C7FFF] focus:bg-white transition-all';
  const inputSmallCls = isDark
    ? 'w-full p-3 border-2 border-white rounded-xl bg-black text-white placeholder-white/40 font-semibold focus:outline-none focus:border-white transition-all'
    : 'w-full p-3 border-2 border-[#03045E] rounded-xl bg-[#F4F4F4] text-[#03045E] placeholder-[#03045E]/40 font-semibold focus:outline-none focus:border-[#2C7FFF] focus:bg-white transition-all';
  const chipContainer = isDark ? 'bg-black border-white' : 'bg-white border-[#03045E]';
  const divider = isDark ? 'border-white' : 'border-[#03045E]';
  const disabBox = isDark ? 'bg-black border-white' : 'bg-white border-[#2C7FFF]';

  const recommendationBtnStyle = isDark ? {
    color: '#ffffff',
    backgroundColor: '#000000',
    borderColor: '#ffffff'
  } : {
    color: 'var(--color-text, #03045E)',
    backgroundColor: 'var(--color-card, #ffffff)',
    borderColor: 'var(--color-primary, #2C7FFF)'
  };

  const SectionHeader = ({ num, title, subtitle, icon }) => (
    <div className="flex items-start gap-4 mb-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 ${isDark ? 'bg-white text-black border-white' : 'bg-[#03045E] text-white border-[#03045E]'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`}>Section {num}</span>
          <div className={`h-px flex-1 max-w-[40px] ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></div>
        </div>
        <h3 className={`text-lg sm:text-xl font-black tracking-tight ${pageText}`}>{title}</h3>
        {subtitle && <p className={`text-xs font-semibold mt-0.5 ${muted}`}>{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-10">

      <div className={`relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-6 sm:p-8 rounded-3xl border-2 ${cardBg}`}>
        <div className={`absolute top-0 left-0 w-1.5 h-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></div>
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${isDark ? 'bg-white/10' : 'bg-[#2C7FFF]/10'}`}></div>
        <div className={`absolute -bottom-20 right-20 w-40 h-40 rounded-full ${isDark ? 'bg-white/5' : 'bg-[#03045E]/5'}`}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>Job Management</span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 border-2 ${pillBg}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></span>
              Smart Engine
            </span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${pageText}`}>Create a Job Posting</h1>
          <p className={`text-sm font-bold mt-2 max-w-xl ${muted}`}>Publish targeted opportunities with guaranteed accommodations for <span className={isDark ? 'text-white' : 'text-[#2C7FFF]'}>{profile.company_name}</span>.</p>
        </div>
      </div>

      {statusMessage.text && (
        <div className={`relative overflow-hidden p-5 mb-6 rounded-2xl font-black text-center border-2 ${statusMessage.type === 'success' ? (isDark ? 'bg-white text-black border-white' : 'bg-[#2C7FFF] text-white border-[#2C7FFF]') : (isDark ? 'bg-black text-white border-white' : 'bg-[#03045E] text-white border-[#03045E]')}`}>
          <div className="flex items-center justify-center gap-2">
            {statusMessage.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`relative p-6 sm:p-10 rounded-[2rem] border-2 flex flex-col gap-8 ${formBg}`}>
        <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-[2rem] ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></div>

        <div className={`flex flex-col gap-6 p-6 rounded-2xl border-2 ${sectionBg}`}>
          <SectionHeader 
            num="01" 
            title="Basic Information" 
            subtitle="Give your job posting a clear, focused identity."
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />

          <div className="flex flex-col gap-2">
            <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>
              Job Title <span className={isDark ? 'text-white' : 'text-[#2C7FFF]'}>*</span>
            </label>
            <input 
              type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required
              placeholder="e.g. Remote Data Specialist"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>
              Full Job Description <span className={isDark ? 'text-white' : 'text-[#2C7FFF]'}>*</span>
            </label>
            <textarea 
              value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} required rows="5"
              placeholder="Describe the role responsibilities and expectations..."
              className={`${inputCls} resize-none`}
            ></textarea>
          </div>
        </div>

        <div className={`flex flex-col gap-6 p-6 rounded-2xl border-2 ${sectionBg}`}>
          <SectionHeader 
            num="02" 
            title="Compensation & Perks" 
            subtitle="Specify salary expectations and added value."
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>Salary Range</label>
              <input
                type="text" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. ₱20,000 - ₱30,000 / month"
                className={inputSmallCls}
              />
              <p className={`text-[10px] font-bold ${subtle}`}>Leave blank if undisclosed.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>Benefits</label>
              <input
                type="text" value={currentBenefit} onChange={(e) => setCurrentBenefit(e.target.value)} onKeyDown={handleBenefitKeyDown}
                placeholder="Type + press Enter (e.g. HMO)"
                className={inputSmallCls}
              />
              {selectedBenefits.length > 0 && (
                <div className={`flex flex-wrap gap-2 mt-1 p-3 rounded-xl border-2 ${chipContainer}`}>
                  {selectedBenefits.map(benefit => (
                    <span key={benefit} className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full ${isDark ? 'bg-white text-black' : 'bg-[#2C7FFF] text-white'}`}>
                      {benefit} <button type="button" onClick={() => removeBenefit(benefit)} className={`font-black ml-0.5 cursor-pointer ${isDark ? 'hover:text-black/60' : 'hover:text-[#03045E]'}`}>✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`flex flex-col gap-6 p-6 rounded-2xl border-2 ${sectionBg}`}>
          <SectionHeader 
            num="03" 
            title="Skills & Accommodations" 
            subtitle="Match with candidates who have the right skills and support needs."
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>
                Required Skills <span className={isDark ? 'text-white' : 'text-[#2C7FFF]'}>*</span>
              </label>
              <input
                type="text" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onKeyDown={handleSkillKeyDown}
                placeholder="Type + press Enter (e.g. Python)"
                className={inputSmallCls}
              />
              {filteredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {filteredSkills.map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addSkill(suggestion)}
                      className="px-3 py-1.5 text-xs font-black rounded-lg border-2 transition cursor-pointer hover:opacity-90"
                      style={recommendationBtnStyle}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              )}
              {selectedSkills.length > 0 && (
                <div className={`flex flex-wrap gap-2 mt-1 p-3 rounded-xl border-2 ${chipContainer}`}>
                  {selectedSkills.map(skill => (
                    <span key={skill} className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full ${isDark ? 'bg-white text-black' : 'bg-[#2C7FFF] text-white'}`}>
                      {skill} <button type="button" onClick={() => removeSkill(skill)} className={`font-black ml-0.5 cursor-pointer ${isDark ? 'hover:text-black/60' : 'hover:text-[#03045E]'}`}>✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>
                Guaranteed Accommodations
              </label>
              <input
                type="text" value={currentAccommodation} onChange={(e) => setCurrentAccommodation(e.target.value)} onKeyDown={handleAccommodationKeyDown}
                placeholder="Type + press Enter (e.g. Remote Work)"
                className={inputSmallCls}
              />
              {filteredAccommodations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {filteredAccommodations.map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addAccommodation(suggestion)}
                      className="px-3 py-1.5 text-xs font-black rounded-lg border-2 transition cursor-pointer hover:opacity-90"
                      style={recommendationBtnStyle}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              )}
              {selectedAccommodations.length > 0 && (
                <div className={`flex flex-wrap gap-2 mt-1 p-3 rounded-xl border-2 ${chipContainer}`}>
                  {selectedAccommodations.map(acc => (
                    <span key={acc} className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full ${isDark ? 'bg-white text-black' : 'bg-[#2C7FFF] text-white'}`}>
                      {acc} <button type="button" onClick={() => removeAccommodation(acc)} className={`font-black ml-0.5 cursor-pointer ${isDark ? 'hover:text-black/60' : 'hover:text-[#03045E]'}`}>✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`flex flex-col gap-5 p-6 rounded-2xl border-2 ${disabBox}`}>
          <SectionHeader 
            num="04" 
            title="Accepted Disabilities" 
            subtitle="Select the conditions this workplace is fully equipped and prepared to support."
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />

          <div className="flex flex-wrap gap-2.5 mt-1">
            {availableDisabilities.map((disability) => {
              const isSelected = selectedDisabilities.includes(disability);
              return (
                <button
                  type="button"
                  key={disability}
                  onClick={() => toggleSelection(disability, selectedDisabilities, setSelectedDisabilities)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-black border-2 transition cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? (isDark ? 'bg-white border-white' : 'bg-[var(--color-primary,#2C7FFF)] border-[var(--color-primary,#2C7FFF)] shadow-md')
                      : (isDark ? 'bg-black border-white hover:bg-white hover:text-black' : 'bg-[var(--color-card,#ffffff)] border-[var(--color-primary,#2C7FFF)] text-[var(--color-text,#03045E)] hover:bg-[var(--color-primary,#2C7FFF)] hover:text-[var(--color-button-text,#ffffff)]')
                  }`}
                  style={isDark ? {
                    color: isSelected ? '#000000' : '#ffffff',
                    backgroundColor: isSelected ? '#ffffff' : '#000000',
                    borderColor: '#ffffff'
                  } : {
                    color: isSelected ? 'var(--color-button-text, #ffffff)' : 'var(--color-text, #03045E)',
                    backgroundColor: isSelected ? 'var(--color-primary, #2C7FFF)' : 'var(--color-card, #ffffff)',
                    borderColor: 'var(--color-primary, #2C7FFF)'
                  }}
                >
                  <span className="font-black">{disability}</span>
                  <span className="font-black">{isSelected ? '✓' : '+'}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`flex flex-col sm:flex-row gap-3 pt-2`}>
          <button
            type="button" onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 font-black text-base rounded-2xl border-2 transition cursor-pointer ${isDark ? 'bg-black text-white border-white hover:bg-white hover:text-black' : 'bg-white text-[#03045E] border-[#03045E] hover:bg-[#F4F4F4]'}`}
          >
            Cancel
          </button>

          <button
            type="submit" disabled={isLoading}
            className={`flex-[2] py-4 font-black text-base rounded-2xl border-2 transition disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
          >
            {isLoading ? 'Publishing Job...' : 'Publish Job Posting'}
            {!isLoading && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {showSuccessAlert && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[0.5px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.6)', filter: 'none' }}
        >
          <div
            className="relative w-full max-w-md rounded-[2rem] shadow-[0_25px_60px_rgba(3,4,94,0.35)] border-2 overflow-hidden transform animate-in zoom-in-95 duration-300"
            style={{
              backgroundColor: (isContrast || isDarkMode) ? '#000000' : 'var(--color-card, #ffffff)',
              borderColor: (isContrast || isDarkMode) ? '#ffffff' : 'var(--color-border, rgba(3,4,94,0.2))'
            }}
          >
            <div
              className="h-1.5 w-full"
              style={{ backgroundColor: (isContrast || isDarkMode) ? '#ffffff' : 'var(--color-primary, #2c7fff)' }}
            ></div>

            <div className={`absolute top-0 right-0 w-40 h-40 rounded-full ${isDark ? 'bg-white/15' : 'bg-[#2C7FFF]/10'} -mr-16 -mt-16 pointer-events-none`}></div>
            <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full ${isDark ? 'bg-white/10' : 'bg-[#03045E]/5'} -ml-12 -mb-12 pointer-events-none`}></div>

            <div className="relative px-8 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className={`absolute inset-0 rounded-full ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/15'} animate-ping`} />
                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 border-2 border-white' : 'bg-[#2C7FFF]/10 border-2 border-[#2C7FFF]'}`}>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: isDark ? '#ffffff' : 'var(--color-primary, #2C7FFF)' }}
                  >
                    <svg className="w-9 h-9" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div
                  className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2"
                  style={{
                    backgroundColor: (isContrast || isDarkMode) ? '#000000' : 'var(--color-card, #ffffff)',
                    borderColor: isDark ? '#ffffff' : 'var(--color-primary, #2C7FFF)'
                  }}
                >
                  <svg className="w-4 h-4" style={{ color: isDark ? '#ffffff' : 'var(--color-primary, #2C7FFF)' }} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-3 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></span>
                Job Posted
              </span>

              <h2
                className="text-2xl sm:text-3xl font-black tracking-tight mb-2"
                style={{ color: (isContrast || isDarkMode) ? '#ffffff' : 'var(--color-text, #03045E)' }}
              >
                Posting is Live!
              </h2>

              <p
                className="text-sm font-semibold leading-relaxed mb-6 max-w-xs"
                style={{ color: (isContrast || isDarkMode) ? 'rgba(255,255,255,0.9)' : 'var(--color-text, #03045E)', opacity: (isContrast || isDarkMode) ? 1 : 0.75 }}
              >
                <span className="font-black" style={{ color: isDark ? '#ffffff' : 'var(--color-primary, #2C7FFF)' }}>"{publishedJobTitle}"</span> has been published successfully and is now visible to matching candidates.
              </p>

              <div
                className={`w-full rounded-2xl p-4 border-2 mb-6 ${isDark ? 'bg-black border-white' : 'bg-[#F4F4F4] border-[#2C7FFF]'}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>Status</span>
                  <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: isDark ? '#ffffff' : 'var(--color-primary, #2C7FFF)' }}>Active</span>
                </div>
                <div className={`h-px my-3 ${isDark ? 'bg-white/40' : 'bg-[#03045E]/15'}`}></div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>Posted</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#03045E]'}`}>
                    {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-4">
                <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} />
                <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} style={{ animationDelay: '150ms' }} />
                <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} style={{ animationDelay: '300ms' }} />
              </div>

              <p className={`text-xs font-bold ${isDark ? 'text-white/50' : 'text-[#03045E]/50'}`}>
                Redirecting you to dashboard...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}