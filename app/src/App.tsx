import { Routes, Route } from 'react-router'
import SiteLayout from './layouts/SiteLayout'
import Home from './pages/Home'
import StoriesPage from './pages/StoriesPage'
import StoryDetailPage from './pages/StoryDetailPage'
import DirectoryPage from './pages/DirectoryPage'
import TradesPage from './pages/TradesPage'
import TodayPage from './pages/TodayPage'
import BusinessDetailPage from './pages/BusinessDetailPage'
import LifePage from './pages/LifePage'
import CheerPage from './pages/CheerPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/stories/:id" element={<StoryDetailPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/trades" element={<TradesPage />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="/directory/:id" element={<BusinessDetailPage />} />
        <Route path="/life" element={<LifePage />} />
        <Route path="/cheer" element={<CheerPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  )
}
