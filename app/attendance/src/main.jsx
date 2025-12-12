import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Render App directly (no StrictMode) to avoid dev double-mount side-effects
createRoot(document.getElementById('root')).render(
  <App />
)