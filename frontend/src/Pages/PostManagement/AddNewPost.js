import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import { IoCloudUploadOutline } from "react-icons/io5";
import './AllPost.css'; // Import existing CSS

function AddNewPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [categories, setCategories] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const userID = localStorage.getItem('userID');

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

  // Rest of the existing code
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 50 * 1024 * 1024; // 50MB

    let imageCount = 0;
    let videoCount = 0;
    const previews = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        window.location.reload();
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
      } else if (file.type === 'video/mp4') {
        videoCount++;

        // Validate video duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
            window.location.reload();
          }
        };
      } else {
        alert(`Unsupported file type: ${file.type}`);
        window.location.reload();
      }

      // Add file preview object with type and URL
      previews.push({ type: file.type, url: URL.createObjectURL(file) });
    }

    if (imageCount > 3) {
      alert('You can upload a maximum of 3 images.');
      window.location.reload();
    }

    if (videoCount > 1) {
      alert('You can upload only 1 video.');
      window.location.reload();
    }

    setMedia(files);
    setMediaPreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', categories);
    media.forEach((file, index) => formData.append(`mediaFiles`, file));

    try {
      const response = await axios.post('http://localhost:8080/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post created successfully!');
      window.location.href = '/myAllPost';
    } catch (error) {
      console.error(error);
      alert('Failed to create post.');
      window.location.reload();
    }
  };

  const removePreview = (index) => {
    setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
    setMedia(Array.from(media).filter((_, i) => i !== index));
  };

  return (
    <div className={`modern-layout ${isDarkMode ? 'dark-mode' : ''}`}>
      <NavBar />
      
      <main className="modern-content">
        <div className="header-container">
          <h1 style={isDarkMode ? {color: 'white'} : {}}>Create New Post</h1>
        </div>
        
        <div className="modern-card create-post-card">
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-group">
              <label htmlFor="post-title" style={labelStyle}>Title</label>
              <input
                id="post-title"
                type="text"
                placeholder="Enter a catchy title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="modern-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="post-category" style={labelStyle}>Category</label>
              <select
                id="post-category"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
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
              <label htmlFor="post-description" style={labelStyle}>Description</label>
              <textarea
                id="post-description"
                placeholder="Share your thoughts..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="modern-input modern-textarea"
              />
            </div>
            
            <div className="form-group">
              <label style={labelStyle}>Media</label>
              
              {mediaPreviews.length > 0 && (
                <div className="media-grid">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="media-preview-container">
                      {preview.type.startsWith('video/') ? (
                        <video controls className="media-preview">
                          <source src={preview.url} type={preview.type} />
                          Your browser does not support video.
                        </video>
                      ) : (
                        <img className="media-preview" src={preview.url} alt={`Preview ${index}`} />
                      )}
                      <button 
                        type="button" 
                        className="remove-media-btn"
                        onClick={() => removePreview(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="file-upload-container">
                <label htmlFor="media-upload" className="file-upload-label">
                  <IoCloudUploadOutline />
                  <span>Choose Files</span>
                  <span className="upload-hint">Max: 3 images or 1 video (30s)</span>
                </label>
                <input
                  id="media-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,video/mp4"
                  multiple
                  onChange={handleMediaChange}
                  className="file-upload-input"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="modern-button primary-button">
                Publish Post
              </button>
              <button 
                type="button" 
                className="modern-button secondary-button"
                onClick={() => window.location.href = '/myAllPost'}
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

export default AddNewPost;
