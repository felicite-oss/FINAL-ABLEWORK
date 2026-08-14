import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ApplicantRegister() {
  const navigate = useNavigate();

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
  const [radius, setRadius] = useState('10'); // in km
  
  // Workplace Independence
  const [independence, setIndependence] = useState('');

  // Form Submission States (NEW)
  const [pwdFile, setPwdFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Chip-based selections with "Other" states
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

  // Auto-Detect Location Function (Now saves lat/lng)
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

  // MAIN SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    
    // 1. Validate Age
    const birthYear = new Date(birthdate).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 18) {
      setStatusMessage({ type: 'error', text: "You must be 18 years or older to register on AbleWork." });
      return;
    }

    // 2. Validate File Upload
    if (!pwdFile) {
      setStatusMessage({ type: 'error', text: "Please upload your PWD ID or Certification." });
      return;
    }

    setIsLoading(true);

    // 3. Prepare Final Arrays
    const finalDisabilities = [...selectedDisabilities, ...(showOtherDisability && otherDisability ? [otherDisability] : [])];
    const finalAccommodations = [...selectedAccommodations, ...(showOtherAccommodation && otherAccommodation ? [otherAccommodation] : [])];
    const finalSkills = [...selectedSkills, ...(showOtherSkill && otherSkill ? [otherSkill] : [])];

    // 4. Construct FormData for Express backend
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
    
    // Arrays need to be stringified before appending to FormData
    formData.append('disabilities', JSON.stringify(finalDisabilities));
    formData.append('accommodations', JSON.stringify(finalAccommodations));
    formData.append('skills', JSON.stringify(finalSkills));
    
    // Append the actual file
    formData.append('pwdDocument', pwdFile);

    try {
      // CHANGE 5000 to 5001 HERE:
      const response = await fetch('http://localhost:5001/api/auth/register/applicant', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage({ type: 'success', text: "Registration successful! Redirecting to login..." });
        setTimeout(() => navigate('/'), 2000);
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
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4 py-12">
      <div className="w-full max-w-2xl p-8 bg-[var(--bg-card)] rounded-xl shadow-2xl border-t-8 border-[var(--border-accent)] text-lg">
        
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2 text-center" tabIndex="0">
          Job Seeker Registration
        </h1>
        <p className="text-base text-[var(--text-secondary)] mb-6 text-center font-medium">
          Build your accessible career profile with optimized viewing features.
        </p>

        {/* DYNAMIC STATUS MESSAGE (TalkBack Optimized) */}
        {statusMessage.text && (
          <div 
            role="alert" 
            aria-live="assertive"
            className={`p-4 mb-6 rounded-lg font-bold text-center border-2 ${
              statusMessage.type === 'success' 
                ? 'bg-green-100 text-green-800 border-green-400' 
                : 'bg-red-100 text-red-800 border-red-400'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-10" aria-label="Applicant Registration Form">
          
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <label htmlFor="firstName" className="text-base font-bold text-[var(--text-secondary)]">First Name</label>
              <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required aria-required="true" className="w-full p-4 text-base border-2 rounded-lg bg-white text-black focus:border-[var(--border-accent)]" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="middleName" className="text-base font-bold text-[var(--text-secondary)]">Middle Name (Optional)</label>
              <input id="middleName" type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="w-full p-4 text-base border-2 rounded-lg bg-white text-black focus:border-[var(--border-accent)]" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="lastName" className="text-base font-bold text-[var(--text-secondary)]">Last Name</label>
              <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required aria-required="true" className="w-full p-4 text-base border-2 rounded-lg bg-white text-black focus:border-[var(--border-accent)]" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-base font-bold text-[var(--text-secondary)]">Phone Number</label>
              <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required aria-required="true" className="w-full p-4 text-base border-2 rounded-lg bg-white text-black focus:border-[var(--border-accent)]" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-base font-bold text-[var(--text-secondary)]">Email Address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required aria-required="true" className="w-full p-4 text-base border-2 rounded-lg bg-white text-black focus:border-[var(--border-accent)]" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-base font-bold text-[var(--text-secondary)]">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required aria-required="true" className="w-full p-4 text-base border-2 rounded-lg bg-white text-black focus:border-[var(--border-accent)]" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="birthdate" className="text-base font-bold text-[var(--text-secondary)]">Birthdate (Must be 18+)</label>
              <input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} required aria-required="true" className="w-full p-4 text-base border-2 rounded-lg bg-white text-black focus:border-[var(--border-accent)]" />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* AUTO-DETECT ADDRESS FIELD */}
          <div className="flex flex-col gap-4 p-6 border-2 border-blue-200 rounded-xl bg-blue-50/50">
            <label htmlFor="address" className="text-lg font-extrabold text-blue-900">Residential Address</label>
            <p className="text-sm text-blue-800 font-medium">Use the button to detect your location, or type it manually below.</p>
            
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetecting}
                aria-live="polite"
                className="bg-blue-600 text-white px-6 py-4 rounded-lg font-bold shadow-md hover:bg-blue-700 cursor-pointer disabled:opacity-50 flex items-center justify-center transition-all"
                aria-label={isDetecting ? "Detecting location, please wait" : "Automatically detect current location"}
              >
                {isDetecting ? '⏳ Detecting...' : '📍 Detect Location'}
              </button>
              
              <input 
                id="address"
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="e.g. Block 4, Main Street, Manila" 
                required
                aria-required="true"
                className="w-full p-4 text-base border-2 rounded-lg bg-white text-black border-gray-300 focus:border-[var(--border-accent)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="radius" className="text-base font-bold text-[var(--text-secondary)]">
              Max Travel Radius: <span className="text-blue-600 font-extrabold" aria-live="polite">{radius} km</span>
            </label>
            <input id="radius" type="range" min="1" max="50" value={radius} onChange={(e) => setRadius(e.target.value)} aria-valuemin="1" aria-valuemax="50" aria-valuenow={radius} className="w-full mt-2 h-3 accent-blue-600 cursor-pointer" />
          </div>

          <hr className="border-gray-200" />

          {/* 1. DISABILITY CHIPS */}
          <fieldset className="flex flex-col gap-3">
            <legend className="text-lg font-extrabold text-[var(--text-secondary)] mb-1">Granular Disability Details</legend>
            <p className="text-sm text-gray-500 mb-2 font-medium">Select all that apply to you:</p>
            
            <div className="flex flex-wrap gap-3">
              {availableDisabilities.map((disability) => (
                <button
                  type="button"
                  key={disability}
                  onClick={() => toggleSelection(disability, selectedDisabilities, setSelectedDisabilities)}
                  aria-pressed={selectedDisabilities.includes(disability)}
                  className={`px-4 py-2.5 rounded-full text-sm font-bold border-2 cursor-pointer transition-all ${
                    selectedDisabilities.includes(disability)
                      ? 'bg-[var(--border-accent)] text-white border-[var(--border-accent)] shadow'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {disability} {selectedDisabilities.includes(disability) ? '✓' : '+'}
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => setShowOtherDisability(!showOtherDisability)}
                aria-pressed={showOtherDisability}
                className={`px-4 py-2.5 rounded-full text-sm font-bold border-2 cursor-pointer transition-all ${
                  showOtherDisability
                    ? 'bg-gray-800 text-white border-gray-800 shadow'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                }`}
              >
                Other (Specify) {showOtherDisability ? '✓' : '+'}
              </button>
            </div>
            
            <div aria-live="polite">
              {showOtherDisability && (
                <input 
                  type="text" 
                  value={otherDisability} 
                  onChange={(e) => setOtherDisability(e.target.value)} 
                  placeholder="Please specify your disability..." 
                  aria-label="Specify other disability"
                  className="mt-4 w-full p-4 text-base border-2 rounded-lg bg-gray-50 text-black focus:border-[var(--border-accent)]"
                  required={showOtherDisability}
                />
              )}
            </div>
          </fieldset>

          {/* WORKPLACE INDEPENDENCE CHIPS */}
          <fieldset className="flex flex-col gap-3 mt-2">
            <legend className="text-lg font-extrabold text-[var(--text-secondary)] mb-1">Workplace Independence</legend>
            <p className="text-sm text-gray-500 mb-2 font-medium">Select the statement that best describes you:</p>
            
            <div className="flex flex-wrap gap-3">
              {['Independent', 'Requires Assistance'].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setIndependence(option)}
                  aria-pressed={independence === option}
                  className={`px-5 py-3 rounded-xl text-base font-bold border-2 cursor-pointer transition-all ${
                    independence === option
                      ? 'bg-[var(--border-accent)] text-white border-[var(--border-accent)] shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {option} {independence === option ? '✓' : ''}
                </button>
              ))}
            </div>
          </fieldset>

          {/* 2. ACCOMMODATION CHIPS */}
          <fieldset className="flex flex-col gap-3 mt-2">
            <legend className="text-lg font-extrabold text-[var(--text-secondary)] mb-1">Required Accommodations / Aids</legend>
            <p className="text-sm text-gray-500 mb-2 font-medium">Select any tools or environments you need:</p>
            
            <div className="flex flex-wrap gap-3">
              {availableAccommodations.map((acc) => (
                <button
                  type="button"
                  key={acc}
                  onClick={() => toggleSelection(acc, selectedAccommodations, setSelectedAccommodations)}
                  aria-pressed={selectedAccommodations.includes(acc)}
                  className={`px-4 py-2.5 rounded-full text-sm font-bold border-2 cursor-pointer transition-all ${
                    selectedAccommodations.includes(acc)
                      ? 'bg-[var(--border-accent)] text-white border-[var(--border-accent)] shadow'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {acc} {selectedAccommodations.includes(acc) ? '✓' : '+'}
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => setShowOtherAccommodation(!showOtherAccommodation)}
                aria-pressed={showOtherAccommodation}
                className={`px-4 py-2.5 rounded-full text-sm font-bold border-2 cursor-pointer transition-all ${
                  showOtherAccommodation
                    ? 'bg-gray-800 text-white border-gray-800 shadow'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                }`}
              >
                Other (Specify) {showOtherAccommodation ? '✓' : '+'}
              </button>
            </div>

            <div aria-live="polite">
              {showOtherAccommodation && (
                <input 
                  type="text" 
                  value={otherAccommodation} 
                  onChange={(e) => setOtherAccommodation(e.target.value)} 
                  placeholder="Please specify required accommodations..." 
                  aria-label="Specify other accommodations"
                  className="mt-4 w-full p-4 text-base border-2 rounded-lg bg-gray-50 text-black focus:border-[var(--border-accent)]"
                  required={showOtherAccommodation}
                />
              )}
            </div>
          </fieldset>

          {/* 3. SKILL CHIPS */}
          <fieldset className="flex flex-col gap-3 mt-2">
            <legend className="text-lg font-extrabold text-[var(--text-secondary)] mb-1">Your Skills</legend>
            <p className="text-sm text-gray-500 mb-2 font-medium">Select all skills you possess:</p>
            
            <div className="flex flex-wrap gap-3">
              {availableSkills.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSelection(skill, selectedSkills, setSelectedSkills)}
                  aria-pressed={selectedSkills.includes(skill)}
                  className={`px-4 py-2.5 rounded-full text-sm font-bold border-2 cursor-pointer transition-all ${
                    selectedSkills.includes(skill)
                      ? 'bg-[var(--border-accent)] text-white border-[var(--border-accent)] shadow'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {skill} {selectedSkills.includes(skill) ? '✓' : '+'}
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => setShowOtherSkill(!showOtherSkill)}
                aria-pressed={showOtherSkill}
                className={`px-4 py-2.5 rounded-full text-sm font-bold border-2 cursor-pointer transition-all ${
                  showOtherSkill
                    ? 'bg-gray-800 text-white border-gray-800 shadow'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                }`}
              >
                Other (Specify) {showOtherSkill ? '✓' : '+'}
              </button>
            </div>

            <div aria-live="polite">
              {showOtherSkill && (
                <input 
                  type="text" 
                  value={otherSkill} 
                  onChange={(e) => setOtherSkill(e.target.value)} 
                  placeholder="Enter custom skills (e.g. Graphic Design)..." 
                  aria-label="Specify other skills"
                  className="mt-4 w-full p-4 text-base border-2 rounded-lg bg-gray-50 text-black focus:border-[var(--border-accent)]"
                  required={showOtherSkill}
                />
              )}
            </div>
          </fieldset>

          <hr className="border-gray-200" />

          {/* Verification Documents Upload */}
          <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300">
            <label htmlFor="pwdId" className="block text-lg font-extrabold text-[var(--text-secondary)] mb-2">Upload PWD ID / Certificates</label>
            <p className="text-sm text-gray-500 mb-4 font-medium" id="fileDesc">Please attach a valid identification card or certification.</p>
            <input 
              id="pwdId" 
              type="file" 
              onChange={(e) => setPwdFile(e.target.files[0])} // Captures the file to state
              aria-describedby="fileDesc" 
              aria-required="true" 
              className="w-full p-2 bg-white text-black text-base cursor-pointer rounded" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 py-5 bg-[var(--border-accent)] text-white text-xl font-extrabold rounded-xl cursor-pointer shadow-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center" 
            aria-label={isLoading ? "Submitting application, please wait" : "Submit application and complete registration"}
          >
            {isLoading ? 'Submitting...' : 'Complete Applicant Registration'}
          </button>
        </form>

        <p className="mt-10 text-center text-base text-[var(--text-secondary)]">
          <Link to="/register-select" className="text-[var(--border-accent)] font-bold hover:underline" aria-label="Navigate back to Role Selection page">
            ← Back to Role Selection
          </Link>
        </p>
      </div>
    </main>
  );
}