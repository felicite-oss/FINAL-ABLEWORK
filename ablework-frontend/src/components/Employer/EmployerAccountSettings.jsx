import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../../context/AccessibilityContext';

export default function EmployerAccountSettings({ profile }) {
  const navigate = useNavigate();
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isDark = isContrast || isDarkMode;

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

  const pageBg = isDark ? 'bg-black' : 'bg-[#F4F4F4]';
  const pageText = isDark ? 'text-white' : 'text-[#03045E]';
  const panelBg = isDark ? 'bg-black border-white' : 'bg-[#F4F4F4] border-[#03045E]';
  const cardBg = isDark ? 'bg-black border-white' : 'bg-white border-[#03045E]';
  const cardHover = isDark ? 'hover:border-white' : 'hover:border-[#2C7FFF]';
  const cardActive = isDark ? 'border-white' : 'border-[#2C7FFF]';
  const softBg = isDark ? 'bg-black border-white' : 'bg-[#F4F4F4] border-[#03045E]';
  const muted = isDark ? 'text-white/80' : 'text-[#03045E]/80';
  const subtle = isDark ? 'text-white/60' : 'text-[#03045E]/60';
  const divider = isDark ? 'border-white/40' : 'border-[#03045E]/20';
  const inputCls = isDark
    ? 'w-full p-3.5 border-2 border-white bg-black rounded-xl text-white placeholder-white/40 focus:border-white outline-none transition font-medium'
    : 'w-full p-3.5 border-2 border-[#03045E] bg-white rounded-xl text-[#03045E] placeholder-[#03045E]/40 focus:border-[#2C7FFF] outline-none transition font-medium';
  const disabledInputCls = isDark
    ? 'w-full p-3.5 bg-black border-2 border-white/40 rounded-xl text-white/50 outline-none cursor-not-allowed font-medium'
    : 'w-full p-3.5 bg-[#F4F4F4] border-2 border-[#03045E]/30 rounded-xl text-[#03045E]/50 outline-none cursor-not-allowed font-medium';
  const cancelBtn = isDark
    ? 'px-6 py-3.5 bg-black border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-black transition cursor-pointer'
    : 'px-6 py-3.5 bg-[#F4F4F4] border-2 border-[#03045E] text-[#03045E] font-bold rounded-xl hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF] transition cursor-pointer';
  const primaryBtn = isDark
    ? 'px-6 py-3.5 bg-white text-black font-black rounded-xl hover:bg-black hover:text-white transition disabled:opacity-50 cursor-pointer border-2 border-white'
    : 'px-6 py-3.5 bg-[#03045E] text-white font-black rounded-xl hover:bg-[#2C7FFF] transition disabled:opacity-50 cursor-pointer border-2 border-[#03045E] hover:border-[#2C7FFF]';
  const secondaryBtn = isDark
    ? 'w-full sm:w-auto px-6 py-3.5 bg-white text-black font-black rounded-xl transition disabled:opacity-50 cursor-pointer border-2 border-white hover:bg-black hover:text-white'
    : 'w-full sm:w-auto px-6 py-3.5 bg-[#03045E] text-white font-black rounded-xl transition disabled:opacity-50 cursor-pointer border-2 border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]';
  const successMsg = isDark
    ? 'bg-white text-black border-white'
    : 'bg-[#2C7FFF] text-white border-[#2C7FFF]';
  const errorMsg = isDark
    ? 'bg-black text-white border-white'
    : 'bg-white text-[#03045E] border-[#03045E]';

  const dangerCardBg = isDark
    ? 'bg-black border-white'
    : 'bg-white border-[#03045E]';
  const dangerCardHover = isDark ? 'hover:border-white' : 'hover:border-[#2C7FFF]';
  const dangerActive = isDark ? 'border-white' : 'border-[#2C7FFF]';
  const dangerText = isDark ? 'text-white' : 'text-[#FF0000]';
  const dangerSub = isDark ? 'text-white/80' : 'text-[#FF0000]/80';
  const dangerDivider = isDark ? 'border-white/40' : 'border-[#03045E]/20';
  const dangerInner = isDark ? 'text-white' : 'text-[#FF0000]';
  const dangerInnerSub = isDark ? 'text-white/80' : 'text-[#FF0000]/80';

  const eyeIconClass = isDark
    ? 'absolute right-4 top-1/2 -translate-y-1/2 transition cursor-pointer text-white/60 hover:text-white'
    : 'absolute right-4 top-1/2 -translate-y-1/2 transition cursor-pointer text-[#03045E]/50 hover:text-[#2C7FFF]';

  const triggerAlert = (tone, pill, title, subtitle) => {
    setAlertConfig({ tone, pill, title, subtitle });
    setShowAlert(true);
  };

  const renderAlertIcon = (tone) => {
    const iconColor = isDark ? 'text-black' : 'text-white';
    if (tone === 'email') {
      return (
        <svg className={`w-7 h-7 ${iconColor}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
    if (tone === 'password') {
      return (
        <svg className={`w-7 h-7 ${iconColor}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    }
    if (tone === 'verification') {
      return (
        <svg className={`w-7 h-7 ${iconColor}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    if (tone === 'deactivate') {
      return (
        <svg className={`w-7 h-7 ${iconColor}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      );
    }
    if (tone === 'reactivate') {
      return (
        <svg className={`w-7 h-7 ${iconColor}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }
    return (
      <svg className={`w-7 h-7 ${iconColor}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  const getAlertBadge = () => isDark ? 'bg-white' : 'bg-[#2C7FFF]';
  const getAlertRing = () => isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/20';

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
    <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-white' : 'text-[#03045E]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
  );

  return (
    <div className={`animate-fadeIn max-w-7xl mx-auto pb-10 ${pageText}`}>
      
      <div className={`relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-6 sm:p-8 rounded-3xl border-2 ${panelBg}`}>
        <div className={`absolute top-0 left-0 w-1.5 h-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></div>
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${isDark ? 'bg-white/10' : 'bg-[#2C7FFF]/10'}`}></div>
        <div className={`absolute -bottom-20 right-20 w-40 h-40 rounded-full ${isDark ? 'bg-white/5' : 'bg-[#03045E]/5'}`}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>Settings Hub</span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#03045E]'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></span>
              Secure Portal
            </span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${pageText}`}>Account Settings</h1>
          <p className={`text-sm font-bold mt-2 max-w-xl ${muted}`}>Manage your security credentials and corporate verification documents.</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">

        <div className={`relative rounded-3xl border-2 overflow-hidden transition-all duration-300 ${openSection === 'verification' ? cardActive : cardHover} ${cardBg}`}>
          <div className={`absolute top-0 left-0 w-1 h-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></div>
          <button onClick={() => toggleSection('verification')} className="w-full p-6 sm:p-7 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="flex items-center gap-4 text-left">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`}>Section 01</p>
                <h2 className={`text-lg font-black tracking-tight ${pageText}`}>Verification Status</h2>
                <p className={`text-xs mt-0.5 font-semibold ${subtle}`}>Check your corporate standing and manage documents.</p>
              </div>
            </div>
            <ChevronIcon isOpen={openSection === 'verification'} />
          </button>

          {openSection === 'verification' && (
            <div className={`px-6 pb-6 sm:px-7 sm:pb-7 border-t-2 pt-6 ${divider}`}>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-1">
                  <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-2 ${subtle}`}>Current Standing</p>
                  {profile?.verification_status === 'Approved' && (
                    <span className={`inline-flex items-center gap-2 px-4 py-2 font-black text-sm rounded-xl border-2 ${isDark ? 'bg-white text-black border-white' : 'bg-[#2C7FFF] text-white border-[#2C7FFF]'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      Approved
                    </span>
                  )}
                  {profile?.verification_status === 'Pending' && (
                    <span className={`inline-flex items-center gap-2 px-4 py-2 font-black text-sm rounded-xl border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-[#03045E]'}`}>
                      <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></span>
                      Pending Review
                    </span>
                  )}
                  {isRejected && (
                    <span className={`inline-flex items-center gap-2 px-4 py-2 font-black text-sm rounded-xl border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-[#03045E]'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      Action Required
                    </span>
                  )}
                  
                  <div className="mt-5">
                    <a href={`http://localhost:5001/${profile?.verification_document?.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 text-sm font-black ${isDark ? 'text-white hover:text-white/70' : 'text-[#2C7FFF] hover:text-[#03045E]'} transition`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      View Business Document on File
                    </a>
                  </div>
                </div>

                {isRejected && (
                  <div className={`flex-1 p-5 rounded-2xl border-2 w-full ${softBg}`}>
                    <h3 className={`text-sm font-black mb-2 ${pageText}`}>Re-verify Company</h3>
                    <p className={`text-xs mb-4 font-semibold ${muted}`}>
                      {canResubmit ? "Your cooldown has expired. Please upload a clear, valid Business Registration (DTI/SEC)." : `Security lock active. You can upload a new document in ${daysLeft} days.`}
                    </p>
                    
                    {verStatus.msg && (
                      <div className={`p-3 text-xs font-black rounded-xl mb-4 border-2 ${verStatus.type === 'error' ? errorMsg : successMsg}`}>{verStatus.msg}</div>
                    )}

                    <form onSubmit={handleResubmitVerification} className="flex flex-col gap-3">
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" disabled={!canResubmit || isResubmitting} onChange={(e) => setVerificationDoc(e.target.files[0])} className={`text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black disabled:opacity-50 cursor-pointer ${isDark ? 'file:bg-white file:text-black hover:file:bg-black hover:file:text-white' : 'file:bg-[#2C7FFF] file:text-white hover:file:bg-[#03045E]'} ${pageText}`} />
                      {canResubmit && (
                        <button type="submit" disabled={isResubmitting || !verificationDoc} className={`mt-2 py-2.5 font-black text-sm rounded-xl transition disabled:opacity-50 cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#2C7FFF] text-white border-[#2C7FFF] hover:bg-[#03045E] hover:border-[#03045E]'}`}>
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

        <div className={`relative rounded-3xl border-2 overflow-hidden transition-all duration-300 ${openSection === 'email' ? cardActive : cardHover} ${cardBg}`}>
          <div className={`absolute top-0 left-0 w-1 h-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></div>
          <button onClick={() => toggleSection('email')} className="w-full p-6 sm:p-7 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="flex items-center gap-4 text-left">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`}>Section 02</p>
                <h2 className={`text-lg font-black tracking-tight ${pageText}`}>Work Email Address</h2>
                <p className={`text-xs mt-0.5 font-semibold ${subtle}`}>Update your work email with OTP verification.</p>
              </div>
            </div>
            <ChevronIcon isOpen={openSection === 'email'} />
          </button>

          {openSection === 'email' && (
            <div className={`px-6 pb-6 sm:px-7 sm:pb-7 border-t-2 pt-6 ${divider}`}>
              
              {emailStatus.msg && (
                <div className={`p-4 mb-6 rounded-xl text-sm font-black border-2 ${emailStatus.type === 'error' ? errorMsg : successMsg}`}>
                  {emailStatus.msg}
                </div>
              )}

              {emailStep === 1 ? (
                <form onSubmit={handleRequestEmailUpdate} className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className={`text-[10px] font-black uppercase tracking-wider mb-1.5 block ${subtle}`}>New Work Email</label>
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
                      <label className={`text-[10px] font-black uppercase tracking-wider mb-1.5 block ${subtle}`}>New Work Email</label>
                      <input type="email" value={email} disabled className={disabledInputCls} />
                    </div>
                    <div className="flex-1 w-full">
                      <label className={`text-[10px] font-black uppercase tracking-wider mb-1.5 block ${subtle}`}>Verification Code</label>
                      <input type="text" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} required placeholder="6-digit code" maxLength="6" className={`${inputCls} tracking-[0.5em] font-mono text-center`} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button 
                      type="button" 
                      onClick={() => { setEmailStep(1); setEmailStatus({type:'', msg:''}); }} 
                      className={`px-6 py-3.5 font-black rounded-xl transition cursor-pointer border-2 ${isDark ? 'bg-black text-white border-white hover:bg-white hover:text-black' : ''}`}
                      style={isDark ? {} : {
                        color: 'var(--color-text, #03045E)',
                        backgroundColor: 'var(--color-card, #ffffff)',
                        borderColor: 'var(--color-primary, #2C7FFF)'
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isUpdatingEmail || emailOtp.length < 6} 
                      className={`px-6 py-3.5 font-black rounded-xl transition disabled:opacity-50 cursor-pointer border-2 w-full sm:w-auto ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : ''}`}
                      style={isDark ? {} : {
                        color: 'var(--color-button-text, #ffffff)',
                        backgroundColor: 'var(--color-primary, #2C7FFF)',
                        borderColor: 'var(--color-primary, #2C7FFF)'
                      }}
                    >
                      {isUpdatingEmail ? 'Verifying...' : 'Verify & Update Email'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className={`relative rounded-3xl border-2 overflow-hidden transition-all duration-300 ${openSection === 'password' ? cardActive : cardHover} ${cardBg}`}>
          <div className={`absolute top-0 left-0 w-1 h-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></div>
          <button onClick={() => toggleSection('password')} className="w-full p-6 sm:p-7 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="flex items-center gap-4 text-left">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`}>Section 03</p>
                <h2 className={`text-lg font-black tracking-tight ${pageText}`}>Change Password</h2>
                <p className={`text-xs mt-0.5 font-semibold ${subtle}`}>Update your account password securely.</p>
              </div>
            </div>
            <ChevronIcon isOpen={openSection === 'password'} />
          </button>

          {openSection === 'password' && (
            <div className={`px-6 pb-6 sm:px-7 sm:pb-7 border-t-2 pt-6 ${divider}`}>
              
              {passwordStatus.msg && (
                <div className={`p-4 mb-6 rounded-xl text-sm font-black border-2 ${passwordStatus.type === 'error' ? errorMsg : successMsg}`}>
                  {passwordStatus.msg}
                </div>
              )}

              {passwordStep === 1 ? (
                <form onSubmit={handleRequestPasswordUpdate} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5 w-full sm:max-w-md">
                    <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>Current Password</label>
                    <div className="relative">
                      <input type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className={`${inputCls} pr-12`} />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className={eyeIconClass}>
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
                      <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>New Password</label>
                      <div className="relative">
                        <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={`${inputCls} pr-12`} />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className={eyeIconClass}>
                          {showNewPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className={`text-[10px] font-black uppercase tracking-wider ${subtle}`}>Confirm New Password</label>
                      <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={`${inputCls} pr-12`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={eyeIconClass}>
                          {showConfirmPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                          )}
                        </button>
                      </div>
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
                      <label className={`text-[10px] font-black uppercase tracking-wider mb-1.5 block ${subtle}`}>Verification Code</label>
                      <input type="text" value={passwordOtp} onChange={(e) => setPasswordOtp(e.target.value)} required placeholder="6-digit code sent to email" maxLength="6" className={`${inputCls} tracking-[0.5em] font-mono text-center`} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button 
                      type="button" 
                      onClick={() => { setPasswordStep(1); setPasswordStatus({type:'', msg:''}); }} 
                      className={`px-6 py-3.5 font-black rounded-xl transition cursor-pointer border-2 ${isDark ? 'bg-black text-white border-white hover:bg-white hover:text-black' : ''}`}
                      style={isDark ? {} : {
                        color: 'var(--color-text, #03045E)',
                        backgroundColor: 'var(--color-card, #ffffff)',
                        borderColor: 'var(--color-primary, #2C7FFF)'
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isUpdatingPassword || passwordOtp.length < 6} 
                      className={`px-6 py-3.5 font-black rounded-xl transition disabled:opacity-50 cursor-pointer border-2 w-full sm:w-auto ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : ''}`}
                      style={isDark ? {} : {
                        color: 'var(--color-button-text, #ffffff)',
                        backgroundColor: 'var(--color-primary, #2C7FFF)',
                        borderColor: 'var(--color-primary, #2C7FFF)'
                      }}
                    >
                      {isUpdatingPassword ? 'Verifying...' : 'Verify & Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className={`relative rounded-3xl border-2 overflow-hidden transition-all duration-300 ${openSection === 'danger' ? dangerActive : dangerCardHover} ${dangerCardBg}`}>
          <div className={`absolute top-0 left-0 w-1 h-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></div>
          <button onClick={() => toggleSection('danger')} className="w-full p-6 sm:p-7 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer">
            <div className="flex items-center gap-4 text-left">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-white' : 'text-[#FF0000]'}`}>Section 04</p>
                <h2 className={`text-lg font-black tracking-tight ${dangerText}`}>Danger Zone</h2>
                <p className={`text-xs mt-0.5 font-semibold ${dangerSub}`}>Deactivate or permanently delete your corporate account.</p>
              </div>
            </div>
            <ChevronIcon isOpen={openSection === 'danger'} />
          </button>

          {openSection === 'danger' && (
            <div className={`px-6 pb-6 sm:px-7 sm:pb-7 border-t-2 pt-6 ${dangerDivider}`}>
              
              <div className={`p-5 rounded-2xl border-2 mb-4 ${isDark ? 'bg-black border-white' : 'bg-[#F4F4F4] border-[#03045E]'}`}>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-white' : 'bg-[#FF0000]'}`}></span>
                      <h3 className={`text-sm font-black ${dangerInner}`}>
                        {isDeactivated ? 'Account is Currently Deactivated' : 'Deactivate Account'}
                      </h3>
                    </div>
                    <p className={`text-xs mt-1 font-semibold ${dangerInnerSub}`}>
                      {isDeactivated 
                        ? 'Your company profile and active jobs are hidden. Reactivate to resume hiring.' 
                        : 'Temporarily hide your company profile and active job postings. You can reactivate later.'}
                    </p>
                  </div>
                  <button 
                    onClick={handleToggleDeactivation} 
                    className={`px-6 py-2.5 font-black rounded-xl transition whitespace-nowrap cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
                  >
                    {isDeactivated ? 'Reactivate Account' : 'Deactivate Account'}
                  </button>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border-2 ${isDark ? 'bg-black border-white' : 'bg-white border-[#03045E]'}`}>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-white' : 'bg-[#FF0000]'}`}></span>
                      <h3 className={`text-sm font-black ${dangerInner}`}>Delete Account</h3>
                    </div>
                    <p className={`text-xs mt-1 font-semibold ${dangerInnerSub}`}>Permanently erase your company data and job history. This action cannot be undone.</p>
                  </div>
                  <button 
                    onClick={() => setShowDeleteModal(true)} 
                    className={`px-6 py-2.5 font-black rounded-xl transition whitespace-nowrap cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl flex flex-col gap-4 animate-fadeIn border-2 ${cardBg}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-xl font-black ${pageText}`}>Confirm Deletion</h3>
                <p className={`text-xs font-bold ${subtle}`}>This cannot be undone</p>
              </div>
            </div>
            <p className={`text-sm font-semibold ${muted}`}>This will permanently delete your corporate account and all associated job postings. Please enter your password to confirm.</p>
            
            {dangerStatus.msg && (
              <div className={`p-3 text-sm font-black rounded-xl border-2 ${errorMsg}`}>{dangerStatus.msg}</div>
            )}

            <form onSubmit={handleDelete} className="flex flex-col gap-4 mt-2">
              <div className="relative">
                <input type={showDeletePassword ? "text" : "password"} value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required placeholder="Enter password" className={`${inputCls} pr-12`} />
                <button type="button" onClick={() => setShowDeletePassword(!showDeletePassword)} className={eyeIconClass}>
                  {showDeletePassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                  )}
                </button>
              </div>
              <div className="flex gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteModal(false)} 
                  className={`flex-1 py-3.5 font-black rounded-xl transition cursor-pointer border-2 ${isDark ? 'bg-black text-white border-white hover:bg-white hover:text-black' : ''}`}
                  style={isDark ? {} : {
                    color: 'var(--color-text, #03045E)',
                    backgroundColor: 'var(--color-card, #ffffff)',
                    borderColor: 'var(--color-primary, #2C7FFF)'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 py-3.5 font-black rounded-xl transition cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : ''}`}
                  style={isDark ? {} : {
                    color: 'var(--color-button-text, #ffffff)',
                    backgroundColor: 'var(--color-primary, #2C7FFF)',
                    borderColor: 'var(--color-primary, #2C7FFF)'
                  }}
                >
                  Confirm Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAlert && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative w-full max-w-sm rounded-[2rem] shadow-[0_25px_60px_rgba(3,4,94,0.4)] border-2 overflow-hidden animate-in zoom-in-95 duration-300 ${isDark ? 'bg-black border-white' : 'bg-[#F4F4F4] border-[#2C7FFF]'}`}>
            <div className={`h-2 w-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} />

            <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className={`absolute inset-0 rounded-full ${getAlertRing(alertConfig.tone)} animate-ping`} />
                <div className={`relative w-20 h-20 rounded-full ${getAlertRing(alertConfig.tone)} flex items-center justify-center`}>
                  <div className={`w-14 h-14 rounded-full ${getAlertBadge(alertConfig.tone)} flex items-center justify-center shadow-[0_10px_30px_rgba(44,127,255,0.5)]`}>
                    {renderAlertIcon(alertConfig.tone)}
                  </div>
                </div>
                <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 ${isDark ? 'bg-white border-black' : 'bg-[#03045E] border-[#F4F4F4]'}`}>
                  <svg className={`w-3.5 h-3.5 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
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
                className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeactivateModal && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative w-full max-w-sm rounded-[2rem] shadow-[0_25px_60px_rgba(3,4,94,0.4)] border-2 overflow-hidden animate-in zoom-in-95 duration-300 ${isDark ? 'bg-black border-white' : 'bg-[#F4F4F4] border-[#2C7FFF]'}`}>
            <div className={`h-2 w-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} />

            {deactivateStage === 'confirm' && (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className={`relative w-20 h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/20'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(44,127,255,0.5)] ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}>
                      {deactivateTargetState ? (
                        <svg className={`w-7 h-7 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className={`w-7 h-7 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
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
                    className={`flex-1 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider border-2 transition-all duration-300 cursor-pointer ${isDark ? 'bg-black text-white border-white hover:bg-white hover:text-black' : ''}`}
                    style={isDark ? {} : {
                      color: 'var(--color-text, #03045E)',
                      backgroundColor: 'var(--color-card, #ffffff)',
                      borderColor: 'var(--color-primary, #2C7FFF)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmToggleDeactivation}
                    className={`flex-1 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : ''}`}
                    style={isDark ? {} : {
                      color: 'var(--color-button-text, #ffffff)',
                      backgroundColor: 'var(--color-primary, #2C7FFF)',
                      borderColor: 'var(--color-primary, #2C7FFF)'
                    }}
                  >
                    {deactivateTargetState ? 'Reactivate' : 'Deactivate'}
                  </button>
                </div>
              </div>
            )}

            {deactivateStage === 'processing' && (
              <div className="px-8 py-12 flex flex-col items-center text-center">
                <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                  <div className={`absolute inset-0 rounded-full border-4 animate-pulse ${isDark ? 'border-white/25' : 'border-[#2C7FFF]/25'}`} />
                  <div className={`absolute inset-0 rounded-full border-4 border-r-transparent border-l-transparent animate-spin ${isDark ? 'border-t-white border-b-white' : 'border-t-[#2C7FFF] border-b-[#03045E]'}`} />
                  <div className={`w-8 h-8 rounded-full shadow-lg animate-ping opacity-70 absolute ${isDark ? 'bg-white' : 'bg-[#03045E]'}`} />
                </div>
                <h2 className={`text-xl font-black tracking-tight mb-1.5 ${pageText}`}>
                  {deactivateTargetState ? 'Reactivating Account' : 'Deactivating Account'}
                </h2>
                <p className={`text-xs font-bold ${muted}`}>
                  Applying your account status change...
                </p>
                <div className="flex items-center gap-1.5 mt-5">
                  <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} />
                  <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} style={{ animationDelay: '150ms' }} />
                  <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {deactivateStage === 'success' && (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className={`absolute inset-0 rounded-full animate-ping ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/20'}`} />
                  <div className={`relative w-20 h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/15'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(44,127,255,0.5)] ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}>
                      <svg className={`w-8 h-8 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 ${isDark ? 'bg-white border-black' : 'bg-[#03045E] border-[#F4F4F4]'}`}>
                    <svg className={`w-3.5 h-3.5 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
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
                  className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
                >
                  Got it
                </button>
              </div>
            )}

            {deactivateStage === 'error' && (
              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/20'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}>
                      <svg className={`w-8 h-8 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>

                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
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
                  className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer border-2 ${isDark ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
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