import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const requestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setStep(2);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Cannot connect to server." });
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
        body: JSON.stringify({ email, otpCode, newPassword })
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("Password successfully reset! You can now log in.");
        navigate('/login');
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Cannot connect to server." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f4f4] p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border-2 border-[#03045E]/10">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-[#03045E] mb-2">Reset Password</h2>
          <p className="text-sm font-bold text-[#03045E]/70">
            {step === 1 ? "Enter your email to receive a recovery code." : "Enter your recovery code and new password."}
          </p>
        </div>

        {message.text && (
          <div className={`p-3 mb-6 rounded-xl font-bold text-sm text-center border-2 ${message.type === 'success' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
            {message.text}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={requestOtp} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#03045E]">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="Enter your registered email"
                className="w-full p-3.5 border-2 border-[#03045E]/15 rounded-xl text-[#03045E] font-semibold focus:border-[#2C7FFF] outline-none transition" 
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-3.5 mt-2 bg-[#03045E] text-white font-black rounded-xl hover:bg-[#2C7FFF] transition disabled:opacity-50">
              {isLoading ? 'Sending Code...' : 'Send Recovery Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#03045E]">6-Digit Recovery Code</label>
              <input 
                type="text" 
                maxLength="6"
                value={otpCode} 
                onChange={(e) => setOtpCode(e.target.value)} 
                required 
                placeholder="000000"
                className="w-full p-3.5 border-2 border-[#03045E]/15 rounded-xl text-[#03045E] font-black tracking-widest text-center focus:border-[#2C7FFF] outline-none transition" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#03045E]">New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                placeholder="Enter new password"
                className="w-full p-3.5 border-2 border-[#03045E]/15 rounded-xl text-[#03045E] font-semibold focus:border-[#2C7FFF] outline-none transition" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#03045E]">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                placeholder="Confirm new password"
                className="w-full p-3.5 border-2 border-[#03045E]/15 rounded-xl text-[#03045E] font-semibold focus:border-[#2C7FFF] outline-none transition" 
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-3.5 mt-2 bg-[#2C7FFF] text-white font-black rounded-xl hover:bg-[#03045E] transition disabled:opacity-50">
              {isLoading ? 'Resetting...' : 'Save New Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-bold text-[#03045E]/70 hover:text-[#2C7FFF] transition">
            ← Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
}