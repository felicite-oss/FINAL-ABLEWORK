import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function EmployerRegister() {
  const navigate = useNavigate();

  // Company & Account Credentials
  const [companyName, setCompanyName] = useState('');
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

    // Stripped down payload
    const payload = {
      companyName,
      email,
      phone,
      password,
      industry,
      jobRole,
      address,
      latitude: lat,
      longitude: lng
    };

    try {
      const response = await fetch('http://localhost:5001/api/auth/register/employer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage({ type: 'success', text: "Registration successful! Redirecting..." });
        setTimeout(() => navigate('/'), 2000);
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
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-8 relative">
      <div className="w-full max-w-xl p-6 bg-white rounded-lg shadow-md border-t-4 border-blue-600">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">
          Employer Registration
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Create your company profile to start posting inclusive jobs.
        </p>

        {statusMessage.text && (
          <div role="alert" className={`p-3 mb-5 rounded text-sm font-medium text-center border ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* Section 1: Credentials */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">1. Company & Account Credentials</h2>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Company Name</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="w-full p-2.5 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Industry Type</label>
              <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Technology" required className="w-full p-2.5 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Work Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2.5 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Telephone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-2.5 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2.5 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          {/* Section 2: Account Details & Location */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">2. Job Profile & Location</h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Primary Job Role / Title</label>
              <input type="text" value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="e.g. Hiring Manager" required className="w-full p-2.5 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none" />
            </div>

            {/* Location & Map Trigger */}
            <div className="flex flex-col gap-3 p-4 mt-2 border border-blue-100 rounded-md bg-blue-50/30">
              <div>
                <label className="text-sm font-semibold text-blue-900">Workplace Location (Geofencing)</label>
                <p className="text-xs text-blue-700 mt-0.5">Pinpoint your exact office location to match with nearby applicants later.</p>
              </div>
              
              <button type="button" onClick={handleDetectLocation} className="w-full bg-blue-600 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
                🗺️ Open Map & Detect Location
              </button>
              
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Physical Address" required className="w-full p-2.5 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-3 mt-2 bg-blue-600 text-white text-base font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {isLoading ? 'Submitting...' : 'Complete Employer Registration'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to="/register-select" className="text-blue-600 font-medium hover:underline">← Back to Role Selection</Link>
        </p>
      </div>

      {/* --- POP-UP MAP MODAL --- */}
      {isMapModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-xl overflow-hidden shadow-xl flex flex-col">
            
            <div className="bg-blue-600 text-white p-3.5 flex justify-between items-center">
              <h3 className="font-semibold text-base">Workplace Location</h3>
              <button onClick={() => setIsMapModalOpen(false)} className="text-white text-xl hover:text-gray-200 leading-none">✕</button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {isDetecting ? (
                <div className="h-60 flex items-center justify-center bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm font-medium text-gray-500 animate-pulse">Detecting your location...</p>
                </div>
              ) : lat && lng ? (
                <>
                  <div className="h-60 rounded overflow-hidden border border-gray-300">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      marginHeight="0" 
                      marginWidth="0" 
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`}
                    ></iframe>
                  </div>
                  <p className="text-sm font-medium text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-200">
                    Detected Address: <br/><span className="font-normal text-blue-600">{address}</span>
                  </p>
                </>
              ) : (
                <div className="h-60 flex items-center justify-center bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm font-medium text-red-500">Location access failed. Please try again.</p>
                </div>
              )}

              <button onClick={() => setIsMapModalOpen(false)} className="w-full bg-blue-600 text-white py-2.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
                Confirm & Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}