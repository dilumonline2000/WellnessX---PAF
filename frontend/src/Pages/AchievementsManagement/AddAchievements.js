import React, { useState, useEffect } from 'react';
import NavBar from '../../Components/NavBar/NavBar';
import { IoCloudUploadOutline } from "react-icons/io5";
import '../PostManagement/AllPost.css'; // Import the CSS used by AddNewPost

function AddAchievements() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    postOwnerID: '',
    category: '',
    postOwnerName: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); 

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null); 
  };

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (userId) {
      setFormData((prevData) => ({ ...prevData, postOwnerID: userId }));
      fetch(`http://localhost:8080/user/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.fullname) {
            setFormData((prevData) => ({ ...prevData, postOwnerName: data.fullname }));
          }
        })
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = '';
    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      const uploadResponse = await fetch('http://localhost:8080/achievements/upload', {
        method: 'POST',
        body: formData,
      });
      imageUrl = await uploadResponse.text();
    }

    const response = await fetch('http://localhost:8080/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, imageUrl }),
    });
    if (response.ok) {
      alert('Achievements added successfully!');
      window.location.href = '/myAchievements';
    } else {
      alert('Failed to add Achievements.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      category: '',
      postOwnerID: formData.postOwnerID,
      postOwnerName: formData.postOwnerName,
    });
    setImage(null);
    setImagePreview(null);
  };

  const removePreview = () => {
    setImage(null);
    setImagePreview(null);
  };

  return (
    <div className="modern-layout">
      <NavBar />
      
      <main className="modern-content">
        <div className="header-container">
          <h1>Add Workout Status</h1>
        </div>
        
        <div className="modern-card create-post-card">
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-group">
              <label htmlFor="post-title">Title</label>
              <input
                id="post-title"
                type="text"
                placeholder="Enter Workout Status title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="modern-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="post-category">Category</label>
              <select
                id="post-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="modern-input"
              >
                <option value="" disabled>Select Category</option>
                <option value="Strength Training">Strength Training</option>
              <option value="Cardio">Cardio</option>
              <option value="Flexibility and Stretching">Flexibility and Stretching</option>
              <option value="Endurance Training">Endurance Training</option>
              <option value="Functional Training">Functional Training</option>
              <option value="Mind-Body">Mind-Body (Yoga, Pilates, etc.)</option>
              <option value="Rehabilitation and Recovery">Rehabilitation and Recovery</option>
              <option value="Sports and Athletics">Sports and Athletics</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="post-description">Description</label>
              <textarea
                id="post-description"
                placeholder="Describe your Workout Status..."
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="modern-input modern-textarea"
              />
            </div>

            <div className="form-group">
              <label htmlFor="achievement-date">Date</label>
              <input
                id="achievement-date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="modern-input"
              />
            </div>
            
            <div className="form-group">
              <label>Image</label>
              
              {imagePreview && (
                <div className="media-grid">
                  <div className="media-preview-container">
                    <img className="media-preview" src={imagePreview} alt="Achievement Preview" />
                    <button 
                      type="button" 
                      className="remove-media-btn"
                      onClick={removePreview}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              
              <div className="file-upload-container">
                <label htmlFor="media-upload" className="file-upload-label">
                  <IoCloudUploadOutline />
                  <span>Choose Image</span>
                  <span className="upload-hint">Upload an image for your Workout Status</span>
                </label>
                <input
                  id="media-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                  className="file-upload-input"
                  required={!image}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="modern-button primary-button">
                Add Workout Status
              </button>
              <button 
                type="button" 
                className="modern-button secondary-button"
                onClick={() => window.location.href = '/myAchievements'}
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

export default AddAchievements;
