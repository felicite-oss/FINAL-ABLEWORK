import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;


function MapUpdater({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

const SKILL_RECOMMENDATIONS = [
  "Customer Service", "Microsoft Office", "Virtual Assistance", 
  "Problem Solving", "Graphic Design", "Node.js", "UI/UX Design", "Data Entry", "Time Management", "Teamwork"
];

const ACCOMMODATION_RECOMMENDATIONS = [
  "Wheelchair Access", "Screen Reader", "Sign Language Interpreter", 
  "Quiet Workspace", "Ergonomic Setup", "Step-Free Access", 
  "Noise-Cancelling Headphones", "Captioning Services", "Flexible Hours"
];

const DISABILITY_OPTIONS = [
  "Deafness", "Blindness", "Low Vision", "Hard of Hearing", 
  "Color Blindness", "Paralysis", "Amputation", "Cerebral Palsy", 
  "Limited Fine Motor Skills", "Wheelchair User"
];

export default function ApplicantProfile({ profile, refreshData, setProfile }) {
  
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[#03045E]">
        <div className="w-12 h-12 border-4 border-[#2C7FFF] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-lg">Loading profile data...</p>
      </div>
    );
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false); 
  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempImagePreview, setTempImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const parseInitialList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return typeof data === 'string' ? data.split(',').map(s => s.trim()).filter(Boolean) : [];
  };

  const [skills, setSkills] = useState(parseInitialList(profile?.skills));
  const [skillInput, setSkillInput] = useState('');

  const [accommodations, setAccommodations] = useState(parseInitialList(profile?.accommodations || profile?.accommodations_needed));
  const [accomInput, setAccomInput] = useState('');

  const [selectedDisabilities, setSelectedDisabilities] = useState(parseInitialList(profile?.disability_type));

  const [formData, setFormData] = useState({
    workplace_independence: profile?.workplace_independence || '',
    residential_address: profile?.residential_address || '',
    travel_radius_km: profile?.travel_radius_km || 5,
    latitude: profile?.latitude || '',
    longitude: profile?.longitude || '',
    profile_picture: profile?.profile_picture || profile?.avatar_url || localStorage.getItem('profile_picture') || ''
  });


  useEffect(() => {
    const savedPic = localStorage.getItem('profile_picture');
    const currentPic = profile?.profile_picture || profile?.avatar_url || savedPic;
    
    if (currentPic) {
      setFormData(prev => ({ ...prev, profile_picture: currentPic }));
      if (setProfile) {
        setProfile(prev => ({
          ...(prev || {}),
          profile_picture: currentPic,
          avatar_url: currentPic
        }));
      }
    }
  }, [profile?.profile_picture, profile?.avatar_url]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmChangePicture = () => {
    if (!tempImagePreview) return;
    
    setIsUpdatingPicture(true);


    setTimeout(() => {
      if (tempImagePreview) {
        setFormData(prev => ({ ...prev, profile_picture: tempImagePreview }));
        
        localStorage.setItem('profile_picture', tempImagePreview);
        window.dispatchEvent(new Event('storage'));
        
        if (setProfile) {
          setProfile(prev => ({ 
            ...(prev || {}), 
            profile_picture: tempImagePreview, 
            avatar_url: tempImagePreview 
          }));
        }
      }
      setIsUpdatingPicture(false);
      setIsModalOpen(false);
      setSelectedFile(null);
    }, 2000);
  };

  const handleCancelChangePicture = () => {
    setTempImagePreview('');
    setSelectedFile(null);
    setIsModalOpen(false);
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInput.trim().replace(/,/g, '');
      if (val && !skills.includes(val)) {
        setSkills([...skills, val]);
        setSkillInput('');
      }
    }
  };

  const addSkillChip = (skill) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput('');
    }
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
  };

  const handleAccomKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = accomInput.trim().replace(/,/g, '');
      if (val && !accommodations.includes(val)) {
        setAccommodations([...accommodations, val]);
        setAccomInput('');
      }
    }
  };

  const addAccomChip = (acc) => {
    if (!accommodations.includes(acc)) {
      setAccommodations([...accommodations, acc]);
      setAccomInput('');
    }
  };

  const removeAccom = (indexToRemove) => {
    setAccommodations(accommodations.filter((_, index) => index !== indexToRemove));
  };

  const toggleDisability = (disability) => {
    if (selectedDisabilities.includes(disability)) {
      setSelectedDisabilities(selectedDisabilities.filter(d => d !== disability));
    } else {
      setSelectedDisabilities([...selectedDisabilities, disability]);
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
      disability_type: selectedDisabilities.join(', '),
      skills: skills,
      accommodations_needed: accommodations,
      profile_picture: formData.profile_picture,
      avatar_url: formData.profile_picture
    };

    try {
      const res = await fetch(`http://localhost:5001/api/applicant/${profile?.user_id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (setProfile) {
          setProfile(prev => ({ ...(prev || {}), ...payload }));
        }
        localStorage.setItem('profile_picture', formData.profile_picture);
        window.dispatchEvent(new Event('storage'));
        alert("Profile updated successfully!");
        refreshData(); 
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
      

      <div className="mb-10 bg-[#f4f4f4] p-8 rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.06)] border border-[#03045E]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          

          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-white flex items-center justify-center text-[#03045E]">
              {formData.profile_picture ? (
                <img src={formData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-[#03045E]/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setTempImagePreview(formData.profile_picture);
                setIsModalOpen(true);
              }}
              className="absolute bottom-0 right-0 p-2.5 bg-[#2C7FFF] text-white rounded-full shadow-lg hover:bg-[#03045E] transition-all cursor-pointer border-2 border-white"
              title="Change Profile Picture"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#03045E] tracking-tight">
              {profile?.full_name || profile?.name || 'Applicant Profile'}
            </h1>
            <p className="text-sm font-semibold text-[#03045E] mt-1">
              Manage your personal settings, avatar, and smart match parameters
            </p>
          </div>
        </div>
      </div>

  
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-[#03045E]/20 flex flex-col items-center text-center">
            <h3 className="text-xl font-black text-[#03045E] mb-2">Update Profile Picture</h3>
            <p className="text-xs font-semibold text-[#03045E]/70 mb-6">Choose a new image to update your profile and header photo.</p>

            
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#2C7FFF]/30 shadow-inner mb-6 bg-gray-100 flex items-center justify-center">
              {tempImagePreview ? (
                <img src={tempImagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-14 h-14 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              )}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              className="hidden" 
            />

            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="px-6 py-2.5 bg-[#f4f4f4] border border-[#03045E]/20 text-[#03045E] font-extrabold text-xs rounded-xl hover:bg-[#03045E] hover:text-white transition-all mb-6 cursor-pointer"
            >
              Browse Image File
            </button>

          
            <div className="flex items-center gap-3 w-full">
              <button 
                type="button" 
                disabled={isUpdatingPicture}
                onClick={handleCancelChangePicture} 
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-extrabold text-sm rounded-xl hover:bg-gray-200 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={isUpdatingPicture}
                onClick={handleConfirmChangePicture} 
                className="flex-1 py-3 bg-[#2C7FFF] text-white font-extrabold text-sm rounded-xl hover:bg-[#03045E] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUpdatingPicture ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Change Profile</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
    
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
            <label className="text-sm font-bold text-[#03045E]">Skills *</label>
            <div className="p-3 bg-white border border-[#03045E]/20 rounded-2xl flex flex-wrap gap-2 items-center focus-within:border-[#2C7FFF] focus-within:ring-4 focus-within:ring-[#2C7FFF]/20 transition-all">
              {skills.map((skill, index) => (
                <span key={index} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#03045E] text-white text-xs font-bold rounded-xl shadow-sm">
                  {skill}
                  <button type="button" onClick={() => removeSkill(index)} className="hover:text-red-300 font-extrabold cursor-pointer ml-1">×</button>
                </span>
              ))}
              <input 
                type="text" 
                value={skillInput} 
                onChange={(e) => setSkillInput(e.target.value)} 
                onKeyDown={handleSkillKeyDown}
                placeholder={skills.length === 0 ? "Type a skill and press Enter..." : "Add more..."}
                className="flex-1 min-w-[140px] outline-none bg-transparent text-sm font-medium text-[#03045E] placeholder:text-[#03045E]/40 p-1"
              />
            </div>
            
            {skillInput.trim().length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 animate-fadeIn">
                {SKILL_RECOMMENDATIONS
                  .filter(s => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s))
                  .map((rec, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => addSkillChip(rec)}
                      className="px-3 py-1 bg-white border border-[#2C7FFF]/30 text-[#2C7FFF] hover:bg-[#2C7FFF] hover:text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-2xs"
                    >
                      + {rec}
                    </button>
                  ))}
              </div>
            )}
            <p className="text-xs text-[#03045E] font-semibold mt-1">These must match employer requirements to trigger a Smart Match.</p>
          </div>

          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#03045E]">Required Accommodations *</label>
            <div className="p-3 bg-white border border-[#03045E]/20 rounded-2xl flex flex-wrap gap-2 items-center focus-within:border-[#2C7FFF] focus-within:ring-4 focus-within:ring-[#2C7FFF]/20 transition-all">
              {accommodations.map((acc, index) => (
                <span key={index} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#03045E] text-white text-xs font-bold rounded-xl shadow-sm">
                  {acc}
                  <button type="button" onClick={() => removeAccom(index)} className="hover:text-red-300 font-extrabold cursor-pointer ml-1">×</button>
                </span>
              ))}
              <input 
                type="text" 
                value={accomInput} 
                onChange={(e) => setAccomInput(e.target.value)} 
                onKeyDown={handleAccomKeyDown}
                placeholder={accommodations.length === 0 ? "Type an accommodation and press Enter..." : "Add more..."}
                className="flex-1 min-w-[140px] outline-none bg-transparent text-sm font-medium text-[#03045E] placeholder:text-[#03045E]/40 p-1"
              />
            </div>

            {accomInput.trim().length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 animate-fadeIn">
                {ACCOMMODATION_RECOMMENDATIONS
                  .filter(a => a.toLowerCase().includes(accomInput.toLowerCase()) && !accommodations.includes(a))
                  .map((rec, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => addAccomChip(rec)}
                      className="px-3 py-1 bg-white border border-purple-300 text-purple-700 hover:bg-purple-600 hover:text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-2xs"
                    >
                      + {rec}
                    </button>
                  ))}
              </div>
            )}
            <p className="text-xs text-[#03045E] font-semibold mt-1">The Smart Engine will only show you jobs that provide these exact accommodations.</p>
          </div>


          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#03045E]">Primary Disability Type *</label>
            <div className="flex flex-wrap gap-2 p-3 bg-white border border-[#03045E]/20 rounded-2xl">
              {DISABILITY_OPTIONS.map((option, i) => {
                const isSelected = selectedDisabilities.includes(option);
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => toggleDisability(option)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] shadow-md' 
                        : 'bg-white text-[#03045E] border-gray-200 hover:border-[#2C7FFF]'
                    }`}
                  >
                    <span>{option}</span>
                    <span className="font-extrabold">{isSelected ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
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
            <div className="rounded-2xl overflow-hidden border border-[#03045E]/20 h-[220px] relative shadow-inner bg-gray-100 z-0">
              <MapContainer 
                center={[Number(formData.latitude), Number(formData.longitude)]} 
                zoom={11} 
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={[Number(formData.latitude), Number(formData.longitude)]} />
                <Circle 
                  center={[Number(formData.latitude), Number(formData.longitude)]}
                  radius={Number(formData.travel_radius_km) * 1000} 
                  pathOptions={{ color: '#2C7FFF', fillColor: '#2C7FFF', fillOpacity: 0.15, weight: 2 }}
                />
                <MapUpdater lat={Number(formData.latitude)} lng={Number(formData.longitude)} />
              </MapContainer>
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