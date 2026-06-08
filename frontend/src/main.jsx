import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MockDBProvider } from './context/MockDBContext.jsx'

// Clear localStorage once on startup to resolve any corrupted old schemas from previous sessions
if (localStorage.getItem('ficct_db_initialized_v1.1') !== 'true') {
  localStorage.clear();
  localStorage.setItem('ficct_db_initialized_v1.1', 'true');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MockDBProvider>
      <App />
    </MockDBProvider>
  </StrictMode>,
)
