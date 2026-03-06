import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'
import Home from './home.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter> 
   <Routes>
    <Route path="/" element={<Home />} />
   </Routes>
  </BrowserRouter>,
)
