import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://localhost:5000/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password })
      localStorage.setItem('token', data.token)
      setMessage({ type: 'success', text: `Welcome back, ${data.user.name}!` })
      
      // Redirect to discover page after successful login
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Login failed. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2 className="form-title">Welcome Back</h2>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <button 
          type="submit" 
          className="form-button"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="form-link">
        <Link to="/forgot-password">Forgot your password?</Link>
      </div>

      <div className="form-link">
        Don't have an account? <Link to="/register">Sign up here</Link>
      </div>
    </div>
  )
}