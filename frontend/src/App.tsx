import { Navigate, Route, Routes } from 'react-router-dom'
import AdsListPage from './pages/ads-list-page.tsx'
import AdPage from './pages/ad-page.tsx'
import AdEditPage from './pages/ad-edit-page.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/ads" replace />} />
      <Route path="/ads" element={<AdsListPage />} />
      <Route path="/ads/:id" element={<AdPage />} />
      <Route path="/ads/:id/edit" element={<AdEditPage />} />
    </Routes>
  )
}

export default App