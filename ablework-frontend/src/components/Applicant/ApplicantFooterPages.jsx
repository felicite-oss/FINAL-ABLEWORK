import React from 'react';

// ======================================================
// SHARED APPLICANT PAGE LAYOUT
// ======================================================
function ApplicantPageLayout({ title, subtitle, children, onBack }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Header Bar without Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#03045E]/10 shadow-[0_4px_20px_rgba(3,4,94,0.03)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#03045E] tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm font-semibold text-[#03045E] mt-1">{subtitle}</p>}
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-3xl border border-[#03045E]/10 shadow-[0_4px_20px_rgba(3,4,94,0.03)] p-6 sm:p-10 text-[#03045E]">
        {children}
      </div>
    </div>
  );
}

// ======================================================
// APPLICANT PRIVACY POLICY
// ======================================================
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

// ======================================================
// APPLICANT TERMS OF SERVICE
// ======================================================
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

// ======================================================
// APPLICANT CONTACT & SUPPORT
// ======================================================
export function ApplicantContact({ onBack }) {
  return (
    <ApplicantPageLayout
      title="Applicant Support"
      subtitle="Get assistance with your dashboard, applications, or profile"
      onBack={onBack}
    >
      <div className="grid md:grid-cols-2 gap-8">
        {/* Support Channels */}
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

        {/* Support Ticket Form */}
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
            className="w-full p-3.5 bg-[#f4f4f4] border border-[#03045E]/15 rounded-xl text-sm font-medium text-[#03045E] placeholder-[#f4f4f4]/50 focus:outline-none focus:border-[#2C7FFF]"
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

// ======================================================
// INTEGRATED APPLICANT FOOTER COMPONENT
// ======================================================
export function ApplicantFooter({ activeTab, setActiveTab }) {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-white border-t border-[#03045E]/10 py-8 sm:py-10 mt-auto z-10 relative">
      <div className="max-w-[1700px] mx-auto px-6 sm:px-8 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm sm:text-base font-semibold text-[#03045E] text-center md:text-left">
          &copy; {new Date().getFullYear()} AbleWork. All rights reserved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base font-semibold text-[#03045E]">
          {/* Footer Policy & Support Links */}
          <button
            onClick={() => handleTabClick('applicant-policy')}
            className={`hover:text-[#2C7FFF] transition-colors cursor-pointer ${activeTab === 'applicant-policy' ? 'text-[#2C7FFF] font-bold' : ''}`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => handleTabClick('applicant-terms')}
            className={`hover:text-[#2C7FFF] transition-colors cursor-pointer ${activeTab === 'applicant-terms' ? 'text-[#2C7FFF] font-bold' : ''}`}
          >
            Terms
          </button>
          <button
            onClick={() => handleTabClick('applicant-contact')}
            className={`hover:text-[#2C7FFF] transition-colors cursor-pointer ${activeTab === 'applicant-contact' ? 'text-[#2C7FFF] font-bold' : ''}`}
          >
            Help & Support
          </button>
        </div>
      </div>
    </footer>
  );
}