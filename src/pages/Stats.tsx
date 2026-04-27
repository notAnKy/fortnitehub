import { useState } from 'react'
import { getPlayerStats } from '../api/fortniteApi'
import type { PlayerStats, ModeStats, InputStats } from '../api/fortniteApi'

const fmt = (n?: number, decimals = 0) => {
  if (n == null || n === 0) return '—'
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals })
}

const minsToHours = (mins?: number) => {
  if (!mins) return '—'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const kdColor = (kd?: number) => {
  if (!kd) return 'text-white'
  if (kd >= 5)  return 'text-yellow-400'
  if (kd >= 3)  return 'text-orange-400'
  if (kd >= 2)  return 'text-green-400'
  if (kd >= 1)  return 'text-blue-400'
  return 'text-gray-300'
}

const wrColor = (wr?: number) => {
  if (!wr) return 'text-white'
  if (wr >= 20) return 'text-yellow-400'
  if (wr >= 10) return 'text-green-400'
  if (wr >= 5)  return 'text-blue-400'
  return 'text-gray-300'
}

const PLATFORM_LABELS: Record<string, string> = {
  epic: 'Epic Games',
  psn:  'PlayStation',
  xbl:  'Xbox',
}

const PLATFORM_ICONS: Record<string, string> = {
  epic: '🎮',
  psn:  '🎮',
  xbl:  '🎮',
}

// ── Small stat cell ────────────────────────────────────────────────────────────
const Cell = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <div className="flex flex-col gap-0.5 p-3 rounded-xl border border-white/5"
    style={{ background: 'rgba(255,255,255,0.03)' }}>
    <span className="text-gray-500 text-xs uppercase tracking-wider">{label}</span>
    <span className={`text-lg font-black ${color ?? 'text-white'}`}>{value}</span>
  </div>
)

// ── Hero big card ──────────────────────────────────────────────────────────────
const HeroCard = ({ label, value, sub, color, bg, border }: {
  label: string; value: string; sub?: string
  color: string; bg: string; border: string
}) => (
  <div className={`rounded-2xl p-5 border ${border} flex flex-col gap-1`}
    style={{ background: bg }}>
    <p className={`text-xs uppercase tracking-widest font-bold ${color}`}>{label}</p>
    <p className={`text-4xl font-black ${color}`}>{value}</p>
    {sub && <p className="text-gray-600 text-xs">{sub}</p>}
  </div>
)

// ── Per-mode row ───────────────────────────────────────────────────────────────
const ModeRow = ({ label, stats }: { label: string; stats?: ModeStats }) => {
  if (!stats?.matches) return null
  return (
    <div className="mb-5">
      <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">{label}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        <Cell label="Matches"      value={fmt(stats.matches)} />
        <Cell label="Wins"         value={fmt(stats.wins)}           color="text-yellow-400" />
        <Cell label="Win Rate"     value={`${fmt(stats.winRate,1)}%`} color={wrColor(stats.winRate)} />
        <Cell label="Kills"        value={fmt(stats.kills)}          color="text-blue-300" />
        <Cell label="K/D"          value={fmt(stats.kd,2)}           color={kdColor(stats.kd)} />
        <Cell label="Kills/Match"  value={fmt(stats.killsPerMatch,2)} />
        <Cell label="Deaths"       value={fmt(stats.deaths)} />
        <Cell label="Score"        value={fmt(stats.score)} />
        <Cell label="Score/Match"  value={fmt(stats.scorePerMatch,0)} />
        <Cell label="Time Played"  value={minsToHours(stats.minutesPlayed)} />
        <Cell label="Players Outlived" value={fmt(stats.playersOutlived)} />
        {stats.top10 != null && <Cell label="Top 10"  value={fmt(stats.top10)} />}
        {stats.top25 != null && <Cell label="Top 25"  value={fmt(stats.top25)} />}
        {stats.top5  != null && <Cell label="Top 5"   value={fmt(stats.top5)} />}
        {stats.top3  != null && <Cell label="Top 3"   value={fmt(stats.top3)} />}
      </div>
    </div>
  )
}

