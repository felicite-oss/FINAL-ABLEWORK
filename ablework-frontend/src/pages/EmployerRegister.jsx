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
  const isDarkMode = mode && typeof mode === 'string' && mode.toLowerCase().includes('dark');
  const useBlackText = isContrast || isDarkMode;
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

  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

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
        alert("Location access denied. Please allow location access or type manually.");
      }
    );
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    
    if (!agreedTerms || !agreedPrivacy) {
      setStatusMessage({ type: 'error', text: "You must agree to the Terms and Conditions and Privacy Policy to register." });
      return;
    }

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
    <main className={`h-[100dvh] flex flex-col ${isContrast ? 'bg-black text-white' : 'bg-[#f4f4f4] text-[#03045E]'} overflow-hidden relative`}>

      <div
        className="fixed inset-0 bg-no-repeat bg-cover bg-center md:bg-[size:1100px_auto] md:bg-left pointer-events-none z-0"
        style={{
          backgroundImage: `url(${backgroundImg})`,
        }}
        aria-hidden="true"
      />

      <div className="fixed inset-0 backdrop-blur-[2px] pointer-events-none z-0" aria-hidden="true" />

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
            type="button"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            className={`md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition ${isContrast ? 'bg-blue-400 text-black font-bold' : 'bg-[#2C7FFF] text-[#f4f4f4]'}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {isOpen && (
          <div className={`md:hidden w-full border-t ${isContrast ? 'bg-black border-white/20' : 'bg-[#f4f4f4] border-[#03045E]/10'} shadow-lg`}>
            <nav className={`flex flex-col px-4 py-4 gap-3 text-[15px] font-medium ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
              <Link to="/" onClick={() => setIsOpen(false)} className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition py-2 px-2 rounded-lg`}>Home</Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition py-2 px-2 rounded-lg`}>About Us</Link>
              <Link to="/policy" onClick={() => setIsOpen(false)} className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition py-2 px-2 rounded-lg`}>Policy</Link>
              <NavLink
                to="/login"
                onClick={() => setIsOpen(false)}
                className={`mt-2 inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-bold border-2 transition ${
                  isContrast
                    ? 'text-white border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                    : 'text-[#03045E] border-[#03045E] hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF]'
                }`}
              >
                Log In
              </NavLink>
            </nav>
          </div>
        )}
      </header>

      <div
        className={`flex-1 min-h-0 pt-16 flex items-center justify-center px-4 md:px-8 max-w-[1700px] mx-auto w-full box-border relative z-10 overflow-hidden transition-all duration-300 ${isOpen ? 'mt-48 sm:mt-56' : 'mt-0'}`}
        role="region"
        aria-label="Employer registration area"
      >

        <div className="w-full max-w-2xl h-[85vh] max-h-full flex flex-col bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-[#03045E]/10 overflow-hidden relative z-50 animate-fadeIn">

          <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[#03045E]/10 bg-white/90">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#03045E]">
                  Employer Registration
                </h1>
                <p className="text-sm text-[#03045E]/70 mt-0.5">
                  Create your company profile to start posting inclusive jobs
                </p>
              </div>
              <Link
                to="/register-select"
                aria-label="Go back to role selection"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#03045E]/10 text-[#03045E]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {statusMessage.text && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-4 mb-6 rounded-xl font-bold text-center border-2"
                style={statusMessage.type === 'success'
                  ? { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#4ade80' }
                  : { backgroundColor: '#ffffff', color: '#dc2626', borderColor: '#dc2626' }
                }
              >
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-7" autoComplete="off">

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="companyName" className="text-sm font-semibold text-[#03045E]">Company Name <span className="text-[#03045E]">*</span></label>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your Company Name"
                    required
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                    title="Please enter your registered company name."
                    aria-label="Company Name. Please enter your registered company name."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="companyDescription" className="text-sm font-semibold text-[#03045E]">Company Description <span className="text-[#03045E]">*</span></label>
                  <textarea
                    id="companyDescription"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    placeholder="Briefly describe what your company does..."
                    required
                    rows="3"
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition resize-none"
                    title="Please briefly describe what your company does."
                    aria-label="Company Description. Please briefly describe what your company does."
                  ></textarea>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="industry" className="text-sm font-semibold text-[#03045E]">Industry Type <span className="text-[#03045E]">*</span></label>
                  <input
                    id="industry"
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Technology"
                    required
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                    title="Please enter the industry your company belongs to."
                    aria-label="Industry Type. Please enter the industry your company belongs to."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-[#03045E]">Work Email <span className="text-[#03045E]">*</span></label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your Work Email"
                    required
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                    title="Please enter a valid work email address for your account."
                    aria-label="Work Email. Please enter a valid work email address for your account."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-sm font-semibold text-[#03045E]">Telephone Number <span className="text-[#03045E]">*</span></label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your Telephone Number"
                    required
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                    title="Please enter your active company contact number."
                    aria-label="Telephone Number. Please enter your active company contact number."
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-sm font-semibold text-[#03045E]">Password <span className="text-[#03045E]">*</span></label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Password"
                    required
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                    title="Please create a secure password with at least 6 characters."
                    aria-label="Password. Please create a secure password with at least 6 characters."
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className="text-sm font-semibold text-[#03045E]">Confirm Password <span className="text-[#03045E]">*</span></label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your Password"
                    required
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                    title="Please re-enter your password to confirm it matches."
                    aria-label="Confirm Password. Please re-enter your password to confirm it matches."
                  />
                </div>

              </div>

              <hr className="border-[#03045E]/10" />

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-bold text-[#03045E]">Primary Job Role / Title <span className="text-[#03045E]">*</span></legend>
                <input
                  id="jobRole"
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. Hiring Manager"
                  required
                  className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                  title="Please enter your primary job role or title within the company."
                  aria-label="Primary Job Role or Title. Please enter your primary job role or title within the company."
                />
              </fieldset>

              <div className="flex flex-col gap-3 p-5 border border-[#2C7FFF]/30 rounded-2xl bg-[var(--color-accentSoft)]">
                <label htmlFor="address" className="text-xl font-bold text-[#03045E]">Workplace Location <span className="text-[#03045E]">*</span></label>
                <p className="text-xs text-gray-500">Pinpoint your office location to match with nearby applicants.</p>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className={`inline-flex items-center justify-center gap-2 bg-[#2C7FFF] ${useBlackText ? '!text-black' : 'text-white'} px-5 py-2.5 rounded-full text-sm font-semibold shadow-md hover:bg-[#03045E] transition`}
                  title="Click to automatically detect and fill your workplace location."
                  aria-label="Open Map and Detect Location. Click to automatically detect and fill your workplace location."
                >
                  <svg className={`w-5 h-5 shrink-0 ${useBlackText ? '!text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Open Map & Detect Location</span>
                </button>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your Workplace Address (e.g. 123 Main Street, Makati)"
                  required
                  className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E]"
                  title="Please enter your full workplace address or use the detect location button."
                  aria-label="Workplace Location. Please enter your full workplace address or use the detect location button."
                />
                {isDetecting ? (
                  <div className="h-60 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 mt-2" aria-live="polite">
                    <p className="text-sm font-medium text-gray-500 animate-pulse">Detecting your location...</p>
                  </div>
                ) : lat && lng ? (
                  <>
                    <div className="h-60 rounded-xl overflow-hidden border border-gray-300 shadow-inner mt-2">
                      <iframe
                        width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`}
                        title="Workplace location map"
                      ></iframe>
                    </div>
                    <div className="text-sm font-medium text-[#03045E] bg-[#f4f4f4] p-4 rounded-xl border border-[#03045E]/10 shadow-sm mt-2">
                      <span className="text-xs font-bold text-[#03045E]/60 uppercase tracking-wider block mb-1">Detected Address:</span>
                      <span className="font-normal text-[#2C7FFF] leading-relaxed block">{address}</span>
                    </div>
                  </>
                ) : null}
              </div>

              <hr className="border-[#03045E]/10" />

              <div className="p-4 rounded-2xl border-2 border-dashed border-[#03045E]/20 bg-[#f4f4f4]/50">
                <label htmlFor="verificationDoc" className="block text-sm font-bold text-[#03045E] mb-1">Company Registration (DTI / SEC / Mayor's Permit) <span className="text-[#03045E]">*</span></label>
                <input
                  id="verificationDoc"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setVerificationDoc(e.target.files[0])}
                  className="w-full text-sm text-[#03045E] file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-2 file:border-[#03045E]/30 file:bg-white file:text-[#03045E] file:font-semibold cursor-pointer"
                  required
                  title="Please upload your company registration document. Max size 5MB."
                  aria-label="Company registration document upload. Please upload a clear copy of your DTI, SEC, or Mayor's Permit. Max size 5 Megabytes."
                />
                <p className="text-xs text-[#03045E]/70 mt-2 font-semibold">
                  Supported formats: .pdf, .jpg, .jpeg, .png (Max size: 5MB)
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-2 mb-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={agreedTerms} 
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#2C7FFF] rounded cursor-pointer shrink-0"
                    required 
                    title="Check this box to agree to the Terms and Conditions."
                    aria-label="Terms and Conditions agreement checkbox. Check to agree."
                  />
                  <span className="text-xs font-bold text-[#03045E] leading-tight">
                    I have read and agree to the <Link to="/terms" target="_blank" className="text-[#2C7FFF] underline hover:text-[#03045E]" aria-label="Open ABLEWORK Terms and Conditions in a new tab">ABLEWORK Terms and Conditions</Link>.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={agreedPrivacy} 
                    onChange={(e) => setAgreedPrivacy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#2C7FFF] rounded cursor-pointer shrink-0"
                    required 
                    title="Check this box to agree to the Privacy Policy."
                    aria-label="Privacy Policy agreement checkbox. Check to agree."
                  />
                  <span className="text-xs font-bold text-[#03045E] leading-tight">
                    I have read and understood the <Link to="/policy" target="_blank" className="text-[#2C7FFF] underline hover:text-[#03045E]" aria-label="Open ABLEWORK Privacy Policy in a new tab">ABLEWORK Privacy Policy</Link> and consent to the collection and processing of my corporate information for employment assistance purposes.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`mt-1 py-3.5 bg-[#03045E] hover:bg-[#2C7FFF] ${useBlackText ? '!text-black' : 'text-white'} text-base font-semibold rounded-full shadow-md transition disabled:opacity-50`}
                title="Submit your registration"
                aria-label="Complete Employer Registration button. Click to submit your company profile."
              >
                {isLoading ? 'Submitting...' : 'Complete Employer Registration'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#03045E]/80">
              <Link to="/register-select" className="font-bold text-[#2C7FFF] hover:underline" aria-label="Go back to role selection screen">
                ← Back to Role Selection
              </Link>
            </p>
          </div>
        </div>
      </div>

   
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