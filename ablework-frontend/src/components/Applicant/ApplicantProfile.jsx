import React, { useState } from 'react';

export default function ApplicantProfile({ profile, refreshData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      accommodations_needed: formData.accommodationsString.split(',').map(s => s.trim()).filter(s => s)
    };

    try {
      const res = await fetch(`http://localhost:5001/api/applicant/${profile.user_id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
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
    <div className="animate-fadeIn max-w-6xl relative pb-10">
      <div className="mb-8 border-b border-[#03045E]/10 pb-4">
        <h1 className="text-3xl font-extrabold text-[#03045E]">My Profile</h1>
        <p className="opacity-70 font-medium text-[#03045E] mt-1">
          Keep your skills and travel radius updated to get the most accurate Smart Matches.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* LEFT COLUMN: Professional Details */}
        <div className="flex flex-col gap-6 p-8 bg-white rounded-3xl shadow-xl border border-[#03045E]/10 h-fit">
          <h2 className="text-xl font-bold text-[#03045E] border-b pb-2 flex items-center gap-2">
            💼 Professional Profile
          </h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#03045E]">Skills (Comma separated)</label>
            <input 
              type="text" name="skillsString" value={formData.skillsString} onChange={handleChange} required 
              className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" 
              placeholder="e.g. Data Entry, Web Development, Customer Service" 
            />
            <p className="text-xs text-gray-500 mt-1">These must match employer requirements to trigger a Smart Match.</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#03045E]">Required Accommodations (Comma separated)</label>
            <input 
              type="text" name="accommodationsString" value={formData.accommodationsString} onChange={handleChange} required 
              className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" 
              placeholder="e.g. Wheelchair Ramp, Screen Reader, Flexible Hours" 
            />
            <p className="text-xs text-gray-500 mt-1">The Smart Engine will only show you jobs that provide these exact accommodations.</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#03045E]">Primary Disability Type</label>
            <input 
              type="text" name="disability_type" value={formData.disability_type} onChange={handleChange} required 
              className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#03045E]">Workplace Independence Level</label>
            <select 
              name="workplace_independence" value={formData.workplace_independence} onChange={handleChange} required
              className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none bg-white"
            >
              <option value="Independent">Independent (Requires standard accommodations)</option>
              <option value="Supported">Supported (Requires a job coach or assistant)</option>
            </select>
          </div>
        </div>

        {/* RIGHT COLUMN: Geographic Settings */}
        <div className="flex flex-col gap-6 p-8 bg-white rounded-3xl shadow-xl border border-[#03045E]/10 h-fit">
          <h2 className="text-xl font-bold text-[#03045E] border-b pb-2 flex items-center gap-2">
            📍 Match Radius & Location
          </h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#03045E]">Travel Radius (Kilometers)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" name="travel_radius_km" min="1" max="100" 
                value={formData.travel_radius_km} onChange={handleChange} 
                className="flex-1 accent-[#03045E]" 
              />
              <span className="font-bold text-xl text-[#2C7FFF] min-w-[50px]">{formData.travel_radius_km} km</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">We will hide jobs that are further away than this limit.</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#03045E]">Residential Address</label>
            <input 
              type="text" name="residential_address" value={formData.residential_address} onChange={handleChange} required 
              className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" 
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-bold text-[#03045E]">Latitude</label>
              <input type="text" value={formData.latitude} readOnly className="p-3 bg-gray-100 border border-gray-300 rounded-xl outline-none text-gray-600 cursor-not-allowed" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-bold text-[#03045E]">Longitude</label>
              <input type="text" value={formData.longitude} readOnly className="p-3 bg-gray-100 border border-gray-300 rounded-xl outline-none text-gray-600 cursor-not-allowed" />
            </div>
          </div>

          <button type="button" onClick={handleDetectLocation} className="py-3 bg-blue-50 text-blue-800 font-bold rounded-xl hover:bg-blue-100 transition border border-blue-200 flex items-center justify-center gap-2">
            📍 Detect Current Location
          </button>

          {formData.latitude && formData.longitude && (
            <div className="mt-2 rounded-xl overflow-hidden border border-gray-300 h-[200px] relative pointer-events-none">
              <iframe 
                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(formData.longitude) - 0.05},${Number(formData.latitude) - 0.05},${Number(formData.longitude) + 0.05},${Number(formData.latitude) + 0.05}&layer=mapnik&marker=${formData.latitude},${formData.longitude}`}
              ></iframe>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col">
             <button type="submit" disabled={isSubmitting} className="py-4 bg-[#03045E] text-white font-bold rounded-xl hover:bg-[#2C7FFF] transition shadow-md w-full">
              {isSubmitting ? 'Saving Changes...' : 'Save Profile Settings'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}