import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const API = 'https://tastetrail-backend.onrender.com/api'

export default function EditRecipe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prepTime: '',
    cookTime: '',
    diet: 'none',
    cuisines: [''],
    images: [],
    rating: 4.0
  })

  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '', category: 'produce' }
  ])

  const [steps, setSteps] = useState([''])

  const dietOptions = ['none', 'vegetarian', 'vegan', 'gluten-free', 'keto', 'paleo']
  const categoryOptions = ['produce', 'meat', 'dairy', 'grains', 'canned', 'condiments', 'spices', 'misc']

  useEffect(() => {
    async function fetchRecipe() {
      setLoading(true)
      setError('')
      try {
        const { data } = await axios.get(`${API}/recipes/${id}`)
        setFormData({
          title: data.title || '',
          description: data.description || '',
          prepTime: data.prepTime ?? '',
          cookTime: data.cookTime ?? '',
          diet: data.diet || 'none',
          cuisines: Array.isArray(data.cuisines) ? data.cuisines : [],
          images: Array.isArray(data.images) ? data.images : [],
          rating: typeof data.rating === 'number' ? data.rating : 4.0,
        })
        setIngredients(Array.isArray(data.ingredients) && data.ingredients.length > 0 ? data.ingredients.map(ing => ({
          name: ing.name || (typeof ing === 'string' ? ing : ''),
          quantity: ing.quantity || '',
          category: ing.category || 'misc'
        })) : [{ name: '', quantity: '', category: 'produce' }])
        setSteps(Array.isArray(data.steps) && data.steps.length > 0 ? data.steps : [''])
      } catch (err) {
        setError(err.response?.data?.message || 'Recipe load nahi ho paayi')
      } finally {
        setLoading(false)
      }
    }
    fetchRecipe()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCuisineChange = (e) => {
    const cuisines = e.target.value.split(',').map(c => c.trim()).filter(c => c)
    setFormData(prev => ({ ...prev, cuisines }))
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', category: 'produce' }])
  }

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index))
    }
  }

  const updateIngredient = (index, field, value) => {
    const updated = ingredients.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    )
    setIngredients(updated)
  }

  const addStep = () => {
    setSteps([...steps, ''])
  }

  const removeStep = (index) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index))
    }
  }

  const updateStep = (index, value) => {
    const updated = steps.map((step, i) => i === index ? value : step)
    setSteps(updated)
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    const imageUrls = files.map(file => URL.createObjectURL(file))
    setFormData(prev => ({ ...prev, images: [...prev.images, ...imageUrls] }))
  }

  const removePhoto = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.title.trim()) throw new Error('Recipe title zaroori hai')
      if (!formData.description.trim()) throw new Error('Description zaroori hai')
      if (ingredients.some(ing => !ing.name.trim() || !ing.quantity.trim())) {
        throw new Error('Har ingredient ka name aur quantity hona chahiye')
      }
      if (steps.some(step => !step.trim())) throw new Error('Saare steps bhare hon chahiye')

      const recipeData = {
        ...formData,
        ingredients: ingredients.filter(ing => ing.name.trim()),
        steps: steps.filter(step => step.trim()),
        prepTime: parseInt(formData.prepTime) || 0,
        cookTime: parseInt(formData.cookTime) || 0
      }

      const { data: updated } = await axios.put(`${API}/recipes/${id}`, recipeData)
      const rid = updated.id || updated._id || id
      navigate(`/recipes/${rid}`)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Update nahi ho paaya'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.title) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div className="add-recipe">
      <div className="add-recipe-header">
        <h1 className="add-recipe-title">Edit Recipe</h1>
        <p className="add-recipe-subtitle">Apni recipe ko update karein</p>
      </div>

      {error && (<div className="message error">{error}</div>)}

      <form onSubmit={handleSubmit} className="add-recipe-form">
        <div className="add-recipe-card">
          <h2 className="add-recipe-section-title">Basic Information</h2>
          <div className="grid-two">
            <div className="md:col-span-2">
              <label className="form-label">Recipe Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="form-input" placeholder="Enter recipe title" required />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="form-input" placeholder="Describe your recipe" required />
            </div>
            <div>
              <label className="form-label">Prep Time (minutes)</label>
              <input type="number" name="prepTime" value={formData.prepTime} onChange={handleInputChange} className="form-input" placeholder="15" />
            </div>
            <div>
              <label className="form-label">Cook Time (minutes)</label>
              <input type="number" name="cookTime" value={formData.cookTime} onChange={handleInputChange} className="form-input" placeholder="30" />
            </div>
            <div>
              <label className="form-label">Diet Type</label>
              <select name="diet" value={formData.diet} onChange={handleInputChange} className="form-input">
                {dietOptions.map(diet => (<option key={diet} value={diet}>{diet === 'none' ? 'No specific diet' : diet.charAt(0).toUpperCase() + diet.slice(1)}</option>))}
              </select>
            </div>
            <div>
              <label className="form-label">Cuisines (comma-separated)</label>
              <input type="text" value={formData.cuisines.join(', ')} onChange={handleCuisineChange} className="form-input" placeholder="italian, mediterranean" />
            </div>
          </div>
        </div>

        <div className="add-recipe-card">
          <h2 className="add-recipe-section-title">Photos</h2>
          <div className="mb-4">
            <label className="form-label">Upload Photos</label>
            <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="form-input" />
          </div>
          {formData.images.length > 0 && (
            <div className="image-previews">
              {formData.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image} alt={`Recipe ${index + 1}`} />
                  <button type="button" onClick={() => removePhoto(index)} className="btn btn-outline btn-sm image-remove">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="add-recipe-card">
          <h2 className="add-recipe-section-title">Ingredients</h2>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="list-row">
              <input type="text" value={ingredient.name} onChange={(e) => updateIngredient(index, 'name', e.target.value)} className="form-input" placeholder="Ingredient name" />
              <input type="text" value={ingredient.quantity} onChange={(e) => updateIngredient(index, 'quantity', e.target.value)} className="form-input" placeholder="Quantity" />
              <select value={ingredient.category} onChange={(e) => updateIngredient(index, 'category', e.target.value)} className="form-input">
                {categoryOptions.map(category => (<option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>))}
              </select>
              <button type="button" onClick={() => removeIngredient(index)} className="btn btn-outline btn-sm" disabled={ingredients.length === 1}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addIngredient} className="btn btn-outline btn-sm">Add Ingredient</button>
        </div>

        <div className="add-recipe-card">
          <h2 className="add-recipe-section-title">Cooking Steps</h2>
          {steps.map((step, index) => (
            <div key={index} className="step-row">
              <div className="step-index">{index + 1}</div>
              <textarea value={step} onChange={(e) => updateStep(index, e.target.value)} className="form-input" placeholder={`Step ${index + 1} instructions`} rows={2} />
              <button type="button" onClick={() => removeStep(index)} className="btn btn-outline btn-sm" disabled={steps.length === 1}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addStep} className="btn btn-outline btn-sm">Add Step</button>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(`/recipes/${id}`)} className="btn btn-outline" style={{ marginRight: '10px' }}>Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Updating...' : 'Update Recipe'}</button>
        </div>
      </form>
    </div>
  )
}