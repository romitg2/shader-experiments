import { Routes, Route } from 'react-router-dom'
import Gallery from './pages/Gallery.jsx'
import ComponentPage from './pages/ComponentPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Gallery />} />
      <Route path="/c/:id" element={<ComponentPage />} />
    </Routes>
  )
}
