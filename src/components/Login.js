import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setErrors({ general: result.error });
    }
  };

  const handleDemoLogin = async () => {
    const result = await login('demo@taskmanager.com', 'demo123');
    if (!result.success) {
      setErrors({ general: result.error });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back!</h2>
        <p className="auth-subtitle">Sign in to your account</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          
          <button type="button" className="demo-button" onClick={handleDemoLogin} disabled={loading}>
            🚀 Try Demo Account
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? 
            <button className="link-button" onClick={onToggleMode}>
              Sign Up
            </button>
          </p>
        </div>
        
        <div className="demo-accounts">
          <h4>Demo Accounts:</h4>
          <div className="demo-account">
            <strong>Admin:</strong> admin@taskmanager.com / admin123
          </div>
          <div className="demo-account">
            <strong>User:</strong> user@taskmanager.com / user123
          </div>
          <div className="demo-account">
            <strong>Demo:</strong> demo@taskmanager.com / demo123
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;