import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://tastetrail-backend.onrender.com/api'

export default function RecipeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchRecipe() {
      setLoading(true)
      setError('')
      try {
        const { data } = await axios.get(`${API}/recipes/${id}`)
        setRecipe(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load recipe')
      } finally {
        setLoading(false)
      }
    }
    fetchRecipe()
  }, [id])

  if (loading) return <div className="loading"><div className="spinner"></div></div>
  if (error) return (
    <div className="container">
      <p className="message error">{error}</p>
      <Link to="/recipes" className="btn btn-outline">Back to Recipes</Link>
    </div>
  )

  const rid = recipe.id || recipe._id
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const steps = Array.isArray(recipe.steps) ? recipe.steps : []
  const cuisines = Array.isArray(recipe.cuisines) ? recipe.cuisines : []

  async function handleDelete() {
    const ok = window.confirm('Kya aap sach me is recipe ko delete karna chahte hain?')
    if (!ok) return
    try {
      await axios.delete(`${API}/recipes/${rid}`)
      navigate('/recipes')
    } catch (err) {
      setError(err.response?.data?.message || 'Delete karne me dikkat aayi')
    }
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <Link to="/recipes" className="btn btn-outline">← Back to Recipes</Link>
        <button className="btn btn-outline" onClick={() => navigate(`/recipes/${rid}/edit`)}>Edit</button>
        <button className="btn btn-primary" onClick={handleDelete}>Delete</button>
      </div>

      <article className="recipe-details">
        <h1 className="section-title">{recipe.title}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{recipe.description}</p>

        <div className="recipe-meta" style={{ marginBottom: '20px' }}>
          <div className="recipe-time">Prep: {recipe.prepTime} min</div>
          <div className="recipe-time">Cook: {recipe.cookTime} min</div>
          <div className="recipe-difficulty">Diet: {recipe.diet || 'Any'}</div>
          {cuisines.length > 0 && (
            <div className="recipe-difficulty">Cuisine: {cuisines.join(', ')}</div>
          )}
          {typeof recipe.rating === 'number' && (
            <div className="recipe-difficulty">Rating: {recipe.rating.toFixed(1)}</div>
          )}
        </div>

        <section style={{ marginBottom: '24px' }}>
          <h3>Ingredients</h3>
          <ul className="ingredients-list">
            {ingredients.map((ing, idx) => (
              <li key={idx}>{ing.name || ing} {ing.quantity ? `– ${ing.quantity}` : ''}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Steps</h3>
          <ol className="steps-list">
            {steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </section>
      </article>
    </div>
  )
}