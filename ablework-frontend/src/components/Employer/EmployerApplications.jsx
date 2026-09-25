import React, { useState, useEffect, useContext } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';

export default function EmployerApplications({ profile, refreshStats }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isDark = isContrast || isDarkMode;

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
    switch (status) {
      case 'Pending': return 'bg-[#F4F4F4] text-[#03045E] border-2 border-[#03045E]';
      case 'Under Review': return 'bg-[#2C7FFF]/15 text-[#03045E] border-2 border-[#2C7FFF]';
      case 'Shortlisted': return 'bg-[#2C7FFF] text-[#F4F4F4] border-2 border-[#2C7FFF]';
      case 'Hired': return 'bg-[#03045E] text-[#22c55e] border-2 border-[#03045E]';
      case 'Rejected': return 'bg-[#F4F4F4] text-[#FF0000] border-2 border-[#03045E] line-through';
      default: return 'bg-[#F4F4F4] text-[#03045E] border-2 border-[#03045E]';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'All') return true;
    return app.application_status === activeTab;
  });

  const tabs = ['All', 'Pending', 'Under Review', 'Shortlisted', 'Hired', 'Rejected'];

  const pageText = isDark ? 'text-white' : 'text-[#03045E]';
  const panelBg = isDark ? 'bg-black border-[#2C7FFF]' : 'bg-[#F4F4F4] border-[#03045E]';
  const cardBg = isDark ? 'bg-black border-[#2C7FFF]' : 'bg-[#F4F4F4] border-[#03045E]';
  const softPanel = isDark ? 'bg-zinc-900 border-[#2C7FFF]' : 'bg-[#F4F4F4] border-[#03045E]';
  const muted = isDark ? 'text-white/80' : 'text-[#03045E]/80';
  const subtle = isDark ? 'text-white/60' : 'text-[#03045E]/60';
  const dividerColor = isDark ? 'border-[#2C7FFF]' : 'border-[#03045E]';

  const renderAlertIcon = (tone) => {
    if (tone === 'rejected') {
      return (
        <svg className="w-8 h-8 text-[#F4F4F4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    if (tone === 'shortlisted') {
      return (
        <svg className="w-8 h-8 text-[#F4F4F4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-[#F4F4F4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  const getAlertBadgeStyle = (tone) => {
    if (tone === 'rejected') return 'bg-[#03045E]';
    if (tone === 'hired') return 'bg-[#03045E]';
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
      <div className={`relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-6 sm:p-8 rounded-3xl border-2 ${panelBg}`}>
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2C7FFF]"></div>
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${isDark ? 'bg-[#2C7FFF]/10' : 'bg-[#2C7FFF]/10'}`}></div>
        <div className={`absolute -bottom-20 right-20 w-40 h-40 rounded-full ${isDark ? 'bg-[#2C7FFF]/5' : 'bg-[#03045E]/5'}`}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border-2 ${isDark ? 'text-white bg-black border-[#2C7FFF]' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>Candidate Hub</span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 border-2 ${isDark ? 'text-white bg-black border-[#2C7FFF]' : 'text-[#03045E] bg-white border-[#03045E]'}`}>
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse"></span>
              Active Pipeline
            </span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${pageText}`}>Review Applicants</h1>
          <p className={`text-sm font-bold mt-2 max-w-xl ${muted}`}>Manage incoming applications, review qualifications, and update recruitment statuses.</p>
        </div>
      </div>
      
      <div className={`flex gap-2 overflow-x-auto pb-4 mb-6 border-b-2 scrollbar-hide ${dividerColor}`}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-black rounded-xl whitespace-nowrap transition-all cursor-pointer border-2 ${
              activeTab === tab
                ? 'bg-[#2C7FFF] text-white border-[#2C7FFF]'
                : isDark
                  ? 'bg-black text-white border-[#2C7FFF]/40 hover:border-[#2C7FFF]'
                  : 'bg-white text-[#03045E] border-[#03045E] hover:bg-[#F4F4F4]'
            }`}
          >
            {tab}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === tab 
                ? 'bg-white text-[#2C7FFF]' 
                : isDark
                  ? 'bg-[#2C7FFF]/20 text-[#2C7FFF]'
                  : 'bg-[#03045E] text-white'
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
            <div key={app.application_id} className={`relative overflow-hidden p-6 rounded-3xl border-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${cardBg} ${isDark ? 'hover:border-[#2C7FFF]' : 'hover:border-[#2C7FFF]'}`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-[#2C7FFF]"></div>

              <div className="flex-1 pl-3">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className={`text-xl font-black ${pageText}`}>{app.firstname} {app.lastname}</h3>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${getStatusColor(app.application_status)}`}>
                    {app.application_status}
                  </span>
                </div>
                <p className={`text-sm font-bold ${muted}`}>Applied for: <span className="text-[#2C7FFF]">{app.job_title}</span></p>
                <p className={`text-xs font-bold mt-1 ${subtle}`}>Date: {new Date(app.applied_at).toLocaleDateString()}</p>
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
                  className="px-6 py-3 text-sm font-black rounded-xl transition-all cursor-pointer border-2 border-[var(--color-primary,#2C7FFF)] hover:opacity-90"
                  style={{
                    color: 'var(--color-text, #03045E)',
                    backgroundColor: 'var(--color-card, #ffffff)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary, #2C7FFF)';
                    e.currentTarget.style.color = 'var(--color-button-text, #ffffff)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-card, #ffffff)';
                    e.currentTarget.style.color = 'var(--color-text, #03045E)';
                  }}
                >
                  View Details
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className={`p-10 text-center font-black border-2 border-dashed rounded-3xl ${isDark ? 'text-white/70 border-[#2C7FFF] bg-black' : 'text-[#03045E]/70 border-[#03045E] bg-[#F4F4F4]'}`}>
            No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} applications found.
          </div>
        )}
      </div>

      {selectedApp && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col border-2 ${isDark ? 'bg-black border-[#2C7FFF] text-white' : 'bg-white border-[#03045E] text-[#03045E]'}`}>
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2C7FFF]"></div>

            <div className={`relative px-8 pt-8 pb-6 border-b-2 pl-10 ${dividerColor}`}>
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 border-2 ${isDark ? 'bg-[#2C7FFF] text-black border-[#2C7FFF]' : 'bg-[#03045E] text-white border-[#03045E]'}`}>
                    {(selectedApp.firstname?.[0] || '').toUpperCase()}{(selectedApp.lastname?.[0] || '').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className={`text-2xl sm:text-3xl font-black tracking-tight truncate ${pageText}`}>
                      {selectedApp.firstname} {selectedApp.lastname}
                    </h2>
                    <p className={`text-sm font-bold mt-0.5 ${muted}`}>
                      Applying for: <span className="text-[#2C7FFF]">{selectedApp.job_title}</span>
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shrink-0 ${getStatusColor(selectedApp.application_status)}`}>
                  {selectedApp.application_status}
                </span>
              </div>
            </div>

            <div className="px-8 py-6 flex flex-col gap-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-5 rounded-2xl border-2 ${softPanel}`}>
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] mb-4 ${subtle}`}>Contact Information</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-[#2C7FFF]/20' : 'bg-[#2C7FFF]/15'}`}>
                        <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className={`text-sm font-bold truncate ${pageText}`}>{selectedApp.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-[#2C7FFF]/20' : 'bg-[#2C7FFF]/15'}`}>
                        <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className={`text-sm font-bold ${pageText}`}>{selectedApp.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border-2 ${softPanel}`}>
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] mb-4 ${subtle}`}>Disability Profile</h4>
                  <p className={`text-sm font-bold ${pageText}`}>
                    {selectedApp.disability_type || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-5 rounded-2xl border-2 ${softPanel}`}>
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] mb-4 ${subtle}`}>Verified Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.skills ? 
                      (typeof selectedApp.skills === 'string' ? JSON.parse(selectedApp.skills) : selectedApp.skills).map((skill, i) => (
                        <span key={i} className="px-3 py-1 text-xs font-black rounded-lg border-2 bg-[#2C7FFF] text-white border-[#2C7FFF]">
                          {skill}
                        </span>
                      ))
                    : <span className={`text-sm ${subtle}`}>No skills listed</span>}
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border-2 ${softPanel}`}>
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] mb-4 ${subtle}`}>Requested Accommodations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.accommodations_needed ? 
                      (typeof selectedApp.accommodations_needed === 'string' ? JSON.parse(selectedApp.accommodations_needed) : selectedApp.accommodations_needed).map((acc, i) => (
                        <span key={i} className={`px-3 py-1 text-xs font-black rounded-lg border-2 ${isDark ? 'bg-black text-white border-[#2C7FFF]' : 'bg-[#F4F4F4] text-[#03045E] border-[#03045E]'}`}>
                          {acc}
                        </span>
                      ))
                    : <span className={`text-sm ${subtle}`}>None requested</span>}
                  </div>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border-2 ${softPanel}`}>
                <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] mb-4 ${subtle}`}>Application Documents</h4>
                
                <div className="flex flex-col gap-4">
                  {selectedApp.resume_path ? (
                    <a 
                      href={`http://localhost:5001${selectedApp.resume_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-5 py-3 font-black rounded-xl transition border-2 self-start ${isDark ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] hover:bg-white hover:text-[#03045E]' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
                    >
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>View Attached Resume</span>
                    </a>
                  ) : (
                    <p className={`text-sm font-bold p-3 rounded-xl border-2 inline-block self-start ${isDark ? 'text-white/70 bg-black border-[#2C7FFF]/40' : 'text-[#03045E]/70 bg-[#F4F4F4] border-[#03045E]/40'}`}>
                      No resume file was attached to this application.
                    </p>
                  )}

                  {selectedApp.cover_letter && selectedApp.cover_letter.trim() !== '' && (
                    <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-black border-[#2C7FFF]/40' : 'bg-white border-[#03045E]/30'}`}>
                      <h5 className={`text-[10px] font-black uppercase tracking-[0.15em] mb-2 ${subtle}`}>Cover Letter / Message</h5>
                      <p className={`text-sm font-semibold whitespace-pre-wrap leading-relaxed ${pageText}`}>
                        {selectedApp.cover_letter}
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className={`px-8 py-6 border-t-2 w-full ${dividerColor}`}>
              {nextSteps.isOpen ? (
                <div className="flex flex-col gap-3">
                  <label className={`text-sm font-black ${pageText}`}>
                    Provide Next Steps for the Applicant (for {nextSteps.status} status)
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="e.g., We would love to invite you for an interview on Monday at 10 AM. Here is the Google Meet link..."
                    className={`w-full p-4 border-2 rounded-2xl outline-none min-h-[100px] text-sm resize-none font-semibold transition ${isDark ? 'border-[#2C7FFF] bg-zinc-900 focus:bg-black text-white placeholder-white/40' : 'border-[#03045E] bg-[#F4F4F4] focus:bg-white text-[#03045E] placeholder-[#03045E]/40 focus:border-[#2C7FFF]'}`}
                  />
                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      onClick={() => { setNextSteps({ isOpen: false, status: '' }); setMessageText(''); }}
                      className={`px-6 py-3 font-black rounded-xl transition cursor-pointer border-2 ${isDark ? 'bg-black text-white border-[#2C7FFF] hover:bg-[#2C7FFF] hover:text-black' : 'bg-white text-[#03045E] border-[#03045E] hover:bg-[#F4F4F4]'}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => updateStatus(selectedApp.application_id, nextSteps.status, messageText, true, true)}
                      className={`px-6 py-3 font-black rounded-xl transition cursor-pointer border-2 ${isDark ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] hover:bg-white hover:text-[#03045E]' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
                    >
                      Confirm & Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center w-full flex-wrap gap-3">
                  <button 
                    onClick={() => setSelectedApp(null)} 
                    className={`px-6 py-3 font-black rounded-xl transition cursor-pointer border-2 ${isDark ? 'bg-black text-white border-[#2C7FFF] hover:bg-[#2C7FFF] hover:text-black' : 'bg-white text-[#03045E] border-[#03045E] hover:bg-[#F4F4F4]'}`}
                  >
                    Close Window
                  </button>
                  
                  {selectedApp.application_status !== 'Hired' && selectedApp.application_status !== 'Rejected' ? (
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => updateStatus(selectedApp.application_id, 'Rejected', null, true, true)} 
                        className="px-6 py-3 font-black rounded-xl transition-all cursor-pointer border-2 border-[var(--color-primary,#2C7FFF)] hover:opacity-90"
                        style={{
                          color: 'var(--color-text, #03045E)',
                          backgroundColor: 'var(--color-card, #ffffff)'
                        }}
                      >
                        Reject
                      </button>
                      
                      <button 
                        onClick={() => setNextSteps({ isOpen: true, status: 'Shortlisted' })} 
                        className="px-6 py-3 font-black rounded-xl transition-all cursor-pointer border-2 border-[var(--color-primary,#2C7FFF)] hover:opacity-90"
                        style={{
                          color: 'var(--color-button-text, #ffffff)',
                          backgroundColor: 'var(--color-primary, #2C7FFF)'
                        }}
                      >
                        Shortlist
                      </button>
                      
                      <button 
                        onClick={() => setNextSteps({ isOpen: true, status: 'Hired' })} 
                        className="px-6 py-3 font-black rounded-xl transition-all cursor-pointer border-2 border-[var(--color-primary,#03045E)] hover:opacity-90"
                        style={{
                          color: 'var(--color-button-text, #ffffff)',
                          backgroundColor: 'var(--color-primary, #03045E)'
                        }}
                      >
                        Hire Applicant
                      </button>
                    </div>
                  ) : (
                    <div className={`px-4 py-2 rounded-xl border-2 ${isDark ? 'bg-black border-[#2C7FFF]' : 'bg-[#F4F4F4] border-[#03045E]'}`}>
                      <p className={`text-sm font-black italic ${pageText}`}>
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
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative w-full max-w-sm rounded-[2rem] border-2 overflow-hidden ${isDark ? 'bg-black border-[#2C7FFF]' : 'bg-[#F4F4F4] border-[#2C7FFF]'}`}>
            <div className="h-2 w-full bg-[#2C7FFF]" />

            <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-[#2C7FFF]/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                  <div className={`w-14 h-14 rounded-full ${getAlertBadgeStyle(statusAlert.tone)} flex items-center justify-center`}>
                    {renderAlertIcon(statusAlert.tone)}
                  </div>
                </div>
                <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 ${isDark ? 'bg-[#2C7FFF] border-black' : 'bg-[#03045E] border-[#F4F4F4]'}`}>
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border-2 ${isDark ? 'text-white bg-black border-[#2C7FFF]' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
                {getAlertPillLabel(statusAlert.tone)}
              </span>

              <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                {statusAlert.title}
              </h2>
              <p className={`text-sm font-bold leading-relaxed mb-6 max-w-xs ${muted}`}>
                {statusAlert.subtitle}
              </p>

              <button
                onClick={() => setShowStatusAlert(false)}
                className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition cursor-pointer border-2 ${isDark ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] hover:bg-white hover:text-[#03045E]' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
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