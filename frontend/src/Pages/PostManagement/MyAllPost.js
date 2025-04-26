import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoSend, IoAddOutline, IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import { FaEdit, FaRegUserCircle, FaCommentAlt } from "react-icons/fa";
import { RiDeleteBin6Fill, RiDeleteBin7Line } from "react-icons/ri";
import { BiSolidLike, BiHeart, BiSolidHeart, BiTime } from "react-icons/bi";
import Modal from 'react-modal';
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import { MdDelete, MdOutlineComment, MdOutlineDeleteOutline } from "react-icons/md";
import { GrUpdate } from "react-icons/gr";
import { FiSave } from "react-icons/fi";
import { TbPencilCancel, TbX } from "react-icons/tb";
import { LuPencil } from "react-icons/lu";
Modal.setAppElement('#root');

function MyAllPost() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postOwners, setPostOwners] = useState({});
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]); // State to track followed users
  const [newComment, setNewComment] = useState({}); // State for new comments
  const [editingComment, setEditingComment] = useState({}); // State for editing comments
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const navigate = useNavigate();
  const loggedInUserID = localStorage.getItem('userID'); // Get the logged-in user's ID

  useEffect(() => {
    // Fetch all posts from the backend
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/posts');
        const userID = localStorage.getItem('userID'); // Get the logged-in user's ID

        // Filter posts to include only those with the logged-in user's ID
        const userPosts = response.data.filter((post) => post.userID === userID);

        setPosts(userPosts);
        setFilteredPosts(userPosts); // Initially show filtered posts

        // Fetch post owners' names
        const userIDs = [...new Set(userPosts.map((post) => post.userID))]; // Get unique userIDs
        const ownerPromises = userIDs.map((userID) =>
          axios.get(`http://localhost:8080/user/${userID}`)
            .then((res) => ({
              userID,
              fullName: res.data.fullname,
            }))
            .catch((error) => {
              console.error(`Error fetching user details for userID ${userID}:`, error);
              return { userID, fullName: 'Anonymous' };
            })
        );
        const owners = await Promise.all(ownerPromises);
        const ownerMap = owners.reduce((acc, owner) => {
          acc[owner.userID] = owner.fullName;
          return acc;
        }, {});
        console.log('Post Owners Map:', ownerMap); // Debug log to verify postOwners map
        setPostOwners(ownerMap);
      } catch (error) {
        console.error('Error fetching posts:', error); // Log error for fetching posts
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      const userID = localStorage.getItem('userID');
      if (userID) {
        try {
          const response = await axios.get(`http://localhost:8080/user/${userID}/followedUsers`);
          setFollowedUsers(response.data);
        } catch (error) {
          console.error('Error fetching followed users:', error);
        }
      }
    };

    fetchFollowedUsers();
  }, []);

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) {
      return; // Exit if the user cancels the confirmation
    }

    try {
      await axios.delete(`http://localhost:8080/posts/${postId}`);
      alert('Post deleted successfully!');
      setPosts(posts.filter((post) => post.id !== postId)); // Remove the deleted post from the UI
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId)); // Update filtered posts
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    }
  };

  const handleUpdate = (postId) => {
    navigate(`/updatePost/${postId}`); // Navigate to the UpdatePost page with the post ID
  };

  const handleMyPostsToggle = () => {
    if (showMyPosts) {
      // Show all posts
      setFilteredPosts(posts);
    } else {
      // Filter posts by logged-in user ID
      setFilteredPosts(posts.filter((post) => post.userID === loggedInUserID));
    }
    setShowMyPosts(!showMyPosts); // Toggle the state
  };

  const handleLike = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to like a post.');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8080/posts/${postId}/like`, null, {
        params: { userID },
      });

      // Update the specific post's likes in the state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleFollowToggle = async (postOwnerID) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to follow/unfollow users.');
      return;
    }
    try {
      if (followedUsers.includes(postOwnerID)) {
        // Unfollow logic
        await axios.put(`http://localhost:8080/user/${userID}/unfollow`, { unfollowUserID: postOwnerID });
        setFollowedUsers(followedUsers.filter((id) => id !== postOwnerID));
      } else {
        // Follow logic
        await axios.put(`http://localhost:8080/user/${userID}/follow`, { followUserID: postOwnerID });
        setFollowedUsers([...followedUsers, postOwnerID]);
      }
    } catch (error) {
      console.error('Error toggling follow state:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to comment.');
      return;
    }
    const content = newComment[postId] || ''; // Get the comment content for the specific post
    if (!content.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8080/posts/${postId}/comment`, {
        userID,
        content,
      });

      // Update the specific post's comments in the state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );

      setNewComment({ ...newComment, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const userID = localStorage.getItem('userID');
    try {
      await axios.delete(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        params: { userID },
      });

      // Update state to remove the deleted comment
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleSaveComment = async (postId, commentId, content) => {
    try {
      const userID = localStorage.getItem('userID');
      await axios.put(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        userID,
        content,
      });

      // Update the comment in state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? { ...comment, content } : comment
              ),
            }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? { ...comment, content } : comment
              ),
            }
            : post
        )
      );

      setEditingComment({}); // Clear editing state
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter posts based on title, description, or category
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        (post.category && post.category.toLowerCase().includes(query))
    );
    setFilteredPosts(filtered);
  };

  const openModal = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setIsModalOpen(false);
  };

  // Function to format date
  const formatDate = (dateString) => {
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
            <h1>My Posts</h1>
            <div className="header-tools">
              <div className="modern-search">
                <IoSearchOutline className="search-icon" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              
              <button 
                className="create-button"
                onClick={() => navigate('/addNewPost')}
                aria-label="Create new post"
              >
                <IoAddOutline />
                <span>Create</span>
              </button>
            </div>
          </div>
        </header>

        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-visual"></div>
            <h2>No Posts Found</h2>
            <p>Share something with the community</p>
            <button onClick={() => navigate('/addNewPost')}>
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="post-grid">
            {filteredPosts.map((post) => (
              <article key={post.id} className="modern-card">
                <div className="card-header">
                  <div className="author-section">
                    <div className="avatar-wrapper">
                      <FaRegUserCircle />
                    </div>
                    <div>
                      <h3>{postOwners[post.userID] || 'Anonymous'}</h3>
                      <div className="timestamp">
                        <BiTime />
                        <span>{post.createdAt ? formatDate(post.createdAt) : 'Recently'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="options">
                    {post.userID === loggedInUserID && (
                      <div className="menu-container">
                        <div className="menu-dropdown">
                          <button onClick={() => handleUpdate(post.id)}>
                            <LuPencil />
                            <span>Edit</span>
                          </button>
                          <button onClick={() => handleDelete(post.id)} className="danger-option">
                            <RiDeleteBin7Line />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="card-content">
                  <h2>{post.title}</h2>
                  <p>{post.description}</p>
                  
                  {post.category && (
                    <span className="category-badge">{post.category}</span>
                  )}
                </div>
                
                {post.media && post.media.length > 0 && (
                  <div className={`media-grid ${post.media.length === 1 ? 'single' : post.media.length === 2 ? 'double' : 'multiple'}`}>
                    {post.media.slice(0, 4).map((mediaUrl, index) => (
                      <div
                        key={index}
                        className={`media-thumb ${post.media.length > 4 && index === 3 ? 'has-more' : ''}`}
                        onClick={() => openModal(mediaUrl)}
                      >
                        {mediaUrl.endsWith('.mp4') ? (
                          <div className="video">
                            <video>
                              <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                            </video>
                            <div className="play-button"></div>
                          </div>
                        ) : (
                          <img src={`http://localhost:8080${mediaUrl}`} alt="" loading="lazy" />
                        )}
                        
                        {post.media.length > 4 && index === 3 && (
                          <div className="more-overlay">
                            <span>+{post.media.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="card-footer">
                  <div className="engagement">
                    <div className="metric">
                      <strong>{Object.values(post.likes || {}).filter(liked => liked).length}</strong> likes
                    </div>
                    <div className="metric">
                      <strong>{post.comments?.length || 0}</strong> comments
                    </div>
                  </div>
                  
                  <div className="action-row">
                    <button 
                      className={`action-btn ${post.likes?.[loggedInUserID] ? 'active' : ''}`}
                      onClick={() => handleLike(post.id)}
                    >
                      {post.likes?.[loggedInUserID] ? <BiSolidHeart /> : <BiHeart />}
                      <span>{post.likes?.[loggedInUserID] ? 'Liked' : 'Like'}</span>
                    </button>
                    <button className="action-btn">
                      <MdOutlineComment />
                      <span>Comment</span>
                    </button>
                  </div>
                  
                  <div className="comment-section">
                    <div className="comment-composer">
                      <div className="user-avatar">
                        <FaRegUserCircle />
                      </div>
                      <div className="comment-input-wrapper">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                        />
                        <button 
                          className="send-comment"
                          onClick={() => handleAddComment(post.id)}
                          aria-label="Post comment"
                        >
                          <IoSend />
                        </button>
                      </div>
                    </div>
                    
                    {post.comments && post.comments.length > 0 && (
                      <div className="comments">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="comment">
                            <div className="comment-avatar">
                              <FaRegUserCircle />
                            </div>
                            
                            <div className="comment-body">
                              <div className="comment-meta">
                                <h4>{comment.userFullName}</h4>
                                
                                {(comment.userID === loggedInUserID || post.userID === loggedInUserID) && (
                                  <div className="comment-tools">
                                    {comment.userID === loggedInUserID ? (
                                      editingComment.id === comment.id ? (
                                        <>
                                          <button onClick={() => handleSaveComment(post.id, comment.id, editingComment.content)}>
                                            <FiSave />
                                          </button>
                                          <button onClick={() => setEditingComment({})}>
                                            <TbX />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button onClick={() => setEditingComment({ id: comment.id, content: comment.content })}>
                                            <LuPencil />
                                          </button>
                                          <button onClick={() => handleDeleteComment(post.id, comment.id)}>
                                            <MdOutlineDeleteOutline />
                                          </button>
                                        </>
                                      )
                                    ) : (
                                      <button onClick={() => handleDeleteComment(post.id, comment.id)}>
                                        <MdOutlineDeleteOutline />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {editingComment.id === comment.id ? (
                                <input
                                  type="text"
                                  className="edit-field"
                                  value={editingComment.content}
                                  onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                                  autoFocus
                                />
                              ) : (
                                <p>{comment.content}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
          {selectedMedia && selectedMedia.endsWith('.mp4') ? (
            <video controls autoPlay>
              <source src={`http://localhost:8080${selectedMedia}`} type="video/mp4" />
              Your browser doesn't support video playback.
            </video>
          ) : (
            <img src={`http://localhost:8080${selectedMedia}`} alt="Media content" />
          )}
        </div>
      </Modal>
    </div>
  );
}

export default MyAllPost;
