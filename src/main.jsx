import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RegexTracker from './RegexTracker'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RegexTracker />
  </StrictMode>,
)
