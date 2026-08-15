import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import headerLogo from '../assets/Final.png';
import backgroundImg from '../assets/Final background.png';

export default function ApplicantRegister() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Name States
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
 
  // Account & Contact States
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
 
  // Location States
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [radius, setRadius] = useState('10');
 
  // Workplace Independence
  const [independence, setIndependence] = useState('');

  // Form Submission States
  const [pwdFile, setPwdFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const toggleSelection = (item, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(item)) {
      setSelectedArray(selectedArray.filter(i => i !== item));
    } else {
      setSelectedArray([...selectedArray, item]);
    }
  };

  // 1. Disability Details
  const availableDisabilities = ['Visual Impairment', 'Hearing Impairment', 'Mobility / Motor', 'Cognitive / Learning', 'Speech Impairment'];
  const [selectedDisabilities, setSelectedDisabilities] = useState([]);
  const [showOtherDisability, setShowOtherDisability] = useState(false);
  const [otherDisability, setOtherDisability] = useState('');

  // 2. Accommodations / Aids
  const availableAccommodations = ['Screen Reader', 'Wheelchair Access', 'Sign Language Interpreter', 'Flexible Hours', 'Quiet Workspace'];
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  const [showOtherAccommodation, setShowOtherAccommodation] = useState(false);
  const [otherAccommodation, setOtherAccommodation] = useState('');

  // 3. Skills
  const availableSkills = ['React', 'JavaScript', 'UI/UX Design', 'Customer Support', 'Data Entry', 'Writing'];
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showOtherSkill, setShowOtherSkill] = useState(false);
  const [otherSkill, setOtherSkill] = useState('');

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
    const finalDisabilities = [...selectedDisabilities, ...(showOtherDisability && otherDisability ? [otherDisability] : [])];
    const finalAccommodations = [...selectedAccommodations, ...(showOtherAccommodation && otherAccommodation ? [otherAccommodation] : [])];
    const finalSkills = [...selectedSkills, ...(showOtherSkill && otherSkill ? [otherSkill] : [])];
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
    formData.append('disabilities', JSON.stringify(finalDisabilities));
    formData.append('accommodations', JSON.stringify(finalAccommodations));
    formData.append('skills', JSON.stringify(finalSkills));
    formData.append('pwdDocument', pwdFile);
    try {
      const response = await fetch('http://localhost:5001/api/auth/register/applicant', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setStatusMessage({ type: 'success', text: "Registration successful! Redirecting to login..." });
        setTimeout(() => navigate('/login'), 2000);
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
    <main className="h-screen flex flex-col bg-[#f4f4f4] overflow-hidden">
      {/* ===== HEADER ===== */}
      <header className="w-full bg-[#f4f4f4] border-b border-[#03045E]/10 fixed top-0 left-0 z-50">
        <div className="w-full h-16 pl-4 pr-4 md:pr-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center flex-shrink-0">
              <img src={headerLogo} alt="AbleWork Logo" className="h-20 w-auto object-contain max-h-full" />
            </div>
            <nav className="hidden md:flex items-center gap-6 text-[15px] font-medium text-[#03045E]">
              <Link to="/" className="hover:text-[#2C7FFF] transition">Home</Link>
              <Link to="/about" className="hover:text-[#2C7FFF] transition">About Us</Link>
              <Link to="/policy" className="hover:text-[#2C7FFF] transition">Policy</Link>
              <button className="flex items-center gap-1 hover:text-[#2C7FFF] transition">
                Careers
                <svg className="w-3.5 h-3.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </nav>
          </div>
          <div className="hidden md:flex items-center">
            <Link
              to="/login"
              className="px-5 py-2 rounded-full bg-white text-[#03045E] text-sm font-medium border border-[#03045E] hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF] transition"
            >
              Log In
            </Link>
          </div>
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[#2C7FFF] text-[#f4f4f4]"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="w-full bg-[#f4f4f4] border-t border-[#03045E]/10">
            <nav className="flex flex-col px-6 py-5 gap-5 text-[16px] font-medium text-[#03045E]">
              <Link to="/" className="hover:text-[#2C7FFF] transition" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/about" className="hover:text-[#2C7FFF] transition" onClick={() => setIsOpen(false)}>About Us</Link>
              <Link to="/policy" className="hover:text-[#2C7FFF] transition" onClick={() => setIsOpen(false)}>Policy</Link>
              <button className="flex items-center gap-1 hover:text-[#2C7FFF] transition text-left">
                Careers
                <svg className="w-3.5 h-3.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <Link
                to="/login"
                className="mt-2 px-5 py-2.5 rounded-full bg-white text-[#03045E] text-sm font-medium border border-[#03045E] hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF] transition w-fit"
                onClick={() => setIsOpen(false)}
              >
                Log In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ===== POPUP OVERLAY ===== */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4 pt-20 pb-6 bg-black/40 backdrop-blur-sm"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${backgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* ===== POPUP CONTAINER ===== */}
        <div className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-white/95 rounded-3xl shadow-2xl border border-[#03045E]/10 overflow-hidden">
          
          {/* Sticky Header of Popup */}
          <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[#03045E]/10 bg-white/90">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tighter text-[#03045E]">
                  Job Seeker Registration
                </h1>
                <p className="text-sm text-[#03045E]/70 mt-0.5">
                  Build your accessible career profile
                </p>
              </div>
              <Link
                to="/register-select"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f4f4f4] text-[#03045E] hover:bg-[#03045E] hover:text-white transition"
                aria-label="Close and go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Scrollable Form Area */}
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-7" aria-label="Applicant Registration Form" autoComplete="off">
             
              {/* Personal Info */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="firstName" className="text-sm font-semibold text-[#03045E]">First Name</label>
                  <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="middleName" className="text-sm font-semibold text-[#03045E]">Middle Name (Optional)</label>
                  <input id="middleName" type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lastName" className="text-sm font-semibold text-[#03045E]">Last Name</label>
                  <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-sm font-semibold text-[#03045E]">Phone Number</label>
                  <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-[#03045E]">Email Address</label>
                  <input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    autoComplete="off"
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-sm font-semibold text-[#03045E]">Password</label>
                  <input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    autoComplete="new-password"
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="birthdate" className="text-sm font-semibold text-[#03045E]">Birthdate (Must be 18+)</label>
                  <input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} required className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" />
                </div>
              </div>

              <hr className="border-[#03045E]/10" />

              {/* Address */}
              <div className="flex flex-col gap-3 p-4 border border-[#2C7FFF]/30 rounded-2xl bg-[#2C7FFF]/5">
                <label htmlFor="address" className="text-sm font-bold text-[#03045E]">Residential Address</label>
                <p className="text-xs text-[#03045E]/70">Detect your location or type it manually.</p>
               
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="bg-[#2C7FFF] text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md hover:bg-[#03045E] cursor-pointer disabled:opacity-50 transition"
                >
                  {isDetecting ? 'Detecting...' : 'Detect Location'}
                </button>
               
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Block 4, Main Street, Manila"
                  required
                  className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="radius" className="text-sm font-semibold text-[#03045E]">
                  Max Travel Radius: <span className="text-[#2C7FFF] font-bold">{radius} km</span>
                </label>
                <input id="radius" type="range" min="1" max="50" value={radius} onChange={(e) => setRadius(e.target.value)} className="w-full h-2 accent-[#2C7FFF] cursor-pointer" />
              </div>

              <hr className="border-[#03045E]/10" />

              {/* Disability Chips */}
              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-bold text-[#03045E]">Disability Details</legend>
                <div className="flex flex-wrap gap-2">
                  {availableDisabilities.map((disability) => (
                    <button
                      type="button"
                      key={disability}
                      onClick={() => toggleSelection(disability, selectedDisabilities, setSelectedDisabilities)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                        selectedDisabilities.includes(disability)
                          ? 'bg-[#03045E] text-white border-[#03045E]'
                          : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                      }`}
                    >
                      {disability} {selectedDisabilities.includes(disability) ? '✓' : '+'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowOtherDisability(!showOtherDisability)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                      showOtherDisability
                        ? 'bg-[#03045E] text-white border-[#03045E]'
                        : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                    }`}
                  >
                    Other {showOtherDisability ? '✓' : '+'}
                  </button>
                </div>
                {showOtherDisability && (
                  <input
                    type="text"
                    value={otherDisability}
                    onChange={(e) => setOtherDisability(e.target.value)}
                    placeholder="Please specify..."
                    className="mt-1 w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                    required={showOtherDisability}
                  />
                )}
              </fieldset>

              {/* Independence */}
              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-bold text-[#03045E]">Workplace Independence</legend>
                <div className="flex flex-wrap gap-2">
                  {['Independent', 'Requires Assistance'].map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setIndependence(option)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${
                        independence === option
                          ? 'bg-[#03045E] text-white border-[#03045E]'
                          : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                      }`}
                    >
                      {option} {independence === option ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Accommodations */}
              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-bold text-[#03045E]">Required Accommodations</legend>
                <div className="flex flex-wrap gap-2">
                  {availableAccommodations.map((acc) => (
                    <button
                      type="button"
                      key={acc}
                      onClick={() => toggleSelection(acc, selectedAccommodations, setSelectedAccommodations)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                        selectedAccommodations.includes(acc)
                          ? 'bg-[#03045E] text-white border-[#03045E]'
                          : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                      }`}
                    >
                      {acc} {selectedAccommodations.includes(acc) ? '✓' : '+'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowOtherAccommodation(!showOtherAccommodation)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                      showOtherAccommodation
                        ? 'bg-[#03045E] text-white border-[#03045E]'
                        : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                    }`}
                  >
                    Other {showOtherAccommodation ? '✓' : '+'}
                  </button>
                </div>
                {showOtherAccommodation && (
                  <input
                    type="text"
                    value={otherAccommodation}
                    onChange={(e) => setOtherAccommodation(e.target.value)}
                    placeholder="Please specify..."
                    className="mt-1 w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                    required={showOtherAccommodation}
                  />
                )}
              </fieldset>

              {/* Skills */}
              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-bold text-[#03045E]">Your Skills</legend>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSelection(skill, selectedSkills, setSelectedSkills)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                        selectedSkills.includes(skill)
                          ? 'bg-[#03045E] text-white border-[#03045E]'
                          : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                      }`}
                    >
                      {skill} {selectedSkills.includes(skill) ? '✓' : '+'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowOtherSkill(!showOtherSkill)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                      showOtherSkill
                        ? 'bg-[#03045E] text-white border-[#03045E]'
                        : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                    }`}
                  >
                    Other {showOtherSkill ? '✓' : '+'}
                  </button>
                </div>
                {showOtherSkill && (
                  <input
                    type="text"
                    value={otherSkill}
                    onChange={(e) => setOtherSkill(e.target.value)}
                    placeholder="Enter custom skills..."
                    className="mt-1 w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                    required={showOtherSkill}
                  />
                )}
              </fieldset>

              <hr className="border-[#03045E]/10" />

              {/* File Upload */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-[#03045E]/20 bg-[#f4f4f4]/50">
                <label htmlFor="pwdId" className="block text-sm font-bold text-[#03045E] mb-1">Upload PWD ID / Certificates</label>
                <p className="text-xs text-[#03045E]/60 mb-3">Attach a valid ID or certification.</p>
                <input
                  id="pwdId"
                  type="file"
                  onChange={(e) => setPwdFile(e.target.files[0])}
                  className="w-full text-sm text-[#03045E] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#03045E] file:text-white file:font-semibold hover:file:bg-[#2C7FFF] cursor-pointer"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 py-3.5 bg-[#03045E] hover:bg-[#2C7FFF] text-white text-base font-semibold rounded-full shadow-md transition disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Complete Registration'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#03045E]/80">
              <Link to="/register-select" className="font-bold text-[#2C7FFF] hover:underline">
                ← Back to Role Selection
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}