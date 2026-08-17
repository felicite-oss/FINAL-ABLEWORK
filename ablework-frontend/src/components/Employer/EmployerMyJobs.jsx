import React, { useState } from 'react';

export default function EmployerMyJobs({ jobs, refreshData }) {
  const [editingJob, setEditingJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listTab, setListTab] = useState('active'); // Controls the Tabs!

  // --- EDIT SUBMISSION ---
  const handleEditJob = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      job_title: editingJob.job_title,
      job_description: editingJob.job_description,
      required_skills: typeof editingJob.reqSkillsString === 'string' ? editingJob.reqSkillsString.split(',').map(s => s.trim()).filter(s => s) : editingJob.required_skills,
      provided_accommodations: typeof editingJob.provAccomsString === 'string' ? editingJob.provAccomsString.split(',').map(s => s.trim()).filter(s => s) : editingJob.provided_accommodations,
      salary_range: editingJob.salary_range,
      benefits: typeof editingJob.benefitsString === 'string' ? editingJob.benefitsString.split(',').map(s => s.trim()).filter(s => s) : editingJob.benefits
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

  // --- FILTER LOGIC ---
  // This ensures archived jobs completely disappear from the active UI display!
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
                className={`px-6 py-2 rounded-lg font-bold text-sm transition ${listTab === 'active' ? 'bg-[#03045E] text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
            >
                Active Jobs
            </button>
            <button 
                onClick={() => setListTab('archived')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition ${listTab === 'archived' ? 'bg-[#03045E] text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
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
                          // Safely parse JSON strings from the database to populate the edit form
                          const parsedSkills = typeof job.required_skills === 'string' ? JSON.parse(job.required_skills) : (job.required_skills || []);
                          const parsedAccoms = typeof job.provided_accommodations === 'string' ? JSON.parse(job.provided_accommodations) : (job.provided_accommodations || []);
                          const parsedBenefits = typeof job.benefits === 'string' ? JSON.parse(job.benefits) : (job.benefits || []);
                          
                          setEditingJob({
                              ...job, 
                              reqSkillsString: parsedSkills.join(', '), 
                              provAccomsString: parsedAccoms.join(', '),
                              salary_range: job.salary_range || '',
                              benefitsString: parsedBenefits.join(', ')
                          });
                        }} className="px-5 py-2 text-sm font-bold text-[#03045E] bg-[#f4f4f4] rounded-full hover:bg-[#2C7FFF]/20 transition">Edit</button>
                        
                        <button onClick={() => handleArchiveJob(job.id)} className="px-5 py-2 text-sm font-bold text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition">Close & Archive</button>
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
          <div className="bg-white p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#03045E] mb-6">Edit Job Posting</h2>
            <form onSubmit={handleEditJob} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-[#03045E]">Job Title</label>
                <input type="text" value={editingJob.job_title} onChange={e => setEditingJob({...editingJob, job_title: e.target.value})} required className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-[#03045E]">Description</label>
                <textarea rows="4" value={editingJob.job_description} onChange={e => setEditingJob({...editingJob, job_description: e.target.value})} required className="p-3 border border-gray-300 rounded-xl resize-none focus:border-[#2C7FFF] outline-none"></textarea>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-[#03045E]">Skills (Comma separated)</label>
                <input type="text" value={editingJob.reqSkillsString} onChange={e => setEditingJob({...editingJob, reqSkillsString: e.target.value})} required className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-[#03045E]">Accommodations (Comma separated)</label>
                <input type="text" value={editingJob.provAccomsString} onChange={e => setEditingJob({...editingJob, provAccomsString: e.target.value})} required className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" />
              </div>

              {/* NEW FIELDS ADDED HERE */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-[#03045E]">Salary Range</label>
                <input type="text" value={editingJob.salary_range} onChange={e => setEditingJob({...editingJob, salary_range: e.target.value})} className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" placeholder="e.g. ₱20,000 - ₱30,000 / month" />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-[#03045E]">Benefits (Comma separated)</label>
                <input type="text" value={editingJob.benefitsString} onChange={e => setEditingJob({...editingJob, benefitsString: e.target.value})} className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" placeholder="e.g. HMO, 13th Month Pay" />
              </div>

              <div className="flex gap-4 mt-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-[#03045E] text-white font-bold rounded-xl hover:bg-[#2C7FFF] transition">Save Changes</button>
                <button type="button" onClick={() => setEditingJob(null)} className="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}