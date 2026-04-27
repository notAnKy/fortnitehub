import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Shop from './pages/Shop'
import Map from './pages/Map'
import Cosmetics from './pages/Cosmetics'
import Stats from './pages/Stats'
import News from './pages/News'
import Playlists from './pages/Playlists'
import NotFound from './pages/NotFound'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="pt-14">
        <Routes>
          <Route path="/"           element={<Shop />}      />
          <Route path="/map"        element={<Map />}       />
          <Route path="/cosmetics"  element={<Cosmetics />} />
          <Route path="/stats"      element={<Stats />}     />
          <Route path="/news"       element={<News />}      />
          <Route path="/playlists"  element={<Playlists />} />
          <Route path="*"           element={<NotFound />}  />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App