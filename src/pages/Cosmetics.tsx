import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { getAllBRCosmetics, getNewCosmetics } from '../api/fortniteApi'
import type { BRCosmetic } from '../api/fortniteApi'

const rarityColors: Record<string, string> = {
  common:       'from-gray-500 to-gray-700',
  uncommon:     'from-green-600 to-green-800',
  rare:         'from-blue-500 to-blue-800',
  epic:         'from-purple-500 to-purple-900',
  legendary:    'from-yellow-500 to-orange-700',
  mythic:       'from-yellow-300 to-yellow-600',
  exotic:       'from-teal-400 to-cyan-700',
  transcendent: 'from-red-500 to-pink-900',
}

const rarityBorder: Record<string, string> = {
  common:       'border-gray-500/40',
  uncommon:     'border-green-500/40',
  rare:         'border-blue-500/40',
  epic:         'border-purple-500/40',
  legendary:    'border-yellow-500/40',
  mythic:       'border-yellow-300/40',
  exotic:       'border-cyan-400/40',
  transcendent: 'border-pink-500/40',
}

const TYPE_FILTERS = [
  { label: 'All',             value: 'all'          },
  { label: 'Outfits',         value: 'outfit'        },
  { label: 'Back Blings',     value: 'backpack'      },
  { label: 'Pickaxes',        value: 'pickaxe'       },
  { label: 'Gliders',         value: 'glider'        },
  { label: 'Emotes',          value: 'emote'         },
  { label: 'Wraps',           value: 'wrap'          },
  { label: 'Sprays',          value: 'spray'         },
  { label: 'Music',           value: 'musicpack'     },
  { label: 'Loading Screens', value: 'loadingscreen' },
  { label: 'Contrails',       value: 'contrail'      },
  { label: 'Toys',            value: 'toy'           },
]

const PAGE_SIZE = 60

