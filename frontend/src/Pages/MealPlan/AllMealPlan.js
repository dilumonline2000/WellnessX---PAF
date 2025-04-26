import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MealPost.css';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { HiCalendarDateRange } from "react-icons/hi2";
import { IoSearchOutline, IoAddOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

function AllMealPlan() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchOwnerName, setSearchOwnerName] = useState('');
  const userId = localStorage.getItem('userID');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/mealPlan');
        setPosts(response.data);
        setFilteredPosts(response.data); // Initially show all posts
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []); // Ensure this runs only once on component mount

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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8080/mealPlan/${id}`);
        alert('Post deleted successfully!');
        setFilteredPosts(filteredPosts.filter((post) => post.id !== id)); // Update the list after deletion
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post.');
      }
    }
  };

  const handleUpdate = (id) => {
    window.location.href = `/updateMealPlan/${id}`;
  };

  const renderPostByTemplate = (post) => {
    console.log('Rendering post:', post); // Debugging: Log the post object
    if (!post.templateID) { // Use the correct field name
      console.warn('Missing templateID for post:', post); // Warn if templateID is missing
      return <div className="template template-default">Invalid template ID</div>;
    }

    switch (post.templateID) { // Use the correct field name
      case 1:
        return (
          <div className="template_dis template-1">
            <div className='user_details_card'>
              <div>
                <div className='name_section_post'>
                  <p className='name_section_post_owner_name'>{post.postOwnerName}</p>
                </div>
              </div>
              {post.postOwnerID === localStorage.getItem('userID') && (
                <div className='action_btn_icon_post'>
                  <FaEdit
                    onClick={() => handleUpdate(post.id)} className='action_btn_icon' />
                  <RiDeleteBin6Fill
                    onClick={() => handleDelete(post.id)}
                    className='action_btn_icon' />
                </div>
              )}
            </div>
            <p className='template_title' style={{ color: "#000" }}>{post.title}</p>
            <p className='template_dates' style={{ color: "#000" }}><HiCalendarDateRange /> {post.startDate} to {post.endDate} </p>
            <p className='template_description' style={{ color: "#000" }}>{post.category}</p>
            <hr></hr>
            <p className='template_description' style={{ whiteSpace: "pre-line", color: "#000" }}>{post.description}</p>
            <div className="tags_preview">
              {post.tags?.map((tag, index) => (
                <span key={index} className="tagname" style={{ color: "#000" }}>#{tag}</span>
              ))}
            </div>
            {post.imageUrl && (
              <img
                src={`http://localhost:8080/mealPlan/planImages/${post.imageUrl}`}
                alt={post.title}
                className="iframe_preview_dis"
              />
            )}
            {post.contentURL && (
              <iframe
                src={getEmbedURL(post.contentURL)}
                title={post.title}
                className="iframe_preview_dis"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
          </div>
        );
      case 2:
        return (
          <div className="template_dis template-2">
            <div className='user_details_card'>
              <div>
                <div className='name_section_post'>
                  <p className='name_section_post_owner_name'>{post.postOwnerName}</p>
                </div>
                
              </div>
              {post.postOwnerID === localStorage.getItem('userID') && (
                <div className='action_btn_icon_post'>
                  <FaEdit
                    onClick={() => handleUpdate(post.id)} className='action_btn_icon' />
                  <RiDeleteBin6Fill
                    onClick={() => handleDelete(post.id)}
                    className='action_btn_icon' />
                </div>
              )}
            </div>
            <p className='template_title' style={{ color: "#000" }}>{post.title}</p>
            <p className='template_dates' style={{ color: "#000" }}><HiCalendarDateRange /> {post.startDate} to {post.endDate} </p>
            <p className='template_description' style={{ color: "#000" }}>{post.category}</p>
            <hr></hr>
            <p className='template_description' style={{ whiteSpace: "pre-line", color: "#000" }}>{post.description}</p>
            <div className="tags_preview">
              {post.tags?.map((tag, index) => (
                <span key={index} className="tagname" style={{ color: "#000" }}>#{tag}</span>
              ))}
            </div>
            <div className='preview_part'>
              <div className='preview_part_sub'>
                {post.imageUrl && (
                  <img
                    src={`http://localhost:8080/mealPlan/planImages/${post.imageUrl}`}
                    alt={post.title}
                    className="iframe_preview"
                  />
                )}
              </div>
              <div className='preview_part_sub'>
                {post.contentURL && (
                  <iframe
                    src={getEmbedURL(post.contentURL)}
                    title={post.title}
                    className="iframe_preview"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="template_dis template-3">
            <div className='user_details_card'>
              <div>
                <div className='name_section_post'>
                  <p className='name_section_post_owner_name'>{post.postOwnerName}</p>
                </div>
                
              </div>
              {post.postOwnerID === localStorage.getItem('userID') && (
                <div className='action_btn_icon_post'>
                  <FaEdit
                    onClick={() => handleUpdate(post.id)} className='action_btn_icon' />
                  <RiDeleteBin6Fill
                    onClick={() => handleDelete(post.id)}
                    className='action_btn_icon' />
                </div>
              )}
            </div>
            {post.imageUrl && (
              <img
                src={`http://localhost:8080/mealPlan/planImages/${post.imageUrl}`}
                alt={post.title}
                className="iframe_preview_dis"
              />
            )}
            {post.contentURL && (
              <iframe
                src={getEmbedURL(post.contentURL)}
                title={post.title}
                className="iframe_preview_dis"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
            <p className='template_title' style={{ color: "#000" }}>{post.title}</p>
            <p className='template_dates' style={{ color: "#000" }}><HiCalendarDateRange /> {post.startDate} to {post.endDate} </p>
            <p className='template_description' style={{ color: "#000" }}>{post.category}</p>
            <hr></hr>
            <p className='template_description' style={{ whiteSpace: "pre-line", color: "#000" }}>{post.description}</p>
            <div className="tags_preview">
              {post.tags?.map((tag, index) => (
                <span key={index} className="tagname" style={{ color: "#000" }}>#{tag}</span>
              ))}
            </div>
          </div>
        );
      default:
        console.warn('Unknown templateID:', post.templateID); // Warn if templateID is unexpected
        return (
          <div className="template template-default">
            <p>Unknown template ID: {post.templateID}</p>
          </div>
        );
    }
  };

  return (
    <div>
      <div className='continer'>
        <NavBar />
        <div className='continSection'>
          <header className="modern-header">
            <div className="header-container">
              <h1>Meal Plans</h1>
              <div className="header-tools">
                <div className="modern-search">
                  <IoSearchOutline className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by owner name..."
                    value={searchOwnerName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchOwnerName(value);
                      setFilteredPosts(
                        posts.filter((post) =>
                          post.postOwnerName.toLowerCase().includes(value.toLowerCase())
                        )
                      );
                    }}
                  />
                </div>
                
                <button 
                  className="create-button"
                  onClick={() => navigate('/addMealPlan')}
                  aria-label="Create new meal plan"
                >
                  <IoAddOutline />
                  <span>Create</span>
                </button>
              </div>
            </div>
          </header>

          <div className='post-grid'>
            {filteredPosts.length === 0 ? (
              <div className='empty-state'>
                <div className='empty-state-icon'></div>
                <h2>No Meal Plans Found</h2>
                <p>Create your first meal plan or try a different search.</p>
                <button 
                  className='modern-button primary-button'
                  onClick={() => navigate('/addMealPlan')}
                >
                  Create New Meal Plan
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className='post-card'>
                  {renderPostByTemplate(post)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllMealPlan;