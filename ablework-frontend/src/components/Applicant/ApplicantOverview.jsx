import React, { useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { AccessibilityContext } from '../../context/AccessibilityContext';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

const MatchJobIcon = L.divIcon({
  className: 'custom-job-icon',
  html: `<div style="background-color: #10B981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const OtherJobIcon = L.divIcon({
  className: 'custom-job-icon',
  html: `<div style="background-color: #2C7FFF; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

export default function ApplicantOverview({ profile, matchesCount, matches = [], jobs = [], applications = [], setActiveTab }) {
  const { mode } = useContext(AccessibilityContext);
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  const calculateProfileStrength = () => {
    let score = 50; 
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (profile.accommodations && profile.accommodations.length > 0) score += 15;
    if (profile.pwd_document_path) score += 15;
    return score;
  };

  const profileStrength = calculateProfileStrength();
  const recentApps = applications.slice(0, 4);
  const radiusKm = profile.radius ? Number(profile.radius) : 10;
  const userLat = profile.latitude ? Number(profile.latitude) : null;
  const userLng = profile.longitude ? Number(profile.longitude) : null;
  const jobListToMap = jobs && jobs.length > 0 ? jobs : matches;

  const nearbyJobs = jobListToMap.filter(job => {
    if (!job.latitude || !job.longitude || !userLat || !userLng) return false;
    const dist = getDistanceFromLatLonInKm(userLat, userLng, Number(job.latitude), Number(job.longitude));
    return dist !== null && dist <= radiusKm;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Under Review':
        return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Shortlisted':
        return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Hired':
        return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Rejected':
        return 'opacity-90';
      default:
        return 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20';
    }
  };

  const getRejectedStyle = (status) => {
    if (status !== 'Rejected') return undefined;
    return {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#b91c1c',
      borderColor: 'rgba(239, 68, 68, 0.5)'
    };
  };

  return (
    <div className="animate-fadeIn w-full space-y-6 sm:space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-10">
      
      {/*header*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#03045E]">
            Welcome back, {profile.firstname}!
          </h2>
          <p className="text-[#03045E] mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-base font-semibold">
            Here is a quick snapshot of your job search progress today.
          </p>
        </div>
      </div>

      {/* status(babaw)*/}
      <div className="grid grid-cols-3 gap-2 sm:gap-8">
        
     
        <div 
          onClick={() => setActiveTab('profile')}
          className="relative overflow-hidden p-2.5 sm:p-8 rounded-[10px] sm:rounded-[2rem] bg-white shadow-md border border-[#03045E]/20 flex flex-col justify-between cursor-pointer hover:border-[#2C7FFF] hover:shadow-xl transition-all duration-200"
        >
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-0.5 sm:gap-0 mb-1.5 sm:mb-6">
              <span className="text-[8px] sm:text-xs font-extrabold uppercase tracking-widest text-[#03045E] leading-tight">Profile Strength</span>
              <span className="text-sm sm:text-3xl font-extrabold text-[#03045E]">{profileStrength}%</span>
            </div>
            <div className="w-full bg-[#f4f4f4] rounded-full h-1.5 sm:h-3 overflow-hidden mb-1.5 sm:mb-4 border border-[#03045E]/20">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out bg-[#2C7FFF]" 
                style={{ width: `${profileStrength}%` }}
              ></div>
            </div>
            <div className="min-h-[20px] sm:min-h-[24px] flex items-center">
              {profileStrength < 100 ? (
                <p className="text-[7px] sm:text-xs text-[#03045E] font-bold leading-tight">Update your skills and accommodations to reach 100%.</p>
              ) : (
                <p className="text-[7px] sm:text-xs text-[#03045E] font-extrabold flex items-center gap-1 sm:gap-1.5 bg-[#f4f4f4] py-0.5 px-1.5 sm:py-1.5 sm:px-3 rounded-full w-fit border border-[#03045E]/30">
                  <svg className="w-2 h-2 sm:w-4 sm:h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Profile fully optimized!
                </p>
              )}
            </div>
          </div>
        </div>

        {/*smart matches*/}
        <div 
          onClick={() => setActiveTab('explore-jobs')}
          className="p-2.5 sm:p-8 rounded-[10px] sm:rounded-[2rem] bg-white shadow-md border border-[#03045E]/20 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-6 cursor-pointer hover:border-[#2C7FFF] hover:shadow-xl transition-all duration-200"
        >
          <div className="w-6 h-6 sm:w-16 sm:h-16 rounded-md sm:rounded-[1.25rem] bg-[#f4f4f4] flex items-center justify-center text-[#2C7FFF] shrink-0 border border-[#03045E]/20">
            <svg className="w-3.5 h-3.5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[8px] sm:text-xs font-extrabold uppercase tracking-widest text-[#03045E] mb-0 sm:mb-1 leading-tight">Smart Matches</span>
            <span className="text-sm sm:text-4xl font-black text-[#03045E] tracking-tight">{matchesCount}</span>
          </div>
        </div>

        {/* total applications */}
        <div 
          onClick={() => setActiveTab('tracker')}
          className="p-2.5 sm:p-8 rounded-[10px] sm:rounded-[2rem] bg-white shadow-md border border-[#03045E]/20 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-6 cursor-pointer hover:border-[#2C7FFF] hover:shadow-xl transition-all duration-200"
        >
          <div className="w-6 h-6 sm:w-16 sm:h-16 rounded-md sm:rounded-[1.25rem] bg-[#f4f4f4] flex items-center justify-center text-[#2C7FFF] shrink-0 border border-[#03045E]/20">
            <svg className="w-3.5 h-3.5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[8px] sm:text-xs font-extrabold uppercase tracking-widest text-[#03045E] mb-0 sm:mb-1 leading-tight">Applications</span>
            <span className="text-sm sm:text-4xl font-black text-[#03045E] tracking-tight">{applications.length}</span>
          </div>
        </div>

      </div>

      {/* Map Container - Adjusted Padding & Flex for Mobile */}
      <div className="p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-white shadow-md border border-[#03045E]/20 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#2C7FFF]/15 text-[#2C7FFF] text-[10px] sm:text-xs font-extrabold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider border border-[#2C7FFF]/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2C7FFF] animate-ping"></span> Live Radar
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#03045E]">Job Discovery Map</h3>
            <div className="text-[11px] sm:text-sm font-semibold text-[#03045E] mt-1.5 flex flex-row flex-wrap gap-x-3 gap-y-1">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Smart Matches</span> 
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span> Other Opportunities</span>
            </div>
          </div>
        </div>

        {userLat && userLng ? (
          <div className="h-[300px] sm:h-[400px] w-full rounded-[1rem] sm:rounded-[1.5rem] overflow-hidden border border-[#03045E]/20 z-0 relative shadow-inner">
            <MapContainer center={[userLat, userLng]} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <Marker position={[userLat, userLng]}>
                <Popup className="font-bold text-[#03045E]">
                  Your Home Location
                </Popup>
              </Marker>

              <Circle 
                center={[userLat, userLng]} 
                radius={radiusKm * 1000} 
                pathOptions={{ color: '#03045E', fillColor: '#03045E', fillOpacity: 0.05, weight: 1.5, dashArray: '5, 5' }} 
              />

              {nearbyJobs.map((job) => {
                const isMatch = matches.some(match => match.id === job.id);

                return (
                  <Marker 
                    key={job.id} 
                    position={[Number(job.latitude), Number(job.longitude)]}
                    icon={isMatch ? MatchJobIcon : OtherJobIcon}
                  >
                    <Popup>
                      <div className="flex flex-col gap-1 min-w-[150px]">
                        {isMatch && (
                           <span className="px-2 py-0.5 bg-green-100 text-white text-[10px] font-extrabold rounded-full w-fit mb-1">★ SMART MATCH</span>
                        )}
                        <p className="font-extrabold text-[#03045E] text-sm leading-tight m-0">{job.job_title}</p>
                        <p className="text-xs font-semibold text-gray-500 m-0 mb-1">{job.company_name}</p>
                        <button 
                          onClick={() => setActiveTab('explore-jobs')} 
                          className={`mt-1 w-full py-1.5 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer ${isMatch ? 'bg-green-600 hover:bg-green-700' : 'bg-[#2C7FFF] hover:bg-[#03045E]'}`}
                        >
                          View Job
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
              <MapRecenter lat={userLat} lng={userLng} />
            </MapContainer>
          </div>
        ) : (
          <div className="h-[300px] sm:h-[400px] w-full rounded-[1rem] sm:rounded-[1.5rem] border-2 border-dashed border-[#03045E]/30 bg-[#f4f4f4] flex flex-col items-center justify-center text-center p-4 sm:p-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 sm:mb-4 border border-[#03045E]/20 text-[#2C7FFF]">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-[#03045E]">Map Unavailable</p>
            <p className="text-xs sm:text-sm font-semibold text-[#03045E]/70 mt-1 max-w-xs sm:max-w-sm">
              Please update your home address in your profile settings to enable the Job Discovery Map.
            </p>
            <button onClick={() => setActiveTab('settings')} className="mt-4 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#2C7FFF] text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-[#03045E] transition-colors shadow-sm cursor-pointer">
              Update Location
            </button>
          </div>
        )}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Recent Applications - Adjusted padding & list layout for mobile */}
        <div className="p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-white shadow-md border border-[#03045E]/20 flex flex-col min-h-[350px] sm:min-h-[420px]">
          <div className="flex justify-between items-end mb-4 sm:mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#03045E]">Recent Applications</h3>
              <p className="text-xs sm:text-sm font-semibold text-[#03045E] mt-1">Track your latest moves.</p>
            </div>
            <button onClick={() => setActiveTab('tracker')} className="text-xs sm:text-sm font-extrabold text-[#2C7FFF] hover:underline flex items-center gap-1 cursor-pointer">
              View All 
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
          
          <div className="flex-1 flex flex-col gap-3 sm:gap-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {recentApps.length > 0 ? (
              recentApps.map((app) => (
                <div key={app.application_id} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#03045E]/20 bg-[#f4f4f4] flex justify-between items-center hover:bg-white transition-all duration-200">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#03045E]/20 text-[#2C7FFF] font-extrabold text-sm sm:text-lg shrink-0">
                      {app.company_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-extrabold text-[#03045E] text-sm sm:text-base leading-tight">{app.job_title}</p>
                      <p className="text-[10px] sm:text-xs font-bold text-[#03045E] mt-0.5">{app.company_name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 sm:gap-1.5 shrink-0">
                    <span 
                      className={`text-[9px] sm:text-[11px] font-extrabold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border ${getStatusStyle(app.status)}`}
                      style={getRejectedStyle(app.status)}
                    >
                      {app.status}
                    </span>
                    <p className="text-[9px] sm:text-[10px] font-bold text-[#03045E] uppercase tracking-wider">
                      {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-[#03045E]/30 rounded-[1.5rem] p-6 sm:p-8 bg-[#f4f4f4] text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 sm:mb-4 border border-[#03045E]/20">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <p className="text-sm sm:text-base font-bold text-[#03045E]">No applications yet.</p>
                <p className="text-[10px] sm:text-xs font-semibold text-[#03045E] mt-1 max-w-[200px]">Start exploring jobs to see your activity here.</p>
              </div>
            )}
          </div>
        </div>


        <div className="flex flex-col gap-6 sm:gap-8">
          
          {/* Smart Engine Card - Adjusted Padding & Fonts */}
          <div className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-white shadow-md border border-[#03045E]/20 flex flex-col justify-center">
            <span className="inline-block px-2.5 sm:px-3 py-1 bg-[#f4f4f4] border border-[#03045E]/20 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[#2C7FFF] mb-3 sm:mb-4 w-fit">Smart Engine</span>
            <h3 className="text-xl sm:text-2xl font-black mb-1.5 sm:mb-2 text-[#03045E] leading-tight">Find Your Perfect Fit</h3>
            <p className="text-xs sm:text-sm font-semibold text-[#03045E] mb-4 sm:mb-6 max-w-[95%] sm:max-w-[90%] leading-relaxed">
              We've analyzed your skills and travel radius to pinpoint jobs tailored exactly for you.
            </p>
            <button onClick={() => setActiveTab('explore-jobs')} className={`flex items-center justify-center gap-2 w-full px-4 sm:px-6 py-3 sm:py-3.5 bg-white border-2 border-[#2C7FFF] font-extrabold text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-sm cursor-pointer text-[#03045E]`}>
              View Your Matches
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>


          {/* Marketplace Card - Adjusted Padding & Fonts */}
          <div className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-white shadow-md border border-[#03045E]/20 flex flex-col justify-center flex-1">
             <div className="mb-2 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#f4f4f4] border border-[#03045E]/20 flex items-center justify-center text-[#03045E]">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
             </div>
             <h3 className="text-xl sm:text-2xl font-black mb-1.5 sm:mb-2 text-[#03045E] leading-tight">Explore the Marketplace</h3>
             <p className="text-xs sm:text-sm font-semibold text-[#03045E] mb-4 sm:mb-6 max-w-[95%] sm:max-w-[90%] leading-relaxed">
             Browse all available job postings from verified inclusive employers across the platform.
             </p>
             <button
               onClick={() => setActiveTab('explore-jobs')}
               className="flex items-center justify-center gap-2 w-full px-4 sm:px-6 py-3 sm:py-3.5 bg-white border-2 border-[#2C7FFF] font-extrabold text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-sm cursor-pointer text-[#03045E]"
             >
                Explore All Jobs
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
             </button>
          </div>

        </div>

      </div>
    </div>
  );
}