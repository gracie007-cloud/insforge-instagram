import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import GoogleButton from '../components/GoogleButton';
import styles from './Auth.module.css';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register(
        formData.email,
        formData.password,
        formData.username,
        formData.name
      );
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const authUrl = await authService.getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      setError('Failed to connect with Google');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.logo}>Instagram</h1>
        <p className={styles.subtitle}>
          Sign up to see photos and videos from your friends.
        </p>
        
        <GoogleButton onClick={handleGoogleSignup} text="Sign up with Google" />
        
        <div className={styles.divider}>
          <span>OR</span>
        </div>
        
        <form className={styles.authForm} onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className={styles.input}
          />
          
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={styles.input}
          />
          
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            className={styles.input}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
            className={styles.input}
          />
          
          {error && <div className={styles.error}>{error}</div>}
          
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        
        <p className={styles.terms}>
          By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
        </p>
      </div>
      
      <div className={styles.authBox}>
        <p>
          Have an account? <Link to="/login" className={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );
}