// ── Input tab content ──────────────────────────────────────────────────────────
const InputTab = ({ stats }: { stats?: InputStats }) => {
  if (!stats?.overall) return (
    <p className="text-gray-600 text-sm text-center py-16">No data for this input type</p>
  )
  const o = stats.overall
  return (
    <div>
      {/* Hero cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <HeroCard
          label="Wins" value={fmt(o.wins)}
          sub={`${fmt(o.winRate,1)}% win rate`}
          color="text-yellow-400"
          bg="rgba(234,179,8,0.06)"
          border="border-yellow-500/20"
        />
        <HeroCard
          label="Kills" value={fmt(o.kills)}
          sub={`${fmt(o.killsPerMatch,2)} per match`}
          color="text-blue-300"
          bg="rgba(59,130,246,0.06)"
          border="border-blue-500/20"
        />
        <HeroCard
          label="K/D Ratio" value={fmt(o.kd,2)}
          sub={`${fmt(o.deaths)} deaths`}
          color={kdColor(o.kd)}
          bg="rgba(168,85,247,0.06)"
          border="border-purple-500/20"
        />
        <HeroCard
          label="Matches" value={fmt(o.matches)}
          sub={minsToHours(o.minutesPlayed) + ' played'}
          color="text-green-300"
          bg="rgba(34,197,94,0.06)"
          border="border-green-500/20"
        />
      </div>

      {/* Overall extra stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-8">
        <Cell label="Score"           value={fmt(o.score)} />
        <Cell label="Score/Match"     value={fmt(o.scorePerMatch,0)} />
        <Cell label="Kills/Min"       value={fmt(o.killsPerMin,2)} />
        <Cell label="Players Outlived" value={fmt(o.playersOutlived)} />
        {o.top10  != null && <Cell label="Top 10"  value={fmt(o.top10)} />}
        {o.top25  != null && <Cell label="Top 25"  value={fmt(o.top25)} />}
        {o.top5   != null && <Cell label="Top 5"   value={fmt(o.top5)} />}
        {o.top3   != null && <Cell label="Top 3"   value={fmt(o.top3)} />}
      </div>

      {/* Mode breakdown */}
      <div className="rounded-2xl border border-white/5 p-5"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Mode Breakdown</p>
        <ModeRow label="Solo"  stats={stats.solo}  />
        <ModeRow label="Duo"   stats={stats.duo}   />
        <ModeRow label="Squad" stats={stats.squad} />
        <ModeRow label="LTM"   stats={stats.ltm}   />
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
const INPUT_TABS = [
  { label: 'All',        value: 'all'          },
  { label: '⌨️ KB/Mouse', value: 'keyboardMouse' },
  { label: '🎮 Controller', value: 'gamepad'   },
  { label: '📱 Touch',   value: 'touch'        },
] as const

const TIME_WINDOWS = [
  { label: 'Lifetime', value: 'lifetime' },
  { label: 'Season',   value: 'season'   },
] as const

const Stats = () => {
  const [query,       setQuery]       = useState('')
  const [timeWindow,  setTimeWindow]  = useState<'lifetime'|'season'>('lifetime')
  const [activeInput, setActiveInput] = useState<'all'|'keyboardMouse'|'gamepad'|'touch'>('all')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [result,      setResult]      = useState<{ data: PlayerStats; platform: string } | null>(null)

  const search = async () => {
    const name = query.trim()
    if (!name) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const found = await getPlayerStats(name, timeWindow)
      setResult(found)
      setActiveInput('all')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') search()
  }

  const data = result?.data
  const currentStats = data?.stats?.[activeInput]

  return (
    <div className="min-h-screen text-white"
      style={{ background: 'linear-gradient(180deg,#0a0e1a 0%,#0d1117 100%)' }}>

      {/* Search hero */}
      <div className="border-b border-white/5 py-12 px-6"
        style={{ background: 'rgba(0,212,255,0.03)' }}>
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-4xl font-black uppercase tracking-widest mb-2">
            Player <span className="text-[#00d4ff]">Stats</span>
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Search any Fortnite player — we'll check Epic, PlayStation and Xbox automatically
          </p>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                type="text"
                placeholder="Enter player name..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-[#00d4ff]/50 placeholder-gray-600"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <button
              onClick={search}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-[#00d4ff] text-black font-black text-sm rounded-xl hover:bg-[#00bfea] transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? '···' : 'SEARCH'}
            </button>
          </div>

          {/* Time window */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-600 text-xs">Time window:</span>
            <div className="flex rounded-xl overflow-hidden border border-white/10">
              {TIME_WINDOWS.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTimeWindow(t.value)}
                  className={`px-4 py-1.5 text-xs font-bold transition-all ${
                    timeWindow === t.value
                      ? 'bg-[#00d4ff]/20 text-[#00d4ff]'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-14 h-14 relative">
              <div className="absolute inset-0 rounded-full border-4 border-[#00d4ff]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#00d4ff] animate-spin" />
            </div>
            <p className="text-gray-400 text-sm uppercase tracking-widest">Searching all platforms…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl">❌</div>
            <p className="text-red-400 font-bold text-lg">Player Not Found</p>
            <p className="text-gray-600 text-sm text-center max-w-sm">
              Could not find <span className="text-white font-bold">"{query}"</span> on Epic, PlayStation or Xbox.
            </p>
            <p className="text-gray-700 text-xs">Make sure the username is correct and stats are set to public in Fortnite settings.</p>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div>
            {/* Player header */}
            <div className="flex items-center gap-5 mb-8 p-5 rounded-2xl border border-white/5"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="w-16 h-16 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-3xl font-black text-[#00d4ff] shrink-0">
                {data.account.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-white truncate">{data.account.name}</h2>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-bold px-2 py-0.5 rounded-full">
                    BP Level {data.battlePass.level}
                  </span>
                  <span className="bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 text-xs font-bold px-2 py-0.5 rounded-full">
                    {PLATFORM_LABELS[result!.platform]}
                  </span>
                  <span className="bg-white/5 text-gray-400 border border-white/10 text-xs font-bold px-2 py-0.5 rounded-full capitalize">
                    {timeWindow}
                  </span>
                </div>
              </div>
            </div>

            {/* Input tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {INPUT_TABS.map(tab => {
                const hasData = !!data.stats?.[tab.value]?.overall
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveInput(tab.value)}
                    disabled={!hasData}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                      activeInput === tab.value
                        ? 'bg-[#00d4ff]/15 text-[#00d4ff] border-[#00d4ff]/30'
                        : hasData
                          ? 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                          : 'opacity-30 cursor-not-allowed bg-white/5 text-gray-600 border-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <InputTab stats={currentStats} />
          </div>
        )}

        {/* Empty state */}
        {!data && !loading && !error && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className="text-6xl">🏆</div>
            <p className="text-gray-500">Search a player above to view their stats</p>
            <p className="text-gray-700 text-xs">We automatically check Epic Games, PlayStation and Xbox</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Stats