// ── Modal ──────────────────────────────────────────────────────────────────────
const CosmeticModal = ({ item, onClose }: { item: BRCosmetic; onClose: () => void }) => {
  const rarity   = item.rarity?.value ?? 'common'
  const gradient = rarityColors[rarity] ?? rarityColors.common
  const image    = item.images?.featured ?? item.images?.icon ?? item.images?.smallIcon
  const hasLego  = !!(item.images?.lego?.large || item.images?.lego?.small)
  const hasBean  = !!(item.images?.bean?.large || item.images?.bean?.small)

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d1117] rounded-2xl overflow-hidden max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/80 text-lg font-bold"
        >×</button>

        <div className={`relative bg-linear-to-b ${gradient} aspect-square`}>
          {image && (
            <img
              src={image}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full">
            <span className="text-white text-xs font-bold capitalize">{item.rarity?.displayValue}</span>
          </div>
        </div>

        <div className="p-4">
          <h2 className="text-white font-black text-xl uppercase">{item.name}</h2>
          <p className="text-gray-400 text-sm capitalize mb-1">{item.type?.displayValue}</p>
          {item.description && (
            <p className="text-gray-300 text-sm mt-2 leading-relaxed">{item.description}</p>
          )}

          <div className="mt-3 space-y-1">
            {item.set && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs w-24">Set</span>
                <span className="text-white text-xs font-bold">{item.set.value}</span>
              </div>
            )}
            {item.introduction && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs w-24">Introduced</span>
                <span className="text-white text-xs font-bold">{item.introduction.text}</span>
              </div>
            )}
            {item.series && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs w-24">Series</span>
                <span className="text-white text-xs font-bold">{item.series.value}</span>
              </div>
            )}
            {item.added && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs w-24">Added</span>
                <span className="text-white text-xs font-bold">
                  {new Date(item.added).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </span>
              </div>
            )}
            {item.shopHistory && item.shopHistory.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs w-24">Shop appearances</span>
                <span className="text-white text-xs font-bold">{item.shopHistory.length}×</span>
              </div>
            )}
          </div>

          {(hasLego || hasBean) && (
            <div className="mt-4">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Alternate Versions</p>
              <div className="flex gap-3">
                {hasLego && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-yellow-900/30 border border-yellow-500/30">
                      <img
                        src={item.images.lego!.large ?? item.images.lego!.small}
                        alt="LEGO"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <span className="text-yellow-400 text-xs font-bold">LEGO</span>
                  </div>
                )}
                {hasBean && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-pink-900/30 border border-pink-500/30">
                      <img
                        src={item.images.bean!.large ?? item.images.bean!.small}
                        alt="Bean"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <span className="text-pink-400 text-xs font-bold">FALL GUYS</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Card ───────────────────────────────────────────────────────────────────────
const CosmeticCard = ({ item, onClick }: { item: BRCosmetic; onClick: () => void }) => {
  const rarity   = item.rarity?.value ?? 'common'
  const gradient = rarityColors[rarity] ?? rarityColors.common
  const border   = rarityBorder[rarity] ?? 'border-white/20'
  const image    = item.images?.icon ?? item.images?.smallIcon

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl overflow-hidden border ${border} cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl hover:z-10`}
    >
      <div className={`absolute inset-0 bg-linear-to-b ${gradient} opacity-80`} />
      <div className="relative aspect-square">
        {image
          ? <img src={image} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          : <div className="w-full h-full flex items-center justify-center text-3xl">🎮</div>
        }
      </div>
      <div className="relative bg-black/70 backdrop-blur-sm px-2 py-1.5">
        <p className="text-white font-bold text-xs truncate uppercase leading-tight">{item.name}</p>
        <p className="text-gray-400 text-xs capitalize">{item.type?.displayValue}</p>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
const Cosmetics = () => {
  // Phase 1 — new cosmetics (loads instantly)
  const [newItems,     setNewItems]     = useState<BRCosmetic[]>([])
  const [newLoading,   setNewLoading]   = useState(true)
  const [newError,     setNewError]     = useState<string | null>(null)

  // Phase 2 — full library (loads in background)
  const [allItems,     setAllItems]     = useState<BRCosmetic[]>([])
  const [allLoading,   setAllLoading]   = useState(true)
  const [allError,     setAllError]     = useState<string | null>(null)

  const [activeType,   setActiveType]   = useState('all')
  const [search,       setSearch]       = useState('')
  const [page,         setPage]         = useState(1)
  const [selected,     setSelected]     = useState<BRCosmetic | null>(null)
  const loaderRef = useRef<HTMLDivElement>(null)

  // Phase 1 — fetch new cosmetics immediately
  useEffect(() => {
    getNewCosmetics()
      .then(newData => {
        setNewItems(newData.items?.br ?? [])
        setNewLoading(false)
      })
      .catch(() => {
        setNewError('Failed to load new cosmetics')
        setNewLoading(false)
      })
  }, [])

  // Phase 2 — fetch full library in background after new items load
  useEffect(() => {
    if (newLoading) return // wait for phase 1 first
    getAllBRCosmetics()
      .then(all => {
        const sorted = [...all].sort((a, b) =>
          new Date(b.added).getTime() - new Date(a.added).getTime()
        )
        setAllItems(sorted)
        setAllLoading(false)
      })
      .catch(() => {
        setAllError('Failed to load full library')
        setAllLoading(false)
      })
  }, [newLoading])

  // Reset page when filter/search changes
  useEffect(() => { setPage(1) }, [activeType, search])

  const filtered = useMemo(() => {
    let r = [...allItems]
    if (activeType !== 'all') r = r.filter(i => i.type?.value === activeType)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(i =>
        i.name?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q)
      )
    }
    return r
  }, [allItems, activeType, search])

  const paginated = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page])

  // Infinite scroll
  const onIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && paginated.length < filtered.length) {
      setPage(p => p + 1)
    }
  }, [paginated.length, filtered.length])

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const obs = new IntersectionObserver(onIntersect, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [onIntersect])

  const isFilteringOrSearching = activeType !== 'all' || search.trim() !== ''

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(180deg,#0a0e1a 0%,#0d1117 100%)' }}
    >
      {/* HEADER */}
      <div
        className="sticky top-0 z-50 border-b border-white/5"
        style={{ background: 'rgba(10,14,26,0.97)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div>
              <h1 className="text-xl lg:text-2xl font-black uppercase tracking-widest">
                Cosmetics <span className="text-[#00d4ff]">Browser</span>
              </h1>
              {/* Dynamic subtitle showing loading state */}
              <div className="flex items-center gap-2 mt-0.5">
                {allLoading ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full border border-t-[#00d4ff] border-[#00d4ff]/20 animate-spin" />
                    <p className="text-gray-500 text-xs">
                      {isFilteringOrSearching
                        ? 'Loading full library to filter...'
                        : 'Loading full library in background...'}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">
                    {isFilteringOrSearching
                      ? `${filtered.length.toLocaleString()} results`
                      : `${allItems.length.toLocaleString()} cosmetics`}
                  </p>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
              </svg>
              <input
                type="text"
                placeholder="Search cosmetics..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white/5 border border-white/10 text-white text-sm rounded-xl pl-9 pr-8 py-2 outline-none w-48 lg:w-56 focus:border-[#00d4ff]/50"
                style={{ colorScheme: 'dark' }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >×</button>
              )}
            </div>
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {TYPE_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setActiveType(f.value)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all border ${
                  activeType === f.value
                    ? 'bg-[#00d4ff] text-black border-[#00d4ff] shadow-lg shadow-cyan-500/20'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-8">

        {/* Phase 1 loading — new cosmetics */}
        {newLoading && (
          <div className="flex flex-col items-center justify-center h-96 gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-[#00d4ff]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#00d4ff] animate-spin" />
            </div>
            <p className="text-white font-bold text-sm uppercase tracking-widest">Loading Cosmetics</p>
            <p className="text-gray-500 text-xs">Fetching latest items…</p>
          </div>
        )}

        {newError && (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-400 font-bold">{newError}</p>
          </div>
        )}

        {!newLoading && !newError && (
          <>
            {/* ── NEWLY ADDED — shows immediately ── */}
            {newItems.length > 0 && !isFilteringOrSearching && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-green-500/20">
                  <div className="w-1 h-8 rounded-full bg-green-500 shrink-0" />
                  <h2 className="text-xl lg:text-2xl font-black uppercase tracking-wider text-green-400">
                    Newly Added
                  </h2>
                  <span className="bg-green-500/15 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full border border-green-500/30">
                    {newItems.length} new
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 lg:gap-3">
                  {newItems.map(item => (
                    <CosmeticCard key={item.id} item={item} onClick={() => setSelected(item)} />
                  ))}
                </div>
              </div>
            )}

            {/* ── ALL COSMETICS — loads in background ── */}
            <div>
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#00d4ff]/20">
                <div className="w-1 h-8 rounded-full bg-[#00d4ff] shrink-0" />
                <h2 className="text-xl lg:text-2xl font-black uppercase tracking-wider text-[#00d4ff]">
                  {isFilteringOrSearching
                    ? (activeType !== 'all'
                        ? TYPE_FILTERS.find(f => f.value === activeType)?.label ?? activeType
                        : `Results for "${search}"`)
                    : 'All Cosmetics'}
                </h2>
                {!allLoading && (
                  <span className="bg-white/5 text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full border border-white/10">
                    {filtered.length.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Still loading the full library */}
              {allLoading && (
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-[#00d4ff]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#00d4ff] animate-spin" />
                  </div>
                  <p className="text-gray-500 text-sm">Loading full library…</p>
                  <p className="text-gray-700 text-xs">15,000+ cosmetics incoming</p>
                </div>
              )}

              {/* Full library error */}
              {allError && !allLoading && (
                <div className="flex items-center justify-center h-32">
                  <p className="text-red-400 text-sm">{allError}</p>
                </div>
              )}

              {/* Full library loaded */}
              {!allLoading && !allError && (
                <>
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                      <p className="text-gray-500 text-lg">No cosmetics found</p>
                      <button
                        onClick={() => { setSearch(''); setActiveType('all') }}
                        className="text-[#00d4ff] text-sm hover:underline"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 lg:gap-3">
                        {paginated.map(item => (
                          <CosmeticCard key={item.id} item={item} onClick={() => setSelected(item)} />
                        ))}
                      </div>

                      {/* Infinite scroll trigger */}
                      <div ref={loaderRef} className="h-16 flex items-center justify-center mt-6">
                        {paginated.length < filtered.length && (
                          <div className="w-8 h-8 rounded-full border-2 border-[#00d4ff]/30 border-t-[#00d4ff] animate-spin" />
                        )}
                        {paginated.length >= filtered.length && filtered.length > PAGE_SIZE && (
                          <p className="text-gray-600 text-xs">
                            All {filtered.length.toLocaleString()} cosmetics loaded
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {selected && (
        <CosmeticModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

export default Cosmetics