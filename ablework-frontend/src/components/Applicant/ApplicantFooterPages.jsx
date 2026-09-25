import React, { useContext } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';


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
  const sections = [
    {
      title: "Information We Collect",
      body: [
        "Personal Identifiers: full name, contact number, residential address, and email address.",
        "Sensitive Personal Information: birthdate, specific disability type or classification, required workplace accommodations, and uploaded government-issued PWD identification cards.",
        "Professional Credentials: educational background, skills, work preferences, and uploaded resumes or curriculum vitae.",
        "Location Data: approximate geographical coordinates (latitude and longitude) and user-defined travel radius preferences in kilometers.",
        "For Employers: company name, company description, industry classification, representative details, business email, contact number, and uploaded business registration documents such as DTI, SEC, or Mayor's Business Permit.",
        "Job Listing Data: job vacancies, job descriptions, required skills, guaranteed workplace accommodations, and accepted disability types.",
        "System and Technical Metadata: IP addresses, verification attempt logs, system security timestamps, accessibility settings, and in-app notification logs."
      ]
    },
    {
      title: "Legal Basis and Purpose of Processing",
      body: [
        "Authenticating user credentials using cryptographic hashing with bcrypt.",
        "Enforcing administrator document verification to maintain a verified, safe talent marketplace.",
        "Powering the automated, rule-based Smart Matching Engine that evaluates skill alignments, accommodation guarantees, and Haversine distance calculations.",
        "Enforcing system security protocols such as cooldown intervals and network rate-limiting against fraudulent submissions.",
        "Delivering transactional email notifications and One-Time Password verifications via automated SMTP services.",
        "Facilitating AI chatbot interactions through the ABBY assistant."
      ]
    },
    {
      title: "Processing of Sensitive Personal Information",
      body: [
        "Disability classifications and PWD ID documents are processed strictly to verify eligibility and ensure matched workplaces meet necessary physical and sensory accommodations.",
        "PWD IDs and business verification files are stored in restricted server storage directories and are accessible exclusively to authorized system administrators for audit and approval purposes.",
        "Disability-related details are never sold, rented, or made visible to third-party advertising networks."
      ]
    },
    {
      title: "Artificial Intelligence and Third-Party Service Providers",
      body: [
        "Google Gemini API powers the ABBY conversational assistant. Real-time account metadata such as application count and current verification standing is supplied contextually during active chat queries. No passwords, credentials, or official government documents are transmitted to the AI engine.",
        "Email Dispatch through Nodemailer and Google SMTP delivers automated system alerts, application updates, and security OTPs to user-registered email addresses.",
        "Mapping and Geolocation Services process device-derived or user-selected coordinates to calculate distance scores relative to employer workplaces."
      ]
    },
    {
      title: "Data Access, Disclosure, and Visibility",
      body: [
        "Between Users: when an applicant applies for an active job vacancy, their profile details such as name, contact number, resume, skills, and accommodation requests become accessible to that specific employer.",
        "Administrative Access: system administrators have role-restricted access to user directories, verification documents, and audit logs to approve accounts and manage operational integrity.",
        "Legal Compliance: we do not disclose personal information to external parties unless legally mandated by a valid subpoena, court order, or regulatory authority under Philippine jurisdiction."
      ]
    },
    {
      title: "Data Storage, Security, and Protection Measures",
      body: [
        "Cryptographic Protection: passwords are mathematically hashed with unique cryptographic salts using bcrypt before database storage.",
        "Header and Transport Security: HTTP security headers through Helmet and Cross-Origin Resource Sharing rules protect API communication channels.",
        "Access Segregation: verification documents and candidate resumes are isolated within designated upload directories linked only to validated database records."
      ]
    },
    {
      title: "Data Retention and Account Deletion",
      body: [
        "Personal data, application histories, and profile records are retained for the duration of the user's active participation on the platform.",
        "Account Deactivation: users may deactivate their profile, rendering their account and job listings inactive.",
        "Permanent Erasure: users retain the right to request permanent account deletion via system settings. Account deletion permanently purges user profile records, application submissions, and authentication data from the production database upon password re-verification."
      ]
    },
    {
      title: "User Rights under Republic Act No. 10173",
      body: [
        "Right to be Informed: the right to know how personal and sensitive data is gathered, stored, and utilized.",
        "Right to Access: the right to review registered data, job history, and application records.",
        "Right to Rectification: the right to update or correct inaccurate profile details and submit verification documents.",
        "Right to Erasure or Blocking: the right to deactivate or permanently delete account records.",
        "Right to Damages: the right to seek indemnification for damages sustained due to inaccurate, incomplete, outdated, false, or unlawfully obtained personal data."
      ]
    },
    {
      title: "Changes to This Privacy Policy",
      body: [
        "ABLEWORK reserves the right to revise this Privacy Policy to accommodate system improvements, algorithmic enhancements, or updates in legal statutes.",
        "Updates will be reflected directly on the platform with an updated effective date."
      ]
    },
    {
      title: "Contact Information and Inquiries",
      body: [
        "Platform: ABLEWORK Capstone Project.",
        "Data Custody Team and Proponents: Paquio, Loueala Jean H.; Pagado, Jesie Marie D.; Astodillo, Felicite S.; Gonzales, John Greg A.; Gamboa, John Bryan T.",
        "Institution: STIWNU.",
        "Official Support Email: ableworksys5i@gmail.com."
      ]
    }
  ];

  return (
    <ApplicantPageLayout
      title="Privacy Policy"
      subtitle="How ABLEWORK protects and handles your candidate information"
      onBack={onBack}
    >
      <div className="space-y-8 text-sm sm:text-base leading-relaxed">
        <div className="p-5 rounded-2xl bg-[#2C7FFF]/10 border border-[#2C7FFF]/30">
          <p className="text-xs font-extrabold text-[#2C7FFF] uppercase tracking-widest mb-2">Effective Date: Upon System Deployment</p>
          <p className="text-[#03045E] font-semibold">
            ABLEWORK is dedicated to safeguarding the privacy and data security of all users, specifically Persons with Disabilities and participating employers. This Privacy Policy outlines our practices regarding the collection, use, storage, and protection of personal data in compliance with Republic Act No. 10173, the Data Privacy Act of 2012 of the Philippines, and its Implementing Rules and Regulations.
          </p>
        </div>

        {sections.map((s, idx) => (
          <section key={idx}>
            <h2 className="text-lg font-bold text-[#03045E] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              {s.title}
            </h2>
            <ul className="space-y-2 pl-4">
              {s.body.map((line, i) => (
                <li key={i} className="text-[#03045E] font-medium flex gap-2">
                  <span className="text-[#2C7FFF] font-black shrink-0">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ApplicantPageLayout>
  );
}


export function ApplicantTerms({ onBack }) {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      body: [
        "By creating an account or using ABLEWORK, you confirm that you have read, understood, and agreed to these Terms and Conditions.",
        "These terms apply to all applicants, employers, and authorized administrators using the platform."
      ]
    },
    {
      title: "2. Eligibility and User Accounts",
      body: [
        "Applicants must provide accurate and truthful information during registration, including information relevant to their skills, qualifications, work preferences, and workplace accommodation needs.",
        "Employers must provide accurate company information and valid business or verification documents when required.",
        "Users are responsible for keeping their login credentials confidential.",
        "Each user should maintain only one account unless otherwise authorized by the system administrator.",
        "ABLEWORK reserves the right to suspend or disable accounts that contain false information, violate these terms, or pose a security risk."
      ]
    },
    {
      title: "3. Account Verification",
      body: [
        "Applicants must submit a valid PWD ID, and employers must submit valid business registration documents such as DTI, SEC, or Business Permit.",
        "Submitted documents must be authentic and belong to the account holder or registered organization.",
        "Administrators may review submitted documents before approving an account. An account may remain restricted or pending until verification is completed.",
        "In the event a verification document is rejected by an administrator, the account will be subject to a mandatory 7-day security cooldown before a new document can be submitted.",
        "The system actively monitors and limits repeated failed verification attempts to prevent abuse.",
        "Verification does not guarantee employment, hiring, or acceptance of any application."
      ]
    },
    {
      title: "4. Use of the System",
      body: [
        "Users agree to use ABLEWORK only for lawful employment-related purposes.",
        "Users must not submit false, misleading, or fraudulent information.",
        "Users must not post fake, discriminatory, or misleading job vacancies.",
        "Users must not use the system to harass, threaten, or discriminate against other users.",
        "Users must not access another person's account without permission.",
        "Users must not attempt to damage, disrupt, or gain unauthorized access to the system.",
        "Users must not upload harmful files, malicious code, or inappropriate content.",
        "Users must not collect or misuse another user's personal information."
      ]
    },
    {
      title: "5. Job Listings and Applications",
      body: [
        "Employers are responsible for ensuring that their job postings are accurate, complete, and up to date.",
        "Applicants are responsible for reviewing job requirements before submitting an application.",
        "ABLEWORK provides employment assistance and job-matching services but does not guarantee that an applicant will be hired.",
        "Employers are responsible for their own recruitment process, interviews, and final hiring decisions.",
        "ABLEWORK does not guarantee the availability, legitimacy, or continued existence of every job opportunity unless it has been specifically verified by the system or its administrators.",
        "Applicants should independently verify important employment details before accepting a job offer."
      ]
    },
    {
      title: "6. Job Matching and Recommendations",
      body: [
        "ABLEWORK provides job recommendations based on information such as user profiles, skills, qualifications, preferences, workplace requirements, and location.",
        "Recommendations are intended to assist users in finding potentially suitable opportunities but are not guarantees of employment or suitability.",
        "The matching algorithm strictly enforces specific requirements. If an employer cannot provide an applicant's required workplace accommodations, or if an applicant falls outside the employer's designated travel radius, the system will intentionally hide the job posting from that applicant to ensure safe and viable employment.",
        "Users should review the complete job description and determine whether the opportunity meets their needs.",
        "Location-based recommendations may depend on the accuracy of the location information provided or permitted by the user."
      ]
    },
    {
      title: "7. Accessibility Features",
      body: [
        "ABLEWORK may provide accessibility features such as display themes, font-size adjustments, and color-blindness support.",
        "These features are intended to improve usability but may not meet every user's individual accessibility needs.",
        "Users are encouraged to report accessibility problems so the system can be improved."
      ]
    },
    {
      title: "8. Chatbot and Automated Assistance",
      body: [
        "ABLEWORK includes ABBY, a chatbot that provides guidance and assistance during the job-search and application process.",
        "ABBY is powered by third-party Artificial Intelligence (Google Gemini). While the chatbot is configured to assist with platform navigation and job inquiries, AI-generated responses can occasionally be inaccurate.",
        "Users should not rely on ABBY for binding legal or employment agreements.",
        "Chatbot responses are intended for general assistance and may not always be accurate or complete. Users should verify important employment, account, and application information through the appropriate source.",
        "The chatbot does not make final hiring decisions.",
        "Users should not share passwords, payment information, or other unnecessary sensitive information through the chatbot."
      ]
    },
    {
      title: "9. Location Services",
      body: [
        "If enabled, ABLEWORK uses location-related information to provide nearby job recommendations and location-based services.",
        "Users may be asked to allow location access to utilize the Travel Radius feature, which filters job recommendations based on maximum geographical distance. This data is strictly used for the matching algorithm.",
        "Location-based features may not function accurately if location access is disabled or unavailable.",
        "Users should only enable location services when they are comfortable sharing the required location information."
      ]
    },
    {
      title: "10. Intellectual Property",
      body: [
        "The ABLEWORK name, system design, interface, content, and software components are owned by the project proponents or their respective rights holders, unless otherwise stated.",
        "Users may not copy, reproduce, modify, distribute, or commercially use the system or its materials without proper authorization."
      ]
    },
    {
      title: "11. System Availability and Limitations",
      body: [
        "ABLEWORK is provided as an employment assistance platform.",
        "The system may occasionally experience interruptions due to maintenance, technical issues, internet connectivity, or third-party services.",
        "The proponents do not guarantee that the system will always be available, error-free, or uninterrupted."
      ]
    },
    {
      title: "12. Account Suspension or Termination",
      body: [
        "ABLEWORK may suspend, restrict, or terminate an account if the user violates these Terms and Conditions.",
        "Provides false or fraudulent information.",
        "Misuses personal data or system features.",
        "Attempts unauthorized access.",
        "Engages in harmful, abusive, or unlawful activities.",
        "Users may contact the system administrator regarding account concerns or requests for account review."
      ]
    },
    {
      title: "13. Changes to These Terms",
      body: [
        "ABLEWORK may update these Terms and Conditions when necessary to improve the system, address security concerns, or comply with applicable regulations."
      ]
    },
    {
      title: "14. Contact Information",
      body: [
        "System Name: ABLEWORK.",
        "Project Team: 5i.",
        "Email: ableworksys5i@gmail.com.",
        "Address: Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines."
      ]
    }
  ];

  return (
    <ApplicantPageLayout
      title="Terms and Conditions"
      subtitle="Applicant usage agreement and community standards"
      onBack={onBack}
    >
      <div className="space-y-8 text-sm sm:text-base leading-relaxed">
        <div className="p-5 rounded-2xl bg-[#2C7FFF]/10 border border-[#2C7FFF]/30">
          <p className="text-xs font-extrabold text-[#2C7FFF] uppercase tracking-widest mb-2">Effective Date: Upon System Deployment</p>
          <p className="text-[#03045E] font-semibold">
            Welcome to ABLEWORK, a web-based employment assistance system designed to connect persons with disabilities with suitable employment opportunities and help employers manage job vacancies and applications. By accessing or using ABLEWORK, you agree to comply with these Terms and Conditions. If you do not agree with any part of these terms, please do not use the system.
          </p>
        </div>

        {sections.map((s, idx) => (
          <section key={idx}>
            <h2 className="text-lg font-bold text-[#03045E] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              {s.title}
            </h2>
            <ul className="space-y-2 pl-4">
              {s.body.map((line, i) => (
                <li key={i} className="text-[#03045E] font-medium flex gap-2">
                  <span className="text-[#2C7FFF] font-black shrink-0">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ApplicantPageLayout>
  );
}


export function ApplicantContact({ onBack }) {
  return (
    <ApplicantPageLayout
      title="Help and Support"
      subtitle="Get assistance with your dashboard, applications, or profile"
      onBack={onBack}
    >
      <div className="grid md:grid-cols-2 gap-8">

        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#03045E]/5 border border-[#03045E]/10">
            <h3 className="font-bold text-[#03045E] mb-1">System Name</h3>
            <p className="text-sm font-semibold text-[#03045E]">ABLEWORK</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#03045E]/5 border border-[#03045E]/10">
            <h3 className="font-bold text-[#03045E] mb-1">Project Team</h3>
            <p className="text-sm font-semibold text-[#03045E]">5i</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#03045E]/5 border border-[#03045E]/10">
            <h3 className="font-bold text-[#03045E] mb-1">Email Support</h3>
            <p className="text-sm font-semibold text-[#03045E]">ableworksys5i@gmail.com</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#03045E]/5 border border-[#03045E]/10">
            <h3 className="font-bold text-[#03045E] mb-1">Office Address</h3>
            <p className="text-sm font-semibold text-[#03045E]">Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#03045E]/5 border border-[#03045E]/10">
            <h3 className="font-bold text-[#03045E] mb-1">Data Custody Team</h3>
            <p className="text-sm font-semibold text-[#03045E] leading-relaxed">
              Paquio, Loueala Jean H.<br />
              Pagado, Jesie Marie D.<br />
              Astodillo, Felicite S.<br />
              Gonzales, John Greg A.<br />
              Gamboa, John Bryan T.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#03045E]/5 border border-[#03045E]/10">
            <h3 className="font-bold text-[#03045E] mb-1">Institution</h3>
            <p className="text-sm font-semibold text-[#03045E]">STIWNU</p>
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
            className="group w-full py-4 px-6 bg-[#03045E] text-[#f4f4f4] font-extrabold text-sm rounded-2xl border-2 border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF] hover:text-[#f4f4f4] transition-all duration-300 cursor-pointer shadow-md flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF] group-hover:bg-[#f4f4f4] transition-colors" />
              Submit Request Ticket
            </span>
            <span className="w-7 h-7 rounded-xl bg-[#2C7FFF]/20 group-hover:bg-[#f4f4f4]/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
        </form>
      </div>
    </ApplicantPageLayout>
  );
}


export function ApplicantFooter({ activeTab, setActiveTab, isContrast: propContrast }) {
  const { mode } = useContext(AccessibilityContext);
  const detectedContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isContrast = propContrast || detectedContrast;
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isDarkScreen = isContrast || isDarkMode;

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-white text-[#03045E] relative mt-auto pt-16 pb-8">
      <div className="max-w-[1700px] mx-auto px-6 sm:px-10">
        
        <div className="mb-14">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight"
          >
            Where abilities meet<br/>
            opportunity<span className="text-[#2c7fff]">.</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          <div>
            <h4 className="text-sm font-extrabold text-[#03045e] uppercase tracking-widest mb-6">Resources</h4>
            <ul className="space-y-4 text-sm font-semibold">
              <li><button onClick={() => handleTabClick('applicant-contact')} className="hover:text-[#2c7fff] transition-colors text-left">Help Center</button></li>
              <li><button onClick={() => handleTabClick('applicant-terms')} className="hover:text-[#2c7fff] transition-colors text-left">User Agreement</button></li>
              <li><button onClick={() => handleTabClick('applicant-policy')} className="hover:text-[#2c7fff] transition-colors text-left">Data Privacy</button></li>
              <li><button onClick={() => handleTabClick('settings')} className="hover:text-[#2c7fff] transition-colors text-left">Accessibility Options</button></li>
              <li><button onClick={() => handleTabClick('overview')} className="hover:text-[#2c7fff] transition-colors text-left">System Overview</button></li>
              <li><button onClick={() => handleTabClick('profile')} className="hover:text-[#2c7fff] transition-colors text-left">Manage Profile</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-[#03045e] uppercase tracking-widest mb-6">Discover</h4>
            <ul className="space-y-4 text-sm font-semibold">
              <li><button onClick={() => handleTabClick('overview')} className="hover:text-[#2c7fff] transition-colors text-left">Home</button></li>
              <li><button onClick={() => handleTabClick('profile')} className="hover:text-[#2c7fff] transition-colors text-left">Profile</button></li>
              <li><button onClick={() => handleTabClick('settings')} className="hover:text-[#2c7fff] transition-colors text-left">Settings</button></li>
              <li><button onClick={() => handleTabClick('applicant-terms')} className="hover:text-[#2c7fff] transition-colors text-left">Terms & Conditions</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-[#03045e] uppercase tracking-widest mb-6">Get in Touch</h4>
            <ul className="space-y-4 text-sm font-semibold">
              <li>+63 900 000 0000</li>
              <li>ableworksys5i@gmail.com</li>
              <li>Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</li>
              <li className="pt-2 text-[#2c7fff]">Project Team 5i</li>
              <li className="text-xs text-[#03045E]/80">Data Custody Team: Paquio, Pagado, Astodillo, Gonzales, Gamboa</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-[#03045e] uppercase tracking-widest mb-6">System Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#03045E]/5 border border-[#03045E]/10">
                <span className="text-xs font-bold text-[#03045E]">Platform Core</span>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-white bg-green-600 px-2 py-1 rounded-md uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#03045E]/5 border border-[#03045E]/10">
                <span className="text-xs font-bold text-[#03045E]">Smart Matching</span>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-white bg-green-600 px-2 py-1 rounded-md uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#03045E]/5 border border-[#03045E]/10">
                <span className="text-xs font-bold text-[#03045E]">ABBY Assistant</span>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-[#2C7FFF] bg-[#2C7FFF]/10 px-2 py-1 rounded-md uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2C7FFF] animate-pulse"></span>
                  Ready
                </span>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-2xl bg-[#03045E] text-[#f4f4f4] relative overflow-hidden">
              <div className="relative">
                <p className="text-[10px] font-black text-[#2c7fff] uppercase tracking-widest mb-1">Platform Uptime</p>
                <p className="text-2xl font-black leading-none mb-1">99.9%</p>
              </div>
            </div>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#03045E]/10 pt-6 text-xs font-bold text-[#03045E]">
          <p className="mb-2 sm:mb-0">© {new Date().getFullYear()} AbleWork Capstone Project</p>
          <p className="text-[#2c7fff]">Inclusive Employment Platform</p>
        </div>
      </div>

      <div className="absolute bottom-6 right-6">
        <button 
          onClick={() => handleTabClick('applicant-contact')}
          style={{ color: isDarkScreen ? '#000000' : '#ffffff' }}
          className="bg-[#03045e] px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#2c7fff] transition shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
          </svg>
          Help & Support
        </button>
      </div>
    </footer>
  );
}