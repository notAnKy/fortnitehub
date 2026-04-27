import { useState, useMemo, useEffect, useRef } from 'react'
import { useItemShop } from '../hooks/useItemShop'
import ShopItemCard from '../components/shop/ShopItem'
import type { ShopEntry } from '../types/fortnite'

const TYPE_ORDER: Record<string, number> = {
  bundle: 0, outfit: 1, backpack: 2, pickaxe: 3,
  glider: 4, emote: 5, spray: 6, toy: 7,
  wrap: 8, musicpack: 9, loadingscreen: 10, contrail: 11,
  car: 50, track: 51, instrument: 52, legokit: 53,
}

const getEntryType = (e: ShopEntry): string => {
  if (e.bundle?.name)        return 'bundle'
  if (e.brItems?.length)     return e.brItems[0].type?.value ?? 'unknown'
  if (e.tracks?.length)      return 'track'
  if (e.instruments?.length) return 'instrument'
  if (e.cars?.length)        return 'car'
  if (e.legoKits?.length)    return 'legokit'
  return 'unknown'
}

const getSortOrder = (e: ShopEntry) => TYPE_ORDER[getEntryType(e)] ?? 99

const BOTTOM_TYPES = ['track', 'instrument', 'car', 'legokit']

const getSectionPriority = (entries: ShopEntry[]): number => {
  const types = entries.map(e => getEntryType(e))
  const isBottomSection = types.every(t => BOTTOM_TYPES.includes(t))
  if (isBottomSection) return 1000

  const mostRecent = entries.reduce((best, e) => {
    const d = new Date((e as any).inDate ?? 0).getTime()
    return d > best ? d : best
  }, 0)

  const daysSinceAdded = (Date.now() - mostRecent) / 86400000
  if (daysSinceAdded < 3) return -daysSinceAdded

  return entries[0]?.layout?.index ?? 500
}

const ACCENTS = [
  { dot: '#3b82f6', text: 'text-blue-400',   border: 'border-blue-500'   },
  { dot: '#a855f7', text: 'text-purple-400', border: 'border-purple-500' },
  { dot: '#f97316', text: 'text-orange-400', border: 'border-orange-500' },
  { dot: '#22c55e', text: 'text-green-400',  border: 'border-green-500'  },
  { dot: '#ef4444', text: 'text-red-400',    border: 'border-red-500'    },
  { dot: '#06b6d4', text: 'text-cyan-400',   border: 'border-cyan-500'   },
  { dot: '#ec4899', text: 'text-pink-400',   border: 'border-pink-500'   },
  { dot: '#eab308', text: 'text-yellow-400', border: 'border-yellow-500' },
  { dot: '#6366f1', text: 'text-indigo-400', border: 'border-indigo-500' },
  { dot: '#14b8a6', text: 'text-teal-400',   border: 'border-teal-500'   },
]

const FILTER_GROUPS = [
  {
    label: 'Quick Filters',
    filters: [
      { label: '✦ New Today',    value: 'new'     },
      { label: '⏳ Leaving Soon', value: 'leaving' },
    ],
  },
  {
    label: 'Battle Royale',
    filters: [
      { label: 'Outfits',     value: 'outfit'     },
      { label: 'Emotes',      value: 'emote'      },
      { label: 'Pickaxes',    value: 'pickaxe'    },
      { label: 'Back Blings', value: 'backpack'   },
      { label: 'Gliders',     value: 'glider'     },
      { label: 'Sidekicks',   value: 'sidekick'   },
      { label: 'Kicks',       value: 'shoe'       },
      { label: 'Wraps',       value: 'wrap'       },
      { label: 'Bundles',     value: 'bundle'     },
    ],
  },
  {
    label: 'Rocket Racing',
    filters: [
      { label: 'Cars',        value: 'car'        },
    ],
  },
  {
    label: 'Festival',
    filters: [
      { label: 'Jam Tracks',  value: 'track'      },
      { label: 'Instruments', value: 'instrument' },
    ],
  },
  {
    label: 'LEGO',
    filters: [
      { label: 'LEGO Kits',   value: 'legokit'    },
    ],
  },
]

const ALL_FILTERS = FILTER_GROUPS.flatMap(g => g.filters)

