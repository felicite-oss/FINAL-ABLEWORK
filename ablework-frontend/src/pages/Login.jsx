import { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';
import { useColorPalette } from '../context/ColorPaletteContext';
import lightLogo from '../assets/LIGHT MODE.png';
import darkLogo from '../assets/DARK MODE.png';
import backgroundImg from '../assets/BG.png';

export default function Login() {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey, colors } = useColorPalette();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && mode.toLowerCase().includes('dark');
  const isAccessibilityMode = paletteKey === 'highContrast' || paletteKey === 'darkComfort';
  const isDarkActive = mode && typeof mode === 'string' && mode.toLowerCase().includes('dark');
  const useLightLogo = (paletteKey === 'highContrast' || paletteKey === 'darkComfort') && !isDarkActive;
  const isAPlusPlus = mode === 'A++' || mode === 'Assist' || mode === 'a++' || mode === 'assist';
  const isAPlus = mode === 'A+' || mode === 'a+';
  const isAssist = isAPlusPlus; 

  const primaryColor = colors?.primary || '#2C7FFF';
  const secondaryColor = colors?.secondary || '#03045E';

  const tapTargetSize = isAPlusPlus
    ? 'py-6 px-8 text-2xl font-bold'
    : isAPlus
      ? 'py-4 px-6 text-xl font-bold'
      : 'py-3 px-4 sm:py-4 sm:px-6 text-sm sm:text-lg font-bold';

  const inputSize = isAPlusPlus
    ? 'p-6 text-2xl font-medium'
    : isAPlus
      ? 'p-5 text-xl font-medium'
      : 'p-3 sm:p-4.5 text-sm sm:text-lg font-medium';

  const labelSize = isAPlusPlus
    ? 'text-xl font-bold text-[#03045E]'
    : isAPlus
      ? 'text-lg font-bold text-[#03045E]'
      : 'text-sm sm:text-base font-bold text-[#03045E]';

  const titleSize = isAPlusPlus
    ? 'text-4xl sm:text-5xl md:text-6xl font-bold text-[#03045E]'
    : isAPlus
      ? 'text-3xl sm:text-4xl md:text-5xl font-bold text-[#03045E]'
      : 'text-xl sm:text-3xl md:text-4xl font-bold text-[#03045E]';

  const subtitleSize = isAPlusPlus
    ? 'text-lg sm:text-xl font-semibold text-[#03045E]/90'
    : isAPlus
      ? 'text-base sm:text-lg font-semibold text-[#03045E]/90'
      : 'text-xs sm:text-base font-semibold text-[#03045E]/90';

  const footerLinkSize = isAPlusPlus
    ? 'text-lg font-bold'
    : isAPlus
      ? 'text-base font-bold'
      : 'text-xs sm:text-sm font-bold';

  const containerPadding = isAssist 
    ? 'pt-10 px-8 pb-12 sm:pt-12 sm:px-10 sm:pb-16 lg:pt-14 lg:px-12 lg:pb-18' 
    : 'p-5 sm:pt-10 sm:px-10 sm:pb-14 lg:pt-12 lg:px-12 lg:pb-16';
  const containerGap = isAssist ? 'gap-6 sm:gap-8' : 'gap-4 sm:gap-6';
  const formGap = isAssist ? 'gap-5 sm:gap-6' : 'gap-3 sm:gap-5';

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

        setTimeout(() => {
          if (data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (data.user.role === 'employer') {
            navigate('/employer-dashboard');
          } else {
            navigate('/applicant-dashboard');
          }
        }, 3000);
      } else {
        setErrorMessage(data.error || 'Login failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login request error:", error);
      setErrorMessage("Cannot connect to the server. Is the backend running?");
      setIsLoading(false);
    }
  };

  return (
    <main
      role="main"
      aria-label="Login Screen"
      className={`min-h-screen flex flex-col ${isContrast ? 'bg-black text-white' : 'bg-[#f4f4f4] text-[#03045E]'} overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
    >
      {isLoading && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Logging In"
          aria-labelledby="logging-title"
          aria-describedby="logging-desc"
          aria-live="assertive"
          tabIndex="-1"
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative w-full max-w-md rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${(isContrast || isDarkMode || isAccessibilityMode) ? 'bg-black border-2 border-white' : 'bg-white border-2 border-[#2C7FFF]'}`}>
            <div aria-hidden="true" className="h-2 w-full bg-[#2C7FFF]" />

            <div className="relative px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
              <div aria-hidden="true" className="relative mb-4 sm:mb-5">
                <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${(isContrast || isDarkMode || isAccessibilityMode) ? 'bg-transparent border-4 border-white' : 'bg-transparent border-4 border-[#2C7FFF]'}`}>
                  <svg className={`w-8 h-8 sm:w-12 sm:h-12 animate-spin ${(isContrast || isDarkMode || isAccessibilityMode) ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                </div>
                <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${(isContrast || isDarkMode || isAccessibilityMode) ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>✓</div>
              </div>

              <span aria-hidden="true" className={`inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-4 border-2 ${(isContrast || isDarkMode || isAccessibilityMode) ? 'text-white bg-transparent border-white' : 'text-[#2C7FFF] bg-transparent border-[#2C7FFF]'}`}>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#10B981]"></span>
                Notice
              </span>

              <h2 id="logging-title" className={`text-xl sm:text-3xl font-black tracking-tight mb-1.5 sm:mb-2 ${(isContrast || isDarkMode || isAccessibilityMode) ? 'text-white' : 'text-[#03045E]'}`}>
                Logging In...
              </h2>
              <p id="logging-desc" className={`text-xs sm:text-sm font-bold leading-relaxed mb-6 sm:mb-8 max-w-xs ${(isContrast || isDarkMode || isAccessibilityMode) ? 'text-white/80' : 'text-[#03045E]/80'}`}>
                Please wait while we set up your session and redirect you.
              </p>

              <div aria-hidden="true" className="flex items-center gap-1 sm:gap-1.5">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      )}
   
      <header
        className={`w-full ${isContrast ? 'bg-black border-b-1 border-[#2C7FFF]' : 'bg-[#f4f4f4] border-b border-[#03045E]/10'} fixed top-0 left-0 z-50`}
      >
        <div className="w-full h-14 sm:h-16 pl-3 pr-3 sm:pl-4 sm:pr-4 md:pr-8 flex items-center justify-between max-w-[1700px] mx-auto box-border">
          <div className="flex items-center gap-8">
            <div className="flex items-center flex-shrink-0 py-1">
              <img
                src={(isAccessibilityMode || isDarkMode) ? darkLogo : lightLogo}
                alt="AbleWork logo"
                role="img"
                aria-label="AbleWork logo"
                tabIndex="0"
                className="h-9 sm:h-12 md:h-14 w-auto object-contain max-h-full"
              />
            </div>
            <nav className="hidden md:flex items-center gap-6 text-[15px] font-medium text-[#03045E]">
              <Link to="/" aria-label="Home" className="text-[#03045E] hover:text-[#03045E] transition pb-0.5">Home</Link>
              <Link to="/about" aria-label="About Us" className="text-[#03045E] hover:text-[#03045E] transition">About Us</Link>
              <Link to="/policy" aria-label="Policy" className="text-[#03045E] hover:text-[#03045E] transition">Policy</Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center">
            <span
              aria-label="Log In"
              className={`px-5 py-2 rounded-full ${isAccessibilityMode ? 'bg-white text-black border border-white' : (isContrast || isDarkMode) ? 'bg-blue-400 text-black border border-blue-400' : 'bg-[#2C7FFF] text-white border border-[#2C7FFF]'} text-sm font-medium cursor-default`}
            >
              Log In
            </span>
          </div>

          <button
            aria-label="Menu"
            aria-expanded={isOpen}
            className={`md:hidden flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-2 shadow-sm cursor-pointer transition-all duration-200 shrink-0 ${isContrast ? 'bg-zinc-900 text-white border-white/30' : 'bg-white text-[#03045E] border-[#03045E]/20'}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <svg aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? `${isContrast ? 'bg-black border-b-2 border-[#2C7FFF]' : 'bg-white border-b-2 border-[#03045E]/20'} max-h-96 opacity-100 shadow-lg` : 'max-h-0 opacity-0'
          }`}
        >
          <div className={`w-full ${isContrast ? 'bg-black' : 'bg-white'}`}>
                      <nav
              className={`flex flex-col px-2.5 pt-2.5 pb-2.5 gap-2 sm:px-3 sm:pt-3 sm:pb-3 sm:gap-2.5 ${isContrast ? 'text-white' : 'text-[#03045E]'} max-w-[1700px] mx-auto`}
            >
              <Link
                to="/"
                aria-label="Home"
                onClick={() => setIsOpen(false)}
                className={`relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-2xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${
                  isContrast
                    ? 'bg-white text-[#03045E] border-[#03045E]/25'
                    : 'bg-white text-[#03045E] border-[#03045E]/25'
                }`}
              >
                <div aria-hidden="true" className="p-1.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span aria-hidden="true" className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">Home</span>
                </div>
                <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                to="/about"
                aria-label="About Us"
                onClick={() => setIsOpen(false)}
                className={`relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-2xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${
                  isContrast
                    ? 'bg-white text-[#03045E] border-[#03045E]/25'
                    : 'bg-white text-[#03045E] border-[#03045E]/25'
                }`}
              >
                <div aria-hidden="true" className="p-1.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span aria-hidden="true" className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">About Us</span>
                </div>
                <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                to="/policy"
                aria-label="Policy"
                onClick={() => setIsOpen(false)}
                className={`relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-2xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${
                  isContrast
                    ? 'bg-white text-[#03045E] border-[#03045E]/25'
                    : 'bg-white text-[#03045E] border-[#03045E]/25'
                }`}
              >
                <div aria-hidden="true" className="p-1.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span aria-hidden="true" className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">Policy</span>
                </div>
                <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <div aria-hidden="true" className={`h-px my-0.5 ${isContrast ? 'bg-[#2C7FFF]/30' : 'bg-[#03045E]/15'}`}></div>

              <span
                aria-label="Log In"
                className="relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-2xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden bg-white text-[#03045E] border-[#03045E] shadow-md"
              >
                <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>
                <div aria-hidden="true" className="p-1.5 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span aria-hidden="true" className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">Log In</span>
                </div>
                <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </nav>
          </div>
        </div>
      </header>

      <div
        className={`flex-grow pt-16 pb-12 flex flex-col items-center md:items-end justify-center px-3 sm:pl-4 sm:pr-4 md:pr-12 lg:pr-16 md:pl-8 max-w-[1700px] mx-auto w-full box-border relative bg-no-repeat bg-center bg-[size:600px_auto] md:bg-[size:1100px_auto] md:bg-left min-h-[110vh] md:min-h-[105vh] transition-all duration-300`}
        style={{
          backgroundImage: `url(${backgroundImg})`,
        }}
      >
      
        <div
          className={`w-full ${isAssist ? 'max-w-[480px] sm:max-w-xl' : 'max-w-[400px] sm:max-w-md'} flex flex-col items-center justify-start ${containerGap} relative z-10
            ${isContrast ? 'bg-black/90 text-white border-2 border-blue-400 shadow-[0_0_25px_rgba(,204,21,0.4)]' : 'bg-white/40 sm:bg-white/85 text-[#03045E] border border-[#03045E]/15'} backdrop-blur-[1px] sm:backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl
            ${containerPadding}
            ${isAssist ? 'min-h-[auto] sm:min-h-[660px]' : 'min-h-[auto] sm:min-h-[600px]'} md:mt-4 mr-0 md:mr-2 lg:mr-6`}
        >
          
          <div className="text-center w-full -mt-2 sm:-mt-3">
            <h1
              className={`${titleSize} ${isAccessibilityMode ? '!text-white' : (isContrast ? '!text-white' : '')} tracking-tight mb-1.5 sm:mb-2`}
            >
              Login to AbleWork
            </h1>
            <p className={`${subtitleSize} ${isAccessibilityMode ? '!text-white/90' : (isContrast ? '!text-white/90' : '')}`}>
              Welcome back! Please enter your details
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className={`w-full p-3 sm:p-3.5 text-xs sm:text-sm font-bold text-center ${isContrast ? 'text-blue-300 bg-zinc-900 border border-blue-400' : 'text-red-600 bg-white border-2 border-red-500'} rounded-xl shadow-inner`}
            >
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className={`flex flex-col ${formGap} w-full`}
            autoComplete="off"
          >
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label
                id="email-label"
                className={`${labelSize} ${isAccessibilityMode ? '!text-white' : (isContrast ? '!text-white' : '')}`}
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
                aria-label="Enter your email"
                className={`${inputSize} ${isContrast ? 'border-2 border-blue-400 bg-black text-white focus:border-blue-300' : 'border-2 border-[#03045E]/30 bg-white text-[#03045E] focus:border-[#2C7FFF]'} rounded-xl sm:rounded-2xl focus:outline-none shadow-sm transition`}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label
                id="password-label"
                className={`${labelSize} ${isAccessibilityMode ? '!text-white' : (isContrast ? '!text-white' : '')}`}
                htmlFor="password"
              >
                Password
              </label>
             <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readOnly')}
                  aria-label="Enter your password"
                  className={`${inputSize} w-full pr-10 sm:pr-12 ${isContrast ? 'border-2 border-blue-400 bg-black text-white focus:border-blue-300' : 'border-2 border-[#03045E]/30 bg-white text-[#03045E] focus:border-[#2C7FFF]'} rounded-xl sm:rounded-2xl focus:outline-none shadow-sm transition`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  aria-label="Show password"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 transition cursor-pointer ${isAccessibilityMode ? '!text-white hover:!text-white' : (isContrast ? 'text-white/60 hover:text-white' : 'text-[#03045E]/50 hover:text-[#2C7FFF]')}`}
                >
                  {showPassword ? (
                    <svg aria-hidden="true" className={`w-4 h-4 sm:w-5 sm:h-5 ${isAccessibilityMode ? '!text-white !stroke-white' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  ) : (
                    <svg aria-hidden="true" className={`w-4 h-4 sm:w-5 sm:h-5 ${isAccessibilityMode ? '!text-white !stroke-white' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  )}
                </button>
              </div>  
            </div>

            <div className="flex justify-end mt-1 mb-1.5 sm:mb-2">
              <Link 
                to="/forgot-password" 
                aria-label="Forgot Password"
                className={`text-xs sm:text-sm font-bold transition-all hover:underline ${
                  isAccessibilityMode 
                    ? '!text-white hover:!text-white' 
                    : isContrast 
                      ? 'text-[#2C7FFF] hover:text-white' 
                      : 'text-[#2C7FFF] hover:text-[#03045E]'
                }`}
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              aria-label={isLoading ? "Logging In" : "Log In"}
              className={`mt-1.5 sm:mt-2 ${tapTargetSize} ${isDarkMode ? '!bg-black !text-white border border-white font-black' : isAccessibilityMode ? '!bg-blue-400 !text-white border border-blue-400 font-black' : isContrast ? 'bg-blue-400 text-black hover:bg-blue-300 border border-blue-400 font-black hover:brightness-125' : 'bg-[#03045E] hover:bg-[#2C7FFF] text-white hover:brightness-125'} disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-md w-full transition-all duration-200 cursor-pointer`}
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          <p className={`text-center ${isAccessibilityMode ? '!text-white/90' : (isContrast ? 'text-white/90' : 'text-[#03045E]/90')} ${footerLinkSize} pt-1`}>
            Don't have an account?{' '}
            <Link
              to="/register-select"
              aria-label="Create one"
              className={`font-bold ${isAccessibilityMode ? '!text-white hover:!text-white underline' : (isContrast ? 'text-blue-400 hover:text-blue-300 underline' : 'text-[#2C7FFF] hover:underline')}`}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      <footer
        className="py-6 sm:py-12 px-4 sm:px-6 mt-auto bg-[#03045E] text-white border-t-2 border-[#2C7FFF]/40 shadow-inner"
      >
        <div className="max-w-[1700px] mx-auto grid grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8 pb-6 sm:pb-10 border-b border-white/15">
          
          <div className="col-span-3 md:col-span-1 space-y-2 sm:space-y-3">
            <img
              src={useLightLogo ? lightLogo : darkLogo}
              alt="AbleWork logo"
              role="img"
              aria-label="AbleWork logo"
              tabIndex="0"
              className="h-7 sm:h-10 w-auto object-contain"
            />
            <p className="text-[10px] sm:text-sm font-semibold leading-relaxed text-white/85">
              Building an inclusive workforce and equal employment opportunities for everyone.
            </p>
            <div className="pt-1 flex items-center space-x-3 text-[9px] sm:text-xs font-bold uppercase tracking-wider text-white/70">
              <span> Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div>
            <h4 className="text-xs sm:text-base font-black mb-2 sm:mb-4 text-white">Quick Links</h4>
            <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-sm font-semibold">
              <li>
                <Link to="/" aria-label="Home Dashboard" className="text-white/85 hover:text-[#7FB0FF] transition-colors">
                  Home Dashboard
                </Link>
              </li>
              <li>
                <Link to="/about" aria-label="About Our Mission" className="text-white/85 hover:text-[#7FB0FF] transition-colors">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link to="/contact" aria-label="Contact Support" className="text-white/85 hover:text-[#7FB0FF] transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs sm:text-base font-black mb-2 sm:mb-4 text-white">Legal &amp; Support</h4>
            <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-sm font-semibold">
              <li>
                <Link to="/policy" aria-label="Privacy Policy" className="text-white/85 hover:text-[#7FB0FF] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" aria-label="Terms of Service" className="text-white/85 hover:text-[#7FB0FF] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs sm:text-base font-black mb-2 sm:mb-4 text-white">Get Started</h4>
            <p className="text-[10px] sm:text-sm font-semibold mb-2 sm:mb-4 text-white/85">
              Are you an applicant or employer looking to join our network?
            </p>
            <Link
              to="/register-select"
              aria-label="Register Now"
              className="inline-block bg-[#2C7FFF] text-[#03045E] px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl font-bold text-[9px] sm:text-xs uppercase tracking-wider shadow-md hover:bg-white hover:text-[#03045E] transition-all border-2 border-[#2C7FFF] hover:border-white"
            >
              Register Now
            </Link>
          </div>

        </div>

        <div className="max-w-[1700px] mx-auto pt-3 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-[9px] sm:text-xs font-bold text-white/75">
          <p>© {new Date().getFullYear()} AgileWork Inc. All rights reserved.</p>
          <p className="font-bold">Empowering Abilities, Connecting Opportunities.</p>
        </div>

      </footer>
    </main>
  );
}