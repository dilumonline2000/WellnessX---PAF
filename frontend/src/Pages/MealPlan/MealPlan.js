import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import './MealPlan.css';

function MealPlan() {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userID');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/mealPlan`);
        setMealPlans(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching meal plans:', error);
        setError('Failed to load meal plans. Please try again later.');
        setLoading(false);
      }
    };

    fetchMealPlans();
  }, []);

  const handleAddMealPlan = () => {
    navigate('/createMealPlan');
  };

  return (
    <div className="meal-plan-container">
      <NavBar />
      <main className="content">
        <header className="page-header">
          <h1>Meal Plans</h1>
          <button className="add-plan-btn" onClick={handleAddMealPlan}>
            Create New Meal Plan
          </button>
        </header>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading meal plans...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : mealPlans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h2>No Meal Plans Yet</h2>
            <p>Create your first meal plan to get started with nutrition tracking</p>
            <button onClick={handleAddMealPlan}>Create Your First Meal Plan</button>
          </div>
        ) : (
          <div className="meal-plans-grid">
            {mealPlans.map((plan) => (
              <div key={plan.id} className="meal-plan-card">
                <div className="meal-plan-header">
                  <h3>{plan.title}</h3>
                  <span className="meal-plan-date">{new Date(plan.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="meal-plan-body">
                  <p>{plan.description}</p>
                  <div className="meal-stats">
                    <div className="stat">
                      <span className="stat-value">{plan.totalCalories}</span>
                      <span className="stat-label">Calories</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{plan.mealCount}</span>
                      <span className="stat-label">Meals</span>
                    </div>
                  </div>
                </div>
                <div className="meal-plan-footer">
                  <button onClick={() => navigate(`/mealPlan/${plan.id}`)}>View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MealPlan;