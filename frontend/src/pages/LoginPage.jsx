import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.isVerified === false) {
        toast.warning(err.response.data.message);
        navigate('/verify-otp', { state: { email: err.response.data.email } });
      } else {
        toast.error(err.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F3F4F6' }}>
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: '#1a1a1a' }}>
        <img
          src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&q=80"
          alt="Parking"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/60" />
        <div className="absolute top-8 left-8">
          <h1 className="text-3xl font-bold text-white">XWZ Parking</h1>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ background: '#FFFFFF' }}>
        <div
          className="w-full max-w-md p-8 rounded-2xl shadow-lg"
          style={{ background: '#255169' }}
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Welcome Back!</h2>
            <p className="text-sm mt-2 text-white/75">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="admin@xwz.com"
                className={`w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 transition-all ${
                  errors.email ? 'border-red-400' : 'border-white/30'
                }`}
                style={{ background: '#ffffff', color: '#1e293b' }}
              />
              {errors.email && <p className="text-xs text-red-200">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className={`w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 transition-all ${
                  errors.password ? 'border-red-400' : 'border-white/30'
                }`}
                style={{ background: '#ffffff', color: '#1e293b' }}
              />
              {errors.password && (
                <p className="text-xs text-red-200">{errors.password.message}</p>
              )}
            </div>

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: '#ffffff', color: '#255169' }}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/75">
            No account?{' '}
            <Link to="/register" className="font-semibold text-white hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
