import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Discover from './pages/Discover.jsx'
import RecipeDetails from './pages/RecipeDetails.jsx'
import AddRecipe from './pages/AddRecipe.jsx'
import EditRecipe from './pages/EditRecipe.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Admin from './pages/Admin.jsx'

const API = 'https://tastetrail-backend.onrender.com/api'

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    
    // Check if user is admin by fetching profile
    if (token) {
      fetch(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setIsAdmin(data.isAdmin || false))
      .catch(() => setIsAdmin(false))
    }
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setIsAdmin(false)
    window.location.href = '/'
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="header">
      <div className="nav-container">
        <Link to="/" className="logo">TasteTrail</Link>
        
        <nav className="nav-links">
          {/* Discover removed; keep left nav empty for spacing/alignment */}
        </nav>

        <div className="auth-buttons">
          {isLoggedIn ? (
            <>
              <Link 
                to="/recipes" 
                className={`btn btn-outline ${isActive('/recipes') ? 'active' : ''}`}
              >
                Recipes
              </Link>

              <Link 
                to="/add-recipe" 
                className={`btn btn-outline ${isActive('/add-recipe') ? 'active' : ''}`}
              >
                Meal Planner
              </Link>

              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`btn btn-outline ${isActive('/admin') ? 'active' : ''}`}
                >
                  Admin
                </Link>
              )}

              <Link 
                to="/profile" 
                className={`btn btn-outline ${isActive('/profile') ? 'active' : ''}`}
              >
                Profile
              </Link>

              <button onClick={handleLogout} className="btn btn-primary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/recipes" 
                className={`btn btn-outline ${isActive('/recipes') ? 'active' : ''}`}
              >
                Recipes
              </Link>

              <Link 
                to="/add-recipe" 
                className={`btn btn-outline ${isActive('/add-recipe') ? 'active' : ''}`}
              >
                Add Recipe
              </Link>

              <Link 
                to="/login" 
                className={`btn btn-outline ${isActive('/login') ? 'active' : ''}`}
              >
                Login
              </Link>

              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Set Your Tastes.</h1>
        <p>Personalize your recipe feed to match your lifestyle.</p>
        <div className="hero-buttons">
          <Link to="/register" className="btn btn-primary">Start Exploring</Link>
          <Link to="/login" className="btn btn-outline">Login</Link>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const location = useLocation()
  const showHero = location.pathname === '/' && !localStorage.getItem('token')

  return (
    <div className="app">
      <Header />
      {showHero && <Hero />}
      <main className={showHero ? '' : 'container section'}>
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/recipes" element={<Discover />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />
          <Route path="/recipes/:id/edit" element={<EditRecipe />} />
          <Route path="/add-recipe" element={<AddRecipe />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}
