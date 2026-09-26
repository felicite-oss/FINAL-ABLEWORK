import React, { useState, useContext } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';


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
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isDark = isContrast || isDarkMode;

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
  const cardBg = isDark ? 'bg-black border-white' : 'bg-[#F4F4F4] border-[#03045E]';
  const panelBg = isDark ? 'bg-black border-white' : 'bg-[#F4F4F4] border-[#03045E]';
  const inputBg = isDark
    ? 'bg-black border-white text-white placeholder-white/40 focus:border-white'
    : 'bg-white border-[#03045E] text-[#03045E] placeholder-[#03045E]/40 focus:border-[#2C7FFF]';
  const divider = isDark ? 'border-white' : 'border-[#03045E]';
  const modalBg = isDark ? 'bg-black border-white' : 'bg-[#F4F4F4] border-[#03045E]';
  const chipBoxBg = isDark ? 'bg-black border-white' : 'bg-white border-[#03045E]';
  const disabBoxBg = isDark ? 'bg-black border-white' : 'bg-white border-[#03045E]';
  const disabBtnActive = isDark ? 'bg-white text-black border-white' : 'bg-[#2C7FFF] text-white border-[#2C7FFF]';
  const tabContainerBg = isDark ? 'bg-black border-white' : 'bg-white border-[#03045E]';
  const tabActive = isDark ? 'bg-white text-black' : 'bg-[#2C7FFF] text-white';
  const tabInactive = isDark ? 'text-white hover:bg-white/10' : 'text-[#03045E] hover:bg-[#2C7FFF]/10';
  const closedBadge = isDark
    ? 'text-white/60 bg-black border-white/40'
    : 'text-[#03045E]/60 bg-[#F4F4F4] border-[#03045E]/30';
  const emptyState = isDark
    ? 'text-white/70 border-white'
    : 'text-[#03045E]/70 border-[#03045E]';

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
      <svg className={`w-7 h-7 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
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

  const editBtnStyle = isDark ? {
    color: '#000000',
    backgroundColor: '#ffffff',
    borderColor: '#ffffff'
  } : {
    color: 'var(--color-text, #03045E)',
    backgroundColor: 'var(--color-card, #ffffff)',
    borderColor: 'var(--color-primary, #2C7FFF)'
  };

  const archiveBtnStyle = isDark ? {
    color: '#000000',
    backgroundColor: '#ffffff',
    borderColor: '#ffffff'
  } : {
    color: 'var(--color-button-text, #ffffff)',
    backgroundColor: 'var(--color-primary, #03045E)',
    borderColor: 'var(--color-primary, #03045E)'
  };

  const recommendationBtnStyle = isDark ? {
    color: '#ffffff',
    backgroundColor: '#000000',
    borderColor: '#ffffff'
  } : {
    color: 'var(--color-text, #03045E)',
    backgroundColor: 'var(--color-card, #ffffff)',
    borderColor: 'var(--color-primary, #2C7FFF)'
  };

  return (
    <div className={`animate-fadeIn max-w-7xl mx-auto pb-10 relative ${pageText}`}>
      
      <div className={`relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 p-6 sm:p-8 rounded-3xl border-2 ${panelBg}`}>
        <div className={`absolute top-0 left-0 w-1.5 h-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></div>
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${isDark ? 'bg-white/10' : 'bg-[#2C7FFF]/10'}`}></div>
        <div className={`absolute -bottom-20 right-20 w-40 h-40 rounded-full ${isDark ? 'bg-white/5' : 'bg-[#03045E]/5'}`}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>Job Management</span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#03045E]'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></span>
              Live Listings
            </span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${pageText}`}>My Job Listings</h1>
          <p className={`text-sm font-bold mt-2 max-w-xl ${muted}`}>Manage active opportunities and review your archived posting history.</p>
        </div>

        <div className={`relative z-10 flex gap-2 p-1.5 rounded-2xl border-2 ${tabContainerBg}`}>
          <button 
            onClick={() => setListTab('active')}
            className={`px-5 py-2.5 rounded-xl font-black text-sm transition cursor-pointer border-2 ${listTab === 'active' ? `${tabActive} ${isDark ? 'border-white' : 'border-[#2C7FFF]'}` : `${tabInactive} border-transparent`}`}
          >
            Active
          </button>
          <button 
            onClick={() => setListTab('archived')}
            className={`px-5 py-2.5 rounded-xl font-black text-sm transition cursor-pointer border-2 ${listTab === 'archived' ? `${tabActive} ${isDark ? 'border-white' : 'border-[#2C7FFF]'}` : `${tabInactive} border-transparent`}`}
          >
            Archived
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {displayedJobs.length > 0 ? (
          displayedJobs.map((job, idx) => (
            <div key={job.id} className={`relative overflow-hidden p-6 rounded-3xl border-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${cardBg} ${isDark ? 'hover:border-white' : 'hover:border-[#2C7FFF]'}`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></div>

              <div className="flex items-start gap-4 pl-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 border-2 ${isDark ? 'bg-white text-black border-white' : 'bg-[#03045E] text-white border-[#03045E]'}`}>
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={`text-xl font-black ${pageText}`}>{job.job_title}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border-2 ${job.status === 'Active' ? (isDark ? 'bg-white text-black border-white' : 'bg-[#2C7FFF] text-white border-[#2C7FFF]') : closedBadge}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className={`text-xs font-bold mt-1 ${subtle}`}>Posted on {new Date(job.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
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
                      className="px-5 py-2.5 text-sm font-black rounded-xl border-2 transition cursor-pointer hover:opacity-90"
                      style={editBtnStyle}
                    >
                      Edit
                    </button>
                    
                    <button 
                      onClick={() => handleArchiveJob(job.id)} 
                      className="px-5 py-2.5 text-sm font-black rounded-xl border-2 transition cursor-pointer hover:opacity-90"
                      style={archiveBtnStyle}
                    >
                      Archive
                    </button>
                  </>
                ) : (
                  <span className={`px-5 py-2.5 text-sm font-black rounded-xl border-2 ${closedBadge}`}>Archived</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={`p-12 text-center font-black border-2 border-dashed rounded-3xl ${emptyState}`}>
            <div className="flex flex-col items-center gap-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/20 text-white' : 'bg-[#2C7FFF]/15 text-[#2C7FFF]'}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span>No {listTab} job postings found.</span>
            </div>
          </div>
        )}
      </div>

      {editingJob && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] border-2 ${modalBg}`}>
            <div className={`absolute top-0 left-0 w-1.5 h-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></div>

            <div className={`flex items-center gap-3 mb-6 pb-5 border-b-2 pl-3 ${divider}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`}>Edit Mode</p>
                <h2 className={`text-2xl font-black tracking-tight ${pageText}`}>Edit Job Posting</h2>
              </div>
            </div>
            
            <form onSubmit={handleEditJob} className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>Job Title</label>
                <input type="text" value={editingJob.job_title} onChange={e => setEditingJob({...editingJob, job_title: e.target.value})} required className={`p-3.5 border-2 rounded-xl outline-none font-semibold transition-all ${inputBg}`} />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>Description</label>
                <textarea rows="4" value={editingJob.job_description} onChange={e => setEditingJob({...editingJob, job_description: e.target.value})} required className={`p-3.5 border-2 rounded-xl resize-none outline-none font-semibold transition-all ${inputBg}`}></textarea>
              </div>
              
              <div className={`h-0.5 ${divider}`}></div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>Required Skills</label>
                <input 
                  type="text" value={currentSkill} 
                  onChange={e => setCurrentSkill(e.target.value)} 
                  onKeyDown={e => handleAddChip(e, 'parsedSkills', currentSkill, setCurrentSkill)} 
                  placeholder="Type and press Enter to add"
                  className={`p-3.5 border-2 rounded-xl outline-none font-semibold transition-all ${inputBg}`} 
                />
                
                {filteredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {filteredSkills.map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addSuggestion('parsedSkills', suggestion, setCurrentSkill)}
                        className="px-3 py-1.5 text-xs font-black rounded-lg border-2 transition cursor-pointer hover:opacity-90"
                        style={recommendationBtnStyle}
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {editingJob.parsedSkills.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mt-2 p-3 rounded-xl border-2 ${chipBoxBg}`}>
                    {editingJob.parsedSkills.map((skill, index) => (
                      <span key={index} className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full ${isDark ? 'bg-white text-black' : 'bg-[#2C7FFF] text-white'}`}>
                        {skill} <button type="button" onClick={() => removeChip('parsedSkills', skill)} className={`font-black ml-0.5 cursor-pointer ${isDark ? 'hover:text-black/60' : 'hover:text-[#03045E]'}`}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>Guaranteed Accommodations</label>
                <input 
                  type="text" value={currentAccommodation} 
                  onChange={e => setCurrentAccommodation(e.target.value)} 
                  onKeyDown={e => handleAddChip(e, 'parsedAccoms', currentAccommodation, setCurrentAccommodation)} 
                  placeholder="Type and press Enter to add"
                  className={`p-3.5 border-2 rounded-xl outline-none font-semibold transition-all ${inputBg}`} 
                />
                
                {filteredAccommodations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {filteredAccommodations.map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addSuggestion('parsedAccoms', suggestion, setCurrentAccommodation)}
                        className="px-3 py-1.5 text-xs font-black rounded-lg border-2 transition cursor-pointer hover:opacity-90"
                        style={recommendationBtnStyle}
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {editingJob.parsedAccoms.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mt-2 p-3 rounded-xl border-2 ${chipBoxBg}`}>
                    {editingJob.parsedAccoms.map((acc, index) => (
                      <span key={index} className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full ${isDark ? 'bg-white text-black' : 'bg-[#2C7FFF] text-white'}`}>
                        {acc} <button type="button" onClick={() => removeChip('parsedAccoms', acc)} className={`font-black ml-0.5 cursor-pointer ${isDark ? 'hover:text-black/60' : 'hover:text-[#03045E]'}`}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className={`flex flex-col gap-2 p-5 rounded-2xl border-2 ${disabBoxBg}`}>
                <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>
                  Accepted Disabilities <span className={isDark ? 'text-white' : 'text-[#2C7FFF]'}>*</span>
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableDisabilities.map((disability) => {
                    const isSelected = editingJob.parsedDisabilities.includes(disability);
                    return (
                      <button
                        type="button"
                        key={disability}
                        onClick={() => toggleDisability(disability)}
                        className={`px-3 py-2 rounded-xl text-xs font-black border-2 transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? (isDark ? 'bg-white border-white shadow-md' : 'bg-[var(--color-primary,#2C7FFF)] border-[var(--color-primary,#2C7FFF)] shadow-md')
                            : (isDark ? 'bg-black border-white hover:bg-white hover:text-black' : 'bg-[var(--color-card,#ffffff)] border-[var(--color-primary,#2C7FFF)] hover:bg-[var(--color-primary,#2C7FFF)]')
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

              <div className={`h-0.5 ${divider}`}></div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>Salary Range</label>
                <input type="text" value={editingJob.salary_range} onChange={e => setEditingJob({...editingJob, salary_range: e.target.value})} className={`p-3.5 border-2 rounded-xl outline-none font-semibold transition-all ${inputBg}`} placeholder="e.g. ₱20,000 - ₱30,000 / month" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>Benefits</label>
                <input 
                  type="text" value={currentBenefit} 
                  onChange={e => setCurrentBenefit(e.target.value)} 
                  onKeyDown={e => handleAddChip(e, 'parsedBenefits', currentBenefit, setCurrentBenefit)} 
                  className={`p-3.5 border-2 rounded-xl outline-none font-semibold transition-all ${inputBg}`} 
                  placeholder="e.g. HMO, 13th Month Pay" 
                />

                {filteredBenefits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {filteredBenefits.map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addSuggestion('parsedBenefits', suggestion, setCurrentBenefit)}
                        className="px-3 py-1.5 text-xs font-black rounded-lg border-2 transition cursor-pointer hover:opacity-90"
                        style={recommendationBtnStyle}
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {editingJob.parsedBenefits.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mt-2 p-3 rounded-xl border-2 ${chipBoxBg}`}>
                    {editingJob.parsedBenefits.map((benefit, index) => (
                      <span key={index} className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full ${isDark ? 'bg-white text-black' : 'bg-[#2C7FFF] text-white'}`}>
                        {benefit} <button type="button" onClick={() => removeChip('parsedBenefits', benefit)} className={`font-black ml-0.5 cursor-pointer ${isDark ? 'hover:text-black/60' : 'hover:text-[#03045E]'}`}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className={`flex gap-3 mt-4 pt-5 border-t-2 ${divider}`}>
                <button type="submit" disabled={isSubmitting} className={`flex-1 py-3.5 font-black rounded-xl transition cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}>
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditingJob(null)} className={`flex-1 py-3.5 font-black rounded-xl border-2 transition cursor-pointer ${isDark ? 'bg-black text-white border-white hover:bg-white hover:text-black' : 'bg-white text-[#03045E] border-[#03045E] hover:bg-[#F4F4F4]'}`}>
                  Cancel
                </button>
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
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className={`relative w-20 h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/20'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDark ? 'bg-white' : 'bg-[#03045E]'}`}>
                      <svg className={`w-7 h-7 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
                  Confirm Archive
                </span>

                <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                  Close this job posting?
                </h2>
                <p className={`text-sm font-bold leading-relaxed mb-6 max-w-xs ${muted}`}>
                  "{archiveTarget.job_title}" will be removed from active matches and moved to your archive history.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={closeArchiveModal}
                    className={`flex-1 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider border-2 transition cursor-pointer ${isDark ? 'bg-black text-white border-white hover:bg-white hover:text-black' : 'bg-white text-[#03045E] border-[#03045E] hover:bg-[#F4F4F4]'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmArchiveJob}
                    className={`flex-1 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
                  >
                    Archive
                  </button>
                </div>
              </div>
            )}

            {archiveStage === 'processing' && (
              <div className="px-8 py-12 flex flex-col items-center text-center">
                <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                  <div className={`absolute inset-0 rounded-full border-4 animate-pulse ${isDark ? 'border-white/25' : 'border-[#2C7FFF]/25'}`} />
                  <div className={`absolute inset-0 rounded-full border-4 border-r-transparent border-l-transparent animate-spin ${isDark ? 'border-t-white border-b-white' : 'border-t-[#2C7FFF] border-b-[#03045E]'}`} />
                  <div className={`w-8 h-8 rounded-full shadow-lg animate-ping opacity-70 absolute ${isDark ? 'bg-white' : 'bg-[#03045E]'}`} />
                </div>
                <h2 className={`text-xl font-black tracking-tight mb-1.5 ${pageText}`}>
                  Archiving Posting
                </h2>
                <p className={`text-xs font-bold ${muted}`}>
                  Removing job from active matches...
                </p>
                <div className="flex items-center gap-1.5 mt-5">
                  <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} />
                  <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} style={{ animationDelay: '150ms' }} />
                  <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {archiveStage === 'success' && (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className={`absolute inset-0 rounded-full animate-ping ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/20'}`} />
                  <div className={`relative w-20 h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/15'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}>
                      <svg className={`w-8 h-8 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 ${isDark ? 'bg-white border-black' : 'bg-[#03045E] border-[#F4F4F4]'}`}>
                    <svg className={`w-3.5 h-3.5 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
                  Job Archived
                </span>

                <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                  Posting Closed & Archived
                </h2>
                <p className={`text-sm font-bold leading-relaxed mb-6 max-w-xs ${muted}`}>
                  "{archiveTarget.job_title}" has been moved to your history and removed from active matches.
                </p>

                <button
                  onClick={closeArchiveModal}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
                >
                  Got it
                </button>
              </div>
            )}

            {archiveStage === 'error' && (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/20'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDark ? 'bg-white' : 'bg-[#03045E]'}`}>
                      <svg className={`w-8 h-8 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>

                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
                  Action Failed
                </span>

                <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                  Something went wrong
                </h2>
                <p className={`text-sm font-bold leading-relaxed mb-6 max-w-xs ${muted}`}>
                  We couldn't archive this posting. Please try again in a moment.
                </p>

                <button
                  onClick={closeArchiveModal}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
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

            <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className={`absolute inset-0 rounded-full ${getAlertRing(alertConfig.tone)} animate-ping`} />
                <div className={`relative w-20 h-20 rounded-full ${getAlertRing(alertConfig.tone)} flex items-center justify-center`}>
                  <div className={`w-14 h-14 rounded-full ${getAlertBadge(alertConfig.tone)} flex items-center justify-center`}>
                    {renderAlertIcon(alertConfig.tone)}
                  </div>
                </div>
                <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 ${isDark ? 'bg-white border-black' : 'bg-[#03045E] border-[#F4F4F4]'}`}>
                  <svg className={`w-3.5 h-3.5 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
                {alertConfig.pill}
              </span>

              <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                {alertConfig.title}
              </h2>
              <p className={`text-sm font-bold leading-relaxed mb-6 max-w-xs ${muted}`}>
                {alertConfig.subtitle}
              </p>

              <button
                onClick={() => setShowAlert(false)}
                className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}