import React, { useState, useEffect } from 'react';

export default function EmployerApplications({ profile, refreshStats }) {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  
  // --- NEW: ACTIVE TAB STATE ---
  const [activeTab, setActiveTab] = useState('All');

  // States for next steps message
  const [nextSteps, setNextSteps] = useState({ isOpen: false, status: '' });
  const [messageText, setMessageText] = useState('');

  // Fetch applications when component mounts
  const fetchApplications = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/employer/${profile.user_id}/applications`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Failed to fetch applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [profile.user_id]);

  // Update Status Function
  const updateStatus = async (applicationId, newStatus, employerMessage = null, closeModal = true) => {
    try {
      const res = await fetch(`http://localhost:5001/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          employer_message: employerMessage,
          applicant_id: selectedApp?.applicant_id,  // <-- Added so the server knows who to notify
          job_title: selectedApp?.job_title,          // <-- Added for the notification message text
          company_name: profile?.company_name || 'The Company' // <-- Added for context
        })
      });

      if (res.ok) {
        fetchApplications();
        if (refreshStats) refreshStats();
        
        // ONLY close the modal if this flag is true (e.g., when Hiring or Rejecting)
        if (closeModal) {
          setSelectedApp(null);
          setNextSteps({ isOpen: false, status: '' });
          setMessageText('');
        } else if (selectedApp && selectedApp.application_id === applicationId) {
          // If we are keeping it open, dynamically update the badge color inside the modal
          setSelectedApp(prev => ({ ...prev, application_status: newStatus }));
        }
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  // Helper to color-code status badges
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Shortlisted': return 'bg-green-100 text-green-800';
      case 'Hired': return 'bg-emerald-100 text-emerald-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // --- NEW: FILTER LOGIC ---
  const filteredApplications = applications.filter(app => {
    if (activeTab === 'All') return true;
    return app.application_status === activeTab;
  });

  // Array of tabs to render
  const tabs = ['All', 'Pending', 'Under Review', 'Shortlisted', 'Hired', 'Rejected'];

  if (isLoading) return <div className="p-10 font-bold text-[#03045E]">Loading applicants...</div>;

  return (
    <div className="animate-fadeIn max-w-6xl relative">
      <h1 className="text-3xl font-extrabold mb-6 text-[#03045E]">Review Applicants</h1>
      
      {/* --- NEW: TAB NAVIGATION --- */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-gray-200 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-[#03045E] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            {tab}
            {/* Optional: Add a counter for each tab if you want */}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {tab === 'All' 
                ? applications.length 
                : applications.filter(a => a.application_status === tab).length}
            </span>
          </button>
        ))}
      </div>
      
      {/* APPLICANT ROSTER (FILTERED LIST) */}
      <div className="flex flex-col gap-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map(app => (
            <div key={app.application_id} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-md hover:border-blue-100">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-[#03045E]">{app.firstname} {app.lastname}</h3>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusColor(app.application_status)}`}>
                    {app.application_status}
                  </span>
                </div>
                <p className="text-sm font-semibold opacity-80 text-[#03045E]">Applied for: {app.job_title}</p>
                <p className="text-xs opacity-60 mt-1">Date: {new Date(app.applied_at).toLocaleDateString()}</p>
              </div>

              <div>
                <button 
                  onClick={() => {
                    // 1. Open the modal immediately
                    setSelectedApp(app);
                    setNextSteps({ isOpen: false, status: '' });
                    setMessageText('');

                    // 2. Run the background update, but pass FALSE so it doesn't close the modal
                    if(app.application_status === 'Pending') {
                        updateStatus(app.application_id, 'Under Review', null, false);
                    }
                  }} 
                  className="px-6 py-2.5 text-sm font-bold text-[#03045E] bg-blue-50 border border-blue-100 rounded-xl hover:bg-[#03045E] hover:text-white transition-all shadow-sm"
                >
                  View Details
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="p-10 text-center opacity-70 font-bold border-2 border-dashed border-[#03045E]/20 rounded-2xl bg-gray-50">
            No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} applications found.
          </div>
        )}
      </div>

      {/* APPLICANT DETAIL MODAL (Unchanged) */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col transition-all">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-3xl font-extrabold text-[#03045E]">{selectedApp.firstname} {selectedApp.lastname}</h2>
                <p className="text-lg font-semibold text-[#03045E]/70 mt-1">Applying for: {selectedApp.job_title}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedApp.application_status)}`}>
                {selectedApp.application_status}
              </span>
            </div>

            {/* Modal Body - 2 Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              
              {/* Left Column: Profile & Contact */}
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-sm font-bold text-[#03045E]/60 uppercase mb-2">Contact Information</h4>
                  <p className="font-semibold text-[#03045E]"> {selectedApp.email}</p>
                  <p className="font-semibold text-[#03045E] mt-1">📞 {selectedApp.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#03045E]/60 uppercase mb-2">Disability Profile</h4>
                  <p className="font-semibold text-[#03045E] bg-gray-100 p-3 rounded-xl border border-gray-200">
                    {selectedApp.disability_type || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Right Column: Skills & Accommodations */}
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-sm font-bold text-[#03045E]/60 uppercase mb-2">Verified Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.skills ? 
                      (typeof selectedApp.skills === 'string' ? JSON.parse(selectedApp.skills) : selectedApp.skills).map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-800 text-sm font-bold rounded-lg border border-blue-200">
                          {skill}
                        </span>
                      ))
                    : <span className="text-sm opacity-60">No skills listed</span>}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#03045E]/60 uppercase mb-2">Requested Accommodations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.accommodations_needed ? 
                      (typeof selectedApp.accommodations_needed === 'string' ? JSON.parse(selectedApp.accommodations_needed) : selectedApp.accommodations_needed).map((acc, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-50 text-purple-800 text-sm font-bold rounded-lg border border-purple-200">
                          {acc}
                        </span>
                      ))
                    : <span className="text-sm opacity-60">None requested</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* APPLICATION DOCUMENTS SECTION */}
            <div className="mb-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-bold text-[#03045E]/60 uppercase mb-4">Application Documents</h4>
              
              <div className="flex flex-col gap-5">
                {selectedApp.resume_path ? (
                  <div>
                    <a 
                      href={`http://localhost:5001${selectedApp.resume_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#03045E] text-white font-bold rounded-xl hover:bg-[#2C7FFF] transition shadow-sm"
                    >
                      📄 View Attached Resume
                    </a>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 inline-block">
                    No resume file was attached to this application.
                  </p>
                )}

                {selectedApp.cover_letter && selectedApp.cover_letter.trim() !== '' && (
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                    <h5 className="text-xs font-bold text-[#03045E]/60 uppercase mb-2">Cover Letter / Message</h5>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedApp.cover_letter}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer - DYNAMIC STATUS MANAGEMENT */}
            <div className="mt-auto pt-6 border-t border-gray-200">
              {nextSteps.isOpen ? (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <label className="text-sm font-bold text-[#03045E]">
                    Provide Next Steps for the Applicant (for {nextSteps.status} status)
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="e.g., We would love to invite you for an interview on Monday at 10 AM. Here is the Google Meet link..."
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#2C7FFF] focus:ring-0 outline-none min-h-[100px] text-sm resize-none"
                  />
                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      onClick={() => { setNextSteps({ isOpen: false, status: '' }); setMessageText(''); }}
                      className="px-6 py-2.5 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => updateStatus(selectedApp.application_id, nextSteps.status, messageText)}
                      className="px-6 py-2.5 bg-[#2C7FFF] text-white font-bold rounded-xl hover:bg-[#03045E] transition shadow-md"
                    >
                      Confirm & Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 justify-end">
                  <button 
                    onClick={() => setSelectedApp(null)} 
                    className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition mr-auto"
                  >
                    Close Window
                  </button>
                  
                  <button 
                    onClick={() => updateStatus(selectedApp.application_id, 'Rejected')} 
                    className="px-6 py-3 bg-red-100 text-red-800 font-bold rounded-xl hover:bg-red-200 transition"
                  >
                    Reject
                  </button>
                  
                  <button 
                    onClick={() => setNextSteps({ isOpen: true, status: 'Shortlisted' })} 
                    className="px-6 py-3 bg-green-100 text-green-800 font-bold rounded-xl hover:bg-green-200 transition"
                  >
                    Shortlist
                  </button>
                  
                  <button 
                    onClick={() => setNextSteps({ isOpen: true, status: 'Hired' })} 
                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-md"
                  >
                    Hire Applicant
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}