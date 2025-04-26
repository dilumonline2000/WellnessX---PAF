import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './user.css'
import GoogalLogo from './img/glogo.png'

function UserLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userID', data.id); // Save user ID in local storage
        alert('Login successful!');
        navigate('/allPost');
      } else if (response.status === 401) {
        alert('Invalid credentials!');
      } else {
        alert('Failed to login!');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="glass-login-container">
      <div className="glass-login-card">
        <div className="glass-brand">
          <h1>WellnessX</h1>
          <div className="glass-tagline">Your journey to wellness begins here</div>
        </div>
        
        <h2 className="glass-heading">Sign In</h2>
        
        <form onSubmit={handleSubmit} className="glass-form">
          <div className="glass-input-wrapper">
            <div className="glass-input-group">
              <label>
                <i className="fas fa-envelope"></i>
                <span>Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="youremail@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="glass-input-group">
              <label>
                <i className="fas fa-lock"></i>
                <span>Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="glass-form-footer">
              <div className="glass-remember">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <div className="glass-forgot">
                <a href="#">Forgot password?</a>
              </div>
            </div>
          </div>
          
          <button type="submit" className="glass-button primary" style={{ width: '100%', marginTop: '10px', marginBottom: '10px' }}>
            <span>Sign In</span>
            <i className="fas fa-arrow-right"></i>
          </button>
          
          <div className="glass-separator">
            <span>or</span>
          </div>
          
          <button 
            type="button"
            onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
            className="glass-button google"
            style={{ width: '100%', marginTop: '10px' }}
          >
            <img src={GoogalLogo} alt="Google" />
            <span>Continue with Google</span>
          </button>
        </form>
        
        <div className="glass-signup">
          <p>Don't have an account? <a href="/register">Create account</a></p>
        </div>
        
        <div className="glass-circles">
          <div className="circle-1"></div>
          <div className="circle-2"></div>
          <div className="circle-3"></div>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
