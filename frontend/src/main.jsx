// frontend/src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 1. (ลบทิ้ง!) ไม่ต้อง import BrowserRouter ที่นี่
// import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. เรียก <App /> ตรงๆ ได้เลย */}
    <App />
  </React.StrictMode>,
)