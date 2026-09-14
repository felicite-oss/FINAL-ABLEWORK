import { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';
import lightLogo from '../assets/LIGHT MODE.png';
import darkLogo from '../assets/DARK MODE.png';
import backgroundImg from '../assets/BG.png';

export default function Login() {
  const { mode } = useContext(AccessibilityContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Clear fields every time the login screen launches (stops browser autofill)
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  // Check if contrast mode is active (Bulletproof case-insensitive check)
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  // Support A / A+ / A++ (and Assist)
  const isAPlusPlus = mode === 'A++' || mode === 'Assist' || mode === 'a++' || mode === 'assist';
  const isAPlus = mode === 'A+' || mode === 'a+';
  const isAssist = isAPlusPlus; // keep for container sizing

  // All text sizes for A, A+, A++ (made bigger and more readable as requested)
  const tapTargetSize = isAPlusPlus
    ? 'py-6 px-8 text-2xl font-bold'
    : isAPlus
      ? 'py-4 px-6 text-xl font-bold'
      : 'py-4 px-6 text-lg font-bold';

  const inputSize = isAPlusPlus
    ? 'p-6 text-2xl font-medium'
    : isAPlus
      ? 'p-5 text-xl font-medium'
      : 'p-4.5 text-lg font-medium';

  const labelSize = isAPlusPlus
    ? 'text-xl font-extrabold text-[#03045E]'
    : isAPlus
      ? 'text-lg font-extrabold text-[#03045E]'
      : 'text-base font-extrabold text-[#03045E]';

  const titleSize = isAPlusPlus
    ? 'text-4xl sm:text-5xl md:text-6xl font-black text-[#03045E]'
    : isAPlus
      ? 'text-3xl sm:text-4xl md:text-5xl font-black text-[#03045E]'
      : 'text-2xl sm:text-3xl md:text-4xl font-black text-[#03045E]';

  const subtitleSize = isAPlusPlus
    ? 'text-xl sm:text-2xl font-semibold text-[#03045E]/90'
    : isAPlus
      ? 'text-lg sm:text-xl font-semibold text-[#03045E]/90'
      : 'text-base sm:text-lg font-semibold text-[#03045E]/90';

  const footerLinkSize = isAPlusPlus
    ? 'text-lg font-bold'
    : isAPlus
      ? 'text-base font-bold'
      : 'text-sm font-bold';

  // Container padding (made slightly more compact as requested)
  const containerPadding = isAssist 
    ? 'pt-10 px-8 pb-12 sm:pt-12 sm:px-10 sm:pb-16 lg:pt-14 lg:px-12 lg:pb-18' 
    : 'pt-8 px-6 pb-10 sm:pt-10 sm:px-10 sm:pb-14 lg:pt-12 lg:px-12 lg:pb-16';
  const containerGap = isAssist ? 'gap-6 sm:gap-8' : 'gap-5 sm:gap-6';
  const formGap = isAssist ? 'gap-5 sm:gap-6' : 'gap-4 sm:gap-5';

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
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.user.role === 'employer') {
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
    <main
      className={`min-h-screen flex flex-col ${isContrast ? 'bg-black text-white' : 'bg-[#f4f4f4] text-[#03045E]'} overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
      role="main"
      aria-label="Login page"
    >
      {/* ===== HEADER ===== */}
      <header
        className={`w-full ${isContrast ? 'bg-black border-b-1 border-[#2C7FFF]' : 'bg-[#f4f4f4] border-b border-[#03045E]/10'} fixed top-0 left-0 z-50`}
        role="banner"
        aria-label="Site header"
      >
        <div className="w-full h-16 pl-4 pr-4 md:pr-8 flex items-center justify-between max-w-[1700px] mx-auto box-border">
          {/* Left side: Logo + Desktop Navigation — grouped */}
          <div
            className="flex items-center gap-8"
            role="group"
            aria-label="Logo and main navigation"
          >
            <div className="flex items-center flex-shrink-0 py-1">
              <img
                src={isContrast ? darkLogo : lightLogo}
                alt="AbleWork Logo - Inclusive employment platform"
                className="h-14 w-auto object-contain max-h-full"
              />
            </div>
            <nav
              className={`hidden md:flex items-center gap-6 text-[15px] font-medium ${isContrast ? 'text-white' : 'text-[#03045E]'}`}
              aria-label="Main navigation"
            >
              <Link to="/" className={`${isContrast ? 'text-white hover:text-blue-400' : 'text-[#03045E] hover:text-[#2C7FFF]'} transition pb-0.5`}>Home</Link>
              <Link to="/about" className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition`}>About Us</Link>
              <Link to="/policy" className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition`}>Policy</Link>
            </nav>
          </div>

          {/* Desktop Log In - current page indicator */}
          <div className="hidden md:flex items-center">
            <span
              className={`px-5 py-2 rounded-full ${isContrast ? 'bg-blue-400 text-black border border-blue-400' : 'bg-[#2C7FFF] text-white border border-[#2C7FFF]'} text-sm font-medium cursor-default`}
              aria-current="page"
              aria-label="Log In - current page"
            >
              Log In
            </span>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className={`md:hidden flex items-center justify-center w-10 h-10 rounded-lg ${isContrast ? 'bg-blue-400 text-black' : 'bg-[#2C7FFF] text-[#f4f4f4]'}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="login-mobile-menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          id="login-mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? `${isContrast ? 'bg-black border-b-2 border-[#2C7FFF]' : 'bg-[#f4f4f4] border-b border-[#03045E]/10'} max-h-96 opacity-100 shadow-lg` : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!isOpen}
        >
          <div className={`w-full ${isContrast ? 'bg-black' : 'bg-[#f4f4f4]'}`}>
            <nav
              className={`flex flex-col px-6 py-5 gap-5 text-[16px] font-medium ${isContrast ? 'text-white' : 'text-[#03045E]'} max-w-[1700px] mx-auto`}
              aria-label="Mobile navigation"
            >
              <Link to="/" className={`${isContrast ? 'text-white hover:text-blue-400' : 'text-[#03045E] hover:text-[#2C7FFF]'} transition`} onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/about" className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition`} onClick={() => setIsOpen(false)}>About Us</Link>
              <Link to="/policy" className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition`} onClick={() => setIsOpen(false)}>Policy</Link>
              {/* Mobile Log In - current page indicator */}
              <span
                className={`mt-2 px-5 py-2.5 rounded-full ${isContrast ? 'bg-blue-400 text-black border border-blue-400' : 'bg-[#2C7FFF] text-white border border-[#2C7FFF]'} text-sm font-medium w-fit cursor-default`}
                aria-current="page"
                aria-label="Log In - current page"
              >
                Log In
              </span>
            </nav>
          </div>
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <div
        className={`flex-grow pt-16 pb-12 flex flex-col items-center md:items-end justify-center pl-4 pr-4 md:pr-12 lg:pr-16 md:pl-8 max-w-[1700px] mx-auto w-full box-border relative bg-no-repeat bg-cover bg-center md:bg-[size:1100px_auto] md:bg-left min-h-[110vh] md:min-h-[105vh] transition-all duration-300 ${isOpen ? 'mt-48 sm:mt-56' : 'mt-0'}`}
        style={{
          backgroundImage: `url(${backgroundImg})`,
        }}
        role="region"
        aria-label="Login form area"
      >
        {/* ===== LOGIN CONTAINER — grouped (Made slightly smaller) ===== */}
        <div
          className={`w-full ${isAssist ? 'max-w-[480px] sm:max-w-xl' : 'max-w-[400px] sm:max-w-md'} flex flex-col items-center justify-start ${containerGap} relative z-10
            ${isContrast ? 'bg-black/90 text-white border-2 border-blue-400 shadow-[0_0_25px_rgba(,204,21,0.4)]' : 'bg-white/85 text-[#03045E] border border-[#03045E]/15'} backdrop-blur-md rounded-3xl shadow-xl
            ${containerPadding}
            ${isAssist ? 'min-h-[580px] sm:min-h-[660px]' : 'min-h-[520px] sm:min-h-[600px]'} md:mt-4 mr-0 md:mr-2 lg:mr-6`}
          role="region"
          aria-labelledby="login-heading"
        >
          
          <div
            className="text-center w-full -mt-2 sm:-mt-3"
            role="group"
            aria-labelledby="login-heading"
          >
            <h1
              id="login-heading"
              className={`${titleSize} ${isContrast ? '!text-white' : ''} tracking-tight mb-2`}
            >
              Sign In to AbleWork
            </h1>
            <p className={`${subtitleSize} ${isContrast ? '!text-white/90' : ''}`}>
              Welcome back! Please enter your details
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className={`w-full p-3.5 text-sm font-bold text-center ${isContrast ? 'text-blue-300 bg-zinc-900 border border-blue-400' : 'text-red-800 bg-red-100 border border-blue-400'} rounded-xl shadow-inner`}
            >
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className={`flex flex-col ${formGap} w-full`}
            aria-label="Sign in form"
            autoComplete="off"
          >
            <div className="flex flex-col gap-2" role="group" aria-labelledby="email-label">
              <label
                id="email-label"
                className={`${labelSize} ${isContrast ? '!text-white' : ''}`}
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                readOnly
                onFocus={(e) => e.target.removeAttribute('readOnly')}
                className={`${inputSize} ${isContrast ? 'border-2 border-blue-400 bg-black text-white focus:border-blue-300' : 'border-2 border-[#03045E]/30 bg-white text-[#03045E] focus:border-[#2C7FFF]'} rounded-2xl focus:outline-none shadow-sm transition`}
                placeholder="Enter your email"
                aria-required="true"
                aria-invalid={!!errorMessage}
                aria-describedby={errorMessage ? 'login-error' : undefined}
                required
              />
            </div>

            <div className="flex flex-col gap-2" role="group" aria-labelledby="password-label">
              <label
                id="password-label"
                className={`${labelSize} ${isContrast ? '!text-white' : ''}`}
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                readOnly
                onFocus={(e) => e.target.removeAttribute('readOnly')}
                className={`${inputSize} ${isContrast ? 'border-2 border-blue-400 bg-black text-white focus:border-blue-300' : 'border-2 border-[#03045E]/30 bg-white text-[#03045E] focus:border-[#2C7FFF]'} rounded-2xl focus:outline-none shadow-sm transition`}
                placeholder="Enter your password"
                aria-required="true"
                aria-invalid={!!errorMessage}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`mt-2 ${tapTargetSize} ${isContrast ? 'bg-blue-400 text-black hover:bg-blue-300 border border-blue-400 font-black' : 'bg-[#03045E] hover:bg-[#2C7FFF] text-white'} disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-md w-full transition-all duration-200 cursor-pointer`}
              aria-label={isLoading ? 'Logging in, please wait' : 'Log in to AbleWork'}
              aria-busy={isLoading}
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          {/* Hidden live region id for error association when present */}
          {errorMessage && <span id="login-error" className="sr-only">{errorMessage}</span>}

          <p className={`text-center ${isContrast ? 'text-white/90' : 'text-[#03045E]/90'} ${footerLinkSize} pt-1`}>
            Don't have an account?{' '}
            <Link
              to="/register-select"
              className={`font-black ${isContrast ? 'text-blue-400 hover:text-blue-300 underline' : 'text-[#2C7FFF] hover:underline'}`}
              aria-label="Create a new AbleWork account"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer
        className={`w-full relative z-20 overflow-hidden ${isContrast ? 'bg-black text-white border-t-1 border-blue-100' : 'bg-[#03045E] text-white'} mt-auto`}
        style={{
          filter: 'none',
          WebkitFilter: 'none',
          forcedColorAdjust: 'none',
        }}
        role="contentinfo"
        aria-label="Site footer"
      >
        {/* Top accent bar */}
        <div className={`h-1 w-full ${isContrast ? 'bg-blue-400' : 'bg-[#2C7FFF]'}`} aria-hidden="true" />

        <div className="w-full h-auto pl-4 pr-4 md:pr-8 py-10 sm:py-12 max-w-[1700px] mx-auto box-border">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between">
            
            {/* Left Column: Brand & Mission — grouped */}
            <div
              className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-3"
              role="group"
              aria-label="AbleWork brand and description"
            >
              <div className="flex items-center gap-3">
                <img
                  src={isContrast ? darkLogo : lightLogo}
                  alt="AbleWork Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="text-sm sm:text-base text-white/90 font-medium max-w-md leading-relaxed">
                Empowering individuals and fostering an inclusive workforce with accessible smart-matching and equal opportunities for everyone.
              </p>
              <div className="pt-1 text-xs sm:text-sm text-white/80 font-semibold tracking-wide">
                © {new Date().getFullYear()} AbleWork. All rights reserved.
              </div>
            </div>

            {/* Right Column: Quick Action Links — grouped */}
            <div className="md:col-span-7 flex flex-col md:flex-row items-center justify-center md:justify-end gap-6">
              <div
                className="flex flex-col items-center md:items-end space-y-3"
                role="group"
                aria-label="Explore platform links"
              >
                <span className={`text-xs sm:text-sm font-extrabold uppercase tracking-widest ${isContrast ? 'text-blue-400' : 'text-[03045e]'}`}>
                  Explore Platform
                </span>
                <nav
                  className="flex flex-wrap justify-center md:justify-end items-center gap-3"
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
                        `px-4 py-2.5 rounded-xl font-bold transition-all duration-300 border text-sm shadow-md hover:-translate-y-0.5 ${
                          isActive
                            ? isContrast
                              ? 'bg-blue-400 border-blue-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.6)] underline font-black'
                              : 'bg-[#2C7FFF] border-[#2C7FFF] text-white shadow-[0_0_20px_rgba(44,127,255,0.6)] underline'
                            : isContrast
                              ? 'bg-zinc-900 border-blue-400/50 text-white hover:bg-blue-400 hover:text-black hover:border-blue-400'
                              : 'bg-white/10 border-white/20 text-white hover:bg-[#2C7FFF]/40 hover:border-[#2C7FFF]/60 hover:text-white'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom subtle bar */}
        <div className={`w-full ${isContrast ? 'bg-zinc-950 text-blue-03045e border-t border-blue-03045e' : 'bg-[#03045e] text-white/90 border-t border-white/10'} py-4 px-4 text-center text-xs sm:text-sm font-medium tracking-wide`}>
          Designed with accessibility and inclusivity at heart.
        </div>
      </footer>
    </main>
  );
}