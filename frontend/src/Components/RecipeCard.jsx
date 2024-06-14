import React from 'react'
import '../Pages/Chat/Chat.css'
// Making it to display recipe properly

export default function RecipeCard({image,label,url,ingredientLines}) {
  return (
    
    <div id='recipes' key={label}>
              <img src={image} alt={label} />
              <h3>{label}</h3>
              <ul>
                      {ingredientLines.map(ingredient => (
                            <li key={ingredient}>{ingredient}</li>
                       ))}
              </ul>
              <a href={url} target="_blank" rel="noopener noreferrer">
                    View Recipe
              </a>
            <hr />
    </div>
  )
}
