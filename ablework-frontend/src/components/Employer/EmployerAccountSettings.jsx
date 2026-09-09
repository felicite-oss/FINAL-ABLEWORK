import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EmployerAccountSettings({ profile }) {
  const navigate = useNavigate();

  const isRejected = profile?.verification_status === 'Rejected';
  const [openSection, setOpenSection] = useState(isRejected ? 'verification' : 'email');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  // --- 1. Email State ---
  const [email, setEmail] = useState(profile?.email || '');
  const [emailStep, setEmailStep] = useState(1); // 1 = Request, 2 = Verify OTP
  const [emailOtp, setEmailOtp] = useState('');
  const [emailStatus, setEmailStatus] = useState({ type: '', msg: '' });
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // --- 2. Password State ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStep, setPasswordStep] = useState(1); // 1 = Request, 2 = Verify OTP
  const [passwordOtp, setPasswordOtp] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', msg: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // --- 3. Verification State ---
  const [verificationDoc, setVerificationDoc] = useState(null);
  const [verStatus, setVerStatus] = useState({ type: '', msg: '' });
  const [isResubmitting, setIsResubmitting] = useState(false);

  // --- 4. Danger Zone State ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [dangerStatus, setDangerStatus] = useState({ type: '', msg: '' });

  const [isDeactivated, setIsDeactivated] = useState(profile?.status === 'Deactivated' || profile?.account_status === 'Deactivated' || false);

  // --- Cooldown Logic ---
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

  // ==========================================
  // HANDLERS: EMAIL SETTINGS
  // ==========================================
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
      const response = await fetch(`http://localhost:5001/api/employer/${profile.user_id}/credentials`, {
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

  // ==========================================
  // HANDLERS: PASSWORD SETTINGS
  // ==========================================
  const handleRequestPasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', msg: '' });

    if (newPassword !== confirmPassword) {
      return setPasswordStatus({ type: 'error', msg: 'New passwords do not match.' });
    }
    if (newPassword.length < 6) {
      return setPasswordStatus({ type: 'error', msg: 'Password must be at least 6 characters long.' });
    }

    try {
      const response = await fetch(`http://localhost:5001/api/users/${profile.user_id}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile?.email, type: 'password' })
      });
      const data = await response.json();

      if (response.ok) {
        setPasswordStatus({ type: 'success', msg: `A 6-digit verification code has been sent to your email.` });
        setPasswordStep(2);
      } else {
        setPasswordStatus({ type: 'error', msg: data.message });
      }
    } catch (error) {
      setPasswordStatus({ type: 'error', msg: 'Failed to request code. Check server connection.' });
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
      const response = await fetch(`http://localhost:5001/api/employer/${profile.user_id}/credentials`, {
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
      } else {
        setPasswordStatus({ type: 'error', msg: data.message || 'Invalid verification code.' });
      }
    } catch (error) {
      setPasswordStatus({ type: 'error', msg: 'Server connection error.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // ==========================================
  // HANDLERS: VERIFICATION & DANGER ZONE
  // ==========================================
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

  const handleToggleDeactivation = async () => {
    const actionText = isDeactivated ? 'reactivate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionText} your corporate account?`)) return;
    
    try {
      const res = await fetch(`http://localhost:5001/api/users/${profile.user_id}/toggle-status`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isDeactivated ? 'activate' : 'deactivate' })
      });
      
      if (res.ok) {
        setIsDeactivated(!isDeactivated);
      } else {
        alert(`Failed to ${actionText} account. Please try again.`);
      }
    } catch (error) {
      alert(`Server error while attempting to ${actionText} account.`);
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
    <svg className={`w-5 h-5 text-[#03045E]/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
  );

  return (
    <div className="max-w-4xl animate-fadeIn pb-10">
      
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#03045E]">Account Settings</h1>
        <p className="text-sm font-semibold text-[#03045E]/80 mt-1">Manage your security credentials and corporate verification documents.</p>
      </div>

      <div className="flex flex-col gap-4">
        
        {/* SECTION 1: Verification & Documents */}
        <div className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 ${openSection === 'verification' ? 'border-[#2C7FFF]/40 shadow-md' : 'border-[#03045E]/10 hover:border-[#03045E]/30'}`}>
          <button onClick={() => toggleSection('verification')} className="w-full p-6 sm:p-8 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="text-left">
              <h2 className="text-lg font-bold text-[#03045E]">Verification Status</h2>
              <p className="text-xs text-gray-500 mt-1 font-medium">Check your corporate standing and manage documents.</p>
            </div>
            <ChevronIcon isOpen={openSection === 'verification'} />
          </button>

          {openSection === 'verification' && (
            <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-[#03045E]/10 pt-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-500 mb-1">Current Standing</p>
                  {profile?.verification_status === 'Approved' && <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-sm rounded-lg border border-emerald-200">✅ Approved</span>}
                  {profile?.verification_status === 'Pending' && <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-800 font-bold text-sm rounded-lg border border-yellow-200">⏳ Pending Review</span>}
                  {isRejected && <span className="inline-block px-4 py-1.5 bg-red-100 text-red-800 font-bold text-sm rounded-lg border border-red-200">❌ Action Required</span>}
                  
                  <div className="mt-4">
                    <a href={`http://localhost:5001/${profile?.verification_document?.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#2C7FFF] hover:underline">📄 View Business Document on File</a>
                  </div>
                </div>

                {isRejected && (
                  <div className="flex-1 bg-red-50 p-5 rounded-2xl border border-red-100 w-full">
                    <h3 className="text-sm font-bold text-red-800 mb-2">Re-verify Company</h3>
                    <p className="text-xs text-red-600 mb-4 font-medium">
                      {canResubmit ? "Your cooldown has expired. Please upload a clear, valid Business Registration (DTI/SEC)." : `Security lock active. You can upload a new document in ${daysLeft} days.`}
                    </p>
                    
                    {verStatus.msg && (
                      <div className={`p-3 text-xs font-bold rounded-xl mb-4 ${verStatus.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>{verStatus.msg}</div>
                    )}

                    <form onSubmit={handleResubmitVerification} className="flex flex-col gap-3">
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" disabled={!canResubmit || isResubmitting} onChange={(e) => setVerificationDoc(e.target.files[0])} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-700 disabled:opacity-50 cursor-pointer" />
                      {canResubmit && (
                        <button type="submit" disabled={isResubmitting || !verificationDoc} className="mt-2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition disabled:opacity-50 shadow-sm cursor-pointer">
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

        {/* SECTION 2: EMAIL SETTINGS */}
        <div className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 ${openSection === 'email' ? 'border-[#2C7FFF]/40 shadow-md' : 'border-[#03045E]/10 hover:border-[#03045E]/30'}`}>
          <button onClick={() => toggleSection('email')} className="w-full p-6 sm:p-8 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="text-left">
              <h2 className="text-lg font-bold text-[#03045E]">Work Email Address</h2>
              <p className="text-xs text-gray-500 mt-1 font-medium">Update your work email with OTP verification.</p>
            </div>
            <ChevronIcon isOpen={openSection === 'email'} />
          </button>

          {openSection === 'email' && (
            <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-[#03045E]/10 pt-6 animate-fadeIn">
              
              {emailStatus.msg && (
                <div className={`p-4 mb-6 rounded-xl text-sm font-bold border ${emailStatus.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {emailStatus.msg}
                </div>
              )}

              {emailStep === 1 ? (
                <form onSubmit={handleRequestEmailUpdate} className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter new work email address" className="w-full p-3.5 border border-gray-200 rounded-xl focus:border-[#2C7FFF] outline-none transition font-medium" />
                  </div>
                  <button type="submit" disabled={email === profile?.email} className="w-full sm:w-auto px-6 py-3.5 bg-[#f4f4f4] border border-[#03045E]/10 text-[#03045E] font-bold rounded-xl shadow-sm hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF] transition disabled:opacity-50 cursor-pointer">
                    Send Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndUpdateEmail} className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">New Work Email</label>
                      <input type="email" value={email} disabled className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 outline-none cursor-not-allowed font-medium" />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Verification Code</label>
                      <input type="text" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} required placeholder="6-digit code" maxLength="6" className="w-full p-3.5 border border-gray-200 rounded-xl focus:border-[#2C7FFF] outline-none transition tracking-widest font-mono" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => { setEmailStep(1); setEmailStatus({type:'', msg:''}); }} className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition cursor-pointer">Cancel</button>
                    <button type="submit" disabled={isUpdatingEmail || emailOtp.length < 6} className="px-6 py-3.5 bg-[#03045E] text-white font-bold rounded-xl shadow-md hover:bg-[#2C7FFF] transition disabled:opacity-50 cursor-pointer w-full sm:w-auto">
                      {isUpdatingEmail ? 'Verifying...' : 'Verify & Update Email'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: PASSWORD SETTINGS */}
        <div className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 ${openSection === 'password' ? 'border-[#2C7FFF]/40 shadow-md' : 'border-[#03045E]/10 hover:border-[#03045E]/30'}`}>
          <button onClick={() => toggleSection('password')} className="w-full p-6 sm:p-8 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="text-left">
              <h2 className="text-lg font-bold text-[#03045E]">Change Password</h2>
              <p className="text-xs text-gray-500 mt-1 font-medium">Update your account password securely.</p>
            </div>
            <ChevronIcon isOpen={openSection === 'password'} />
          </button>

          {openSection === 'password' && (
            <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-[#03045E]/10 pt-6 animate-fadeIn">
              
              {passwordStatus.msg && (
                <div className={`p-4 mb-6 rounded-xl text-sm font-bold border ${passwordStatus.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {passwordStatus.msg}
                </div>
              )}

              {passwordStep === 1 ? (
                <form onSubmit={handleRequestPasswordUpdate} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5 w-full sm:max-w-md">
                    <label className="text-xs font-bold text-gray-500 uppercase">Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full p-3.5 border border-gray-200 rounded-xl focus:border-[#2C7FFF] outline-none transition font-medium" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-5 w-full">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full p-3.5 border border-gray-200 rounded-xl focus:border-[#2C7FFF] outline-none transition font-medium" />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Confirm New Password</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full p-3.5 border border-gray-200 rounded-xl focus:border-[#2C7FFF] outline-none transition font-medium" />
                    </div>
                  </div>
                  <button type="submit" className="mt-2 w-full sm:max-w-md px-6 py-3.5 bg-[#03045E] text-white font-bold rounded-xl shadow-md hover:bg-[#2C7FFF] transition cursor-pointer">
                    Request Password Change
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndUpdatePassword} className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Verification Code</label>
                      <input type="text" value={passwordOtp} onChange={(e) => setPasswordOtp(e.target.value)} required placeholder="6-digit code sent to email" maxLength="6" className="w-full p-3.5 border border-gray-200 rounded-xl focus:border-[#2C7FFF] outline-none transition tracking-widest font-mono" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => { setPasswordStep(1); setPasswordStatus({type:'', msg:''}); }} className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition cursor-pointer">Cancel</button>
                    <button type="submit" disabled={isUpdatingPassword || passwordOtp.length < 6} className="px-6 py-3.5 bg-[#03045E] text-white font-bold rounded-xl shadow-md hover:bg-[#2C7FFF] transition disabled:opacity-50 cursor-pointer w-full sm:w-auto">
                      {isUpdatingPassword ? 'Verifying...' : 'Verify & Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* SECTION 4: Danger Zone */}
        <div className={`bg-red-50 rounded-3xl border transition-all duration-300 ${openSection === 'danger' ? 'border-red-400 shadow-md' : 'border-red-200 hover:border-red-300'}`}>
          <button onClick={() => toggleSection('danger')} className="w-full p-6 sm:p-8 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="text-left">
              <h2 className="text-lg font-bold text-red-800">Danger Zone</h2>
              <p className="text-xs text-red-600/80 mt-1 font-medium">Deactivate or permanently delete your corporate account.</p>
            </div>
            <ChevronIcon isOpen={openSection === 'danger'} />
          </button>

          {openSection === 'danger' && (
            <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-red-200 pt-6 animate-fadeIn">
              
              {/* DEACTIVATE / REACTIVATE TOGGLE */}
              <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                  <h3 className={`text-sm font-bold ${isDeactivated ? 'text-emerald-800' : 'text-red-900'}`}>
                    {isDeactivated ? 'Account is Currently Deactivated' : 'Deactivate Account'}
                  </h3>
                  <p className={`text-xs mt-1 ${isDeactivated ? 'text-emerald-700' : 'text-red-700'}`}>
                    {isDeactivated 
                      ? 'Your company profile and active jobs are hidden. Reactivate to resume hiring.' 
                      : 'Temporarily hide your company profile and active job postings. You can reactivate later.'}
                  </p>
                </div>
                <button 
                  onClick={handleToggleDeactivation} 
                  className={`px-6 py-2.5 font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
                    isDeactivated 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' 
                      : 'bg-white border-2 border-red-300 text-red-600 hover:bg-red-100'
                  }`}
                >
                  {isDeactivated ? 'Reactivate Account' : 'Deactivate Account'}
                </button>
              </div>

              <div className="h-px bg-red-200 my-6"></div>

              {/* PERMANENT DELETE */}
              <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                  <h3 className="text-sm font-bold text-red-900">Delete Account</h3>
                  <p className="text-xs text-red-700 mt-1">Permanently erase your company data and job history. This action cannot be undone.</p>
                </div>
                <button onClick={() => setShowDeleteModal(true)} className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-sm transition whitespace-nowrap cursor-pointer">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl flex flex-col gap-4 animate-fadeIn">
            <h3 className="text-xl font-extrabold text-[#03045E]">Confirm Deletion</h3>
            <p className="text-sm font-medium text-gray-600">This will permanently delete your corporate account and all associated job postings. Please enter your password to confirm.</p>
            
            {dangerStatus.msg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl">{dangerStatus.msg}</div>
            )}

            <form onSubmit={handleDelete} className="flex flex-col gap-4 mt-2">
              <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required placeholder="Enter password" className="w-full p-3.5 border border-gray-300 rounded-xl focus:border-red-500 outline-none transition" />
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-red-600 text-white font-bold rounded-xl shadow-md hover:bg-red-700 transition cursor-pointer">Confirm Delete</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}