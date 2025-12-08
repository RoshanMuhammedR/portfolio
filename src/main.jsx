import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'
import { AiFillCheckCircle } from 'react-icons/ai'
import { MdErrorOutline } from 'react-icons/md'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      icons={{
        success:<AiFillCheckCircle/>,
        error:<MdErrorOutline/>
      }}
    />
    <App />
  </StrictMode>,
)
