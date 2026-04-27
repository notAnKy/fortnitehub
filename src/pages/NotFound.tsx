import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen text-white flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(180deg,#0a0e1a 0%,#0d1117 100%)' }}
    >
      <img
        src="https://fortnite-api.com/images/vbuck.png"
        alt="FNHub"
        className="w-16 h-16 mb-6 opacity-40"
      />
      <h1 className="text-8xl font-black text-[#00d4ff] mb-2">404</h1>
      <p className="text-2xl font-black uppercase tracking-widest text-white mb-2">
        Page Not Found
      </p>
      <p className="text-gray-500 text-sm mb-8 text-center max-w-sm">
        Looks like this page got eliminated. Head back to the lobby!
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-[#00d4ff] text-black font-black text-sm rounded-xl hover:bg-[#00bfea] transition-all uppercase tracking-widest"
      >
        Back to Lobby
      </button>
    </div>
  )
}

export default NotFound