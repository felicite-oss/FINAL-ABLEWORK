import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../../context/AccessibilityContext';

export default function EmployerAccountSettings({ profile }) {
  const navigate = useNavigate();
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

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
  const [verificationDoc, setVerificationDoc] = useState(null);
  const [verStatus, setVerStatus] = useState({ type: '', msg: '' });
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [dangerStatus, setDangerStatus] = useState({ type: '', msg: '' });

  const [isDeactivated, setIsDeactivated] = useState(profile?.status === 'Deactivated' || profile?.account_status === 'Deactivated' || false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ tone: 'default', pill: '', title: '', subtitle: '' });

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

  const pageText = isContrast ? 'text-[#f4f4f4]' : 'text-[#03045E]';
  const panelBg = isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-[#f4f4f4]/90 border-[#03045E]/20';
  const cardBg = isContrast ? 'bg-black border-[#2C7FFF]/40' : 'bg-white border-[#03045E]/15';
  const cardHover = isContrast ? 'hover:border-[#2C7FFF]' : 'hover:border-[#03045E]/30';
  const cardActive = 'border-[#2C7FFF] shadow-md';
  const softBg = isContrast ? 'bg-black border-[#2C7FFF]/40' : 'bg-[#f4f4f4] border-[#03045E]/20';
  const muted = isContrast ? 'text-[#f4f4f4]/80' : 'text-[#03045E]/80';
  const subtle = isContrast ? 'text-[#f4f4f4]/60' : 'text-[#03045E]/60';
  const divider = isContrast ? 'border-[#2C7FFF]/40' : 'border-[#03045E]/10';
  const inputCls = isContrast
    ? 'w-full p-3.5 border border-[#2C7FFF]/50 bg-black rounded-xl text-[#f4f4f4] placeholder-[#f4f4f4]/40 focus:border-[#2C7FFF] outline-none transition font-medium'
    : 'w-full p-3.5 border border-[#03045E]/20 bg-[#f4f4f4] rounded-xl text-[#03045E] focus:border-[#2C7FFF] focus:bg-white outline-none transition font-medium';
  const disabledInputCls = isContrast
    ? 'w-full p-3.5 bg-black border border-[#2C7FFF]/30 rounded-xl text-[#f4f4f4]/50 outline-none cursor-not-allowed font-medium'
    : 'w-full p-3.5 bg-[#f4f4f4] border border-[#03045E]/20 rounded-xl text-[#03045E]/60 outline-none cursor-not-allowed font-medium';
  const cancelBtn = isContrast
    ? 'px-6 py-3.5 bg-black border border-[#2C7FFF]/40 text-[#f4f4f4] font-bold rounded-xl hover:bg-[#2C7FFF]/20 transition cursor-pointer'
    : 'px-6 py-3.5 bg-[#f4f4f4] border border-[#03045E]/20 text-[#03045E] font-bold rounded-xl hover:bg-gray-200 transition cursor-pointer';
  const primaryBtn = 'px-6 py-3.5 bg-[#2C7FFF] text-[#f4f4f4] font-bold rounded-xl shadow-md hover:bg-[#03045E] transition disabled:opacity-50 cursor-pointer';
  const secondaryBtn = isContrast
    ? 'w-full sm:w-auto px-6 py-3.5 bg-black border border-[#2C7FFF]/40 text-[#f4f4f4] font-bold rounded-xl shadow-sm hover:bg-[#2C7FFF] hover:text-[#f4f4f4] transition disabled:opacity-50 cursor-pointer'
    : 'w-full sm:w-auto px-6 py-3.5 bg-[#f4f4f4] border border-[#03045E]/20 text-[#03045E] font-bold rounded-xl shadow-sm hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF] transition disabled:opacity-50 cursor-pointer';
  const successMsg = isContrast
    ? 'bg-black text-[#2C7FFF] border-[#2C7FFF]'
    : 'bg-[#2C7FFF]/10 text-[#03045E] border-[#2C7FFF]/30';
  const errorMsg = isContrast
    ? 'bg-[#03045E] text-[#f4f4f4] border-[#2C7FFF]'
    : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/30';

  const dangerCardBg = isContrast
    ? 'bg-black border-[#2C7FFF]/40'
    : 'bg-red-50 border-red-200';
  const dangerCardHover = isContrast ? 'hover:border-[#2C7FFF]' : 'hover:border-red-300';
  const dangerActive = 'border-[#2C7FFF] shadow-md';
  const dangerText = isContrast ? 'text-[#f4f4f4]' : 'text-red-800';
  const dangerSub = isContrast ? 'text-[#f4f4f4]/70' : 'text-red-600/80';
  const dangerDivider = isContrast ? 'border-[#2C7FFF]/40' : 'border-red-200';
  const dangerInner = isContrast ? 'text-[#f4f4f4]' : 'text-red-900';
  const dangerInnerSub = isContrast ? 'text-[#f4f4f4]/70' : 'text-red-700';

  const triggerAlert = (tone, pill, title, subtitle) => {
    setAlertConfig({ tone, pill, title, subtitle });
    setShowAlert(true);
  };

  const renderAlertIcon = (tone) => {
    if (tone === 'email') {
      return (
        <svg className="w-7 h-7 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
    if (tone === 'password') {
      return (
        <svg className="w-7 h-7 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    }
    if (tone === 'verification') {
      return (
        <svg className="w-7 h-7 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    if (tone === 'deactivate') {
      return (
        <svg className="w-7 h-7 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      );
    }
    if (tone === 'reactivate') {
      return (
        <svg className="w-7 h-7 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }
    return (
      <svg className="w-7 h-7 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  const getAlertBadge = (tone) => {
    if (tone === 'deactivate') return 'bg-[#03045E]';
    return 'bg-[#2C7FFF]';
  };

  const getAlertRing = (tone) => {
    if (tone === 'deactivate') return 'bg-[#03045E]/20';
    return 'bg-[#2C7FFF]/20';
  };

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
        triggerAlert(
          'email',
          'Verification Code Sent',
          'Check Your Inbox!',
          `A 6-digit code was sent to ${email}. Enter it below to confirm your new work email.`
        );
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
        triggerAlert(
          'email',
          'Email Updated',
          'Work Email Updated!',
          `Your corporate email has been successfully changed to ${email}.`
        );
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
        triggerAlert(
          'password',
          'Security Code Sent',
          'Check Your Inbox!',
          `A 6-digit security code was sent to ${profile?.email}. Enter it to confirm the password change.`
        );
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
        triggerAlert(
          'password',
          'Security Update',
          'Password Updated!',
          'Your new password has been saved securely. Use it the next time you log in.'
        );
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
        triggerAlert(
          'verification',
          'Document Submitted',
          'Verification Submitted!',
          'Your business document has been received and is now queued for administrator review.'
        );
        setTimeout(() => window.location.reload(), 3500); 
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
    <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isContrast ? 'text-[#f4f4f4]/60' : 'text-[#03045E]/60'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
  );

  return (
    <div className={`animate-fadeIn max-w-7xl mx-auto pb-10 ${pageText}`}>
      
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 backdrop-blur-md p-6 rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.06)] border ${panelBg}`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#2C7FFF]/15 text-[#2C7FFF] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-[#2C7FFF]/30">Settings Hub</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border ${isContrast ? 'bg-black text-[#f4f4f4] border-[#2C7FFF]/40' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20'}`}>
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF] animate-pulse"></span> Secure Portal
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${pageText}`}>Account Settings</h1>
          <p className={`text-sm font-semibold mt-0.5 ${muted}`}>Manage your security credentials and corporate verification documents.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        
       
        <div className={`rounded-3xl border shadow-[0_10px_30px_rgba(3,4,94,0.06)] overflow-hidden transition-all duration-300 ${openSection === 'verification' ? cardActive : cardHover} ${cardBg}`}>
          <button onClick={() => toggleSection('verification')} className="w-full p-6 sm:p-8 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="text-left">
              <h2 className={`text-lg font-bold ${pageText}`}>Verification Status</h2>
              <p className={`text-xs mt-1 font-medium ${subtle}`}>Check your corporate standing and manage documents.</p>
            </div>
            <ChevronIcon isOpen={openSection === 'verification'} />
          </button>

          {openSection === 'verification' && (
            <div className={`px-6 pb-6 sm:px-8 sm:pb-8 border-t pt-6 animate-fadeIn ${divider}`}>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-1">
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${subtle}`}>Current Standing</p>
                  {profile?.verification_status === 'Approved' && (
                    <span className={`inline-block px-4 py-1.5 font-bold text-sm rounded-xl border ${isContrast ? 'bg-[#2C7FFF]/20 text-[#f4f4f4] border-[#2C7FFF]' : 'bg-[#2C7FFF]/10 text-[#03045E] border-[#2C7FFF]/30'}`}>
                      Approved
                    </span>
                  )}
                  {profile?.verification_status === 'Pending' && (
                    <span className={`inline-block px-4 py-1.5 font-bold text-sm rounded-xl border ${isContrast ? 'bg-black text-[#f4f4f4] border-[#2C7FFF]/40' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/30'}`}>
                      Pending Review
                    </span>
                  )}
                  {isRejected && (
                    <span className={`inline-block px-4 py-1.5 font-bold text-sm rounded-xl border ${isContrast ? 'bg-[#03045E] text-[#f4f4f4] border-[#2C7FFF]' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/40'}`}>
                      Action Required
                    </span>
                  )}
                  
                  <div className="mt-4">
                    <a href={`http://localhost:5001/${profile?.verification_document?.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#2C7FFF] hover:underline">View Business Document on File</a>
                  </div>
                </div>

                {isRejected && (
                  <div className={`flex-1 p-5 rounded-2xl border w-full ${softBg}`}>
                    <h3 className={`text-sm font-bold mb-2 ${pageText}`}>Re-verify Company</h3>
                    <p className={`text-xs mb-4 font-medium ${muted}`}>
                      {canResubmit ? "Your cooldown has expired. Please upload a clear, valid Business Registration (DTI/SEC)." : `Security lock active. You can upload a new document in ${daysLeft} days.`}
                    </p>
                    
                    {verStatus.msg && (
                      <div className={`p-3 text-xs font-bold rounded-xl mb-4 border ${verStatus.type === 'error' ? errorMsg : successMsg}`}>{verStatus.msg}</div>
                    )}

                    <form onSubmit={handleResubmitVerification} className="flex flex-col gap-3">
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" disabled={!canResubmit || isResubmitting} onChange={(e) => setVerificationDoc(e.target.files[0])} className={`text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#2C7FFF] file:text-[#f4f4f4] hover:file:bg-[#03045E] disabled:opacity-50 cursor-pointer ${pageText}`} />
                      {canResubmit && (
                        <button type="submit" disabled={isResubmitting || !verificationDoc} className="mt-2 py-2.5 bg-[#2C7FFF] hover:bg-[#03045E] text-[#f4f4f4] font-bold text-sm rounded-xl transition disabled:opacity-50 shadow-sm cursor-pointer">
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

    
        <div className={`rounded-3xl border shadow-[0_10px_30px_rgba(3,4,94,0.06)] overflow-hidden transition-all duration-300 ${openSection === 'email' ? cardActive : cardHover} ${cardBg}`}>
          <button onClick={() => toggleSection('email')} className="w-full p-6 sm:p-8 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="text-left">
              <h2 className={`text-lg font-bold ${pageText}`}>Work Email Address</h2>
              <p className={`text-xs mt-1 font-medium ${subtle}`}>Update your work email with OTP verification.</p>
            </div>
            <ChevronIcon isOpen={openSection === 'email'} />
          </button>

          {openSection === 'email' && (
            <div className={`px-6 pb-6 sm:px-8 sm:pb-8 border-t pt-6 animate-fadeIn ${divider}`}>
              
              {emailStatus.msg && (
                <div className={`p-4 mb-6 rounded-xl text-sm font-bold border ${emailStatus.type === 'error' ? errorMsg : successMsg}`}>
                  {emailStatus.msg}
                </div>
              )}

              {emailStep === 1 ? (
                <form onSubmit={handleRequestEmailUpdate} className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter new work email address" className={inputCls} />
                  </div>
                  <button type="submit" disabled={email === profile?.email} className={secondaryBtn}>
                    Send Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndUpdateEmail} className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className={`text-xs font-bold uppercase mb-1.5 block ${subtle}`}>New Work Email</label>
                      <input type="email" value={email} disabled className={disabledInputCls} />
                    </div>
                    <div className="flex-1 w-full">
                      <label className={`text-xs font-bold uppercase mb-1.5 block ${subtle}`}>Verification Code</label>
                      <input type="text" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} required placeholder="6-digit code" maxLength="6" className={`${inputCls} tracking-widest font-mono`} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => { setEmailStep(1); setEmailStatus({type:'', msg:''}); }} className={cancelBtn}>Cancel</button>
                    <button type="submit" disabled={isUpdatingEmail || emailOtp.length < 6} className={`${primaryBtn} w-full sm:w-auto`}>
                      {isUpdatingEmail ? 'Verifying...' : 'Verify & Update Email'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

   
        <div className={`rounded-3xl border shadow-[0_10px_30px_rgba(3,4,94,0.06)] overflow-hidden transition-all duration-300 ${openSection === 'password' ? cardActive : cardHover} ${cardBg}`}>
          <button onClick={() => toggleSection('password')} className="w-full p-6 sm:p-8 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="text-left">
              <h2 className={`text-lg font-bold ${pageText}`}>Change Password</h2>
              <p className={`text-xs mt-1 font-medium ${subtle}`}>Update your account password securely.</p>
            </div>
            <ChevronIcon isOpen={openSection === 'password'} />
          </button>

          {openSection === 'password' && (
            <div className={`px-6 pb-6 sm:px-8 sm:pb-8 border-t pt-6 animate-fadeIn ${divider}`}>
              
              {passwordStatus.msg && (
                <div className={`p-4 mb-6 rounded-xl text-sm font-bold border ${passwordStatus.type === 'error' ? errorMsg : successMsg}`}>
                  {passwordStatus.msg}
                </div>
              )}

              {passwordStep === 1 ? (
                <form onSubmit={handleRequestPasswordUpdate} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5 w-full sm:max-w-md">
                    <label className={`text-xs font-bold uppercase ${subtle}`}>Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className={inputCls} />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-5 w-full">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className={`text-xs font-bold uppercase ${subtle}`}>New Password</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className={`text-xs font-bold uppercase ${subtle}`}>Confirm New Password</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputCls} />
                    </div>
                  </div>
                  <button type="submit" className={`mt-2 w-full sm:max-w-md ${primaryBtn}`}>
                    Request Password Change
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndUpdatePassword} className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className={`text-xs font-bold uppercase mb-1.5 block ${subtle}`}>Verification Code</label>
                      <input type="text" value={passwordOtp} onChange={(e) => setPasswordOtp(e.target.value)} required placeholder="6-digit code sent to email" maxLength="6" className={`${inputCls} tracking-widest font-mono`} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => { setPasswordStep(1); setPasswordStatus({type:'', msg:''}); }} className={cancelBtn}>Cancel</button>
                    <button type="submit" disabled={isUpdatingPassword || passwordOtp.length < 6} className={`${primaryBtn} w-full sm:w-auto`}>
                      {isUpdatingPassword ? 'Verifying...' : 'Verify & Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

       
        <div className={`rounded-3xl border shadow-[0_10px_30px_rgba(3,4,94,0.06)] transition-all duration-300 ${openSection === 'danger' ? dangerActive : dangerCardHover} ${dangerCardBg}`}>
          <button onClick={() => toggleSection('danger')} className="w-full p-6 sm:p-8 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="text-left">
              <h2 className={`text-lg font-bold ${dangerText}`}>Danger Zone</h2>
              <p className={`text-xs mt-1 font-medium ${dangerSub}`}>Deactivate or permanently delete your corporate account.</p>
            </div>
            <ChevronIcon isOpen={openSection === 'danger'} />
          </button>

          {openSection === 'danger' && (
            <div className={`px-6 pb-6 sm:px-8 sm:pb-8 border-t pt-6 animate-fadeIn ${dangerDivider}`}>
              
             
              <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                  <h3 className={`text-sm font-bold ${dangerInner}`}>
                    {isDeactivated ? 'Account is Currently Deactivated' : 'Deactivate Account'}
                  </h3>
                  <p className={`text-xs mt-1 ${dangerInnerSub}`}>
                    {isDeactivated 
                      ? 'Your company profile and active jobs are hidden. Reactivate to resume hiring.' 
                      : 'Temporarily hide your company profile and active job postings. You can reactivate later.'}
                  </p>
                </div>
                <button 
                  onClick={handleToggleDeactivation} 
                  className={`px-6 py-2.5 font-bold rounded-xl transition whitespace-nowrap cursor-pointer border-2 ${
                    isDeactivated 
                      ? 'bg-[#2C7FFF] text-[#f4f4f4] border-[#2C7FFF] hover:bg-[#03045E] hover:border-[#03045E] shadow-sm' 
                      : (isContrast 
                          ? 'bg-black border-[#2C7FFF] text-[#f4f4f4] hover:bg-[#2C7FFF] hover:text-[#f4f4f4]' 
                          : 'bg-white border-[#03045E]/30 text-[#03045E] hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]')
                  }`}
                >
                  {isDeactivated ? 'Reactivate Account' : 'Deactivate Account'}
                </button>
              </div>

              <div className={`h-px my-6 ${isContrast ? 'bg-[#2C7FFF]/30' : 'bg-[#03045E]/15'}`}></div>

             
              <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                  <h3 className={`text-sm font-bold ${dangerInner}`}>Delete Account</h3>
                  <p className={`text-xs mt-1 ${dangerInnerSub}`}>Permanently erase your company data and job history. This action cannot be undone.</p>
                </div>
                <button 
                  onClick={() => setShowDeleteModal(true)} 
                  className={`px-6 py-2.5 font-bold rounded-xl shadow-sm transition whitespace-nowrap cursor-pointer border-2 ${
                    isContrast 
                      ? 'bg-[#03045E] text-[#f4f4f4] border-[#f4f4f4]/40 hover:bg-[#f4f4f4] hover:text-[#03045E]' 
                      : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'
                  }`}
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
          <div className={`rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl flex flex-col gap-4 animate-fadeIn border ${isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-white border-transparent'}`}>
            <h3 className={`text-xl font-extrabold ${pageText}`}>Confirm Deletion</h3>
            <p className={`text-sm font-medium ${muted}`}>This will permanently delete your corporate account and all associated job postings. Please enter your password to confirm.</p>
            
            {dangerStatus.msg && (
              <div className={`p-3 text-sm font-bold rounded-xl border ${errorMsg}`}>{dangerStatus.msg}</div>
            )}

            <form onSubmit={handleDelete} className="flex flex-col gap-4 mt-2">
              <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required placeholder="Enter password" className={inputCls} />
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowDeleteModal(false)} className={`flex-1 ${cancelBtn}`}>Cancel</button>
                <button 
                  type="submit" 
                  className={`flex-1 py-3.5 font-bold rounded-xl shadow-md transition cursor-pointer border-2 ${
                    isContrast 
                      ? 'bg-[#03045E] text-[#f4f4f4] border-[#f4f4f4]/40 hover:bg-[#f4f4f4] hover:text-[#03045E]' 
                      : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'
                  }`}
                >
                  Confirm Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#03045E]/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[2rem] shadow-[0_25px_60px_rgba(3,4,94,0.4)] border-2 overflow-hidden animate-in zoom-in-95 duration-300 ${isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-[#f4f4f4] border-[#2C7FFF]'}`}>
            <div className="h-2 w-full bg-[#2C7FFF]" />

            <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className={`absolute inset-0 rounded-full ${getAlertRing(alertConfig.tone)} animate-ping`} />
                <div className={`relative w-20 h-20 rounded-full ${getAlertRing(alertConfig.tone)} flex items-center justify-center`}>
                  <div className={`w-14 h-14 rounded-full ${getAlertBadge(alertConfig.tone)} flex items-center justify-center shadow-[0_10px_30px_rgba(44,127,255,0.5)]`}>
                    {renderAlertIcon(alertConfig.tone)}
                  </div>
                </div>
                <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#03045E] flex items-center justify-center border-2 ${isContrast ? 'border-black' : 'border-[#f4f4f4]'}`}>
                  <svg className="w-3.5 h-3.5 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <span className="inline-block px-3 py-1 rounded-full bg-[#2C7FFF]/15 text-[#2C7FFF] text-[10px] font-black uppercase tracking-widest mb-3">
                {alertConfig.pill}
              </span>

              <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                {alertConfig.title}
              </h2>
              <p className={`text-sm font-semibold leading-relaxed mb-6 max-w-xs ${muted}`}>
                {alertConfig.subtitle}
              </p>

              <button
                onClick={() => setShowAlert(false)}
                className="w-full py-3.5 rounded-2xl bg-[#2C7FFF] text-[#f4f4f4] font-black text-sm uppercase tracking-wider shadow-md hover:bg-[#03045E] transition-all duration-300 cursor-pointer border-2 border-[#2C7FFF]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeactivateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#03045E]/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[2rem] shadow-[0_25px_60px_rgba(3,4,94,0.4)] border-2 overflow-hidden animate-in zoom-in-95 duration-300 ${isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-[#f4f4f4] border-[#2C7FFF]'}`}>
            <div className="h-2 w-full bg-[#2C7FFF]" />

            {deactivateStage === 'confirm' && (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className={`relative w-20 h-20 rounded-full ${deactivateTargetState ? 'bg-[#2C7FFF]/20' : 'bg-[#03045E]/20'} flex items-center justify-center`}>
                    <div className={`w-14 h-14 rounded-full ${deactivateTargetState ? 'bg-[#2C7FFF]' : 'bg-[#03045E]'} flex items-center justify-center shadow-[0_10px_30px_rgba(44,127,255,0.5)]`}>
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

                <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                  {deactivateTargetState ? 'Reactivate Account?' : 'Deactivate Account?'}
                </h2>
                <p className={`text-sm font-semibold leading-relaxed mb-6 max-w-xs ${muted}`}>
                  {deactivateTargetState
                    ? 'Your corporate profile and active job postings will be visible to applicants again.'
                    : 'Your corporate profile and active job postings will be temporarily hidden. You can reactivate anytime.'}
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
                <h2 className={`text-xl font-black tracking-tight mb-1.5 ${pageText}`}>
                  {deactivateTargetState ? 'Reactivating Account' : 'Deactivating Account'}
                </h2>
                <p className={`text-xs font-bold ${muted}`}>
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
                    <div className="w-14 h-14 rounded-full bg-[#2C7FFF] flex items-center justify-center shadow-[0_10px_30px_rgba(44,127,255,0.5)]">
                      <svg className="w-8 h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#03045E] flex items-center justify-center border-2 ${isContrast ? 'border-black' : 'border-[#f4f4f4]'}`}>
                    <svg className="w-3.5 h-3.5 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-[#2C7FFF]/15 text-[#2C7FFF] text-[10px] font-black uppercase tracking-widest mb-3">
                  {deactivateTargetState ? 'Account Reactivated' : 'Account Deactivated'}
                </span>

                <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                  {deactivateTargetState ? 'Company Profile is Live!' : 'Profile Temporarily Hidden'}
                </h2>
                <p className={`text-sm font-semibold leading-relaxed mb-6 max-w-xs ${muted}`}>
                  {deactivateTargetState
                    ? 'Your corporate profile and job postings are now visible to applicants again. Welcome back!'
                    : 'Your company profile and active job postings are now hidden. You can reactivate anytime.'}
                </p>

                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="w-full py-3.5 rounded-2xl bg-[#2C7FFF] text-[#f4f4f4] font-black text-sm uppercase tracking-wider shadow-md hover:bg-[#03045E] transition-all duration-300 cursor-pointer border-2 border-[#2C7FFF]"
                >
                  Got it
                </button>
              </div>
            )}

            {deactivateStage === 'error' && (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#03045E]/20 flex items-center justify-center">
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

                <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                  Something went wrong
                </h2>
                <p className={`text-sm font-semibold leading-relaxed mb-6 max-w-xs ${muted}`}>
                  We couldn't update your account status. Please try again in a moment.
                </p>

                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="w-full py-3.5 rounded-2xl bg-[#2C7FFF] text-[#f4f4f4] font-black text-sm uppercase tracking-wider shadow-md hover:bg-[#03045E] transition-all duration-300 cursor-pointer border-2 border-[#2C7FFF]"
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