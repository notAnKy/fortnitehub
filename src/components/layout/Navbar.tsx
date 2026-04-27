import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Item Shop', path: '/',          icon: '🛒' },
  { label: 'Map',       path: '/map',        icon: '🗺️' },
  { label: 'Cosmetics', path: '/cosmetics',  icon: '👗' },
  { label: 'Stats',     path: '/stats',      icon: '📊' },
  { label: 'News',      path: '/news',       icon: '📰' },
  { label: 'Playlists', path: '/playlists',  icon: '🎮' },
]

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-100 border-b border-white/5"
        style={{ background: 'rgba(8,11,20,0.98)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between h-14">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <img src="https://fortnite-api.com/images/vbuck.png" alt="FNHub" className="w-6 h-6" />
            <span className="font-black text-white text-sm tracking-widest uppercase">
              FN<span className="text-[#00d4ff]">Hub</span>
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span className="hidden lg:block">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div
            className="md:hidden border-t border-white/5 px-4 py-3 flex flex-col gap-1"
            style={{ background: 'rgba(8,11,20,0.99)' }}
          >
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Backdrop to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}

export default Navbar