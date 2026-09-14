import { useState, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';
import lightLogo from '../assets/LIGHT MODE.png';
import darkLogo from '../assets/DARK MODE.png';
import backgroundImg from '../assets/BG.png';

export default function EmployerRegister() {
  const { mode } = useContext(AccessibilityContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [industry, setIndustry] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [verificationDoc, setVerificationDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsMapModalOpen(true);
    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          }
        } catch (error) {
          console.error("Error fetching address:", error);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsDetecting(false);
        alert("Location access denied. Please allow location access or close the map and type manually.");
      }
    );
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    

    if (password !== confirmPassword) {
      setStatusMessage({ type: 'error', text: "Passwords do not match. Please check and try again." });
      return;
    }

    setIsLoading(true);

    
    const formData = new FormData();
    formData.append('companyName', companyName);
    formData.append('companyDescription', companyDescription);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('industry', industry);
    formData.append('jobRole', jobRole);
    formData.append('address', address);
    
    
    if (lat) formData.append('latitude', lat);
    if (lng) formData.append('longitude', lng);
    if (verificationDoc) {
      formData.append('verificationDocument', verificationDoc);
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/register/employer', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate('/login');
        }, 2000);
      } else {
        setStatusMessage({ type: 'error', text: data.message || "Registration failed." });
      }
    } catch (error) {
      console.error("Server Error:", error);
      setStatusMessage({ type: 'error', text: "Cannot connect to the server." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={`h-screen flex flex-col ${isContrast ? 'bg-black text-white' : 'bg-[#f4f4f4] text-[#03045E]'} overflow-hidden`}>
      
      <header className={`w-full ${isContrast ? 'bg-black border-b border-white/20' : 'bg-[#f4f4f4] border-b border-[#03045E]/10'} fixed top-0 left-0 z-50`}>
        <div className="w-full h-16 pl-4 pr-4 md:pr-8 flex items-center justify-between max-w-[1700px] mx-auto box-border">
          <div className="flex items-center gap-8">
            <div className="flex items-center flex-shrink-0 py-1">
              <img src={isContrast ? darkLogo : lightLogo} alt="AbleWork Logo" className="h-14 w-auto object-contain max-h-full" />
            </div>
            <nav className={`hidden md:flex items-center gap-6 text-[15px] font-medium ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
              <Link to="/" className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition`}>Home</Link>
              <Link to="/about" className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition`}>About Us</Link>
              <Link to="/policy" className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition`}>Policy</Link>
            </nav>
          </div>
          <div className="hidden md:flex items-center">
            <NavLink
              to="/login"
              className={({ isActive }) => 
                `px-5 py-2 rounded-full bg-transparent text-[#03045E] text-sm font-bold border-2 border-[#03045E] hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF] transform duration-200 transition whitespace-nowrap ${
                  isActive 
                    ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] underline font-semibold' 
                    : ''
                }`
              }
            >
              Log In
            </NavLink>
          </div>
          <button
            className={`md:hidden flex items-center justify-center w-10 h-10 rounded-lg ${isContrast ? 'bg-blue-400 text-black font-bold' : 'bg-[#2C7FFF] text-[#f4f4f4]'}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>

      
      <div
        className={`fixed inset-0 top-16 z-40 flex items-center justify-center p-4 overflow-y-auto transition-all duration-300 ${isOpen ? 'mt-48 sm:mt-56' : 'mt-0'}`}
        role="region"
        aria-label="Employer registration area"
      >
        
        <div
          className="absolute inset-0 max-w-[1700px] mx-auto w-full bg-no-repeat bg-cover bg-center md:bg-[size:1100px_auto] md:bg-left pointer-events-none"
          style={{
            backgroundImage: `url(${backgroundImg})`,
          }}
          aria-hidden="true"
        />
        
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none" aria-hidden="true" />

        
        <div className={`w-full max-w-2xl max-h-[85vh] flex flex-col ${isContrast ? 'bg-black/95 text-white border-2 border-blue-400 shadow-[0_0_25px_rgba(0,204,21,0.4)]' : 'bg-white/95 text-[#03045E] border border-[#03045E]/10'} rounded-3xl shadow-2xl overflow-hidden relative z-50 my-auto`}>
          
          <div className={`flex-shrink-0 px-6 pt-6 pb-4 border-b ${isContrast ? 'border-white/20 bg-zinc-900' : 'border-[#03045E]/10 bg-white/90'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tighter ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
                  Employer Registration
                </h1>
                <p className={`text-sm mt-0.5 ${isContrast ? 'text-white/80' : 'text-[#03045E]/70'}`}>
                  Create your company profile to start posting inclusive jobs
                </p>
              </div>
              <Link
                to="/register-select"
                className={`w-9 h-9 flex items-center justify-center rounded-full transition ${isContrast ? 'bg-zinc-800 text-blue-300 hover:bg-blue-400 hover:text-black' : 'bg-[#f4f4f4] text-[#03045E] hover:bg-[#03045E] hover:text-white'}`}
                aria-label="Close and go back to role selection"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>
          </div>

          
          <div className="flex-1 overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {statusMessage.text && (
              <div
                role="alert"
                aria-live="assertive"
                className={`p-4 mb-6 rounded-xl font-bold text-center border-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-green-100 text-green-800 border-green-400'
                    : 'bg-red-100 text-red-800 border-red-400'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-7" autoComplete="off" aria-label="Employer registration form">
              
             
              <div className="flex flex-col gap-4">
                <h2 className={`text-sm font-bold border-b pb-2 ${isContrast ? 'text-blue-300 border-white/20' : 'text-[#03045E] border-[#03045E]/10'}`}>
                  1. Company & Account Credentials
                </h2>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="companyName" className={`text-sm font-semibold ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Company Name <span className="text-[#03045E]">*</span></label>
                  <input
                    id="companyName"
                    type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required
                    aria-required="true"
                    className={`w-full p-3 border rounded-xl transition ${isContrast ? 'bg-zinc-900 border-blue-400 text-white focus:border-blue-300' : 'bg-white border-[#03045E]/20 text-[#03045E] focus:border-[#2C7FFF]'}`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="companyDescription" className={`text-sm font-semibold ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Company Description <span className="text-[#03045E]">*</span></label>
                  <textarea
                    id="companyDescription"
                    value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} required rows="3"
                    placeholder="Briefly describe what your company does..."
                    aria-required="true"
                    className={`w-full p-3 border rounded-xl transition resize-none ${isContrast ? 'bg-zinc-900 border-blue-400 text-white focus:border-blue-300' : 'bg-white border-[#03045E]/20 text-[#03045E] focus:border-[#2C7FFF]'}`}
                  ></textarea>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="industry" className={`text-sm font-semibold ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Industry Type <span className="text-[#03045E]">*</span></label>
                  <input
                    id="industry"
                    type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} required placeholder="e.g. Technology"
                    aria-required="true"
                    className={`w-full p-3 border rounded-xl transition ${isContrast ? 'bg-zinc-900 border-blue-400 text-white focus:border-blue-300' : 'bg-white border-[#03045E]/20 text-[#03045E] focus:border-[#2C7FFF]'}`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className={`text-sm font-semibold ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Work Email <span className="text-[#03045E]">*</span></label>
                  <input
                    id="email"
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off"
                    aria-required="true"
                    className={`w-full p-3 border rounded-xl transition ${isContrast ? 'bg-zinc-900 border-blue-400 text-white focus:border-blue-300' : 'bg-white border-[#03045E]/20 text-[#03045E] focus:border-[#2C7FFF]'}`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className={`text-sm font-semibold ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Telephone Number <span className="text-[#03045E]">*</span></label>
                  <input
                    id="phone"
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                    aria-required="true"
                    className={`w-full p-3 border rounded-xl transition ${isContrast ? 'bg-zinc-900 border-blue-400 text-white focus:border-blue-300' : 'bg-white border-[#03045E]/20 text-[#03045E] focus:border-[#2C7FFF]'}`}
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className={`text-sm font-semibold ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Password <span className="text-[#03045E]">*</span></label>
                  <input
                    id="password"
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password"
                    aria-required="true"
                    className={`w-full p-3 border rounded-xl transition ${isContrast ? 'bg-zinc-900 border-blue-400 text-white focus:border-blue-300' : 'bg-white border-[#03045E]/20 text-[#03045E] focus:border-[#2C7FFF]'}`}
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className={`text-sm font-semibold ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Confirm Password <span className="text-[#03045E]">*</span></label>
                  <input
                    id="confirmPassword"
                    type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password"
                    aria-required="true"
                    className={`w-full p-3 border rounded-xl transition ${isContrast ? 'bg-zinc-900 border-blue-400 text-white focus:border-blue-300' : 'bg-white border-[#03045E]/20 text-[#03045E] focus:border-[#2C7FFF]'}`}
                  />
                </div>

              </div>

              
              <div className="flex flex-col gap-4">
                <h2 className={`text-sm font-bold border-b pb-2 ${isContrast ? 'text-blue-300 border-white/20' : 'text-[#03045E] border-[#03045E]/10'}`}>
                  2. Job Profile & Location
                </h2>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="jobRole" className={`text-sm font-semibold ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Primary Job Role / Title <span className="text-[#03045E]">*</span></label>
                  <input
                    id="jobRole"
                    type="text" value={jobRole} onChange={(e) => setJobRole(e.target.value)} required placeholder="e.g. Hiring Manager"
                    aria-required="true"
                    className={`w-full p-3 border rounded-xl transition ${isContrast ? 'bg-zinc-900 border-blue-400 text-white focus:border-blue-300' : 'bg-white border-[#03045E]/20 text-[#03045E] focus:border-[#2C7FFF]'}`}
                  />
                </div>

                <div className={`flex flex-col gap-3 p-4 border rounded-2xl ${isContrast ? 'bg-zinc-900 border-blue-400/50' : 'bg-[#2C7FFF]/5 border-[#2C7FFF]/30'}`}>
                  <div>
                    <label className={`text-sm font-bold ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Workplace Location <span className="text-[#03045E]">*</span></label>
                    <p className={`text-xs mt-0.5 ${isContrast ? 'text-white/70' : 'text-[#03045E]/70'}`}>
                      Pinpoint your office location to match with nearby applicants.
                    </p>
                  </div>
                  
                  <button
                    type="button" onClick={handleDetectLocation}
                    className={`w-full px-5 py-2.5 rounded-full text-sm font-semibold transition ${isContrast ? 'bg-blue-400 text-black hover:bg-blue-300 font-bold' : 'bg-[#2C7FFF] text-white hover:bg-[#03045E]'}`}
                    aria-label="Open map and detect current workplace location"
                  >
                    Open Map & Detect Location
                  </button>
                  
                  <label htmlFor="address" className="sr-only">Physical Address</label>
                  <input
                    id="address"
                    type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Physical Address"
                    aria-required="true"
                    className={`w-full p-3 border rounded-xl transition ${isContrast ? 'bg-zinc-900 border-blue-400 text-white focus:border-blue-300' : 'bg-white border-[#03045E]/20 text-[#03045E] focus:border-[#2C7FFF]'}`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h2 className={`text-sm font-bold border-b pb-2 ${isContrast ? 'text-blue-300 border-white/20' : 'text-[#03045E] border-[#03045E]/10'}`}>
                  3. Verification Documents
                </h2>
                
                <div className={`flex flex-col gap-3 p-4 border rounded-2xl ${isContrast ? 'bg-zinc-900 border-blue-400/50' : 'bg-white border-[#03045E]/20'}`}>
                  <div>
                    <label htmlFor="verificationDoc" className={`text-sm font-bold ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Company Registration (DTI / SEC / Mayor's Permit) <span className="text-[#03045E]">*</span></label>
                    <p className={`text-xs mt-0.5 ${isContrast ? 'text-white/70' : 'text-[#03045E]/70'}`}>
                      Required by Admin to verify your legitimacy before jobs go live. (PDF, JPG, PNG)
                    </p>
                  </div>
                  <input
                    id="verificationDoc"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setVerificationDoc(e.target.files[0])}
                    required
                    aria-required="true"
                    className={`w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold transition cursor-pointer ${isContrast ? 'text-white file:bg-blue-400 file:text-black hover:file:bg-blue-300' : 'text-[#03045E] file:bg-[#03045E] file:text-white hover:file:bg-[#2C7FFF]'}`}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={isLoading}
                className={`w-full py-3.5 text-base font-semibold rounded-full shadow-md transition disabled:opacity-50 mt-2 ${isContrast ? 'bg-blue-400 text-black hover:bg-blue-300 font-black shadow-[0_0_15px_rgba(0,204,21,0.3)]' : 'bg-[#03045E] hover:bg-[#2C7FFF] text-white'}`}
                aria-label={isLoading ? "Submitting registration" : "Complete Employer Registration"}
              >
                {isLoading ? 'Submitting...' : 'Complete Employer Registration'}
              </button>
            </form>

            <p className={`mt-6 text-center text-sm ${isContrast ? 'text-white/80' : 'text-[#03045E]/80'}`}>
              <Link to="/register-select" className={`font-bold hover:underline ${isContrast ? 'text-blue-300' : 'text-[#2C7FFF]'}`}>
                ← Back to Role Selection
              </Link>
            </p>
          </div>
        </div>
      </div>

    
      {isMapModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="map-modal-title"
        >
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-[#03045E] text-white p-4 flex justify-between items-center">
              <h3 id="map-modal-title" className="font-semibold text-base">Workplace Location</h3>
              <button 
                onClick={() => setIsMapModalOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition"
                aria-label="Close map"
              >
                ✕
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {isDetecting ? (
                <div className="h-60 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200" aria-live="polite">
                  <p className="text-sm font-medium text-gray-500 animate-pulse">Detecting your location...</p>
                </div>
              ) : lat && lng ? (
                <>
                  <div className="h-60 rounded-xl overflow-hidden border border-gray-300">
                    <iframe 
                      width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`}
                      title="Workplace location map"
                    ></iframe>
                  </div>
                  <p className="text-sm font-medium text-[#03045E] bg-[#f4f4f4] p-3 rounded-xl border border-[#03045E]/10">
                    Detected Address: <br/>
                    <span className="font-normal text-[#2C7FFF]">{address}</span>
                  </p>
                </>
              ) : (
                <div className="h-60 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm font-medium text-red-500">Location access failed. Please try again.</p>
                </div>
              )}
              <button 
                onClick={() => setIsMapModalOpen(false)} 
                className="w-full bg-[#03045E] hover:bg-[#2C7FFF] text-white py-3 rounded-full text-sm font-semibold transition"
              >
                Confirm & Close Map
              </button>
            </div>
          </div>
        </div>
      )}

   
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#03045E]/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <div className="relative w-full max-w-sm bg-[#f4f4f4] rounded-3xl shadow-2xl border-2 border-[#2C7FFF]/30 overflow-hidden animate-fadeIn">
            
            <div className="h-1.5 w-full bg-gradient-to-r from-[#03045E] via-[#2C7FFF] to-[#03045E]" />

            <div className="px-8 pt-8 pb-8 flex flex-col items-center text-center">
         
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#2C7FFF] flex items-center justify-center shadow-lg shadow-[#2C7FFF]/40">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#03045E] flex items-center justify-center">
                  <span className="text-white text-xs font-black">✓</span>
                </div>
              </div>

              <h2 id="success-title" className="text-2xl font-black text-[#03045E] tracking-tight mb-2">
                You’re all set!
              </h2>
              <p className="text-sm text-[#03045E]/75 font-medium leading-relaxed mb-4">
                Registration completed successfully.
              </p>

           
              <div className="flex items-center gap-1.5" aria-label="Redirecting to login">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:300ms]" />
              </div>
              <p className="text-xs text-[#2C7FFF] font-semibold mt-3">
                Taking you to Log In…
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}