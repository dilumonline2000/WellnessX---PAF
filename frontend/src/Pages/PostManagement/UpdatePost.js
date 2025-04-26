import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import { IoCloudUploadOutline } from "react-icons/io5";
import './AllPost.css'; // Import the CSS file
import '../../styles/darkModeForm.css'; // Corrected import path

function UpdatePost() {
  const { id } = useParams(); // Get the post ID from the URL
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); // New state for category
  const [existingMedia, setExistingMedia] = useState([]); // Initialize as an empty array
  const [newMedia, setNewMedia] = useState([]); // New media files to upload
  const [loading, setLoading] = useState(true); // Add loading state
  const [mediaPreviews, setMediaPreviews] = useState([]); // State for media previews

  useEffect(() => {
    // Fetch the post details
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/posts/${id}`);
        const post = response.data;
        setTitle(post.title || ''); // Ensure title is not undefined
        setDescription(post.description || ''); // Ensure description is not undefined
        setCategory(post.category || ''); // Set category
        setExistingMedia(post.media || []); // Ensure media is an array
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching post:', error);
        alert('Failed to fetch post details.');
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchPost();
  }, [id]);

  const handleDeleteMedia = async (mediaUrl) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this media file?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/posts/${id}/media`, {
        data: { mediaUrl },
      });
      setExistingMedia(existingMedia.filter((url) => url !== mediaUrl)); // Remove from UI
      alert('Media file deleted successfully!');
    } catch (error) {
      console.error('Error deleting media file:', error);
      alert('Failed to delete media file.');
    }
  };

  const validateVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          reject(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
        } else {
          resolve();
        }
      };

      video.onerror = () => {
        reject(`Failed to load video metadata for ${file.name}.`);
      };
    });
  };

  const handleNewMediaChange = async (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const maxImageCount = 3;

    let imageCount = existingMedia.filter((url) => !url.endsWith('.mp4')).length;
    let videoCount = existingMedia.filter((url) => url.endsWith('.mp4')).length;
    const previews = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        return;
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
        if (imageCount > maxImageCount) {
          alert('You can upload a maximum of 3 images.');
          return;
        }
        previews.push({ type: file.type, url: URL.createObjectURL(file) });
      } else if (file.type === 'video/mp4') {
        videoCount++;
        if (videoCount > 1) {
          alert('You can upload only 1 video.');
          return;
        }

        try {
          await validateVideoDuration(file);
          previews.push({ type: file.type, url: URL.createObjectURL(file) });
        } catch (error) {
          alert(error);
          return;
        }
      } else {
        alert(`Unsupported file type: ${file.type}`);
        return;
      }
    }

    setNewMedia(files);
    setMediaPreviews(previews);
  };

  const removePreview = (index) => {
    setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
    setNewMedia(Array.from(newMedia).filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category); // Include category in the update
    newMedia.forEach((file) => formData.append('newMediaFiles', file));

    try {
      await axios.put(`http://localhost:8080/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post updated successfully!');
      navigate('/myAllPost');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>; // Add styled loading display
  }

  return (
    <div className="modern-layout">
      <NavBar />
      
      <main className="modern-content">
        <div className="header-container">
          <h1>Update Post</h1>
        </div>
        
        <div className="modern-card create-post-card">
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-group">
              <label htmlFor="post-title">Title</label>
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
              <label htmlFor="post-category">Category</label>
              <select
                id="post-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
                placeholder="Share your thoughts..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="modern-input modern-textarea"
              />
            </div>
            
            <div className="form-group">
              <label>Current Media</label>
              {existingMedia.length > 0 && (
                <div className="media-grid">
                  {existingMedia.map((mediaUrl, index) => (
                    <div key={index} className="media-preview-container">
                      {mediaUrl.endsWith('.mp4') ? (
                        <video controls className="media-preview">
                          <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img className="media-preview" src={`http://localhost:8080${mediaUrl}`} alt={`Media ${index}`} />
                      )}
                      <button 
                        type="button" 
                        className="remove-media-btn"
                        onClick={() => handleDeleteMedia(mediaUrl)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Add New Media</label>
              
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
                  onChange={handleNewMediaChange}
                  className="file-upload-input"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="modern-button primary-button">
                Update Post
              </button>
              <button 
                type="button" 
                className="modern-button secondary-button"
                onClick={() => navigate('/myAllPost')}
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

export default UpdatePost;
