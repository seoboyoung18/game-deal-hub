import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import SearchResults from './pages/SearchResults.jsx'
import GameDetail from './pages/GameDetail.jsx'
import './styles/components.css'
import './styles/pages.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/game/:gameId" element={<GameDetail />} />
    </Routes>
  )
}
