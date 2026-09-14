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

  const pageText = isContrast ? 'text-[#f4f4f4]' : 'text-[#03045E]';
  const muted = isContrast ? 'text-[#f4f4f4]/80' : 'text-[#03045E]/80';
  const subtle = isContrast ? 'text-[#f4f4f4]/60' : 'text-[#03045E]/60';
  const cardBg = isContrast ? 'bg-black border-[#2C7FFF]/40' : 'bg-[#f4f4f4] border-[#03045E]/10';
  const panelBg = isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-[#f4f4f4]/90 border-[#03045E]/20';
  const inputBg = isContrast
    ? 'bg-black border-[#2C7FFF]/50 text-[#f4f4f4] placeholder-[#f4f4f4]/40 focus:border-[#2C7FFF] focus:bg-black'
    : 'bg-[#f4f4f4] border-[#03045E]/20 text-[#03045E] focus:border-[#2C7FFF] focus:bg-[#f4f4f4]';
  const divider = isContrast ? 'border-[#2C7FFF]/40' : 'border-[#03045E]/10';
  const modalBg = isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-[#f4f4f4] border-[#2C7FFF]';


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
        <svg className="w-7 h-7 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      );
    }
    return (
      <svg className="w-7 h-7 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  const getAlertBadge = (tone) => {
    if (tone === 'archive') return 'bg-[#03045E]';
    return 'bg-[#2C7FFF]';
  };

  const getAlertRing = (tone) => {
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
    <div className={`animate-fadeIn max-w-7xl mx-auto pb-10 relative ${pageText}`}>
      
  
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 backdrop-blur-md p-6 rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.06)] border ${panelBg}`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#2C7FFF]/15 text-[#2C7FFF] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-[#2C7FFF]/30">Job Management</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border ${isContrast ? 'bg-black text-[#f4f4f4] border-[#2C7FFF]/40' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20'}`}>
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span> Live Listings
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${pageText}`}>My Job Listings</h1>
          <p className={`text-sm font-semibold mt-0.5 ${muted}`}>Manage active opportunities and review your archived posting history.</p>
        </div>
        <div className={`flex gap-2 p-1 rounded-xl border ${isContrast ? 'bg-black border-[#2C7FFF]/40' : 'bg-[#f4f4f4] border-[#03045E]/20'}`}>
            <button 
                onClick={() => setListTab('active')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition cursor-pointer ${listTab === 'active' ? 'bg-[#2C7FFF] text-[#f4f4f4] shadow' : isContrast ? 'text-[#f4f4f4]/70 hover:bg-[#2C7FFF]/20' : 'text-[#03045E]/70 hover:bg-[#2C7FFF]/10'}`}
            >
                Active Jobs
            </button>
            <button 
                onClick={() => setListTab('archived')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition cursor-pointer ${listTab === 'archived' ? 'bg-[#2C7FFF] text-[#f4f4f4] shadow' : isContrast ? 'text-[#f4f4f4]/70 hover:bg-[#2C7FFF]/20' : 'text-[#03045E]/70 hover:bg-[#2C7FFF]/10'}`}
            >
                Archived / History
            </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {displayedJobs.length > 0 ? (
          displayedJobs.map(job => (
            <div key={job.id} className={`p-6 rounded-2xl shadow-md border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${cardBg}`}>
              <div>
                <h3 className={`text-xl font-bold ${pageText}`}>{job.job_title}</h3>
                <p className={`text-sm mt-1 ${subtle}`}>Posted on {new Date(job.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="flex gap-3">
                {job.status === 'Active' ? (
                    <>
                        <button onClick={() => {
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
                        }} className={`px-5 py-2 text-sm font-bold rounded-full border transition cursor-pointer ${isContrast ? 'text-[#f4f4f4] bg-black border-[#2C7FFF]/40 hover:bg-[#2C7FFF]/20 hover:border-[#2C7FFF]' : 'text-[#03045E] bg-[#f4f4f4] border-[#03045E]/20 hover:bg-[#2C7FFF]/20 hover:border-[#2C7FFF]'}`}>Edit</button>
                        
                        <button onClick={() => handleArchiveJob(job.id)} className={`px-5 py-2 text-sm font-bold rounded-full border transition cursor-pointer ${isContrast ? 'text-[#f4f4f4] bg-black border-[#2C7FFF] hover:bg-[#2C7FFF] hover:text-[#f4f4f4]' : 'text-[#2C7FFF] bg-[#f4f4f4] border-[#2C7FFF]/30 hover:bg-[#2C7FFF] hover:text-[#f4f4f4]'}`}>Close & Archive</button>
                    </>
                ) : (
                    <span className={`px-5 py-2 text-sm font-bold rounded-full border ${isContrast ? 'text-[#f4f4f4]/60 bg-black border-[#2C7FFF]/40' : 'text-[#03045E]/60 bg-[#f4f4f4] border-[#03045E]/20'}`}>Closed</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={`p-10 text-center font-bold border-2 border-dashed rounded-2xl ${isContrast ? 'text-[#f4f4f4]/70 border-[#2C7FFF]/40 bg-black' : 'text-[#03045E]/70 border-[#03045E]/20'}`}>
            No {listTab} job postings found.
          </div>
        )}
      </div>


      {editingJob && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${isContrast ? 'bg-black/70' : 'bg-[#03045E]/60'}`}>
          <div className={`p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] border-2 ${modalBg}`}>
            <h2 className={`text-2xl font-extrabold mb-6 ${pageText}`}>Edit Job Posting</h2>
            
            <form onSubmit={handleEditJob} className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-bold ${pageText}`}>Job Title</label>
                <input type="text" value={editingJob.job_title} onChange={e => setEditingJob({...editingJob, job_title: e.target.value})} required className={`p-3 border rounded-xl outline-none font-semibold transition-all ${inputBg}`} />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-bold ${pageText}`}>Description</label>
                <textarea rows="4" value={editingJob.job_description} onChange={e => setEditingJob({...editingJob, job_description: e.target.value})} required className={`p-3 border rounded-xl resize-none outline-none font-semibold transition-all ${inputBg}`}></textarea>
              </div>
              
              <hr className={`my-1 ${divider}`} />

            
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-bold ${pageText}`}>Required Skills</label>
                <p className={`text-xs font-semibold mb-1 ${subtle}`}>Type and press <strong>Enter</strong> to add.</p>
                <input 
                  type="text" value={currentSkill} 
                  onChange={e => setCurrentSkill(e.target.value)} 
                  onKeyDown={e => handleAddChip(e, 'parsedSkills', currentSkill, setCurrentSkill)} 
                  placeholder="e.g. Python, Communication..."
                  className={`p-3 border rounded-xl outline-none font-semibold transition-all ${inputBg}`} 
                />
                
            
                {filteredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {filteredSkills.map(suggestion => (
                      <button key={suggestion} type="button" onClick={() => addSuggestion('parsedSkills', suggestion, setCurrentSkill)} className="px-3 py-1 bg-[#2C7FFF]/10 text-[#2C7FFF] text-xs font-bold rounded-lg border border-[#2C7FFF]/30 hover:bg-[#2C7FFF] hover:text-[#f4f4f4] transition-colors cursor-pointer">
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                )}

         
                {editingJob.parsedSkills.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mt-2 p-3 rounded-xl border ${isContrast ? 'bg-black border-[#2C7FFF]/40' : 'bg-[#f4f4f4] border-[#03045E]/20'}`}>
                    {editingJob.parsedSkills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#03045E] text-[#f4f4f4] text-xs font-bold rounded-full shadow-sm">
                        {skill} <button type="button" onClick={() => removeChip('parsedSkills', skill)} className="hover:text-[#2C7FFF] font-bold ml-0.5 cursor-pointer">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
        
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-bold ${pageText}`}>Guaranteed Accommodations</label>
                <p className={`text-xs font-semibold mb-1 ${subtle}`}>Type and press <strong>Enter</strong> to add.</p>
                <input 
                  type="text" value={currentAccommodation} 
                  onChange={e => setCurrentAccommodation(e.target.value)} 
                  onKeyDown={e => handleAddChip(e, 'parsedAccoms', currentAccommodation, setCurrentAccommodation)} 
                  placeholder="e.g. Wheelchair Access..."
                  className={`p-3 border rounded-xl outline-none font-semibold transition-all ${inputBg}`} 
                />
                
              
                {filteredAccommodations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {filteredAccommodations.map(suggestion => (
                      <button key={suggestion} type="button" onClick={() => addSuggestion('parsedAccoms', suggestion, setCurrentAccommodation)} className="px-3 py-1 bg-[#2C7FFF]/10 text-[#2C7FFF] text-xs font-bold rounded-lg border border-[#2C7FFF]/30 hover:bg-[#2C7FFF] hover:text-[#f4f4f4] transition-colors cursor-pointer">
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                )}

       
                {editingJob.parsedAccoms.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mt-2 p-3 rounded-xl border ${isContrast ? 'bg-black border-[#2C7FFF]/40' : 'bg-[#f4f4f4] border-[#03045E]/20'}`}>
                    {editingJob.parsedAccoms.map((acc, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#03045E] text-[#f4f4f4] text-xs font-bold rounded-full shadow-sm">
                        {acc} <button type="button" onClick={() => removeChip('parsedAccoms', acc)} className="hover:text-[#2C7FFF] font-bold ml-0.5 cursor-pointer">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 p-5 rounded-2xl bg-[#2C7FFF]/5 border border-[#2C7FFF]/20 mt-2">
                <div>
                  <label className={`text-sm font-extrabold flex items-center gap-2 uppercase tracking-wider ${pageText}`}>
                    Accepted Disabilities <span className="text-[#2C7FFF]">*</span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableDisabilities.map((disability) => (
                    <button
                      type="button" key={disability}
                      onClick={() => toggleDisability(disability)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shadow-sm ${
                        editingJob.parsedDisabilities.includes(disability)
                          ? 'bg-[#2C7FFF] text-[#f4f4f4] border-[#2C7FFF]'
                          : isContrast ? 'bg-black text-[#f4f4f4] border-[#2C7FFF]/40 hover:border-[#2C7FFF]' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20 hover:border-[#2C7FFF]'
                      }`}
                    >
                      {disability} {editingJob.parsedDisabilities.includes(disability) ? '✓' : '+'}
                    </button>
                  ))}
                </div>
              </div>

              <hr className={`my-1 ${divider}`} />

              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-bold ${pageText}`}>Salary Range</label>
                <input type="text" value={editingJob.salary_range} onChange={e => setEditingJob({...editingJob, salary_range: e.target.value})} className={`p-3 border rounded-xl outline-none font-semibold transition-all ${inputBg}`} placeholder="e.g. ₱20,000 - ₱30,000 / month" />
              </div>
              
     
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-bold ${pageText}`}>Benefits</label>
                <p className={`text-xs font-semibold mb-1 ${subtle}`}>Type and press <strong>Enter</strong> to add.</p>
                <input 
                  type="text" value={currentBenefit} 
                  onChange={e => setCurrentBenefit(e.target.value)} 
                  onKeyDown={e => handleAddChip(e, 'parsedBenefits', currentBenefit, setCurrentBenefit)} 
                  className={`p-3 border rounded-xl outline-none font-semibold transition-all ${inputBg}`} 
                  placeholder="e.g. HMO, 13th Month Pay..." 
                />

          
                {filteredBenefits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {filteredBenefits.map(suggestion => (
                      <button key={suggestion} type="button" onClick={() => addSuggestion('parsedBenefits', suggestion, setCurrentBenefit)} className="px-3 py-1 bg-[#2C7FFF]/10 text-[#2C7FFF] text-xs font-bold rounded-lg border border-[#2C7FFF]/30 hover:bg-[#2C7FFF] hover:text-[#f4f4f4] transition-colors cursor-pointer">
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                )}

     
                {editingJob.parsedBenefits.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mt-2 p-3 rounded-xl border ${isContrast ? 'bg-black border-[#2C7FFF]/40' : 'bg-[#f4f4f4] border-[#03045E]/20'}`}>
                    {editingJob.parsedBenefits.map((benefit, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#03045E] text-[#f4f4f4] text-xs font-bold rounded-full shadow-sm">
                        {benefit} <button type="button" onClick={() => removeChip('parsedBenefits', benefit)} className="hover:text-[#2C7FFF] font-bold ml-0.5 cursor-pointer">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className={`flex gap-4 mt-6 pt-6 border-t ${divider}`}>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 bg-[#2C7FFF] text-[#f4f4f4] font-extrabold rounded-xl hover:bg-[#03045E] shadow-md transition-all cursor-pointer">Save Changes</button>
                <button type="button" onClick={() => setEditingJob(null)} className={`flex-1 py-3.5 font-extrabold rounded-xl border transition-all cursor-pointer ${isContrast ? 'bg-black text-[#f4f4f4] border-[#2C7FFF]/40 hover:bg-[#2C7FFF] hover:text-[#f4f4f4]' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20 hover:bg-[#03045E] hover:text-[#f4f4f4]'}`}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showArchiveModal && archiveTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#03045E]/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[2rem] shadow-[0_25px_60px_rgba(3,4,94,0.4)] border-2 overflow-hidden animate-in zoom-in-95 duration-300 ${modalBg}`}>
            <div className="h-2 w-full bg-[#2C7FFF]" />

            {archiveStage === 'confirm' && (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="relative w-20 h-20 rounded-full bg-[#03045E]/20 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#03045E] flex items-center justify-center shadow-[0_10px_30px_rgba(3,4,94,0.5)]">
                      <svg className="w-7 h-7 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-[#2C7FFF]/15 text-[#2C7FFF] text-[10px] font-black uppercase tracking-widest mb-3">
                  Confirm Archive
                </span>

                <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                  Close this job posting?
                </h2>
                <p className={`text-sm font-semibold leading-relaxed mb-6 max-w-xs ${muted}`}>
                  "{archiveTarget.job_title}" will be removed from active matches and moved to your archive history.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={closeArchiveModal}
                    className={`flex-1 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider border-2 transition-all cursor-pointer ${isContrast ? 'bg-black text-[#f4f4f4] border-[#2C7FFF]/40 hover:bg-[#2C7FFF] hover:text-[#f4f4f4]' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20 hover:bg-[#03045E] hover:text-[#f4f4f4]'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmArchiveJob}
                    className="flex-1 py-3.5 rounded-2xl bg-[#2C7FFF] text-[#f4f4f4] font-black text-sm uppercase tracking-wider shadow-md hover:bg-[#03045E] transition-all duration-300 cursor-pointer border-2 border-[#2C7FFF] hover:border-[#03045E]"
                  >
                    Archive
                  </button>
                </div>
              </div>
            )}

            {archiveStage === 'processing' && (
              <div className="px-8 py-12 flex flex-col items-center text-center">
                <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-[#2C7FFF]/25 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#2C7FFF] border-r-transparent border-b-[#03045E] border-l-transparent animate-spin" />
                  <div className="w-8 h-8 rounded-full bg-[#03045E] shadow-lg animate-ping opacity-70 absolute" />
                </div>
                <h2 className={`text-xl font-black tracking-tight mb-1.5 ${pageText}`}>
                  Archiving Posting
                </h2>
                <p className={`text-xs font-bold ${muted}`}>
                  Removing job from active matches...
                </p>
                <div className="flex items-center gap-1.5 mt-5">
                  <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {archiveStage === 'success' && (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-[#2C7FFF]/20 animate-ping" />
                  <div className="relative w-20 h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#2C7FFF] flex items-center justify-center shadow-[0_10px_30px_rgba(44,127,255,0.5)]">
                      <svg className="w-8 h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#03045E] flex items-center justify-center border-2 border-[#f4f4f4]">
                    <svg className="w-3.5 h-3.5 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-[#2C7FFF]/15 text-[#2C7FFF] text-[10px] font-black uppercase tracking-widest mb-3">
                  Job Archived
                </span>

                <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                  Posting Closed & Archived
                </h2>
                <p className={`text-sm font-semibold leading-relaxed mb-6 max-w-xs ${muted}`}>
                  "{archiveTarget.job_title}" has been moved to your history and removed from active matches.
                </p>

                <button
                  onClick={closeArchiveModal}
                  className="w-full py-3.5 rounded-2xl bg-[#2C7FFF] text-[#f4f4f4] font-black text-sm uppercase tracking-wider shadow-md hover:bg-[#03045E] transition-all duration-300 cursor-pointer border-2 border-[#2C7FFF]"
                >
                  Got it
                </button>
              </div>
            )}

            {archiveStage === 'error' && (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#03045E]/20 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#03045E] flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-[#2C7FFF]/15 text-[#2C7FFF] text-[10px] font-black uppercase tracking-widest mb-3">
                  Action Failed
                </span>

                <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                  Something went wrong
                </h2>
                <p className={`text-sm font-semibold leading-relaxed mb-6 max-w-xs ${muted}`}>
                  We couldn't archive this posting. Please try again in a moment.
                </p>

                <button
                  onClick={closeArchiveModal}
                  className="w-full py-3.5 rounded-2xl bg-[#2C7FFF] text-[#f4f4f4] font-black text-sm uppercase tracking-wider shadow-md hover:bg-[#03045E] transition-all duration-300 cursor-pointer border-2 border-[#2C7FFF]"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#03045E]/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[2rem] shadow-[0_25px_60px_rgba(3,4,94,0.4)] border-2 overflow-hidden animate-in zoom-in-95 duration-300 ${modalBg}`}>
            <div className="h-2 w-full bg-[#2C7FFF]" />

            <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className={`absolute inset-0 rounded-full ${getAlertRing(alertConfig.tone)} animate-ping`} />
                <div className={`relative w-20 h-20 rounded-full ${getAlertRing(alertConfig.tone)} flex items-center justify-center`}>
                  <div className={`w-14 h-14 rounded-full ${getAlertBadge(alertConfig.tone)} flex items-center justify-center shadow-[0_10px_30px_rgba(44,127,255,0.5)]`}>
                    {renderAlertIcon(alertConfig.tone)}
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#03045E] flex items-center justify-center border-2 border-[#f4f4f4]">
                  <svg className="w-3.5 h-3.5 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <span className="inline-block px-3 py-1 rounded-full bg-[#2C7FFF]/15 text-[#2C7FFF] text-[10px] font-black uppercase tracking-widest mb-3">
                {alertConfig.pill}
              </span>

              <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                {alertConfig.title}
              </h2>
              <p className={`text-sm font-semibold leading-relaxed mb-6 max-w-xs ${muted}`}>
                {alertConfig.subtitle}
              </p>

              <button
                onClick={() => setShowAlert(false)}
                className="w-full py-3.5 rounded-2xl bg-[#2C7FFF] text-[#f4f4f4] font-black text-sm uppercase tracking-wider shadow-md hover:bg-[#03045E] transition-all duration-300 cursor-pointer border-2 border-[#2C7FFF]"
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