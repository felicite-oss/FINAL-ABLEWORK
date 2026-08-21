import React, { useState } from 'react';

export default function ApplicantProfile({ profile, refreshData, setProfile }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for profile picture modal, preview, and actual file object
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || profile?.profile_picture || '');
  const [tempAvatarUrl, setTempAvatarUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    skillsString: profile?.skills ? profile.skills.join(', ') : '',
    accommodationsString: profile?.accommodations ? profile.accommodations.join(', ') : '',
    disability_type: profile?.disability_type || '',
    workplace_independence: profile?.workplace_independence || '',
    residential_address: profile?.residential_address || '',
    travel_radius_km: profile?.travel_radius_km || 5,
    latitude: profile?.latitude || '',
    longitude: profile?.longitude || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle local file selection from device file manager
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const localPreviewUrl = URL.createObjectURL(file);
      setTempAvatarUrl(localPreviewUrl);
    }
  };

  // Capture New Location via Browser Geolocation API
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          alert("Location coordinates updated successfully!");
        },
        (error) => alert("Could not detect location. Please ensure location services are enabled.")
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      residential_address: formData.residential_address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      travel_radius_km: Number(formData.travel_radius_km),
      workplace_independence: formData.workplace_independence,
      disability_type: formData.disability_type,
      skills: formData.skillsString.split(',').map(s => s.trim()).filter(s => s),
      accommodations_needed: formData.accommodationsString.split(',').map(s => s.trim()).filter(s => s),
      avatar_url: avatarUrl 
    };

    try {
      const res = await fetch(`http://localhost:5001/api/applicant/${profile.user_id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Immediately update parent profile state so header updates instantly
        if (setProfile) {
          setProfile(prev => ({ ...prev, ...payload, profile_picture: avatarUrl }));
        }
        alert("Profile updated successfully!");
        refreshData(); // Refresh to update the Smart Engine Matches
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      alert("Server error while saving profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl relative pb-12 animate-in fade-in duration-300 text-[#03045E]">
      {/* Header Section */}
      <div className="mb-10 bg-[#f4f4f4] p-8 rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.06)] border border-[#03045E]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Circular Profile Picture / Avatar */}
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#2C7FFF] shadow-md bg-[#f4f4f4] shrink-0 flex items-center justify-center">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <svg className="w-10 h-10 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-extrabold text-[#03045E] tracking-tight">
              {profile?.full_name || profile?.name || 'Applicant Profile'}
            </h1>
            <p className="text-sm font-semibold text-[#03045E] mt-0.5">
              Manage your personal settings and smart match parameters
            </p>
          </div>
        </div>

        {/* Edit Profile Button opens the center popup modal */}
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => {
              setTempAvatarUrl(avatarUrl);
              setSelectedFile(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-3 bg-[#2C7FFF] text-[#f4f4f4] font-bold rounded-2xl hover:bg-[#03045E] transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* POPUP MODAL TO CHANGE PROFILE PICTURE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03045E]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#f4f4f4] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#03045E]/20 flex flex-col gap-6 text-[#03045E]">
            <div className="flex items-center justify-between border-b border-[#03045E]/20 pb-4">
              <h3 className="text-xl font-extrabold text-[#03045E]">Change Profile Picture</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#03045E] hover:text-[#2C7FFF] font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#2C7FFF] shadow-md bg-[#f4f4f4] flex items-center justify-center">
                {tempAvatarUrl ? (
                  <img src={tempAvatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm font-bold text-[#03045E]">Select Image from Device</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-3.5 bg-white border border-[#03045E]/20 rounded-2xl focus:border-[#2C7FFF] focus:ring-4 focus:ring-[#2C7FFF]/20 outline-none text-[#03045E] transition-all font-medium text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#2C7FFF] file:text-[#f4f4f4] hover:file:bg-[#03045E] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3.5 bg-white text-[#03045E] border border-[#03045E]/20 font-bold rounded-2xl hover:bg-[#2C7FFF]/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (tempAvatarUrl) {
                    setAvatarUrl(tempAvatarUrl);
                  }
                  setIsModalOpen(false);
                }}
                className="flex-1 py-3.5 bg-[#2C7FFF] text-[#f4f4f4] font-bold rounded-2xl hover:bg-[#03045E] transition-all shadow-md cursor-pointer"
              >
                Save Picture
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Professional Details */}
        <div className="flex flex-col gap-6 p-8 bg-[#f4f4f4] rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.04)] border border-[#03045E]/20 h-fit transition-all duration-300 hover:shadow-[0_20px_40px_rgba(3,4,94,0.08)]">
          <div className="flex items-center gap-3 border-b border-[#03045E]/20 pb-4">
            <div className="w-10 h-10 rounded-xl bg-white text-[#2C7FFF] border border-[#03045E]/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#03045E]">Professional Profile</h2>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#03045E]">Skills (Comma separated)</label>
            <div className="relative">
              <input 
                type="text" name="skillsString" value={formData.skillsString} onChange={handleChange} required 
                className="w-full p-3.5 pl-4 bg-white border border-[#03045E]/20 rounded-2xl focus:border-[#2C7FFF] focus:ring-4 focus:ring-[#2C7FFF]/20 outline-none text-[#03045E] transition-all font-medium text-sm placeholder:text-[#03045E]/40" 
                placeholder="e.g. Data Entry, Web Development, Customer Service" 
              />
            </div>
            <p className="text-xs text-[#03045E] font-semibold mt-1">These must match employer requirements to trigger a Smart Match.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#03045E]">Required Accommodations (Comma separated)</label>
            <div className="relative">
              <input 
                type="text" name="accommodationsString" value={formData.accommodationsString} onChange={handleChange} required 
                className="w-full p-3.5 pl-4 bg-white border border-[#03045E]/20 rounded-2xl focus:border-[#2C7FFF] focus:ring-4 focus:ring-[#2C7FFF]/20 outline-none text-[#03045E] transition-all font-medium text-sm placeholder:text-[#03045E]/40" 
                placeholder="e.g. Wheelchair Ramp, Screen Reader, Flexible Hours" 
              />
            </div>
            <p className="text-xs text-[#03045E] font-semibold mt-1">The Smart Engine will only show you jobs that provide these exact accommodations.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#03045E]">Primary Disability Type</label>
            <input 
              type="text" name="disability_type" value={formData.disability_type} onChange={handleChange} required 
              className="w-full p-3.5 pl-4 bg-white border border-[#03045E]/20 rounded-2xl focus:border-[#2C7FFF] focus:ring-4 focus:ring-[#2C7FFF]/20 outline-none text-[#03045E] transition-all font-medium text-sm placeholder:text-[#03045E]/40"
              placeholder="e.g. Visual, Mobility, Hearing"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#03045E]">Workplace Independence Level</label>
            <select 
              name="workplace_independence" value={formData.workplace_independence} onChange={handleChange} required
              className="w-full p-3.5 pl-4 bg-white border border-[#03045E]/20 rounded-2xl focus:border-[#2C7FFF] focus:ring-4 focus:ring-[#2C7FFF]/20 outline-none text-[#03045E] transition-all font-medium text-sm cursor-pointer"
            >
              <option value="" disabled className="text-[#03045E]/40">Select independence level</option>
              <option value="Independent">Independent (Requires standard accommodations)</option>
              <option value="Supported">Supported (Requires a job coach or assistant)</option>
            </select>
          </div>
        </div>

        {/* RIGHT COLUMN: Geographic Settings */}
        <div className="flex flex-col gap-6 p-8 bg-[#f4f4f4] rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.04)] border border-[#03045E]/20 h-fit transition-all duration-300 hover:shadow-[0_20px_40px_rgba(3,4,94,0.08)]">
          <div className="flex items-center gap-3 border-b border-[#03045E]/20 pb-4">
            <div className="w-10 h-10 rounded-xl bg-white text-[#2C7FFF] border border-[#03045E]/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#03045E]">Match Radius & Location</h2>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-[#03045E]">Travel Radius</label>
              <span className="font-extrabold text-sm px-3 py-1 rounded-full bg-white text-[#2C7FFF] border border-[#03045E]/20">{formData.travel_radius_km} km</span>
            </div>
            <div className="flex items-center gap-4 py-2">
              <input 
                type="range" name="travel_radius_km" min="1" max="100" 
                value={formData.travel_radius_km} onChange={handleChange} 
                className="flex-1 h-2 bg-white rounded-lg appearance-none cursor-pointer accent-[#2C7FFF]" 
              />
            </div>
            <p className="text-xs text-[#03045E] font-semibold">We will hide jobs that are further away than this limit.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#03045E]">Residential Address</label>
            <input 
              type="text" name="residential_address" value={formData.residential_address} onChange={handleChange} required 
              className="w-full p-3.5 pl-4 bg-white border border-[#03045E]/20 rounded-2xl focus:border-[#2C7FFF] focus:ring-4 focus:ring-[#2C7FFF]/20 outline-none text-[#03045E] transition-all font-medium text-sm placeholder:text-[#03045E]/40" 
              placeholder="Enter your street address or city"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#03045E]">Latitude</label>
              <input type="text" value={formData.latitude} readOnly className="w-full p-3.5 bg-white border border-[#03045E]/20 rounded-2xl outline-none text-[#03045E] font-medium text-sm cursor-not-allowed opacity-75" placeholder="Not set" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#03045E]">Longitude</label>
              <input type="text" value={formData.longitude} readOnly className="w-full p-3.5 bg-white border border-[#03045E]/20 rounded-2xl outline-none text-[#03045E] font-medium text-sm cursor-not-allowed opacity-75" placeholder="Not set" />
            </div>
          </div>

          <button type="button" onClick={handleDetectLocation} className="w-full py-3.5 bg-white text-[#2C7FFF] font-bold rounded-2xl hover:bg-[#2C7FFF]/10 transition-all border border-[#2C7FFF]/30 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm">
            <svg className="w-5 h-5 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Detect Current Location
          </button>

          {formData.latitude && formData.longitude && (
            <div className="rounded-2xl overflow-hidden border border-[#03045E]/20 h-[180px] relative pointer-events-none shadow-inner bg-white">
              <iframe 
                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(formData.longitude) - 0.05},${Number(formData.latitude) - 0.05},${Number(formData.longitude) + 0.05},${Number(formData.latitude) + 0.05}&layer=mapnik&marker=${formData.latitude},${formData.longitude}`}
              ></iframe>
            </div>
          )}

          <div className="mt-2 pt-4 border-t border-[#03045E]/20 flex flex-col">
             <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-[#03045E] text-[#f4f4f4] font-bold rounded-2xl hover:bg-[#2C7FFF] transition-all shadow-[0_10px_25px_rgba(3,4,94,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin text-[#f4f4f4]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Profile Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}