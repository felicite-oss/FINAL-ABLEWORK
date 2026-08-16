import { useState, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';
import headerLogo from '../assets/Final.png';
import backgroundImg from '../assets/Final background.png';

export default function RegisterSelect() {
  const [isOpen, setIsOpen] = useState(false);
  const { mode } = useContext(AccessibilityContext);

  // Support A / A+ / A++ (same logic as Login)
  const isAPlusPlus = mode === 'A++' || mode === 'Assist' || mode === 'a++' || mode === 'assist';
  const isAPlus = mode === 'A+' || mode === 'a+';
  const isAssist = isAPlusPlus;

  // Title / subtitle sizes (same as Login)
  const titleSize = isAPlusPlus
    ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
    : isAPlus
      ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
      : 'text-lg sm:text-xl md:text-2xl lg:text-3xl';

  const subtitleSize = isAPlusPlus
    ? 'text-base sm:text-lg md:text-xl'
    : isAPlus
      ? 'text-sm sm:text-base md:text-lg'
      : 'text-xs sm:text-sm md:text-base';

  // Card title & description sizes
  const cardTitleSize = isAPlusPlus
    ? 'text-xl sm:text-2xl md:text-3xl'
    : isAPlus
      ? 'text-lg sm:text-xl md:text-2xl'
      : 'text-base sm:text-lg md:text-xl';

  const cardDescSize = isAPlusPlus
    ? 'text-sm sm:text-base'
    : isAPlus
      ? 'text-xs sm:text-sm'
      : 'text-xs';

  // Container sizing - better mobile + A++ adjustment
  const containerPadding = isAssist
    ? 'pt-6 px-3 pb-8 sm:pt-8 sm:px-5 sm:pb-12 md:pt-10 md:px-8 md:pb-14 lg:pt-12 lg:px-10 lg:pb-16'
    : 'pt-5 px-3 pb-7 sm:pt-7 sm:px-5 sm:pb-10 md:pt-9 md:px-7 md:pb-12 lg:pt-12 lg:px-10 lg:pb-16';

  const containerGap = isAssist ? 'gap-4 sm:gap-6' : 'gap-3 sm:gap-5';
  
  const containerMaxWidth = isAssist
    ? 'max-w-[94%] sm:max-w-lg md:max-w-2xl lg:max-w-3xl'
    : 'max-w-[94%] sm:max-w-md md:max-w-xl lg:max-w-2xl';

  const containerMinHeight = isAssist
    ? 'min-h-[auto] sm:min-h-[480px] md:min-h-[540px]'
    : 'min-h-[auto] sm:min-h-[420px] md:min-h-[480px]';

  return (
    <main className="flex flex-col bg-[#f4f4f4] overflow-x-hidden md:overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* ===== HEADER (Fixed to Top) ===== */}
      <header className="w-full bg-[#f4f4f4] border-b border-[#03045E]/10 fixed top-0 left-0 z-50">
        <div className="w-full h-16 pl-4 pr-4 md:pr-8 flex items-center justify-between">

          {/* Left side: Logo + Desktop Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo - no link, so it won't navigate */}
            <div className="flex items-center flex-shrink-0">
              <img
                src={headerLogo}
                alt="AbleWork Logo"
                className="h-20 w-auto object-contain max-h-full"
              />
            </div>
            <nav className="hidden md:flex items-center gap-6 text-[15px] font-medium text-[#03045E]">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `transition-colors duration-200 hover:text-[#2C7FFF] hover:scale-105 transform ${isActive ? 'text-[#2C7FFF] font-semibold border-b-2 border-[#2C7FFF] pb-0.5' : ''}`
                }
              >
                Home
              </NavLink>
              <NavLink 
                to="/about" 
                className={({ isActive }) => 
                  `transition-colors duration-200 hover:text-[#2C7FFF] hover:scale-105 transform ${isActive ? 'text-[#2C7FFF] font-semibold border-b-2 border-[#2C7FFF] pb-0.5' : ''}`
                }
              >
                About Us
              </NavLink>
              <NavLink 
                to="/policy" 
                className={({ isActive }) => 
                  `transition-colors duration-200 hover:text-[#2C7FFF] hover:scale-105 transform ${isActive ? 'text-[#2C7FFF] font-semibold border-b-2 border-[#2C7FFF] pb-0.5' : ''}`
                }
              >
                Policy
              </NavLink>
            </nav>
          </div>

          {/* Desktop Log In */}
          <div className="hidden md:flex items-center">
            <NavLink
              to="/"
              className={({ isActive }) => 
                `px-5 py-2 rounded-full text-sm font-medium border transition duration-200 transform hover:scale-105 ${
                  isActive 
                    ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] underline font-semibold' 
                    : 'bg-white text-[#03045E] border-[#03045E] hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                }`
              }
            >
              Log In
            </NavLink>
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

        {/* Mobile Menu - smooth slide */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 opacity-100 border-b border-[#03045E]/10 shadow-lg' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="w-full bg-[#f4f4f4]">
            <nav className="flex flex-col px-6 py-5 gap-5 text-[16px] font-medium text-[#03045E]">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `transition-colors duration-200 hover:text-[#2C7FFF] hover:scale-105 transform ${isActive ? 'text-[#2C7FFF] font-semibold pl-2 border-l-4 border-[#2C7FFF]' : ''}`
                } 
                onClick={() => setIsOpen(false)}
              >
                Home
              </NavLink>
              <NavLink 
                to="/about" 
                className={({ isActive }) => 
                  `transition-colors duration-200 hover:text-[#2C7FFF] hover:scale-105 transform ${isActive ? 'text-[#2C7FFF] font-semibold pl-2 border-l-4 border-[#2C7FFF]' : ''}`
                } 
                onClick={() => setIsOpen(false)}
              >
                About Us
              </NavLink>
              <NavLink 
                to="/policy" 
                className={({ isActive }) => 
                  `transition-colors duration-200 hover:text-[#2C7FFF] hover:scale-105 transform ${isActive ? 'text-[#2C7FFF] font-semibold pl-2 border-l-4 border-[#2C7FFF]' : ''}`
                } 
                onClick={() => setIsOpen(false)}
              >
                Policy
              </NavLink>
              <NavLink
                to="/"
                className={({ isActive }) => 
                  `mt-2 px-5 py-2.5 rounded-full text-sm font-medium border transition duration-200 transform hover:scale-105 w-fit ${
                    isActive 
                      ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] underline font-semibold' 
                      : 'bg-white text-[#03045E] border-[#03045E] hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                Log In
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* ===== YOUR ORIGINAL CONTENT ===== */}
      <div 
        className={`min-h-[100dvh] pt-24 sm:pt-20 md:pt-16 flex flex-col items-center md:items-end justify-start md:justify-center p-3 sm:p-5 md:p-8 relative bg-no-repeat bg-cover bg-center md:bg-[size:1100px_auto] md:bg-left transition-all duration-300 ${isOpen ? 'mt-48 sm:mt-56' : 'mt-0'}`}
        style={{
          backgroundImage: `url(${backgroundImg})`,
        }}
      >
        
        {/* ===== ONE OUTER CONTAINER (styled for mobile and web) ===== */}
        <div className={`w-full ${containerMaxWidth} flex flex-col items-center justify-center ${containerGap} relative z-10
                    bg-white/60 rounded-3xl shadow-xl border border-[#03045E]/10 
                    ${containerPadding}
                    ${containerMinHeight} mb-10 md:mb-0 md:mt-8`}>
          
          <div className="text-center w-full max-w-lg px-1">
            <h1 className={`${titleSize} font-extrabold tracking-tighter text-[#03045E] mb-2 sm:mb-3`}>
              Join AbleWork
            </h1>
            <p className={`${subtitleSize} text-[#03045E]/80 leading-relaxed`}>
              Please choose how you would like to use our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
    
            {/* Applicant Card */}
            <Link
              to="/register/applicant"
              className="p-3.5 sm:p-5 md:p-6 bg-[#f4f4f4] rounded-2xl shadow-lg md:shadow-xl border border-[#03045E]/20 hover:border-[#2C7FFF] hover:shadow-2xl flex flex-col items-center text-center transition-all cursor-pointer group"
            >
              <div className="mb-2.5 sm:mb-3.5 text-[#03045E] group-hover:text-[#2C7FFF] transition-colors">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>

              <h2 className={`${cardTitleSize} font-bold text-[#03045E] mb-1 sm:mb-2 group-hover:text-[#2C7FFF]`}>
                I am a Job Seeker
              </h2>

              <p className={`${cardDescSize} text-[#03045E]/70`}>
                Looking for accessible jobs and career opportunities.
              </p>
            </Link>

            {/* Employer Card */}
            <Link
              to="/register/employer"
              className="p-3.5 sm:p-5 md:p-6 bg-[#f4f4f4] rounded-2xl shadow-lg sm:shadow-xl border border-[#03045E]/20 hover:border-[#2C7FFF] hover:shadow-2xl flex flex-col items-center text-center transition-all cursor-pointer group"
            >
              <div className="mb-2.5 sm:mb-3.5 text-[#03045E] group-hover:text-[#2C7FFF] transition-colors">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125 1.125 1.125 1.125V21" />
                </svg>
              </div>

              <h2 className={`${cardTitleSize} font-bold text-[#03045E] mb-1 sm:mb-2 group-hover:text-[#2C7FFF]`}>
                I am an Employer
              </h2>

              <p className={`${cardDescSize} text-[#03045E]/70`}>
                Looking to hire inclusive talent and post job listings.
              </p>
            </Link>
          </div>
        </div>
        {/* ===== END ONE OUTER CONTAINER ===== */}

      </div>

      {/* ===== FOOTER ===== */}
      <footer className="w-full bg-[#03045E] text-[#f4f4f4] py-8 px-4 md:px-8 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left: Branding / Copyright */}
          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <span className="font-bold text-lg text-white">AbleWork</span>
            <p className="text-xs text-[#f4f4f4]/70">
              © {new Date().getFullYear()} AbleWork. All rights reserved.
            </p>
          </div>

          {/* Center: Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#f4f4f4]/90 font-medium">
            <Link to="/" className="hover:text-[#2C7FFF] transition">Home</Link>
            <Link to="/about" className="hover:text-[#2C7FFF] transition">About Us</Link>
            <Link to="/policy" className="hover:text-[#2C7FFF] transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#2C7FFF] transition">Terms of Service</Link>
            <Link to="/contact" className="hover:text-[#2C7FFF] transition">Contact Us</Link>
          </div>

          {/* Right: Tagline */}
          <div className="text-xs text-[#f4f4f4]/60 text-center md:text-right">
            Building an inclusive workforce for everyone.
          </div>
        </div>
      </footer>
    </main>
  );
}