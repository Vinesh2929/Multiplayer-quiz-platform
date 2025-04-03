// Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return setError('Please fill in all fields');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      // Call the register function from AuthContext; it handles hashing internally
      await register(formData.name, formData.email, formData.password);
      alert("Registration successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || 'Failed to create an account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create an Account</h2>
        <p className="auth-subtitle">Join Quizzly to create and play interactive quizzes</p>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Input fields as before */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input type="text" id="name" name="name" className="form-control"
              value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input type="email" id="email" name="email" className="form-control"
              value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" id="password" name="password" className="form-control"
              value={formData.password} onChange={handleChange} placeholder="Create a password" required />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" className="form-control"
              value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
          </div>
          <div className="form-group terms">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to the{' '}
              <Link to="/terms" className="auth-link">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="auth-link">Privacy Policy</Link>
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="auth-alternative">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
