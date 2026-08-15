import React from 'react';
import { Link } from 'react-router-dom';


// ======================================================
// HOME PAGE
// ======================================================
export function Home() {
  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#03045E]">

      {/* HEADER */}
      <header className="bg-white border-b border-[#03045E]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <Link
            to="/"
            className="text-2xl font-extrabold"
          >
            AbleWork
          </Link>

          <nav className="hidden md:flex gap-6 font-medium">
            <Link to="/" className="text-[#2C7FFF]">
              Home
            </Link>

            <Link to="/about" className="hover:text-[#2C7FFF]">
              About Us
            </Link>

            <Link to="/policy" className="hover:text-[#2C7FFF]">
              Policy
            </Link>

            <Link to="/careers" className="hover:text-[#2C7FFF]">
              Careers
            </Link>

            <Link to="/login" className="hover:text-[#2C7FFF]">
              Log In
            </Link>
          </nav>

        </div>
      </header>


      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid md:grid-cols-2 gap-12 items-center">

          <div>

            <p className="text-[#2C7FFF] font-bold mb-3">
              WELCOME TO ABLEWORK
            </p>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Building an Inclusive Workforce for Everyone
            </h1>

            <p className="text-lg text-[#03045E]/70 leading-7 mb-8">
              AbleWork helps persons with disabilities find suitable
              employment opportunities based on their skills,
              qualifications, and location.
            </p>

            <div className="flex flex-wrap gap-4">

              <Link
                to="/register-select"
                className="bg-[#03045E] text-white px-7 py-3 rounded-full font-semibold hover:bg-[#2C7FFF] transition"
              >
                Get Started
              </Link>

              <Link
                to="/about"
                className="border-2 border-[#03045E] px-7 py-3 rounded-full font-semibold hover:bg-[#03045E] hover:text-white transition"
              >
                Learn More
              </Link>

            </div>

          </div>


          {/* RIGHT SIDE */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">

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
  );
}


// ======================================================
// ABOUT US PAGE
// ======================================================
export function About() {
  return (
    <PageLayout title="About Us">

      <div className="grid md:grid-cols-2 gap-8">

        <div className="bg-white rounded-3xl shadow-lg p-8">

          <h2 className="text-2xl font-bold mb-5">
            About AbleWork
          </h2>

          <p className="text-[#03045E]/70 leading-7">
            AbleWork is a web-based employment assistance system
            designed to help persons with disabilities find
            appropriate employment opportunities.
          </p>

          <p className="text-[#03045E]/70 leading-7 mt-5">
            The system connects applicants and employers while
            helping employers find qualified candidates based on
            skills, qualifications, and location.
          </p>

        </div>


        <div className="bg-white rounded-3xl shadow-lg p-8">

          <h2 className="text-2xl font-bold mb-5">
            What We Do
          </h2>

          <ul className="space-y-4 text-[#03045E]/70">

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

      <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 space-y-8">

        <section>
          <h2 className="text-2xl font-bold mb-3">
            Information We Collect
          </h2>

          <p className="text-[#03045E]/70 leading-7">
            AbleWork may collect information such as your name,
            email address, contact information, skills,
            qualifications, and employment information.
          </p>
        </section>


        <section>
          <h2 className="text-2xl font-bold mb-3">
            How We Use Your Information
          </h2>

          <p className="text-[#03045E]/70 leading-7">
            The information may be used to provide job matching,
            job applications, notifications, and communication
            between applicants and employers.
          </p>
        </section>


        <section>
          <h2 className="text-2xl font-bold mb-3">
            Data Protection
          </h2>

          <p className="text-[#03045E]/70 leading-7">
            AbleWork aims to protect user information and use
            collected information only for purposes related to
            the system.
          </p>
        </section>


        <section>
          <h2 className="text-2xl font-bold mb-3">
            User Privacy
          </h2>

          <p className="text-[#03045E]/70 leading-7">
            Users should provide accurate information and keep
            their account credentials secure.
          </p>
        </section>

      </div>

    </PageLayout>
  );
}


