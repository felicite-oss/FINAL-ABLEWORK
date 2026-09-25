import { useState, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';
import lightLogo from '../assets/LIGHT MODE.png';
import darkLogo from '../assets/DARK MODE.png';
import backgroundImg from '../assets/BG.png';

export default function RegisterSelect() {
  const [isOpen, setIsOpen] = useState(false);
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && mode.toLowerCase().includes('dark');
  const isAPlusPlus = mode === 'A++' || mode === 'Assist' || mode === 'a++' || mode === 'assist';
  const isAPlus = mode === 'A+' || mode === 'a+';
  const isAssist = isAPlusPlus;

  const titleSize = isAPlusPlus
    ? 'text-4xl sm:text-5xl md:text-6xl lg:text-5xl'
    : isAPlus
      ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'
      : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl';

  const subtitleSize = isAPlusPlus
    ? 'text-xl sm:text-2xl md:text-3xl'
    : isAPlus
      ? 'text-lg sm:text-xl md:text-2xl'
      : 'text-sm sm:text-base md:text-lg';

  const cardTitleSize = isAPlusPlus
    ? 'text-3xl sm:text-4xl md:text-5xl'
    : isAPlus
      ? 'text-2xl sm:text-3xl md:text-4xl'
      : 'text-lg sm:text-xl md:text-2xl';

  const cardDescSize = isAPlusPlus
    ? 'text-lg sm:text-xl md:text-2xl'
    : isAPlus
      ? 'text-base sm:text-lg md:text-xl'
      : 'text-xs sm:text-sm md:text-base';

  const containerPadding = isAssist
    ? 'pt-5 px-4 pb-3 sm:pt-6 sm:px-6 sm:pb-4 md:pt-8 md:px-10 md:pb-5 lg:pt-10 lg:px-12 lg:pb-6'
    : 'pt-5 px-4 pb-3 sm:pt-6 sm:px-6 sm:pb-4 md:pt-8 md:px-8 md:pb-6 lg:pt-10 lg:px-10 lg:pb-8';

  const containerGap = isAssist ? 'gap-5 sm:gap-6' : 'gap-4 sm:gap-5';
  
  const containerMaxWidth = isAssist
    ? 'max-w-[94%] sm:max-w-lg md:max-w-2xl lg:max-w-3xl'
    : 'max-w-[94%] sm:max-w-md md:max-w-xl lg:max-w-2xl';

  const containerMinHeight = isAssist
    ? 'min-h-[auto] sm:min-h-[440px] md:min-h-[500px]'
    : 'min-h-[auto] sm:min-h-[400px] md:min-h-[460px]';

  return (
    <main className="flex flex-col bg-[#f4f4f4] min-h-screen overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

      <header className="w-full bg-[#f4f4f4] border-b border-[#03045E]/10 fixed top-0 left-0 z-50">
        <div className="w-full h-16 pl-4 pr-4 md:pr-8 flex items-center justify-between max-w-[1700px] mx-auto box-border">

          <div className="flex items-center gap-8 max-w-[1700px] mx-auto w-full box-border">
            
            <div className="flex items-center flex-shrink-0 py-1">
              <img
                src={isContrast ? darkLogo : lightLogo}
                alt="AbleWork Logo"
                className="h-14 w-auto object-contain max-h-full"
              />
            </div>
            <nav className="hidden md:flex items-center gap-6 text-[15px] font-medium text-[#03045E]" aria-label="Main navigation">
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

          <div className="hidden md:flex items-center">
            <NavLink
              to="/login"
              className={({ isActive }) => 
                `px-5 py-2 rounded-full bg-transparent text-[#03045E] text-sm font-bold border-2 border-[#03045E] hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF] hover:brightness-125 transform duration-200 transition whitespace-nowrap ${
                  isActive 
                    ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] underline font-semibold' 
                    : ''
                }`
              }
            >
              Log In
            </NavLink>
          </div>

          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[#2C7FFF] text-[#f4f4f4]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg className="w-6 h-6 text-[#f4f4f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-[#f4f4f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 opacity-100 border-b border-[#03045E]/10 shadow-lg' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="w-full bg-[#f4f4f4]">
            <nav className="flex flex-col px-6 py-5 gap-5 text-[16px] font-medium text-[#03045E] max-w-[1700px] mx-auto box-border" aria-label="Mobile navigation">
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
                  `mt-2 px-5 py-2.5 rounded-full bg-transparent text-[#03045E] text-sm font-bold border-2 border-[#03045E] hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF] hover:brightness-125 transform duration-200 transition w-fit whitespace-nowrap ${
                    isActive 
                      ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] underline font-semibold' 
                      : ''
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

      <div
        className={`flex-grow pt-24 pb-12 flex flex-col items-end justify-start p-4 sm:p-6 md:p-12 pr-6 sm:pr-10 md:pr-16 lg:pr-24 pl-4 md:pl-8 max-w-[1700px] mx-auto w-full box-border relative bg-no-repeat bg-cover bg-center md:bg-[size:1100px_auto] md:bg-[position:left_-50px_center] lg:md:bg-[position:left_-100px_center] xl:bg-left min-h-[100vh] md:min-h-[100vh] transition-all duration-300 ${isOpen ? 'mt-48 sm:mt-56' : 'mt-0'}`}
        style={{
          backgroundImage: `url(${backgroundImg})`,
        }}
      >
        <div className={`w-full h-auto ${containerMaxWidth} ${containerPadding} ${containerMinHeight} bg-white/90 backdrop-blur-md rounded-[2rem] shadow-xl border border-[#03045E]/15 flex flex-col items-center justify-center relative z-10 transition-all duration-300 mt-8 sm:mt-12 md:mt-16 ml-auto mr-0 md:mr-2 lg:mr-4 origin-top-right`}>
          
          <div className="text-center w-full max-w-lg mb-3 sm:mb-4">
            <span className="inline-block py-1 px-3 rounded-full bg-[#2C7FFF]/15 text-[#2C7FFF] font-bold text-xs uppercase tracking-widest mb-1.5">
              Welcome to AbleWork
            </span>
            <h1 className={`${titleSize} font-black tracking-tight text-[#03045E] mb-1.5`}>
              Choose Your Path
            </h1>
            <p className={`${subtitleSize} text-[#03045E]/80 font-medium leading-relaxed`}>
              Select how you would like to experience our inclusive employment platform tailored for your needs.
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 ${containerGap} w-full`}>
    
            <Link
              to="/register/applicant"
              className="p-3.5 sm:p-4.5 md:p-5 bg-white rounded-2xl shadow-md border-2 border-[#03045E]/10 hover:border-[#2C7FFF] hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center transition-all duration-300 cursor-pointer group"
              aria-label="Register as a Job Seeker - Looking for accessible jobs and career opportunities"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#2C7FFF] border border-[#2C7FFF] flex items-center justify-center mb-2.5 ${(isContrast || isDarkMode) ? '!text-black' : 'text-[#f4f4f4]'} group-hover:bg-[#03045E] group-hover:text-white group-hover:border-[#03045E] transition-all duration-300 shadow-inner`}>
                <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${(isContrast || isDarkMode) ? '!text-black' : 'text-[#f4f4f4] group-hover:text-white'} transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>

              <h2 className={`${cardTitleSize} font-black text-[#03045E] mb-1.5 group-hover:text-[#2C7FFF] transition-colors`}>
                I am a Job Seeker
              </h2>

              <p className={`${cardDescSize} text-[#03045E]/70 font-medium leading-relaxed max-w-xs`}>
                Looking for accessible positions, tailored accommodations, and supportive career growth opportunities.
              </p>

              <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#2C7FFF] group-hover:underline">
                Get Started 
                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
              </span>

            </Link>

            <Link
              to="/register/employer"
              className="p-3.5 sm:p-4.5 md:p-5 bg-white rounded-2xl shadow-md border-2 border-[#03045E]/10 hover:border-[#2C7FFF] hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center transition-all duration-300 cursor-pointer group"
              aria-label="Register as an Employer - Looking to hire inclusive talent and post job listings"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#2C7FFF] border border-[#2C7FFF] flex items-center justify-center mb-2.5 ${(isContrast || isDarkMode) ? '!text-black' : 'text-[#f4f4f4]'} group-hover:bg-[#03045E] group-hover:text-white group-hover:border-[#03045E] transition-all duration-300 shadow-inner`}>
                <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${(isContrast || isDarkMode) ? '!text-black' : 'text-[#f4f4f4] group-hover:text-white'} transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125 1.125 1.125 1.125V21" />
                </svg>
              </div>

              <h2 className={`${cardTitleSize} font-black text-[#03045E] mb-1.5 group-hover:text-[#2C7FFF] transition-colors`}>
                I am an Employer
              </h2>

              <p className={`${cardDescSize} text-[#03045E]/70 font-medium leading-relaxed max-w-xs`}>
                Looking to post accessible job listings, cultivate an inclusive workplace, and connect with verified diverse talent.
              </p>

              <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#2C7FFF] group-hover:underline">
                Get Started 
                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
              </span>

            </Link>

          </div>
        </div>

      </div>

      <footer
        className={`w-full relative z-20 overflow-hidden mt-auto ${
          isContrast
            ? 'bg-black text-white border-t-2 border-blue-400'
            : 'bg-white text-[#03045E]'
        }`}
        style={{
          filter: 'none',
          WebkitFilter: 'none',
          forcedColorAdjust: 'none',
        }}
      >
        <div className={`h-1 w-full ${isContrast ? 'bg-blue-400' : 'bg-[#2C7FFF]'}`} />

        <div className="w-full h-auto pl-4 pr-4 md:pr-8 py-10 sm:py-12 max-w-[1700px] mx-auto box-border">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
            
            <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={isContrast ? darkLogo : lightLogo}
                  alt="AbleWork Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className={`text-sm sm:text-base font-medium max-w-md leading-relaxed ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
                Empowering individuals and fostering an inclusive workforce with accessible smart-matching and equal opportunities for everyone.
              </p>
              <div className={`pt-2 text-xs sm:text-sm font-semibold tracking-wide ${isContrast ? 'text-white' : 'text-[#03045E]/80'}`}>
                © {new Date().getFullYear()} AbleWork. All rights reserved.
              </div>
            </div>

            <div className="md:col-span-7 flex flex-col sm:flex-row justify-end gap-12 sm:gap-20">
              <div className="text-left">
                <h4 className={`font-bold mb-4 ${isContrast ? 'text-blue-400' : 'text-[#03045e]'}`}>Platform</h4>
                <ul className={`space-y-3 text-sm font-semibold ${isContrast ? 'text-white/80' : 'text-[#03045E]/70'}`}>
                  <li><Link to="/" className={`transition-all hover:translate-x-1 inline-flex items-center gap-1 ${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'}`}>Home</Link></li>
                  <li><Link to="/about" className={`transition-all hover:translate-x-1 inline-flex items-center gap-1 ${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'}`}>About AbleWork</Link></li>
                  <li><Link to="/policy" className={`transition-all hover:translate-x-1 inline-flex items-center gap-1 ${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'}`}>Platform Policy</Link></li>
                </ul>
              </div>
              <div className="text-left">
                <h4 className={`font-bold mb-4 ${isContrast ? 'text-blue-400' : 'text-[#03045e]'}`}>Support</h4>
                <ul className={`space-y-3 text-sm font-semibold ${isContrast ? 'text-white/80' : 'text-[#03045E]/70'}`}>
                  <li><Link to="/contact" className={`transition-all hover:translate-x-1 inline-flex items-center gap-1 ${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'}`}>Contact Support</Link></li>
                  <li><Link to="/contact" className={`transition-all hover:translate-x-1 inline-flex items-center gap-1 ${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'}`}>User Feedback</Link></li>
                </ul>
              </div>
              <div className="text-left">
                <h4 className={`font-bold mb-4 ${isContrast ? 'text-blue-400' : 'text-[#03045e]'}`}>Connect</h4>
                <ul className={`space-y-3 text-sm font-semibold ${isContrast ? 'text-white/80' : 'text-[#03045E]/70'}`}>
                  <li className="flex items-start gap-2">
                    <svg className={`w-5 h-5 shrink-0 mt-0.5 ${isContrast ? 'text-blue-400' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <span>ableworksys5i@gmail.com</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className={`w-5 h-5 shrink-0 mt-0.5 ${isContrast ? 'text-blue-400' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span>Burgos Street, Barangay Villamonte, Bacolod City</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className={`w-5 h-5 shrink-0 mt-0.5 ${isContrast ? 'text-blue-400' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    <span>+63 900 000 0000</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        <div
          className={`w-full py-4 px-4 text-center text-xs sm:text-sm font-medium tracking-wide ${
            isContrast
              ? 'bg-zinc-950 text-white border-t border-blue-400'
              : 'bg-[#f4f4f4] text-[#03045E] border-t border-[#03045E]/10'
          }`}
        >
          <div className="max-w-[1700px] mx-auto flex items-center justify-center gap-4">
            <p>Designed with accessibility and inclusivity at heart.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}