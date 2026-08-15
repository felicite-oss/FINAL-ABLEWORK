import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Imported useNavigate
import { AccessibilityContext } from '../context/AccessibilityContext';
import headerLogo from '../assets/Final.png';
import backgroundImg from '../assets/Final background.png';

export default function Login() {
  const { mode } = useContext(AccessibilityContext);
  const navigate = useNavigate(); // 2. Initialized navigate

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // 3. Added states for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isAssist = mode === 'Assist';

  const tapTargetSize = isAssist ? 'py-5 px-6 text-xl' : 'py-2.5 px-4';
  const inputSize = isAssist ? 'p-5 text-xl' : 'p-3';
  const labelSize = isAssist ? 'text-lg' : 'text-sm';
  const titleSize = isAssist ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-2xl sm:text-3xl md:text-4xl';
  const subtitleSize = isAssist ? 'text-lg sm:text-xl' : 'text-sm sm:text-base';
  const containerPadding = isAssist ? 'pt-8 px-6 pb-10 sm:pt-12 sm:px-10 sm:pb-14' : 'pt-6 px-5 pb-8 sm:pt-10 sm:px-8 sm:pb-12';
  const containerGap = isAssist ? 'gap-7 sm:gap-8' : 'gap-5 sm:gap-6';
  const formGap = isAssist ? 'gap-6' : 'gap-4 sm:gap-5';

  // 4. Fully updated handleLogin function to talk to the backend
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Redirect based on user role
        if (data.user.role === 'employer') {
          navigate('/employer-dashboard'); // We will need to create this route later!
        } else {
          navigate('/applicant-dashboard');
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } else {
        // Backend rejected login (wrong email/password)
        setErrorMessage(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error("Login request error:", error);
      setErrorMessage("Cannot connect to the server. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen flex flex-col bg-[#f4f4f4] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* ===== HEADER (Fixed to Top) ===== */}
      <header className="w-full bg-[#f4f4f4] border-b border-[#03045E]/10 fixed top-0 left-0 z-50">
        <div className="w-full h-16 pl-4 pr-4 md:pr-8 flex items-center justify-between">
          {/* Left side: Logo + Desktop Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center flex-shrink-0">
              <img
                src={headerLogo}
                alt="AbleWork Logo"
                className="h-20 w-auto object-contain max-h-full"
              />
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

          {/* Desktop Log In - not clickable on Login page */}
          <div className="hidden md:flex items-center">
            <span
              className="px-5 py-2 rounded-full bg-[#2C7FFF] text-white text-sm font-medium border border-[#2C7FFF] cursor-default"
            >
              Log In
            </span>
          </div>

          {/* Mobile Hamburger Button */}
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

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
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
              {/* Mobile Log In - not clickable on Login page */}
              <span
                className="mt-2 px-5 py-2.5 rounded-full bg-[#2C7FFF] text-white text-sm font-medium border border-[#2C7FFF] w-fit cursor-default"
              >
                Log In
              </span>
            </nav>
          </div>
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <div
        className="min-h-screen pt-16 flex flex-col items-center md:items-end justify-center p-4 sm:p-6 md:p-12 relative bg-no-repeat bg-cover bg-center md:bg-[size:1100px_auto] md:bg-left"
        style={{
          backgroundImage: `url(${backgroundImg})`,
        }}
      >
        {/* ===== LOGIN CONTAINER ===== */}
        <div className={`w-full max-w-[340px] sm:max-w-md ${isAssist ? 'sm:max-w-lg' : ''} flex flex-col items-center justify-center ${containerGap} relative z-10
                        bg-white/60 rounded-3xl shadow-xl border border-[#03045E]/10
                        ${containerPadding}
                        min-h-[400px] sm:min-h-[450px]`}>
         
          <div className="text-center w-full">
            <h1 className={`${titleSize} font-extrabold tracking-tighter text-[#03045E] mb-2`}>
              Sign In to AbleWork
            </h1>
            <p className={`${subtitleSize} text-[#03045E]/80`}>
              Welcome back! Please enter your details
            </p>
          </div>

          {/* 5. Added Error Message Display UI */}
          {errorMessage && (
            <div role="alert" className="w-full p-3 text-sm font-bold text-center text-red-800 bg-red-100 border border-red-400 rounded-lg">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className={`flex flex-col ${formGap} w-full`} aria-label="Sign in form" autoComplete="off">
            <div className="flex flex-col gap-2">
              <label className={`font-semibold text-[#03045E] ${labelSize}`} htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className={`${inputSize} border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition`}
                placeholder="Enter your email"
                aria-label="Email Address Input Field"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={`font-semibold text-[#03045E] ${labelSize}`} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className={`${inputSize} border border-[#03045E]/20 rounded-xl bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition`}
                placeholder="Enter your password"
                aria-label="Password Input Field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`mt-2 ${tapTargetSize} bg-[#03045E] hover:bg-[#2C7FFF] disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-semibold text-white shadow-md w-full transition cursor-pointer`}
              aria-label="Submit login credentials"
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          <p className={`text-center text-[#03045E]/80 ${isAssist ? 'text-base' : 'text-sm'}`}>
            Don't have an account?{' '}
            <Link
              to="/register-select"
              className="font-bold text-[#2C7FFF] hover:underline"
              aria-label="Navigate to register account page"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="w-full bg-[#03045E] text-[#f4f4f4] py-8 px-4 md:px-8 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <span className="font-bold text-lg text-white">AbleWork</span>
            <p className="text-xs text-[#f4f4f4]/70">
              © {new Date().getFullYear()} AbleWork. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#f4f4f4]/90 font-medium">
            <Link to="/" className="hover:text-[#2C7FFF] transition">Home</Link>
            <Link to="/about" className="hover:text-[#2C7FFF] transition">About Us</Link>
            <Link to="/policy" className="hover:text-[#2C7FFF] transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#2C7FFF] transition">Terms of Service</Link>
            <Link to="/contact" className="hover:text-[#2C7FFF] transition">Contact Us</Link>
          </div>
          <div className="text-xs text-[#f4f4f4]/60 text-center md:text-right">
            Building an inclusive workforce for everyone.
          </div>
        </div>
      </footer>
    </main>
  );
}