import { useState, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';
import { useColorPalette } from '../context/ColorPaletteContext';
import lightLogo from '../assets/LIGHT MODE.png';
import darkLogo from '../assets/DARK MODE.png';
import backgroundImg from '../assets/BG.png';

export default function EmployerRegister() {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey, palette } = useColorPalette();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && mode.toLowerCase().includes('dark');
  const isAccessibilityMode = paletteKey === 'highContrast' || paletteKey === 'darkComfort';
  const isAccessibilityDarkMode = isAccessibilityMode && mode && typeof mode === 'string' && mode.toLowerCase().includes('dark');
  const isDefaultDarkMode = isDarkMode && !isAccessibilityMode;
  const useBlackText = isContrast || isDarkMode;
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
          setStatusMessage({ 
            type: 'error', 
            text: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character." 
          });
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
        }, 3000);
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
    <main className={`h-[100dvh] flex flex-col ${isContrast ? 'bg-black text-white' : 'bg-[#f4f4f4] text-[#03045E]'} ${isAccessibilityMode ? '[&_svg]:!text-white [&_svg]:!stroke-white' : ''} overflow-hidden relative`}>

      <div
        className="fixed inset-0 bg-no-repeat bg-cover bg-center md:bg-[size:1100px_auto] md:bg-left pointer-events-none z-0"
        style={{
          backgroundImage: `url(${backgroundImg})`,
        }}
        aria-hidden="true"
      />

      <div className="fixed inset-0 backdrop-blur-[2px] pointer-events-none z-0" aria-hidden="true" />

      <header className={`w-full ${isContrast ? 'bg-black border-b-2 border-[#2C7FFF]' : 'bg-white border-b-2 border-[#03045E]/15'} fixed top-0 left-0 z-50 transition-all duration-300 shadow-sm`}>
        <div className="w-full h-14 sm:h-16 pl-3 pr-3 sm:pl-4 sm:pr-4 md:pr-8 flex items-center justify-between max-w-[1700px] mx-auto box-border">
          <div className="flex items-center gap-8">
            <div className="flex items-center flex-shrink-0 py-1">
              <img src={isAccessibilityMode ? darkLogo : lightLogo} alt="AbleWork Logo" className="h-9 sm:h-12 md:h-14 w-auto object-contain max-h-full" />
            </div>
            <nav className={`hidden md:flex items-center gap-6 text-[15px] font-medium ${isAccessibilityMode ? '!text-white' : (isContrast ? 'text-white' : 'text-[#03045E]')}`}>
              <Link to="/" className={`${isAccessibilityMode ? '!text-white hover:!text-white' : (isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]')} transition`}>Home</Link>
              <Link to="/about" className={`${isAccessibilityMode ? '!text-white hover:!text-white' : (isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]')} transition`}>About Us</Link>
              <Link to="/policy" className={`${isAccessibilityMode ? '!text-white hover:!text-white' : (isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]')} transition`}>Policy</Link>
            </nav>
          </div>
          <div className="hidden md:flex items-center">
            <NavLink
              to="/login"
              className={({ isActive }) => 
                `login-btn px-5 py-2 rounded-full bg-transparent ${isAccessibilityDarkMode || isDefaultDarkMode ? '!text-black' : isAccessibilityMode ? '!text-white' : 'text-[#03045E]'} text-sm font-bold border-2 transform duration-200 transition whitespace-nowrap ${
                  isAccessibilityDarkMode || isDefaultDarkMode
                    ? '!text-black !border-black hover:!bg-[#2C7FFF] hover:!text-white hover:!border-[#2C7FFF]'
                    : isContrast 
                      ? 'text-white border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]' 
                      : 'text-[#03045E] border-[#03045E] hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF]'
                } ${
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
            className={`md:hidden flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-2 shadow-sm cursor-pointer transition-all duration-200 shrink-0 ${isContrast ? 'bg-zinc-900 text-white border-white/30' : 'bg-white text-[#03045E] border-[#03045E]/20'}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <div
          className={`md:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ease-in-out border-b-2 z-40 ${
            isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#03045E]/20'
          } ${
            isOpen ? 'max-h-[500px] opacity-100 shadow-xl' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!isOpen}
        >
          <div className={`w-full ${isContrast ? 'bg-black' : 'bg-white'}`}>
            <nav className={`flex flex-col px-2.5 pt-2.5 pb-2.5 gap-2 sm:px-3 sm:pt-3 sm:pb-3 sm:gap-2.5 ${isContrast ? 'text-white' : 'text-[#03045E]'}`} aria-label="Mobile navigation">
              <Link to="/" onClick={() => setIsOpen(false)} className="relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-2xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden bg-white text-[#03045E] border-[#03045E]/25">
                <div className="p-1.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">Home</span>
                </div>
                <svg className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link to="/about" onClick={() => setIsOpen(false)} className="relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-2xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden bg-white text-[#03045E] border-[#03045E]/25">
                <div className="p-1.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">About Us</span>
                </div>
                <svg className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link to="/policy" onClick={() => setIsOpen(false)} className="relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-2xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden bg-white text-[#03045E] border-[#03045E]/25">
                <div className="p-1.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">Policy</span>
                </div>
                <svg className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <div className={`h-px my-0.5 ${isContrast ? 'bg-[#2C7FFF]/30' : 'bg-[#03045E]/15'}`}></div>

              <NavLink
                to="/login"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-2xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${isActive ? 'bg-white text-[#03045E] border-[#03045E] shadow-md' : 'bg-white text-[#03045E] border-[#03045E]/25'}`}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>}
                    <div className="p-1.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">Log In</span>
                    </div>
                    <svg className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      <div
        className="flex-1 min-h-0 pt-16 sm:pt-20 flex items-center justify-center px-3 sm:px-4 md:px-8 max-w-[1700px] mx-auto w-full box-border relative z-10 overflow-hidden"
        role="region"
        aria-label="Employer registration area"
      >

        <div className="w-full max-w-2xl min-w-0 h-[80vh] sm:h-[85vh] max-h-full flex flex-col bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl border border-[#03045E]/10 overflow-hidden relative z-50 animate-fadeIn">

          <div className="flex-shrink-0 px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-[#03045E]/10 bg-white/90">
            <div className="flex items-center gap-3">
              <Link
                to="/register-select"
                aria-label="Go back to role selection"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#03045E]/10 text-[#03045E] shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#03045E] break-words">
                  Employer Registration
                </h1>
                <p className="text-xs sm:text-sm text-[#03045E]/70 mt-0.5">
                  Create your company profile to start posting inclusive jobs
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {statusMessage.text && (
              <div
                role="alert"
                aria-live="assertive"
                className={`p-4 mb-6 rounded-xl font-bold text-center border-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-green-100 text-green-800 border-green-400'
                    : 'bg-white text-red-600 border-red-600'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-7" autoComplete="off">

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="companyName" className="text-xs sm:text-sm font-semibold text-[#03045E]">Company Name <span className="text-[#03045E]">*</span></label>
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
                  <label htmlFor="companyDescription" className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">Company Description <span className="text-[var(--color-text)]">*</span></label>
                  <textarea
                    id="companyDescription"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    placeholder="Briefly describe what your company does..."
                    required
                    rows="3"
                    className="w-full p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-textSubtle)] focus:outline-none focus:border-[var(--color-accent)] transition resize-none"
                    title="Please briefly describe what your company does."
                    aria-label="Company Description. Please briefly describe what your company does."
                  ></textarea>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="industry" className=  "text-xs sm:text-sm font-semibold text-[#03045E]">Industry Type <span className="text-[#03045E]">*</span></label>
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
                  <label htmlFor="email" className="text-xs sm:text-sm font-semibold text-[#03045E]">Work Email <span className="text-[#03045E]">*</span></label>
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
                  <label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-[#03045E]">Telephone Number <span className="text-[#03045E]">*</span></label>
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
                  <label htmlFor="password" className="text-xs sm:text-sm font-semibold text-[#03045E]">Password <span className="text-[#03045E]">*</span></label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your Password"
                      required
                      className="w-full p-3 pr-12 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                      title="Please create a secure password with at least 6 characters."
                      aria-label="Password. Please create a secure password with at least 6 characters."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition cursor-pointer ${isAccessibilityMode ? '!text-white hover:!text-white' : 'text-[#03045E]/50 hover:text-[#2C7FFF]'}`}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className={`w-5 h-5 ${isAccessibilityMode ? '!text-white !stroke-white' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      ) : (
                        <svg className={`w-5 h-5 ${isAccessibilityMode ? '!text-white !stroke-white' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className="text-xs sm:text-sm font-semibold text-[#03045E]">Confirm Password <span className="text-[#03045E]">*</span></label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your Password"
                      required
                      className="w-full p-3 pr-12 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                      title="Please re-enter your password to confirm it matches."
                      aria-label="Confirm Password. Please re-enter your password to confirm it matches."
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition cursor-pointer ${isAccessibilityMode ? '!text-white hover:!text-white' : 'text-[#03045E]/50 hover:text-[#2C7FFF]'}`}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <svg className={`w-5 h-5 ${isAccessibilityMode ? '!text-white !stroke-white' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      ) : (
                        <svg className={`w-5 h-5 ${isAccessibilityMode ? '!text-white !stroke-white' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              <hr className="border-[#03045E]/10" />

              <fieldset className="flex flex-col gap-3">
                <legend className="text-xs sm:text-sm font-bold text-[#03045E]">Primary Job Role / Title <span className="text-[#03045E]">*</span></legend>
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
                <label htmlFor="address" className="text-lg sm:text-xl font-bold text-[#03045E]">Workplace Location <span className="text-[#03045E]">*</span></label>
                <p className="text-[10px] sm:text-xs text-gray-500">Pinpoint your office location to match with nearby applicants.</p>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className={`inline-flex items-center justify-center gap-2 ${isAccessibilityDarkMode ? '!bg-white !text-black' : 'bg-[#2C7FFF]'} ${isAccessibilityMode ? '!text-white !bg-blue-600' : useBlackText ? '!text-black' : 'text-white'} px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-md transition`}
                  title="Click to automatically detect and fill your workplace location."
                  aria-label="Open Map and Detect Location. Click to automatically detect and fill your workplace location."
                >
                                    <svg className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isAccessibilityDarkMode ? '!text-black !stroke-black [&_path]:!stroke-black' : isAccessibilityMode ? '!text-white' : useBlackText ? '!text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className={isAccessibilityDarkMode ? '!text-black' : ''}>Open Map & Detect Location</span>
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
                  <div className="h-48 sm:h-60 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 mt-2" aria-live="polite">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 animate-pulse">Detecting your location...</p>
                  </div>
                ) : lat && lng ? (
                  <>
                    <div className="h-48 sm:h-60 rounded-xl overflow-hidden border border-gray-300 shadow-inner mt-2">
                      <iframe
                        width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`}
                        title="Workplace location map"
                      ></iframe>
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-[#03045E] bg-[#f4f4f4] p-4 rounded-xl border border-[#03045E]/10 shadow-sm mt-2">
                      <span className="text-[10px] sm:text-xs font-bold text-[#03045E]/60 uppercase tracking-wider block mb-1">Detected Address:</span>
                      <span className={`font-normal leading-relaxed block ${isAccessibilityMode ? '!text-white' : 'text-[#2C7FFF]'}`}>{address}</span>
                    </div>
                  </>
                ) : null}
              </div>

              <hr className="border-[#03045E]/10" />

              <div className="p-4 rounded-2xl border-2 border-dashed border-[#03045E]/20 bg-[#f4f4f4]/50">
                <label htmlFor="verificationDoc" className="block text-xs sm:text-sm font-bold text-[#03045E] mb-1">Company Registration (DTI / SEC / Mayor's Permit) <span className="text-[#03045E]">*</span></label>
                <input
                  id="verificationDoc"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setVerificationDoc(e.target.files[0])}
                  className={`w-full text-[10px] sm:text-sm text-[#03045E] file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-2 file:border-[#03045E]/30 file:bg-white file:text-[#03045E] file:font-semibold cursor-pointer ${isAccessibilityDarkMode ? '[&::file-selector-button]:!text-black' : isDefaultDarkMode ? '[&::file-selector-button]:!text-black' : ''}`}
                  required
                  title="Please upload your company registration document. Max size 5MB."
                  aria-label="Company registration document upload. Please upload a clear copy of your DTI, SEC, Business Permit, or Mayor's Permit. Max size 5 Megabytes."
                />
                <p className="text-[10px] sm:text-xs text-[#03045E]/70 mt-2 font-semibold">
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
                  <span className="text-[10px] sm:text-xs font-bold text-[#03045E] leading-tight">
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
                  <span className="text-[10px] sm:text-xs font-bold text-[#03045E] leading-tight">
                    I have read and understood the <Link to="/policy" target="_blank" className="text-[#2C7FFF] underline hover:text-[#03045E]" aria-label="Open ABLEWORK Privacy Policy in a new tab">ABLEWORK Privacy Policy</Link> and consent to the collection and processing of my corporate information for employment assistance purposes.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`submit-register-btn mt-1 py-3 sm:py-3.5 bg-[#03045E] hover:bg-[#2C7FFF] ${isAccessibilityDarkMode ? '!text-black' : isAccessibilityMode ? '!text-white' : useBlackText ? '!text-black' : 'text-white'} text-sm sm:text-base font-semibold rounded-full shadow-md transition disabled:opacity-50`}
                title="Submit your registration"
                aria-label="Complete Employer Registration button. Click to submit your company profile."
              >
                {isLoading ? 'Submitting...' : 'Complete Employer Registration'}
              </button>
            </form>

            <p className={`mt-6 text-center text-xs sm:text-sm ${isAccessibilityMode ? '!text-white' : 'text-[#03045E]/80'}`}>
              <Link to="/register-select" className={`font-bold ${isAccessibilityMode ? '!text-white hover:!text-white underline' : 'text-[#2C7FFF] hover:underline'}`} aria-label="Go back to role selection screen">
                ← Back to Role Selection
              </Link>
            </p>
          </div>
        </div>
      </div>

   
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <div className={`relative w-full max-w-md rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${(isContrast || isDarkMode) ? 'bg-black border-2 border-white' : 'bg-white border-2 border-[#2C7FFF]'}`}>
            <div className="h-2 w-full bg-[#2C7FFF]" />

            <div className="relative px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
              <div className="relative mb-4 sm:mb-5">
                <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${(isContrast || isDarkMode) ? 'bg-transparent border-4 border-white' : 'bg-transparent border-4 border-[#2C7FFF]'}`}>
                  <svg className={`w-8 h-8 sm:w-12 sm:h-12 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${(isContrast || isDarkMode) ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>✓</div>
              </div>

              <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-4 border-2 ${(isContrast || isDarkMode) ? 'text-white bg-transparent border-white' : 'text-[#2C7FFF] bg-transparent border-[#2C7FFF]'}`}>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#10B981]"></span>
                Success
              </span>

              <h2 id="success-title" className={`text-xl sm:text-3xl font-black tracking-tight mb-1.5 sm:mb-2 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                You're all set!
              </h2>
              <p className={`text-xs sm:text-sm font-bold leading-relaxed mb-6 sm:mb-8 max-w-xs ${(isContrast || isDarkMode) ? 'text-white/80' : 'text-[#03045E]/80'}`}>
                Registration completed successfully. Taking you to Log In…
              </p>

              <div className="flex items-center gap-1 sm:gap-1.5" aria-label="Redirecting to login">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}