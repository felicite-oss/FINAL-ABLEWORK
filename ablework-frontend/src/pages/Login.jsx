import { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';
import headerLogo from '../assets/Final.png';
import backgroundImg from '../assets/Final background.png';

export default function Login() {
  const { mode } = useContext(AccessibilityContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Support A / A+ / A++ (and Assist)
  const isAPlusPlus = mode === 'A++' || mode === 'Assist' || mode === 'a++' || mode === 'assist';
  const isAPlus = mode === 'A+' || mode === 'a+';
  const isAssist = isAPlusPlus; // keep for container sizing

  // All text sizes for A, A+, A++
  const tapTargetSize = isAPlusPlus
    ? 'py-5 px-6 text-xl'
    : isAPlus
      ? 'py-3.5 px-5 text-base'
      : 'py-3 px-4 text-sm';

  const inputSize = isAPlusPlus
    ? 'p-5 text-xl'
    : isAPlus
      ? 'p-4 text-base'
      : 'p-3.5 text-sm';

  const labelSize = isAPlusPlus
    ? 'text-lg'
    : isAPlus
      ? 'text-base'
      : 'text-sm';

  const titleSize = isAPlusPlus
    ? 'text-3xl sm:text-4xl md:text-5xl'
    : isAPlus
      ? 'text-2xl sm:text-3xl md:text-4xl'
      : 'text-xl sm:text-2xl md:text-3xl';

  const subtitleSize = isAPlusPlus
    ? 'text-lg sm:text-xl'
    : isAPlus
      ? 'text-base sm:text-lg'
      : 'text-sm sm:text-base';

  const footerLinkSize = isAPlusPlus
    ? 'text-base'
    : isAPlus
      ? 'text-sm'
      : 'text-sm';

  // Container padding
  const containerPadding = isAssist 
    ? 'pt-10 px-5 pb-12 sm:pt-12 sm:px-8 sm:pb-16 lg:pt-14 lg:px-10 lg:pb-20' 
    : 'pt-6 px-5 pb-8 sm:pt-8 sm:px-8 sm:pb-12 lg:pt-12 lg:px-10 lg:pb-16';
  const containerGap = isAssist ? 'gap-7 sm:gap-8' : 'gap-5 sm:gap-6';
  const formGap = isAssist ? 'gap-6' : 'gap-4 sm:gap-5';

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
        // FIXED: Save the user data first for BOTH applicants and employers
        localStorage.setItem('user', JSON.stringify(data.user));

        // Then route them to the correct dashboard
        if (data.user.role === 'employer') {
          navigate('/employer-dashboard');
        } else {
          navigate('/applicant-dashboard');
        }
      } else {
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
    <main className="min-h-screen flex flex-col bg-[#f4f4f4] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
              <span className="text-[#2C7FFF] font-semibold border-b-2 border-[#2C7FFF] pb-0.5 cursor-default">Home</span>
              <Link to="/about" className="hover:text-[#2C7FFF] transition">About Us</Link>
              <Link to="/policy" className="hover:text-[#2C7FFF] transition">Policy</Link>
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
              <span className="text-[#2C7FFF] font-semibold pl-2 border-l-4 border-[#2C7FFF] cursor-default">Home</span>
              <Link to="/about" className="hover:text-[#2C7FFF] transition" onClick={() => setIsOpen(false)}>About Us</Link>
              <Link to="/policy" className="hover:text-[#2C7FFF] transition" onClick={() => setIsOpen(false)}>Policy</Link>
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
        className="flex-grow pt-24 pb-12 flex flex-col items-center md:items-end justify-center p-4 sm:p-6 md:p-12 relative bg-no-repeat bg-cover bg-center md:bg-[size:1100px_auto] md:bg-left min-h-[100svh] md:min-h-0"
        style={{
          backgroundImage: `url(${backgroundImg})`,
        }}
      >
        {/* ===== LOGIN CONTAINER ===== */}
        <div className={`w-full ${isAssist ? 'max-w-[420px] sm:max-w-xl' : 'max-w-[340px] sm:max-w-md'} flex flex-col items-center justify-start ${containerGap} relative z-10
              bg-white/60 rounded-3xl shadow-xl border border-[#03045E]/10
              ${containerPadding}
              ${isAssist ? 'min-h-[560px] sm:min-h-[640px]' : 'min-h-[500px] sm:min-h-[590px]'} md:mt-16`}>
         
          <div className="text-center w-full -mt-2 sm:-mt-3">
            <h1 className={`${titleSize} font-extrabold tracking-tighter text-[#03045E] mb-2`}>
              Sign In to AbleWork
            </h1>
            <p className={`${subtitleSize} text-[#03045E]/80`}>
              Welcome back! Please enter your details
            </p>
          </div>

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

          <p className={`text-center text-[#03045E]/80 ${footerLinkSize}`}>
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

      {/* ===== UNIQUE FOOTER (left brand / right nav — compact, locked for Standard & Contrast) ===== */}
      <footer
        className="w-full relative z-20 overflow-hidden mt-auto"
        style={{
          background: 'linear-gradient(135deg, #03045E 0%, #04068A 55%, #0a1a6e 100%)',
          color: '#f4f4f4',
          filter: 'none',
          WebkitFilter: 'none',
          forcedColorAdjust: 'none',
        }}
      >
        {/* Top accent line */}
        <div
          className="h-0.5 w-full"
          style={{ background: 'linear-gradient(90deg, #2C7FFF 0%, #5BA3FF 50%, #2C7FFF 100%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-4 md:gap-6">

            {/* Left: Brand + tagline + copyright */}
            <div className="text-center md:text-left shrink-0">
              <p className="font-extrabold tracking-tight" style={{ fontSize: '16px', color: '#ffffff' }}>
                AbleWork
              </p>
              <p className="mt-0.5" style={{ fontSize: '12px', color: 'rgba(244,244,244,0.7)' }}>
                Building an inclusive workforce for everyone.
              </p>
              <p className="mt-1.5" style={{ fontSize: '11px', color: 'rgba(244,244,244,0.5)' }}>
                © {new Date().getFullYear()} AbleWork. All rights reserved.
              </p>
            </div>

            {/* Right: Nav Links */}
            <nav
              className="flex flex-wrap justify-center md:justify-end items-center gap-2"
              aria-label="Footer navigation"
            >
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Us' },
                { to: '/policy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms of Service' },
                { to: '/contact', label: 'Contact Us' },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-full font-semibold transition-all duration-200 border ${
                      isActive
                        ? 'bg-[#2C7FFF] border-[#2C7FFF] text-white shadow-md'
                        : 'bg-white/5 border-white/15 text-[#f4f4f4] hover:bg-[#2C7FFF]/20 hover:border-[#2C7FFF]/50 hover:text-white'
                    }`
                  }
                  style={{ fontSize: '12px' }}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
}