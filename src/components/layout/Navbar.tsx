import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Item Shop', path: '/',           icon: '🛒' },
  { label: 'Map',       path: '/map',         icon: '🗺️' },
  { label: 'Cosmetics', path: '/cosmetics',   icon: '👗' },
  { label: 'Stats',     path: '/stats',       icon: '📊' },
  { label: 'News',      path: '/news',        icon: '📰' },
  { label: 'Playlists', path: '/playlists',   icon: '🎮' },
]

const Navbar = () => {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-100 border-b border-white/5"
      style={{ background: 'rgba(8,11,20,0.98)', backdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 flex items-center gap-8 h-14">
        <div className="flex items-center gap-2 shrink-0">
          <img src="https://fortnite-api.com/images/vbuck.png" alt="FNHub" className="w-6 h-6" />
          <span className="font-black text-white text-sm tracking-widest uppercase">
            FN<span className="text-[#00d4ff]">Hub</span>
          </span>
        </div>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar