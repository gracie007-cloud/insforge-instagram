import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import styles from './AuthCallback.module.css';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const result = await authService.handleOAuthCallback();
      
      if (result.success) {
        // Redirect to home page after successful OAuth
        navigate('/');
      } else {
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      console.error('OAuth callback error:', err);
      setError('An error occurred during authentication.');
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {error ? (
          <>
            <div className={styles.error}>{error}</div>
            <p>Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className={styles.spinner}></div>
            <p>Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}