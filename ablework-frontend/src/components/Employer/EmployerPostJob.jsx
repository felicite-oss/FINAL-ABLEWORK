import React, { useState } from 'react';

export default function EmployerPostJob({ profile, refreshData, setActiveTab }) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  // Skill & Accommodation States
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [accommodationsText, setAccommodationsText] = useState('');
  const [selectedDisabilities, setSelectedDisabilities] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // EXACT List requested
  const availableDisabilities = [
    'Deafness', 
    'Blindness', 
    'Low Vision', 
    'Hard of Hearing', 
    'Color Blindness', 
    'Paralysis', 
    'Amputation', 
    'Cerebral Palsy',
    'Limited Fine Motor Skills',
    'Wheelchair User'
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

  // --- SKILL AUTOCOMPLETE LOGIC ---
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(currentSkill);
    }
  };

  const addSkill = (skill) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !selectedSkills.some(s => s.toLowerCase() === trimmedSkill.toLowerCase())) {
      setSelectedSkills([...selectedSkills, trimmedSkill]);
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

  // --- ACCOMMODATION AUTOCOMPLETE LOGIC ---
  const accommodationsArray = accommodationsText.split(',');
  const activeAccTerm = accommodationsArray[accommodationsArray.length - 1].trim().toLowerCase();
  const existingAccs = accommodationsArray.map(a => a.trim().toLowerCase());

  const filteredAccommodations = activeAccTerm === '' ? [] : accommodationSuggestions.filter(a => 
    a.toLowerCase().includes(activeAccTerm) && !existingAccs.includes(a.toLowerCase())
  );

  const addAccommodationChip = (acc) => {
    const parts = accommodationsText.split(',');
    parts.pop(); 
    const prefix = parts.length > 0 ? parts.join(',').trim() + ', ' : '';
    setAccommodationsText(prefix + acc + ', '); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (selectedDisabilities.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please select at least one accepted disability.' });
      return;
    }
    
    if (selectedSkills.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please add at least one required skill.' });
      return;
    }

    setIsLoading(true);

    const finalAccommodationsArray = accommodationsText
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');

    const payload = {
      employer_id: profile.user_id,
      job_title: jobTitle,
      job_description: jobDescription,
      required_skills: JSON.stringify(selectedSkills),
      provided_accommodations: JSON.stringify(finalAccommodationsArray), 
      accepted_disabilities: JSON.stringify(selectedDisabilities), 
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
        setStatusMessage({ type: 'success', text: 'Job posted successfully! Redirecting to dashboard...' });
        setJobTitle('');
        setJobDescription('');
        setSelectedSkills([]);
        setCurrentSkill('');
        setAccommodationsText('');
        setSelectedDisabilities([]);
        
        await refreshData();
        setTimeout(() => setActiveTab('overview'), 2000);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to post job.' });
      }
    } catch (error) {
      console.error("Server Error:", error);
      setStatusMessage({ type: 'error', text: 'Cannot connect to the server.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-[#03045E]/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#2C7FFF]/15 text-[#2C7FFF] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-[#2C7FFF]/30">Job Management</span>
            <span className="text-xs font-bold text-[#03045E] bg-[#f4f4f4] px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-[#03045E]/20">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span> Smart Engine Enabled
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#03045E]">Create a Job Posting</h1>
          <p className="text-sm font-semibold text-[#03045E]/80 mt-0.5">Publish targeted opportunities with guaranteed accommodations for <span className="font-bold text-[#03045E]">{profile.company_name}</span>.</p>
        </div>
      </div>

      {statusMessage.text && (
        <div className={`p-4 mb-6 rounded-2xl font-bold text-center border-2 ${statusMessage.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-[#03045E]/10 flex flex-col gap-8">
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-extrabold text-[#03045E] flex items-center gap-2 uppercase tracking-wider">
              <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Job Title <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required
              placeholder="e.g. Remote Data Specialist"
              className="w-full p-4 border border-[#03045E]/20 rounded-2xl bg-[#f4f4f4] text-[#03045E] font-semibold focus:outline-none focus:border-[#2C7FFF] focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-extrabold text-[#03045E] flex items-center gap-2 uppercase tracking-wider">
              <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              Full Job Description <span className="text-red-500">*</span>
            </label>
            <textarea 
              value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} required rows="5"
              placeholder="Describe the role responsibilities and expectations..."
              className="w-full p-4 border border-[#03045E]/20 rounded-2xl bg-[#f4f4f4] text-[#03045E] font-semibold focus:outline-none focus:border-[#2C7FFF] focus:bg-white transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <hr className="border-[#03045E]/10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="flex flex-col gap-3">
            <label className="text-sm font-extrabold text-[#03045E] flex items-center gap-2 uppercase tracking-wider">
              Required Skills <span className="text-red-500">*</span>
            </label>
            <p className="text-xs font-semibold text-[#03045E]/70 mb-1">Type a skill and press <strong>Enter</strong> to add it.</p>
            
            <input
              type="text" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onKeyDown={handleSkillKeyDown}
              placeholder="e.g. Python, Graphic Design..."
              className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-[#f4f4f4] text-[#03045E] font-semibold focus:outline-none focus:border-[#2C7FFF] focus:bg-white transition-all"
            />

            {filteredSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {filteredSkills.map(suggestion => (
                  <button key={suggestion} type="button" onClick={() => addSkill(suggestion)} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors">
                    + {suggestion}
                  </button>
                ))}
              </div>
            )}

            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                {selectedSkills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#03045E] text-white text-xs font-bold rounded-full shadow-sm">
                    {skill} <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-300 font-bold ml-0.5">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-extrabold text-[#03045E] flex items-center gap-2 uppercase tracking-wider">
              Guaranteed Accommodations
            </label>
            <p className="text-xs font-semibold text-[#03045E]/70 mb-1">Enter accommodations separated by commas.</p>
            
            <input
              type="text" value={accommodationsText} onChange={(e) => setAccommodationsText(e.target.value)}
              placeholder="e.g. Wheelchair Access, Screen Reader..."
              className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-[#f4f4f4] text-[#03045E] font-semibold focus:outline-none focus:border-[#2C7FFF] focus:bg-white transition-all"
            />

            {filteredAccommodations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {filteredAccommodations.map(suggestion => (
                  <button key={suggestion} type="button" onClick={() => addAccommodationChip(suggestion)} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200 hover:bg-green-600 hover:text-white transition-colors">
                    + {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <hr className="border-[#03045E]/10" />

        {/* UPDATED: EXACT DISABILITY LIST CHIPS */}
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#2C7FFF]/5 border border-[#2C7FFF]/20">
          <div>
            <label className="text-sm font-extrabold text-[#03045E] flex items-center gap-2 uppercase tracking-wider">
              <svg className="w-5 h-5 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Accepted Disabilities <span className="text-red-500">*</span>
            </label>
            <p className="text-xs font-semibold text-[#03045E]/70 mt-1">Select the specific conditions this workplace is fully equipped and prepared to support.</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-2">
            {availableDisabilities.map((disability) => (
              <button
                type="button" key={disability}
                onClick={() => toggleSelection(disability, selectedDisabilities, setSelectedDisabilities)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors shadow-sm ${
                  selectedDisabilities.includes(disability)
                    ? 'bg-[#2C7FFF] text-white border-[#2C7FFF]'
                    : 'bg-white text-[#03045E] border-[#03045E]/20 hover:border-[#2C7FFF]'
                }`}
              >
                {disability} {selectedDisabilities.includes(disability) ? '✓' : '+'}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit" disabled={isLoading}
          className="w-full py-4 bg-[#03045E] hover:bg-[#2C7FFF] text-white text-base font-extrabold rounded-2xl shadow-md transition-all disabled:opacity-50 mt-2 flex justify-center items-center gap-2"
        >
          {isLoading ? 'Publishing Job...' : 'Publish Job Posting'}
          {!isLoading && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
        </button>
      </form>
    </div>
  );
}