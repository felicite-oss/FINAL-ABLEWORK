import { createContext, useState, useEffect } from 'react';
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import headerLogo from '../assets/Final.png';

export const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('ui_preference') || 'Standard';
  });

  useEffect(() => {
    localStorage.setItem('ui_preference', mode);
    const root = document.documentElement;
    root.classList.remove('theme-Standard', 'theme-High-Contrast', 'theme-Assist');
    root.classList.add(`theme-${mode.replace(' ', '-')}`);
  }, [mode]);

  return (
    <AccessibilityContext.Provider value={{ mode, setMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// ======================================================
// SITE HEADER (Shared Header Component matching register style alignment)
// ======================================================
function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-[var(--bg-primary, #f4f4f4)] text-[var(--text-primary, #03045E)] border-b border-current/10 shrink-0 z-50">
      <div className="w-full h-16 pl-4 pr-4 md:pr-8 flex items-center justify-between">

        {/* Left side: Logo + Desktop Navigation */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <img
              src={headerLogo}
              alt="AbleWork Logo"
              className="h-20 w-auto object-contain max-h-full"
            />
          </div>
          <nav className="hidden md:flex items-center gap-6 text-[15px] font-medium">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `transition-colors duration-200 hover:opacity-80 hover:scale-105 transform ${isActive ? 'font-semibold border-b-2 border-current pb-0.5' : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `transition-colors duration-200 hover:opacity-80 hover:scale-105 transform ${isActive ? 'font-semibold border-b-2 border-current pb-0.5' : ''}`
              }
            >
              About Us
            </NavLink>
            <NavLink 
              to="/policy" 
              className={({ isActive }) => 
                `transition-colors duration-200 hover:opacity-80 hover:scale-105 transform ${isActive ? 'font-semibold border-b-2 border-current pb-0.5' : ''}`
              }
            >
              Policy
            </NavLink>
          </nav>
        </div>

        {/* Desktop Log In */}
        <div className="hidden md:flex items-center">
          <Link
            to="/login"
            className="px-5 py-2 rounded-full bg-transparent text-current text-sm font-medium border border-current hover:opacity-80 hover:scale-105 transform duration-200 transition"
          >
            Log In
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--accent, #2C7FFF)] text-white"
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
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="w-full bg-[var(--bg-primary, #f4f4f4)] border-t border-current/10">
          <nav className="flex flex-col px-6 py-5 gap-5 text-[16px] font-medium">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `transition-colors duration-200 hover:opacity-80 hover:scale-105 transform ${isActive ? 'font-semibold pl-2 border-l-4 border-current' : ''}`
              } 
              onClick={() => setIsOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `transition-colors duration-200 hover:opacity-80 hover:scale-105 transform ${isActive ? 'font-semibold pl-2 border-l-4 border-current' : ''}`
              } 
              onClick={() => setIsOpen(false)}
            >
              About Us
            </NavLink>
            <NavLink 
              to="/policy" 
              className={({ isActive }) => 
                `transition-colors duration-200 hover:opacity-80 hover:scale-105 transform ${isActive ? 'font-semibold pl-2 border-l-4 border-current' : ''}`
              } 
              onClick={() => setIsOpen(false)}
            >
              Policy
            </NavLink>
            <Link
              to="/login"
              className="mt-2 px-5 py-2.5 rounded-full bg-transparent text-current text-sm font-medium border border-current hover:opacity-80 hover:scale-105 transform duration-200 transition w-fit"
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


// ======================================================
// HOME PAGE
// ======================================================
export function Home() {
  return (
    <div className="h-svh flex flex-col overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">

      {/* HEADER */}
      <SiteHeader />

      {/* SCROLLABLE CONTENT (stays below header) */}
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* HERO */}
        <section className="flex-grow min-h-full max-w-7xl mx-auto px-6 py-20 w-full">

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div>

              <p className="text-[var(--accent, #2C7FFF)] font-bold mb-3">
                WELCOME TO ABLEWORK
              </p>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                Building an Inclusive Workforce for Everyone
              </h1>

              <p className="text-lg opacity-80 leading-7 mb-8">
                AbleWork helps persons with disabilities find suitable
                employment opportunities based on their skills,
                qualifications, and location.
              </p>

              <div className="flex flex-wrap gap-4">

                <Link
                  to="/register-select"
                  className="bg-[var(--text-primary, #03045E)] text-[var(--bg-primary, #ffffff)] px-7 py-3 rounded-full font-semibold hover:opacity-80 transition border border-current"
                >
                  Get Started
                </Link>

                <Link
                  to="/about"
                  className="border-2 border-current px-7 py-3 rounded-full font-semibold hover:opacity-80 transition"
                >
                  Learn More
                </Link>

              </div>

            </div>


            {/* RIGHT SIDE */}
            <div className="bg-[var(--bg-secondary, #ffffff)] text-[var(--text-secondary, #03045E)] rounded-3xl shadow-xl p-8 md:p-10 border border-current/10">

              <h2 className="text-2xl font-bold mb-6">
                Why Choose AbleWork?
              </h2>

              <div className="space-y-6">

                <Feature
                  title="Job Matching"
                  text="Find employment opportunities that match your skills."
                />

                <Feature
                  title="Inclusive Employment"
                  text="Connect persons with disabilities with inclusive employers."
                />

                <Feature
                  title="Easy Application"
                  text="Search and apply for available jobs through one platform."
                />

                <Feature
                  title="Employer Connection"
                  text="Help employers discover qualified applicants."
                />

              </div>

            </div>

          </div>

        </section>


        {/* FOOTER */}
        <SimpleFooter />

      </div>

    </div>
  );
}


// ======================================================
// ABOUT US PAGE
// ======================================================
export function About() {
  return (
    <PageLayout title="About Us">

      <div className="grid md:grid-cols-2 gap-8">

        <div className="bg-[var(--bg-secondary, #ffffff)] text-[var(--text-secondary, #03045E)] rounded-3xl shadow-lg p-8 border border-current/10">

          <h2 className="text-2xl font-bold mb-5">
            About AbleWork
          </h2>

          <p className="opacity-80 leading-7">
            AbleWork is a web-based employment assistance system
            designed to help persons with disabilities find
            appropriate employment opportunities.
          </p>

          <p className="opacity-80 leading-7 mt-5">
            The system connects applicants and employers while
            helping employers find qualified candidates based on
            skills, qualifications, and location.
          </p>

        </div>


        <div className="bg-[var(--bg-secondary, #ffffff)] text-[var(--text-secondary, #03045E)] rounded-3xl shadow-lg p-8 border border-current/10">

          <h2 className="text-2xl font-bold mb-5">
            What We Do
          </h2>

          <ul className="space-y-4 opacity-80">

            <li>
              ✓ Connect applicants with employers
            </li>

            <li>
              ✓ Provide suitable job recommendations
            </li>

            <li>
              ✓ Help applicants search and apply for jobs
            </li>

            <li>
              ✓ Help employers find qualified applicants
            </li>

            <li>
              ✓ Promote an inclusive workforce
            </li>

          </ul>

        </div>

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


// ======================================================
// POLICY PAGE
// ======================================================
export function Policy() {
  return (
    <PageLayout title="Privacy Policy">

      <div className="bg-[var(--bg-secondary, #ffffff)] text-[var(--text-secondary, #03045E)] rounded-3xl shadow-lg p-8 md:p-12 space-y-8 border border-current/10">

        <section>
          <h2 className="text-2xl font-bold mb-3">
            Information We Collect
          </h2>

          <p className="opacity-80 leading-7">
            AbleWork may collect information such as your name,
            email address, contact information, skills,
            qualifications, and employment information.
          </p>
        </section>


        <section>
          <h2 className="text-2xl font-bold mb-3">
            How We Use Your Information
          </h2>

          <p className="opacity-80 leading-7">
            The information may be used to provide job matching,
            job applications, notifications, and communication
            between applicants and employers.
          </p>
        </section>


        <section>
          <h2 className="text-2xl font-bold mb-3">
            Data Protection
          </h2>

          <p className="opacity-80 leading-7">
            AbleWork aims to protect user information and use
            collected information only for purposes related to
            the system.
          </p>
        </section>


        <section>
          <h2 className="text-2xl font-bold mb-3">
            User Privacy
          </h2>

          <p className="opacity-80 leading-7">
            Users should provide accurate information and keep
            their account credentials secure.
          </p>
        </section>

      </div>

    </PageLayout>
  );
}


// ======================================================
// TERMS OF SERVICE PAGE
// ======================================================
export function Terms() {
  return (
    <PageLayout title="Terms of Service">

      <div className="bg-[var(--bg-secondary, #ffffff)] text-[var(--text-secondary, #03045E)] rounded-3xl shadow-lg p-8 md:p-12 space-y-8 border border-current/10">

        <section>

          <h2 className="text-2xl font-bold mb-3">
            1. Use of AbleWork
          </h2>

          <p className="opacity-80 leading-7">
            Users should use AbleWork only for legitimate
            employment-related activities.
          </p>

        </section>


        <section>

          <h2 className="text-2xl font-bold mb-3">
            2. User Responsibilities
          </h2>

          <p className="opacity-80 leading-7">
            Users are responsible for providing accurate
            information and keeping their account information
            secure.
          </p>

        </section>


        <section>

          <h2 className="text-2xl font-bold mb-3">
            3. Account Usage
          </h2>

          <p className="opacity-80 leading-7">
            Accounts should not be used for fraudulent,
            harmful, or unauthorized activities.
          </p>

        </section>


        <section>

          <h2 className="text-2xl font-bold mb-3">
            4. Employment Information
          </h2>

          <p className="opacity-80 leading-7">
            Users should provide truthful information when
            creating profiles, posting jobs, or applying for
            employment opportunities.
          </p>

        </section>

      </div>

    </PageLayout>
  );
}


// ======================================================
// CONTACT PAGE
// ======================================================
export function Contact() {
  return (
    <PageLayout title="Contact Us">

      <div className="grid md:grid-cols-2 gap-8">

        {/* CONTACT INFORMATION */}
        <div className="bg-[var(--bg-secondary, #ffffff)] text-[var(--text-secondary, #03045E)] rounded-3xl shadow-lg p-8 border border-current/10">

          <h2 className="text-2xl font-bold mb-6">
            Get in Touch
          </h2>


          <div className="space-y-6">

            <div>
              <h3 className="font-bold">
                Email
              </h3>

              <p className="opacity-80">
                support@ablework.com
              </p>
            </div>


            <div>
              <h3 className="font-bold">
                Phone
              </h3>

              <p className="opacity-80">
                +63 900 000 0000
              </p>
            </div>


            <div>
              <h3 className="font-bold">
                Address
              </h3>

              <p className="opacity-80">
                Bacolod City, Philippines
              </p>
            </div>

          </div>

        </div>


        {/* CONTACT FORM */}
        <div className="bg-[var(--bg-secondary, #ffffff)] text-[var(--text-secondary, #03045E)] rounded-3xl shadow-lg p-8 border border-current/10">

          <h2 className="text-2xl font-bold mb-6">
            Send Us a Message
          </h2>


          <form className="space-y-4">

            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-3 bg-transparent border border-current/20 rounded-xl focus:outline-none focus:border-[var(--accent, #2C7FFF)]"
            />


            <input
              type="email"
              placeholder="Your Email"
              className="w-full p-3 bg-transparent border border-current/20 rounded-xl focus:outline-none focus:border-[var(--accent, #2C7FFF)]"
            />


            <textarea
              rows="5"
              placeholder="Your Message"
              className="w-full p-3 bg-transparent border border-current/20 rounded-xl focus:outline-none focus:border-[var(--accent, #2C7FFF)]"
            />


            <button
              type="button"
              className="w-full bg-[var(--text-primary, #03045E)] text-[var(--bg-primary, #ffffff)] py-3 rounded-full font-semibold hover:opacity-80 transition border border-current"
            >
              Send Message
            </button>

          </form>

        </div>

      </div>

    </PageLayout>
  );
}


// ======================================================
// REUSABLE PAGE LAYOUT
// ======================================================
function PageLayout({ title, children }) {

  return (
    <div className="h-svh flex flex-col overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">

      {/* HEADER */}
      <SiteHeader />

      {/* SCROLLABLE CONTENT (stays below header) */}
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* CONTENT */}
        <main className="flex-grow min-h-full max-w-7xl mx-auto px-6 py-16 w-full">

          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12">
            {title}
          </h1>

          {children}

        </main>


        {/* FOOTER */}
        <SimpleFooter />

      </div>

    </div>
  );
}


// ======================================================
// FOOTER (Unified using dynamic theme styling variables matching the standard look)
// ======================================================
function SimpleFooter() {

  return (
    <footer className="bg-[var(--bg-primary, #f4f4f4)] text-[var(--text-primary, #03045E)] py-8 px-6 mt-auto border-t border-current/10">

      <div className="max-w-7xl mx-auto text-center">

        <p className="font-bold text-lg mb-2">
          AbleWork
        </p>

        <p className="text-sm opacity-80">
          Building an inclusive workforce for everyone.
        </p>


        <div className="flex justify-center flex-wrap gap-5 mt-5 text-sm">

          <Link
            to="/"
            className="hover:underline opacity-90 hover:opacity-100"
          >
            Home
          </Link>

          <Link
            to="/about"
            className="hover:underline opacity-90 hover:opacity-100"
          >
            About Us
          </Link>

          <Link
            to="/policy"
            className="hover:underline opacity-90 hover:opacity-100"
          >
            Privacy Policy
          </Link>

          <Link
            to="/terms"
            className="hover:underline opacity-90 hover:opacity-100"
          >
            Terms of Service
          </Link>

          <Link
            to="/contact"
            className="hover:underline opacity-90 hover:opacity-100"
          >
            Contact Us
          </Link>

        </div>

      </div>

    </footer>
  );
}


// ======================================================
// FEATURE
// ======================================================
function Feature({ title, text }) {

  return (
    <div>

      <h3 className="font-bold text-lg mb-1">
        {title}
      </h3>

      <p className="text-sm opacity-80">
        {text}
      </p>

    </div>
  );
}


// ======================================================
// INFORMATION CARD
// ======================================================
function InfoCard({ title, text }) {

  return (
    <div className="bg-[var(--bg-secondary, #ffffff)] text-[var(--text-secondary, #03045E)] rounded-2xl shadow-lg p-7 border border-current/10">

      <h3 className="text-xl font-bold mb-3">
        {title}
      </h3>

      <p className="opacity-80 leading-6">
        {text}
      </p>

    </div>
  );
}