// ======================================================
// CAREERS PAGE
// ======================================================
export function Careers() {

  const jobs = [
    {
      title: "Web Developer",
      type: "Full Time",
      location: "Bacolod City"
    },

    {
      title: "UI/UX Designer",
      type: "Full Time",
      location: "Remote"
    },

    {
      title: "Data Entry Assistant",
      type: "Part Time",
      location: "Bacolod City"
    },

    {
      title: "Customer Support",
      type: "Full Time",
      location: "Remote"
    }
  ];


  return (
    <PageLayout title="Careers">

      <p className="text-center text-[#03045E]/70 mb-10">
        Explore employment opportunities available through AbleWork.
      </p>


      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        {jobs.map((job, index) => (

          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-6 hover:-translate-y-1 transition"
          >

            <div className="w-12 h-12 rounded-xl bg-[#2C7FFF]/10 flex items-center justify-center mb-5">
              <span className="text-[#2C7FFF] font-bold text-xl">
                J
              </span>
            </div>


            <h2 className="text-xl font-bold mb-3">
              {job.title}
            </h2>

            <p className="text-sm text-[#03045E]/60">
              {job.type}
            </p>

            <p className="text-sm text-[#03045E]/60 mb-5">
              {job.location}
            </p>


            <button
              type="button"
              className="w-full bg-[#03045E] text-white py-3 rounded-full font-semibold hover:bg-[#2C7FFF] transition"
            >
              View Job
            </button>

          </div>

        ))}

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

      <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 space-y-8">

        <section>

          <h2 className="text-2xl font-bold mb-3">
            1. Use of AbleWork
          </h2>

          <p className="text-[#03045E]/70 leading-7">
            Users should use AbleWork only for legitimate
            employment-related activities.
          </p>

        </section>


        <section>

          <h2 className="text-2xl font-bold mb-3">
            2. User Responsibilities
          </h2>

          <p className="text-[#03045E]/70 leading-7">
            Users are responsible for providing accurate
            information and keeping their account information
            secure.
          </p>

        </section>


        <section>

          <h2 className="text-2xl font-bold mb-3">
            3. Account Usage
          </h2>

          <p className="text-[#03045E]/70 leading-7">
            Accounts should not be used for fraudulent,
            harmful, or unauthorized activities.
          </p>

        </section>


        <section>

          <h2 className="text-2xl font-bold mb-3">
            4. Employment Information
          </h2>

          <p className="text-[#03045E]/70 leading-7">
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
        <div className="bg-white rounded-3xl shadow-lg p-8">

          <h2 className="text-2xl font-bold mb-6">
            Get in Touch
          </h2>


          <div className="space-y-6">

            <div>
              <h3 className="font-bold">
                Email
              </h3>

              <p className="text-[#03045E]/70">
                support@ablework.com
              </p>
            </div>


            <div>
              <h3 className="font-bold">
                Phone
              </h3>

              <p className="text-[#03045E]/70">
                +63 900 000 0000
              </p>
            </div>


            <div>
              <h3 className="font-bold">
                Address
              </h3>

              <p className="text-[#03045E]/70">
                Bacolod City, Philippines
              </p>
            </div>

          </div>

        </div>


        {/* CONTACT FORM */}
        <div className="bg-white rounded-3xl shadow-lg p-8">

          <h2 className="text-2xl font-bold mb-6">
            Send Us a Message
          </h2>


          <form className="space-y-4">

            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-3 border border-[#03045E]/20 rounded-xl focus:outline-none focus:border-[#2C7FFF]"
            />


            <input
              type="email"
              placeholder="Your Email"
              className="w-full p-3 border border-[#03045E]/20 rounded-xl focus:outline-none focus:border-[#2C7FFF]"
            />


            <textarea
              rows="5"
              placeholder="Your Message"
              className="w-full p-3 border border-[#03045E]/20 rounded-xl focus:outline-none focus:border-[#2C7FFF]"
            />


            <button
              type="button"
              className="w-full bg-[#03045E] text-white py-3 rounded-full font-semibold hover:bg-[#2C7FFF] transition"
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
    <div className="min-h-screen bg-[#f4f4f4] text-[#03045E]">

      {/* HEADER */}
      <header className="bg-white border-b border-[#03045E]/10">

        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">

          <Link
            to="/"
            className="text-2xl font-extrabold"
          >
            AbleWork
          </Link>


          <nav className="flex flex-wrap gap-5 text-sm font-medium">

            <Link
              to="/"
              className="hover:text-[#2C7FFF]"
            >
              Home
            </Link>

            <Link
              to="/about"
              className="hover:text-[#2C7FFF]"
            >
              About Us
            </Link>

            <Link
              to="/policy"
              className="hover:text-[#2C7FFF]"
            >
              Policy
            </Link>

            <Link
              to="/careers"
              className="hover:text-[#2C7FFF]"
            >
              Careers
            </Link>

            <Link
              to="/login"
              className="bg-[#2C7FFF] text-white px-5 py-2 rounded-full"
            >
              Log In
            </Link>

          </nav>

        </div>

      </header>


      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-16">

        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12">
          {title}
        </h1>

        {children}

      </main>


      {/* FOOTER */}
      <SimpleFooter />

    </div>
  );
}


// ======================================================
// FOOTER
// ======================================================
function SimpleFooter() {

  return (
    <footer className="bg-[#03045E] text-white py-8 px-6">

      <div className="max-w-7xl mx-auto text-center">

        <p className="font-bold text-lg mb-2">
          AbleWork
        </p>

        <p className="text-sm text-white/70">
          Building an inclusive workforce for everyone.
        </p>


        <div className="flex justify-center flex-wrap gap-5 mt-5 text-sm">

          <Link
            to="/"
            className="hover:text-[#2C7FFF]"
          >
            Home
          </Link>

          <Link
            to="/about"
            className="hover:text-[#2C7FFF]"
          >
            About Us
          </Link>

          <Link
            to="/policy"
            className="hover:text-[#2C7FFF]"
          >
            Privacy Policy
          </Link>

          <Link
            to="/terms"
            className="hover:text-[#2C7FFF]"
          >
            Terms of Service
          </Link>

          <Link
            to="/contact"
            className="hover:text-[#2C7FFF]"
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

      <p className="text-sm text-[#03045E]/70">
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
    <div className="bg-white rounded-2xl shadow-lg p-7">

      <h3 className="text-xl font-bold mb-3">
        {title}
      </h3>

      <p className="text-[#03045E]/70 leading-6">
        {text}
      </p>

    </div>
  );
}