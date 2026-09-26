import { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AccessibilityContext } from '../context/AccessibilityContext';
import lightLogo from '../assets/LIGHT MODE.png';
import darkLogo from '../assets/DARK MODE.png';
import backgroundImg from '../assets/BG.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

export default function ApplicantRegister() {
  const { mode } = useContext(AccessibilityContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && mode.toLowerCase().includes('dark');
  const useBlackText = isContrast || isDarkMode;
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [radius, setRadius] = useState(10); 
  const [independence, setIndependence] = useState('');
  const [pwdFile, setPwdFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  const toggleSelection = (item, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(item)) {
      setSelectedArray(selectedArray.filter(i => i !== item));
    } else {
      setSelectedArray([...selectedArray, item]);
    }
  };

  const availableDisabilities = [
    'Deafness', 'Blindness', 'Low Vision', 'Hard of Hearing', 'Color Blindness',
    'Paraplegia (Lower Body)', 'Hemiplegia (One Side)', 'Upper Limb Amputation',
    'Lower Limb Amputation', 'Cerebral Palsy', 'Limited Fine Motor Skills', 'Wheelchair User'
  ];
  const extendedDisabilities = [
    'Speech Impairment', 'Neurodivergent', 'Chronic Pain', 'Multiple Sclerosis', 
    'Muscular Dystrophy', 'Spina Bifida', 'Dwarfism', 'Autism Spectrum', 'ADHD'
  ];
  const [selectedDisabilities, setSelectedDisabilities] = useState([]);
  const [showOtherDisability, setShowOtherDisability] = useState(false);
  const [otherDisability, setOtherDisability] = useState('');

  const handleCustomDisabilityKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (otherDisability.trim() && !selectedDisabilities.includes(otherDisability.trim())) {
        setSelectedDisabilities([...selectedDisabilities, otherDisability.trim()]);
        setOtherDisability('');
      }
    }
  };

  const availableAccommodations = ['Screen Reader', 'Wheelchair Access', 'Sign Language Interpreter', 'Flexible Hours', 'Quiet Workspace'];
  const extendedAccommodations = [
    'Ergonomic Setup', 'Noise-Cancelling Headphones', 'Screen Magnifier', 'Braille Keyboard', 
    'Captioning Services', 'Remote Work', 'Frequent Breaks', 'Service Animal',
    'Adjustable Desk', 'Voice-to-Text Software', 'Large Print Documents', 'Step-Free Access'
  ];
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  const [showOtherAccommodation, setShowOtherAccommodation] = useState(false);
  const [otherAccommodation, setOtherAccommodation] = useState('');

  const defaultAvailable = [
    'Customer Service', 
    'Data Entry', 
    'Communication', 
    'Time Management', 
    'Microsoft Office', 
    'Teamwork'
  ];

  const defaultExtended = [
    'Virtual Assistance', 
    'Social Media Management', 
    'Problem Solving', 
    'Writing', 
    'Inventory Management', 
    'Graphic Design', 
    'Scheduling', 
    'Project Management', 
    'Retail Sales',
    'Copywriting'
  ];
  const [availableSkills, setAvailableSkills] = useState(defaultAvailable);
  const [extendedSkills, setExtendedSkills] = useState(defaultExtended);

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showOtherSkill, setShowOtherSkill] = useState(false);
  const [otherSkill, setOtherSkill] = useState('');

  useEffect(() => {
    const fetchPopularSkills = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/skills/popular');
        if (response.ok) {
          const popularSkills = await response.json();
          const combinedSkills = Array.from(new Set([...popularSkills, ...defaultAvailable, ...defaultExtended]));
          setAvailableSkills(combinedSkills.slice(0, 6));
          setExtendedSkills(combinedSkills.slice(6));
        }
      } catch (error) {
        console.error("Failed to fetch popular skills:", error);
      }
    };

    fetchPopularSkills();
  }, []);

  const handleCustomSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (otherSkill.trim() && !selectedSkills.includes(otherSkill.trim())) {
        setSelectedSkills([...selectedSkills, otherSkill.trim()]);
        setOtherSkill('');
      }
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please type your address.");
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
          } else {
            setStatusMessage({ type: 'error', text: "Could not pinpoint exact address name. Please type it manually." });
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          setStatusMessage({ type: 'error', text: "Network error fetching address name." });
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setStatusMessage({ type: 'error', text: "Location access denied. Please type your address manually." });
        setIsDetecting(false);
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
      setStatusMessage({ type: 'error', text: 'Passwords do not match. Please check and try again.' });
      return;
    }

    const birthYear = new Date(birthdate).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 18) {
      setStatusMessage({ type: 'error', text: "You must be 18 years or older to register on AbleWork." });
      return;
    }
    if (!pwdFile) {
      setStatusMessage({ type: 'error', text: "Please upload your PWD ID or Certification." });
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('middleName', middleName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('birthdate', birthdate);
    formData.append('address', address);
    formData.append('latitude', lat);
    formData.append('longitude', lng);
    formData.append('radius', radius);
    formData.append('independence', independence);
    formData.append('disabilities', JSON.stringify(selectedDisabilities));
    formData.append('accommodations', JSON.stringify(selectedAccommodations));
    formData.append('skills', JSON.stringify(selectedSkills));
    formData.append('pwdDocument', pwdFile);

    try {
      const response = await fetch('http://localhost:5001/api/auth/register/applicant', {
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
        setStatusMessage({ type: 'error', text: data.message || "Registration failed. Please try again." });
      }
    } catch (error) {
      console.error("Server Error:", error);
      setStatusMessage({ type: 'error', text: "Cannot connect to the server. Is your Express backend running?" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className={`h-[100dvh] flex flex-col ${isContrast ? 'bg-black text-white' : 'bg-[#f4f4f4] text-[#03045E]'} overflow-hidden relative`}
      role="main"
      aria-label="Applicant registration page"
    >

      <div
        className="fixed inset-0 bg-no-repeat bg-cover bg-center md:bg-[size:1100px_auto] md:bg-left pointer-events-none z-0"
        style={{
          backgroundImage: `url(${backgroundImg})`,
        }}
        aria-hidden="true"
      />

      <div className="fixed inset-0 backdrop-blur-[2px] pointer-events-none z-0" aria-hidden="true" />

      <header className={`w-full ${isContrast ? 'bg-black border-b border-[#2C7FFF]' : 'bg-[#f4f4f4] border-b border-[#03045E]/10'} fixed top-0 left-0 z-50`}>
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
                `px-5 py-2 rounded-full bg-transparent text-sm font-bold border-2 transform duration-200 transition whitespace-nowrap ${
                  isContrast 
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
            className={`md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition ${isContrast ? 'bg-[#2C7FFF] text-white' : 'bg-[#2C7FFF] text-[#f4f4f4]'}`}
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
          <div className={`md:hidden w-full border-t ${isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-[#f4f4f4] border-[#03045E]/10'} shadow-lg`}>
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
        aria-label="Applicant registration area"
      >

        <div className="w-full max-w-2xl h-[85vh] max-h-full flex flex-col bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-[#03045E]/10 overflow-hidden relative z-50 animate-fadeIn">

          <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[#03045E]/10 bg-white/90">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#03045E]">
                  Job Seeker Registration
                </h1>
                <p className="text-sm text-[#03045E]/70 mt-0.5">
                  Build your accessible career profile
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
                  <label htmlFor="firstName" className="text-sm font-semibold text-[#03045E]">First Name <span className="text-[#03045E]">*</span></label>
                  <input 
                    id="firstName" 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    placeholder="Enter your First Name" 
                    required 
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" 
                    title="Please enter your legal first name."
                    aria-label="First Name. Please enter your legal first name."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="middleName" className="text-sm font-semibold text-[#03045E]">Middle Name (Optional)</label>
                  <input 
                    id="middleName" 
                    type="text" 
                    value={middleName} 
                    onChange={(e) => setMiddleName(e.target.value)} 
                    placeholder="Enter your Middle Name" 
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" 
                    title="Please enter your middle name if you have one. This is optional."
                    aria-label="Middle Name. Please enter your middle name if you have one. This is optional."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lastName" className="text-sm font-semibold text-[#03045E]">Last Name <span className="text-[#03045E]">*</span></label>
                  <input 
                    id="lastName" 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    placeholder="Enter your Last Name" 
                    required 
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" 
                    title="Please enter your legal last name."
                    aria-label="Last Name. Please enter your legal last name."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-sm font-semibold text-[#03045E]">Phone Number <span className="text-[#03045E]">*</span></label>
                  <input 
                    id="phone" 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Enter your Phone Number" 
                    required 
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" 
                    title="Please enter your active contact phone number."
                    aria-label="Phone Number. Please enter your active contact phone number."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-[#03045E]">Email Address <span className="text-[#03045E]">*</span></label>
                  <input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Enter your Email Address" 
                    required 
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" 
                    title="Please enter a valid email address for your account."
                    aria-label="Email Address. Please enter a valid email address for your account."
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
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="birthdate" className="text-sm font-semibold text-[#03045E]">Birthdate (Must be 18+) <span className="text-[#03045E]">*</span></label>
                  <input 
                    id="birthdate" 
                    type="date" 
                    value={birthdate} 
                    onChange={(e) => setBirthdate(e.target.value)} 
                    placeholder="Enter your Birthdate" 
                    required 
                    className={`w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition ${(isContrast || isDarkMode) ? '[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-200' : ''}`} 
                    title="Please select your date of birth. You must be at least 18 years old to register."
                    aria-label="Birthdate. Please select your date of birth. You must be at least 18 years old to register."
                  />
                </div>
              </div>

              <hr className="border-[#03045E]/10" />

              <div className="flex flex-col gap-3 p-5 border border-[#2C7FFF]/30 rounded-2xl bg-[var(--color-accentSoft)]">
                <label htmlFor="address" className="text-xl font-bold text-[#03045E]">Residential Address <span className="text-[#03045E]">*</span></label>
                <button 
                  type="button" 
                  onClick={handleDetectLocation} 
                  disabled={isDetecting} 
                  className={`inline-flex items-center justify-center gap-2 bg-[#2C7FFF] ${useBlackText ? '!text-black' : 'text-white'} px-5 py-2.5 rounded-full text-sm font-semibold shadow-md hover:bg-[#03045E] transition`}
                  title="Click to automatically detect and fill your current location."
                  aria-label="Detect My Location. Click to automatically detect and fill your current location."
                >
                  <svg className={`w-5 h-5 shrink-0 ${useBlackText ? '!text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{isDetecting ? 'Detecting Location...' : 'Detect My Location'}</span>
                </button>
                <input 
                  id="address" 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Enter your Residential Address (e.g. Block 4, Main Street, Manila)" 
                  required 
                  className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E]" 
                  title="Please enter your full residential address or use the detect location button."
                  aria-label="Residential Address. Please enter your full residential address or use the detect location button."
                />

                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="radius" className="text-sm font-semibold text-[#03045E]">
                      Max Travel Radius:
                    </label>
                    <span className="text-[#2C7FFF] font-black text-lg bg-white px-3 py-1 rounded-lg border border-[#2C7FFF]/20 shadow-sm">{radius} km</span>
                  </div>
                  <input 
                    id="radius" 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={radius} 
                    onChange={(e) => setRadius(Number(e.target.value))} 
                    className="w-full h-2 accent-[#2C7FFF] cursor-pointer" 
                    title="Adjust the slider to set your maximum travel distance for work in kilometers."
                    aria-label="Maximum travel radius slider. Adjust the slider to set your maximum travel distance for work in kilometers."
                  />
                  <p className="text-xs text-gray-500">Jobs beyond this distance will be filtered out automatically.</p>
                </div>

                {lat && lng ? (
                  <div className="h-64 w-full mt-4 rounded-xl overflow-hidden border border-[#03045E]/20 z-0 relative shadow-inner" aria-label="Interactive map showing your location and travel radius.">
                    <MapContainer center={[lat, lng]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[lat, lng]} />
                      <Circle center={[lat, lng]} radius={radius * 1000} pathOptions={{ color: '#2C7FFF', fillColor: '#2C7FFF', fillOpacity: 0.2, weight: 2 }} />
                      <MapRecenter lat={lat} lng={lng} />
                    </MapContainer>
                  </div>
                ) : (
                  <div className="h-40 w-full mt-4 rounded-xl border-2 border-dashed border-[#03045E]/20 bg-white/50 flex flex-col items-center justify-center text-[#03045E]/50">
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span className="text-sm font-semibold">Click 'Detect My Location' to view your travel zone.</span>
                  </div>
                )}
              </div>

              <hr className="border-[#03045E]/10" />

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-bold text-[#03045E]">Physical & Sensory Profile (Work-Enabled) <span className="text-[#03045E]">*</span></legend>
                <p className="text-xs text-gray-500">Select applicable physical or sensory categories for tailored job accommodation matching.</p>

                {selectedDisabilities.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="w-full text-xs font-bold text-gray-500 uppercase tracking-wider">Selected Profile:</span>
                    {selectedDisabilities.map(disability => (
                      <span key={disability} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#03045E]/15 text-[#03045E] text-xs font-bold rounded-full shadow-sm border border-[#03045E]/30">
                        {disability}
                        <button 
                          type="button" 
                          onClick={() => setSelectedDisabilities(selectedDisabilities.filter(d => d !== disability))}
                          className="hover:text-red-500 font-bold ml-0.5"
                          title={`Remove ${disability}`}
                          aria-label={`Remove ${disability} from selected profile`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {availableDisabilities.map((disability) => (
                    <button
                      type="button"
                      key={disability}
                      onClick={() => toggleSelection(disability, selectedDisabilities, setSelectedDisabilities)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                        selectedDisabilities.includes(disability)
                          ? 'bg-[#03045E]/15 text-[#03045E] border-[#03045E]/30'
                          : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                      }`}
                      title={`Click to select or deselect ${disability}`}
                      aria-label={`Select ${disability} as a physical or sensory condition`}
                      aria-pressed={selectedDisabilities.includes(disability)}
                    >
                      {disability} {selectedDisabilities.includes(disability) ? '✓' : '+'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowOtherDisability(!showOtherDisability)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                      showOtherDisability
                        ? 'bg-[#03045E]/15 text-[#03045E] border-[#03045E]/30'
                        : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                    }`}
                    title="Click to type an unlisted physical or sensory condition"
                    aria-label="Add other physical or sensory condition"
                    aria-expanded={showOtherDisability}
                  >
                    Other {showOtherDisability ? '✓' : '+'}
                  </button>
                </div>

                {showOtherDisability && (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="text"
                      value={otherDisability}
                      onChange={(e) => setOtherDisability(e.target.value)}
                      onKeyDown={handleCustomDisabilityKeyDown}
                      placeholder="Type custom condition and press Enter (or pick below)..."
                      className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E]"
                      title="Type a custom physical or sensory condition and press Enter."
                      aria-label="Custom condition input. Type a custom physical or sensory condition and press Enter to add it."
                    />
                    {otherDisability.length > 0 && (
                      <div className="flex flex-wrap gap-2 animate-fadeIn">
                        {extendedDisabilities
                          .filter(d => d.toLowerCase().includes(otherDisability.toLowerCase()) && !selectedDisabilities.includes(d))
                          .slice(0, 6)
                          .map(suggestion => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                toggleSelection(suggestion, selectedDisabilities, setSelectedDisabilities);
                                setOtherDisability(''); 
                              }}
                              className="px-3 py-1.5 bg-[#2C7FFF]/10 text-[#03045E] text-xs font-bold rounded-full border border-[#2C7FFF]/20"
                              title={`Click to add ${suggestion}`}
                              aria-label={`Add suggested condition ${suggestion}`}
                            >
                              + {suggestion}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-bold text-[#03045E]">Workplace Independence <span className="text-[#03045E]">*</span></legend>
                <div className="flex flex-wrap gap-2">
                  {['Independent', 'Requires Assistance'].map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setIndependence(option)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${
                        independence === option
                          ? 'bg-[#03045E]/15 text-[#03045E] border-[#03045E]/30'
                          : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                      }`}
                      title={`Select if your workplace independence level is ${option}`}
                      aria-label={`Select workplace independence level: ${option}`}
                      aria-pressed={independence === option}
                    >
                      {option} {independence === option ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-bold text-[#03045E]"> Accommodations <span className="text-gray-400 font-normal ml-1">(Optional)</span></legend>
                <div className="flex flex-wrap gap-2">
                  {availableAccommodations.map((acc) => (
                    <button
                      type="button"
                      key={acc}
                      onClick={() => toggleSelection(acc, selectedAccommodations, setSelectedAccommodations)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                        selectedAccommodations.includes(acc)
                          ? 'bg-[#03045E]/15 text-[#03045E] border-[#03045E]/30'
                          : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                      }`}
                      title={`Click to select or deselect ${acc}`}
                      aria-label={`Select ${acc} as a required workplace accommodation`}
                      aria-pressed={selectedAccommodations.includes(acc)}
                    >
                      {acc} {selectedAccommodations.includes(acc) ? '✓' : '+'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowOtherAccommodation(!showOtherAccommodation)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                      showOtherAccommodation
                        ? 'bg-[#03045E]/15 text-[#03045E] border-[#03045E]/30'
                        : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                    }`}
                    title="Click to type an unlisted workplace accommodation"
                    aria-label="Add other workplace accommodation"
                    aria-expanded={showOtherAccommodation}
                  >
                    Other {showOtherAccommodation ? '✓' : '+'}
                  </button>
                </div>

                {showOtherAccommodation && (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="text"
                      value={otherAccommodation}
                      onChange={(e) => setOtherAccommodation(e.target.value)}
                      placeholder="Type custom accommodation and press Enter..."
                      className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E]"
                      title="Type a custom workplace accommodation and press Enter."
                      aria-label="Custom accommodation input. Type a custom workplace accommodation and press Enter to add it."
                    />
                    {otherAccommodation.length > 0 && (
                      <div className="flex flex-wrap gap-2 animate-fadeIn">
                        {extendedAccommodations
                          .filter(a => a.toLowerCase().includes(otherAccommodation.toLowerCase()) && !selectedAccommodations.includes(a))
                          .slice(0, 6)
                          .map(suggestion => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                toggleSelection(suggestion, selectedAccommodations, setSelectedAccommodations);
                                setOtherAccommodation(''); 
                              }}
                              className="px-3 py-1.5 bg-[#2C7FFF]/10 text-[#03045E] text-xs font-bold rounded-full border border-[#2C7FFF]/20"
                              title={`Click to add ${suggestion}`}
                              aria-label={`Add suggested accommodation ${suggestion}`}
                            >
                              + {suggestion}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-bold text-[#03045E]">Your Skills <span className="text-[#03045E]">*</span></legend>

                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="w-full text-xs font-bold text-gray-500 uppercase tracking-wider">Selected Skills:</span>
                    {selectedSkills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#03045E]/15 text-[#03045E] text-xs font-bold rounded-full shadow-sm border border-[#03045E]/30">
                        {skill}
                        <button 
                          type="button" 
                          onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                          className="hover:text-red-500 font-bold ml-0.5"
                          title={`Remove ${skill}`}
                          aria-label={`Remove ${skill} from selected skills`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSelection(skill, selectedSkills, setSelectedSkills)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                        selectedSkills.includes(skill)
                          ? 'bg-[#03045E]/15 text-[#03045E] border-[#03045E]/30'
                          : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                      }`}
                      title={`Click to select or deselect ${skill}`}
                      aria-label={`Select ${skill} as a professional skill`}
                      aria-pressed={selectedSkills.includes(skill)}
                    >
                      {skill} {selectedSkills.includes(skill) ? '✓' : '+'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowOtherSkill(!showOtherSkill)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                      showOtherSkill
                        ? 'bg-[#03045E]/15 text-[#03045E] border-[#03045E]/30'
                        : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                    }`}
                    title="Click to type an unlisted professional skill"
                    aria-label="Add other professional skill"
                    aria-expanded={showOtherSkill}
                  >
                    Other {showOtherSkill ? '✓' : '+'}
                  </button>
                </div>

                {showOtherSkill && (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="text"
                      value={otherSkill}
                      onChange={(e) => setOtherSkill(e.target.value)}
                      onKeyDown={handleCustomSkillKeyDown}
                      placeholder="Type custom skill and press Enter (or pick below)..."
                      className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E]"
                      title="Type a custom professional skill and press Enter."
                      aria-label="Custom skill input. Type a custom professional skill and press Enter to add it."
                    />
                    {otherSkill.length > 0 && (
                      <div className="flex flex-wrap gap-2 animate-fadeIn">
                        {extendedSkills
                          .filter(s => s.toLowerCase().includes(otherSkill.toLowerCase()) && !selectedSkills.includes(s))
                          .slice(0, 6)
                          .map(suggestion => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                toggleSelection(suggestion, selectedSkills, setSelectedSkills);
                                setOtherSkill(''); 
                              }}
                              className="px-3 py-1.5 bg-[#2C7FFF]/10 text-[#03045E] text-xs font-bold rounded-full border border-[#2C7FFF]/20"
                              title={`Click to add ${suggestion}`}
                              aria-label={`Add suggested skill ${suggestion}`}
                            >
                              + {suggestion}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </fieldset>

              <hr className="border-[#03045E]/10" />

              <div className="p-4 rounded-2xl border-2 border-dashed border-[#03045E]/20 bg-[#f4f4f4]/50">
                <label htmlFor="pwdId" className="block text-sm font-bold text-[#03045E] mb-1">Upload PWD ID / Certificates <span className="text-[#03045E]">*</span></label>
                <input
                  id="pwdId"
                  type="file"
                  accept=".jpg,.jpeg"
                  onChange={(e) => setPwdFile(e.target.files[0])}
                  className="w-full text-sm text-[#03045E] file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-2 file:border-[#03045E]/30 file:bg-white file:text-[#03045E] file:font-semibold cursor-pointer"
                  required
                  title="Please upload a clear image of your PWD ID. Max size 5MB."
                  aria-label="PWD ID document upload. Please upload a clear image of your PWD ID. Max size 5 Megabytes."
                />
                <p className="text-xs text-[#03045E]/70 mt-2 font-semibold">
                  Supported formats: .jpg, .jpeg (Max size: 5MB)
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
                    I have read and understood the <Link to="/policy" target="_blank" className="text-[#2C7FFF] underline hover:text-[#03045E]" aria-label="Open ABLEWORK Privacy Policy in a new tab">ABLEWORK Privacy Policy</Link> and consent to the collection and processing of my personal information for employment assistance purposes.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`mt-1 py-3.5 bg-[#03045E] hover:bg-[#2C7FFF] ${useBlackText ? '!text-black' : 'text-white'} text-base font-semibold rounded-full shadow-md transition disabled:opacity-50`}
                title="Submit your registration"
                aria-label="Complete Registration button. Click to submit your profile."
              >
                {isLoading ? 'Submitting...' : 'Complete Registration'}
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