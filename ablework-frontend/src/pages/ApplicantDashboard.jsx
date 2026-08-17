import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import all child components
import ApplicantOverview from '../components/Applicant/ApplicantOverview';
import ApplicantSmartMatches from '../components/Applicant/ApplicantSmartMatches';
import ApplicantJobTracker from '../components/Applicant/ApplicantJobTracker';
import ApplicantProfile from '../components/Applicant/ApplicantProfile';
import ApplicantAccountSettings from '../components/Applicant/ApplicantAccountSettings';
import ApplicantExploreJobs from '../components/Applicant/ApplicantExploreJobs'; // <-- NEW IMPORT

export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Shared Data States
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [allJobs, setAllJobs] = useState([]); // <-- NEW STATE FOR ALL JOBS
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.id) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch Profile
        const profileRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/profile`);
        const profileData = await profileRes.json();
        if (profileRes.ok) setProfile({ ...profileData, user_id: storedUser.id });

        // 2. Fetch Smart Matches
        const matchesRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/matches`);
        const matchesData = await matchesRes.json();
        if (matchesRes.ok) setMatches(matchesData);

        // 3. Fetch Job Tracker (Application History)
        const trackerRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/applications`);
        const trackerData = await trackerRes.json();
        if (trackerRes.ok) setApplications(trackerData);

        // 4. Fetch ALL Active Jobs for the Explore Tab
        const allJobsRes = await fetch('http://localhost:5001/api/jobs');
        const allJobsData = await allJobsRes.json();
        if (allJobsRes.ok) setAllJobs(allJobsData);

      } catch (err) {
        setError('Cannot connect to the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Function to refresh data after an action (like applying for a job)
  const refreshData = async () => {
    if(!profile) return;
    try {
      const matchesRes = await fetch(`http://localhost:5001/api/applicant/${profile.user_id}/matches`);
      if (matchesRes.ok) setMatches(await matchesRes.json());
      
      const trackerRes = await fetch(`http://localhost:5001/api/applicant/${profile.user_id}/applications`);
      if (trackerRes.ok) setApplications(await trackerRes.json());
    } catch(err) {
      console.error("Failed to refresh data", err);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#03045E]">Loading Applicant Workspace...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row pt-16 md:pt-0 bg-[#f4f4f4]">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 flex flex-col shadow-xl z-10 bg-white border-r border-[#03045E]/10">
        <div className="p-6 border-b border-[#03045E]/10 hidden md:block">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#03045E]">AbleWork</h2>
          <p className="text-sm mt-1 text-[#03045E]/70 font-semibold">Applicant Portal</p>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          {/* Added 'explore-jobs' to the navigation array */}
          {['overview', 'matches', 'explore-jobs', 'tracker', 'settings'].map((tab) => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)} 
              className={`text-left p-4 rounded-xl font-bold transition capitalize ${
                activeTab === tab ? 'bg-[#03045E] text-white shadow-md' : 'text-[#03045E] hover:bg-[#2C7FFF]/10'
              }`}
            >
              {tab === 'overview' && '🏠 Dashboard Overview'}
              {tab === 'matches' && '🎯 Smart Matches'}
              {tab === 'explore-jobs' && '🌍 Explore All Jobs'}
              {tab === 'tracker' && '📋 My Job Tracker'}
              {tab === 'settings' && '⚙️ Account Settings'}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative">
        {activeTab === 'overview' && profile && (
          <ApplicantOverview profile={profile} matchesCount={matches.length} applications={applications} setActiveTab={setActiveTab} />
        )}
        
        {activeTab === 'matches' && profile && (
          <ApplicantSmartMatches profile={profile} matches={matches} refreshData={refreshData} />
        )}

        {/* --- NEW EXPLORE JOBS ROUTE --- */}
        {activeTab === 'explore-jobs' && profile && (
          <ApplicantExploreJobs profile={profile} jobs={allJobs} refreshData={refreshData} />
        )}
        
        {activeTab === 'tracker' && (
          <ApplicantJobTracker applications={applications} />
        )}
        
        {activeTab === 'profile' && profile && (
          <ApplicantProfile profile={profile} refreshData={refreshData} />
        )}
        
        {activeTab === 'settings' && profile && (
          <ApplicantAccountSettings profile={profile} />
        )}
      </main>
      
    </div>
  );
}