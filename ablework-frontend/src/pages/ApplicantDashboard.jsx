import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';

export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const { mode } = useContext(AccessibilityContext);
  const [activeTab, setActiveTab] = useState('matches');

  // --- DATA STATES ---
  const [profile, setProfile] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  
  // --- MODAL STATE ---
  const [selectedJob, setSelectedJob] = useState(null); // Tracks the job opened in the modal
  
  const [isLoading, setIsLoading] = useState(true);
  const [isMatchesLoading, setIsMatchesLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');

  // Dynamic Styling
  const isHighContrast = mode === 'High Contrast';
  const bgPrimary = isHighContrast ? 'bg-black text-white' : 'bg-[#f4f4f4] text-[#03045E]';
  const bgCard = isHighContrast ? 'bg-gray-900 border-yellow-400 border-2 text-white' : 'bg-white shadow-xl border border-[#03045E]/10';
  const btnPrimary = isHighContrast ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'bg-[#03045E] text-white hover:bg-[#2C7FFF]';

  // --- FETCH REAL DATA ---
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (!storedUser || !storedUser.id) {
      navigate('/');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const profileRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/profile`);
        const profileData = await profileRes.json();
        if (profileRes.ok) setProfile({ ...profileData, user_id: storedUser.id });

        const matchesRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/matches`);
        const matchesData = await matchesRes.json();
        if (matchesRes.ok) setMatchedJobs(matchesData);

        const appsRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/applications`);
        const appsData = await appsRes.json();
        if (appsRes.ok) setApplications(appsData);

      } catch (err) {
        setError('Cannot connect to the server.');
      } finally {
        setIsLoading(false);
        setIsMatchesLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // --- HANDLE JOB APPLICATION ---
  const handleApply = async (jobId) => {
    if (!profile || !profile.user_id) return;
    setIsApplying(true);

    try {
      const response = await fetch('http://localhost:5001/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicant_id: profile.user_id, job_id: jobId })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("Success! Your application has been submitted.");
        // Refresh tracker
        const appsRes = await fetch(`http://localhost:5001/api/applicant/${profile.user_id}/applications`);
        const appsData = await appsRes.json();
        if (appsRes.ok) setApplications(appsData);
      } else {
        alert(data.message || "Failed to apply.");
      }
    } catch (err) {
      alert("Server error while applying.");
    } finally {
      setIsApplying(false);
    }
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return 'N/A';
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  // UI FILTERING RULE: Archived items disappear from the tracker UI
  const activeApplications = applications.filter(app => app.status !== 'archived');

  if (isLoading) return <div className={`min-h-screen flex items-center justify-center font-bold text-xl ${bgPrimary}`}>Loading your accessible workspace...</div>;
  if (error) return <div className={`min-h-screen flex items-center justify-center font-bold text-red-500 ${bgPrimary}`}>{error}</div>;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row pt-16 md:pt-0 ${bgPrimary}`}>
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className={`w-full md:w-72 flex flex-col shadow-xl z-10 ${isHighContrast ? 'bg-gray-950 border-r-2 border-yellow-400' : 'bg-white border-r border-[#03045E]/10'}`}>
        <div className="p-6 border-b border-[#03045E]/10 hidden md:block">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#03045E]">AbleWork</h2>
          <p className="text-sm mt-1 text-[#03045E]/70 font-semibold">Applicant Dashboard</p>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          {['matches', 'profile', 'tracker', 'documents'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`text-left p-4 rounded-xl font-bold transition capitalize ${
                activeTab === tab 
                  ? (isHighContrast ? 'bg-yellow-400 text-black' : 'bg-[#03045E] text-white shadow-md') 
                  : (isHighContrast ? 'hover:bg-white/10' : 'text-[#03045E] hover:bg-[#2C7FFF]/10')
              }`}
            >
              {tab === 'matches' && '✨ Smart Matches'}
              {tab === 'profile' && '👤 My Profile'}
              {tab === 'tracker' && '📊 Application Tracker'}
              {tab === 'documents' && '📁 My Documents'}
            </button>
          ))}
        </nav>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative">
        
        {/* --- VIEW: SMART MATCHES --- */}
        {activeTab === 'matches' && (
          <div className="animate-fadeIn max-w-5xl">
            <h1 className="text-3xl font-extrabold mb-2">Smart Matches</h1>
            <p className="opacity-70 font-medium mb-8">Jobs filtered dynamically by your verified skills and required accommodations.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {matchedJobs.length > 0 ? (
                matchedJobs.map((job) => (
                  <div key={job.id} className={`p-6 rounded-2xl relative overflow-hidden ${bgCard}`}>
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm">
                      {job.match_percentage}% Match
                    </div>
                    <h3 className="text-xl font-bold mb-1 mt-2">{job.job_title}</h3>
                    <p className="opacity-70 font-semibold mb-4">{job.company_name} • {job.distance_km} km away</p>
                    
                    <div className="mb-6 bg-green-500/5 p-4 rounded-xl border border-green-500/20">
                      <p className="text-sm font-bold mb-2 text-green-700">Compatibility Badges:</p>
                      <ul className="flex flex-col gap-2">
                        <li className="flex items-center gap-2 text-sm font-semibold text-[#03045E]">✅ Matches {job.matching_skills_count} of your verified skills</li>
                        <li className="flex items-center gap-2 text-sm font-semibold text-[#03045E]">✅ Accessible: Provides required accommodations</li>
                        <li className="flex items-center gap-2 text-sm font-semibold text-[#03045E]">✅ Within your {profile.travel_radius_km}km travel radius</li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => setSelectedJob(job)}
                        className={`flex-1 font-bold py-3.5 rounded-xl border-2 transition ${isHighContrast ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/10' : 'border-[#2C7FFF] text-[#2C7FFF] hover:bg-[#2C7FFF]/10'}`}
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleApply(job.id)}
                        disabled={isApplying}
                        className={`px-6 py-3.5 font-bold rounded-xl transition shadow-md disabled:opacity-50 ${btnPrimary}`}
                      >
                        {isApplying ? '...' : 'Apply'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-10 text-center opacity-70 font-bold border-2 border-dashed border-[#03045E]/20 rounded-2xl">
                  {isMatchesLoading ? "Running smart matching algorithm..." : "No jobs currently match your specific accessibility needs and travel radius."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: MY PROFILE (STRICT TWO-COLUMN LAYOUT) --- */}
        {activeTab === 'profile' && profile && (
          <div className="animate-fadeIn max-w-5xl">
            <h1 className="text-3xl font-extrabold mb-8">My Profile</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Column: Identity & Status */}
              <div className={`p-8 rounded-3xl flex flex-col gap-6 ${bgCard}`}>
                <h2 className="text-xl font-extrabold border-b border-[#03045E]/10 pb-3">Identity & Status</h2>
                <div><p className="text-sm font-bold opacity-60 uppercase tracking-wider mb-1">Full Name</p><p className="text-lg font-bold">{profile.firstname} {profile.middlename ? profile.middlename + ' ' : ''}{profile.lastname}</p></div>
                <div><p className="text-sm font-bold opacity-60 uppercase tracking-wider mb-1">Age</p><p className="text-lg font-bold">{calculateAge(profile.birthdate)} years old</p></div>
                <div>
                  <p className="text-sm font-bold opacity-60 uppercase tracking-wider mb-2">Verification Status</p>
                  <span className={`inline-block font-bold px-4 py-1.5 rounded-full text-sm ${profile.verification_status === 'Verified' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-yellow-100 text-yellow-800 border border-yellow-300'}`}>
                    {profile.verification_status === 'Verified' ? '✓ Verified' : '⏳ Pending Review'}
                  </span>
                </div>
                <div className="pt-4 border-t border-[#03045E]/10"><p className="text-sm font-bold opacity-60 uppercase tracking-wider mb-1">Disability Type</p><p className="text-lg font-bold">{profile.disability_type}</p></div>
                <div><p className="text-sm font-bold opacity-60 uppercase tracking-wider mb-1">Workplace Independence</p><p className="text-lg font-bold">{profile.workplace_independence}</p></div>
              </div>

              {/* Right Column: Matching Parameters */}
              <div className="flex flex-col gap-8">
                <div className={`p-8 rounded-3xl flex flex-col gap-4 ${bgCard}`}>
                  <h2 className="text-xl font-extrabold border-b border-[#03045E]/10 pb-3">Verified Skills</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.skills && profile.skills.length > 0 ? profile.skills.map((skill, index) => (
                      <span key={index} className={`px-4 py-2 rounded-full font-bold text-sm shadow-sm ${isHighContrast ? 'bg-yellow-400 text-black' : 'bg-[#2C7FFF]/10 text-[#03045E] border border-[#2C7FFF]/30'}`}>{skill}</span>
                    )) : <p className="opacity-60 font-semibold italic text-sm">No skills added yet.</p>}
                  </div>
                </div>
                <div className={`p-8 rounded-3xl flex flex-col gap-4 ${bgCard}`}>
                  <h2 className="text-xl font-extrabold border-b border-[#03045E]/10 pb-3">Required Accommodations</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.accommodations && profile.accommodations.length > 0 ? profile.accommodations.map((acc, index) => (
                      <span key={index} className={`px-4 py-2 rounded-full font-bold text-sm shadow-sm ${isHighContrast ? 'bg-white text-black' : 'bg-purple-100 text-purple-900 border border-purple-300'}`}>{acc}</span>
                    )) : <p className="opacity-60 font-semibold italic text-sm">No accommodations requested.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: APPLICATION TRACKER --- */}
        {activeTab === 'tracker' && (
          <div className="animate-fadeIn max-w-4xl">
            <h1 className="text-3xl font-extrabold mb-2">Application Tracker</h1>
            <p className="opacity-70 font-medium mb-8">Manage your active job applications. Archived items are hidden automatically.</p>
            
            <div className={`rounded-3xl overflow-hidden ${bgCard}`}>
              {activeApplications.length > 0 ? (
                <ul className="divide-y divide-[#03045E]/10">
                  {activeApplications.map(app => (
                    <li key={app.application_id} className="p-6 flex justify-between items-center hover:bg-[#03045E]/5 transition cursor-pointer">
                      <div>
                        <h3 className="text-lg font-extrabold text-[#03045E]">{app.job_title}</h3>
                        <p className="opacity-70 font-semibold text-sm mt-1">{app.company_name}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border ${
                        app.status === 'Interviewing' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-blue-100 text-blue-800 border-blue-300'
                      }`}>
                        {app.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-10 text-center opacity-70 font-bold">You have no active applications right now.</div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: DOCUMENTS --- */}
        {activeTab === 'documents' && (
          <div className="animate-fadeIn max-w-4xl">
            <h1 className="text-3xl font-extrabold mb-8">My Documents</h1>
            <div className={`p-12 rounded-3xl text-center border-dashed border-4 flex flex-col items-center ${bgCard} ${isHighContrast ? 'border-yellow-400' : 'border-[#2C7FFF]/30 bg-[#2C7FFF]/5'}`}>
              <span className="text-5xl mb-4 block">📄</span>
              <h3 className="text-xl font-extrabold mb-2 text-[#03045E]">Upload Updated Certificates</h3>
              <p className="opacity-70 font-semibold mb-8 max-w-md text-sm">Keep your credentials up to date for admins to verify. Only PDF, JPG, or PNG files are accepted.</p>
              <button className={`font-bold py-3.5 px-8 rounded-full shadow-md transition text-sm ${btnPrimary}`}>Browse Files</button>
            </div>
          </div>
        )}

        {/* --- JOB DETAILS MODAL --- */}
        {selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className={`w-full max-w-2xl p-8 rounded-3xl shadow-2xl relative flex flex-col max-h-[85vh] ${bgCard}`}>
              
              <button 
                onClick={() => setSelectedJob(null)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition text-lg"
              >
                ✕
              </button>

              <div className="overflow-y-auto pr-2">
                <h2 className="text-3xl font-extrabold mb-1">{selectedJob.job_title}</h2>
                <p className="opacity-70 font-bold text-lg mb-6">{selectedJob.company_name} • {selectedJob.distance_km} km away</p>
                
                <h3 className={`text-xl font-bold mb-2 border-b pb-2 ${isHighContrast ? 'border-yellow-400/30' : 'border-[#03045E]/10'}`}>
                  Job Description
                </h3>
                <p className="leading-relaxed opacity-90 mb-6 whitespace-pre-wrap">
                  {selectedJob.job_description || "No description provided."}
                </p>

                <h3 className={`text-xl font-bold mb-4 border-b pb-2 ${isHighContrast ? 'border-yellow-400/30' : 'border-[#03045E]/10'}`}>
                  Accessibility & Requirements Breakdown
                </h3>
                
                {/* --- DYNAMIC DETAILED BREAKDOWN --- */}
                {(() => {
                  // Safely parse the job's arrays
                  const reqSkills = typeof selectedJob.required_skills === 'string' 
                    ? JSON.parse(selectedJob.required_skills || '[]') 
                    : (selectedJob.required_skills || []);
                  
                  const provAccoms = typeof selectedJob.provided_accommodations === 'string' 
                    ? JSON.parse(selectedJob.provided_accommodations || '[]') 
                    : (selectedJob.provided_accommodations || []);
                  
                  // Compare job requirements against the applicant's profile
                  const matchedSkills = reqSkills.filter(s => profile?.skills?.includes(s));
                  const missingSkills = reqSkills.filter(s => !profile?.skills?.includes(s));

                  return (
                    <div className="flex flex-col gap-6 mb-8">
                      
                      {/* Skill Breakdown */}
                      <div>
                        <h4 className={`font-bold mb-3 flex items-center gap-2 ${isHighContrast ? 'text-yellow-400' : 'text-[#03045E]'}`}>
                          <span className="text-xl">🎯</span> Skills ({matchedSkills.length}/{reqSkills.length} Matched)
                        </h4>
                        
                        {matchedSkills.length > 0 && (
                          <div className="mb-3">
                            <p className={`text-sm font-semibold mb-1 ${isHighContrast ? 'text-green-400' : 'text-green-700'}`}>
                              ✓ Verified Matches:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {matchedSkills.map(skill => (
                                <span key={skill} className={`px-3 py-1 text-xs font-bold rounded-full border ${isHighContrast ? 'bg-green-900 border-green-500 text-green-300' : 'bg-green-100 border-green-400 text-green-800'}`}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {missingSkills.length > 0 && (
                          <div>
                            <p className={`text-sm font-semibold mb-1 ${isHighContrast ? 'text-red-400' : 'text-red-700'}`}>
                              ✕ Missing Requirements:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {missingSkills.map(skill => (
                                <span key={skill} className={`px-3 py-1 text-xs font-bold rounded-full border ${isHighContrast ? 'bg-red-900 border-red-500 text-red-300' : 'bg-red-100 border-red-300 text-red-800'}`}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Accommodations Breakdown */}
                      <div>
                        <h4 className={`font-bold mb-2 flex items-center gap-2 ${isHighContrast ? 'text-yellow-400' : 'text-[#03045E]'}`}>
                          <span className="text-xl">♿</span> Guaranteed Accommodations
                        </h4>
                        <p className={`text-sm font-semibold mb-3 ${isHighContrast ? 'text-blue-400' : 'text-blue-800'}`}>
                          This employer provides the following workplace aids:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {provAccoms.length > 0 ? provAccoms.map(acc => (
                            <span key={acc} className={`px-3 py-1 text-xs font-bold rounded-full border ${isHighContrast ? 'bg-blue-900 border-blue-500 text-blue-300' : 'bg-blue-100 border-blue-300 text-blue-800'}`}>
                              {acc}
                            </span>
                          )) : (
                            <span className="text-sm opacity-60 italic">No specific accommodations listed.</span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })()}
              </div>

              <div className={`mt-auto pt-6 border-t ${isHighContrast ? 'border-yellow-400/30' : 'border-[#03045E]/10'}`}>
                <button 
                  onClick={() => {
                    handleApply(selectedJob.id);
                    setSelectedJob(null); 
                  }}
                  disabled={isApplying}
                  className={`w-full py-4 font-bold text-lg rounded-xl transition shadow-md disabled:opacity-50 ${btnPrimary}`}
                >
                  {isApplying ? 'Submitting Application...' : 'Apply for this Position'}
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}