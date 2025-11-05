import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API = 'http://localhost:5000/api'

// ✅ Fallback images
const fallbackImages = [
  "https://source.unsplash.com/400x300/?salad",
  "https://source.unsplash.com/400x300/?pasta",
  "https://source.unsplash.com/400x300/?pizza",
  "https://source.unsplash.com/400x300/?dessert",
  "https://source.unsplash.com/400x300/?smoothie",
  "https://source.unsplash.com/400x300/?indian-food",
  "https://source.unsplash.com/400x300/?vegan",
  "https://source.unsplash.com/400x300/?breakfast",
]

// ✅ Assets folder se saare images auto-load karein aur title se match karein
// Supported: png, jpg, jpeg, gif, webp
const rawImages = import.meta.glob('../assets/*.{png,jpg,jpeg,gif,webp}', { eager: true, import: 'default' })

// Normalize function: spaces/underscores/hyphens hata kar lowercase
const normalize = (str) => (str || '')
  .toLowerCase()
  .replace(/\.[^.]+$/, '')
  .replace(/[_\s-]+/g, '')
  .trim()

// Path -> URL map ko filename key se convert karein
const titleImageMap = Object.fromEntries(
  Object.entries(rawImages).map(([path, url]) => {
    const file = path.split('/').pop() || ''
    const base = file.replace(/\.[^.]+$/, '')
    const key = normalize(base)
    return [key, url]
  })
)

export default function Discover() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [diet, setDiet] = useState('')
  const [ingredient, setIngredient] = useState('')
  const [maxPrepTime, setMaxPrepTime] = useState('')

  // ✅ Fetch recipes
  async function fetchRecipes() {
    setLoading(true)
    try {
      const params = {}
      if (q) params.q = q
      if (diet) params.diet = diet
      if (ingredient) params.ingredient = ingredient
      if (maxPrepTime) params.maxPrepTime = maxPrepTime
      
      const { data } = await axios.get(`${API}/recipes`, { params })
      setRecipes(data)
    } catch (error) {
      console.error('Error fetching recipes:', error)
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecipes()
  }, [])

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchRecipes()
  }

  const clearFilters = () => {
    setQ('')
    setDiet('')
    setIngredient('')
    setMaxPrepTime('')
    setTimeout(fetchRecipes, 100)
  }

  // ✅ Safe image getter
  const getImageSrc = (recipe, index) => {
    const key = normalize(recipe.title)
    const img = titleImageMap[key]
    if (img) return img
    return `https://source.unsplash.com/400x300/?${encodeURIComponent(recipe.title || 'food')}`
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 className="section-title">Discover Recipes</h1>
        <Link to="/add-recipe" className="btn btn-primary">
          Add Recipe
        </Link>
      </div>

      {/* Filters Section */}
      <div className="filters">
        <h3 className="filters-title">Find Your Perfect Recipe</h3>
        <form onSubmit={handleFilterSubmit}>
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Search Recipes</label>
              <input 
                type="text"
                className="filter-input"
                placeholder="Search by title or keyword" 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Ingredient</label>
              <input 
                type="text"
                className="filter-input"
                placeholder="e.g., chicken, tomato" 
                value={ingredient} 
                onChange={(e) => setIngredient(e.target.value)} 
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Diet Type</label>
              <select 
                className="filter-select"
                value={diet} 
                onChange={(e) => setDiet(e.target.value)}
              >
                <option value="">Any diet</option>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="gluten-free">Gluten-Free</option>
                <option value="keto">Keto</option>
                <option value="paleo">Paleo</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="low-carb">Low Carb</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Max Prep Time (minutes)</label>
              <input 
                type="number" 
                className="filter-input"
                placeholder="e.g., 30" 
                value={maxPrepTime} 
                onChange={(e) => setMaxPrepTime(e.target.value)} 
                min="1"
                max="300"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" className="filter-button">
              Apply Filters
            </button>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={clearFilters}
              style={{ padding: '12px 24px', borderRadius: '8px' }}
            >
              Clear All
            </button>
          </div>
        </form>
      </div>

      {/* Recipe Cards */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
          </div>

          {recipes.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 20px' }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>No recipes found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <ul className="recipes-grid">
              {recipes.map((recipe, index) => {
                const rid = recipe.id || recipe._id
                const topIngredients = Array.isArray(recipe.ingredients)
                  ? recipe.ingredients.slice(0, 3).map(i => i.name || i).join(', ')
                  : ''

                const imgSrc = getImageSrc(recipe, index)

                return (
                  <li key={rid} className="recipe-card">
                    <Link to={`/recipes/${rid}`} className="recipe-card-link">
                      <div className="recipe-image" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        <img
                          src={imgSrc}
                          alt={recipe.title}
                          onError={(e) => e.currentTarget.src = fallbackImages[index % fallbackImages.length]}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '16px',
                            transition: 'transform 0.3s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                      </div>

                      <div className="recipe-content">
                        <h3 className="recipe-title">{recipe.title}</h3>
                        <p className="recipe-description">
                          {recipe.description || 'A delicious recipe waiting to be discovered.'}
                        </p>
                        <div className="recipe-meta">
                          <div className="recipe-time">⏱️ {recipe.prepTime || 30} min</div>
                          <div className="recipe-difficulty">🍽️ {recipe.diet || 'Any'}</div>
                        </div>
                        {topIngredients && (
                          <div style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
                            <strong>Key ingredients:</strong> {topIngredients}
                            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 3 ? '...' : ''}
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
