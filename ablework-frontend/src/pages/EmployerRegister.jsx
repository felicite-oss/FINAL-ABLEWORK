import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import headerLogo from '../assets/Final.png';
import backgroundImg from '../assets/Final background.png';

export default function EmployerRegister() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Company & Account Credentials
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [industry, setIndustry] = useState('');
  const [jobRole, setJobRole] = useState('');

  // Location States
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Verification Document State
  const [verificationDoc, setVerificationDoc] = useState(null);

  // Form Submission States
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Auto-Detect Location & Open Map Function
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

  // MAIN SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    setIsLoading(true);

    // Note: For a real file upload to save to a server folder, we would change this to FormData. 
    // For now, this payload satisfies the current backend configuration.
    const payload = {
      companyName,
      companyDescription,
      email,
      phone,
      password,
      industry,
      jobRole,
      address,
      latitude: lat,
      longitude: lng,
      documentName: verificationDoc ? verificationDoc.name : null
    };

    try {
      const response = await fetch('http://localhost:5001/api/auth/register/employer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage({ type: 'success', text: "Registration & documents submitted successfully! Redirecting..." });
        setTimeout(() => navigate('/login'), 2000);
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
        <div className="w-full max-w-xl max-h-[85vh] flex flex-col bg-white/95 rounded-3xl shadow-2xl border border-[#03045E]/10 overflow-hidden">
          
          {/* Sticky Header of Popup */}
          <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[#03045E]/10 bg-white/90">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tighter text-[#03045E]">
                  Employer Registration
                </h1>
                <p className="text-sm text-[#03045E]/70 mt-0.5">
                  Create your company profile to start posting inclusive jobs
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
                className={`p-4 mb-6 rounded-xl font-bold text-center border-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-green-100 text-green-800 border-green-400'
                    : 'bg-red-100 text-red-800 border-red-400'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-7" autoComplete="off">
              
              {/* Section 1: Credentials */}
              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-bold text-[#03045E] border-b border-[#03045E]/10 pb-2">
                  1. Company & Account Credentials
                </h2>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#03045E]">Company Name</label>
                  <input
                    type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#03045E]">Company Description</label>
                  <textarea
                    value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} required rows="3"
                    placeholder="Briefly describe what your company does..."
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition resize-none"
                  ></textarea>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#03045E]">Industry Type</label>
                  <input
                    type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} required placeholder="e.g. Technology"
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#03045E]">Work Email</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off"
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#03045E]">Telephone Number</label>
                  <input
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#03045E]">Password</label>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password"
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                  />
                </div>
              </div>

              {/* Section 2: Job Profile & Location */}
              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-bold text-[#03045E] border-b border-[#03045E]/10 pb-2">
                  2. Job Profile & Location
                </h2>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#03045E]">Primary Job Role / Title</label>
                  <input
                    type="text" value={jobRole} onChange={(e) => setJobRole(e.target.value)} required placeholder="e.g. Hiring Manager"
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                  />
                </div>

                <div className="flex flex-col gap-3 p-4 border border-[#2C7FFF]/30 rounded-2xl bg-[#2C7FFF]/5">
                  <div>
                    <label className="text-sm font-bold text-[#03045E]">Workplace Location</label>
                    <p className="text-xs text-[#03045E]/70 mt-0.5">
                      Pinpoint your office location to match with nearby applicants.
                    </p>
                  </div>
                  
                  <button
                    type="button" onClick={handleDetectLocation}
                    className="w-full bg-[#2C7FFF] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#03045E] transition"
                  >
                    Open Map & Detect Location
                  </button>
                  
                  <input
                    type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Physical Address"
                    className="w-full p-3 border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                  />
                </div>
              </div>

              {/* --- ADDED SECTION 3: VERIFICATION DOCUMENTS --- */}
              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-bold text-[#03045E] border-b border-[#03045E]/10 pb-2">
                  3. Verification Documents
                </h2>
                
                <div className="flex flex-col gap-3 p-4 border border-[#03045E]/20 rounded-2xl bg-white">
                  <div>
                    <label className="text-sm font-bold text-[#03045E]">Company Registration (DTI / SEC / Mayor's Permit)</label>
                    <p className="text-xs text-[#03045E]/70 mt-0.5">
                      Required by Admin to verify your legitimacy before jobs go live. (PDF, JPG, PNG)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setVerificationDoc(e.target.files[0])}
                    required
                    className="w-full text-sm text-[#03045E] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#03045E] file:text-white hover:file:bg-[#2C7FFF] transition cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={isLoading}
                className="w-full py-3.5 bg-[#03045E] hover:bg-[#2C7FFF] text-white text-base font-semibold rounded-full shadow-md transition disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Submitting...' : 'Complete Employer Registration'}
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

      {/* --- POP-UP MAP MODAL --- */}
      {isMapModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-[#03045E] text-white p-4 flex justify-between items-center">
              <h3 className="font-semibold text-base">Workplace Location</h3>
              <button onClick={() => setIsMapModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition">✕</button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {isDetecting ? (
                <div className="h-60 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm font-medium text-gray-500 animate-pulse">Detecting your location...</p>
                </div>
              ) : lat && lng ? (
                <>
                  <div className="h-60 rounded-xl overflow-hidden border border-gray-300">
                    <iframe 
                      width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`}
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
              <button onClick={() => setIsMapModalOpen(false)} className="w-full bg-[#03045E] hover:bg-[#2C7FFF] text-white py-3 rounded-full text-sm font-semibold transition">Confirm & Close Map</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}