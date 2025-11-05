import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'https://tastetrail-backend.onrender.com/api';

export default function Admin() {
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('recipes');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [recipesRes, usersRes] = await Promise.all([
        axios.get(`${API}/admin/recipes`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setRecipes(recipesRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRecipes(recipes.filter(r => (r.id || r._id) !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete recipe');
    }
  };

  const filteredRecipes = recipes.filter(recipe => 
    recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (error) return <div className="message error">{error}</div>;

  return (
    <div className="container section">
      <h1 className="page-title">Admin Dashboard</h1>
      
      <div className="tabs">
        <button 
          className={`btn ${activeTab === 'recipes' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('recipes')}
        >
          Recipes ({recipes.length})
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
      </div>

      {activeTab === 'recipes' && (
        <div>
          <div className="admin-actions">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ maxWidth: '300px' }}
            />
            <Link to="/add-recipe" className="btn btn-primary">
              Add New Recipe
            </Link>
          </div>

          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Diet</th>
                  <th>Prep Time</th>
                  <th>Rating</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecipes.map(recipe => (
                  <tr key={recipe.id || recipe._id}>
                    <td>{recipe.title}</td>
                    <td>{recipe.diet}</td>
                    <td>{recipe.prepTime} min</td>
                    <td>{recipe.rating}</td>
                    <td>{recipe.owner?.name || recipe.owner || 'N/A'}</td>
                    <td>
                      <div className="admin-actions">
                        <Link 
                          to={`/recipes/${recipe.id || recipe._id}/edit`}
                          className="btn btn-sm btn-outline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteRecipe(recipe.id || recipe._id)}
                          className="btn btn-sm btn-soft"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredRecipes.length === 0 && (
              <div className="text-center" style={{ padding: '40px' }}>
                No recipes found
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}