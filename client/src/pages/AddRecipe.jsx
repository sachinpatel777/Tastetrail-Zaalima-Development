import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://tastetrail-backend.onrender.com/api'

export default function AddRecipe() {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCuisineChange = (e) => {
    const cuisines = e.target.value.split(',').map(c => c.trim()).filter(c => c)
    setFormData(prev => ({
      ...prev,
      cuisines
    }))
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
    // For demo purposes, we'll just store file names
    // In a real app, you'd upload to a service and get URLs
    const imageUrls = files.map(file => URL.createObjectURL(file))
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }))
  }

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Recipe title is required')
      }
      if (!formData.description.trim()) {
        throw new Error('Recipe description is required')
      }
      if (ingredients.some(ing => !ing.name.trim() || !ing.quantity.trim())) {
        throw new Error('All ingredients must have name and quantity')
      }
      if (steps.some(step => !step.trim())) {
        throw new Error('All steps must be filled out')
      }

      const recipeData = {
        ...formData,
        ingredients: ingredients.filter(ing => ing.name.trim()),
        steps: steps.filter(step => step.trim()),
        prepTime: parseInt(formData.prepTime) || 0,
        cookTime: parseInt(formData.cookTime) || 0
      }

      const { data: newRecipe } = await axios.post(`${API}/recipes`, recipeData)
      const rid = newRecipe.id || newRecipe._id
      navigate(`/recipes/${rid}`)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create recipe'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-recipe">
      <div className="add-recipe-header">
        <h1 className="add-recipe-title">Add New Recipe</h1>
        <p className="add-recipe-subtitle">Share your delicious recipe with the community</p>
      </div>

      {error && (
        <div className="message error">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="add-recipe-form">
        {/* Basic Information */}
        <div className="add-recipe-card">
          <h2 className="add-recipe-section-title">Basic Information</h2>
          
          <div className="grid-two">
            <div className="md:col-span-2">
              <label className="form-label">
                Recipe Title 
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter recipe title"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="form-label">
                Description 
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="form-input"
                placeholder="Describe your recipe"
                required
              />
            </div>
            
            <div>
              <label className="form-label">
                Prep Time (minutes)
              </label>
              <input
                type="number"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleInputChange}
                className="form-input"
                placeholder="15"
              />
            </div>
            
            <div>
              <label className="form-label">
                Cook Time (minutes)
              </label>
              <input
                type="number"
                name="cookTime"
                value={formData.cookTime}
                onChange={handleInputChange}
                className="form-input"
                placeholder="30"
              />
            </div>
            
            <div>
              <label className="form-label">
                Diet Type
              </label>
              <select
                name="diet"
                value={formData.diet}
                onChange={handleInputChange}
                className="form-input"
              >
                {dietOptions.map(diet => (
                  <option key={diet} value={diet}>
                    {diet === 'none' ? 'No specific diet' : diet.charAt(0).toUpperCase() + diet.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">
                Cuisines (comma-separated)
              </label>
              <input
                type="text"
                value={formData.cuisines.join(', ')}
                onChange={handleCuisineChange}
                className="form-input"
                placeholder="italian, mediterranean"
              />
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="add-recipe-card">
          <h2 className="add-recipe-section-title">Photos</h2>
          
          <div className="mb-4">
            <label className="form-label">Upload Photos</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="form-input"
            />
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

        {/* Ingredients */}
        <div className="add-recipe-card">
          <h2 className="add-recipe-section-title">Ingredients</h2>
          
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "15px",
              }}
            >
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, "name", e.target.value)}
                placeholder="Ingredient name"
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "15px",
                  borderRadius: "8px",
                  border: "1px solid #d0d7de",
                  boxSizing: "border-box",
                }}
              />

              <input
                type="text"
                value={ingredient.quantity}
                onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                placeholder="Quantity"
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "15px",
                  borderRadius: "8px",
                  border: "1px solid #d0d7de",
                  boxSizing: "border-box",
                }}
              />

              <select
                value={ingredient.category}
                onChange={(e) => updateIngredient(index, "category", e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "15px",
                  borderRadius: "8px",
                  border: "1px solid #d0d7de",
                  background: "#fff",
                  boxSizing: "border-box",
                }}
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => removeIngredient(index)}
                disabled={ingredients.length === 1}
                className="btn btn-soft btn-block btn-sm"
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addIngredient}
            className="btn btn-soft btn-block btn-sm"
          >
            Add Ingredient
          </button>

        </div>

        {/* Steps */}
        <div className="add-recipe-card">
          <h2 className="add-recipe-section-title">Cooking Steps</h2>
          
          {steps.map((step, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "15px",
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: "16px" }}>{index + 1}</div>

              <textarea
                value={step}
                onChange={(e) => updateStep(index, e.target.value)}
                placeholder={`Step ${index + 1} instructions`}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "15px",
                  borderRadius: "8px",
                  border: "1px solid #d0d7de",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />    

              <button
                type="button"
                onClick={() => removeStep(index)}
                disabled={steps.length === 1}
                className="btn btn-soft btn-sm btn-right"
              >
                Remove
              </button>
            </div>



            
          ))}
          
          <button
            type="button"
            onClick={addStep}
            className="btn btn-soft btn-block btn-sm"
          >
            Add Step
          </button>

        </div>

        {/* Submit */}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/recipes')} className="btn btn-outline" style={{ marginRight: '10px' }}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Creating Recipe...' : 'Create Recipe'}
          </button>
        </div>
      </form>
    </div>
  )
}