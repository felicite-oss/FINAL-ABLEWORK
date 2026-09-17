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
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isAPlusPlus = mode === 'A++' || mode === 'Assist' || mode === 'a++' || mode === 'assist';
  const isAPlus = mode === 'A+' || mode === 'a+';
  const isAssist = isAPlusPlus; 

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
   
      <header
        className={`w-full ${isContrast ? 'bg-black border-b-1 border-[#2C7FFF]' : 'bg-[#f4f4f4] border-b border-[#03045E]/10'} fixed top-0 left-0 z-50`}
        role="banner"
        aria-label="Site header"
      >
        <div className="w-full h-16 pl-4 pr-4 md:pr-8 flex items-center justify-between max-w-[1700px] mx-auto box-border">
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

          <div className="hidden md:flex items-center">
            <span
              className={`px-5 py-2 rounded-full ${isContrast ? 'bg-blue-400 text-black border border-blue-400' : 'bg-[#2C7FFF] text-white border border-[#2C7FFF]'} text-sm font-medium cursor-default`}
              aria-current="page"
              aria-label="Log In - current page"
            >
              Log In
            </span>
          </div>

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

      <div
        className={`flex-grow pt-16 pb-12 flex flex-col items-center md:items-end justify-center pl-4 pr-4 md:pr-12 lg:pr-16 md:pl-8 max-w-[1700px] mx-auto w-full box-border relative bg-no-repeat bg-cover bg-center md:bg-[size:1100px_auto] md:bg-left min-h-[110vh] md:min-h-[105vh] transition-all duration-300 ${isOpen ? 'mt-48 sm:mt-56' : 'mt-0'}`}
        style={{
          backgroundImage: `url(${backgroundImg})`,
        }}
        role="region"
        aria-label="Login form area"
      >
      
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
              Login to AbleWork
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
                  className={`${inputSize} w-full pr-12 ${isContrast ? 'border-2 border-blue-400 bg-black text-white focus:border-blue-300' : 'border-2 border-[#03045E]/30 bg-white text-[#03045E] focus:border-[#2C7FFF]'} rounded-2xl focus:outline-none shadow-sm transition`}
                  placeholder="Enter your password"
                  aria-required="true"
                  aria-invalid={!!errorMessage}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition cursor-pointer ${isContrast ? 'text-white/60 hover:text-white' : 'text-[#03045E]/50 hover:text-[#2C7FFF]'}`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  )}
                </button>
              </div>  
            </div>

            <div className="flex justify-end mt-1 mb-2">
              <Link 
                to="/forgot-password" 
                className={`text-sm font-bold transition-all hover:underline ${
                  isContrast 
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
              className={`mt-2 ${tapTargetSize} ${isContrast ? 'bg-blue-400 text-black hover:bg-blue-300 border border-blue-400 font-black hover:brightness-125' : 'bg-[#03045E] hover:bg-[#2C7FFF] text-white hover:brightness-125'} disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-md w-full transition-all duration-200 cursor-pointer`}
              aria-label={isLoading ? 'Logging in, please wait' : 'Log in to AbleWork'}
              aria-busy={isLoading}
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

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

      <footer
        className={`py-12 px-6 mt-auto border-t-2 shadow-inner ${isContrast ? 'bg-black text-white border-white/20' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20'}`}
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className={`max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b ${isContrast ? 'border-white/10' : 'border-[#03045E]/10'}`}>
          
          <div className="md:col-span-1 space-y-3">
            <img
              src={isContrast ? darkLogo : lightLogo}
              alt="AbleWork Logo"
              className="h-10 w-auto object-contain"
            />
            <p className={`text-sm font-semibold leading-relaxed ${isContrast ? 'text-white/80' : 'text-[#03045E]'}`}>
              Building an inclusive workforce and equal employment opportunities for everyone.
            </p>
            <div className={`pt-2 flex items-center space-x-3 text-xs font-bold uppercase tracking-wider ${isContrast ? 'text-white/70' : 'text-[#03045E]'}`}>
              <span> Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div>
            <h4 className={`font-black text-base mb-4 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Quick Links</h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li>
                <Link to="/" className={`transition-colors ${isContrast ? 'text-white/80 hover:text-[#2C7FFF]' : 'text-[#03045E] hover:text-[#2C7FFF]'}`}>
                  Home Dashboard
                </Link>
              </li>
              <li>
                <Link to="/about" className={`transition-colors ${isContrast ? 'text-white/80 hover:text-[#2C7FFF]' : 'text-[#03045E] hover:text-[#2C7FFF]'}`}>
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`transition-colors ${isContrast ? 'text-white/80 hover:text-[#2C7FFF]' : 'text-[#03045E] hover:text-[#2C7FFF]'}`}>
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={`font-black text-base mb-4 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Legal & Support</h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li>
                <Link to="/policy" className={`transition-colors ${isContrast ? 'text-white/80 hover:text-[#2C7FFF]' : 'text-[#03045E] hover:text-[#2C7FFF]'}`}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className={`transition-colors ${isContrast ? 'text-white/80 hover:text-[#2C7FFF]' : 'text-[#03045E] hover:text-[#2C7FFF]'}`}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={`font-black text-base mb-4 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Get Started</h4>
            <p className={`text-sm font-semibold mb-4 ${isContrast ? 'text-white/80' : 'text-[#03045E]'}`}>
              Are you an applicant or employer looking to join our network?
            </p>
            <Link
              to="/register-select"
              className="inline-block bg-[#2C7FFF] text-[#f4f4f4] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#03045E] transition-all border-2 border-[#2C7FFF] hover:border-[#03045E]"
            >
              Register Now
            </Link>
          </div>

        </div>

        <div className={`max-w-[1700px] mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold ${isContrast ? 'text-white/70' : 'text-[#03045E]'}`}>
          <p>© {new Date().getFullYear()} AgileWork Inc. All rights reserved.</p>
          <p className="font-bold">Empowering Abilities, Connecting Opportunities.</p>
        </div>

      </footer>
    </main>
  );
}