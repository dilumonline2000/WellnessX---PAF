import React, { useState } from 'react';
import { FaUserCircle, FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';
import GoogalLogo from './img/glogo.png'
import { IoMdAdd } from "react-icons/io";

function UserRegister() {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        phone: '',
        skills: [],
        bio: '', // Added bio field
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // State for previewing the selected image
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [userEnteredCode, setUserEnteredCode] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [currentStep, setCurrentStep] = useState(1);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleAddSkill = () => {
        if (skillInput.trim()) {
            setFormData({ ...formData, skills: [...formData.skills, skillInput] });
            setSkillInput('');
        }
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

    const triggerFileInput = () => {
        document.getElementById('profilePictureInput').click();
    };

    const sendVerificationCode = async (email) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('verificationCode', code);
        try {
            await fetch('http://localhost:8080/sendVerificationCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
        } catch (error) {
            console.error('Error sending verification code:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isValid = true;

        if (!formData.email) {
            alert("Email is required");
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            alert("Email is invalid");
            isValid = false;
        }

        if (!profilePicture) {
            alert("Profile picture is required");
            isValid = false;
        }
        if (formData.skills.length < 2) {
            alert("Please add at least two skills.");
            isValid = false;
        }
        if (!isValid) {
            return; // Stop execution if validation fails
        }

        try {
            // Step 1: Create the user
            const response = await fetch('http://localhost:8080/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullname: formData.fullname,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    skills: formData.skills,
                    bio: formData.bio, // Include bio in the request
                }),
            });

            if (response.ok) {
                const userId = (await response.json()).id; // Get the user ID from the response

                // Step 2: Upload the profile picture
                if (profilePicture) {
                    const profileFormData = new FormData();
                    profileFormData.append('file', profilePicture);
                    await fetch(`http://localhost:8080/user/${userId}/uploadProfilePicture`, {
                        method: 'PUT',
                        body: profileFormData,
                    });
                }

                sendVerificationCode(formData.email); // Send verification code
                setIsVerificationModalOpen(true); // Open verification modal
            } else if (response.status === 409) {
                alert('Email already exists!');
            } else {
                alert('Failed to register user.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleVerifyCode = () => {
        const savedCode = localStorage.getItem('verificationCode');
        if (userEnteredCode === savedCode) {
            alert('Verification successful!');
            localStorage.removeItem('verificationCode');
            window.location.href = '/';
        } else {
            alert('Invalid verification code. Please try again.');
        }
    };

    const nextStep = () => {
        if (currentStep === 1) {
            // Validate first step fields
            if (!formData.fullname) {
                alert("Full name is required");
                return;
            }
            if (!formData.email) {
                alert("Email is required");
                return;
            } 
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                alert("Email is invalid");
                return;
            }
            if (!formData.password) {
                alert("Password is required");
                return;
            }
            if (!profilePicture) {
                alert("Profile picture is required");
                return;
            }
        }
        setCurrentStep(2);
    };

    const prevStep = () => {
        setCurrentStep(1);
    };

    const renderStep1 = () => (
        <div className="glass-input-wrapper">
            <div className="profile-upload-section">
                <div className="profile-icon-container" onClick={triggerFileInput}>
                    {previewImage ? (
                        <img
                            src={previewImage}
                            alt="Selected Profile"
                            className="profile-preview"
                        />
                    ) : (
                        <FaUserCircle className="default-profile-icon" />
                    )}
                </div>
                <input
                    id="profilePictureInput"
                    className="hidden-input"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                />
                <p className="upload-label">Profile Picture</p>
            </div>

            <div className="glass-input-group">
                <label>
                    <FaUserCircle />
                    <span>Full Name</span>
                </label>
                <input
                    type="text"
                    name="fullname"
                    placeholder="Enter your full name"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    required
                />
            </div>
            
            <div className="glass-input-group">
                <label>
                    <FaEnvelope />
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
                    <FaLock />
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

            <button type="button" onClick={nextStep} className="custom-button primary-gradient">
                <span>Next</span>
                <span className="arrow-icon">→</span>
            </button>
        </div>
    );
    const renderStep2 = () => (
        <div className="glass-input-wrapper">
            <div className="glass-input-group">
                <label>
                    <FaPhone />
                    <span>Phone Number</span>
                </label>
                <input
                    type="text"
                    name="phone"
                    placeholder="10-digit phone number"
                    value={formData.phone}
                    onChange={(e) => {
                        const re = /^[0-9\b]{0,10}$/;
                        if (re.test(e.target.value)) {
                            handleInputChange(e);
                        }
                    }}
                    minLength="10"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    title="Please enter exactly 10 digits."
                    required
                />
            </div>
            <div className="glass-input-group">
                <label>
                    <span>Skills</span>
                </label>
                <div className="skills-container">
                    {formData.skills.map((skill, index) => (
                        <span className="skill-tag" key={index}>
                            {skill}
                        </span>
                    ))}
                </div>
                <div className="add-skill-row">
                    <input
                        type="text"
                        placeholder="Add a skill"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                    />
                    <button
                        type="button"
                        className="add-skill-btn"
                        onClick={handleAddSkill}
                    >
                        <IoMdAdd />
                    </button>
                </div>
            </div>
            <div className="glass-input-group">
                <label>
                    <span>Bio</span>
                </label>
                <textarea
                    name="bio"
                    placeholder="Tell us about yourself"
                    value={formData.bio}
                    rows={3}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="stepper-buttons">
                <button type="button" onClick={prevStep} className="custom-button secondary-button half-width">
                    <span className="back-arrow">←</span>
                    <span>Back</span>
                </button>
                <button type="submit" className="custom-button primary-gradient half-width">
                    <span>Register</span>
                </button>
            </div>
        </div>
    );
    return (
        <div className="glass-login-container">
            <div className="glass-login-card register-card">
                <div className="glass-brand">
                    <div className="glass-tagline">Your journey to wellness begins here</div>
                    <h1>WellnessX</h1>
                </div>
                <div className="step-indicator">
                    <div className={`step ${currentStep === 1 ? 'active' : ''}`}>1</div>
                    <div className="step-line"></div>
                    <div className={`step ${currentStep === 2 ? 'active' : ''}`}>2</div>
                </div>
                
                <form onSubmit={handleSubmit} className="glass-form">
                    {currentStep === 1 ? renderStep1() : renderStep2()}
                </form>
                
                <div className="divider-or">
                    <span>or</span>
                </div>
                
                <button
                    type="button"
                    onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                    className="custom-button google-button"
                >
                    <img src={GoogalLogo} alt="Google" className="google-icon" />
                    <span>Continue with Google</span>
                </button>
                
                <div className="glass-signup">
                    <p>Already have an account? <a href="/">Sign In</a></p>
                </div>
            </div>
            {isVerificationModalOpen && (
                <div className="glass-modal-content verification-modal">
                    <div className="glass-circles">
                        <h3>Verify Your Email</h3>
                        <p>Please enter the verification code sent to your email.</p>
                        <input
                            type="text"
                            value={userEnteredCode}
                            onChange={(e) => setUserEnteredCode(e.target.value)}
                            placeholder="Enter verification code"
                            className="verification-input"
                        />
                        <button onClick={handleVerifyCode} className="glass-button primary">
                            Verify
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserRegister;