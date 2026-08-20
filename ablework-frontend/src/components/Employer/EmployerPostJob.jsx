import React, { useState } from 'react';

export default function EmployerPostJob({ profile, refreshData, setActiveTab }) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [reqSkills, setReqSkills] = useState('');
  const [provAccoms, setProvAccoms] = useState('');
  const [salary, setSalary] = useState('');
  const [benefits, setBenefits] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      employer_id: profile.user_id,
      job_title: jobTitle,
      company_name: profile.company_name,
      job_description: jobDesc,
      required_skills: reqSkills.split(',').map(s => s.trim()).filter(s => s), 
      provided_accommodations: provAccoms.split(',').map(s => s.trim()).filter(s => s),
      salary_range: salary,
      benefits: benefits.split(',').map(s => s.trim()).filter(s => s),
      latitude: profile.latitude,
      longitude: profile.longitude
    };

    try {
      const res = await fetch('http://localhost:5001/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Job posted successfully!");
        setJobTitle(''); setJobDesc(''); setReqSkills(''); setProvAccoms('');
        refreshData();
        setActiveTab('jobs'); 
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to post job.");
      }
    } catch (err) {
      alert("Error posting job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-4xl mr-auto pb-10">
      
      {/* --- HEADER ROW --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-[#f4f4f4]/90 [.high-contrast_&]:bg-black [.high-contrast_&]:border-white backdrop-blur-md p-6 rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.06)] border border-[#03045E]/20">
        <div className="text-left">
          <div className="flex items-center justify-start gap-2 mb-1.5">
            <span className="bg-[#2C7FFF]/15 text-[#2C7FFF] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-[#2C7FFF]/30">Job Management</span>
            <span className="text-xs font-bold text-[#03045E] [.high-contrast_&]:text-white bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-[#03045E]/20">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse"></span> Recruitment Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#03045E] [.high-contrast_&]:text-white">Create a Job Posting</h1>
          <p className="text-sm font-semibold text-[#03045E]/80 [.high-contrast_&]:text-gray-300 mt-0.5">Publish targeted opportunities with guaranteed accommodations for <span className="font-bold text-[#03045E] [.high-contrast_&]:text-white">{profile.company_name}</span>.</p>
        </div>
      </div>
      
      {profile.verification_status !== 'Approved' ? (
        <div className="relative overflow-hidden p-8 rounded-3xl bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white border border-[#03045E]/20 shadow-[0_10px_30px_rgba(3,4,94,0.06)] text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2C7FFF]/10 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2C7FFF]/15 to-[#2C7FFF]/25 border border-[#2C7FFF]/30 flex items-center justify-center text-[#2C7FFF] mb-4 shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-[#03045E] [.high-contrast_&]:text-white mb-2">Verification Pending</h3>
          <p className="text-[#03045E]/80 [.high-contrast_&]:text-gray-300 font-semibold max-w-lg text-sm leading-relaxed">
            Your business documents are currently under review by the AbleWork administration team. You will be able to post active job listings as soon as your account is approved.
          </p>
        </div>
      ) : (
        <form onSubmit={handlePostJob} className="p-6 sm:p-8 rounded-3xl bg-[#f4f4f4] [.high-contrast_&]:bg-black [.high-contrast_&]:border-white shadow-[0_10px_30px_rgba(3,4,94,0.06)] border border-[#03045E]/20 flex flex-col gap-6 relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#2C7FFF]/10 to-transparent rounded-bl-full pointer-events-none"></div>

          {/* Job Title */}
          <div className="flex flex-col gap-2 relative z-10 text-left">
            <label className="text-xs font-extrabold text-[#03045E] [.high-contrast_&]:text-white uppercase tracking-wider flex items-center justify-start gap-1.5">
              <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Job Title
            </label>
            <input 
              type="text" 
              required 
              value={jobTitle} 
              onChange={e => setJobTitle(e.target.value)}
              className="p-3.5 bg-white [.high-contrast_&]:bg-gray-900 [.high-contrast_&]:text-white [.high-contrast_&]:border-white border border-[#03045E]/15 rounded-2xl focus:border-[#2C7FFF] focus:ring-2 focus:ring-[#2C7FFF]/20 outline-none text-[#03045E] font-medium transition-all shadow-sm text-left" 
              placeholder="e.g. Remote Data Specialist" 
            />
          </div>

          {/* Full Job Description */}
          <div className="flex flex-col gap-2 relative z-10 text-left">
            <label className="text-xs font-extrabold text-[#03045E] [.high-contrast_&]:text-white uppercase tracking-wider flex items-center justify-start gap-1.5">
              <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Full Job Description
            </label>
            <textarea 
              required 
              rows="5" 
              value={jobDesc} 
              onChange={e => setJobDesc(e.target.value)}
              className="p-3.5 bg-white [.high-contrast_&]:bg-gray-900 [.high-contrast_&]:text-white [.high-contrast_&]:border-white border border-[#03045E]/15 rounded-2xl focus:border-[#2C7FFF] focus:ring-2 focus:ring-[#2C7FFF]/20 outline-none resize-none text-[#03045E] font-medium transition-all shadow-sm text-left [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#03045E]/10 [&::-webkit-scrollbar-thumb]:rounded-full" 
              placeholder="Describe the role responsibilities and expectations..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 text-left">
            {/* Required Skills */}
            <div className="flex flex-col gap-2 text-left">
              <label className="text-xs font-extrabold text-[#03045E] [.high-contrast_&]:text-white uppercase tracking-wider flex items-center justify-start gap-1.5">
                <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Required Skills (Comma separated)
              </label>
              <input 
                type="text" 
                required 
                value={reqSkills} 
                onChange={e => setReqSkills(e.target.value)}
                className="p-3.5 bg-white [.high-contrast_&]:bg-gray-900 [.high-contrast_&]:text-white [.high-contrast_&]:border-white border border-[#03045E]/15 rounded-2xl focus:border-[#2C7FFF] focus:ring-2 focus:ring-[#2C7FFF]/20 outline-none text-[#03045E] font-medium transition-all shadow-sm text-left" 
                placeholder="e.g. Data Entry, Customer Service" 
              />
            </div>

            {/* Guaranteed Accommodations */}
            <div className="flex flex-col gap-2 text-left">
              <label className="text-xs font-extrabold text-[#03045E] [.high-contrast_&]:text-white uppercase tracking-wider flex items-center justify-start gap-1.5">
                <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-9.05.273-1.05.822L7.5 5.5m7 4.5h-4m4 0V21m-4-11V5a2 2 0 00-2-2h-.095c-.5 0-.905.273-1.05.822L7.5 5.5" />
                </svg>
                Guaranteed Accommodations (Comma separated)
              </label>
              <input 
                type="text" 
                required 
                value={provAccoms} 
                onChange={e => setProvAccoms(e.target.value)}
                className="p-3.5 bg-white [.high-contrast_&]:bg-gray-900 [.high-contrast_&]:text-white [.high-contrast_&]:border-white border border-[#03045E]/15 rounded-2xl focus:border-[#2C7FFF] focus:ring-2 focus:ring-[#2C7FFF]/20 outline-none text-[#03045E] font-medium transition-all shadow-sm text-left" 
                placeholder="e.g. Wheelchair Accessible, Screen Reader" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 text-left">
            {/* Salary Range */}
            <div className="flex flex-col gap-2 text-left">
              <label className="text-xs font-extrabold text-[#03045E] [.high-contrast_&]:text-white uppercase tracking-wider flex items-center justify-start gap-1.5">
                <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Salary Range
              </label>
              <input 
                type="text" 
                value={salary} 
                onChange={e => setSalary(e.target.value)}
                className="p-3.5 bg-white [.high-contrast_&]:bg-gray-900 [.high-contrast_&]:text-white [.high-contrast_&]:border-white border border-[#03045E]/15 rounded-2xl focus:border-[#2C7FFF] focus:ring-2 focus:ring-[#2C7FFF]/20 outline-none text-[#03045E] font-medium transition-all shadow-sm text-left" 
                placeholder="e.g. ₱20,000 - ₱30,000 / month" 
              />
            </div>

            {/* Company Benefits */}
            <div className="flex flex-col gap-2 text-left">
              <label className="text-xs font-extrabold text-[#03045E] [.high-contrast_&]:text-white uppercase tracking-wider flex items-center justify-start gap-1.5">
                <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Company Benefits (Comma separated)
              </label>
              <input 
                type="text" 
                value={benefits} 
                onChange={e => setBenefits(e.target.value)}
                className="p-3.5 bg-white [.high-contrast_&]:bg-gray-900 [.high-contrast_&]:text-white [.high-contrast_&]:border-white border border-[#03045E]/15 rounded-2xl focus:border-[#2C7FFF] focus:ring-2 focus:ring-[#2C7FFF]/20 outline-none text-[#03045E] font-medium transition-all shadow-sm text-left" 
                placeholder="e.g. HMO, 13th Month Pay, Internet Allowance" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-4 mt-2 bg-[#03045E] [.high-contrast_&]:bg-white [.high-contrast_&]:text-black hover:bg-[#2C7FFF] text-white font-extrabold rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer relative z-10"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white [.high-contrast_&]:text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing Posting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Publish Job Posting
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}