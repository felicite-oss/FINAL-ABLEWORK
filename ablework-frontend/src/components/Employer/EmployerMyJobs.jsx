import React, { useState } from 'react';

// --- UPGRADED BULLETPROOF PARSING HELPER ---
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
  const [editingJob, setEditingJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listTab, setListTab] = useState('active');

  // Temporary inputs for chip fields
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentAccommodation, setCurrentAccommodation] = useState('');
  const [currentBenefit, setCurrentBenefit] = useState('');

  // --- SUGGESTION LISTS ---
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

  // --- FILTERED SUGGESTIONS ---
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

  // --- CHIP HANDLERS ---
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
      setter(''); // Clear the input field
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

  // --- EDIT SUBMISSION ---
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
        alert("Job updated successfully!");
        setEditingJob(null);
        refreshData();
      }
    } catch (err) {
      alert("Error updating job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ARCHIVE SUBMISSION ---
  const handleArchiveJob = async (jobId) => {
    if(!window.confirm("Are you sure you want to close and archive this job? It will be removed from active matches.")) return;
    
    try {
      const res = await fetch(`http://localhost:5001/api/jobs/${jobId}/archive`, { method: 'PUT' });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      alert("Error archiving job.");
    }
  };

  const displayedJobs = jobs.filter(job => 
    listTab === 'active' ? job.status === 'Active' : job.status === 'Archived'
  );

  return (
    <div className="animate-fadeIn max-w-5xl relative">
      
      {/* HEADER WITH TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[#03045E]/10 pb-4 gap-4">
        <h1 className="text-3xl font-extrabold text-[#03045E]">My Job Listings</h1>
        <div className="flex gap-2 bg-gray-200 p-1 rounded-xl">
            <button 
                onClick={() => setListTab('active')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition cursor-pointer ${listTab === 'active' ? 'bg-[#03045E] text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
            >
                Active Jobs
            </button>
            <button 
                onClick={() => setListTab('archived')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition cursor-pointer ${listTab === 'archived' ? 'bg-[#03045E] text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
            >
                Archived / History
            </button>
        </div>
      </div>
      
      {/* JOB LISTINGS */}
      <div className="flex flex-col gap-4">
        {displayedJobs.length > 0 ? (
          displayedJobs.map(job => (
            <div key={job.id} className="p-6 bg-white rounded-2xl shadow-md border border-[#03045E]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
              <div>
                <h3 className="text-xl font-bold text-[#03045E]">{job.job_title}</h3>
                <p className="text-sm opacity-70 mt-1">Posted on {new Date(job.created_at).toLocaleDateString()}</p>
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
                        }} className="px-5 py-2 text-sm font-bold text-[#03045E] bg-[#f4f4f4] rounded-full hover:bg-[#2C7FFF]/20 transition cursor-pointer">Edit</button>
                        
                        <button onClick={() => handleArchiveJob(job.id)} className="px-5 py-2 text-sm font-bold text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition cursor-pointer">Close & Archive</button>
                    </>
                ) : (
                    <span className="px-5 py-2 text-sm font-bold text-gray-500 bg-gray-100 rounded-full border border-gray-200">Closed</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center opacity-70 font-bold border-2 border-dashed border-[#03045E]/20 rounded-2xl">
            No {listTab} job postings found.
          </div>
        )}
      </div>

      {/* --- EDIT MODAL POPUP --- */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <h2 className="text-2xl font-extrabold text-[#03045E] mb-6">Edit Job Posting</h2>
            
            <form onSubmit={handleEditJob} className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#03045E]">Job Title</label>
                <input type="text" value={editingJob.job_title} onChange={e => setEditingJob({...editingJob, job_title: e.target.value})} required className="p-3 bg-[#f4f4f4] border border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] focus:bg-white outline-none font-semibold text-[#03045E] transition-all" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#03045E]">Description</label>
                <textarea rows="4" value={editingJob.job_description} onChange={e => setEditingJob({...editingJob, job_description: e.target.value})} required className="p-3 bg-[#f4f4f4] border border-[#03045E]/20 rounded-xl resize-none focus:border-[#2C7FFF] focus:bg-white outline-none font-semibold text-[#03045E] transition-all"></textarea>
              </div>
              
              <hr className="border-[#03045E]/10 my-1" />

              {/* REQUIRED SKILLS CHIPS */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#03045E]">Required Skills</label>
                <p className="text-xs text-[#03045E]/70 font-semibold mb-1">Type and press <strong>Enter</strong> to add.</p>
                <input 
                  type="text" value={currentSkill} 
                  onChange={e => setCurrentSkill(e.target.value)} 
                  onKeyDown={e => handleAddChip(e, 'parsedSkills', currentSkill, setCurrentSkill)} 
                  placeholder="e.g. Python, Communication..."
                  className="p-3 bg-[#f4f4f4] border border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] focus:bg-white outline-none font-semibold text-[#03045E] transition-all" 
                />
                
                {/* Suggestions */}
                {filteredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {filteredSkills.map(suggestion => (
                      <button key={suggestion} type="button" onClick={() => addSuggestion('parsedSkills', suggestion, setCurrentSkill)} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Chips */}
                {editingJob.parsedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    {editingJob.parsedSkills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#03045E] text-white text-xs font-bold rounded-full shadow-sm">
                        {skill} <button type="button" onClick={() => removeChip('parsedSkills', skill)} className="hover:text-red-300 font-bold ml-0.5 cursor-pointer">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* ACCOMMODATIONS CHIPS */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#03045E]">Guaranteed Accommodations</label>
                <p className="text-xs text-[#03045E]/70 font-semibold mb-1">Type and press <strong>Enter</strong> to add.</p>
                <input 
                  type="text" value={currentAccommodation} 
                  onChange={e => setCurrentAccommodation(e.target.value)} 
                  onKeyDown={e => handleAddChip(e, 'parsedAccoms', currentAccommodation, setCurrentAccommodation)} 
                  placeholder="e.g. Wheelchair Access..."
                  className="p-3 bg-[#f4f4f4] border border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] focus:bg-white outline-none font-semibold text-[#03045E] transition-all" 
                />
                
                {/* Suggestions */}
                {filteredAccommodations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {filteredAccommodations.map(suggestion => (
                      <button key={suggestion} type="button" onClick={() => addSuggestion('parsedAccoms', suggestion, setCurrentAccommodation)} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200 hover:bg-green-600 hover:text-white transition-colors cursor-pointer">
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Chips */}
                {editingJob.parsedAccoms.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    {editingJob.parsedAccoms.map((acc, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#03045E] text-white text-xs font-bold rounded-full shadow-sm">
                        {acc} <button type="button" onClick={() => removeChip('parsedAccoms', acc)} className="hover:text-red-300 font-bold ml-0.5 cursor-pointer">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ACCEPTED DISABILITIES (Toggle Buttons) */}
              <div className="flex flex-col gap-2 p-5 rounded-2xl bg-[#2C7FFF]/5 border border-[#2C7FFF]/20 mt-2">
                <div>
                  <label className="text-sm font-extrabold text-[#03045E] flex items-center gap-2 uppercase tracking-wider">
                    Accepted Disabilities <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableDisabilities.map((disability) => (
                    <button
                      type="button" key={disability}
                      onClick={() => toggleDisability(disability)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shadow-sm ${
                        editingJob.parsedDisabilities.includes(disability)
                          ? 'bg-[#2C7FFF] text-white border-[#2C7FFF]'
                          : 'bg-white text-[#03045E] border-[#03045E]/20 hover:border-[#2C7FFF]'
                      }`}
                    >
                      {disability} {editingJob.parsedDisabilities.includes(disability) ? '✓' : '+'}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-[#03045E]/10 my-1" />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#03045E]">Salary Range</label>
                <input type="text" value={editingJob.salary_range} onChange={e => setEditingJob({...editingJob, salary_range: e.target.value})} className="p-3 bg-[#f4f4f4] border border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] focus:bg-white outline-none font-semibold text-[#03045E] transition-all" placeholder="e.g. ₱20,000 - ₱30,000 / month" />
              </div>
              
              {/* BENEFITS CHIPS */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#03045E]">Benefits</label>
                <p className="text-xs text-[#03045E]/70 font-semibold mb-1">Type and press <strong>Enter</strong> to add.</p>
                <input 
                  type="text" value={currentBenefit} 
                  onChange={e => setCurrentBenefit(e.target.value)} 
                  onKeyDown={e => handleAddChip(e, 'parsedBenefits', currentBenefit, setCurrentBenefit)} 
                  className="p-3 bg-[#f4f4f4] border border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] focus:bg-white outline-none font-semibold text-[#03045E] transition-all" 
                  placeholder="e.g. HMO, 13th Month Pay..." 
                />

                {/* Suggestions */}
                {filteredBenefits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {filteredBenefits.map(suggestion => (
                      <button key={suggestion} type="button" onClick={() => addSuggestion('parsedBenefits', suggestion, setCurrentBenefit)} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-200 hover:bg-purple-600 hover:text-white transition-colors cursor-pointer">
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Chips */}
                {editingJob.parsedBenefits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    {editingJob.parsedBenefits.map((benefit, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#03045E] text-white text-xs font-bold rounded-full shadow-sm">
                        {benefit} <button type="button" onClick={() => removeChip('parsedBenefits', benefit)} className="hover:text-red-300 font-bold ml-0.5 cursor-pointer">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6 pt-6 border-t border-[#03045E]/10">
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 bg-[#03045E] text-white font-extrabold rounded-xl hover:bg-[#2C7FFF] shadow-md transition-all cursor-pointer">Save Changes</button>
                <button type="button" onClick={() => setEditingJob(null)} className="flex-1 py-3.5 bg-gray-200 text-gray-800 font-extrabold rounded-xl hover:bg-gray-300 transition-all cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}