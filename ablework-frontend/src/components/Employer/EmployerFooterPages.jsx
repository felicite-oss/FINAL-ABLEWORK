import React, { useContext } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import FinalLogo from '../../assets/DARK MODE.png';


export function EmployerPolicy({ onBack }) {
  return (
    <div className="max-w-7xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-[#03045E]/10 shadow-sm animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#03045E]/10">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#03045E]">Employer Privacy Policy</h2>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-[#03045E]/5 text-[#03045E] hover:bg-[#2C7FFF] hover:text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
        >
          Back to Overview
        </button>
      </div>
      <div className="space-y-4 text-[#03045E]/80 text-xs sm:text-sm leading-relaxed">
        <p>Your privacy is paramount to AbleWork. This policy outlines how we handle corporate data, recruiter details, and applicant communication records securely and transparently.</p>
        <p>We utilize advanced encryption protocols to safeguard your company data and ensure compliance with standard data protection regulations.</p>
      </div>
    </div>
  );
}

export function EmployerTerms({ onBack }) {
  return (
    <div className="max-w-7xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-[#03045E]/10 shadow-sm animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#03045E]/10">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#03045E]">Employer Terms of Service</h2>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-[#03045E]/5 text-[#03045E] hover:bg-[#2C7FFF] hover:text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
        >
          Back to Overview
        </button>
      </div>
      <div className="space-y-4 text-[#03045E]/80 text-xs sm:text-sm leading-relaxed">
        <p>By posting jobs on AbleWork, employers agree to maintain fair, non-discriminatory hiring practices and provide accurate company profile details.</p>
        <p>Violation of community standards or discriminatory behavior against applicants may result in the suspension of corporate posting privileges.</p>
      </div>
    </div>
  );
}

export function EmployerContact({ onBack }) {
  return (
    <div className="max-w-7xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-[#03045E]/10 shadow-sm animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#03045E]/10">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#03045E]">Employer Support & Contact</h2>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-[#03045E]/5 text-[#03045E] hover:bg-[#2C7FFF] hover:text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
        >
          Back to Overview
        </button>
      </div>
      <div className="space-y-4 text-[#03045E]/80 text-xs sm:text-sm leading-relaxed">
        <p>Need assistance with your job listings or candidate screening? Our support team is here to help you.</p>
        <div className="p-4 bg-[#f4f4f4] rounded-2xl border border-[#03045E]/10 space-y-2 text-[#03045E]">
          <p><strong>Email Support:</strong> employers@ablework.com</p>
          <p><strong>Partner Helpline:</strong> +1 (800) 555-ABLE</p>
          <p><strong>Hours:</strong> Monday – Friday, 9:00 AM – 6:00 PM EST</p>
        </div>
      </div>
    </div>
  );
}

