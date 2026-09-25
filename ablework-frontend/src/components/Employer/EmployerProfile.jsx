import React, { useState, useContext } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';

export default function EmployerSettings({ profile, refreshData }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isDark = isContrast || isDarkMode;

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

  const pageBg = isDark ? 'bg-black' : 'bg-[#F4F4F4]';
  const pageText = isDark ? 'text-white' : 'text-[#03045E]';
  const cardBg = isDark ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#03045E]';
  const softBg = isDark ? 'bg-zinc-900 border-[#2C7FFF]/40' : 'bg-[#F4F4F4] border-[#03045E]/15';
  const innerBorder = isDark ? 'border-[#2C7FFF]/40' : 'border-[#03045E]';
  const muted = isDark ? 'text-white/70' : 'text-[#03045E]/70';
  const labelText = isDark ? 'text-white' : 'text-[#03045E]';
  const inputBg = isDark
    ? 'bg-black border-[#2C7FFF] text-white placeholder-white/40 focus:border-[#2C7FFF]'
    : 'bg-[#F4F4F4] border-[#03045E] text-[#03045E] placeholder-[#03045E]/40 focus:border-[#2C7FFF] focus:bg-white';
  const readOnlyInput = isDark
    ? 'bg-zinc-900 border-[#2C7FFF]/40 text-white/70'
    : 'bg-[#F4F4F4] border-[#03045E]/30 text-[#03045E]/70';
  const topBar = 'bg-[#2C7FFF]';

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
    <div className={`animate-fadeIn max-w-7xl mx-auto pb-10 ${pageText}`}>
      
      <div className={`relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-6 sm:p-8 rounded-3xl border-2 ${cardBg}`}>
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2C7FFF]"></div>
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${isDark ? 'bg-[#2C7FFF]/10' : 'bg-[#2C7FFF]/10'}`}></div>
        <div className={`absolute -bottom-20 right-20 w-40 h-40 rounded-full ${isDark ? 'bg-[#2C7FFF]/5' : 'bg-[#03045E]/5'}`}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border-2 ${isDark ? 'text-white bg-black border-[#2C7FFF]' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>Settings Hub</span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 border-2 ${isDark ? 'text-white bg-black border-[#2C7FFF]' : 'text-[#03045E] bg-white border-[#03045E]'}`}>
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse"></span>
              Employer Portal
            </span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${pageText}`}>Company Settings</h1>
          <p className={`text-sm font-bold mt-2 max-w-xl ${muted}`}>Manage your corporate identity, branding, and geofencing coordinates.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        <div className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl border-2 flex flex-col gap-6 ${cardBg}`}>
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2C7FFF]"></div>

          <div className={`flex items-center gap-4 pb-5 border-b-2 pl-3 ${innerBorder}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${isDark ? 'bg-[#2C7FFF] text-black border-[#2C7FFF]' : 'bg-[#03045E] text-white border-[#03045E]'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2C7FFF]">Section 01</p>
              <h2 className={`text-lg sm:text-xl font-black tracking-tight ${labelText}`}>Business Details</h2>
            </div>
          </div>

          <div className={`flex items-center gap-5 p-4 rounded-2xl border-2 ${softBg}`}>
            <div className={`w-20 h-20 rounded-2xl border-2 border-[#2C7FFF] overflow-hidden flex items-center justify-center shrink-0 ${isDark ? 'bg-black' : 'bg-white'}`}>
              {logoPreview ? (
                <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
              ) : (
                <svg className={`w-8 h-8 ${isDark ? 'text-white/40' : 'text-[#03045E]/40'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )}
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <label className={`text-[10px] font-black uppercase tracking-wider ${labelText}`}>Company Logo</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className={`text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#2C7FFF] file:text-white hover:file:bg-[#03045E] file:transition cursor-pointer ${muted}`} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className={`text-[10px] font-black uppercase tracking-wider ${muted}`}>Company Name</label>
            <input 
              type="text" 
              name="company_name" 
              value={formData.company_name} 
              onChange={handleChange} 
              required 
              className={`p-3.5 border-2 rounded-xl outline-none transition font-semibold ${inputBg}`} 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={`text-[10px] font-black uppercase tracking-wider ${muted}`}>Contact Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              className={`p-3.5 border-2 rounded-xl outline-none transition font-semibold ${inputBg}`} 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={`text-[10px] font-black uppercase tracking-wider ${muted}`}>Industry</label>
            <input 
              type="text" 
              name="industry" 
              value={formData.industry} 
              onChange={handleChange} 
              required 
              className={`p-3.5 border-2 rounded-xl outline-none transition font-semibold ${inputBg}`} 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={`text-[10px] font-black uppercase tracking-wider ${muted}`}>Company Description</label>
            <textarea 
              name="company_description" 
              rows="4" 
              value={formData.company_description} 
              onChange={handleChange} 
              required 
              className={`p-3.5 border-2 rounded-xl resize-none outline-none transition font-semibold ${inputBg}`}
            ></textarea>
          </div>
        </div>

        <div className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl border-2 flex flex-col gap-6 ${cardBg}`}>
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2C7FFF]"></div>

          <div className={`flex items-center gap-4 pb-5 border-b-2 pl-3 ${innerBorder}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${isDark ? 'bg-[#2C7FFF] text-black border-[#2C7FFF]' : 'bg-[#03045E] text-white border-[#03045E]'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2C7FFF]">Section 02</p>
              <h2 className={`text-lg sm:text-xl font-black tracking-tight ${labelText}`}>Geofencing Location</h2>
            </div>
          </div>

          <p className={`text-xs font-semibold leading-relaxed p-4 rounded-2xl border-2 ${softBg} ${muted}`}>
            If your office moves, update your coordinates. The Smart Engine relies on these precise points to connect you with candidates within a safe travel radius.
          </p>

          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className={`text-[10px] font-black uppercase tracking-wider ${muted}`}>Latitude</label>
              <input 
                type="text" 
                name="latitude" 
                value={formData.latitude} 
                readOnly 
                className={`p-3.5 border-2 rounded-xl outline-none font-mono text-xs cursor-not-allowed ${readOnlyInput}`} 
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className={`text-[10px] font-black uppercase tracking-wider ${muted}`}>Longitude</label>
              <input 
                type="text" 
                name="longitude" 
                value={formData.longitude} 
                readOnly 
                className={`p-3.5 border-2 rounded-xl outline-none font-mono text-xs cursor-not-allowed ${readOnlyInput}`} 
              />
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleDetectLocation} 
            className="py-3.5 font-black rounded-xl transition-all duration-300 border-2 border-[var(--color-primary,#2C7FFF)] flex items-center justify-center gap-2.5 text-sm cursor-pointer hover:opacity-90"
            style={{
              color: 'var(--color-text, #03045E)',
              backgroundColor: 'var(--color-card, #ffffff)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary, #2C7FFF)';
              e.currentTarget.style.color = 'var(--color-button-text, #ffffff)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-card, #ffffff)';
              e.currentTarget.style.color = 'var(--color-text, #03045E)';
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Detect Current Location
          </button>

          {formData.latitude && formData.longitude && (
            <div className={`rounded-2xl overflow-hidden border-2 h-[240px] relative pointer-events-none ${isDark ? 'border-[#2C7FFF]' : 'border-[#03045E]'}`}>
              <iframe 
                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(formData.longitude) - 0.05},${Number(formData.latitude) - 0.05},${Number(formData.longitude) + 0.05},${Number(formData.latitude) + 0.05}&layer=mapnik&marker=${formData.latitude},${formData.longitude}`}
              ></iframe>
            </div>
          )}

          <div className="mt-auto pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className={`w-full py-4 font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm tracking-wide disabled:opacity-50 cursor-pointer border-2 ${isDark ? 'bg-[#2C7FFF] text-black border-[#2C7FFF] hover:bg-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Changes...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Profile Settings
                </>
              )}
            </button>
          </div>
        </div>

      </form>

      {showAlert && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative w-full max-w-sm rounded-[2rem] border-2 overflow-hidden ${isDark ? 'bg-black border-[#2C7FFF]' : 'bg-[#F4F4F4] border-[#2C7FFF]'}`}>
            <div className="h-2 w-full bg-[#2C7FFF]" />

            <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-[#2C7FFF]/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#2C7FFF] flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 ${isDark ? 'bg-[#2C7FFF] border-black' : 'bg-[#03045E] border-[#F4F4F4]'}`}>
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border-2 ${isDark ? 'text-white bg-black border-[#2C7FFF]' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
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
                className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition cursor-pointer border-2 ${isDark ? 'bg-[#2C7FFF] text-black border-[#2C7FFF] hover:bg-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
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