
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Check for dark mode preference
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

createRoot(document.getElementById("root")!).render(<App />);