export function EmployerFooter({ activeTab, setActiveTab }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-white text-[#03045E] mt-auto z-10 relative border-t-2 border-[#03045E]/20">
      <div className="max-w-[1700px] mx-auto px-6 sm:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="h-14 flex items-center">
              <img
                src={FinalLogo}
                alt="AbleWork Logo"
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="text-sm font-semibold leading-relaxed text-[#03045E]/80">
              A web-based employment assistance system designed to connect persons with disabilities with suitable employment opportunities and help employers manage job vacancies and applications.
            </p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-[#2C7FFF]/20 text-[#2C7FFF] text-[11px] font-black uppercase tracking-wider border border-[#2C7FFF]/50">
                Inclusive Hiring Hub
              </span>
              <span className="px-3 py-1.5 rounded-full bg-[#03045E]/10 text-[#03045E] text-[11px] font-black uppercase tracking-wider border border-[#03045E]/30">
                Verified Partners
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#2C7FFF]">Fast Links</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => handleTabClick('employer-policy')} className="text-sm font-bold text-[#03045E]/80 hover:text-[#2C7FFF] transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('employer-terms')} className="text-sm font-bold text-[#03045E]/80 hover:text-[#2C7FFF] transition-colors cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('employer-contact')} className="text-sm font-bold text-[#03045E]/80 hover:text-[#2C7FFF] transition-colors cursor-pointer">
                  Help & Support
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#2C7FFF]">System Status</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm font-bold text-[#03045E]/80">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Platform Core: Online
              </li>
              <li className="flex items-center gap-2 text-sm font-bold text-[#03045E]/80">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Smart Matching: Active
              </li>
              <li className="flex items-center gap-2 text-sm font-bold text-[#03045E]/80">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                ABBY Assistant: Ready
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#2C7FFF]">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm font-bold text-[#03045E]/80">
                <svg className="w-4 h-4 text-[#2C7FFF] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-[#03045E]/80">
                <svg className="w-4 h-4 text-[#2C7FFF] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>ableworksys5i@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-[#03045E]/80">
                <svg className="w-4 h-4 text-[#2C7FFF] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+63 900 000 0000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#03045E]/30">
          <p className="text-xs font-bold text-[#03045E]/70">
            &copy; {new Date().getFullYear()} ABLEWORK Capstone Project. All rights reserved.
          </p>
          <button
            onClick={() => handleTabClick('employer-contact')}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#03045E] text-white font-black text-sm rounded-xl hover:bg-[#2C7FFF] transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Contact Support
          </button>
        </div>
      </div>
    </footer>
  );
}


function ApplicantPageLayout({ title, subtitle, children, onBack }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
     
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#03045E]/10 shadow-[0_4px_20px_rgba(3,4,94,0.03)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#03045E] tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm font-semibold text-[#03045E] mt-1">{subtitle}</p>}
        </div>
      </div>

     
      <div className="bg-white rounded-3xl border border-[#03045E]/10 shadow-[0_4px_20px_rgba(3,4,94,0.03)] p-6 sm:p-10 text-[#03045E]">
        {children}
      </div>
    </div>
  );
}


export function ApplicantPolicy({ onBack }) {
  return (
    <ApplicantPageLayout
      title="Privacy Policy"
      subtitle="How AbleWork protects and handles your candidate information"
      onBack={onBack}
    >
      <div className="space-y-8 text-sm sm:text-base leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-[#03045E] mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
            Information We Collect
          </h2>
          <p className="text-[#03045E] font-medium pl-4">
            AbleWork collects candidate data including your name, contact information, PWD identification details, work preferences, uploaded resume files, and job application history to provide accurate match scoring and application tracking.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#03045E] mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
            How Your Data is Used
          </h2>
          <p className="text-[#03045E] font-medium pl-4">
            Your profile details and accessibility requirements are shared only with verified employers when you apply for a job posting or when our Smart Match algorithm connects you with compatible workplace environments.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#03045E] mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
            Data Protection & Control
          </h2>
          <p className="text-[#03045E] font-medium pl-4">
            You can update your personal information, modify accessibility needs, or request account data deletion at any time directly through your Account Settings.
          </p>
        </section>
      </div>
    </ApplicantPageLayout>
  );
}


export function ApplicantTerms({ onBack }) {
  return (
    <ApplicantPageLayout
      title="Terms of Service"
      subtitle="Applicant usage agreement and community standards"
      onBack={onBack}
    >
      <div className="space-y-8 text-sm sm:text-base leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-[#03045E] mb-2">1. Applicant Profile Authenticity</h2>
          <p className="text-[#03045E] font-medium">
            Applicants must provide accurate personal, educational, and professional information when setting up their profile or applying for jobs on AbleWork.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#03045E] mb-2">2. Proper Platform Usage</h2>
          <p className="text-[#03045E] font-medium">
            The candidate dashboard is intended strictly for job searching, career matching, and direct communication with legitimate hiring organizations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#03045E] mb-2">3. Employer Communications</h2>
          <p className="text-[#03045E] font-medium">
            All interactions with employers should maintain professional standards. AbleWork reserves the right to suspend accounts engaging in fraudulent activities or harassment.
          </p>
        </section>
      </div>
    </ApplicantPageLayout>
  );
}


