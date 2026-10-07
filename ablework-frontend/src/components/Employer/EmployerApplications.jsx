import React, { useState, useEffect, useContext } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import { useColorPalette } from '../../context/ColorPaletteContext';

export default function EmployerApplications({ profile, refreshStats }) {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isDark = isContrast || isDarkMode;
  const isHighContrastOrDarkComfort = paletteKey === 'highContrast' || paletteKey === 'darkComfort';

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
    if (isHighContrastOrDarkComfort) {
      switch (status) {
        case 'Pending': return 'bg-white text-black border border-white';
        case 'Under Review': return 'bg-white text-black border border-white';
        case 'Shortlisted': return 'bg-white text-black border border-white';
        case 'Hired': return 'bg-white text-emerald-400 border border-emerald-500';
        case 'Rejected': return 'bg-white text-red-600 border border-red-500';
        default: return 'bg-white text-black border border-white';
      }
    }
    if (isDark) {
      switch (status) {
        case 'Pending': return 'bg-black text-white border border-white';
        case 'Under Review': return 'bg-black text-white border border-white';
        case 'Shortlisted': return 'bg-black text-white border border-white';
        case 'Hired': return 'bg-black text-emerald-400 border border-emerald-500';
        case 'Rejected': return 'bg-white text-red-600 border border-red-500';
        default: return 'bg-black text-white border border-white';
      }
    }
    switch (status) {
      case 'Pending': return 'bg-white text-[#03045E] border border-gray-200';
      case 'Under Review': return 'bg-white text-[#03045E] border border-gray-200';
      case 'Shortlisted': return 'bg-white text-[#03045E] border border-gray-200';
      case 'Hired': return 'bg-white text-emerald-700 border border-emerald-500';
      case 'Rejected': return 'bg-white text-red-600 border border-red-500';
      default: return 'bg-white text-[#03045E] border border-gray-200';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'All') return true;
    return app.application_status === activeTab;
  });

  const tabs = ['All', 'Pending', 'Under Review', 'Shortlisted', 'Hired', 'Rejected'];

  const pageText = isDark ? 'text-white' : 'text-[#03045E]';
  const panelBg = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
  const cardBg = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
  const softPanel = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
  const muted = isDark ? 'text-white/80' : 'text-[#03045E]/80';
  const subtle = isDark ? 'text-white/60' : 'text-[#03045E]/60';
  const dividerColor = isDark ? 'border-white' : 'border-gray-200';

  const renderAlertIcon = (tone) => {
    if (tone === 'rejected') {
      return (
        <svg className="w-5 h-5 sm:w-8 sm:h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    if (tone === 'shortlisted') {
      return (
        <svg className="w-5 h-5 sm:w-8 sm:h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 sm:w-8 sm:h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  const getAlertBadgeStyle = (tone) => {
    if (tone === 'rejected') return 'bg-red-500';
    if (tone === 'hired') return 'bg-emerald-500';
    return 'bg-[#2C7FFF]';
  };

  const getAlertPillLabel = (tone) => {
    if (tone === 'hired') return 'Applicant Hired';
    if (tone === 'shortlisted') return 'Applicant Shortlisted';
    if (tone === 'rejected') return 'Applicant Rejected';
    return 'Status Updated';
  };

  if (isLoading) return <div className={`p-6 sm:p-10 font-bold text-sm sm:text-base ${pageText}`}>Loading applicants...</div>;

  return (
    <div className={`animate-fadeIn max-w-7xl mx-auto pb-6 sm:pb-10 relative px-1 sm:px-0 ${pageText}`}>
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 backdrop-blur-md p-4 sm:p-6 rounded-[15px] border-2 ${panelBg}`}>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
            <span className={`text-[10px] sm:text-xs font-extrabold px-2 sm:px-3 py-0.5 sm:py-1 rounded-[15px] uppercase tracking-wider border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#2C7FFF] border-gray-200'}`}>Candidate Hub</span>
            <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-[15px] flex items-center gap-1 sm:gap-1.5 border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-gray-200'}`}>
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'} animate-pulse`}></span> Active Pipeline
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight ${pageText}`}>Review Applicants</h1>
          <p className={`text-xs sm:text-sm font-semibold mt-0.5 ${muted}`}>Manage incoming applications, review qualifications, and update recruitment statuses.</p>
        </div>
      </div>
      
      <div className={`grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-4 p-3 sm:p-6 mb-6 sm:mb-8 rounded-[15px] border-2 ${panelBg}`}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full sm:w-auto sm:flex-1 flex items-center justify-center px-2 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold rounded-[15px] whitespace-nowrap transition-all cursor-pointer border-2 ${
              activeTab === tab
                ? (isHighContrastOrDarkComfort
                    ? (isDark ? 'bg-white text-black border-white' : 'bg-[#2C7FFF] !text-white border-[#2C7FFF]')
                    : isDark
                      ? 'bg-white text-black border-white'
                      : 'bg-[#2C7FFF] text-white border-[#2C7FFF]')
                : (isDark
                  ? 'bg-black text-white/70 border-white/40 hover:bg-white hover:text-black hover:border-white'
                  : 'bg-white text-[#03045E] border-gray-200 hover:bg-gray-100')
            }`}
          >
            <span>{tab}</span>
            <span className={`ml-1 sm:ml-2 min-w-[20px] sm:min-w-[24px] inline-flex items-center justify-center px-1 sm:px-2 py-0.5 rounded-[15px] text-[9px] sm:text-[11px] font-black border-2 ${
              activeTab === tab 
                ? (isDark ? 'bg-black text-white border-black' : 'bg-white text-[#2C7FFF] border-white')
                : (isDark 
                  ? 'bg-white text-black border-white'
                  : 'bg-gray-100 text-[#03045E] border-gray-200')
            }`}>
              {tab === 'All' 
                ? applications.length 
                : applications.filter(a => a.application_status === tab).length}
            </span>
          </button>
        ))}
      </div>
      
      <div className="flex flex-col gap-3 sm:gap-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map(app => (
            <div key={app.application_id} className={`p-4 sm:p-6 rounded-[15px] border-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 ${cardBg}`}>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                  <h3 className={`text-base sm:text-xl font-bold ${pageText}`}>{app.firstname} {app.lastname}</h3>
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-[15px] text-[9px] sm:text-[11px] font-bold uppercase tracking-wider border-2 ${getStatusColor(app.application_status)}`}>
                    {app.application_status}
                  </span>
                </div>
                <p className={`text-xs sm:text-sm font-semibold ${muted}`}>Applied for: <span className={isDark ? 'text-white' : 'text-[#2C7FFF]'}>{app.job_title}</span></p>
                <p className={`text-[10px] sm:text-xs font-medium mt-1 ${subtle}`}>Date: {new Date(app.applied_at).toLocaleDateString()}</p>
              </div>

              <div className="w-full md:w-auto">
                <button 
                  onClick={() => {
                    setSelectedApp(app);
                    setNextSteps({ isOpen: false, status: '' });
                    setMessageText('');

                    if(app.application_status === 'Pending') {
                        updateStatus(app.application_id, 'Under Review', null, false);
                    }
                  }} 
                  className={`w-full md:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-[15px] cursor-pointer border-2 ${
                    isDark
                      ? 'bg-black text-white border-white'
                      : 'bg-white text-[#03045E] border-gray-200'
                  }`}
                >
                  View Details
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className={`p-6 sm:p-10 text-center font-bold border-2 border-dashed rounded-[15px] text-sm sm:text-base ${
            isDark 
              ? 'text-white/70 border-white bg-black' 
              : 'text-[#03045E]/70 border-gray-200 bg-white'
          }`}>
            No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} applications found.
          </div>
        )}
      </div>

      {selectedApp && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`p-4 sm:p-8 rounded-[15px] max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col border-2 ${
            isDark ? 'bg-black border-white text-white' : 'bg-white border-gray-200 text-[#03045E]'
          }`}>
            
            <div className={`flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b-2 ${dividerColor}`}>
              <div>
                <h2 className={`text-xl sm:text-3xl font-extrabold ${pageText}`}>{selectedApp.firstname} {selectedApp.lastname}</h2>
                <p className={`text-xs sm:text-base font-semibold mt-1 ${muted}`}>Applying for: <span className={isDark ? 'text-white' : 'text-[#2C7FFF]'}>{selectedApp.job_title}</span></p>
              </div>
              <span className={`px-3 sm:px-4 py-1 sm:py-2 rounded-[15px] text-[10px] sm:text-sm font-bold border-2 ${getStatusColor(selectedApp.application_status)}`}>
                {selectedApp.application_status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6">
              
              <div className="flex flex-col gap-4 sm:gap-6">
                <div>
                  <h4 className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2 ${subtle}`}>Contact Information</h4>
                  <p className={`text-xs sm:text-base font-semibold flex items-center gap-2 ${pageText}`}>
                    <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="break-all">{selectedApp.email}</span>
                  </p>
                  <p className={`text-xs sm:text-base font-semibold flex items-center gap-2 mt-1.5 ${pageText}`}>
                    <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{selectedApp.phone || 'Not provided'}</span>
                  </p>
                </div>

                <div>
                  <h4 className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2 ${subtle}`}>Disability Profile</h4>
                  <p className={`text-xs sm:text-base font-semibold p-2.5 sm:p-3.5 rounded-[15px] border-2 ${softPanel} ${pageText}`}>
                    {selectedApp.disability_type || 'Not specified'}
                  </p>
                </div>

                <div>
                  <h4 className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-3 sm:mb-4 ${subtle}`}>Application Documents</h4>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {selectedApp.resume_path ? (
                      <a 
                        href={`http://localhost:5001${selectedApp.resume_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-base font-bold rounded-[15px] border-2 ${
                          isDark 
                            ? 'bg-white text-black border-white' 
                            : 'bg-[#03045E] text-white border-[#03045E]'
                        }`}
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>View Attached Resume</span>
                      </a>
                    ) : (
                      <p className={`text-xs sm:text-sm font-semibold p-2.5 sm:p-3 rounded-[15px] border-2 text-center ${
                        isDark 
                          ? 'text-white bg-black border-white' 
                          : 'text-[#03045E] bg-white border-gray-200'
                      }`}>
                        No resume file was attached.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:gap-6">
                <div>
                  <h4 className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2 ${subtle}`}>Verified Skills</h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedApp.skills ? 
                      (typeof selectedApp.skills === 'string' ? JSON.parse(selectedApp.skills) : selectedApp.skills).map((skill, i) => (
                        <span key={i} className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-[15px] border-2 ${
                          isDark 
                            ? 'bg-black text-white border-white' 
                            : 'bg-white text-[#03045E] border-gray-200'
                        }`}>
                          {skill}
                        </span>
                      ))
                    : <span className={`text-xs sm:text-sm ${subtle}`}>No skills listed</span>}
                  </div>
                </div>

                <div>
                  <h4 className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2 ${subtle}`}>Requested Accommodations</h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedApp.accommodations_needed ? 
                      (typeof selectedApp.accommodations_needed === 'string' ? JSON.parse(selectedApp.accommodations_needed) : selectedApp.accommodations_needed).map((acc, i) => (
                        <span key={i} className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-[15px] border-2 ${
                          isDark 
                            ? 'bg-black text-white border-white' 
                            : 'bg-white text-[#03045E] border-gray-200'
                        }`}>
                          {acc}
                        </span>
                      ))
                    : <span className={`text-xs sm:text-sm ${subtle}`}>None requested</span>}
                  </div>
                </div>

                {selectedApp.cover_letter && selectedApp.cover_letter.trim() !== '' && (
                  <div className={`p-3 sm:p-5 rounded-[15px] border-2 ${softPanel}`}>
                    <h5 className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2 ${subtle}`}>Cover Letter / Message</h5>
                    <p className={`text-xs sm:text-sm font-medium whitespace-pre-wrap leading-relaxed ${pageText}`}>
                      {selectedApp.cover_letter}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={`mt-auto pt-4 sm:pt-6 border-t-2 w-full ${dividerColor}`}>
              {nextSteps.isOpen ? (
                <div className="flex flex-col gap-3">
                  <label className={`text-xs sm:text-sm font-bold ${pageText}`}>
                    Provide Next Steps for the Applicant (for {nextSteps.status} status)
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="e.g., We would love to invite you for an interview on Monday at 10 AM. Here is the Google Meet link..."
                    className={`w-full p-3 sm:p-4 border-2 rounded-[15px] outline-none min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm resize-none font-semibold ${
                      isDark 
                        ? 'border-white bg-black text-white placeholder-white/40' 
                        : 'border-gray-200 bg-white text-[#03045E] placeholder-[#03045E]/40'
                    }`}
                  />
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-2">
                    <button
                      onClick={() => { setNextSteps({ isOpen: false, status: '' }); setMessageText(''); }}
                      className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-[15px] cursor-pointer border-2 ${
                        isDark 
                          ? 'bg-black text-white border-white' 
                          : 'bg-white text-[#03045E] border-gray-200'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => updateStatus(selectedApp.application_id, nextSteps.status, messageText, true, true)}
                      className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-[15px] cursor-pointer border-2 ${
                        isDark 
                          ? 'bg-white text-black border-white' 
                          : 'bg-[#03045E] text-white border-[#03045E]'
                      }`}
                    >
                      Confirm & Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-3 sm:gap-0">
                  <button 
                    onClick={() => setSelectedApp(null)} 
                    className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-[15px] cursor-pointer border-2 ${
                      isDark 
                        ? 'bg-black text-white border-white' 
                        : 'bg-white text-[#03045E] border-gray-200'
                    }`}
                  >
                    Close Window
                  </button>
                  
                  {selectedApp.application_status !== 'Hired' && selectedApp.application_status !== 'Rejected' ? (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => updateStatus(selectedApp.application_id, 'Rejected', null, true, true)} 
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-[15px] cursor-pointer border-2 bg-white text-red-600 border-red-500"
                      >
                        Reject
                      </button>
                      
                      <button 
                        onClick={() => setNextSteps({ isOpen: true, status: 'Shortlisted' })} 
                        className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-[15px] cursor-pointer border-2 ${
                          isDark 
                            ? 'bg-black text-white border-white' 
                            : 'bg-white text-[#03045E] border-gray-200'
                        }`}
                      >
                        Shortlist
                      </button>
                      
                      <button 
                        onClick={() => setNextSteps({ isOpen: true, status: 'Hired' })} 
                        className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-[15px] cursor-pointer border-2 ${
                          isDark 
                            ? 'bg-black text-emerald-400 border-emerald-500' 
                            : 'bg-white text-emerald-700 border-emerald-500'
                        }`}
                      >
                        Hire Applicant
                      </button>
                    </div>
                  ) : (
                    <div className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-[15px] border-2 text-center ${isDark ? 'bg-black border-white' : 'bg-white border-gray-200'}`}>
                      <p className={`text-xs sm:text-sm font-bold italic ${pageText}`}>
                        Application finalized as <span className={isDark ? 'text-white' : 'text-[#2C7FFF]'}>{selectedApp.application_status}</span>.
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
          <div className={`relative w-full max-w-md rounded-[15px] shadow-2xl border-2 overflow-hidden animate-in zoom-in-95 duration-300 bg-white ${statusAlert.tone === 'rejected' ? 'border-red-500/30' : 'border-[#2C7FFF]/30'}`}>
            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-7 flex flex-col items-center text-center">
              <div className="relative mb-4 sm:mb-5">
                <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${statusAlert.tone === 'rejected' ? 'bg-red-100' : 'bg-[#2C7FFF]/10'}`}>
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg ${getAlertBadgeStyle(statusAlert.tone)} shadow-black/10`}>
                    {renderAlertIcon(statusAlert.tone)}
                  </div>
                </div>
                <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 bg-[#03045E] border-white`}>
                  <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-[#03045E] tracking-tight mb-2">
                {statusAlert.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#03045E]/70 leading-relaxed mb-4 sm:mb-6">
                {statusAlert.subtitle}
              </p>

              <button
                onClick={() => setShowStatusAlert(false)}
                className={`w-full py-3 sm:py-3.5 rounded-[15px] font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer ${getAlertBadgeStyle(statusAlert.tone)} text-white hover:opacity-90`}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}