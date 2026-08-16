import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Data States
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // New Job Form States
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Employer Data
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

      } catch (err) {
        setError('Cannot connect to the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      employer_id: profile.user_id,
      job_title: jobTitle,
      company_name: profile.company_name,
      job_description: jobDesc,
      required_skills: ["Data Entry", "Customer Service"], 
      provided_accommodations: ["Wheelchair Accessible", "Screen Reader"],
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
        setJobTitle('');
        setJobDesc('');
        setActiveTab('jobs'); 
        
        const jobsRes = await fetch(`http://localhost:5001/api/employer/${profile.user_id}/jobs`);
        const jobsData = await jobsRes.json();
        if (jobsRes.ok) setJobs(jobsData);
      }
    } catch (err) {
      alert("Error posting job.");
    } finally {
      setIsSubmitting(false);
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
          {['overview', 'post-job', 'jobs', 'applications'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`text-left p-4 rounded-xl font-bold transition capitalize ${
                activeTab === tab 
                  ? 'bg-[#03045E] text-white shadow-md' 
                  : 'text-[#03045E] hover:bg-[#2C7FFF]/10'
              }`}
            >
              {tab === 'overview' && '📈 Analytics Dashboard'}
              {tab === 'post-job' && '✍️ Post a New Job'}
              {tab === 'jobs' && '📋 My Job Listings'}
              {tab === 'applications' && '👥 Review Applicants'}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* --- TAB: OVERVIEW (ANALYTICS & MAP) --- */}
        {activeTab === 'overview' && profile && (
          <div className="animate-fadeIn max-w-6xl">
            <h1 className="text-3xl font-extrabold mb-2 text-[#03045E]">Dashboard Overview</h1>
            <p className="opacity-70 font-medium mb-8 text-[#03045E]">Real-time statistics and geographic reach for {profile.company_name}.</p>
            
            {/* 1. TOP STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl">📋</div>
                <div>
                  <p className="text-sm font-bold opacity-60 uppercase">Active Jobs</p>
                  <p className="text-3xl font-extrabold text-[#03045E]">{jobs.length}</p>
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">👥</div>
                <div>
                  <p className="text-sm font-bold opacity-60 uppercase">Total Applicants</p>
                  <p className="text-3xl font-extrabold text-[#03045E]">12</p>
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center text-2xl">⭐</div>
                <div>
                  <p className="text-sm font-bold opacity-60 uppercase">Shortlisted</p>
                  <p className="text-3xl font-extrabold text-[#03045E]">4</p>
                </div>
              </div>
            </div>

            {/* 2. VISUALIZATIONS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Geofencing Map Card */}
              <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex flex-col h-[400px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-[#03045E]">Recruitment Zone</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">Geofence Active</span>
                </div>
                <p className="text-sm font-medium opacity-70 mb-4">
                  Your office location. The Smart Engine filters applicants outside their safe travel radius from this point.
                </p>
                
                {profile.latitude && profile.longitude ? (
                  <div className="flex-1 rounded-xl overflow-hidden border border-[#03045E]/20 relative">
                    {/* Simulated Geofence Circle Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                      <div className="w-40 h-40 bg-blue-500/20 rounded-full border border-blue-500/50"></div>
                    </div>
                    <iframe 
                      width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${profile.longitude - 0.05},${profile.latitude - 0.05},${profile.longitude + 0.05},${profile.latitude + 0.05}&layer=mapnik&marker=${profile.latitude},${profile.longitude}`}
                    ></iframe>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-xl border border-gray-200">
                    <p className="text-sm font-bold text-gray-500">No coordinates saved for this location.</p>
                  </div>
                )}
              </div>

              {/* Graphical Representation Card */}
              <div className="p-6 rounded-3xl bg-white shadow-lg border border-[#03045E]/10 flex flex-col h-[400px]">
                <h3 className="text-lg font-bold text-[#03045E] mb-1">Application Trends</h3>
                <p className="text-sm font-medium opacity-70 mb-8">Weekly applicant influx across all job postings.</p>
                
                {/* CSS Bar Chart */}
                <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-6 border-b border-[#03045E]/10 relative">
                  {/* Y-Axis lines */}
                  <div className="absolute top-0 left-0 w-full border-t border-dashed border-[#03045E]/10"></div>
                  <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-[#03045E]/10"></div>
                  
                  {/* Bars */}
                  {[
                    { day: 'Mon', height: '40%' },
                    { day: 'Tue', height: '70%' },
                    { day: 'Wed', height: '45%' },
                    { day: 'Thu', height: '90%' },
                    { day: 'Fri', height: '60%' },
                    { day: 'Sat', height: '20%' },
                    { day: 'Sun', height: '30%' }
                  ].map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center w-full group z-10">
                      <div className="w-full max-w-[40px] bg-[#2C7FFF]/20 hover:bg-[#2C7FFF] transition-all rounded-t-md relative flex justify-center" style={{ height: bar.height }}>
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-[#03045E] text-white text-xs font-bold px-2 py-1 rounded transition-opacity">
                          {bar.height.replace('%', '')}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#03045E]/60 mt-3">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- TAB: POST A JOB --- */}
        {activeTab === 'post-job' && (
          <div className="animate-fadeIn max-w-3xl">
            <h1 className="text-3xl font-extrabold mb-8 text-[#03045E]">Create a Job Posting</h1>
            <form onSubmit={handlePostJob} className="p-8 rounded-3xl bg-white shadow-xl border border-[#03045E]/10 flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#03045E]">Job Title</label>
                <input 
                  type="text" required value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                  className="p-3 border border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] outline-none"
                  placeholder="e.g. Remote Data Specialist"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#03045E]">Full Job Description</label>
                <textarea 
                  required rows="5" value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                  className="p-3 border border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] outline-none resize-none"
                  placeholder="Describe the role, responsibilities, and team..."
                ></textarea>
              </div>

              <div className="bg-[#2C7FFF]/10 p-4 rounded-xl border border-[#2C7FFF]/30">
                <p className="text-sm font-bold text-[#03045E] mb-1">Smart Engine Configuration</p>
                <p className="text-xs text-[#03045E]/70">For testing purposes, this job will automatically be tagged with "Data Entry" and "Wheelchair Accessible" to trigger the matching algorithm.</p>
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="py-4 bg-[#03045E] hover:bg-[#2C7FFF] text-white font-bold rounded-xl transition mt-2"
              >
                {isSubmitting ? 'Posting...' : 'Publish Job Posting'}
              </button>
            </form>
          </div>
        )}

        {/* --- TAB: MY JOBS --- */}
        {activeTab === 'jobs' && (
          <div className="animate-fadeIn max-w-5xl">
            <h1 className="text-3xl font-extrabold mb-8 text-[#03045E]">My Job Listings</h1>
            <div className="flex flex-col gap-4">
              {jobs.length > 0 ? (
                jobs.map(job => (
                  <div key={job.id} className="p-6 bg-white rounded-2xl shadow-md border border-[#03045E]/10 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-[#03045E]">{job.job_title}</h3>
                      <p className="text-sm opacity-70 mt-1">Posted on {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-bold">
                      {job.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center opacity-70 font-bold border-2 border-dashed border-[#03045E]/20 rounded-2xl">
                  You haven't posted any jobs yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: APPLICATIONS --- */}
        {activeTab === 'applications' && (
          <div className="animate-fadeIn max-w-5xl">
            <h1 className="text-3xl font-extrabold mb-8 text-[#03045E]">Review Applicants</h1>
            <div className="p-10 text-center opacity-70 font-bold border-2 border-dashed border-[#03045E]/20 rounded-2xl bg-white">
              We will connect this tab to the database in the next step so you can review incoming applications!
            </div>
          </div>
        )}

      </main>
    </div>
  );
}