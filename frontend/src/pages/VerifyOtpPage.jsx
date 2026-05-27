import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authApi } from '../api/services';
import { toast } from 'react-toastify';

const VerifyOtpPage = () => {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email from routing state if available
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required.');
      return;
    }
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtp({ email, otp });
      toast.success('Account verified and logged in successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email address to resend the code.');
      return;
    }

    setIsResending(true);
    try {
      await authApi.resendOtp({ email });
      toast.success('A new verification code has been sent to your email.');
      setResendTimer(60); // 60 seconds cooldown
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#c9e1eb' }}>
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl border border-white/10" style={{ background: '#255169' }}>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Verify Your Account</h1>
          <p className="text-sm mt-2 text-white/75">
            Enter the 6-digit code sent to your email address.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full border border-white/30 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              style={{ background: '#ffffff', color: '#1e293b' }}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white block text-center">Verification Code</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              className="w-full border border-white/30 rounded-lg py-4 text-center text-3xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-mono"
              style={{ background: '#ffffff', color: '#1e293b' }}
              required
            />
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full font-bold py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            style={{ background: '#ffffff', color: '#255169' }}
          >
            {isSubmitting ? 'Verifying account…' : 'Activate Account'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-white/70">
            Didn't receive the email?{' '}
            <button
              onClick={handleResend}
              disabled={resendTimer > 0 || isResending}
              className="font-bold text-white hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline"
            >
              {resendTimer > 0 ? `Resend code in ${resendTimer}s` : isResending ? 'Resending…' : 'Resend OTP'}
            </button>
          </p>

          <p className="text-sm text-white/60">
            Need to register again?{' '}
            <Link to="/register" className="font-semibold text-white hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
