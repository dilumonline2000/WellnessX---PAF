import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaRegUserCircle } from "react-icons/fa";
import { 
  IoHomeOutline, IoHome,
  IoBookmarkOutline, IoBookmark,
  IoTrophyOutline, IoTrophy,
  IoNotificationsOutline, IoNotifications,
  IoMenuOutline, IoCloseOutline,
  IoMoon, IoSunny,
  IoLogOutOutline,
  IoRestaurantOutline, IoRestaurant // Added meal-related icons
} from "react-icons/io5";
import axios from 'axios';
import './NavBar.css';
import Pro from './img/img.png';
import { fetchUserDetails } from '../../Pages/UserManagement/UserProfile';

function NavBar() {
    const [allRead, setAllRead] = useState(true);
    const [googleProfileImage, setGoogleProfileImage] = useState(null);
    const [userType, setUserType] = useState(null);
    const [userProfileImage, setUserProfileImage] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const userId = localStorage.getItem('userID');
    let lastScrollY = window.scrollY;

    useEffect(() => {
        // Handle notifications
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/notifications/${userId}`);
                const unreadNotifications = response.data.some(notification => !notification.read);
                setAllRead(!unreadNotifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };
        
        if (userId) {
            fetchNotifications();
        }
        
        // Check for dark mode preference
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') {
            setDarkMode(true);
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [userId]);

    useEffect(() => {
        // Get user profile info
        const storedUserType = localStorage.getItem('userType');
        setUserType(storedUserType);
        
        if (storedUserType === 'google') {
            const googleImage = localStorage.getItem('googleProfileImage');
            setGoogleProfileImage(googleImage);
        } else if (userId) {
            fetchUserDetails(userId).then((data) => {
                if (data && data.profilePicturePath) {
                    setUserProfileImage(`http://localhost:8080/uploads/profile/${data.profilePicturePath}`);
                }
            });
        }
    }, [userId]);

    useEffect(() => {
        // Hide navbar on scroll down
        const handleScroll = () => {
            if (window.scrollY > lastScrollY && window.scrollY > 60) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            lastScrollY = window.scrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    const navigateTo = (path) => {
        navigate(path);
        setMenuOpen(false);
        setProfileOpen(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        setProfileOpen(false);
    };
    
    const toggleProfileMenu = () => {
        setProfileOpen(!profileOpen);
        setMenuOpen(false);
    };
    
    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', newMode);
        
        if (newMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    };

    const getProfileAvatar = () => {
        if (googleProfileImage) {
            return <img src={googleProfileImage} alt="Profile" className="avatar-img" />;
        } else if (userProfileImage) {
            return <img 
                src={userProfileImage} 
                alt="Profile" 
                className="avatar-img"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = Pro;
                }}
            />;
        } else {
            return <FaRegUserCircle className="avatar-icon" />;
        }
    };

    return (
        <>
            <header className={`glass-navbar ${isVisible ? 'visible' : 'hidden'}`}>
                <div className="navbar-inner">
                    <button className="menu-toggle" onClick={toggleMenu} aria-label="Open menu">
                        {menuOpen ? <IoCloseOutline /> : <IoMenuOutline />}
                    </button>
                    
                    <div className="brand" onClick={() => navigateTo('/allPost')}>
                        <div className="logo-icon"></div>
                        <span>WellnessX</span>
                    </div>
                    
                    <nav className={`nav-menu ${menuOpen ? 'open' : ''}`}>
                        <button 
                            className={`nav-link ${currentPath === '/allPost' ? 'active' : ''}`}
                            onClick={() => navigateTo('/allPost')}
                        >
                            {currentPath === '/allPost' ? <IoHome /> : <IoHomeOutline />}
                            <span>Posts</span>
                        </button>
                        
                        <button 
                            className={`nav-link ${currentPath === '/allLearningPlan' ? 'active' : ''}`}
                            onClick={() => navigateTo('/allLearningPlan')}
                        >
                            {currentPath === '/allLearningPlan' ? <IoBookmark /> : <IoBookmarkOutline />}
                            <span>Workout Planning</span>
                        </button>
                        
                        <button 
                            className={`nav-link ${currentPath === '/allAchievements' ? 'active' : ''}`}
                            onClick={() => navigateTo('/allAchievements')}
                        >
                            {currentPath === '/allAchievements' ? <IoTrophy /> : <IoTrophyOutline />}
                            <span>Workout Status</span>
                        </button>
                        
                        {/* New MealPlan navigation item */}
                        <button 
                            className={`nav-link ${currentPath === '/allMealPlan' ? 'active' : ''}`}
                            onClick={() => navigateTo('/allMealPlan')}
                        >
                            {currentPath === '/allMealPlan' ? <IoRestaurant /> : <IoRestaurantOutline />}
                            <span>Meal Plan</span>
                        </button>
                    </nav>
                    
                    <div className="navbar-right">
                        <button 
                            className={`circle-button ${!allRead ? 'has-notifications' : ''}`}
                            onClick={() => navigateTo('/notifications')}
                            aria-label="Notifications"
                        >
                            {allRead ? <IoNotificationsOutline /> : <IoNotifications />}
                            {!allRead && <span className="notification-badge"></span>}
                        </button>
                        
                        <button 
                            className="circle-button"
                            onClick={toggleDarkMode}
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? <IoSunny /> : <IoMoon />}
                        </button>
                        
                        <div className="profile-menu">
                            <button 
                                className="avatar-button"
                                onClick={toggleProfileMenu}
                                aria-label="Profile menu"
                            >
                                {getProfileAvatar()}
                            </button>
                            
                            {profileOpen && (
                                <div className="profile-dropdown">
                                    <div className="profile-header">
                                        <div className="profile-avatar">
                                            {getProfileAvatar()}
                                        </div>
                                        <div>
                                            <h3>{localStorage.getItem('userName') || 'User'}</h3>
                                            <p>{localStorage.getItem('userEmail') || 'user@example.com'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="dropdown-items">
                                        <button 
                                            onClick={() => navigateTo(userType === 'google' ? '/googalUserPro' : '/userProfile')}
                                            className="dropdown-item"
                                        >
                                            <FaRegUserCircle />
                                            <span>My Profile</span>
                                        </button>
                                        
                                        <button 
                                            onClick={handleLogout}
                                            className="dropdown-item"
                                        >
                                            <IoLogOutOutline />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            
            {(menuOpen || profileOpen) && (
                <div className="overlay" onClick={() => {
                    setMenuOpen(false);
                    setProfileOpen(false);
                }}></div>
            )}
        </>
    );
}

export default NavBar;
