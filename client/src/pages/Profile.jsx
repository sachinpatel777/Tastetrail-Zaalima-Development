import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API = 'https://tastetrail-backend.onrender.com/api'

export default function Profile() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [diet, setDiet] = useState('none')
  const [allergies, setAllergies] = useState([])
  const [cuisines, setCuisines] = useState([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const allergyOptions = [
    'Nuts', 'Dairy', 'Eggs', 'Soy', 'Gluten', 'Shellfish', 'Fish', 'Sesame'
  ]

  const cuisineOptions = [
    'Italian', 'Mexican', 'Chinese', 'Indian', 'Thai', 'Japanese', 'Mediterranean', 
    'French', 'American', 'Korean', 'Vietnamese', 'Greek', 'Spanish', 'Middle Eastern'
  ]

  useEffect(() => {
    // Load user profile data if available
    const loadProfile = async () => {
      const token = localStorage.getItem('token')
      setIsAuthenticated(!!token)
      if (token) {
        try {
          const { data } = await axios.get(`${API}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (data.user) {
            setName(data.user.name || '')
            setEmail(data.user.email || '')
            setDiet(data.user.dietaryPreferences?.diet || 'none')
            setAllergies(data.user.dietaryPreferences?.allergies || [])
            setCuisines(data.user.dietaryPreferences?.cuisines || [])
          }
        } catch (error) {
          console.error('Error loading profile:', error)
          setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load profile. Please log in.' })
        }
      }
    }
    loadProfile()
  }, [])

  const handleAllergyChange = (allergy) => {
    setAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    )
  }

  const handleCuisineChange = (cuisine) => {
    setCuisines(prev => 
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    )
  }

  async function savePreferences(e) {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      setMessage({ type: 'error', text: 'Please log in to save preferences.' })
      return
    }

    const dietaryPreferences = {
      diet,
      allergies,
      cuisines,
    }

    try {
      const { data } = await axios.put(`${API}/auth/profile`, 
        { name, dietaryPreferences },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage({ type: 'success', text: 'Preferences saved successfully!' })
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to save preferences' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container">
      <h1 className="section-title">Your Profile</h1>
      {!isAuthenticated && (
        <div className="message warning" style={{ maxWidth: '600px', margin: '0 auto 20px' }}>
          You are not logged in. Preferences cannot be saved.
          <div style={{ marginTop: '10px' }}>
            <Link to="/login" className="btn btn-primary">Login</Link>
          </div>
        </div>
      )}
      
      {message && (
        <div className={`message ${message.type}`} style={{ maxWidth: '600px', margin: '0 auto 30px' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={savePreferences} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="profile-section">
          <h3 className="profile-title">Account Information</h3>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Your account email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
            <small style={{ color: '#666', fontSize: '0.9em' }}>
              Email cannot be changed after registration
            </small>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="profile-title">Dietary Preferences</h3>
          <div className="form-group">
            <label htmlFor="diet" className="form-label">Diet Type</label>
            <select
              id="diet"
              className="form-input"
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
            >
              <option value="none">No specific diet</option>
              <option value="vegan">Vegan</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="gluten-free">Gluten-Free</option>
              <option value="keto">Keto</option>
              <option value="paleo">Paleo</option>
              <option value="mediterranean">Mediterranean</option>
              <option value="low-carb">Low Carb</option>
            </select>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="profile-title">Allergies & Restrictions</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '15px', fontSize: '14px' }}>
            Select any allergies or dietary restrictions you have:
          </p>
          <div className="checkbox-group">
            {allergyOptions.map(allergy => (
              <div key={allergy} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`allergy-${allergy}`}
                  checked={allergies.includes(allergy)}
                  onChange={() => handleAllergyChange(allergy)}
                />
                <label htmlFor={`allergy-${allergy}`}>{allergy}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-section">
          <h3 className="profile-title">Favorite Cuisines</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '15px', fontSize: '14px' }}>
            Choose your favorite types of cuisine:
          </p>
          <div className="checkbox-group">
            {cuisineOptions.map(cuisine => (
              <div key={cuisine} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`cuisine-${cuisine}`}
                  checked={cuisines.includes(cuisine)}
                  onChange={() => handleCuisineChange(cuisine)}
                />
                <label htmlFor={`cuisine-${cuisine}`}>{cuisine}</label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            type="submit" 
            className="form-button"
            disabled={isLoading || !isAuthenticated}
            style={{ maxWidth: '200px' }}
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  )
}