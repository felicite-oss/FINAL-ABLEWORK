import React, { useState, useEffect } from 'react';

export default function EmployerSettings({ profile, refreshData }) {
  const [formData, setFormData] = useState({
    company_name: profile?.company_name || '',
    company_description: profile?.company_description || '',
    industry: profile?.industry || '',
    email: profile?.email || '',
    latitude: profile?.latitude || '',
    longitude: profile?.longitude || ''
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(profile?.company_logo ? `http://localhost:5001${profile.company_logo}` : null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Text Inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file)); // Show a preview instantly
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
          alert("New office coordinates captured successfully!");
        },
        (error) => alert("Could not detect location. Please ensure location services are enabled.")
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Submit Form using FormData (Required for file uploads)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append('company_name', formData.company_name);
    submitData.append('company_description', formData.company_description);
    submitData.append('industry', formData.industry);
    submitData.append('email', formData.email);
    submitData.append('latitude', formData.latitude);
    submitData.append('longitude', formData.longitude);
    
    if (logoFile) {
      submitData.append('company_logo', logoFile);
    }

    try {
      const res = await fetch(`http://localhost:5001/api/employer/${profile.user_id}/settings`, {
        method: 'PUT',
        body: submitData // Notice we do NOT use JSON.stringify or 'Content-Type' headers here. Fetch handles multipart forms automatically.
      });

      if (res.ok) {
        alert("Company profile updated successfully!");
        refreshData();
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      alert("Server error while saving settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-6xl relative">
      <h1 className="text-3xl font-extrabold mb-8 text-[#03045E]">Company Settings</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* LEFT COLUMN: Profile Info & Logo */}
        <div className="flex flex-col gap-6 p-8 bg-white rounded-3xl shadow-xl border border-[#03045E]/10">
          <h2 className="text-xl font-bold text-[#03045E] border-b pb-2">Business Details</h2>
          
          {/* Logo Upload Section */}
          <div className="flex items-center gap-6 mb-2">
            <div className="w-24 h-24 rounded-full border-4 border-[#2C7FFF]/20 overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-gray-400">🏢</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-[#03045E] mb-1">Company Profile Picture</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2C7FFF]/10 file:text-[#03045E] hover:file:bg-[#2C7FFF]/20 cursor-pointer" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#03045E]">Company Name</label>
            <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#03045E]">Contact Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#03045E]">Industry</label>
            <input type="text" name="industry" value={formData.industry} onChange={handleChange} required className="p-3 border border-gray-300 rounded-xl focus:border-[#2C7FFF] outline-none" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#03045E]">Company Description</label>
            <textarea name="company_description" rows="5" value={formData.company_description} onChange={handleChange} required className="p-3 border border-gray-300 rounded-xl resize-none focus:border-[#2C7FFF] outline-none"></textarea>
          </div>
        </div>

        {/* RIGHT COLUMN: Geofencing Updater */}
        <div className="flex flex-col gap-6 p-8 bg-white rounded-3xl shadow-xl border border-[#03045E]/10 h-fit">
          <h2 className="text-xl font-bold text-[#03045E] border-b pb-2">Geofencing Location Updater</h2>
          
          <p className="text-sm font-medium text-gray-600">
            If your office moves, you must update your coordinates. The Smart Engine relies on these precise points to connect you with candidates within a safe travel radius.
          </p>

          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-bold text-[#03045E]">Latitude</label>
              <input type="text" name="latitude" value={formData.latitude} readOnly className="p-3 bg-gray-100 border border-gray-300 rounded-xl outline-none text-gray-600 cursor-not-allowed" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-bold text-[#03045E]">Longitude</label>
              <input type="text" name="longitude" value={formData.longitude} readOnly className="p-3 bg-gray-100 border border-gray-300 rounded-xl outline-none text-gray-600 cursor-not-allowed" />
            </div>
          </div>

          <button type="button" onClick={handleDetectLocation} className="py-3 bg-green-100 text-green-800 font-bold rounded-xl hover:bg-green-200 transition border border-green-300 flex items-center justify-center gap-2">
            📍 Detect Current Office Location
          </button>

          {formData.latitude && formData.longitude && (
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-300 h-[250px] relative pointer-events-none">
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