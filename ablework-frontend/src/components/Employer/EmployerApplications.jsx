import React, { useState, useEffect, useContext } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';

export default function EmployerApplications({ profile, refreshStats }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('All');

  const [nextSteps, setNextSteps] = useState({ isOpen: false, status: '' });
  const [messageText, setMessageText] = useState('');
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  const [statusAlert, setStatusAlert] = useState({ title: '', subtitle: '', tone: 'default' });

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

  const updateStatus = async (applicationId, newStatus, employerMessage = null, closeModal = true, showAlert = false) => {
    const applicantName = selectedApp?.firstname || 'The applicant';
    const jobTitle = selectedApp?.job_title || 'the position';

    try {
      const res = await fetch(`http://localhost:5001/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          employer_message: employerMessage,
          applicant_id: selectedApp?.applicant_id,
          job_title: selectedApp?.job_title,
          company_name: profile?.company_name || 'The Company'
        })
      });

      if (res.ok) {
        fetchApplications();
        if (refreshStats) refreshStats();

        if (showAlert) {
          if (newStatus === 'Hired') {
            setStatusAlert({
              title: 'Applicant Hired!',
              subtitle: `${applicantName} has been successfully hired for ${jobTitle}. A notification has been sent.`,
              tone: 'hired'
            });
          } else if (newStatus === 'Shortlisted') {
            setStatusAlert({
              title: 'Applicant Shortlisted!',
              subtitle: `${applicantName} has been shortlisted for ${jobTitle}. Next steps were forwarded.`,
              tone: 'shortlisted'
            });
          } else if (newStatus === 'Rejected') {
            setStatusAlert({
              title: 'Applicant Rejected',
              subtitle: `${applicantName}'s application for ${jobTitle} has been updated to Rejected.`,
              tone: 'rejected'
            });
          } else {
            setStatusAlert({
              title: 'Status Updated',
              subtitle: `${applicantName}'s application is now set to ${newStatus}.`,
              tone: 'default'
            });
          }
          setShowStatusAlert(true);
        }
        
        if (closeModal) {
          setSelectedApp(null);
          setNextSteps({ isOpen: false, status: '' });
          setMessageText('');
        } else if (selectedApp && selectedApp.application_id === applicationId) {
          setSelectedApp(prev => ({ ...prev, application_status: newStatus }));
        }
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const getStatusColor = (status) => {
    if (isContrast) {
      switch (status) {
        case 'Pending': return 'bg-black text-[#f4f4f4] border border-[#2C7FFF]/40';
        case 'Under Review': return 'bg-[#2C7FFF]/20 text-[#2C7FFF] border border-[#2C7FFF]';
        case 'Shortlisted': return 'bg-[#2C7FFF]/40 text-[#f4f4f4] border border-[#2C7FFF]';
        case 'Hired': return 'bg-[#2C7FFF] text-[#f4f4f4] border border-[#2C7FFF]';
        case 'Rejected': return 'bg-[#03045E] text-[#f4f4f4] border border-[#f4f4f4]/40';
        default: return 'bg-black text-[#f4f4f4] border border-[#2C7FFF]/30';
      }
    }
    switch (status) {
      case 'Pending': return 'bg-[#2C7FFF]/10 text-[#03045E] border border-[#2C7FFF]/30';
      case 'Under Review': return 'bg-[#2C7FFF]/15 text-[#03045E] border border-[#2C7FFF]/30';
      case 'Shortlisted': return 'bg-[#2C7FFF]/20 text-[#03045E] border border-[#2C7FFF]/40';
      case 'Hired': return 'bg-[#2C7FFF] text-[#f4f4f4] border border-[#2C7FFF]';
      case 'Rejected': return 'bg-[#f4f4f4] text-[#03045E] border border-[#03045E]/30';
      default: return 'bg-[#f4f4f4] text-[#03045E] border border-[#03045E]/20';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'All') return true;
    return app.application_status === activeTab;
  });

  const tabs = ['All', 'Pending', 'Under Review', 'Shortlisted', 'Hired', 'Rejected'];

  const pageText = isContrast ? 'text-[#f4f4f4]' : 'text-[#03045E]';
  const panelBg = isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-[#f4f4f4]/90 border-[#03045E]/20';
  const cardBg = isContrast ? 'bg-black border-[#2C7FFF]/40' : 'bg-white border-[#03045E]/15';
  const softPanel = isContrast ? 'bg-[#2C7FFF]/10 border-[#2C7FFF]/30' : 'bg-[#f4f4f4] border-[#03045E]/15';
  const muted = isContrast ? 'text-[#f4f4f4]/80' : 'text-[#03045E]/80';
  const subtle = isContrast ? 'text-[#f4f4f4]/60' : 'text-[#03045E]/60';
  const dividerColor = isContrast ? 'border-[#2C7FFF]/40' : 'border-[#03045E]/10';

  const renderAlertIcon = (tone) => {
    if (tone === 'rejected') {
      return (
        <svg className="w-8 h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    if (tone === 'shortlisted') {
      return (
        <svg className="w-8 h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  const getAlertBadgeStyle = (tone) => {
    if (tone === 'rejected') return 'bg-[#03045E]';
    return 'bg-[#2C7FFF]';
  };

  const getAlertPillLabel = (tone) => {
    if (tone === 'hired') return 'Applicant Hired';
    if (tone === 'shortlisted') return 'Applicant Shortlisted';
    if (tone === 'rejected') return 'Applicant Rejected';
    return 'Status Updated';
  };

  if (isLoading) return <div className={`p-10 font-bold ${pageText}`}>Loading applicants...</div>;

  return (
    <div className={`animate-fadeIn max-w-7xl mx-auto pb-10 relative ${pageText}`}>
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 backdrop-blur-md p-6 rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.06)] border ${panelBg}`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#2C7FFF]/15 text-[#2C7FFF] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-[#2C7FFF]/30">Candidate Hub</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border ${isContrast ? 'bg-black text-[#f4f4f4] border-[#2C7FFF]/40' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20'}`}>
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse"></span> Active Pipeline
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${pageText}`}>Review Applicants</h1>
          <p className={`text-sm font-semibold mt-0.5 ${muted}`}>Manage incoming applications, review qualifications, and update recruitment statuses.</p>
        </div>
      </div>
      
      <div className={`flex gap-2 overflow-x-auto pb-4 mb-6 border-b scrollbar-hide ${dividerColor}`}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-[#2C7FFF] text-[#f4f4f4] shadow-md'
                : isContrast
                  ? 'bg-black text-[#f4f4f4]/70 hover:bg-[#2C7FFF]/20 hover:text-[#f4f4f4] border border-[#2C7FFF]/30'
                  : 'bg-[#f4f4f4] text-[#03045E]/70 hover:bg-[#2C7FFF]/10 hover:text-[#03045E] border border-[#03045E]/10'
            }`}
          >
            {tab}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === tab 
                ? 'bg-[#f4f4f4]/20 text-[#f4f4f4]' 
                : isContrast 
                  ? 'bg-[#2C7FFF]/20 text-[#f4f4f4]' 
                  : 'bg-[#03045E]/10 text-[#03045E]'
            }`}>
              {tab === 'All' 
                ? applications.length 
                : applications.filter(a => a.application_status === tab).length}
            </span>
          </button>
        ))}
      </div>
      
      <div className="flex flex-col gap-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map(app => (
            <div key={app.application_id} className={`p-6 rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.06)] border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-lg hover:border-[#2C7FFF] ${cardBg}`}>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`text-xl font-bold ${pageText}`}>{app.firstname} {app.lastname}</h3>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusColor(app.application_status)}`}>
                    {app.application_status}
                  </span>
                </div>
                <p className={`text-sm font-semibold ${muted}`}>Applied for: <span className="text-[#2C7FFF]">{app.job_title}</span></p>
                <p className={`text-xs font-medium mt-1 ${subtle}`}>Date: {new Date(app.applied_at).toLocaleDateString()}</p>
              </div>

              <div>
                <button 
                  onClick={() => {
                    setSelectedApp(app);
                    setNextSteps({ isOpen: false, status: '' });
                    setMessageText('');

                    if(app.application_status === 'Pending') {
                        updateStatus(app.application_id, 'Under Review', null, false);
                    }
                  }} 
                  className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer border ${
                    isContrast
                      ? 'bg-black text-[#f4f4f4] border-[#2C7FFF] hover:bg-[#2C7FFF] hover:text-[#f4f4f4]'
                      : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                  }`}
                >
                  View Details
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className={`p-10 text-center font-bold border-2 border-dashed rounded-3xl ${
            isContrast 
              ? 'text-[#f4f4f4]/70 border-[#2C7FFF]/40 bg-black' 
              : 'text-[#03045E]/70 border-[#03045E]/20 bg-[#f4f4f4]'
          }`}>
            No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} applications found.
          </div>
        )}
      </div>

      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`p-8 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col transition-all border shadow-2xl ${
            isContrast ? 'bg-black border-[#2C7FFF] text-[#f4f4f4]' : 'bg-white border-[#03045E]/20 text-[#03045E]'
          }`}>
            
            <div className={`flex justify-between items-start mb-6 pb-6 border-b ${dividerColor}`}>
              <div>
                <h2 className={`text-3xl font-extrabold ${pageText}`}>{selectedApp.firstname} {selectedApp.lastname}</h2>
                <p className={`text-base font-semibold mt-1 ${muted}`}>Applying for: <span className="text-[#2C7FFF]">{selectedApp.job_title}</span></p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedApp.application_status)}`}>
                {selectedApp.application_status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider mb-2 ${subtle}`}>Contact Information</h4>
                  <p className={`font-semibold flex items-center gap-2 ${pageText}`}>
                    <svg className="w-4 h-4 text-[#2C7FFF] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{selectedApp.email}</span>
                  </p>
                  <p className={`font-semibold flex items-center gap-2 mt-1.5 ${pageText}`}>
                    <svg className="w-4 h-4 text-[#2C7FFF] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{selectedApp.phone || 'Not provided'}</span>
                  </p>
                </div>
                <div>
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider mb-2 ${subtle}`}>Disability Profile</h4>
                  <p className={`font-semibold p-3.5 rounded-2xl border ${softPanel} ${pageText}`}>
                    {selectedApp.disability_type || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider mb-2 ${subtle}`}>Verified Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.skills ? 
                      (typeof selectedApp.skills === 'string' ? JSON.parse(selectedApp.skills) : selectedApp.skills).map((skill, i) => (
                        <span key={i} className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          isContrast 
                            ? 'bg-[#2C7FFF]/20 text-[#f4f4f4] border-[#2C7FFF]/40' 
                            : 'bg-[#2C7FFF]/10 text-[#03045E] border-[#2C7FFF]/30'
                        }`}>
                          {skill}
                        </span>
                      ))
                    : <span className={`text-sm ${subtle}`}>No skills listed</span>}
                  </div>
                </div>
                <div>
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider mb-2 ${subtle}`}>Requested Accommodations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.accommodations_needed ? 
                      (typeof selectedApp.accommodations_needed === 'string' ? JSON.parse(selectedApp.accommodations_needed) : selectedApp.accommodations_needed).map((acc, i) => (
                        <span key={i} className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          isContrast 
                            ? 'bg-black text-[#f4f4f4] border-[#2C7FFF]/40' 
                            : 'bg-[#03045E]/10 text-[#03045E] border-[#03045E]/20'
                        }`}>
                          {acc}
                        </span>
                      ))
                    : <span className={`text-sm ${subtle}`}>None requested</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className={`mb-8 pt-6 border-t ${dividerColor}`}>
              <h4 className={`text-xs font-extrabold uppercase tracking-wider mb-4 ${subtle}`}>Application Documents</h4>
              
              <div className="flex flex-col gap-5">
                {selectedApp.resume_path ? (
                  <div>
                    <a 
                      href={`http://localhost:5001${selectedApp.resume_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#03045E] text-[#f4f4f4] font-bold rounded-xl hover:bg-[#2C7FFF] transition shadow-sm border border-[#03045E] hover:border-[#2C7FFF]"
                    >
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>View Attached Resume</span>
                    </a>
                  </div>
                ) : (
                  <p className={`text-sm font-semibold p-3 rounded-xl border inline-block ${
                    isContrast 
                      ? 'text-[#f4f4f4] bg-[#03045E] border-[#2C7FFF]' 
                      : 'text-[#03045E] bg-[#f4f4f4] border-[#03045E]/30'
                  }`}>
                    No resume file was attached to this application.
                  </p>
                )}

                {selectedApp.cover_letter && selectedApp.cover_letter.trim() !== '' && (
                  <div className={`p-5 rounded-2xl border ${softPanel}`}>
                    <h5 className={`text-xs font-extrabold uppercase tracking-wider mb-2 ${subtle}`}>Cover Letter / Message</h5>
                    <p className={`text-sm font-medium whitespace-pre-wrap leading-relaxed ${pageText}`}>
                      {selectedApp.cover_letter}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={`mt-auto pt-6 border-t w-full ${dividerColor}`}>
              {nextSteps.isOpen ? (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <label className={`text-sm font-bold ${pageText}`}>
                    Provide Next Steps for the Applicant (for {nextSteps.status} status)
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="e.g., We would love to invite you for an interview on Monday at 10 AM. Here is the Google Meet link..."
                    className={`w-full p-4 border-2 rounded-2xl outline-none min-h-[100px] text-sm resize-none font-semibold transition ${
                      isContrast 
                        ? 'border-[#2C7FFF]/60 bg-black focus:border-[#2C7FFF] text-[#f4f4f4] placeholder-[#f4f4f4]/40' 
                        : 'border-[#03045E]/20 bg-[#f4f4f4] focus:border-[#2C7FFF] focus:bg-white text-[#03045E] placeholder-[#03045E]/40'
                    }`}
                  />
                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      onClick={() => { setNextSteps({ isOpen: false, status: '' }); setMessageText(''); }}
                      className={`px-6 py-2.5 font-bold rounded-xl transition cursor-pointer border ${
                        isContrast 
                          ? 'bg-black text-[#f4f4f4] border-[#2C7FFF]/40 hover:bg-[#2C7FFF]/20' 
                          : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20 hover:bg-[#03045E]/10'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => updateStatus(selectedApp.application_id, nextSteps.status, messageText, true, true)}
                      className="px-6 py-2.5 bg-[#2C7FFF] text-[#f4f4f4] font-bold rounded-xl hover:bg-[#03045E] transition shadow-md cursor-pointer border border-[#2C7FFF] hover:border-[#03045E]"
                    >
                      Confirm & Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center w-full">
                  <button 
                    onClick={() => setSelectedApp(null)} 
                    className={`px-6 py-3 font-bold rounded-xl transition cursor-pointer border ${
                      isContrast 
                        ? 'bg-black text-[#f4f4f4] border-[#2C7FFF]/40 hover:bg-[#2C7FFF]/20' 
                        : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20 hover:bg-[#03045E]/10'
                    }`}
                  >
                    Close Window
                  </button>
                  
                  {selectedApp.application_status !== 'Hired' && selectedApp.application_status !== 'Rejected' ? (
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => updateStatus(selectedApp.application_id, 'Rejected', null, true, true)} 
                        className={`px-6 py-3 font-bold rounded-xl transition cursor-pointer border ${
                          isContrast 
                            ? 'bg-[#03045E] text-[#f4f4f4] border-[#f4f4f4]/40 hover:bg-[#f4f4f4] hover:text-[#03045E]' 
                            : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/30 hover:bg-[#03045E] hover:text-[#f4f4f4]'
                        }`}
                      >
                        Reject
                      </button>
                      
                      <button 
                        onClick={() => setNextSteps({ isOpen: true, status: 'Shortlisted' })} 
                        className={`px-6 py-3 font-bold rounded-xl transition cursor-pointer border ${
                          isContrast 
                            ? 'bg-[#2C7FFF]/30 text-[#f4f4f4] border-[#2C7FFF] hover:bg-[#2C7FFF]' 
                            : 'bg-[#2C7FFF]/15 text-[#03045E] border-[#2C7FFF]/40 hover:bg-[#2C7FFF] hover:text-[#f4f4f4]'
                        }`}
                      >
                        Shortlist
                      </button>
                      
                      <button 
                        onClick={() => setNextSteps({ isOpen: true, status: 'Hired' })} 
                        className="px-6 py-3 bg-[#2C7FFF] text-[#f4f4f4] font-bold rounded-xl hover:bg-[#03045E] transition shadow-md cursor-pointer border border-[#2C7FFF] hover:border-[#03045E]"
                      >
                        Hire Applicant
                      </button>
                    </div>
                  ) : (
                    <div className={`px-4 py-2 rounded-xl border ${isContrast ? 'bg-black border-[#2C7FFF]/40' : 'bg-[#f4f4f4] border-[#03045E]/20'}`}>
                      <p className={`text-sm font-bold italic ${pageText}`}>
                        Application finalized as <span className="text-[#2C7FFF]">{selectedApp.application_status}</span>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {showStatusAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#03045E]/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[2rem] shadow-[0_25px_60px_rgba(3,4,94,0.4)] border-2 overflow-hidden animate-in zoom-in-95 duration-300 ${
            isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-[#f4f4f4] border-[#2C7FFF]'
          }`}>
            <div className="h-2 w-full bg-gradient-to-r from-[#03045E] via-[#2C7FFF] to-[#03045E]" />

            <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-[#2C7FFF]/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                  <div className={`w-14 h-14 rounded-full ${getAlertBadgeStyle(statusAlert.tone)} flex items-center justify-center shadow-[0_10px_30px_rgba(44,127,255,0.5)]`}>
                    {renderAlertIcon(statusAlert.tone)}
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#03045E] flex items-center justify-center border-2 border-[#f4f4f4]">
                  <svg className="w-3.5 h-3.5 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <span className="inline-block px-3 py-1 rounded-full bg-[#2C7FFF]/15 text-[#2C7FFF] text-[10px] font-black uppercase tracking-widest mb-3">
                {getAlertPillLabel(statusAlert.tone)}
              </span>

              <h2 className={`text-2xl font-black tracking-tight mb-2 ${isContrast ? 'text-[#f4f4f4]' : 'text-[#03045E]'}`}>
                {statusAlert.title}
              </h2>
              <p className={`text-sm font-semibold leading-relaxed mb-6 max-w-xs ${isContrast ? 'text-[#f4f4f4]/80' : 'text-[#03045E]/75'}`}>
                {statusAlert.subtitle}
              </p>

              <button
                onClick={() => setShowStatusAlert(false)}
                className="w-full py-3.5 rounded-2xl bg-[#03045E] text-[#f4f4f4] font-black text-sm uppercase tracking-wider shadow-md hover:bg-[#2C7FFF] hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-[#03045E] hover:border-[#2C7FFF]"
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