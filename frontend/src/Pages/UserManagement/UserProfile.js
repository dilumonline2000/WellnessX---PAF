import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaTools, FaEdit, FaTrash, FaBook, FaLightbulb, FaMedal, FaChevronRight } from 'react-icons/fa';
import './UserProfile.css';
import NavBar from '../../Components/NavBar/NavBar';

export const fetchUserDetails = async (userId) => {
    try {
        const response = await fetch(`http://localhost:8080/user/${userId}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch user details');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};

function UserProfile() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userID');
        if (userId) {
            fetchUserDetails(userId).then((data) => setUserData(data));
        }
    }, []);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete your profile?")) {
            const userId = localStorage.getItem('userID');
            fetch(`http://localhost:8080/user/${userId}`, {
                method: 'DELETE',
            })
                .then((response) => {
                    if (response.ok) {
                        alert("Profile deleted successfully!");
                        localStorage.removeItem('userID');
                        navigate('/'); // Redirect to home or login page
                    } else {
                        alert("Failed to delete profile.");
                    }
                })
                .catch((error) => console.error('Error:', error));
        }
    };

    return (
        <div className="profile-dashboard">
            <NavBar />
            <div className="dashboard-container">
                {userData && userData.id === localStorage.getItem('userID') && (
                    <>
                        <header className="dashboard-header">
                            <div className="user-welcome">
                                <h1>Welcome, {userData.fullname?.split(' ')[0]}</h1>
                                <p>Manage your personal profile and activities</p>
                            </div>
                        </header>

                        <div className="dashboard-grid">
                            <section className="profile-overview card">
                                <div className="card-header">
                                    <h2>Profile Overview</h2>
                                    <button 
                                        className="icon-button edit-button"
                                        onClick={() => navigate(`/updateUserProfile/${userData.id}`)}
                                        aria-label="Edit profile"
                                    >
                                        <FaEdit />
                                    </button>
                                </div>

                                <div className="profile-content">
                                    <div className="profile-photo-container">
                                        {userData.profilePicturePath ? (
                                            <img
                                                src={`http://localhost:8080/uploads/profile/${userData.profilePicturePath}`}
                                                alt={userData.fullname}
                                                className="profile-photo"
                                            />
                                        ) : (
                                            <div className="profile-photo-placeholder">
                                                {userData.fullname?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="profile-details">
                                        <h3 className="user-fullname">{userData.fullname}</h3>
                                        {userData.bio && <p className="user-bio">{userData.bio}</p>}
                                        
                                        <ul className="contact-details">
                                            <li>
                                                <FaEnvelope className="contact-icon" />
                                                <span>{userData.email}</span>
                                            </li>
                                            <li>
                                                <FaPhone className="contact-icon" />
                                                <span>{userData.phone || "Not provided"}</span>
                                            </li>
                                            <li>
                                                <FaTools className="contact-icon" />
                                                <span>{userData.skills?.join(', ') || "No skills listed"}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <button 
                                        className="danger-button" 
                                        onClick={handleDelete}
                                    >
                                        <FaTrash className="button-icon" /> Delete Account
                                    </button>
                                </div>
                            </section>

                            <section className="activity-links card">
                                <div className="card-header">
                                    <h2>My Activities</h2>
                                </div>
                                
                                <ul className="activity-list">
                                    <li onClick={() => navigate('/myLearningPlan')}>
                                        <div className="activity-icon learning">
                                            <FaBook />
                                        </div>
                                        <div className="activity-info">
                                            <h3>Learning Plans</h3>
                                            <p>View and manage your learning journey</p>
                                        </div>
                                        <FaChevronRight className="chevron-icon" />
                                    </li>
                                    
                                    <li onClick={() => navigate('/myAllPost')}>
                                        <div className="activity-icon posts">
                                            <FaLightbulb />
                                        </div>
                                        <div className="activity-info">
                                            <h3>My Skill Posts</h3>
                                            <p>See posts you've shared with the community</p>
                                        </div>
                                        <FaChevronRight className="chevron-icon" />
                                    </li>
                                    
                                    <li onClick={() => navigate('/myAchievements')}>
                                        <div className="activity-icon achievements">
                                            <FaMedal />
                                        </div>
                                        <div className="activity-info">
                                            <h3>Achievements</h3>
                                            <p>Track your milestones and progress</p>
                                        </div>
                                        <FaChevronRight className="chevron-icon" />
                                    </li>
                                </ul>
                            </section>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default UserProfile;
