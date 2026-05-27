import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const fieldClass = (hasError) =>
  `w-full border rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 transition-all ${
    hasError ? 'border-red-400' : 'border-white/30'
  }`;

const RegisterPage = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {},
  });

  const onSubmit = async (data) => {
    try {
      await signup({ ...data, role: 'parking_attendant' });
      toast.success('Registration successful! An OTP code has been sent to your email.');
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#c9e1eb' }}>
      <div className="w-full max-w-2xl p-8 rounded-2xl shadow-lg" style={{ background: '#255169' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Attendant signup</h1>
          <p className="text-sm mt-1 text-white/75">Register as a parking attendant</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm text-white">First name</label>
            <input
              {...register('firstName')}
              type="text"
              placeholder="John"
              className={fieldClass(errors.firstName)}
              style={{ background: '#ffffff', color: '#1e293b' }}
            />
            {errors.firstName && <p className="text-xs text-red-200">{errors.firstName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-white">Last name</label>
            <input
              {...register('lastName')}
              type="text"
              placeholder="Doe"
              className={fieldClass(errors.lastName)}
              style={{ background: '#ffffff', color: '#1e293b' }}
            />
            {errors.lastName && <p className="text-xs text-red-200">{errors.lastName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-white">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="john@example.com"
              className={fieldClass(errors.email)}
              style={{ background: '#ffffff', color: '#1e293b' }}
            />
            {errors.email && <p className="text-xs text-red-200">{errors.email.message}</p>}
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm text-white">Password</label>
            <input
              {...register('password')}
              type="password"
              minLength={6}
              placeholder="At least 6 characters"
              className={fieldClass(errors.password)}
              style={{ background: '#ffffff', color: '#1e293b' }}
            />
            {errors.password ? (
              <p className="text-xs text-red-200">{errors.password.message}</p>
            ) : (
              <p className="text-xs text-white/60">Must be at least 6 characters</p>
            )}
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="md:col-span-2 w-full font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ background: '#ffffff', color: '#255169' }}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/75">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