const Shop = () => {
  const { entries, loading, error } = useItemShop()
  const [activeFilter,  setActiveFilter]  = useState('all')
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [sortBy,        setSortBy]        = useState<'default'|'price-asc'|'price-desc'|'name'>('default')
  const [countdown,     setCountdown]     = useState('')
  const [activeSection, setActiveSection] = useState('')
  const [sidebarHover,  setSidebarHover]  = useState(false)
  const sectionRefs  = useRef<Record<string, HTMLDivElement|null>>({})
  const filterRef    = useRef<HTMLDivElement>(null)
  const sidebarTimer = useRef<ReturnType<typeof setTimeout>|null>(null)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setUTCHours(24, 0, 0, 0)
      const ms = midnight.getTime() - now.getTime()
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      setCountdown(`${h}h ${m}m ${s}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFilterOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const validEntries = useMemo(() =>
    entries.filter(e =>
      e.brItems?.length || e.cars?.length ||
      e.tracks?.length  || e.instruments?.length ||
      e.legoKits?.length || e.bundle
    ), [entries])

  const totalItems   = validEntries.length
  const newCount     = validEntries.filter(e =>
    e.banner?.value?.toLowerCase().includes('new')
  ).length
  const leavingCount = validEntries.filter(e => {
    if (!e.outDate) return false
    return new Date(e.outDate).getTime() - Date.now() < 86400000
  }).length

  const activeLabel = activeFilter === 'all'
    ? 'All'
    : ALL_FILTERS.find(f => f.value === activeFilter)?.label ?? activeFilter

  const filtered = useMemo(() => {
    let r = [...validEntries]

    if (activeFilter === 'new') {
      r = r.filter(e => e.banner?.value?.toLowerCase().includes('new'))
    } else if (activeFilter === 'leaving') {
      r = r.filter(e => {
        if (!e.outDate) return false
        return new Date(e.outDate).getTime() - Date.now() < 86400000
      })
    } else if (activeFilter === 'bundle') {
      r = r.filter(e => !!e.bundle?.name)
    } else if (activeFilter === 'outfit') {
      r = r.filter(e => e.brItems?.[0]?.type?.value === 'outfit')
    } else if (activeFilter === 'pickaxe') {
      r = r.filter(e => e.brItems?.[0]?.type?.value === 'pickaxe')
    } else if (activeFilter === 'glider') {
      r = r.filter(e => e.brItems?.[0]?.type?.value === 'glider')
    } else if (activeFilter === 'backpack') {
      r = r.filter(e => e.brItems?.[0]?.type?.value === 'backpack')
    } else if (activeFilter === 'wrap') {
      r = r.filter(e => e.brItems?.[0]?.type?.value === 'wrap')
    } else if (activeFilter === 'shoe') {
      r = r.filter(e => e.brItems?.[0]?.type?.value === 'shoe')
    } else if (activeFilter === 'sidekick') {
      r = r.filter(e => e.brItems?.[0]?.type?.value === 'sidekick')
    } else if (activeFilter === 'emote') {
      r = r.filter(e => ['emote','spray','toy'].includes(e.brItems?.[0]?.type?.value ?? ''))
    } else if (activeFilter === 'track') {
      r = r.filter(e => !!e.tracks?.length)
    } else if (activeFilter === 'instrument') {
      r = r.filter(e => !!e.instruments?.length)
    } else if (activeFilter === 'legokit') {
      r = r.filter(e => !!e.legoKits?.length)
    } else if (activeFilter === 'car') {
      r = r.filter(e => !!e.cars?.length)
    }

    if      (sortBy === 'price-asc')  r.sort((a, b) => a.finalPrice - b.finalPrice)
    else if (sortBy === 'price-desc') r.sort((a, b) => b.finalPrice - a.finalPrice)
    else if (sortBy === 'name')       r.sort((a, b) =>
      (a.brItems?.[0]?.name ?? a.bundle?.name ?? a.tracks?.[0]?.title ?? '').localeCompare(
       b.brItems?.[0]?.name ?? b.bundle?.name ?? b.tracks?.[0]?.title ?? ''))
    else r.sort((a, b) => (a.sortPriority ?? 0) - (b.sortPriority ?? 0))

    return r
  }, [validEntries, activeFilter, sortBy])

  const grouped = useMemo(() => {
    if (activeFilter !== 'all') {
      return [{
        name: activeLabel,
        entries: [...filtered].sort((a, b) => getSortOrder(a) - getSortOrder(b)),
        index: 0
      }]
    }

    const map = new Map<string, { name: string; entries: ShopEntry[]; index: number }>()
    filtered.forEach(entry => {
      const name = entry.layout?.name ?? 'Featured'
      const idx  = entry.layout?.index ?? 999
      if (!map.has(name)) map.set(name, { name, entries: [], index: idx })
      map.get(name)!.entries.push(entry)
    })

    map.forEach(g => g.entries.sort((a, b) => getSortOrder(a) - getSortOrder(b)))

    const sections = Array.from(map.values())
    sections.sort((a, b) => {
      const pa = getSectionPriority(a.entries)
      const pb = getSectionPriority(b.entries)
      if (pa !== pb) return pa - pb
      return a.index - b.index
    })

    return sections
  }, [filtered, activeFilter, activeLabel])

  const scrollTo = (name: string) => {
    sectionRefs.current[name]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(name)
  }

  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => {
        if (e.isIntersecting) setActiveSection(e.target.getAttribute('data-section') ?? '')
      }),
      { threshold: 0.15, rootMargin: '-90px 0px 0px 0px' }
    )
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [grouped])

  const handleSidebarEnter = () => {
    if (sidebarTimer.current) clearTimeout(sidebarTimer.current)
    setSidebarHover(true)
  }
  const handleSidebarLeave = () => {
    sidebarTimer.current = setTimeout(() => setSidebarHover(false), 300)
  }

  return (
    <div className="min-h-screen text-white flex flex-col"
      style={{ background: 'linear-gradient(180deg,#0a0e1a 0%,#0d1117 100%)' }}>

      {/* HEADER */}
      <div className="sticky top-0 z-50 border-b border-white/5 shrink-0"
        style={{ background: 'rgba(10,14,26,0.97)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6">

          <div className="flex items-center justify-between py-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <img src="https://fortnite-api.com/images/vbuck.png" alt="" className="w-7 h-7" />
              <span className="font-black text-lg tracking-widest uppercase">Item Shop</span>
            </div>
            <p className="text-white font-bold text-sm hidden md:block">{today}</p>
            <div className="text-right">
              <p className="text-gray-500 text-xs uppercase tracking-wider">Resets in</p>
              <p className="text-[#00d4ff] font-black text-sm tracking-widest">{countdown}</p>
            </div>
          </div>

          <div className="py-2.5 flex items-center gap-3 flex-wrap">
            <span className="text-gray-500 text-xs">
              <span className="text-white font-bold">{totalItems}</span> items
            </span>

            {/* New badge — clickable shortcut */}
            {newCount > 0 && (
              <button
                onClick={() => setActiveFilter(activeFilter === 'new' ? 'all' : 'new')}
                className={`font-bold text-xs px-2.5 py-1 rounded-full border transition-all ${
                  activeFilter === 'new'
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-green-500/15 text-green-400 border-green-500/30 hover:bg-green-500/25'
                }`}
              >
                ✦ {newCount} New
              </button>
            )}

            {/* Leaving badge — clickable shortcut */}
            {leavingCount > 0 && (
              <button
                onClick={() => setActiveFilter(activeFilter === 'leaving' ? 'all' : 'leaving')}
                className={`font-bold text-xs px-2.5 py-1 rounded-full border transition-all ${
                  activeFilter === 'leaving'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                }`}
              >
                ⏳ {leavingCount} Leaving
              </button>
            )}

            <div className="flex-1" />

            {/* FILTER */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(v => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  filterOpen
                    ? 'bg-white/15 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M10 12h4" />
                </svg>
                FILTERS
                {activeFilter !== 'all' && (
                  <span className="bg-[#00d4ff] text-black text-xs px-1.5 py-0.5 rounded font-black">
                    {activeLabel}
                  </span>
                )}
                <svg
                  className={`w-3 h-3 transition-transform ${filterOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {filterOpen && (
                <div
                  className="absolute top-full mt-2 right-0 z-50 rounded-2xl border border-white/10 shadow-2xl p-4"
                  style={{
                    background: 'rgba(15,18,30,0.98)',
                    backdropFilter: 'blur(20px)',
                    width: '420px',
                    maxWidth: '90vw',
                  }}
                >
                  <button
                    onClick={() => { setActiveFilter('all'); setFilterOpen(false) }}
                    className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-black mb-3 border-2 transition-all ${
                      activeFilter === 'all'
                        ? 'border-[#00d4ff] text-[#00d4ff] bg-[#00d4ff]/10'
                        : 'border-white/10 text-white bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    ⚡ ALL
                  </button>

                  {FILTER_GROUPS.map(group => (
                    <div key={group.label} className="mb-3">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 px-1">
                        {group.label}
                      </p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {group.filters.map(f => (
                          <button
                            key={f.value}
                            onClick={() => { setActiveFilter(f.value); setFilterOpen(false) }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all border ${
                              activeFilter === f.value
                                ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff]'
                                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SORT */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="bg-white/5 border border-white/10 text-white text-sm font-bold rounded-xl px-4 py-2 outline-none cursor-pointer hover:bg-white/10"
              style={{ colorScheme: 'dark' }}
            >
              <option value="default">↕ SORT BY</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="name">A – Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 relative">

        {/* EXPANDABLE DOT SIDEBAR */}
        {activeFilter === 'all' && grouped.length > 0 && (
          <div
            className="hidden lg:flex flex-col fixed left-0 top-1/2 -translate-y-1/2 overflow-hidden transition-all duration-300 ease-in-out rounded-r-2xl"
            style={{
              width: sidebarHover ? '180px' : '20px',
              background: sidebarHover ? 'rgba(10,14,26,0.95)' : 'transparent',
              backdropFilter: sidebarHover ? 'blur(20px)' : 'none',
              borderTop: sidebarHover ? '1px solid rgba(255,255,255,0.08)' : 'none',
              borderRight: sidebarHover ? '1px solid rgba(255,255,255,0.08)' : 'none',
              borderBottom: sidebarHover ? '1px solid rgba(255,255,255,0.08)' : 'none',
              borderLeft: 'none',
              paddingTop: '12px',
              paddingBottom: '12px',
              zIndex: 9999,
            }}
            onMouseEnter={handleSidebarEnter}
            onMouseLeave={handleSidebarLeave}
          >
            {grouped.map((group, i) => {
              const accent   = ACCENTS[i % ACCENTS.length]
              const isActive = activeSection === group.name
              return (
                <button
                  key={group.name}
                  onClick={() => scrollTo(group.name)}
                  className="flex items-center gap-3 px-3 py-1.5 w-full text-left transition-all duration-200 hover:bg-white/5"
                  title={group.name}
                >
                  <div
                    className="shrink-0 rounded-full transition-all duration-300"
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: isActive
                        ? accent.dot
                        : sidebarHover
                          ? accent.dot
                          : 'rgba(255,255,255,0.25)',
                      boxShadow: isActive ? `0 0 8px ${accent.dot}` : 'none',
                    }}
                  />
                  {sidebarHover && (
                    <span className={`text-xs font-bold truncate whitespace-nowrap ${
                      isActive ? accent.text : 'text-gray-400'
                    }`}>
                      {group.name}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* MAIN */}
        <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 lg:px-8 py-8 lg:pl-10">
          {loading && (
            <div className="flex flex-col items-center justify-center h-96 gap-5">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-[#00d4ff]/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#00d4ff] animate-spin" />
              </div>
              <p className="text-white font-bold text-sm uppercase tracking-widest">Loading Item Shop</p>
              <p className="text-gray-500 text-xs">Fetching today's items...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <p className="text-red-400 text-lg font-bold">Failed to load shop</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && grouped.map((group, groupIndex) => {
            const accent = ACCENTS[groupIndex % ACCENTS.length]
            return (
              <div
                key={group.name}
                className="mb-14"
                data-section={group.name}
                ref={el => { sectionRefs.current[group.name] = el }}
              >
                <div className={`flex items-center gap-3 mb-5 pb-3 border-b ${accent.border} border-opacity-20`}>
                  <div
                    className="w-1 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: accent.dot }}
                  />
                  <h2 className={`text-2xl font-black uppercase tracking-wider ${accent.text}`}>
                    {group.name}
                  </h2>
                  <span className="bg-white/5 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full border border-white/10">
                    {group.entries.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                  {group.entries.map((entry, index) => (
                    <ShopItemCard
                      key={`${group.name}-${index}`}
                      entry={entry}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </main>
      </div>

      {!loading && !error && (
        <div className="border-t border-white/5 py-6 text-center shrink-0">
          <p className="text-gray-600 text-xs">
            Data provided by fortnite-api.com • Not affiliated with Epic Games
          </p>
        </div>
      )}
    </div>
  )
}

export default Shop