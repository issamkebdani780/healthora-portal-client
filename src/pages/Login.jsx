import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { authService } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpPhase, setIsOtpPhase] = useState(false);
  const [userExists, setUserExists] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.checkPhone(phone);
      // Backend should return if user exists, wait, mobile app does:
      // response.data could be { exists: true/false } or something similar
      setUserExists(response.exists); 
      setIsOtpPhase(true);
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (userExists === true || userExists === undefined) {
        // Assume user exists or we don't know, try verifying
        await authService.verifyOtp(phone, otp);
        navigate('/dashboard'); // Go directly to dashboard after login
      } else {
        // User does not exist, navigate to signup
        navigate('/register', { state: { phone } });
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50 min-h-[80vh]">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-200/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-primary-600 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-6">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          {isOtpPhase ? 'Verification' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {isOtpPhase 
            ? `Enter the code sent to ${phone}`
            : 'Sign in to manage your appointments.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-10 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] sm:rounded-[2rem] sm:px-10 border border-white">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {!isOtpPhase ? (
            <form className="space-y-6" onSubmit={handlePhoneSubmit}>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50/50 text-slate-900 placeholder-slate-400 outline-none transition-all"
                    placeholder="05 XX XX XX XX"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-primary-600/20 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70"
                >
                  {loading ? 'Sending code...' : 'Continue'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-slate-700 mb-2">
                  OTP Code
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50/50 text-slate-900 placeholder-slate-400 outline-none tracking-widest text-lg font-bold"
                    placeholder="----"
                    maxLength={6}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-primary-600/20 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOtpPhase(false)}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  Change phone number
                </button>
              </div>
            </form>
          )}

          {!isOtpPhase && (
            <p className="mt-6 text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500 transition-colors">
                Create one for free
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
