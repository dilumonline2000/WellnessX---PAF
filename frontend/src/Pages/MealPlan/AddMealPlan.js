import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import { IoCloudUploadOutline } from "react-icons/io5";
import './MealPost.css';
import './MealTemplates.css'; // Import the updated CSS file
import NavBar from '../../Components/NavBar/NavBar';
import { FaVideo } from "react-icons/fa";
import { FaImage } from "react-icons/fa";
import { HiCalendarDateRange } from "react-icons/hi2";

function AddMealPlan() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContentURLInput, setShowContentURLInput] = useState(false);
  const [showImageUploadInput, setShowImageUploadInput] = useState(false);
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const navigate = useNavigate();

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (startDate === endDate) {
      alert("Start date and end date cannot be the same.");
      setIsSubmitting(false);
      return;
    }

    if (startDate > endDate) {
      alert("Start date cannot be greater than end date.");
      setIsSubmitting(false);
      return;
    }

    const postOwnerID = localStorage.getItem('userID');
    const postOwnerName = localStorage.getItem('userFullName');

    if (!postOwnerID) {
      alert('Please log in to add a post.');
      navigate('/');
      return;
    }

    if (tags.length < 2) {
      alert("Please add at least two tags.");
      setIsSubmitting(false);
      return;
    }

    if (!templateID) {
      alert("Please select a template.");
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        const uploadResponse = await axios.post('http://localhost:8080/mealPlan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      }

      // Create the new post object
      const newPost = {
        title,
        description,
        contentURL,
        tags,
        postOwnerID,
        postOwnerName,
        imageUrl,
        templateID,
        startDate, // New field
        endDate,   // New field
        category   // New field
      };

      // Submit the post data
      await axios.post('http://localhost:8080/mealPlan', newPost);
      alert('Post added successfully!');
      navigate('/myMealPlan');
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEmbedURL = (url) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url; // Return the original URL if it's not a YouTube link
    } catch (error) {
      console.error('Invalid URL:', url);
      return ''; // Return an empty string for invalid URLs
    }
  };

  return (
    <div className="modern-layout">
      <NavBar />
      
      <main className="modern-content">
        <div className="header-container">
          <h1>Create Meal Plan</h1>
        </div>
        
        <div className="modern-card create-post-card">
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-group">
              <label htmlFor="meal-title">Title</label>
              <input
                id="meal-title"
                type="text"
                placeholder="Enter a title for your meal plan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="modern-input"
              />
            </div>
            
            {/* Style for dark mode template previews */}
            <style>
              {`
                /* Dark mode text color overrides for template preview elements only */
                @media (prefers-color-scheme: dark) {
                  .selected-template-preview .template_title,
                  .selected-template-preview .template_dates,
                  .selected-template-preview .template_category,
                  .selected-template-preview .template_description,
                  .selected-template-preview .tagname,
                  .selected-template-preview .media-placeholder span {
                    color: black !important;
                  }
                  
                  .selected-template-preview svg.placeholder-icon,
                  .selected-template-preview .template_dates svg {
                    color: black !important;
                  }
                }
                
                /* For sites with manual dark mode toggle */
                .dark-mode .selected-template-preview .template_title,
                .dark-mode .selected-template-preview .template_dates,
                .dark-mode .selected-template-preview .template_category,
                .dark-mode .selected-template-preview .template_description,
                .dark-mode .selected-template-preview .tagname,
                .dark-mode .selected-template-preview .media-placeholder span {
                  color: black !important;
                }
                
                .dark-mode .selected-template-preview svg.placeholder-icon,
                .dark-mode .selected-template-preview .template_dates svg {
                  color: black !important;
                }
              `}
            </style>
            
            <div className="form-group">
              <label htmlFor="meal-description">Description</label>
              <textarea
                id="meal-description"
                placeholder="Describe your meal plan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="modern-input modern-textarea"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="meal-category">Category</label>
              <select
                id="meal-category"
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
            
            <div className="form-group date-range-container">
              <div className="date-field">
                <label htmlFor="start-date">Start Date</label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="modern-input"
                />
              </div>
              
              <div className="date-field">
                <label htmlFor="end-date">End Date</label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="modern-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Tags</label>
              {tags.length > 0 && (
                <div className="tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {tags.map((tag, index) => (
                    <span key={index} className="tag-item">
                      #{tag}
                      <button 
                        type="button" 
                        className="tag-remove-btn"
                        onClick={() => setTags(tags.filter((_, i) => i !== index))}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="tag-input-container">
                <input
                  type="text"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="modern-input"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <button 
                  type="button" 
                  className="tag-add-btn"
                  onClick={handleAddTag}
                >
                  <IoMdAdd />
                </button>
              </div>
              <small>Add at least 2 tags to categorize your meal plan</small>
            </div>
            
            <div className="form-group template-selection-section">
              <label>Choose Your Layout</label>
              <p className="template-selection-description">Select a template that best showcases your content</p>
              
              <div className="visual-template-gallery">
                <div 
                  className={`template-visual-card ${templateID === '1' ? 'selected' : ''}`}
                  onClick={() => setTemplateID('1')}
                >
                  <div className="template-visual">
                    <div className="template-preview-image">
                      <div className="template1-preview">
                        <div className="preview-header">
                          <div className="preview-title-block"></div>
                          <div className="preview-meta-block">
                            <div className="preview-date"></div>
                            <div className="preview-category"></div>
                          </div>
                        </div>
                        <div className="preview-divider"></div>
                        <div className="preview-text-block">
                          <div className="preview-line"></div>
                          <div className="preview-line"></div>
                          <div className="preview-line short"></div>
                        </div>
                        <div className="preview-tags">
                          <div className="preview-tag"></div>
                          <div className="preview-tag"></div>
                        </div>
                        <div className="preview-media"></div>
                      </div>
                    </div>
                    
                    <div className="template-info-overlay">
                      <div className="template-number">1</div>
                      <h4>Classic Style</h4>
                      <p>Clean layout with content focus</p>
                    </div>
                    
                    {templateID === '1' && (
                      <div className="selected-checkmark">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                          <circle cx="12" cy="12" r="12" fill="#4CAF50" />
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="white" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="template-select-footer">
                    <button 
                      type="button" 
                      className={`select-template-button ${templateID === '1' ? 'active' : ''}`}
                    >
                      {templateID === '1' ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
                
                <div 
                  className={`template-visual-card ${templateID === '2' ? 'selected' : ''}`}
                  onClick={() => setTemplateID('2')}
                >
                  <div className="template-visual">
                    <div className="template-preview-image">
                      <div className="template2-preview">
                        <div className="preview-header">
                          <div className="preview-title-block"></div>
                          <div className="preview-meta-block">
                            <div className="preview-date"></div>
                            <div className="preview-category"></div>
                          </div>
                        </div>
                        <div className="preview-divider"></div>
                        <div className="preview-text-block">
                          <div className="preview-line"></div>
                          <div className="preview-line short"></div>
                        </div>
                        <div className="preview-tags">
                          <div className="preview-tag"></div>
                          <div className="preview-tag"></div>
                        </div>
                        <div className="preview-split-media">
                          <div className="preview-media-left"></div>
                          <div className="preview-media-right"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="template-info-overlay">
                      <div className="template-number">2</div>
                      <h4>Split View</h4>
                      <p>Side-by-side media layout</p>
                    </div>
                    
                    {templateID === '2' && (
                      <div className="selected-checkmark">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                          <circle cx="12" cy="12" r="12" fill="#4CAF50" />
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="white" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="template-select-footer">
                    <button 
                      type="button" 
                      className={`select-template-button ${templateID === '2' ? 'active' : ''}`}
                    >
                      {templateID === '2' ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
                
                <div 
                  className={`template-visual-card ${templateID === '3' ? 'selected' : ''}`}
                  onClick={() => setTemplateID('3')}
                >
                  <div className="template-visual">
                    <div className="template-preview-image">
                      <div className="template3-preview">
                        <div className="preview-top-media"></div>
                        <div className="preview-header">
                          <div className="preview-title-block"></div>
                          <div className="preview-meta-block">
                            <div className="preview-date"></div>
                            <div className="preview-category"></div>
                          </div>
                        </div>
                        <div className="preview-divider"></div>
                        <div className="preview-text-block">
                          <div className="preview-line"></div>
                          <div className="preview-line"></div>
                          <div className="preview-line short"></div>
                        </div>
                        <div className="preview-tags">
                          <div className="preview-tag"></div>
                          <div className="preview-tag"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="template-info-overlay">
                      <div className="template-number">3</div>
                      <h4>Media First</h4>
                      <p>Visuals take prominence</p>
                    </div>
                    
                    {templateID === '3' && (
                      <div className="selected-checkmark">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                          <circle cx="12" cy="12" r="12" fill="#4CAF50" />
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="white" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="template-select-footer">
                    <button 
                      type="button" 
                      className={`select-template-button ${templateID === '3' ? 'active' : ''}`}
                    >
                      {templateID === '3' ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              </div>
              
              {templateID && (
                <div className="selected-template-preview">
                  <div className="preview-header">
                    <h3>Live Preview</h3>
                    <div className="template-info">
                      <span className="template-name">
                        {templateID === '1' ? 'Classic Style' : templateID === '2' ? 'Split View' : 'Media First'}
                      </span>
                      <span className="template-badge">Template {templateID}</span>
                    </div>
                  </div>
                  
                  {templateID === '1' && (
                    <div className="template template-1">
                      <div className="template-content-wrapper">
                        <h3 className='template_title'>{title || "Your Plan Title"}</h3>
                        <div className="template-meta">
                          <span className='template_dates'><HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}</span>
                          <span className='template_category'>{category || "Category"}</span>
                        </div>
                        <hr className="template-divider"/>
                        <p className='template_description'>{description || "Your plan description will appear here."}</p>
                        
                        <div className="tags_preview" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {tags.length > 0 ? 
                            tags.map((tag, index) => (
                              <span key={index} className="tagname">#{tag}</span>
                            )) : (
                              <>
                                <span className="tagname placeholder-tag">#tag1</span>
                                <span className="tagname placeholder-tag">#tag2</span>
                              </>
                            )
                          }
                        </div>
                        
                        <div className="template-media">
                          {imagePreview ? 
                            <img src={imagePreview} alt="Preview" className="iframe_preview" /> : 
                            <div className="media-placeholder">
                              <FaImage className="placeholder-icon" />
                              <span>Image will appear here</span>
                            </div>
                          }
                          
                          {contentURL ? 
                            <iframe
                              src={getEmbedURL(contentURL)}
                              title="Content Preview"
                              className="iframe_preview"
                              frameBorder="0"
                              allowFullScreen
                            ></iframe> : 
                            <div className="media-placeholder video-placeholder">
                              <FaVideo className="placeholder-icon" />
                              <span>Video will appear here</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {templateID === '2' && (
                    <div className="template template-2">
                      <div className="template-content-wrapper">
                        <h3 className='template_title'>{title || "Your Plan Title"}</h3>
                        <div className="template-meta">
                          <span className='template_dates'><HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}</span>
                          <span className='template_category'>{category || "Category"}</span>
                        </div>
                        <hr className="template-divider" />
                        <p className='template_description'>{description || "Your plan description will appear here."}</p>
                        
                        <div className="tags_preview" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {tags.length > 0 ? 
                            tags.map((tag, index) => (
                              <span key={index} className="tagname">#{tag}</span>
                            )) : (
                              <>
                                <span className="tagname placeholder-tag">#tag1</span>
                                <span className="tagname placeholder-tag">#tag2</span>
                              </>
                            )
                          }
                        </div>
                        
                        <div className='preview_part'>
                          <div className='preview_part_sub'>
                            {imagePreview ? 
                              <img src={imagePreview} alt="Preview" className="iframe_preview_new" /> : 
                              <div className="media-placeholder">
                                <FaImage className="placeholder-icon" />
                                <span>Image</span>
                              </div>
                            }
                          </div>
                          <div className='preview_part_sub'>
                            {contentURL ? 
                              <iframe
                                src={getEmbedURL(contentURL)}
                                title="Content Preview"
                                className="iframe_preview_new"
                                frameBorder="0"
                                allowFullScreen
                              ></iframe> : 
                              <div className="media-placeholder video-placeholder">
                                <FaVideo className="placeholder-icon" />
                                <span>Video</span>
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {templateID === '3' && (
                    <div className="template template-3">
                      <div className="template-content-wrapper">
                        <div className="template-media-header">
                          {imagePreview ? 
                            <img src={imagePreview} alt="Preview" className="iframe_preview" /> : 
                            <div className="media-placeholder main-media">
                              <FaImage className="placeholder-icon" />
                              <span>Featured Image</span>
                            </div>
                          }
                          {contentURL ? 
                            <iframe
                              src={getEmbedURL(contentURL)}
                              title="Content Preview"
                              className="iframe_preview"
                              frameBorder="0"
                              allowFullScreen
                            ></iframe> : 
                            <div className="media-placeholder video-placeholder main-media">
                              <FaVideo className="placeholder-icon" />
                              <span>Featured Video</span>
                            </div>
                          }
                        </div>
                        
                        <h3 className='template_title'>{title || "Your Plan Title"}</h3>
                        <div className="template-meta">
                          <span className='template_dates'><HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}</span>
                          <span className='template_category'>{category || "Category"}</span>
                        </div>
                        <hr className="template-divider" />
                        <p className='template_description'>{description || "Your plan description will appear here."}</p>
                        
                        <div className="tags_preview" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {tags.length > 0 ? 
                            tags.map((tag, index) => (
                              <span key={index} className="tagname">#{tag}</span>
                            )) : (
                              <>
                                <span className="tagname placeholder-tag">#tag1</span>
                                <span className="tagname placeholder-tag">#tag2</span>
                              </>
                            )
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Media Content</label>
              <div className="media-options">
                <button 
                  type="button"
                  className={`media-option-card ${showContentURLInput ? 'active' : ''}`}
                  onClick={() => setShowContentURLInput(!showContentURLInput)}
                >
                  <div className="media-icon-container">
                    <FaVideo className="media-icon" />
                  </div>
                  <span className="media-label">Add Video URL</span>
                  <div className={`selected-indicator ${showContentURLInput ? 'show' : ''}`}></div>
                </button>
                
                <button 
                  type="button"
                  className={`media-option-card ${showImageUploadInput ? 'active' : ''}`}
                  onClick={() => setShowImageUploadInput(!showImageUploadInput)}
                >
                  <div className="media-icon-container">
                    <FaImage className="media-icon" />
                  </div>
                  <span className="media-label">Add Image</span>
                  <div className={`selected-indicator ${showImageUploadInput ? 'show' : ''}`}></div>
                </button>
              </div>
              
              {showContentURLInput && (
                <div className="url-input-container">
                  <input
                    type="url"
                    placeholder="Enter video URL (YouTube links are supported)"
                    value={contentURL}
                    onChange={(e) => setContentURL(e.target.value)}
                    className="modern-input"
                  />
                </div>
              )}
              
              {showImageUploadInput && (
                <div className="media-upload-container">
                  {imagePreview && (
                    <div className="media-preview-container">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="media-preview" 
                      />
                      <button 
                        type="button" 
                        className="remove-media-btn"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  {!imagePreview && (
                    <div className="file-upload-container">
                      <label htmlFor="image-upload" className="file-upload-label">
                        <IoCloudUploadOutline />
                        <span>Choose Image</span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-upload-input"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="modern-button primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Meal Plan'}
              </button>
              <button 
                type="button" 
                className="modern-button secondary-button"
                onClick={() => navigate('/myMealPlan')}
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

export default AddMealPlan;