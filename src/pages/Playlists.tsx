import { useEffect, useState, useMemo } from 'react'
import { getPlaylists } from '../api/fortniteApi'
import type { Playlist } from '../api/fortniteApi'

// ── Helpers ────────────────────────────────────────────────────────────────────
const isZeroBuild = (p: Playlist) =>
  p.gameplayTags?.some(t => t.toLowerCase().includes('zerobuild') || t.toLowerCase().includes('zero_build'))

const getTeamLabel = (p: Playlist): string => {
  const size = p.maxSquadSize
  if (size === 1) return 'Solo'
  if (size === 2) return 'Duo'
  if (size === 3) return 'Trio'
  if (size >= 4 && !p.isLargeTeamGame) return 'Squad'
  if (p.isLargeTeamGame) return 'Large Team'
  return `${size}v${size}`
}

// Deduplicate by name — keep the one with an image if possible
const deduplicateByName = (playlists: Playlist[]): Playlist[] => {
  const map = new Map<string, Playlist>()
  for (const p of playlists) {
    const key = p.name?.trim().toLowerCase()
    if (!key) continue
    const existing = map.get(key)
    if (!existing) {
      map.set(key, p)
    } else {
      // Prefer the one with a showcase image
      const hasImg = p.images?.showcase || p.images?.missionIcon
      const existingHasImg = existing.images?.showcase || existing.images?.missionIcon
      if (hasImg && !existingHasImg) map.set(key, p)
    }
  }
  return Array.from(map.values())
}

const cleanGameType = (gt?: string): string => {
  if (!gt) return ''
  // Remove EFortGameType:: prefix and split camelCase
  const clean = gt.replace(/^EFortGameType::/, '').replace(/([A-Z])/g, ' $1').trim()
  return clean
}

const FILTERS = [
  { label: 'All',         value: 'all'        },
  { label: 'Default',     value: 'default'    },
  { label: 'Tournaments', value: 'tournament' },
  { label: 'LTM',         value: 'ltm'        },
  { label: 'Large Team',  value: 'largeteam'  },
  { label: 'Zero Build',  value: 'zerobuild'  },
]

// ── Badge ──────────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string
  color: string
  bg: string
  border: string
}

const Badge = ({ label, color, bg, border }: BadgeProps) => (
  <span
    className="text-xs font-black px-2 py-0.5 rounded-full border whitespace-nowrap"
    style={{ color, background: bg, borderColor: border }}
  >
    {label}
  </span>
)

