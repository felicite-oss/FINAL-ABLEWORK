import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ApplicantAccountSettings({ profile }) {
  const navigate = useNavigate();
  const isRejected = profile?.verification_status === 'Rejected';
  const [openSection, setOpenSection] = useState(isRejected ? 'verification' : 'email');
  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const [email, setEmail] = useState(profile?.email || '');
  const [emailStep, setEmailStep] = useState(1); 
  const [emailOtp, setEmailOtp] = useState('');
  const [emailStatus, setEmailStatus] = useState({ type: '', msg: '' });
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStep, setPasswordStep] = useState(1); 
  const [passwordOtp, setPasswordOtp] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', msg: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isRequestingPassword, setIsRequestingPassword] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [passwordProcessing, setPasswordProcessing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [verificationDoc, setVerificationDoc] = useState(null);
  const [verStatus, setVerStatus] = useState({ type: '', msg: '' });
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [dangerStatus, setDangerStatus] = useState({ type: '', msg: '' });
  const [isDeactivated, setIsDeactivated] = useState(profile?.status === 'Deactivated' || profile?.account_status === 'Deactivated' || false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateStage, setDeactivateStage] = useState('confirm');
  const [deactivateTargetState, setDeactivateTargetState] = useState(false);

  let daysLeft = 0;
  let canResubmit = false;

  if (isRejected && profile?.rejection_timestamp) {
    const rejectDate = new Date(profile.rejection_timestamp);
    const today = new Date();
    const diffTime = Math.abs(today - rejectDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysLeft = 8 - diffDays;
    canResubmit = daysLeft <= 0;
  }

  const handleRequestEmailUpdate = async (e) => {
    e.preventDefault();
    if (email === profile?.email) {
      return setEmailStatus({ type: 'error', msg: 'Please enter a different email address.' });
    }
    
    setEmailStatus({ type: '', msg: '' });
    
    try {
      const response = await fetch(`http://localhost:5001/api/users/${profile.user_id}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, type: 'email' }) 
      });
      const data = await response.json();

      if (response.ok) {
        setEmailStatus({ type: 'success', msg: `A 6-digit verification code has been sent to ${email}.` });
        setEmailStep(2);
      } else {
        setEmailStatus({ type: 'error', msg: data.message });
      }
    } catch (error) {
      setEmailStatus({ type: 'error', msg: 'Failed to request code. Check server connection.' });
    }
  };

  const handleVerifyAndUpdateEmail = async (e) => {
    e.preventDefault();
    if (emailOtp.length < 6) {
      return setEmailStatus({ type: 'error', msg: 'Please enter a valid 6-digit code.' });
    }

    setEmailStatus({ type: '', msg: '' });
    setIsUpdatingEmail(true);

    try {
      const response = await fetch(`http://localhost:5001/api/applicant/${profile.user_id}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: emailOtp })
      });
      const data = await response.json();

      if (response.ok) {
        setEmailStatus({ type: 'success', msg: 'Email successfully verified and updated!' });
        setEmailStep(1);
        setEmailOtp('');
      } else {
        setEmailStatus({ type: 'error', msg: data.message || 'Invalid verification code.' });
      }
    } catch (error) {
      setEmailStatus({ type: 'error', msg: 'Server connection error.' });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleRequestPasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', msg: '' });

    if (newPassword !== confirmPassword) {
      return setPasswordStatus({ type: 'error', msg: 'New passwords do not match.' });
    }
    if (newPassword.length < 6) {
      return setPasswordStatus({ type: 'error', msg: 'Password must be at least 6 characters long.' });
    }

    setIsRequestingPassword(true);
    const minLoad = new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const [response] = await Promise.all([
        fetch(`http://localhost:5001/api/users/${profile.user_id}/request-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: profile?.email, type: 'password' }) 
        }),
        minLoad
      ]);
      const data = await response.json();

      if (response.ok) {
        setPasswordStatus({ type: 'success', msg: `A 6-digit verification code has been sent to your email.` });
        setPasswordStep(2);
      } else {
        setPasswordStatus({ type: 'error', msg: data.message });
      }
    } catch (error) {
      setPasswordStatus({ type: 'error', msg: 'Failed to request code. Check server connection.' });
    } finally {
      setIsRequestingPassword(false);
    }
  };

  const handleVerifyAndUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordOtp.length < 6) {
      return setPasswordStatus({ type: 'error', msg: 'Please enter a valid 6-digit code.' });
    }

    setPasswordStatus({ type: '', msg: '' });
    setIsUpdatingPassword(true);

    try {
      const response = await fetch(`http://localhost:5001/api/applicant/${profile.user_id}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, otp: passwordOtp })
      });
      const data = await response.json();

      if (response.ok) {
        setPasswordStatus({ type: 'success', msg: data.message || 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStep(1);
        setPasswordOtp('');

        setShowPasswordSuccess(true);
        setPasswordProcessing(true);
        setTimeout(() => {
          setPasswordProcessing(false);
        }, 2000);
      } else {
        setPasswordStatus({ type: 'error', msg: data.message || 'Invalid verification code.' });
      }
    } catch (error) {
      setPasswordStatus({ type: 'error', msg: 'Server connection error.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleResubmitVerification = async (e) => {
    e.preventDefault();
    if (!verificationDoc) return setVerStatus({ type: 'error', msg: 'Please select a file first.' });

    setIsResubmitting(true);
    setVerStatus({ type: '', msg: '' });

    const formData = new FormData();
    formData.append('document', verificationDoc);

    try {
      const response = await fetch(`http://localhost:5001/api/users/${profile.user_id}/resubmit`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (response.ok) {
        setVerStatus({ type: 'success', msg: data.message });
        setTimeout(() => window.location.reload(), 2000); 
      } else {
        setVerStatus({ type: 'error', msg: data.message });
      }
    } catch (error) {
      setVerStatus({ type: 'error', msg: 'Server connection error.' });
    } finally {
      setIsResubmitting(false);
    }
  };

  const handleToggleDeactivation = () => {
    setDeactivateTargetState(!isDeactivated);
    setDeactivateStage('confirm');
    setShowDeactivateModal(true);
  };

  const confirmToggleDeactivation = async () => {
    const actionText = deactivateTargetState ? 'reactivate' : 'deactivate';
    setDeactivateStage('processing');

    try {
      const [res] = await Promise.all([
        fetch(`http://localhost:5001/api/users/${profile.user_id}/toggle-status`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: deactivateTargetState ? 'activate' : 'deactivate' })
        }),
        new Promise((resolve) => setTimeout(resolve, 2000))
      ]);
      
      if (res.ok) {
        setIsDeactivated(deactivateTargetState);
        setDeactivateStage('success');
      } else {
        setDeactivateStage('error');
      }
    } catch (error) {
      setDeactivateStage('error');
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setDangerStatus({ type: '', msg: '' });

    try {
      const res = await fetch(`http://localhost:5001/api/users/${profile.user_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword })
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem('user');
        navigate('/');
      } else {
        setDangerStatus({ type: 'error', msg: data.message });
      }
    } catch (error) {
      setDangerStatus({ type: 'error', msg: 'Failed to delete account.' });
    }
  };

  const ChevronIcon = ({ isOpen }) => (
    <svg className={`w-5 h-5 text-[#03045E]/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
  );

  return (
    <div className="animate-fadeIn w-full space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#03045E]">
            Account Settings
          </h2>
          <p className="text-[#03045E] mt-1.5 text-sm sm:text-base font-semibold">
            Manage your security credentials and verification documents.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:gap-8">
        
        <div className={`bg-white rounded-[2rem] border shadow-md overflow-hidden transition-all duration-300 ${openSection === 'verification' ? 'border-[#2C7FFF]/40' : 'border-[#03045E]/20 hover:border-[#2C7FFF]/30'}`}>
          <button onClick={() => toggleSection('verification')} className="w-full p-6 sm:p-8 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="text-left">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#03045E]">Verification Status</h2>
              <p className="text-xs sm:text-sm text-[#03045e]/90 mt-1 font-semibold">Check your standing and manage your uploaded PWD ID.</p>
            </div>
            <ChevronIcon isOpen={openSection === 'verification'} />
          </button>
          
          {openSection === 'verification' && (
            <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-[#03045E]/10 pt-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-1">
                  <p className="text-xs font-extrabold text-[#2c7fff]/60 uppercase tracking-widest mb-2">Current Standing</p>
                  {profile?.verification_status === 'Approved' && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#f4f4f4] text-[#03045E] font-extrabold text-sm rounded-xl border border-[#03045E]/20">
                      <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Approved
                    </span>
                  )}
                  {profile?.verification_status === 'Pending' && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#2C7FFF]/10 text-[#2C7FFF] font-extrabold text-sm rounded-xl border border-[#2C7FFF]/30">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Pending Review
                    </span>
                  )}
                  {isRejected && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#f4f4f4] text-[#03045E] font-extrabold text-sm rounded-xl border border-[#03045E]/25">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Action Required
                    </span>
                  )}
                  
                  <div className="mt-4">
                    <a
                      href={`http://localhost:5001/${profile?.pwd_document_path?.replace(/\\/g, '/')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#2C7FFF] hover:underline"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      View Document on File
                    </a>
                  </div>
                </div>

                {isRejected && (
                  <div className="flex-1 bg-[#f4f4f4] p-5 rounded-[1.5rem] border border-[#03045E]/15 w-full">
                    <h3 className="text-sm font-extrabold text-[#03045E] mb-2">Re-verify Account</h3>
                    <p className="text-xs text-[#03045E]/70 mb-4 font-semibold">
                      {canResubmit ? "Your cooldown has expired. Please upload a clear, valid PWD ID." : `Security lock active. You can upload a new document in ${daysLeft} days.`}
                    </p>
                    
                    {verStatus.msg && (
                      <div className={`p-3 text-xs font-bold rounded-xl mb-4 border ${verStatus.type === 'error' ? 'bg-white text-[#03045E] border-[#03045E]/20' : 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30'}`}>{verStatus.msg}</div>
                    )}

                    <form onSubmit={handleResubmitVerification} className="flex flex-col gap-3">
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" disabled={!canResubmit || isResubmitting} onChange={(e) => setVerificationDoc(e.target.files[0])} className="text-xs text-[#03045E] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#03045E] file:text-white hover:file:bg-[#2C7FFF] disabled:opacity-50 cursor-pointer" />
                      {canResubmit && (
                        <button type="submit" disabled={isResubmitting || !verificationDoc} className="mt-2 py-2.5 bg-[#03045E] hover:bg-[#2C7FFF] text-white font-extrabold text-sm rounded-xl transition disabled:opacity-50 shadow-sm cursor-pointer">
                          {isResubmitting ? 'Uploading...' : 'Submit New Document'}
                        </button>
                      )}
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={`bg-white rounded-[2rem] border shadow-md overflow-hidden transition-all duration-300 ${openSection === 'email' ? 'border-[#2C7FFF]/40' : 'border-[#03045E]/20 hover:border-[#2C7FFF]/30'}`}>
          <button onClick={() => toggleSection('email')} className="w-full p-6 sm:p-8 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="text-left">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#03045E]">Email Address</h2>
              <p className="text-xs sm:text-sm text-[#03045E]/90 mt-1 font-semibold">Update your login email with OTP verification.</p>
            </div>
            <ChevronIcon isOpen={openSection === 'email'} />
          </button>

          {openSection === 'email' && (
            <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-[#03045E]/10 pt-6 animate-fadeIn">
              
              {emailStatus.msg && (
                <div className={`p-4 mb-6 rounded-xl text-sm font-bold border ${emailStatus.type === 'error' ? 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20' : 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30'}`}>
                  {emailStatus.msg}
                </div>
              )}

              {emailStep === 1 ? (
                <form onSubmit={handleRequestEmailUpdate} className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter new email address" className="w-full p-3.5 border border-[#03045E]/20 rounded-xl bg-[#f4f4f4] focus:border-[#2C7FFF] focus:bg-white outline-none transition font-medium text-[#03045E]" />
                  </div>
                  <button type="submit" disabled={email === profile?.email} className="w-full sm:w-auto px-6 py-3.5 bg-[#f4f4f4] border border-[#03045E]/20 text-[#03045E] font-extrabold rounded-xl shadow-sm hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF] transition disabled:opacity-50 cursor-pointer">
                    Send Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndUpdateEmail} className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-extrabold text-[#03045E]/60 uppercase tracking-widest mb-1.5 block">New Email</label>
                      <input type="email" value={email} disabled className="w-full p-3.5 bg-[#f4f4f4] border border-[#03045E]/15 rounded-xl text-[#03045E]/50 outline-none cursor-not-allowed font-medium" />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="text-xs font-extrabold text-[#03045E]/60 uppercase tracking-widest mb-1.5 block">Verification Code</label>
                      <input type="text" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} required placeholder="6-digit code" maxLength="6" className="w-full p-3.5 border border-[#03045E]/20 rounded-xl bg-[#f4f4f4] focus:border-[#2C7FFF] focus:bg-white outline-none transition tracking-widest font-mono text-[#03045E]" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => { setEmailStep(1); setEmailStatus({type:'', msg:''}); }} className="px-6 py-3.5 bg-[#f4f4f4] border border-[#03045E]/15 text-[#03045E] font-extrabold rounded-xl hover:bg-white transition cursor-pointer">Cancel</button>
                    <button type="submit" disabled={isUpdatingEmail || emailOtp.length < 6} className="px-6 py-3.5 bg-[#03045E] text-white font-extrabold rounded-xl shadow-md hover:bg-[#2C7FFF] transition disabled:opacity-50 cursor-pointer w-full sm:w-auto">
                      {isUpdatingEmail ? 'Verifying...' : 'Verify & Update Email'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className={`bg-white rounded-[2rem] border shadow-md overflow-hidden transition-all duration-300 ${openSection === 'password' ? 'border-[#2C7FFF]/40' : 'border-[#03045E]/20 hover:border-[#2C7FFF]/30'}`}>
          <button onClick={() => toggleSection('password')} className="w-full p-6 sm:p-8 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="text-left">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#03045E]">Change Password</h2>
              <p className="text-xs sm:text-sm text-[#03045E]/90 mt-1 font-semibold">Update your account password securely.</p>
            </div>
            <ChevronIcon isOpen={openSection === 'password'} />
          </button>

          {openSection === 'password' && (
            <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-[#03045E]/10 pt-6 animate-fadeIn">
              
              {passwordStatus.msg && (
                <div className={`p-4 mb-6 rounded-xl text-sm font-bold border ${passwordStatus.type === 'error' ? 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20' : 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30'}`}>
                  {passwordStatus.msg}
                </div>
              )}

              {passwordStep === 1 ? (
                <form onSubmit={handleRequestPasswordUpdate} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5 w-full sm:max-w-md">
                    <label className="text-xs font-extrabold text-[#2C7FFF]/60 uppercase tracking-widest">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showCurrentPassword ? "text" : "password"} 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                        required 
                        disabled={isRequestingPassword} 
                        className="w-full p-3.5 pr-12 border border-[#03045E]/20 rounded-xl bg-[#f4f4f4] focus:border-[#2C7FFF] focus:bg-white outline-none transition font-medium text-[#03045E] disabled:opacity-60" 
                      />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#03045E]/50 hover:text-[#2C7FFF] transition cursor-pointer">
                        {showCurrentPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5 w-full">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-xs font-extrabold text-[#2C7FFF]/60 uppercase tracking-widest">New Password</label>
                      <div className="relative">
                        <input 
                          type={showNewPassword ? "text" : "password"} 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)} 
                          required 
                          disabled={isRequestingPassword} 
                          className="w-full p-3.5 pr-12 border border-[#03045E]/20 rounded-xl bg-[#f4f4f4] focus:border-[#2C7FFF] focus:bg-white outline-none transition font-medium text-[#03045E] disabled:opacity-60" 
                        />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#03045E]/50 hover:text-[#2C7FFF] transition cursor-pointer">
                          {showNewPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-xs font-extrabold text-[#2C7FFF]/60 uppercase tracking-widest">Confirm New Password</label>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          required 
                          disabled={isRequestingPassword} 
                          className="w-full p-3.5 pr-12 border border-[#03045E]/20 rounded-xl bg-[#f4f4f4] focus:border-[#2C7FFF] focus:bg-white outline-none transition font-medium text-[#03045E] disabled:opacity-60" 
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#03045E]/50 hover:text-[#2C7FFF] transition cursor-pointer">
                          {showConfirmPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isRequestingPassword}
                    className="mt-2 w-full sm:max-w-md px-6 py-3.5 bg-[#03045E] text-white font-extrabold rounded-xl shadow-md hover:bg-[#2C7FFF] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isRequestingPassword ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending code...
                      </>
                    ) : (
                      'Request Password Change'
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndUpdatePassword} className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-extrabold text-[#03045E]/60 uppercase tracking-widest mb-1.5 block">Verification Code</label>
                      <input type="text" value={passwordOtp} onChange={(e) => setPasswordOtp(e.target.value)} required placeholder="6-digit code sent to email" maxLength="6" className="w-full p-3.5 border border-[#03045E]/20 rounded-xl bg-[#f4f4f4] focus:border-[#2C7FFF] focus:bg-white outline-none transition tracking-widest font-mono text-[#03045E]" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => { setPasswordStep(1); setPasswordStatus({type:'', msg:''}); }} className="px-6 py-3.5 bg-[#f4f4f4] border border-[#03045E]/15 text-[#03045E] font-extrabold rounded-xl hover:bg-white transition cursor-pointer">Cancel</button>
                    <button type="submit" disabled={isUpdatingPassword || passwordOtp.length < 6} className="px-6 py-3.5 bg-[#03045E] text-white font-extrabold rounded-xl shadow-md hover:bg-[#2C7FFF] transition disabled:opacity-50 cursor-pointer w-full sm:w-auto">
                      {isUpdatingPassword ? 'Verifying...' : 'Verify & Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className={`bg-white rounded-[2rem] border shadow-md overflow-hidden transition-all duration-300 ${openSection === 'danger' ? 'border-[#03045E]/40' : 'border-[#03045E]/20 hover:border-[#03045E]/30'}`}>
          <button onClick={() => toggleSection('danger')} className="w-full p-6 sm:p-8 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="text-left">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#ff0000]">Danger Zone</h2>
              <p className="text-xs sm:text-sm text-[#ff0000]/90 mt-1 font-semibold">Deactivate or permanently delete your account.</p>
            </div>
            <ChevronIcon isOpen={openSection === 'danger'} />
          </button>

          {openSection === 'danger' && (
            <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-[#03045E]/10 pt-6 animate-fadeIn">
              
              <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center p-5 rounded-[1.5rem] bg-[#f4f4f4] border border-[#03045E]/15">
                <div>
                  <h3 className="text-sm font-extrabold text-[#2c7fff]">
                    {isDeactivated ? 'Account is Currently Deactivated' : 'Deactivate Account'}
                  </h3>
                  <p className="text-xs mt-1 font-semibold text-[#2c7fff]/70">
                    {isDeactivated 
                      ? 'Your profile is hidden from employers. Reactivate to resume your job search.' 
                      : 'Temporarily hide your profile and applications. You can reactivate later.'}
                  </p>
                </div>
                <button 
                  onClick={handleToggleDeactivation} 
                  className={`px-6 py-2.5 font-extrabold rounded-xl transition whitespace-nowrap cursor-pointer ${
                    isDeactivated 
                      ? 'bg-[#2C7FFF] text-white hover:bg-[#03045E] shadow-sm' 
                      : 'bg-white border-2 border-[#03045E]/25 text-[#03045E] hover:bg-[#03045E] hover:text-white'
                  }`}
                >
                  {isDeactivated ? 'Reactivate Account' : 'Deactivate Account'}
                </button>
              </div>

              <div className="h-px bg-[#03045E]/10 my-6"></div>

              <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                  <h3 className="text-sm font-extrabold text-[#03045E]">Delete Account</h3>
                  <p className="text-xs text-[#03045E]/70 mt-1 font-semibold">Permanently erase your data. This action cannot be undone.</p>
                </div>
                <button onClick={() => setShowDeleteModal(true)} className="px-6 py-2.5 bg-[#03045E] text-white font-extrabold rounded-xl hover:bg-[#2C7FFF] shadow-sm transition whitespace-nowrap cursor-pointer">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#03045E]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 sm:p-8 shadow-2xl border border-[#03045E]/10 flex flex-col gap-4 animate-fadeIn">
            <h3 className="text-xl font-extrabold text-[#03045E]">Confirm Deletion</h3>
            <p className="text-sm font-medium text-[#03045E]/70">This will permanently delete your account, documents, and application history. Please enter your password to confirm.</p>
            
            {dangerStatus.msg && (
              <div className="p-3 bg-[#f4f4f4] border border-[#03045E]/20 text-[#03045E] text-sm font-bold rounded-xl">{dangerStatus.msg}</div>
            )}

            <form onSubmit={handleDelete} className="flex flex-col gap-4 mt-2">
              <div className="relative">
                <input 
                  type={showDeletePassword ? "text" : "password"} 
                  value={deletePassword} 
                  onChange={(e) => setDeletePassword(e.target.value)} 
                  required 
                  placeholder="Enter password" 
                  className="w-full p-3.5 pr-12 border border-[#03045E]/20 rounded-xl bg-[#f4f4f4] focus:border-[#2C7FFF] focus:bg-white outline-none transition text-[#03045E] font-medium" 
                />
                <button type="button" onClick={() => setShowDeletePassword(!showDeletePassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#03045E]/50 hover:text-[#2C7FFF] transition cursor-pointer">
                  {showDeletePassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                  )}
                </button>
              </div>
              
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 py-3.5 bg-[#f4f4f4] border border-[#03045E]/15 text-[#03045E] font-extrabold rounded-xl hover:bg-white transition cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-[#03045E] text-white font-extrabold rounded-xl shadow-md hover:bg-[#2C7FFF] transition cursor-pointer">Confirm Delete</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#03045E]/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#f4f4f4] rounded-[2rem] shadow-2xl border-2 border-[#2C7FFF] overflow-hidden animate-fadeIn">
            <div className="h-2 w-full bg-gradient-to-r from-[#03045E] via-[#2C7FFF] to-[#03045E]" />

            {passwordProcessing ? (
              <div className="px-8 py-12 flex flex-col items-center text-center">
                <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-[#2C7FFF]/25 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#2C7FFF] border-r-transparent border-b-[#03045E] border-l-transparent animate-spin" />
                  <div className="w-8 h-8 rounded-full bg-[#03045E] shadow-lg animate-ping opacity-70 absolute" />
                </div>
                <h2 className="text-xl font-black text-[#03045E] tracking-tight mb-1.5">
                  Verifying Password
                </h2>
                <p className="text-xs font-bold text-[#03045E]/70">
                  Please wait while we secure your account...
                </p>
                <div className="flex items-center gap-1.5 mt-5">
                  <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-[#2C7FFF]/20 animate-ping" />
                  <div className="relative w-20 h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#2C7FFF] flex items-center justify-center shadow-lg shadow-[#2C7FFF]/40">
                      <svg className="w-8 h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#03045E] flex items-center justify-center border-2 border-[#f4f4f4]">
                    <svg className="w-3.5 h-3.5 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-[#2C7FFF]/15 text-[#2C7FFF] text-[10px] font-black uppercase tracking-widest mb-3">
                  Security Update
                </span>

                <h2 className="text-2xl font-black text-[#03045E] tracking-tight mb-2">
                  Password Updated!
                </h2>
                <p className="text-sm font-semibold text-[#2c7fff]/75 leading-relaxed mb-6 max-w-xs">
                  Your new password has been saved securely. Use it the next time you log in.
                </p>

                <button
                  onClick={() => setShowPasswordSuccess(false)}
                  className="w-full py-3.5 rounded-2xl bg-[#03045E] text-[#f4f4f4] font-black text-sm uppercase tracking-wider shadow-md hover:bg-[#2C7FFF] hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-[#03045E] hover:border-[#2C7FFF]"
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showDeactivateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#03045E]/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#f4f4f4] rounded-[2rem] shadow-2xl border-2 border-[#2C7FFF] overflow-hidden animate-fadeIn">
            <div className="h-2 w-full bg-gradient-to-r from-[#03045E] via-[#2C7FFF] to-[#03045E]" />

            {deactivateStage === 'confirm' && (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="relative w-20 h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#03045E] flex items-center justify-center shadow-lg shadow-[#03045E]/40">
                      {deactivateTargetState ? (
                        <svg className="w-7 h-7 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-7 h-7 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-[#2C7FFF]/15 text-[#2C7FFF] text-[10px] font-black uppercase tracking-widest mb-3">
                  {deactivateTargetState ? 'Confirm Reactivation' : 'Confirm Deactivation'}
                </span>

                <h2 className="text-2xl font-black text-[#03045E] tracking-tight mb-2">
                  {deactivateTargetState ? 'Reactivate Account?' : 'Deactivate Account?'}
                </h2>
                <p className="text-sm font-semibold text-[#2c7fff]/75 leading-relaxed mb-6 max-w-xs">
                  {deactivateTargetState
                    ? 'Your profile will be visible to employers again and you can resume applying for jobs.'
                    : 'Your profile and applications will be temporarily hidden. You can reactivate anytime by logging back in.'}
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowDeactivateModal(false)}
                    className="flex-1 py-3.5 rounded-2xl bg-[#f4f4f4] text-[#03045E] font-black text-sm uppercase tracking-wider border-2 border-[#03045E] hover:bg-[#03045E] hover:text-[#f4f4f4] transition-all duration-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmToggleDeactivation}
                    className="flex-1 py-3.5 rounded-2xl bg-[#2C7FFF] text-[#f4f4f4] font-black text-sm uppercase tracking-wider shadow-md hover:bg-[#03045E] transition-all duration-300 cursor-pointer border-2 border-[#2C7FFF] hover:border-[#03045E]"
                  >
                    {deactivateTargetState ? 'Reactivate' : 'Deactivate'}
                  </button>
                </div>
              </div>
            )}

            {deactivateStage === 'processing' && (
              <div className="px-8 py-12 flex flex-col items-center text-center">
                <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-[#2C7FFF]/25 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#2C7FFF] border-r-transparent border-b-[#03045E] border-l-transparent animate-spin" />
                  <div className="w-8 h-8 rounded-full bg-[#03045E] shadow-lg animate-ping opacity-70 absolute" />
                </div>
                <h2 className="text-xl font-black text-[#03045E] tracking-tight mb-1.5">
                  {deactivateTargetState ? 'Reactivating Account' : 'Deactivating Account'}
                </h2>
                <p className="text-xs font-bold text-[#03045E]/70">
                  Applying your account status change...
                </p>
                <div className="flex items-center gap-1.5 mt-5">
                  <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {deactivateStage === 'success' && (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-[#2C7FFF]/20 animate-ping" />
                  <div className="relative w-20 h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#2C7FFF] flex items-center justify-center shadow-lg shadow-[#2C7FFF]/40">
                      <svg className="w-8 h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#03045E] flex items-center justify-center border-2 border-[#f4f4f4]">
                    <svg className="w-3.5 h-3.5 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-[#2C7FFF]/15 text-[#2C7FFF] text-[10px] font-black uppercase tracking-widest mb-3">
                  Account Status Updated
                </span>

                <h2 className="text-2xl font-black text-[#03045E] tracking-tight mb-2">
                  {deactivateTargetState ? 'Account Reactivated!' : 'Account Deactivated!'}
                </h2>
                <p className="text-sm font-semibold text-[#2c7fff]/75 leading-relaxed mb-6 max-w-xs">
                  {deactivateTargetState
                    ? 'Your profile is now active. Welcome back and good luck with your job search!'
                    : 'Your profile is now hidden. Log back in anytime to reactivate your account.'}
                </p>

                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="w-full py-3.5 rounded-2xl bg-[#03045E] text-[#f4f4f4] font-black text-sm uppercase tracking-wider shadow-md hover:bg-[#2C7FFF] hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-[#03045E] hover:border-[#2C7FFF]"
                >
                  Got it
                </button>
              </div>
            )}

            {deactivateStage === 'error' && (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#03045E]/15 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#03045E] flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-[#2C7FFF]/15 text-[#2C7FFF] text-[10px] font-black uppercase tracking-widest mb-3">
                  Action Failed
                </span>

                <h2 className="text-2xl font-black text-[#03045E] tracking-tight mb-2">
                  Something went wrong
                </h2>
                <p className="text-sm font-semibold text-[#03045E]/75 leading-relaxed mb-6 max-w-xs">
                  We couldn't update your account status. Please try again in a moment.
                </p>

                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="w-full py-3.5 rounded-2xl bg-[#03045E] text-[#f4f4f4] font-black text-sm uppercase tracking-wider shadow-md hover:bg-[#2C7FFF] hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-[#03045E] hover:border-[#2C7FFF]"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}