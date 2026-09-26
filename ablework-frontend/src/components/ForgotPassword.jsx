import React, { useState, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';
import lightLogo from '../assets/LIGHT MODE.png';
import darkLogo from '../assets/DARK MODE.png';
import backgroundImg from '../assets/BG.png';

export default function ForgotPassword({ onClose }) {
  const { mode } = useContext(AccessibilityContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isAPlusPlus = mode === 'A++' || mode === 'Assist' || mode === 'a++' || mode === 'assist';
  const isAPlus = mode === 'A+' || mode === 'a+';
  const isAssist = isAPlusPlus;

  const titleSize = isAPlusPlus
    ? 'text-4xl sm:text-5xl font-bold'
    : isAPlus
      ? 'text-3xl sm:text-4xl font-bold'
      : 'text-2xl sm:text-3xl font-bold';

  const subtitleSize = isAPlusPlus
    ? 'text-lg sm:text-xl font-semibold'
    : isAPlus
      ? 'text-base sm:text-lg font-semibold'
      : 'text-sm sm:text-base font-semibold';

  const labelSize = isAPlusPlus
    ? 'text-xl font-bold'
    : isAPlus
      ? 'text-lg font-bold'
      : 'text-sm font-bold';

  const inputSize = isAPlusPlus
    ? 'p-6 text-2xl font-medium'
    : isAPlus
      ? 'p-5 text-xl font-medium'
      : 'p-3.5 text-base font-semibold';

  const buttonSize = isAPlusPlus
    ? 'py-6 px-8 text-2xl font-black'
    : isAPlus
      ? 'py-4 px-6 text-xl font-black'
      : 'py-3.5 px-6 text-base font-black';

  const requestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage({ type: 'error', text: "Please enter your email address." });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        data = { message: `Server responded with status ${res.status}. Please try again.` };
      }

      if (res.ok) {
        setEmail(cleanEmail);
        setMessage({ type: 'success', text: data.message || "Recovery code sent to your email." });
        setStep(2);
      } else {
        setMessage({ type: 'error', text: data.message || data.error || `Request failed (${res.status}). Please check your email and try again.` });
      }
    } catch (err) {
      console.error("Forgot password request failed:", err);
      setMessage({ type: 'error', text: "Cannot connect to server. Please make sure the backend is running." });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "Passwords do not match." });
      return;
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('http://localhost:5001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otpCode: otpCode.trim(), newPassword })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        data = { message: `Server responded with status ${res.status}. Please try again.` };
      }

      if (res.ok) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          if (onClose) onClose();
          else navigate('/login');
        }, 2500);
      } else {
        setMessage({ type: 'error', text: data.message || data.error || `Reset failed (${res.status}). Please try again.` });
      }
    } catch (err) {
      console.error("Reset password request failed:", err);
      setMessage({ type: 'error', text: "Cannot connect to server. Please make sure the backend is running." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (onClose) onClose();
    else navigate('/login');
  };

  return (
    <main
      className={`min-h-screen flex flex-col ${isContrast ? 'bg-black text-white' : 'bg-[#f4f4f4] text-[#03045E]'} overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
      role="main"
      aria-label="Forgot password page"
    >
      <header
        className={`w-full ${isContrast ? 'bg-black border-b border-[#2C7FFF]' : 'bg-[#f4f4f4] border-b border-[#03045E]/10'} fixed top-0 left-0 z-50`}
        role="banner"
      >
        <div className="w-full h-16 pl-4 pr-4 md:pr-8 flex items-center justify-between max-w-[1700px] mx-auto box-border">
          <div className="flex items-center gap-8">
            <div className="flex items-center flex-shrink-0 py-1">
              <img
                src={isContrast ? darkLogo : lightLogo}
                alt="AbleWork Logo"
                className="h-14 w-auto object-contain max-h-full"
              />
            </div>
            <nav className={`hidden md:flex items-center gap-6 text-[15px] font-medium ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
              <Link to="/" className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition`}>Home</Link>
              <Link to="/about" className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition`}>About Us</Link>
              <Link to="/policy" className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition`}>Policy</Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center">
            <button
              type="button"
              onClick={handleBack}
              className={`px-5 py-2 rounded-full text-sm font-bold border-2 transition ${
                isContrast
                  ? 'text-white border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]'
                  : 'text-[#03045E] border-[#03045E] hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF]'
              }`}
            >
              Back to Log In
            </button>
          </div>

          <button
            className={`md:hidden flex items-center justify-center w-10 h-10 rounded-lg ${isContrast ? 'bg-blue-400 text-black' : 'bg-[#2C7FFF] text-[#f4f4f4]'}`}
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
            isOpen ? `${isContrast ? 'bg-black border-b-2 border-[#2C7FFF]' : 'bg-[#f4f4f4] border-b border-[#03045E]/10'} max-h-96 opacity-100 shadow-lg` : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!isOpen}
        >
          <nav className={`flex flex-col px-6 py-5 gap-5 text-[16px] font-medium ${isContrast ? 'text-white' : 'text-[#03045E]'} max-w-[1700px] mx-auto`}>
            <Link to="/" onClick={() => setIsOpen(false)} className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition`}>Home</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition`}>About Us</Link>
            <Link to="/policy" onClick={() => setIsOpen(false)} className={`${isContrast ? 'hover:text-blue-400' : 'hover:text-[#2C7FFF]'} transition`}>Policy</Link>
            <button
              type="button"
              onClick={() => { setIsOpen(false); handleBack(); }}
              className={`mt-2 px-5 py-2.5 rounded-full text-sm font-bold border-2 transition w-fit ${
                isContrast
                  ? 'text-white border-white hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'
                  : 'text-[#03045E] border-[#03045E] hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF]'
              }`}
            >
              Back to Log In
            </button>
          </nav>
        </div>
      </header>

      <div
        className={`flex-grow pt-16 pb-12 flex flex-col items-center md:items-end justify-center pl-4 pr-4 md:pr-12 lg:pr-16 md:pl-8 max-w-[1700px] mx-auto w-full box-border relative bg-no-repeat bg-cover bg-center md:bg-[size:1100px_auto] md:bg-left min-h-[110vh] md:min-h-[105vh] transition-all duration-300 ${isOpen ? 'mt-48 sm:mt-56' : 'mt-0'}`}
        style={{ backgroundImage: `url(${backgroundImg})` }}
        role="region"
        aria-label="Forgot password form area"
      >
        <div
          className={`w-full ${isAssist ? 'max-w-[480px] sm:max-w-xl' : 'max-w-[420px] sm:max-w-lg'} flex flex-col items-center justify-start gap-6 relative z-10
            ${isContrast ? 'bg-black text-white border-2 border-blue-400 shadow-[0_0_25px_rgba(0,204,21,0.4)]' : isDarkMode ? 'bg-zinc-900 text-white border-2 border-blue-500/50 shadow-2xl' : 'bg-white/90 text-[#03045E] border border-[#03045E]/15'} backdrop-blur-md rounded-3xl shadow-2xl
            pt-10 px-6 pb-10 sm:pt-12 sm:px-10 sm:pb-14 md:mt-4 mr-0 md:mr-2 lg:mr-6`}
          role="region"
        >
          <div className="w-full flex items-center justify-start">
            <div className="flex items-center gap-2">
              <span className={`w-9 h-9 rounded-full flex items-center justify-center ${isContrast ? 'bg-blue-400 text-black' : isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-[#2C7FFF]/10 text-[#2C7FFF]'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <span className={`text-xs font-black uppercase tracking-widest ${(isContrast || isDarkMode) ? 'text-blue-400' : 'text-[#2C7FFF]'}`}>
                Account Recovery
              </span>
            </div>
          </div>

          <div className="text-center w-full">
            <h1 className={`${titleSize} ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'} tracking-tight mb-2`}>
              {step === 1 ? 'Reset Password' : 'Create New Password'}
            </h1>
            <p className={`${subtitleSize} ${(isContrast || isDarkMode) ? 'text-white/80' : 'text-[#03045E]/70'}`}>
              {step === 1
                ? 'Enter your email to receive a recovery code.'
                : 'Enter your recovery code and set a new password.'}
            </p>
          </div>

          <div className="w-full flex items-center justify-center gap-2">
            <span className={`h-1.5 rounded-full transition-all ${step >= 1 ? (isContrast ? 'bg-blue-400 w-10' : 'bg-[#2C7FFF] w-10') : (isContrast || isDarkMode) ? 'bg-zinc-700 w-6' : 'bg-gray-300 w-6'}`} />
            <span className={`h-1.5 rounded-full transition-all ${step >= 2 ? (isContrast ? 'bg-blue-400 w-10' : 'bg-[#2C7FFF] w-10') : (isContrast || isDarkMode) ? 'bg-zinc-700 w-6' : 'bg-gray-300 w-6'}`} />
          </div>

          {message.text && (
            <div
              role="alert"
              aria-live="assertive"
              className={`w-full p-3.5 rounded-xl font-bold text-sm text-center border-2 shadow-sm bg-white ${
                message.type === 'success'
                  ? 'text-green-600 border-green-500'
                  : 'text-red-600 border-red-500'
              }`}
            >
              {message.text}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={requestOtp} className="flex flex-col gap-5 w-full" autoComplete="off">
              <div className="flex flex-col gap-2">
                <label htmlFor="fpEmail" className={`${labelSize} ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]/40'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="fpEmail"
                    name="fpEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="off"
                    placeholder="Enter your registered email"
                    className={`w-full ${inputSize} pl-12 ${(isContrast || isDarkMode) ? 'border-2 border-blue-400 bg-zinc-800 text-white focus:border-blue-300' : 'border-2 border-[#03045E]/20 bg-white text-[#03045E] placeholder:text-[#03045E]/40 focus:border-[#2C7FFF]'} rounded-2xl focus:outline-none shadow-sm transition`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${buttonSize} ${(isContrast || isDarkMode) ? 'bg-blue-400 text-black hover:bg-blue-300 border border-blue-400' : 'bg-[#03045E] hover:bg-[#2C7FFF] text-white'} rounded-full shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2`}
              >
                {isLoading ? 'Sending Code...' : 'Send Recovery Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="flex flex-col gap-5 w-full" autoComplete="off">
              <input type="text" name="fakeusernameremembered" autoComplete="username" style={{ display: 'none' }} tabIndex={-1} />
              <input type="password" name="fakepasswordremembered" autoComplete="new-password" style={{ display: 'none' }} tabIndex={-1} />

              <div className="flex flex-col gap-2">
                <label htmlFor="fpOtp" className={`${labelSize} ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                  6-Digit Recovery Code
                </label>
                <input
                  id="fpOtp"
                  name="fpOtp"
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoComplete="off"
                  placeholder="000000"
                  className={`w-full ${inputSize} text-center tracking-[0.6em] ${(isContrast || isDarkMode) ? 'border-2 border-blue-400 bg-zinc-800 text-white focus:border-blue-300' : 'border-2 border-[#03045E]/20 bg-white text-[#03045E] placeholder:text-[#03045E]/30 focus:border-[#2C7FFF]'} rounded-2xl focus:outline-none shadow-sm transition font-black`}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="fpNewPass" className={`${labelSize} ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                  New Password
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]/40'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="fpNewPass"
                    name="fpNewPass"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    className={`w-full ${inputSize} pl-12 ${(isContrast || isDarkMode) ? 'border-2 border-blue-400 bg-zinc-800 text-white focus:border-blue-300' : 'border-2 border-[#03045E]/20 bg-white text-[#03045E] placeholder:text-[#03045E]/40 focus:border-[#2C7FFF]'} rounded-2xl focus:outline-none shadow-sm transition`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="fpConfirmPass" className={`${labelSize} ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]/40'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </span>
                  <input
                    id="fpConfirmPass"
                    name="fpConfirmPass"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    className={`w-full ${inputSize} pl-12 ${(isContrast || isDarkMode) ? 'border-2 border-blue-400 bg-zinc-800 text-white focus:border-blue-300' : 'border-2 border-[#03045E]/20 bg-white text-[#03045E] placeholder:text-[#03045E]/40 focus:border-[#2C7FFF]'} rounded-2xl focus:outline-none shadow-sm transition`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${buttonSize} ${(isContrast || isDarkMode) ? 'bg-blue-400 text-black hover:bg-blue-300 border border-blue-400' : 'bg-[#2C7FFF] hover:bg-[#03045E] text-white'} rounded-full shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2`}
              >
                {isLoading ? 'Resetting...' : 'Save New Password'}
              </button>
            </form>
          )}

          <div className="w-full flex items-center gap-3">
            <span className={`flex-1 h-px ${(isContrast || isDarkMode) ? 'bg-white/15' : 'bg-[#03045E]/10'}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${(isContrast || isDarkMode) ? 'text-white/50' : 'text-[#03045E]/40'}`}>or</span>
            <span className={`flex-1 h-px ${(isContrast || isDarkMode) ? 'bg-white/15' : 'bg-[#03045E]/10'}`} />
          </div>

          <button
            type="button"
            onClick={handleBack}
            className={`text-sm font-bold transition hover:underline ${(isContrast || isDarkMode) ? 'text-blue-300 hover:text-white' : 'text-[#2C7FFF] hover:text-[#03045E]'}`}
          >
            ← Back to Log In
          </button>
        </div>
      </div>

      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-[2px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.6)', filter: 'none' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <div
            className="relative w-full max-w-md rounded-[2rem] shadow-[0_25px_60px_rgba(3,4,94,0.35)] border-2 overflow-hidden transform animate-in zoom-in-95 duration-300"
            style={{
              backgroundColor: (isContrast || isDarkMode) ? '#000000' : 'var(--color-card, #ffffff)',
              borderColor: (isContrast || isDarkMode) ? '#ffffff' : 'var(--color-border, rgba(3,4,94,0.2))'
            }}
          >
            <div
              className="h-1.5 w-full"
              style={{ backgroundColor: (isContrast || isDarkMode) ? '#ffffff' : 'var(--color-primary, #2c7fff)' }}
            ></div>
            <div className="px-8 pt-8 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: (isContrast || isDarkMode) ? '#000000' : 'rgba(44,127,255,0.1)',
                    border: (isContrast || isDarkMode) ? '2px solid #ffffff' : 'none'
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: (isContrast || isDarkMode) ? '#000000' : '#2C7FFF',
                      border: (isContrast || isDarkMode) ? '2px solid #ffffff' : 'none'
                    }}
                  >
                    <svg
                      className="w-8 h-8"
                      style={{ color: '#ffffff' }}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div
                  className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2"
                  style={{
                    backgroundColor: (isContrast || isDarkMode) ? '#ffffff' : 'var(--color-primary, #03045E)',
                    borderColor: (isContrast || isDarkMode) ? '#000000' : 'var(--color-card, #ffffff)'
                  }}
                >
                  <span className={`text-xs font-black ${isContrast || isDarkMode ? 'text-black' : 'text-white'}`}>✓</span>
                </div>
              </div>

              <h2
                id="success-title"
                className="text-2xl font-black tracking-tight mb-2"
                style={{ color: (isContrast || isDarkMode) ? '#ffffff' : 'var(--color-text, #03045E)' }}
              >
                Password Reset!
              </h2>
              <p
                className="text-sm font-bold leading-relaxed mb-6 max-w-xs"
                style={{ color: (isContrast || isDarkMode) ? '#ffffff' : 'var(--color-text, #03045E)', opacity: (isContrast || isDarkMode) ? 0.9 : 0.75 }}
              >
                Your password has been successfully reset.
              </p>

              <div className="flex items-center gap-1.5" aria-label="Redirecting to login">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: (isContrast || isDarkMode) ? '#ffffff' : '#2C7FFF' }} />
                <span className="w-2 h-2 rounded-full animate-pulse [animation-delay:150ms]" style={{ backgroundColor: (isContrast || isDarkMode) ? '#ffffff' : '#2C7FFF' }} />
                <span className="w-2 h-2 rounded-full animate-pulse [animation-delay:300ms]" style={{ backgroundColor: (isContrast || isDarkMode) ? '#ffffff' : '#2C7FFF' }} />
              </div>
              <p
                className="text-xs font-semibold mt-3"
                style={{ color: (isContrast || isDarkMode) ? '#ffffff' : '#2C7FFF' }}
              >
                Taking you to Log In…
              </p>
            </div>
          </div>
        </div>
      )}

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