import React, { useState, useEffect, useContext } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';

export default function EmployerSettings({ profile, refreshData }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

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

  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ pill: '', title: '', subtitle: '' });

  const pageBg = isContrast ? 'bg-black' : 'bg-[#F4F4F4]';
  const pageText = isContrast ? 'text-[#f4f4f4]' : 'text-[#03045E]';
  const cardBg = isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#03045E]/10';
  const softBg = isContrast ? 'bg-black border-[#2C7FFF]/40' : 'bg-[#F4F4F4]/50 border-gray-100';
  const innerBorder = isContrast ? 'border-[#2C7FFF]/40' : 'border-gray-100';
  const muted = isContrast ? 'text-[#f4f4f4]/70' : 'text-gray-500';
  const labelText = isContrast ? 'text-[#f4f4f4]' : 'text-[#03045E]';
  const inputBg = isContrast 
    ? 'bg-black border-[#2C7FFF]/50 text-[#f4f4f4] placeholder-[#f4f4f4]/40 focus:border-[#2C7FFF] focus:ring-2 focus:ring-[#2C7FFF]/30' 
    : 'bg-[#F4F4F4]/60 border-gray-200 text-[#03045E] focus:border-[#2C7FFF] focus:bg-white focus:ring-2 focus:ring-[#2C7FFF]/20';
  const readOnlyInput = isContrast 
    ? 'bg-black border-[#2C7FFF]/40 text-[#f4f4f4]/70' 
    : 'bg-[#F4F4F4] border-gray-200 text-gray-500';
  const topBar = 'bg-[#03045E]';

  const triggerAlert = (pill, title, subtitle) => {
    setAlertConfig({ pill, title, subtitle });
    setShowAlert(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file)); 
    }
  };


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
        body: submitData 
      });

      if (res.ok) {
        refreshData();
        triggerAlert(
          'Profile Saved',
          'Company Profile Updated!',
          'Your corporate identity, branding, and geofencing coordinates have been saved successfully.'
        );
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
    <div className={`min-h-screen ${pageBg} p-4 sm:p-8 rounded-3xl`}>
      <div className="max-w-6xl mx-auto relative">
       
        <div className={`mb-10 flex items-center justify-between flex-wrap gap-4 p-6 rounded-3xl shadow-sm border ${cardBg}`}>
          <div>
            <h1 className={`text-3xl font-extrabold tracking-tight ${pageText}`}>Company Settings</h1>
            <p className={`text-sm mt-1 ${muted}`}>Manage your corporate identity, branding, and geofencing coordinates.</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${softBg}`}>
            <svg className="w-5 h-5 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className={`text-xs font-bold ${labelText}`}>Employer Portal</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          
          <div className={`flex flex-col justify-between gap-6 p-8 rounded-3xl shadow-xl border relative overflow-hidden ${cardBg}`}>
            <div className={`absolute top-0 left-0 right-0 h-2 ${topBar}`}></div>
            
            <div className="flex flex-col gap-6">
              <div className={`flex items-center justify-between border-b pb-4 ${innerBorder}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#2C7FFF]/10 text-[#2C7FFF]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className={`text-xl font-bold ${labelText}`}>Business Details</h2>
                </div>
              </div>
              
          
              <div className={`flex items-center gap-6 p-4 rounded-2xl border ${softBg}`}>
                <div className="w-20 h-20 rounded-2xl border-2 border-[#2C7FFF]/30 overflow-hidden bg-white shadow-inner flex items-center justify-center shrink-0 relative group">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-[#03045E]/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className={`text-xs font-bold uppercase tracking-wider ${labelText}`}>Company Logo</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className={`text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#2C7FFF] file:text-[#f4f4f4] hover:file:bg-[#03045E] file:transition cursor-pointer ${muted}`} 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${labelText}`}>
                  <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Company Name
                </label>
                <input 
                  type="text" 
                  name="company_name" 
                  value={formData.company_name} 
                  onChange={handleChange} 
                  required 
                  className={`p-3.5 border rounded-2xl outline-none transition font-medium ${inputBg}`} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${labelText}`}>
                  <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Email
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className={`p-3.5 border rounded-2xl outline-none transition font-medium ${inputBg}`} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${labelText}`}>
                  <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Industry
                </label>
                <input 
                  type="text" 
                  name="industry" 
                  value={formData.industry} 
                  onChange={handleChange} 
                  required 
                  className={`p-3.5 border rounded-2xl outline-none transition font-medium ${inputBg}`} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${labelText}`}>
                  <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Company Description
                </label>
                <textarea 
                  name="company_description" 
                  rows="4" 
                  value={formData.company_description} 
                  onChange={handleChange} 
                  required 
                  className={`p-3.5 border rounded-2xl resize-none outline-none transition font-medium ${inputBg}`}
                ></textarea>
              </div>
            </div>
            
            
            <div></div>
          </div>

         
          <div className={`flex flex-col justify-between gap-6 p-8 rounded-3xl shadow-xl border relative overflow-hidden ${cardBg}`}>
            <div className={`absolute top-0 left-0 right-0 h-2 ${topBar}`}></div>
            
            <div className="flex flex-col gap-6">
              <div className={`flex items-center justify-between border-b pb-4 ${innerBorder}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#2C7FFF]/10 text-[#2C7FFF]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className={`text-xl font-bold ${labelText}`}>Geofencing Location</h2>
                </div>
              </div>
              
              <p className={`text-xs font-medium leading-relaxed p-4 rounded-2xl border ${softBg} ${muted}`}>
                If your office moves, update your coordinates. The Smart Engine relies on these precise points to connect you with candidates within a safe travel radius.
              </p>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${labelText}`}>Latitude</label>
                  <input 
                    type="text" 
                    name="latitude" 
                    value={formData.latitude} 
                    readOnly 
                    className={`p-3.5 border rounded-2xl outline-none font-mono text-xs cursor-not-allowed ${readOnlyInput}`} 
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${labelText}`}>Longitude</label>
                  <input 
                    type="text" 
                    name="longitude" 
                    value={formData.longitude} 
                    readOnly 
                    className={`p-3.5 border rounded-2xl outline-none font-mono text-xs cursor-not-allowed ${readOnlyInput}`} 
                  />
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleDetectLocation} 
                className={`py-3.5 font-bold rounded-2xl transition-all duration-300 border flex items-center justify-center gap-2.5 shadow-sm group text-sm ${
                  isContrast 
                    ? 'bg-[#2C7FFF]/20 text-[#f4f4f4] border-[#2C7FFF] hover:bg-[#2C7FFF] hover:text-[#f4f4f4]' 
                    : 'bg-[#2C7FFF]/10 text-[#03045E] border-[#2C7FFF]/20 hover:bg-[#2C7FFF] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5 text-[#2C7FFF] group-hover:text-[#f4f4f4] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Detect Current Office Location
              </button>

              {formData.latitude && formData.longitude && (
                <div className={`rounded-2xl overflow-hidden border h-[220px] relative pointer-events-none shadow-inner ${isContrast ? 'border-[#2C7FFF]/40' : 'border-gray-200'}`}>
                  <iframe 
                    width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(formData.longitude) - 0.05},${Number(formData.latitude) - 0.05},${Number(formData.longitude) + 0.05},${Number(formData.latitude) + 0.05}&layer=mapnik&marker=${formData.latitude},${formData.longitude}`}
                  ></iframe>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col">
               <button 
                type="submit" 
                disabled={isSubmitting} 
                className={`py-4 font-bold rounded-2xl transition-all duration-300 shadow-lg w-full flex items-center justify-center gap-2 text-sm tracking-wide disabled:opacity-50 ${
                  isContrast 
                    ? 'bg-[#2C7FFF] text-[#f4f4f4] shadow-[#2C7FFF]/30 hover:bg-[#f4f4f4] hover:text-[#03045E]' 
                    : 'bg-[#03045E] text-white shadow-[#03045E]/20 hover:bg-[#2C7FFF]'
                }`}
               >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#f4f4f4]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Profile Settings
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>

      {showAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#03045E]/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[2rem] shadow-[0_25px_60px_rgba(3,4,94,0.4)] border-2 overflow-hidden animate-in zoom-in-95 duration-300 ${isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-[#f4f4f4] border-[#2C7FFF]'}`}>
            <div className="h-2 w-full bg-[#2C7FFF]" />

            <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-[#2C7FFF]/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#2C7FFF] flex items-center justify-center shadow-[0_10px_30px_rgba(44,127,255,0.5)]">
                    <svg className="w-8 h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#03045E] flex items-center justify-center border-2 ${isContrast ? 'border-black' : 'border-[#f4f4f4]'}`}>
                  <svg className="w-3.5 h-3.5 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <span className="inline-block px-3 py-1 rounded-full bg-[#2C7FFF]/15 text-[#2C7FFF] text-[10px] font-black uppercase tracking-widest mb-3">
                {alertConfig.pill}
              </span>

              <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                {alertConfig.title}
              </h2>
              <p className={`text-sm font-semibold leading-relaxed mb-6 max-w-xs ${muted}`}>
                {alertConfig.subtitle}
              </p>

              <button
                onClick={() => setShowAlert(false)}
                className="w-full py-3.5 rounded-2xl bg-[#2C7FFF] text-[#f4f4f4] font-black text-sm uppercase tracking-wider shadow-md hover:bg-[#03045E] transition-all duration-300 cursor-pointer border-2 border-[#2C7FFF]"
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