import { useEffect, useState, useRef, useCallback } from 'react'
import { getMap } from '../api/fortniteApi'

interface POI {
  id: string
  name: string
  location: { x: number; y: number; z: number }
}

interface MapData {
  images: { blank: string; pois: string }
  pois: POI[]
}

const Map = () => {
  const [mapData,     setMapData]     = useState<MapData | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [showImg,     setShowImg]     = useState<'pois' | 'blank'>('pois')
  const [hovered,     setHovered]     = useState<POI | null>(null)
  const [search,      setSearch]      = useState('')
  const [scale,       setScale]       = useState(1)
  const [offset,      setOffset]      = useState({ x: 0, y: 0 })
  const [dragging,    setDragging]    = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const dragStart  = useRef({ x: 0, y: 0, ox: 0, oy: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getMap()
      .then(d => { setMapData(d); setLoading(false) })
      .catch(() => { setError('Failed to load map'); setLoading(false) })
  }, [])

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.04 : 0.96
    setScale(prev => Math.min(Math.max(prev * factor, 1), 8))
  }, [])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  useEffect(() => {
    if (scale <= 1) setOffset({ x: 0, y: 0 })
  }, [scale])

  // Touch pinch zoom
  const lastTouchDist = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy)
    } else if (e.touches.length === 1 && scale > 1) {
      setDragging(true)
      dragStart.current = {
        x: e.touches[0].clientX, y: e.touches[0].clientY,
        ox: offset.x, oy: offset.y
      }
    }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const factor = dist / lastTouchDist.current
      setScale(prev => Math.min(Math.max(prev * factor, 1), 8))
      lastTouchDist.current = dist
    } else if (e.touches.length === 1 && dragging) {
      setOffset({
        x: dragStart.current.ox + e.touches[0].clientX - dragStart.current.x,
        y: dragStart.current.oy + e.touches[0].clientY - dragStart.current.y,
      })
    }
  }
  const onTouchEnd = () => {
    lastTouchDist.current = null
    setDragging(false)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    setOffset({
      x: dragStart.current.ox + e.clientX - dragStart.current.x,
      y: dragStart.current.oy + e.clientY - dragStart.current.y,
    })
  }
  const onMouseUp = () => setDragging(false)

  const zoomIn  = () => setScale(s => Math.min(s * 1.25, 8))
  const zoomOut = () => setScale(s => Math.max(s / 1.25, 1))
  const reset   = () => { setScale(1); setOffset({ x: 0, y: 0 }) }

  const filteredPOIs = [...(mapData?.pois ?? [])]
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  const OCEAN_COLOR = '#1b3d5c'

  return (
    <div
      className="flex text-white relative"
      style={{ height: 'calc(100vh - 56px)', background: '#0d1117', overflow: 'hidden' }}
    >
      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      {/* Desktop: always visible | Mobile: slides in from left */}
      <aside
        className={`
          absolute lg:relative z-30
          w-72 shrink-0 flex flex-col border-r border-white/5
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'rgba(8,11,20,0.99)',
          height: '100%',
        }}
      >
        {/* Sidebar header */}
        <div className="px-4 pt-4 pb-3 border-b border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-base font-black uppercase tracking-widest">
              Battle Royale <span className="text-[#00d4ff]">Map</span>
            </h1>
            {mapData && (
              <p className="text-gray-600 text-xs mt-0.5">{mapData.pois.length} named locations</p>
            )}
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
            <input
              type="text"
              placeholder="Search locations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl pl-9 pr-3 py-2 outline-none placeholder-gray-600"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Show Labels toggle */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🗺️</span>
              <span className="text-sm font-bold">Show Labels</span>
            </div>
            <button
              onClick={() => setShowImg(v => v === 'pois' ? 'blank' : 'pois')}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                showImg === 'pois' ? 'bg-[#00d4ff]' : 'bg-white/10'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                showImg === 'pois' ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* POI list */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,212,255,0.25) transparent' }}
        >
          {!loading && filteredPOIs.length === 0 && (
            <p className="text-center text-gray-600 text-xs py-10">No results</p>
          )}
          {filteredPOIs.map(poi => {
            const active = hovered?.id === poi.id
            return (
              <button
                key={poi.id}
                onMouseEnter={() => setHovered(poi)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-white/5 text-left transition-colors ${
                  active ? 'bg-[#00d4ff]/10' : 'hover:bg-white/5'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 transition-all"
                  style={{
                    backgroundColor: active ? '#00d4ff' : 'rgba(255,255,255,0.2)',
                    boxShadow: active ? '0 0 6px #00d4ff' : 'none',
                  }}
                />
                <span className={`text-xs font-bold uppercase tracking-wide ${
                  active ? 'text-[#00d4ff]' : 'text-gray-400'
                }`}>
                  {poi.name}
                </span>
              </button>
            )
          })}
        </div>

        <div className="px-4 py-2 border-t border-white/5">
          <p className="text-gray-600 text-xs">
            {filteredPOIs.length} of {mapData?.pois.length ?? 0} locations
          </p>
        </div>
      </aside>

      {/* Backdrop — mobile only */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAP AREA ─────────────────────────────────────────────────── */}
      <div
        ref={wrapperRef}
        className="flex-1 relative overflow-hidden"
        style={{
          background: OCEAN_COLOR,
          cursor: dragging ? 'grabbing' : scale > 1 ? 'grab' : 'default',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Mobile top bar */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-white/20 text-white"
            style={{ background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(10px)' }}
          >
            📍 Locations
          </button>
          <button
            onClick={() => setShowImg(v => v === 'pois' ? 'blank' : 'pois')}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-white/20 text-white"
            style={{ background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(10px)' }}
          >
            {showImg === 'pois' ? '🏷️ Labels On' : '🏷️ Labels Off'}
          </button>
        </div>

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 relative">
              <div className="absolute inset-0 rounded-full border-4 border-[#00d4ff]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#00d4ff] animate-spin" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading map…</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-400 font-bold">{error}</p>
          </div>
        )}

        {!loading && !error && mapData && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                transition: dragging ? 'none' : 'transform 0.15s ease',
                position: 'relative',
                width:  'min(100%, calc(100vh - 56px))',
                height: 'min(100%, calc(100vh - 56px))',
              }}
            >
              <img
                src={showImg === 'pois' ? mapData.images.pois : mapData.images.blank}
                alt="Fortnite Map"
                draggable={false}
                loading="eager" decoding="async"
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', display: 'block',
                  userSelect: 'none', borderRadius: '16px',
                }}
              />
            </div>
          </div>
        )}

        {/* Zoom controls */}
        {!loading && !error && (
          <div
            className="absolute bottom-5 right-5 flex flex-col overflow-hidden border border-white/10 shadow-xl"
            style={{
              background: 'rgba(8,11,20,0.92)',
              backdropFilter: 'blur(12px)',
              zIndex: 40, borderRadius: '12px',
            }}
          >
            <button onClick={zoomIn}
              className="w-10 h-10 flex items-center justify-center text-white text-xl font-black hover:bg-white/10 transition-colors border-b border-white/10">
              +
            </button>
            <div className="w-10 h-7 flex items-center justify-center text-gray-500 text-xs font-bold border-b border-white/10 select-none">
              {Math.round(scale * 100)}%
            </div>
            <button onClick={zoomOut}
              className="w-10 h-10 flex items-center justify-center text-white text-xl font-black hover:bg-white/10 transition-colors border-b border-white/10">
              −
            </button>
            <button onClick={reset} title="Reset view"
              className="w-10 h-9 flex items-center justify-center hover:bg-white/10 transition-colors">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        )}

        {/* Hint */}
        {scale === 1 && !loading && !error && (
          <div
            className="absolute bottom-5 left-5 px-3 py-1.5 rounded-lg text-xs border border-white/10 hidden sm:block"
            style={{ background: 'rgba(8,11,20,0.8)', color: '#6b7280', zIndex: 40 }}
          >
            🖱 Scroll to zoom · Drag to pan
          </div>
        )}

        {/* Mobile hint */}
        {scale === 1 && !loading && !error && (
          <div
            className="absolute bottom-5 left-5 px-3 py-1.5 rounded-lg text-xs border border-white/10 sm:hidden"
            style={{ background: 'rgba(8,11,20,0.8)', color: '#6b7280', zIndex: 40 }}
          >
            👌 Pinch to zoom · Drag to pan
          </div>
        )}
      </div>
    </div>
  )
}

export default Map