const getBadges = (p: Playlist): BadgeProps[] => {
  const badges: BadgeProps[] = []
  if (p.isTournament)
    badges.push({ label: '🏆 Tournament', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)' })
  if (p.isLimitedTimeMode)
    badges.push({ label: '⏳ LTM', color: '#ec4899', bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.4)' })
  if (p.isLargeTeamGame)
    badges.push({ label: '👥 Large Team', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)' })
  if (isZeroBuild(p))
    badges.push({ label: '🚫 Zero Build', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.4)' })
  if (p.isDefault)
    badges.push({ label: '✓ Default', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)' })
  if (p.accumulateToProfileStats)
    badges.push({ label: '📊 Stats', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)' })
  return badges
}

// Team size → accent color
const teamColor = (p: Playlist): string => {
  const size = p.maxSquadSize
  if (size === 1) return '#3b82f6'
  if (size === 2) return '#8b5cf6'
  if (size === 3) return '#f97316'
  if (size >= 4) return '#22c55e'
  return '#6b7280'
}

// ── Playlist Card ──────────────────────────────────────────────────────────────
interface CardProps { playlist: Playlist; onClick: () => void }

const PlaylistCard = ({ playlist, onClick }: CardProps) => {
  const badges    = getBadges(playlist)
  const teamLabel = getTeamLabel(playlist)
  const image     = playlist.images?.showcase || playlist.images?.missionIcon
  const accent    = teamColor(playlist)

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden border border-white/10 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      {/* Image area */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {image ? (
          <img
            src={image}
            alt={playlist.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Nice fallback with gradient + icon */
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${accent}20, #0d1117)`,
            }}
          >
            <span className="text-5xl">🎮</span>
            <span
              className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: `${accent}30`, color: accent }}
            >
              {teamLabel}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

        {/* Team label top right */}
        <div
          className="absolute top-2 right-2 text-white text-xs font-black px-2.5 py-1 rounded-full border border-white/20"
          style={{ background: `${accent}40`, backdropFilter: 'blur(6px)' }}
        >
          {teamLabel}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-black text-sm uppercase tracking-wide leading-tight mb-1 truncate">
          {playlist.name}
        </h3>
        {playlist.subName && (
          <p className="text-gray-500 text-xs mb-2 truncate">{playlist.subName}</p>
        )}
        {playlist.description && (
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
            {playlist.description}
          </p>
        )}

        {/* Player info */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span style={{ color: accent }}>👤 {teamLabel}</span>
          <span>Max {playlist.maxPlayers} players</span>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {badges.map(b => <Badge key={b.label} {...b} />)}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Detail Modal ───────────────────────────────────────────────────────────────
interface ModalProps { playlist: Playlist; onClose: () => void }

const PlaylistModal = ({ playlist, onClose }: ModalProps) => {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const badges    = getBadges(playlist)
  const teamLabel = getTeamLabel(playlist)
  const accent    = teamColor(playlist)
  const image     = playlist.images?.showcase || playlist.images?.missionIcon

  const InfoRow = ({ label, value }: { label: string; value: string | number | boolean }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-gray-500 text-xs uppercase tracking-wider">{label}</span>
      <span className="text-white text-sm font-bold">{String(value)}</span>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d1117] rounded-2xl overflow-hidden max-w-2xl w-full border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/80 text-xl font-bold"
        >
          ×
        </button>

        {/* Hero */}
        <div className="relative" style={{ aspectRatio: '16/9' }}>
          {image ? (
            <img src={image} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-6xl"
              style={{ background: `linear-gradient(135deg, ${accent}30, #0d1117)` }}
            >
              🎮
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-[#0d1117] via-[#0d1117]/20 to-transparent" />
        </div>

        <div className="p-6">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-black text-2xl uppercase tracking-wide leading-tight">
                {playlist.name}
              </h2>
              {playlist.subName && (
                <p className="text-gray-400 text-sm mt-0.5">{playlist.subName}</p>
              )}
            </div>
            {playlist.images?.missionIcon && (
              <img
                src={playlist.images.missionIcon}
                alt="icon"
                className="w-14 h-14 object-contain rounded-xl border border-white/10 shrink-0"
              />
            )}
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {badges.map(b => <Badge key={b.label} {...b} />)}
            </div>
          )}

          {/* Description */}
          {playlist.description && (
            <p className="text-gray-300 text-sm leading-relaxed mb-6">{playlist.description}</p>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Mode',        value: teamLabel                },
              { label: 'Max Players', value: playlist.maxPlayers      },
              { label: 'Min Players', value: playlist.minPlayers      },
              { label: 'Team Size',   value: `${playlist.maxSquadSize} players` },
              { label: 'Max Teams',   value: playlist.maxTeams        },
              { label: 'Max Squads',  value: playlist.maxSquads       },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-xl p-3 border border-white/5 flex flex-col gap-0.5"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <span className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</span>
                <span className="text-white text-xl font-black" style={{ color: accent }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Details table */}
          <div
            className="rounded-xl border border-white/5 overflow-hidden mb-6"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <div className="px-4 py-2.5 border-b border-white/5">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">Mode Details</p>
            </div>
            <div className="px-4">
              {playlist.gameType && (
                <InfoRow label="Game Type"     value={cleanGameType(playlist.gameType)} />
              )}
              {playlist.ratingType && (
                <InfoRow label="Rating Type"   value={playlist.ratingType} />
              )}
              <InfoRow label="Default Mode"    value={playlist.isDefault ? 'Yes' : 'No'} />
              <InfoRow label="Tournament"      value={playlist.isTournament ? 'Yes' : 'No'} />
              <InfoRow label="Limited Time"    value={playlist.isLimitedTimeMode ? 'Yes' : 'No'} />
              <InfoRow label="Large Team"      value={playlist.isLargeTeamGame ? 'Yes' : 'No'} />
              <InfoRow label="Zero Build"      value={isZeroBuild(playlist) ? 'Yes' : 'No'} />
              <InfoRow label="Counts to Stats" value={playlist.accumulateToProfileStats ? 'Yes' : 'No'} />
              <InfoRow
                label="Added"
                value={new Date(playlist.added).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              />
            </div>
          </div>

          {/* Gameplay Tags */}
          {playlist.gameplayTags && playlist.gameplayTags.length > 0 && (
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">
                Gameplay Tags ({playlist.gameplayTags.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {playlist.gameplayTags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-gray-400"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
const Playlists = () => {
  const [raw,      setRaw]      = useState<Playlist[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState<Playlist | null>(null)

  useEffect(() => {
    getPlaylists()
      .then(d => {
        // Deduplicate first
        const unique = deduplicateByName(d)
        // Then sort: default first, then tournaments, then LTMs, then alpha
        unique.sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1
          if (!a.isDefault && b.isDefault) return 1
          if (a.isTournament && !b.isTournament) return -1
          if (!a.isTournament && b.isTournament) return 1
          if (a.isLimitedTimeMode && !b.isLimitedTimeMode) return -1
          if (!a.isLimitedTimeMode && b.isLimitedTimeMode) return 1
          return (a.name ?? '').localeCompare(b.name ?? '')
        })
        setRaw(unique)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load playlists'); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    let r = [...raw]
    if      (filter === 'default')    r = r.filter(p => p.isDefault)
    else if (filter === 'tournament') r = r.filter(p => p.isTournament)
    else if (filter === 'ltm')        r = r.filter(p => p.isLimitedTimeMode)
    else if (filter === 'largeteam')  r = r.filter(p => p.isLargeTeamGame)
    else if (filter === 'zerobuild')  r = r.filter(p => isZeroBuild(p))

    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.subName?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }
    return r
  }, [raw, filter, search])

  const counts = useMemo(() => ({
    all:        raw.length,
    default:    raw.filter(p => p.isDefault).length,
    tournament: raw.filter(p => p.isTournament).length,
    ltm:        raw.filter(p => p.isLimitedTimeMode).length,
    largeteam:  raw.filter(p => p.isLargeTeamGame).length,
    zerobuild:  raw.filter(p => isZeroBuild(p)).length,
  }), [raw])

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(180deg,#0a0e1a 0%,#0d1117 100%)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-50 border-b border-white/5"
        style={{ background: 'rgba(10,14,26,0.97)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-widest">
                Game <span className="text-[#00d4ff]">Modes</span>
              </h1>
              <p className="text-gray-500 text-xs mt-0.5">
                {loading ? 'Loading...' : `${filtered.length} of ${raw.length} playlists`}
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
              </svg>
              <input
                type="text"
                placeholder="Search modes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white/5 border border-white/10 text-white text-sm rounded-xl pl-9 pr-8 py-2 outline-none w-52"
                style={{ colorScheme: 'dark' }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-lg"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all border ${
                  filter === f.value
                    ? 'bg-[#00d4ff] text-black border-[#00d4ff] shadow-lg shadow-cyan-500/20'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {f.label}{' '}
                <span className={filter === f.value ? 'text-black/50' : 'text-gray-600'}>
                  ({counts[f.value as keyof typeof counts]})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center h-96 gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-[#00d4ff]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#00d4ff] animate-spin" />
            </div>
            <p className="text-white font-bold text-sm uppercase tracking-widest">Loading Playlists</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-400 font-bold">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="text-5xl">🎮</div>
            <p className="text-gray-500">No playlists found</p>
            <button
              onClick={() => { setSearch(''); setFilter('all') }}
              className="text-[#00d4ff] text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(p => (
              <PlaylistCard key={p.id} playlist={p} onClick={() => setSelected(p)} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <PlaylistModal playlist={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

export default Playlists