export function ApplicantContact({ onBack }) {
  return (
    <ApplicantPageLayout
      title="Applicant Support"
      subtitle="Get assistance with your dashboard, applications, or profile"
      onBack={onBack}
    >
      <div className="grid md:grid-cols-2 gap-8">
 
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#03045E]/5 border border-[#03045E]/10">
            <h3 className="font-bold text-[#03045E] mb-1">Email Support</h3>
            <p className="text-sm font-semibold text-[#03045E]">applicants@ablework.com</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#03045E]/5 border border-[#03045E]/10">
            <h3 className="font-bold text-[#03045E] mb-1">Helpdesk Phone</h3>
            <p className="text-sm font-semibold text-[#03045E]">+63 (034) 000-0000</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#03045E]/5 border border-[#03045E]/10">
            <h3 className="font-bold text-[#03045E] mb-1">Office Location</h3>
            <p className="text-sm font-semibold text-[#03045E]">Bacolod City, Western Visayas, Philippines</p>
          </div>
        </div>

   
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <h3 className="text-lg font-bold text-[#03045E]">Submit a Support Ticket</h3>
          <input
            type="text"
            placeholder="Subject / Issue Summary"
            className="w-full p-3.5 bg-[#f4f4f4] border border-[#03045E]/15 rounded-xl text-sm font-medium text-[#03045E] placeholder-[#03045E]/50 focus:outline-none focus:border-[#2C7FFF]"
          />
          <textarea
            rows="4"
            placeholder="Describe your issue or question..."
            className="w-full p-3.5 bg-[#f4f4f4] border border-[#03045E]/15 rounded-xl text-sm font-medium text-[#03045E] placeholder-[#03045E]/50 focus:outline-none focus:border-[#2C7FFF]"
          />
          <button
            type="submit"
            className="w-full py-3.5 bg-[#03045E] text-white font-bold text-sm rounded-xl hover:bg-[#2C7FFF] transition-colors cursor-pointer"
          >
            Submit Request
          </button>
        </form>
      </div>
    </ApplicantPageLayout>
  );
}


export function ApplicantFooter({ activeTab, setActiveTab }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-white text-[#03045E] mt-auto z-10 relative border-t-2 border-[#03045E]/20">
      <div className="max-w-[1700px] mx-auto px-6 sm:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="h-14 flex items-center">
              <img
                src={FinalLogo}
                alt="AbleWork Logo"
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="text-sm font-semibold leading-relaxed text-[#03045E]/80">
              A web-based employment assistance system designed to connect persons with disabilities with suitable employment opportunities and help employers manage job vacancies and applications.
            </p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-[#2C7FFF]/20 text-[#2C7FFF] text-[11px] font-black uppercase tracking-wider border border-[#2C7FFF]/50">
                Equal Opportunity
              </span>
              <span className="px-3 py-1.5 rounded-full bg-[#03045E]/10 text-[#03045E] text-[11px] font-black uppercase tracking-wider border border-[#03045E]/30">
                Smart Match
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#2C7FFF]">Fast Links</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => handleTabClick('applicant-policy')} className="text-sm font-bold text-[#03045E]/80 hover:text-[#2C7FFF] transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('applicant-terms')} className="text-sm font-bold text-[#03045E]/80 hover:text-[#2C7FFF] transition-colors cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('applicant-contact')} className="text-sm font-bold text-[#03045E]/80 hover:text-[#2C7FFF] transition-colors cursor-pointer">
                  Help & Support
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#2C7FFF]">System Status</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm font-bold text-[#03045E]/80">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Platform Core: Online
              </li>
              <li className="flex items-center gap-2 text-sm font-bold text-[#03045E]/80">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Smart Matching: Active
              </li>
              <li className="flex items-center gap-2 text-sm font-bold text-[#03045E]/80">
                <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                ABBY Assistant: Ready
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#2C7FFF]">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm font-bold text-[#03045E]/80">
                <svg className="w-4 h-4 text-[#2C7FFF] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-[#03045E]/80">
                <svg className="w-4 h-4 text-[#2C7FFF] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>ableworksys5i@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-[#03045E]/80">
                <svg className="w-4 h-4 text-[#2C7FFF] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+63 900 000 0000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#03045E]/30">
          <p className="text-xs font-bold text-[#03045E]/70">
            &copy; {new Date().getFullYear()} ABLEWORK Capstone Project. All rights reserved.
          </p>
          <button
            onClick={() => handleTabClick('applicant-contact')}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#03045E] text-white font-black text-sm rounded-xl hover:bg-[#2C7FFF] transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Contact Support
          </button>
        </div>
      </div>
    </footer>
  );
}