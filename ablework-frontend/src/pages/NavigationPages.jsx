import { useState, useContext, useEffect } from 'react';
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';
import lightLogo from '../assets/LIGHT MODE.png';
import darkLogo from '../assets/DARK MODE.png';
import backgroundImg from '../assets/BG.png';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { mode } = useContext(AccessibilityContext);

  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  return (
    <header className={`w-full ${isContrast ? 'bg-black text-white border-b border-[#2C7FFF]' : 'bg-[#f4f4f4] text-[#03045E] border-b border-[#03045E]/20'} shrink-0 z-50`}>
      <div className="w-full h-16 pl-4 pr-4 md:pr-8 flex items-center justify-between max-w-[1700px] mx-auto box-border">

        <div className="flex items-center gap-8">
          <div className="flex items-center flex-shrink-0 py-1">
            <img
              src={isContrast ? darkLogo : lightLogo}
              alt="AbleWork Logo"
              className="h-14 w-auto object-contain max-h-full"
            />
          </div>
          <nav className={`hidden md:flex items-center gap-6 text-[15px] font-semibold ${isContrast ? 'text-white' : 'text-[#03045E]'}`} aria-label="Main navigation">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `transition-colors duration-200 hover:text-[#2C7FFF] hover:scale-105 transform ${isActive ? `font-bold border-b-2 ${isContrast ? 'border-white text-white' : 'border-[#03045E] text-[#03045E]'} pb-0.5` : (isContrast ? 'text-white' : 'text-[#03045E]')}`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `transition-colors duration-200 hover:text-[#2C7FFF] hover:scale-105 transform ${isActive ? `font-bold border-b-2 ${isContrast ? 'border-white text-white' : 'border-[#03045E] text-[#03045E]'} pb-0.5` : (isContrast ? 'text-white' : 'text-[#03045E]')}`
              }
            >
              About Us
            </NavLink>
            <NavLink 
              to="/policy" 
              className={({ isActive }) => 
                `transition-colors duration-200 hover:text-[#2C7FFF] hover:scale-105 transform ${isActive ? `font-bold border-b-2 ${isContrast ? 'border-white text-white' : 'border-[#03045E] text-[#03045E]'} pb-0.5` : (isContrast ? 'text-white' : 'text-[#03045E]')}`
              }
            >
              Policy
            </NavLink>
          </nav>
        </div>

        <div className="hidden md:flex items-center">
          <Link
            to="/login"
            className={`px-5 py-2 rounded-full bg-transparent text-sm font-bold border-2 transition transform duration-200 ${
              isContrast 
                ? 'text-white border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]' 
                : 'text-[#03045E] border-[#03045E] hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF]'
            }`}
          >
            Log In
          </Link>
        </div>

        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[#2C7FFF] text-[#f4f4f4]"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
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
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={`w-full ${isContrast ? 'bg-black border-t border-white/20' : 'bg-[#f4f4f4] border-t border-[#03045E]/20'}`}>
          <nav className={`flex flex-col px-6 py-5 gap-5 text-[16px] font-semibold max-w-[1700px] mx-auto ${isContrast ? 'text-white' : 'text-[#03045E]'}`} aria-label="Mobile navigation">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `transition-colors duration-200 hover:text-[#2C7FFF] hover:scale-105 transform ${isActive ? `font-bold pl-2 border-l-4 ${isContrast ? 'border-white text-white' : 'border-[#03045E] text-[#03045E]'}` : ''}`
              } 
              onClick={() => setIsOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `transition-colors duration-200 hover:text-[#2C7FFF] hover:scale-105 transform ${isActive ? `font-bold pl-2 border-l-4 ${isContrast ? 'border-white text-white' : 'border-[#03045E] text-[#03045E]'}` : ''}`
              } 
              onClick={() => setIsOpen(false)}
            >
              About Us
            </NavLink>
            <NavLink 
              to="/policy" 
              className={({ isActive }) => 
                `transition-colors duration-200 hover:text-[#2C7FFF] hover:scale-105 transform ${isActive ? `font-bold pl-2 border-l-4 ${isContrast ? 'border-white text-white' : 'border-[#03045E] text-[#03045E]'}` : ''}`
              } 
              onClick={() => setIsOpen(false)}
            >
              Policy
            </NavLink>
            <Link
              to="/login"
              className={`mt-2 px-5 py-2.5 rounded-full bg-transparent text-sm font-bold border-2 transition transform duration-200 w-fit ${
                isContrast 
                  ? 'text-white border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]' 
                  : 'text-[#03045E] border-[#03045E] hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF]'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Log In
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export function Home() {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  return (
    <div className={`min-h-screen flex flex-col ${isContrast ? 'bg-black text-white' : 'bg-[#9CA3AF] text-[#03045E]'}`}>

      <SiteHeader />

      <div className="flex-1 overflow-y-auto flex flex-col">

        <section 
          className="max-w-7xl mx-auto px-6 py-12 lg:py-16 w-full relative bg-no-repeat bg-cover bg-center md:bg-[size:1100px_auto] md:bg-left"
          style={{ backgroundImage: `url(${backgroundImg})` }}
        >
          <div className={`absolute inset-0 ${isContrast ? 'bg-black/60' : 'bg-[#9CA3AF]/20'} backdrop-blur-[2px] pointer-events-none`}></div>

          <div className="grid md:grid-cols-2 gap-12 items-start relative z-10">
            <div>
              <span className={`inline-block px-4 py-1.5 rounded-full ${isContrast ? 'bg-[#2C7FFF]/30 text-white border border-[#2C7FFF]' : 'bg-[#2C7FFF]/15 text-[#2C7FFF] bg-white/60'} font-black text-xs uppercase tracking-widest mb-4 backdrop-blur-sm shadow-sm`}>
                WELCOME TO ABLEWORK
              </span>

              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6 ${isContrast ? 'text-white' : 'text-[#03045E]'} drop-shadow-sm`}>
                Building an <span className="text-[#2C7FFF]">Inclusive Workforce</span> for Everyone
              </h1>

              <p className={`text-lg font-bold leading-relaxed mb-8 p-3 rounded-xl backdrop-blur-[2px] ${isContrast ? 'text-white bg-black/60 border border-white/20' : 'text-[#03045E] bg-white/40'}`}>
                AbleWork helps persons with disabilities find suitable employment opportunities based on their unique skills, qualifications, and preferred locations.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register-select"
                  className={`px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:-translate-y-0.5 transition-all flex items-center gap-2 group ${
                    isContrast 
                      ? 'bg-white text-black border-2 border-[#2c7fff] hover:bg-[#03045e] hover:text-black hover:border-white' 
                      : 'bg-[#03045E] text-[#f4f4f4] border-2 border-[#03045E] hover:border-[#2C7FFF]'
                  }`}
                >
                  Get Started Today
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                </Link>

                <Link
                  to="/about"
                  className={`backdrop-blur-sm px-8 py-4 rounded-2xl font-bold transition-all shadow-sm ${
                    isContrast
                      ? 'bg-black/80 text-white border-2 border-[#2c7fff] hover:bg-[#2c7fff] hover:text-black hover:border-white'
                      : 'bg-white/80 text-[#03045E] border-2 border-[#f4f4f4] hover:bg-[#2c7fff] hover:text-[#f4f4f4]'
                  }`}
                >
                  Learn More
                </Link>
              </div>

              <div className={`grid grid-cols-3 gap-6 mt-12 pt-10 border-t ${isContrast ? 'border-white/20' : 'border-[#03045E]/20'}`}>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-[#2C7FFF]">100%</h4>
                  <p className={`text-xs font-black uppercase tracking-wider mt-1 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Accessible</p>
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-[#2C7FFF]">24/7</h4>
                  <p className={`text-xs font-black uppercase tracking-wider mt-1 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Support</p>
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-[#2C7FFF]">Secure</h4>
                  <p className={`text-xs font-black uppercase tracking-wider mt-1 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Platform</p>
                </div>
              </div>
            </div>

            <div className={`rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border-2 relative overflow-hidden backdrop-blur-md md:-mt-6 ${isContrast ? 'bg-black text-white border-white/20' : 'bg-[#f4f4f4]/95 text-[#03045E] border-[#03045E]/20'}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2C7FFF]/10 rounded-bl-full pointer-events-none"></div>

              <h2 className={`text-2xl font-black mb-6 tracking-tight flex items-center gap-3 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
                <span className="w-3 h-3 rounded-full bg-[#2C7FFF]"></span>
                Why Choose AbleWork?
              </h2>

              <div className="space-y-6">
                <Feature
                  title="Smart Job Matching"
                  text="Find employment opportunities customized specifically to match your professional skills."
                />

                <Feature
                  title="Inclusive Employment"
                  text="Directly connect persons with disabilities with certified inclusive and supportive employers."
                />

                <Feature
                  title="Streamlined Application"
                  text="Search, track, and apply for available jobs easily through one centralized platform."
                />

                <Feature
                  title="Direct Employer Network"
                  text="Empower forward-thinking employers to discover your verified qualified profile."
                />
              </div>
            </div>
          </div>
        </section>

        <section className={`py-16 px-6 my-8 ${isContrast ? 'bg-black border-y border-white/20 text-white' : 'bg-[#03045E] text-[#f4f4f4]'}`}>
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Ready to Take the Next Step in Your Career?</h2>
            <p className="text-base sm:text-lg text-white font-semibold max-w-2xl mx-auto">
              Join our growing community of empowered candidates and inclusive companies building a barrier-free workplace.
            </p>
            <div className="pt-2">
              <Link
                to="/register-select"
                className={`inline-block px-9 py-4 rounded-2xl font-black shadow-xl hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:scale-105 transition-all border-2 ${
                  isContrast 
                    ? 'bg-white text-black border-white' 
                    : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]'
                }`}
              >
                Create Your Free Account
              </Link>
            </div>
          </div>
        </section>

        <SimpleFooter />

      </div>

    </div>
  );
}

export function About() {
  return (
    <PageLayout title="About Us">

      <div className="grid md:grid-cols-2 gap-8">

        <InfoBox>
          <h2 className="text-2xl font-black mb-5">
            About AbleWork
          </h2>
          <p className="font-semibold leading-7">
            AbleWork is a web-based employment assistance system
            designed to help persons with disabilities find
            appropriate employment opportunities.
          </p>
          <p className="font-semibold leading-7 mt-5">
            The system connects applicants and employers while
            helping employers find qualified candidates based on
            skills, qualifications, and location.
          </p>
        </InfoBox>

        <InfoBox>
          <h2 className="text-2xl font-black mb-5">
            What We Do
          </h2>
          <ul className="space-y-4 font-semibold">
            <li>✓ Connect applicants with employers</li>
            <li>✓ Provide suitable job recommendations</li>
            <li>✓ Help applicants search and apply for jobs</li>
            <li>✓ Help employers find qualified applicants</li>
            <li>✓ Promote an inclusive workforce</li>
          </ul>
        </InfoBox>

      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <InfoCard
          title="Our Mission"
          text="To make employment opportunities more accessible and inclusive."
        />
        <InfoCard
          title="Our Vision"
          text="A workforce where everyone has an equal opportunity to work."
        />
        <InfoCard
          title="Our Goal"
          text="To connect qualified applicants with suitable employers."
        />
      </div>

    </PageLayout>
  );
}

export function Policy() {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  const policySections = [
    {
      num: "01",
      title: "Information We Collect",
      desc: "We collect personal information reasonably necessary to facilitate inclusive employment matching, account verification, and secure platform operations, including personal identifiers, sensitive personal information such as PWD identification and disability type, professional credentials, and location data.",
      icon: (
        <svg className="w-6 h-6 text-[#2C7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      )
    },
    {
      num: "02",
      title: "Legal Basis and Purpose of Processing",
      desc: "Information is processed based on explicit user consent and legitimate operational interests to authenticate credentials, enforce document verification, power the smart matching engine, and maintain system security in compliance with the Data Privacy Act of 2012.",
      icon: (
        <svg className="w-6 h-6 text-[#2C7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
      )
    },
    {
      num: "03",
      title: "Processing of Sensitive Personal Information",
      desc: "Disability classifications and PWD ID documents are processed strictly to verify eligibility and ensure that matched workplaces meet necessary accommodations, stored securely and accessible exclusively to authorized administrators.",
      icon: (
        <svg className="w-6 h-6 text-[#2C7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      )
    },
    {
      num: "04",
      title: "Artificial Intelligence & Third-Party Services",
      desc: "The platform interfaces with third-party providers like Google Gemini API for the ABBY conversational assistant, email dispatch services, and mapping services under strict data protection principles.",
      icon: (
        <svg className="w-6 h-6 text-[#2C7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      )
    },
    {
      num: "05",
      title: "Data Access, Disclosure, and Visibility",
      desc: "Applicant profiles become accessible to specific employers upon job application submission. External disclosure is restricted unless legally mandated under Philippine jurisdiction.",
      icon: (
        <svg className="w-6 h-6 text-[#2C7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      )
    },
    {
      num: "06",
      title: "Data Storage and Security",
      desc: "We implement organizational, physical, and technical security measures, including cryptographic hashing with bcrypt for passwords and isolated directory storage for verification documents.",
      icon: (
        <svg className="w-6 h-6 text-[#2C7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      )
    },
    {
      num: "07",
      title: "Data Retention and Account Deletion",
      desc: "Data is retained during active participation. Users may deactivate profiles or request permanent account deletion via system settings to purge their records.",
      icon: (
        <svg className="w-6 h-6 text-[#2C7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      )
    },
    {
      num: "08",
      title: "User Rights under RA 10173",
      desc: "Users are entitled to the right to be informed, access, rectify, erase or block data, and seek damages for unlawful data processing under the Data Privacy Act of 2012.",
      icon: (
        <svg className="w-6 h-6 text-[#2C7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      )
    }
  ];

  return (
    <PageLayout title="Privacy Policy">
      <div className="w-full">
        <div className={`p-6 sm:p-8 md:p-12 rounded-3xl border-2 ${isContrast ? 'bg-black text-white border-white/20' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20 shadow-lg'}`}>

          <div className={`pb-8 mb-8 border-b ${isContrast ? 'border-white/20' : 'border-[#03045E]/10'}`}>
            <span className="text-[#2C7FFF] font-black text-xs uppercase tracking-widest block mb-2">Transparency & Commitment</span>
            <h2 className={`text-2xl font-black mb-3 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Your Privacy Matters to Us</h2>
            <p className={`text-sm sm:text-base font-semibold leading-relaxed ${isContrast ? 'text-white/80' : 'text-[#03045E]/90'}`}>
              At AbleWork, we safeguard your personal and sensitive data with uncompromising standards. Review our commitments below regarding how we collect, secure, and handle your information under the Data Privacy Act of 2012.
            </p>
          </div>

          <div className="space-y-8">
            {policySections.map((item, idx) => (
              <div key={idx} className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#2C7FFF]/15 flex items-center justify-center shrink-0 mt-1 shadow-inner">
                  {item.icon}
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#2C7FFF] px-2.5 py-0.5 rounded-full bg-[#2C7FFF]/10">
                      {item.num}
                    </span>
                    <h3 className={`text-xl font-black tracking-tight ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
                      {item.title}
                    </h3>
                  </div>
                  <p className={`text-sm sm:text-base font-semibold leading-7 ${isContrast ? 'text-white/80' : 'text-[#03045E]/90'}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </PageLayout>
  );
}

export function Terms() {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  const termsSections = [
    {
      num: "01",
      title: "Acceptance of Terms",
      desc: "By creating an account or using AbleWork, you confirm that you have read, understood, and agreed to these Terms and Conditions for applicants, employers, and administrators."
    },
    {
      num: "02",
      title: "Eligibility and User Accounts",
      desc: "Users must provide accurate information, maintain single accounts, keep credentials secure, and adhere to platform regulations."
    },
    {
      num: "03",
      title: "Account Verification",
      desc: "Applicants must submit valid PWD IDs and employers must submit business registration documents. Rejected verifications are subject to a mandatory 7-day security cooldown."
    },
    {
      num: "04",
      title: "Use of the System",
      desc: "Users agree to use the system solely for lawful employment-related activities without submitting false information, distributing malicious code, or harassing others."
    },
    {
      num: "05",
      title: "Job Listings and Applications",
      desc: "AbleWork provides employment assistance and job-matching services but does not guarantee employment, hiring decisions, or job availability."
    },
    {
      num: "06",
      title: "Job Matching and Recommendations",
      desc: "Recommendations are based on user profiles and preferences. The matching algorithm strictly enforces requirements such as accommodation availability and travel radius filters."
    },
    {
      num: "07",
      title: "Accessibility Features",
      desc: "Accessibility tools are provided to improve usability, though they may not satisfy every individual requirement."
    },
    {
      num: "08",
      title: "Chatbot and Automated Assistance",
      desc: "The ABBY chatbot provides guidance via Google Gemini API. Responses are for general assistance and do not constitute binding legal agreements."
    },
    {
      num: "09",
      title: "Location Services",
      desc: "Location data is utilized strictly for the travel radius matching algorithm when enabled by the user."
    },
    {
      num: "10",
      title: "Intellectual Property",
      desc: "All system designs, interfaces, and software components are owned by the project proponents and protected under intellectual property rights."
    },
    {
      num: "11",
      title: "System Availability and Limitations",
      desc: "The platform may occasionally experience service interruptions due to maintenance or technical issues without continuous availability guarantees."
    },
    {
      num: "12",
      title: "Account Suspension or Termination",
      desc: "AbleWork reserves the right to suspend or terminate accounts that violate terms, provide fraudulent info, or misuse platform features."
    },
    {
      num: "13",
      title: "Changes to These Terms",
      desc: "Terms may be updated periodically to reflect system improvements, security updates, or statutory requirements."
    },
    {
      num: "14",
      title: "Contact Information",
      desc: "For questions regarding these terms, contact ableworksys5i@gmail.com or visit our office at Burgos Street, Barangay Villamonte, Bacolod City."
    }
  ];

  return (
    <PageLayout title="Terms of Service">
      <div className="w-full">
        <div className={`p-6 sm:p-8 md:p-12 rounded-3xl border-2 ${isContrast ? 'bg-black text-white border-white/20' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20 shadow-lg'}`}>

          <div className={`pb-8 mb-8 border-b ${isContrast ? 'border-white/20' : 'border-[#03045E]/10'}`}>
            <span className="text-[#2C7FFF] font-black text-xs uppercase tracking-widest block mb-2">User Guidelines</span>
            <h2 className={`text-2xl font-black mb-3 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Platform Rules & Conditions</h2>
            <p className={`text-sm sm:text-base font-semibold leading-relaxed ${isContrast ? 'text-white/80' : 'text-[#03045E]/90'}`}>
              Please read these terms carefully before utilizing AbleWork. By interacting with our system, you commit to maintaining a secure, honest, and respectful community ecosystem for all job seekers and employers.
            </p>
          </div>

          <div className="space-y-8">
            {termsSections.map((item, idx) => (
              <div key={idx} className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#2C7FFF] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                  {item.num}
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className={`text-xl font-black tracking-tight ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm sm:text-base font-semibold leading-7 ${isContrast ? 'text-white/80' : 'text-[#03045E]/90'}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </PageLayout>
  );
}

export function Contact() {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  return (
    <PageLayout title="Contact Us">
      <div className="grid md:grid-cols-2 gap-8">
        
        <InfoBox>
          <h2 className="text-2xl font-black mb-6">Get in Touch</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-black">Email</h3>
              <p className="font-semibold">ableworksys5@gmail.com</p>
            </div>
            <div>
              <h3 className="font-black">Phone</h3>
              <p className="font-semibold">+63 900 000 0000</p>
            </div>
            <div>
              <h3 className="font-black">Address</h3>
              <p className="font-semibold">Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</p>
            </div>
          </div>
        </InfoBox>

        <InfoBox>
          <h2 className="text-2xl font-black mb-6">Send Us a Message</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="sr-only">Your Name</label>
              <input
                id="contact-name"
                type="text"
                placeholder="Your Name"
                aria-label="Your Name"
                className={`w-full p-3 bg-transparent border-2 rounded-xl font-semibold focus:outline-none focus:border-[#2C7FFF] ${
                  isContrast ? 'border-white/30 text-white placeholder-white/70' : 'border-[#03045E]/30 text-[#03045E] placeholder-[#03045E]/70'
                }`}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="sr-only">Your Email</label>
              <input
                id="contact-email"
                type="email"
                placeholder="Your Email"
                aria-label="Your Email"
                className={`w-full p-3 bg-transparent border-2 rounded-xl font-semibold focus:outline-none focus:border-[#2C7FFF] ${
                  isContrast ? 'border-white/30 text-white placeholder-white/70' : 'border-[#03045E]/30 text-[#03045E] placeholder-[#03045E]/70'
                }`}
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="sr-only">Your Message</label>
              <textarea
                id="contact-message"
                rows="5"
                placeholder="Your Message"
                aria-label="Your Message"
                className={`w-full p-3 bg-transparent border-2 rounded-xl font-semibold focus:outline-none focus:border-[#2C7FFF] ${
                  isContrast ? 'border-white/30 text-white placeholder-white/70' : 'border-[#03045E]/30 text-[#03045E] placeholder-[#03045E]/70'
                }`}
              />
            </div>
            <button
              type="button"
              className={`w-full py-3 rounded-full font-bold transition border-2 ${
                isContrast 
                  ? 'bg-white text-black border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]' 
                  : 'bg-[#03045E] text-[#f4f4f4] border-[#03045E] hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF]'
              }`}
            >
              Send Message
            </button>
          </form>
        </InfoBox>

      </div>
    </PageLayout>
  );
}

function InfoBox({ children, className = "p-8" }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  return (
    <div className={`rounded-3xl shadow-lg border-2 ${isContrast ? 'bg-black text-white border-white/20' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20'} ${className}`}>
      {children}
    </div>
  );
}

function PageLayout({ title, children }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  return (
    <div className={`min-h-screen flex flex-col ${isContrast ? 'bg-black text-white' : 'bg-[#9CA3AF] text-[#03045E]'}`}>

      <SiteHeader />

      <div className="flex-1 overflow-y-auto flex flex-col">

        <main className="flex-grow max-w-7xl mx-auto px-6 py-16 w-full">

          <h1 className={`text-4xl md:text-5xl font-black text-center mb-12 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
            {title}
          </h1>

          {children}

        </main>

        <SimpleFooter />

      </div>

    </div>
  );
}

function SimpleFooter() {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  return (
    <footer className={`py-12 px-6 mt-auto border-t-2 shadow-inner ${isContrast ? 'bg-black text-white border-white/20' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20'}`}>

      <div className={`max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b ${isContrast ? 'border-white/10' : 'border-[#03045E]/10'}`}>
        
        <div className="md:col-span-1 space-y-3">
          <p className="font-black text-xl tracking-tight text-[#2C7FFF]">
            AbleWork
          </p>
          <p className={`text-sm font-semibold leading-relaxed ${isContrast ? 'text-white/80' : 'text-[#03045E]'}`}>
            Building an inclusive workforce and equal employment opportunities for everyone.
          </p>
          <div className={`pt-2 flex items-center space-x-3 text-xs font-bold uppercase tracking-wider ${isContrast ? 'text-white/70' : 'text-[#03045E]'}`}>
            <span> Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</span>
            <span>•</span>
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
  );
}

function Feature({ title, text }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const id = `feature-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div role="group" aria-labelledby={id} className="flex gap-4 items-start p-3 rounded-2xl">
      <div className="w-8 h-8 rounded-xl bg-[#2C7FFF]/15 text-[#2C7FFF] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
        ✓
      </div>
      <div>
        <h3 id={id} className={`font-black text-base mb-1 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
          {title}
        </h3>
        <p className={`text-sm font-semibold leading-relaxed ${isContrast ? 'text-white/80' : 'text-[#03045E]'}`}>
          {text}
        </p>
      </div>
    </div>
  );
}

function InfoCard({ title, text }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const id = `info-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div
      className={`rounded-2xl shadow-lg p-7 border-2 ${isContrast ? 'bg-black text-white border-white/20' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20'}`}
      role="region"
      aria-labelledby={id}
    >
      <h3 id={id} className={`text-xl font-black mb-3 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
        {title}
      </h3>
      <p className={`font-semibold leading-6 ${isContrast ? 'text-white/80' : 'text-[#03045E]'}`}>
        {text}
      </p>
    </div>
  );
}

export default function ApplicantRegister() {
  const { mode } = useContext(AccessibilityContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [radius, setRadius] = useState(10);
  
  const [independence, setIndependence] = useState('');

  const [pwdFile, setPwdFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const toggleSelection = (item, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(item)) {
      setSelectedArray(selectedArray.filter(i => i !== item));
    } else {
      setSelectedArray([...selectedArray, item]);
    }
  };

  const availableDisabilities = [
    'Deafness', 'Blindness', 'Low Vision', 'Hard of Hearing', 'Color Blindness',
    'Paraplegia (Lower Body)', 'Hemiplegia (One Side)', 'Upper Limb Amputation',
    'Lower Limb Amputation', 'Cerebral Palsy', 'Limited Fine Motor Skills', 'Wheelchair User'
  ];
  const extendedDisabilities = [
    'Speech Impairment', 'Neurodivergent', 'Chronic Pain', 'Multiple Sclerosis', 
    'Muscular Dystrophy', 'Spina Bifida', 'Dwarfism', 'Autism Spectrum', 'ADHD'
  ];
  const [selectedDisabilities, setSelectedDisabilities] = useState([]);
  const [showOtherDisability, setShowOtherDisability] = useState(false);
  const [otherDisability, setOtherDisability] = useState('');

  const handleCustomDisabilityKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (otherDisability.trim() && !selectedDisabilities.includes(otherDisability.trim())) {
        setSelectedDisabilities([...selectedDisabilities, otherDisability.trim()]);
        setOtherDisability('');
      }
    }
  };

  const availableAccommodations = ['Screen Reader', 'Wheelchair Access', 'Sign Language Interpreter', 'Flexible Hours', 'Quiet Workspace'];
  const extendedAccommodations = [
    'Ergonomic Setup', 'Noise-Cancelling Headphones', 'Screen Magnifier', 'Braille Keyboard', 
    'Captioning Services', 'Remote Work', 'Frequent Breaks', 'Service Animal',
    'Adjustable Desk', 'Voice-to-Text Software', 'Large Print Documents', 'Step-Free Access'
  ];
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  const [showOtherAccommodation, setShowOtherAccommodation] = useState(false);
  const [otherAccommodation, setOtherAccommodation] = useState('');

  const defaultAvailable = [
    'Customer Service', 
    'Data Entry', 
    'Communication', 
    'Time Management', 
    'Microsoft Office', 
    'Teamwork'
  ];
  
  const defaultExtended = [
    'Virtual Assistance', 
    'Social Media Management', 
    'Problem Solving', 
    'Writing', 
    'Inventory Management', 
    'Graphic Design', 
    'Scheduling', 
    'Project Management', 
    'Retail Sales',
    'Copywriting'
  ];
  const [availableSkills, setAvailableSkills] = useState(defaultAvailable);
  const [extendedSkills, setExtendedSkills] = useState(defaultExtended);
  
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showOtherSkill, setShowOtherSkill] = useState(false);
  const [otherSkill, setOtherSkill] = useState('');

  useEffect(() => {
    const fetchPopularSkills = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/skills/popular');
        if (response.ok) {
          const popularSkills = await response.json();
          
          const combinedSkills = Array.from(new Set([...popularSkills, ...defaultAvailable, ...defaultExtended]));
          
          setAvailableSkills(combinedSkills.slice(0, 6));
          setExtendedSkills(combinedSkills.slice(6));
        }
      } catch (error) {
        console.error("Failed to fetch popular skills:", error);
      }
    };

    fetchPopularSkills();
  }, []);

  const handleCustomSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (otherSkill.trim() && !selectedSkills.includes(otherSkill.trim())) {
        setSelectedSkills([...selectedSkills, otherSkill.trim()]);
        setOtherSkill('');
      }
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
   
    if (password !== confirmPassword) {
      setStatusMessage({ type: 'error', text: "Passwords do not match. Please check and try again." });
      return;
    }

    const birthYear = new Date(birthdate).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 18) {
      setStatusMessage({ type: 'error', text: "You must be 18 years or older to register on AbleWork." });
      return;
    }
    if (!pwdFile) {
      setStatusMessage({ type: 'error', text: "Please upload your PWD ID or Certification." });
      return;
    }
    setIsLoading(true);
    
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
    formData.append('disabilities', JSON.stringify(selectedDisabilities));
    formData.append('accommodations', JSON.stringify(selectedAccommodations));
    formData.append('skills', JSON.stringify(selectedSkills));
    formData.append('pwdDocument', pwdFile);

    try {
      const response = await fetch('http://localhost:5001/api/auth/register/applicant', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate('/login');
        }, 2000);
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
    <main
      className="min-h-screen flex flex-col bg-black text-white overflow-hidden relative"
      role="main"
      aria-label="Applicant registration page"
    >
      <header className="w-full bg-black border-b border-[#2C7FFF] fixed top-0 left-0 z-50">
        <div className="w-full h-16 pl-4 pr-4 md:pr-8 flex items-center justify-between max-w-[1700px] mx-auto box-border">
          <div className="flex items-center gap-8">
            <div className="flex items-center flex-shrink-0 py-1">
              <img src={darkLogo} alt="AbleWork Logo" className="h-14 w-auto object-contain max-h-full" />
            </div>
            <nav className="hidden md:flex items-center gap-6 text-[15px] font-medium text-white">
              <Link to="/" className="hover:text-[#2C7FFF] transition">Home</Link>
              <Link to="/about" className="hover:text-[#2C7FFF] transition">About Us</Link>
              <Link to="/policy" className="hover:text-[#2C7FFF] transition">Policy</Link>
            </nav>
          </div>
          <div className="hidden md:flex items-center">
            <NavLink
              to="/login"
              className={({ isActive }) => 
                `px-5 py-2 rounded-full bg-transparent text-white text-sm font-bold border-2 border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF] transform duration-200 transition whitespace-nowrap ${
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
          >
            {isOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>

      <div 
        className={`fixed inset-0 top-16 z-40 flex items-center justify-center px-4 md:px-8 max-w-[1700px] mx-auto overflow-y-auto transition-all duration-300 ${isOpen ? 'mt-48 sm:mt-56' : 'mt-0'}`}
        role="region"
        aria-label="Applicant registration area"
      >
        <div
          className="absolute inset-0 max-w-[1700px] mx-auto w-full bg-no-repeat bg-cover bg-center md:bg-[size:1100px_auto] md:bg-left pointer-events-none"
          style={{
            backgroundImage: `url(${backgroundImg})`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] pointer-events-none" aria-hidden="true" />

        <div className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-black text-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative z-50 my-auto animate-fadeIn">
          
          <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-white/20 bg-black">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tighter text-white">
                  Job Seeker Registration
                </h1>
                <p className="text-sm text-white/70 mt-0.5">
                  Build your accessible career profile
                </p>
              </div>
              <Link
                to="/register-select"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition"
              >
                ✕
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {statusMessage.text && (
              <div
                role="alert"
                aria-live="assertive"
                className={`p-4 mb-6 rounded-xl font-bold text-center border-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-green-900 text-green-100 border-green-500'
                    : 'bg-red-900 text-red-100 border-red-500'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-7" autoComplete="off">
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="firstName" className="text-sm font-semibold text-white">First Name <span className="text-white">*</span></label>
                  <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter your First Name" required className="w-full p-3 border border-white/20 rounded-xl bg-black text-white focus:outline-none focus:border-[#2C7FFF] transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="middleName" className="text-sm font-semibold text-white">Middle Name (Optional)</label>
                  <input id="middleName" type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Enter your Middle Name" className="w-full p-3 border border-white/20 rounded-xl bg-black text-white focus:outline-none focus:border-[#2C7FFF] transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lastName" className="text-sm font-semibold text-white">Last Name <span className="text-white">*</span></label>
                  <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter your Last Name" required className="w-full p-3 border border-white/20 rounded-xl bg-black text-white focus:outline-none focus:border-[#2C7FFF] transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-sm font-semibold text-white">Phone Number <span className="text-white">*</span></label>
                  <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your Phone Number" required className="w-full p-3 border border-white/20 rounded-xl bg-black text-white focus:outline-none focus:border-[#2C7FFF] transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-white">Email Address <span className="text-white">*</span></label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your Email Address" required className="w-full p-3 border border-white/20 rounded-xl bg-black text-white focus:outline-none focus:border-[#2C7FFF] transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-sm font-semibold text-white">Password <span className="text-white">*</span></label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your Password" required className="w-full p-3 border border-white/20 rounded-xl bg-black text-white focus:outline-none focus:border-[#2C7FFF] transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className="text-sm font-semibold text-white">Confirm Password <span className="text-white">*</span></label>
                  <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your Password" required className="w-full p-3 border border-white/20 rounded-xl bg-black text-white focus:outline-none focus:border-[#2C7FFF] transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="birthdate" className="text-sm font-semibold text-white">Birthdate (Must be 18+) <span className="text-white">*</span></label>
                  <input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} placeholder="Enter your Birthdate" required className="w-full p-3 border border-white/20 rounded-xl bg-black text-white focus:outline-none focus:border-[#2C7FFF] transition" />
                </div>
              </div>

              <hr className="border-white/20" />

              <div className="flex flex-col gap-3 p-5 border border-[#2C7FFF]/30 rounded-2xl bg-[#2C7FFF]/10">
                <label htmlFor="address" className="text-sm font-bold text-white">Residential Address <span className="text-white">*</span></label>
                <button type="button" onClick={handleDetectLocation} disabled={isDetecting} className="bg-[#2C7FFF] text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md hover:bg-white hover:text-black transition">
                  {isDetecting ? 'Detecting Location...' : '📍 Detect My Location'}
                </button>
                <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your Residential Address (e.g. Block 4, Main Street, Manila)" required className="w-full p-3 border border-white/20 rounded-xl bg-black text-white" />
                
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="radius" className="text-sm font-semibold text-white">
                      Max Travel Radius:
                    </label>
                    <span className="text-[#2C7FFF] font-black text-lg bg-black px-3 py-1 rounded-lg border border-[#2C7FFF]/20 shadow-sm">{radius} km</span>
                  </div>
                  <input 
                    id="radius" type="range" min="1" max="50" 
                    value={radius} onChange={(e) => setRadius(Number(e.target.value))} 
                    className="w-full h-2 accent-[#2C7FFF] cursor-pointer" 
                  />
                  <p className="text-xs text-gray-400">Jobs beyond this distance will be filtered out automatically.</p>
                </div>

                {lat && lng ? (
                  <div className="h-64 w-full mt-4 rounded-xl overflow-hidden border border-white/20 z-0 relative shadow-inner">
                    <MapContainer center={[lat, lng]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[lat, lng]} />
                      <Circle center={[lat, lng]} radius={radius * 1000} pathOptions={{ color: '#2C7FFF', fillColor: '#2C7FFF', fillOpacity: 0.2, weight: 2 }} />
                      <MapRecenter lat={lat} lng={lng} />
                    </MapContainer>
                  </div>
                ) : (
                  <div className="h-40 w-full mt-4 rounded-xl border-2 border-dashed border-white/20 bg-black/50 flex flex-col items-center justify-center text-white/50">
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span className="text-sm font-semibold">Click 'Detect My Location' to view your travel zone.</span>
                  </div>
                )}
              </div>

              <hr className="border-white/20" />

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-bold text-white">Physical & Sensory Profile (Work-Enabled) <span className="text-white">*</span></legend>
                <p className="text-xs text-gray-400">Select applicable physical or sensory categories for tailored job accommodation matching.</p>
                
                {selectedDisabilities.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/20">
                    <span className="w-full text-xs font-bold text-gray-400 uppercase tracking-wider">Selected Profile:</span>
                    {selectedDisabilities.map(disability => (
                      <span key={disability} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-black text-xs font-bold rounded-full shadow-sm">
                        {disability}
                        <button 
                          type="button" 
                          onClick={() => setSelectedDisabilities(selectedDisabilities.filter(d => d !== disability))}
                          className="hover:text-red-500 font-bold ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {availableDisabilities.map((disability) => (
                    <button
                      type="button"
                      key={disability}
                      onClick={() => toggleSelection(disability, selectedDisabilities, setSelectedDisabilities)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                        selectedDisabilities.includes(disability)
                          ? 'bg-white text-black border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                          : 'bg-black text-white border-white/30 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                      }`}
                    >
                      {disability} {selectedDisabilities.includes(disability) ? '✓' : '+'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowOtherDisability(!showOtherDisability)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                      showOtherDisability
                        ? 'bg-white text-black border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                        : 'bg-black text-white border-white/30 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                    }`}
                  >
                    Other {showOtherDisability ? '✓' : '+'}
                  </button>
                </div>

                {showOtherDisability && (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="text"
                      value={otherDisability}
                      onChange={(e) => setOtherDisability(e.target.value)}
                      onKeyDown={handleCustomDisabilityKeyDown}
                      placeholder="Type custom condition and press Enter (or pick below)..."
                      className="w-full p-3 border border-white/20 rounded-xl bg-black text-white"
                    />
                    {otherDisability.length > 0 && (
                      <div className="flex flex-wrap gap-2 animate-fadeIn">
                        {extendedDisabilities
                          .filter(d => d.toLowerCase().includes(otherDisability.toLowerCase()) && !selectedDisabilities.includes(d))
                          .slice(0, 6)
                          .map(suggestion => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                toggleSelection(suggestion, selectedDisabilities, setSelectedDisabilities);
                                setOtherDisability(''); 
                              }}
                              className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition bg-black text-white border-white/30 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]"
                            >
                              + {suggestion}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-bold text-white">Workplace Independence <span className="text-white">*</span></legend>
                <div className="flex flex-wrap gap-2">
                  {['Independent', 'Requires Assistance'].map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setIndependence(option)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${
                        independence === option
                          ? 'bg-white text-black border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                          : 'bg-black text-white border-white/30 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                      }`}
                    >
                      {option} {independence === option ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-bold text-white"> Accommodations <span className="text-gray-400 font-normal ml-1">(Optional)</span></legend>
                <div className="flex flex-wrap gap-2">
                  {availableAccommodations.map((acc) => (
                    <button
                      type="button"
                      key={acc}
                      onClick={() => toggleSelection(acc, selectedAccommodations, setSelectedAccommodations)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                        selectedAccommodations.includes(acc)
                          ? 'bg-white text-black border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                          : 'bg-black text-white border-white/30 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                      }`}
                    >
                      {acc} {selectedAccommodations.includes(acc) ? '✓' : '+'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowOtherAccommodation(!showOtherAccommodation)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                      showOtherAccommodation
                        ? 'bg-white text-black border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                        : 'bg-black text-white border-white/30 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                    }`}
                  >
                    Other {showOtherAccommodation ? '✓' : '+'}
                  </button>
                </div>

                {showOtherAccommodation && (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="text"
                      value={otherAccommodation}
                      onChange={(e) => setOtherAccommodation(e.target.value)}
                      placeholder="Type custom accommodation and press Enter..."
                      className="w-full p-3 border border-white/20 rounded-xl bg-black text-white"
                    />
                    {otherAccommodation.length > 0 && (
                      <div className="flex flex-wrap gap-2 animate-fadeIn">
                        {extendedAccommodations
                          .filter(a => a.toLowerCase().includes(otherAccommodation.toLowerCase()) && !selectedAccommodations.includes(a))
                          .slice(0, 6)
                          .map(suggestion => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                toggleSelection(suggestion, selectedAccommodations, setSelectedAccommodations);
                                setOtherAccommodation(''); 
                              }}
                              className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition bg-black text-white border-white/30 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]"
                            >
                              + {suggestion}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-bold text-white">Your Skills <span className="text-white">*</span></legend>
                
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/20">
                    <span className="w-full text-xs font-bold text-gray-400 uppercase tracking-wider">Selected Skills:</span>
                    {selectedSkills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-black text-xs font-bold rounded-full shadow-sm">
                        {skill}
                        <button 
                          type="button" 
                          onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                          className="hover:text-red-500 font-bold ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSelection(skill, selectedSkills, setSelectedSkills)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                        selectedSkills.includes(skill)
                          ? 'bg-white text-black border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                          : 'bg-black text-white border-white/30 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                      }`}
                    >
                      {skill} {selectedSkills.includes(skill) ? '✓' : '+'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowOtherSkill(!showOtherSkill)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                      showOtherSkill
                        ? 'bg-white text-black border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                        : 'bg-black text-white border-white/30 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                    }`}
                  >
                    Other {showOtherSkill ? '✓' : '+'}
                  </button>
                </div>

                {showOtherSkill && (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="text"
                      value={otherSkill}
                      onChange={(e) => setOtherSkill(e.target.value)}
                      onKeyDown={handleCustomSkillKeyDown}
                      placeholder="Type custom skill and press Enter (or pick below)..."
                      className="w-full p-3 border border-white/20 rounded-xl bg-black text-white"
                    />
                    {otherSkill.length > 0 && (
                      <div className="flex flex-wrap gap-2 animate-fadeIn">
                        {extendedSkills
                          .filter(s => s.toLowerCase().includes(otherSkill.toLowerCase()) && !selectedSkills.includes(s))
                          .slice(0, 6)
                          .map(suggestion => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                toggleSelection(suggestion, selectedSkills, setSelectedSkills);
                                setOtherSkill(''); 
                              }}
                              className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition bg-black text-white border-white/30 hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]"
                            >
                              + {suggestion}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </fieldset>

              <hr className="border-white/20" />

              <div className="p-4 rounded-2xl border-2 border-dashed border-white/20 bg-black/50">
                <label htmlFor="pwdId" className="block text-sm font-bold text-white mb-1">Upload PWD ID / Certificates <span className="text-white">*</span></label>
                <input
                  id="pwdId"
                  type="file"
                  onChange={(e) => setPwdFile(e.target.files[0])}
                  className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-black file:font-semibold cursor-pointer"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 py-3.5 bg-white text-black hover:bg-[#2C7FFF] hover:text-white text-base font-semibold rounded-full shadow-md transition disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Complete Registration'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/80">
              <Link to="/register-select" className="font-bold text-[#2C7FFF] hover:underline">
                ← Back to Role Selection
              </Link>
            </p>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <div className="relative w-full max-w-sm bg-black text-white rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden animate-fadeIn">
            <div className="h-1.5 w-full bg-gradient-to-r from-white via-[#2C7FFF] to-white" />

            <div className="px-8 pt-8 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#2C7FFF] flex items-center justify-center shadow-lg shadow-[#2C7FFF]/40">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <span className="text-black text-xs font-black">✓</span>
                </div>
              </div>

              <h2 id="success-title" className="text-2xl font-black text-white tracking-tight mb-2">
                You’re all set!
              </h2>
              <p className="text-sm text-white/75 font-medium leading-relaxed mb-4">
                Registration completed successfully.
              </p>

              <div className="flex items-center gap-1.5" aria-label="Redirecting to login">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:300ms]" />
              </div>
              <p className="text-xs text-[#2C7FFF] font-semibold mt-3">
                Taking you to Log In…
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}