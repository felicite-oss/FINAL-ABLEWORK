import React, { useState, useEffect } from 'react';

export default function EmployerApplications({ profile, refreshStats }) {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null); // Controls the Modal
  const [isLoading, setIsLoading] = useState(true);

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
  const updateStatus = async (applicationId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Refresh local data to show new status instantly
        fetchApplications();
        // Refresh dashboard stats (Pending/Shortlisted counters)
        if (refreshStats) refreshStats();
        // Close modal if open
        if (selectedApp) setSelectedApp(null);
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

  if (isLoading) return <div className="p-10 font-bold text-[#03045E]">Loading applicants...</div>;

  return (
    <div className="animate-fadeIn max-w-6xl relative">
      <h1 className="text-3xl font-extrabold mb-8 text-[#03045E]">Review Applicants</h1>
      
      {/* APPLICANT ROSTER (LIST) */}
      <div className="flex flex-col gap-4">
        {applications.length > 0 ? (
          applications.map(app => (
            <div key={app.application_id} className="p-6 bg-white rounded-2xl shadow-md border border-[#03045E]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-lg">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-[#03045E]">{app.firstname} {app.lastname}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.application_status)}`}>
                    {app.application_status}
                  </span>
                </div>
                <p className="text-sm font-semibold opacity-80 text-[#03045E]">Applied for: {app.job_title}</p>
                <p className="text-xs opacity-60 mt-1">Date: {new Date(app.applied_at).toLocaleDateString()}</p>
              </div>

              <div>
                <button 
                  onClick={() => {
                    // Update status to 'Under Review' automatically when they open it the first time
                    if(app.application_status === 'Pending' || app.application_status === 'Under Review') {
                        updateStatus(app.application_id, 'Under Review');
                    }
                    setSelectedApp(app);
                  }} 
                  className="px-6 py-3 text-sm font-bold text-white bg-[#03045E] rounded-xl hover:bg-[#2C7FFF] transition"
                >
                  View Details
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="p-10 text-center opacity-70 font-bold border-2 border-dashed border-[#03045E]/20 rounded-2xl">
            No applications received yet.
          </div>
        )}
      </div>

      {/* APPLICANT DETAIL MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              
              {/* Left Column: Profile & Contact */}
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-sm font-bold text-[#03045E]/60 uppercase mb-2">Contact Information</h4>
                  <p className="font-semibold text-[#03045E]">📧 {selectedApp.email}</p>
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

            {/* Modal Footer - Status Management Buttons */}
            <div className="mt-auto pt-6 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
              <button 
                onClick={() => setSelectedApp(null)} 
                className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition mr-auto"
              >
                Close Window
              </button>
              
              <button onClick={() => updateStatus(selectedApp.application_id, 'Rejected')} className="px-6 py-3 bg-red-100 text-red-800 font-bold rounded-xl hover:bg-red-200 transition">
                Reject
              </button>
              <button onClick={() => updateStatus(selectedApp.application_id, 'Shortlisted')} className="px-6 py-3 bg-green-100 text-green-800 font-bold rounded-xl hover:bg-green-200 transition">
                ⭐ Shortlist
              </button>
              <button onClick={() => updateStatus(selectedApp.application_id, 'Hired')} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-md">
                🎉 Hire Applicant
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}