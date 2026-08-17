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
    <div className="animate-fadeIn max-w-3xl">
      <h1 className="text-3xl font-extrabold mb-8 text-[#03045E]">Create a Job Posting</h1>
      
      {profile.verification_status !== 'Approved' ? (
        <div className="p-8 rounded-3xl bg-orange-100 border border-orange-300 shadow-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-orange-900 mb-2">Verification Pending</h3>
          <p className="text-orange-800 font-medium">
            Your business documents are currently under review by the AbleWork administration team. You will be able to post active job listings as soon as your account is approved.
          </p>
        </div>
      ) : (
        <form onSubmit={handlePostJob} className="p-8 rounded-3xl bg-white shadow-xl border border-[#03045E]/10 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#03045E]">Job Title</label>
            <input type="text" required value={jobTitle} onChange={e => setJobTitle(e.target.value)}
              className="p-3 border border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] outline-none" placeholder="e.g. Remote Data Specialist" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#03045E]">Full Job Description</label>
            <textarea required rows="5" value={jobDesc} onChange={e => setJobDesc(e.target.value)}
              className="p-3 border border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] outline-none resize-none" placeholder="Describe the role..."></textarea>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#03045E]">Required Skills (Comma separated)</label>
            <input type="text" required value={reqSkills} onChange={e => setReqSkills(e.target.value)}
              className="p-3 border border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] outline-none" placeholder="e.g. Data Entry, Customer Service" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#03045E]">Guaranteed Accommodations (Comma separated)</label>
            <input type="text" required value={provAccoms} onChange={e => setProvAccoms(e.target.value)}
              className="p-3 border border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] outline-none" placeholder="e.g. Wheelchair Accessible, Screen Reader" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#03045E]">Salary Range</label>
            <input type="text" value={salary} onChange={e => setSalary(e.target.value)}
              className="p-3 border border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] outline-none" placeholder="e.g. ₱20,000 - ₱30,000 / month" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#03045E]">Company Benefits (Comma separated)</label>
            <input type="text" value={benefits} onChange={e => setBenefits(e.target.value)}
              className="p-3 border border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] outline-none" placeholder="e.g. HMO, 13th Month Pay, Internet Allowance" />
          </div>
          <button type="submit" disabled={isSubmitting} className="py-4 bg-[#03045E] hover:bg-[#2C7FFF] text-white font-bold rounded-xl transition mt-2">
            {isSubmitting ? 'Posting...' : 'Publish Job Posting'}
          </button>
        </form>
      )}
    </div>
  );
}