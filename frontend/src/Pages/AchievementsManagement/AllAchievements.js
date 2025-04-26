import React, { useEffect, useState } from 'react';
import { FaEdit, FaRegUserCircle } from "react-icons/fa";
import { RiDeleteBin6Fill, RiDeleteBin7Line } from "react-icons/ri";
import { IoSearchOutline, IoAddOutline, IoCloseOutline, IoEllipsisVertical } from "react-icons/io5";
import { BiTime } from "react-icons/bi";
import NavBar from '../../Components/NavBar/NavBar'
import { IoIosCreate } from "react-icons/io";
import Modal from 'react-modal';
import './AchievementsModern.css'; // Import the modern styling

Modal.setAppElement('#root'); // Important for accessibility

function AllAchievements() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = localStorage.getItem('userID');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/achievements')
      .then((response) => response.json())
      .then((data) => {
        setProgressData(data);
        setFilteredData(data);
      })
      .catch((error) => console.error('Error fetching Workout Status data:', error));
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter achievements based on title or description
    const filtered = progressData.filter(
      (achievement) =>
        achievement.title.toLowerCase().includes(query) ||
        achievement.description.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Workout Status?')) {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Workout Status deleted successfully!');
          setFilteredData(filteredData.filter((progress) => progress.id !== id));
        } else {
          alert('Failed to delete Workout Status.');
        }
      } catch (error) {
        console.error('Error deleting Workout Status:', error);
      }
    }
  };

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };
  
  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  return (
    <div className="modern-layout">
      <NavBar />
      
      <main className="modern-content">
        <header className="modern-header">
          <div className="header-container">
            <h1>Workout Status</h1>
            <div className="header-tools">
              <div className="modern-search">
                <IoSearchOutline className="search-icon" />
                <input
                  type="text"
                  placeholder="Search achievements..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              
              <button 
                className="create-button"
                onClick={() => window.location.href = '/addAchievements'}
                aria-label="Create new Workout Status"
              >
                <IoAddOutline />
                <span>Create</span>
              </button>
            </div>
          </div>
        </header>

        {filteredData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-visual"></div>
            <h2>No Workout Status Found</h2>
            <p>Share your accomplishments with the community</p>
            <button onClick={() => window.location.href = '/addAchievements'}>
              Create Your First Workout Status
            </button>
          </div>
        ) : (
          <div className="post-grid">
            {filteredData.map((achievement) => (
              <article key={achievement.id} className="modern-card">
                <div className="card-header">
                  <div className="author-section">
                    <div className="avatar-wrapper">
                      <FaRegUserCircle />
                    </div>
                    <div>
                      <h3>{achievement.postOwnerName || 'Anonymous'}</h3>
                      <div className="timestamp">
                        <BiTime />
                        <span>{formatDate(achievement.date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {achievement.postOwnerID === userId && (
                    <div className="options">
                      <div className="menu-container">
                        <button className="menu-trigger" aria-label="Achievement options">
                          <IoEllipsisVertical />
                        </button>
                        <div className="menu-dropdown">
                          <button onClick={() => window.location.href = `/updateAchievements/${achievement.id}`}>
                            <FaEdit />
                            <span>Edit</span>
                          </button>
                          <button onClick={() => handleDelete(achievement.id)} className="danger-option">
                            <RiDeleteBin7Line />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="card-content">
                  <h2>{achievement.title}</h2>
                  <p>{achievement.description}</p>
                </div>
                
                {achievement.imageUrl && (
                  <div className="media-grid single">
                    <div 
                      className="media-thumb"
                      onClick={() => openModal(`http://localhost:8080/achievements/images/${achievement.imageUrl}`)}
                    >
                      <img 
                        src={`http://localhost:8080/achievements/images/${achievement.imageUrl}`} 
                        alt={achievement.title} 
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modern-modal"
        overlayClassName="modern-overlay"
      >
        <button className="close-modal" onClick={closeModal}>
          <IoCloseOutline />
        </button>
        
        <div className="modal-content">
          {selectedImage && (
            <img src={selectedImage} alt="Achievement" />
          )}
        </div>
      </Modal>
    </div>
  );
}

export default AllAchievements;
