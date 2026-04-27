import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Shop from './pages/Shop'
import Map from './pages/Map'
import Cosmetics from './pages/Cosmetics'
import Stats from './pages/Stats'
import News from './pages/News'
import Playlists from './pages/Playlists'
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
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App




// ok all good now do u have recomandation to the app what do wee add or fix offcorese in future i am gonna add some futures for
//  example a data base where peaple can log in and custmaze there locker in the app and add stuff also like and dislike skins in
//   the shop and stuff like that but will do that in the summer i think now i have some other projects to work on 