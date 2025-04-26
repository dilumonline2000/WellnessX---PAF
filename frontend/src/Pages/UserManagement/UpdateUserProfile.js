import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import NavBar from '../../Components/NavBar/NavBar';
import { IoCloudUploadOutline, IoCloseOutline } from "react-icons/io5";

function UpdateUserProfile() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
    skills: [], // Added skills field
    bio: '', // Added bio field
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // State for previewing the selected image
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check for dark mode on component mount and when system preference changes
  useEffect(() => {
    // Check if user has set a preference in localStorage
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setIsDarkMode(savedMode === 'true');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }

    // Listen for changes in system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply dark mode styles
  const labelStyle = {
    color: isDarkMode ? 'white' : 'inherit'
  };
  
  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput] });
      setSkillInput('');
    }
  };
  
  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };
  
  useEffect(() => {
    fetch(`http://localhost:8080/user/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then((data) => setFormData(data))
      .catch((error) => console.error('Error:', error));
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        if (profilePicture) {
          const formData = new FormData();
          formData.append('file', profilePicture);
          await fetch(`http://localhost:8080/user/${id}/uploadProfilePicture`, {
            method: 'PUT',
            body: formData,
          });
        }
        alert('Profile updated successfully!');
        navigate('/userProfile'); // Use navigate instead of window.location
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className={`modern-layout ${isDarkMode ? 'dark-mode' : ''}`}>
      <NavBar/>
      
      <main className="modern-content">
        <div className="header-container">
          <h1 style={isDarkMode ? {color: 'white'} : {}}>Update Profile</h1>
        </div>
        
        <div className="modern-card create-post-card">
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-group">
              <label htmlFor="fullname" style={labelStyle}>Full Name</label>
              <input
                id="fullname"
                className="modern-input"
                type="text"
                name="fullname"
                placeholder="Enter your full name"
                value={formData.fullname}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" style={labelStyle}>Email Address</label>
              <input
                id="email"
                className="modern-input"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" style={labelStyle}>Password</label>
              <input
                id="password"
                className="modern-input"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone" style={labelStyle}>Phone</label>
              <input
                id="phone"
                className="modern-input"
                type="text"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => {
                  const re = /^[0-9\b]{0,10}$/;
                  if (re.test(e.target.value)) {
                    handleInputChange(e);
                  }
                }}
                maxLength="10"
                pattern="[0-9]{10}"
                title="Please enter exactly 10 digits."
                required
              />
            </div>
            
            <div className="form-group">
              <label style={labelStyle}>Skills</label>
              {formData.skills && formData.skills.length > 0 && (
                <div className="tags-container">
                  {formData.skills.map((skill, index) => (
                    <div className="tag" key={index}>
                      <span>{skill}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(skill)}
                        className="tag-remove"
                      >
                        <IoCloseOutline />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="tag-input-container">
                <input
                  className="modern-input"
                  type="text"
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if(e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <button 
                  type="button"
                  className="tag-add-button"
                  onClick={handleAddSkill}
                >
                  <IoMdAdd />
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="bio" style={labelStyle}>Bio</label>
              <textarea
                id="bio"
                className="modern-input modern-textarea"
                name="bio"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label style={labelStyle}>Profile Picture</label>
              
              {(previewImage || formData.profilePicturePath) && (
                <div className="media-preview-container profile-preview">
                  <img 
                    src={previewImage || `http://localhost:8080/uploads/profile/${formData.profilePicturePath}`}
                    alt="Profile Preview" 
                    className="media-preview" 
                  />
                </div>
              )}
              
              <div className="file-upload-container">
                <label htmlFor="profile-upload" className="file-upload-label">
                  <IoCloudUploadOutline />
                  <span>Choose Profile Picture</span>
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="file-upload-input"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="modern-button primary-button">
                Update Profile
              </button>
              <button 
                type="button" 
                className="modern-button secondary-button"
                onClick={() => navigate('/userProfile')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default UpdateUserProfile;
