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
    ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'
    : isAPlus
      ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
      : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl';

  const subtitleSize = isAPlusPlus
    ? 'text-lg sm:text-xl md:text-2xl'
    : isAPlus
      ? 'text-base sm:text-lg md:text-xl'
      : 'text-sm sm:text-base md:text-lg';

  // Card title & description sizes
  const cardTitleSize = isAPlusPlus
    ? 'text-2xl sm:text-3xl md:text-4xl'
    : isAPlus
      ? 'text-xl sm:text-2xl md:text-3xl'
      : 'text-lg sm:text-xl md:text-2xl';

  const cardDescSize = isAPlusPlus
    ? 'text-base sm:text-lg md:text-xl'
    : isAPlus
      ? 'text-sm sm:text-base md:text-lg'
      : 'text-xs sm:text-sm md:text-base';

  // Container sizing - better mobile + A++ adjustment
  const containerPadding = isAssist
    ? 'pt-8 px-5 pb-10 sm:pt-10 sm:px-8 sm:pb-14 md:pt-12 md:px-12 md:pb-16 lg:pt-16 lg:px-14 lg:pb-20'
    : 'pt-6 px-4 pb-8 sm:pt-8 sm:px-6 sm:pb-12 md:pt-10 md:px-10 md:pb-14 lg:pt-14 lg:px-12 lg:pb-18';

  const containerGap = isAssist ? 'gap-6 sm:gap-8' : 'gap-4 sm:gap-6';
  
  const containerMaxWidth = isAssist
    ? 'max-w-[96%] sm:max-w-xl md:max-w-3xl lg:max-w-4xl'
    : 'max-w-[96%] sm:max-w-lg md:max-w-2xl lg:max-w-3xl';

  const containerMinHeight = isAssist
    ? 'min-h-[auto] sm:min-h-[540px] md:min-h-[620px]'
    : 'min-h-[auto] sm:min-h-[480px] md:min-h-[560px]';

  return (
    <main className="flex flex-col bg-[#f4f4f4] overflow-x-hidden md:overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* ===== HEADER (Fixed to Top) ===== */}
      <header className="w-full bg-[#f4f4f4] border-b border-[#03045E]/10 fixed top-0 left-0 z-50">
        <div className="w-full h-16 pl-4 pr-4 md:pr-8 flex items-center justify-between">

          {/* Left side: Logo + Desktop Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo - Vertically centered with flex items-center */}
            <div className="flex items-center flex-shrink-0 py-1">
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
              to="/login"
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
                to="/login"
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
          
          <div className="text-center w-full max-w-xl px-1">
            <h1 className={`${titleSize} font-extrabold tracking-tighter text-[#03045E] mb-3 sm:mb-4`}>
              Join AbleWork
            </h1>
            <p className={`${subtitleSize} text-[#03045E]/80 leading-relaxed`}>
              Please choose how you would like to use our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
    
            {/* Applicant Card */}
            <Link
              to="/register/applicant"
              className="p-5 sm:p-7 md:p-8 bg-[#f4f4f4] rounded-2xl shadow-lg md:shadow-xl border border-[#03045E]/20 hover:border-[#2C7FFF] hover:shadow-2xl flex flex-col items-center text-center transition-all cursor-pointer group"
            >
              <div className="mb-3.5 sm:mb-5 text-[#03045E] group-hover:text-[#2C7FFF] transition-colors">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>

              <h2 className={`${cardTitleSize} font-bold text-[#03045E] mb-2 sm:mb-3 group-hover:text-[#2C7FFF]`}>
                I am a Job Seeker
              </h2>

              <p className={`${cardDescSize} text-[#03045E]/70`}>
                Looking for accessible jobs and career opportunities.
              </p>
            </Link>

            {/* Employer Card */}
            <Link
              to="/register/employer"
              className="p-5 sm:p-7 md:p-8 bg-[#f4f4f4] rounded-2xl shadow-lg sm:shadow-xl border border-[#03045E]/20 hover:border-[#2C7FFF] hover:shadow-2xl flex flex-col items-center text-center transition-all cursor-pointer group"
            >
              <div className="mb-3.5 sm:mb-5 text-[#03045E] group-hover:text-[#2C7FFF] transition-colors">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125 1.125 1.125 1.125V21" />
                </svg>
              </div>

              <h2 className={`${cardTitleSize} font-bold text-[#03045E] mb-2 sm:mb-3 group-hover:text-[#2C7FFF]`}>
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

      {/* ===== UNIQUE FOOTER (left brand / right nav — compact) ===== */}
      <footer
        className="w-full relative z-20 overflow-hidden"
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