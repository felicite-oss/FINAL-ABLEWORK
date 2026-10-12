import React, { useState, useContext } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import { useColorPalette } from '../../context/ColorPaletteContext';


const parseToArray = (data) => {
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

export default function EmployerMyJobs({ jobs, refreshData }) {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isDark = isContrast || isDarkMode;
  const isHighContrastOrDarkComfort = paletteKey === 'highContrast' || paletteKey === 'darkComfort';

  const [editingJob, setEditingJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listTab, setListTab] = useState('active');
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentAccommodation, setCurrentAccommodation] = useState('');
  const [currentBenefit, setCurrentBenefit] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ tone: 'default', pill: '', title: '', subtitle: '' });
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiveStage, setArchiveStage] = useState('confirm');

  const pageText = isDark ? 'text-white' : 'text-[#03045E]';
  const muted = isDark ? 'text-white/80' : 'text-[#03045E]/80';
  const subtle = isDark ? 'text-white/60' : 'text-[#03045E]/60';
  const cardBg = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
  const panelBg = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
  const inputBg = isDark
    ? 'bg-black border-white text-white placeholder:text-gray-400 focus:border-white'
    : 'bg-white border-gray-200 text-[#03045E] placeholder:text-gray-400 focus:border-gray-200';
  const divider = isDark ? 'border-white' : 'border-gray-200';
  const modalBg = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
  const chipBoxBg = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
  const disabBoxBg = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
  const tabContainerBg = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
    const tabActive = isHighContrastOrDarkComfort
    ? (isContrast ? 'bg-[#2C7FFF] !text-white' : 'bg-white text-black')
    : (isDark ? 'bg-white text-black' : 'bg-[#2C7FFF] text-white');
  const tabInactive = isDark ? 'text-white hover:bg-white/10' : 'text-[#03045E] hover:bg-gray-100';
  const closedBadge = isDark
    ? 'text-white/60 bg-black border-white/40'
    : 'text-[#03045E]/60 bg-white border-gray-200';
  const emptyState = isDark
    ? 'text-white/70 border-white'
    : 'text-[#03045E]/70 border-gray-200';
  const suggestionBtn = isDark
    ? 'px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-lg border-2 bg-black text-white border-white'
    : 'px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-lg border-2 bg-white text-[#03045E] border-gray-200';
  const chipBoxContainer = isDark
    ? 'flex flex-wrap gap-1.5 sm:gap-2 mt-2 p-2 sm:p-3 rounded-xl border-2 bg-black border-white'
    : 'flex flex-wrap gap-1.5 sm:gap-2 mt-2 p-2 sm:p-3 rounded-xl border-2 bg-white border-gray-200';
  const chipPill = isDark
    ? 'inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full shadow-sm bg-white text-black border-2 border-white'
    : 'inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full shadow-sm bg-white text-[#03045E] border-2 border-gray-200';

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

  const benefitSuggestions = [
    'HMO', '13th Month Pay', 'Internet Allowance', 'Equipment Provided', 'Paid Time Off', 'Performance Bonus'
  ];

  const activeSkillQuery = currentSkill.trim().toLowerCase();
  const filteredSkills = (!editingJob || activeSkillQuery === '') ? [] : skillSuggestions.filter(s => 
    s.toLowerCase().includes(activeSkillQuery) && !editingJob.parsedSkills.some(selected => selected.toLowerCase() === s.toLowerCase())
  );

  const activeAccQuery = currentAccommodation.trim().toLowerCase();
  const filteredAccommodations = (!editingJob || activeAccQuery === '') ? [] : accommodationSuggestions.filter(a => 
    a.toLowerCase().includes(activeAccQuery) && !editingJob.parsedAccoms.some(selected => selected.toLowerCase() === a.toLowerCase())
  );

  const activeBenefitQuery = currentBenefit.trim().toLowerCase();
  const filteredBenefits = (!editingJob || activeBenefitQuery === '') ? [] : benefitSuggestions.filter(b => 
    b.toLowerCase().includes(activeBenefitQuery) && !editingJob.parsedBenefits.some(selected => selected.toLowerCase() === b.toLowerCase())
  );

  const triggerAlert = (tone, pill, title, subtitle) => {
    setAlertConfig({ tone, pill, title, subtitle });
    setShowAlert(true);
  };

  const renderAlertIcon = (tone) => {
    if (tone === 'archive') {
      return (
        <svg className={`w-7 h-7 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      );
    }
    return (
      <svg className="w-7 h-7 text-white" fill="none" stroke="#ffffff" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  const getAlertBadge = (tone) => {
    if (isDark) return 'bg-white';
    if (tone === 'archive') return 'bg-[#03045E]';
    return 'bg-[#2C7FFF]';
  };

  const getAlertRing = (tone) => {
    if (isDark) return 'bg-white/20';
    if (tone === 'archive') return 'bg-[#03045E]/20';
    return 'bg-[#2C7FFF]/20';
  };

  const handleAddChip = (e, field, value, setter) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSuggestion(field, value, setter);
    }
  };

  const addSuggestion = (field, value, setter) => {
    const trimmed = value.trim();
    if (trimmed && !editingJob[field].some(item => item.toLowerCase() === trimmed.toLowerCase())) {
      setEditingJob({ ...editingJob, [field]: [...editingJob[field], trimmed] });
      setter(''); 
    }
  };

  const removeChip = (field, itemToRemove) => {
    setEditingJob({
      ...editingJob,
      [field]: editingJob[field].filter(item => item !== itemToRemove)
    });
  };

  const toggleDisability = (disability) => {
    const isSelected = editingJob.parsedDisabilities.includes(disability);
    setEditingJob({
      ...editingJob,
      parsedDisabilities: isSelected 
        ? editingJob.parsedDisabilities.filter(d => d !== disability)
        : [...editingJob.parsedDisabilities, disability]
    });
  };

  const handleEditJob = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      job_title: editingJob.job_title,
      job_description: editingJob.job_description,
      required_skills: editingJob.parsedSkills,
      provided_accommodations: editingJob.parsedAccoms,
      accepted_disabilities: editingJob.parsedDisabilities,
      salary_range: editingJob.salary_range,
      benefits: editingJob.parsedBenefits
    };

    try {
      const res = await fetch(`http://localhost:5001/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setEditingJob(null);
        refreshData();
        triggerAlert(
          'default',
          'Job Updated',
          'Changes Saved Successfully!',
          `Your job posting "${payload.job_title}" has been updated and is now live for matching.`
        );
      }
    } catch (err) {
      alert("Error updating job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveJob = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    setArchiveTarget(job);
    setArchiveStage('confirm');
    setShowArchiveModal(true);
  };

  const confirmArchiveJob = async () => {
    if (!archiveTarget) return;
    setArchiveStage('processing');

    try {
      const [res] = await Promise.all([
        fetch(`http://localhost:5001/api/jobs/${archiveTarget.id}/archive`, { method: 'PUT' }),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);

      if (res.ok) {
        setArchiveStage('success');
        refreshData();
      } else {
        setArchiveStage('error');
      }
    } catch (err) {
      setArchiveStage('error');
    }
  };

  const closeArchiveModal = () => {
    setShowArchiveModal(false);
    setArchiveTarget(null);
    setArchiveStage('confirm');
  };

  const displayedJobs = jobs.filter(job => 
    listTab === 'active' ? job.status === 'Active' : job.status === 'Archived'
  );

  return (
    <div className={`animate-fadeIn max-w-9xl mx-auto pb-6 sm:pb-10 relative px-1 sm:px-0 ${pageText}`}>
      
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 ${panelBg}`}>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
            <span className={`text-[10px] sm:text-xs font-extrabold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#2C7FFF] border-gray-200'}`}>Job Management</span>
            <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-gray-200'}`}>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary, #2C7FFF)' }}></span> Live Listings
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight ${pageText}`}>My Job Listings</h1>
          <p className={`text-xs sm:text-sm font-semibold mt-0.5 ${muted}`}>Manage active opportunities and review your archived posting history.</p>
        </div>
        <div className={`flex gap-1 sm:gap-2 p-1 rounded-xl border-2 w-full md:w-auto ${tabContainerBg}`}>
          <button 
            onClick={() => setListTab('active')}
            className={`flex-1 md:flex-none px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-[10px] sm:text-sm transition cursor-pointer ${listTab === 'active' ? `${tabActive} shadow` : tabInactive}`}
          >
            Active Jobs
          </button>
          <button 
            onClick={() => setListTab('archived')}
            className={`flex-1 md:flex-none px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-[10px] sm:text-sm transition cursor-pointer ${listTab === 'archived' ? `${tabActive} shadow` : tabInactive}`}
          >
            Archived / History
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        {displayedJobs.length > 0 ? (
          displayedJobs.map(job => (
            <div key={job.id} className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 transition-all ${cardBg}`}>
              <div>
                <h3 className={`text-base sm:text-xl font-bold ${pageText}`}>{job.job_title}</h3>
                <p className={`text-[10px] sm:text-sm mt-1 ${subtle}`}>Posted on {new Date(job.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                {job.status === 'Active' ? (
                  <>
                    <button 
                      onClick={() => {
                        setEditingJob({
                          ...job, 
                          parsedSkills: parseToArray(job.required_skills), 
                          parsedAccoms: parseToArray(job.provided_accommodations),
                          parsedBenefits: parseToArray(job.benefits),
                          parsedDisabilities: parseToArray(job.accepted_disabilities),
                          salary_range: job.salary_range || ''
                        });
                        setCurrentSkill('');
                        setCurrentAccommodation('');
                        setCurrentBenefit('');
                      }} 
                      className={`w-full sm:w-auto px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full border-2 transition cursor-pointer ${isDark ? 'text-white bg-black border-white hover:bg-white hover:text-black' : 'text-[#03045E] bg-white border-gray-200 hover:bg-gray-100'}`}
                    >
                      Edit
                    </button>
                    
                    <button 
                      onClick={() => handleArchiveJob(job.id)} 
                      className="w-full sm:w-auto px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full border-2 cursor-pointer bg-white text-[#ff0000] border-[#ff0000]"
                    >
                      Close & Archive
                    </button>
                  </>
                ) : (
                  <span className={`px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full border-2 text-center ${closedBadge}`}>Closed</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={`p-8 sm:p-10 text-center font-bold border-2 border-dashed rounded-xl sm:rounded-2xl text-sm sm:text-base ${emptyState}`}>
            No {listTab} job postings found.
          </div>
        )}
      </div>

      {editingJob && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`p-5 sm:p-8 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] border-2 ${modalBg}`}>
            <h2 className={`text-xl sm:text-2xl font-extrabold mb-4 sm:mb-6 ${pageText}`}>Edit Job Posting</h2>
            
            <form onSubmit={handleEditJob} className="flex flex-col gap-4 sm:gap-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#03045E]">Job Title</label>
                <input type="text" value={editingJob.job_title} onChange={e => setEditingJob({...editingJob, job_title: e.target.value})} required className={`p-2.5 sm:p-3 border-2 rounded-xl outline-none font-semibold transition-all text-sm sm:text-base ${inputBg}`} />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#03045E]">Description</label>
                <textarea rows="4" value={editingJob.job_description} onChange={e => setEditingJob({...editingJob, job_description: e.target.value})} required className={`p-2.5 sm:p-3 border-2 rounded-xl resize-none outline-none font-semibold transition-all text-sm sm:text-base ${inputBg}`}></textarea>
              </div>
              
              <hr className={`my-1 border-t-2 ${divider}`} />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#03045E]">Required Skills</label>
                <p className={`text-[10px] sm:text-xs font-semibold mb-1 ${subtle}`}>Type and press <strong>Enter</strong> to add.</p>
                <input 
                  type="text" value={currentSkill} 
                  onChange={e => setCurrentSkill(e.target.value)} 
                  onKeyDown={e => handleAddChip(e, 'parsedSkills', currentSkill, setCurrentSkill)} 
                  placeholder="e.g. Python, Communication..."
                  className={`p-2.5 sm:p-3 border-2 rounded-xl outline-none font-semibold transition-all text-sm sm:text-base ${inputBg}`} 
                />
                
                {filteredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                    {filteredSkills.map(suggestion => (
                      <button key={suggestion} type="button" onClick={() => addSuggestion('parsedSkills', suggestion, setCurrentSkill)} className={suggestionBtn}>
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {editingJob.parsedSkills.length > 0 && (
                  <div className={chipBoxContainer}>
                    {editingJob.parsedSkills.map((skill, index) => (
                      <span key={index} className={chipPill}>
                        {skill} <button type="button" onClick={() => removeChip('parsedSkills', skill)} className={`font-bold ml-0.5 cursor-pointer ${isDark ? 'hover:text-red-500' : 'hover:text-red-500'}`}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#03045E]">Guaranteed Accommodations</label>
                <p className={`text-[10px] sm:text-xs font-semibold mb-1 ${subtle}`}>Type and press <strong>Enter</strong> to add.</p>
                <input 
                  type="text" value={currentAccommodation} 
                  onChange={e => setCurrentAccommodation(e.target.value)} 
                  onKeyDown={e => handleAddChip(e, 'parsedAccoms', currentAccommodation, setCurrentAccommodation)} 
                  placeholder="e.g. Wheelchair Access..."
                  className={`p-2.5 sm:p-3 border-2 rounded-xl outline-none font-semibold transition-all text-sm sm:text-base ${inputBg}`} 
                />
                
                {filteredAccommodations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                    {filteredAccommodations.map(suggestion => (
                      <button key={suggestion} type="button" onClick={() => addSuggestion('parsedAccoms', suggestion, setCurrentAccommodation)} className={suggestionBtn}>
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {editingJob.parsedAccoms.length > 0 && (
                  <div className={chipBoxContainer}>
                    {editingJob.parsedAccoms.map((acc, index) => (
                      <span key={index} className={chipPill}>
                        {acc} <button type="button" onClick={() => removeChip('parsedAccoms', acc)} className={`font-bold ml-0.5 cursor-pointer ${isDark ? 'hover:text-red-500' : 'hover:text-red-500'}`}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className={`flex flex-col gap-2 p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 ${disabBoxBg}`}>
                <div>
                  <label className="text-xs sm:text-sm font-extrabold flex items-center gap-1.5 sm:gap-2 uppercase tracking-wider text-[#03045E]">
                    Accepted Disabilities <span style={{ color: 'var(--color-primary, #2C7FFF)' }}>*</span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                  {availableDisabilities.map((disability) => {
                    const isSelected = editingJob.parsedDisabilities.includes(disability);
                    return (
                      <button
                        type="button"
                        key={disability}
                        onClick={() => toggleDisability(disability)}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border-2 transition-colors cursor-pointer shadow-sm`}
                        style={isDark ? {
                          color: isSelected ? '#000000' : '#ffffff',
                          backgroundColor: isSelected ? '#ffffff' : '#000000',
                          borderColor: '#ffffff'
                        } : isHighContrastOrDarkComfort ? {
                          color: isSelected ? '#ffffff' : '#ffffff',
                          backgroundColor: isSelected ? '#2C7FFF' : '#000000',
                          borderColor: isSelected ? '#2C7FFF' : '#ffffff'
                        } : {
                          color: isSelected ? '#ffffff' : 'var(--color-primary, #2C7FFF)',
                          backgroundColor: isSelected ? 'var(--color-primary, #2C7FFF)' : '#ffffff',
                          borderColor: isSelected ? 'var(--color-primary, #2C7FFF)' : 'var(--color-primary, #2C7FFF)'
                        }}
                      >
                        {disability} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className={`my-1 border-t-2 ${divider}`} />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#03045E]">Salary Range</label>
                <input type="text" value={editingJob.salary_range} onChange={e => setEditingJob({...editingJob, salary_range: e.target.value})} className={`p-2.5 sm:p-3 border-2 rounded-xl outline-none font-semibold transition-all text-sm sm:text-base ${inputBg}`} placeholder="e.g. ₱20,000 - ₱30,000 / month" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#03045E]">Benefits</label>
                <p className={`text-[10px] sm:text-xs font-semibold mb-1 ${subtle}`}>Type and press <strong>Enter</strong> to add.</p>
                <input 
                  type="text" value={currentBenefit} 
                  onChange={e => setCurrentBenefit(e.target.value)} 
                  onKeyDown={e => handleAddChip(e, 'parsedBenefits', currentBenefit, setCurrentBenefit)} 
                  className={`p-2.5 sm:p-3 border-2 rounded-xl outline-none font-semibold transition-all text-sm sm:text-base ${inputBg}`} 
                  placeholder="e.g. HMO, 13th Month Pay..." 
                />

                {filteredBenefits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                    {filteredBenefits.map(suggestion => (
                      <button key={suggestion} type="button" onClick={() => addSuggestion('parsedBenefits', suggestion, setCurrentBenefit)} className={suggestionBtn}>
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {editingJob.parsedBenefits.length > 0 && (
                  <div className={chipBoxContainer}>
                    {editingJob.parsedBenefits.map((benefit, index) => (
                      <span key={index} className={chipPill}>
                        {benefit} <button type="button" onClick={() => removeChip('parsedBenefits', benefit)} className={`font-bold ml-0.5 cursor-pointer ${isDark ? 'hover:text-red-500' : 'hover:text-red-500'}`}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 ${divider}`}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl transition cursor-pointer border-2 ${
                    isHighContrastOrDarkComfort
                      ? 'bg-[#2C7FFF] !text-white border-[#2C7FFF] hover:bg-white hover:text-[#2C7FFF]'
                      : (isDark
                        ? 'bg-white text-black border-white hover:bg-black hover:text-white'
                        : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]')
                  }`}
                >
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditingJob(null)} className={`flex-1 py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl border-2 transition cursor-pointer ${isDark ? 'bg-black text-white border-white hover:bg-white hover:text-black' : 'bg-white text-[#03045E] border-gray-200 hover:bg-gray-100'}`}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showArchiveModal && archiveTarget && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative w-full max-w-sm rounded-[2rem] border-2 overflow-hidden ${modalBg}`}>
            <div className={`h-2 w-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} />

            {archiveStage === 'confirm' && (
              <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col items-center text-center">
                <div className="relative mb-4 sm:mb-6">
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/20'}`}>
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${isDark ? 'bg-white' : 'bg-[#03045E]'}`}>
                      <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <span className={`inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-3 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
                  Confirm Archive
                </span>

                <h2 className={`text-xl sm:text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                  Close this job posting?
                </h2>
                <p className={`text-xs sm:text-sm font-bold leading-relaxed mb-4 sm:mb-6 max-w-xs ${muted}`}>
                  "{archiveTarget.job_title}" will be removed from active matches and moved to your archive history.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                  <button
                    onClick={closeArchiveModal}
                    className={`flex-1 py-3 sm:py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider border-2 transition cursor-pointer ${isDark ? 'bg-black text-white border-white hover:bg-white hover:text-black' : 'bg-white text-[#03045E] border-gray-200 hover:bg-gray-100'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmArchiveJob}
                    className={`flex-1 py-3 sm:py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer border-2 ${
                      isHighContrastOrDarkComfort
                        ? 'bg-[#2C7FFF] !text-white border-[#2C7FFF] hover:bg-white hover:text-[#2C7FFF]'
                        : (isDark
                          ? 'bg-white text-black border-white hover:bg-black hover:text-white'
                          : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]')
                    }`}
                  >
                    Archive
                  </button>
                </div>
              </div>
            )}

            {archiveStage === 'processing' && (
              <div className="px-6 sm:px-8 py-8 sm:py-12 flex flex-col items-center text-center">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-4 sm:mb-6">
                  <div className={`absolute inset-0 rounded-full border-4 animate-pulse ${isDark ? 'border-white/25' : 'border-[#2C7FFF]/25'}`} />
                  <div className={`absolute inset-0 rounded-full border-4 border-r-transparent border-l-transparent animate-spin ${isDark ? 'border-t-white border-b-white' : 'border-t-[#2C7FFF] border-b-[#03045E]'}`} />
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-lg animate-ping opacity-70 absolute ${isDark ? 'bg-white' : 'bg-[#03045E]'}`} />
                </div>
                <h2 className={`text-lg sm:text-xl font-black tracking-tight mb-1.5 ${pageText}`}>
                  Archiving Posting
                </h2>
                <p className={`text-[10px] sm:text-xs font-bold ${muted}`}>
                  Removing job from active matches...
                </p>
                <div className="flex items-center gap-1.5 mt-4 sm:mt-5">
                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} />
                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} style={{ animationDelay: '150ms' }} />
                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {archiveStage === 'success' && (
              <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col items-center text-center">
                <div className="relative mb-4 sm:mb-6">
                  <div className={`absolute inset-0 rounded-full animate-ping ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/20'}`} />
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/15'}`}>
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}>
                      <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 ${isDark ? 'bg-white border-black' : 'bg-[#03045E] border-[#F4F4F4]'}`}>
                    <svg className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <span className={`inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-3 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
                  Job Archived
                </span>

                <h2 className={`text-xl sm:text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                  Posting Closed & Archived
                </h2>
                <p className={`text-xs sm:text-sm font-bold leading-relaxed mb-4 sm:mb-6 max-w-xs ${muted}`}>
                  "{archiveTarget.job_title}" has been moved to your history and removed from active matches.
                </p>

                <button
                  onClick={closeArchiveModal}
                  className={`w-full py-3 sm:py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
                >
                  Got it
                </button>
              </div>
            )}

            {archiveStage === 'error' && (
              <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col items-center text-center">
                <div className="relative mb-4 sm:mb-6">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/20'}`}>
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${isDark ? 'bg-white' : 'bg-[#03045E]'}`}>
                      <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>

                <span className={`inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-3 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
                  Action Failed
                </span>

                <h2 className={`text-xl sm:text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                  Something went wrong
                </h2>
                <p className={`text-xs sm:text-sm font-bold leading-relaxed mb-4 sm:mb-6 max-w-xs ${muted}`}>
                  We couldn't archive this posting. Please try again in a moment.
                </p>

                <button
                  onClick={closeArchiveModal}
                  className={`w-full py-3 sm:py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAlert && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative w-full max-w-sm rounded-[2rem] border-2 overflow-hidden ${modalBg}`}>
            <div className={`h-2 w-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} />

            <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col items-center text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className={`absolute inset-0 rounded-full ${getAlertRing(alertConfig.tone)} animate-ping`} />
                <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full ${getAlertRing(alertConfig.tone)} flex items-center justify-center`}>
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full ${getAlertBadge(alertConfig.tone)} flex items-center justify-center`}>
                    {renderAlertIcon(alertConfig.tone)}
                  </div>
                </div>
                <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 ${isDark ? 'bg-white border-black' : 'bg-[#03045E] border-[#F4F4F4]'}`}>
                  <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="#ffffff" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <span className={`inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-3 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
                {alertConfig.pill}
              </span>

              <h2 className={`text-xl sm:text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                {alertConfig.title}
              </h2>
              <p className={`text-xs sm:text-sm font-bold leading-relaxed mb-4 sm:mb-6 max-w-xs ${muted}`}>
                {alertConfig.subtitle}
              </p>

              <button
                onClick={() => setShowAlert(false)}
                className={`w-full py-3 sm:py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer border-2 ${isDark ? 'bg-white border-white hover:bg-black' : 'bg-[#03045E] border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
              >
                <span style={{ color: '#ffffff' }}>Got it</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}