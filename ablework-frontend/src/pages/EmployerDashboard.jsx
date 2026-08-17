import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Import all child components
import EmployerOverview from '../components/Employer/EmployerOverview';
import EmployerPostJob from '../components/Employer/EmployerPostJob';
import EmployerMyJobs from '../components/Employer/EmployerMyJobs';
import EmployerApplications from '../components/Employer/EmployerApplications';
import EmployerProfile from '../components/Employer/EmployerProfile';
import EmployerAccountSettings from '../components/Employer/EmployerAccountSettings';

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Shared Data States
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ activeJobs: 0, pendingApps: 0, shortlistedApps: 0, recentActivity: [] });
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
        const profileRes = await fetch(`http://localhost:5001/api/employer/${storedUser.id}/profile`);
        const profileData = await profileRes.json();
        if (profileRes.ok) setProfile({ ...profileData, user_id: storedUser.id });

        const jobsRes = await fetch(`http://localhost:5001/api/employer/${storedUser.id}/jobs`);
        const jobsData = await jobsRes.json();
        if (jobsRes.ok) setJobs(jobsData);

        const statsRes = await fetch(`http://localhost:5001/api/employer/${storedUser.id}/dashboard-stats`);
        const statsData = await statsRes.json();
        if (statsRes.ok) setStats(statsData);

      } catch (err) {
        setError('Cannot connect to the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Function to refresh data after an action (like posting a job or editing a profile)
  const refreshJobsAndStats = async () => {
    if(!profile) return;
    try {
      const profileRes = await fetch(`http://localhost:5001/api/employer/${profile.user_id}/profile`);
      if (profileRes.ok) setProfile({ ...await profileRes.json(), user_id: profile.user_id });

      const jobsRes = await fetch(`http://localhost:5001/api/employer/${profile.user_id}/jobs`);
      if (jobsRes.ok) setJobs(await jobsRes.json());
      
      const statsRes = await fetch(`http://localhost:5001/api/employer/${profile.user_id}/dashboard-stats`);
      if (statsRes.ok) setStats(await statsRes.json());
    } catch(err) {
      console.error("Failed to refresh data", err);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#03045E]">Loading Employer Workspace...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row pt-16 md:pt-0 bg-[#f4f4f4]">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 flex flex-col shadow-xl z-10 bg-white border-r border-[#03045E]/10">
        <div className="p-6 border-b border-[#03045E]/10 hidden md:block">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#03045E]">AbleWork</h2>
          <p className="text-sm mt-1 text-[#03045E]/70 font-semibold">Employer Portal</p>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          {['overview', 'post-job', 'jobs', 'applications', 'settings'].map((tab) => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)} 
              className={`text-left p-4 rounded-xl font-bold transition capitalize ${
                activeTab === tab ? 'bg-[#03045E] text-white shadow-md' : 'text-[#03045E] hover:bg-[#2C7FFF]/10'
              }`}
            >
              {tab === 'overview' && '📈 Analytics Dashboard'}
              {tab === 'post-job' && '✍️ Post a New Job'}
              {tab === 'jobs' && '📋 My Job Listings'}
              {tab === 'applications' && '👥 Review Applicants'}
              {tab === 'settings' && '⚙️ Account Settings'}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative">
        {activeTab === 'overview' && profile && <EmployerOverview profile={profile} stats={stats} setActiveTab={setActiveTab} />}
        {activeTab === 'post-job' && <EmployerPostJob profile={profile} refreshData={refreshJobsAndStats} setActiveTab={setActiveTab} />}
        {activeTab === 'jobs' && <EmployerMyJobs jobs={jobs} refreshData={refreshJobsAndStats} />}
        {activeTab === 'applications' && profile && <EmployerApplications profile={profile} refreshStats={refreshJobsAndStats} />}
        {activeTab === 'profile' && profile && <EmployerProfile profile={profile} refreshData={refreshJobsAndStats} />}
        {activeTab === 'settings' && profile && <EmployerAccountSettings profile={profile} />}
      </main>
      
    </div>
  );
}