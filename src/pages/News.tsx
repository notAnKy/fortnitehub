import { useEffect, useState } from 'react'
import { getNews } from '../api/fortniteApi'
import type { NewsData, NewsMotd, NewsMessage } from '../api/fortniteApi'

type Tab = 'br' | 'stw' | 'creative'

const TABS = [
  { value: 'br'       as Tab, label: 'Battle Royale', icon: '⚔️', accent: '#3b82f6' },
  { value: 'stw'      as Tab, label: 'Save the World', icon: '🌍', accent: '#f97316' },
  { value: 'creative' as Tab, label: 'Creative',       icon: '🎨', accent: '#a855f7' },
]

// ── MOTD Card ──────────────────────────────────────────────────────────────────
interface MotdCardProps {
  motd: NewsMotd
  accent: string
  onClick: () => void
}

const MotdCard = ({ motd, accent, onClick }: MotdCardProps) => {
  const image = motd.image || motd.tileImage

  const openLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (motd.websiteUrl) window.open(motd.websiteUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden border border-white/10 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-white/20"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      <div className="relative aspect-video overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={motd.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            📰
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />

        {motd.videoId && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
            ▶ VIDEO
          </div>
        )}

        {motd.tabTitle && (
          <div
            className="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/20"
            style={{ background: `${accent}30` }}
          >
            {motd.tabTitle}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-white font-black text-base uppercase tracking-wide leading-tight mb-1">
          {motd.title}
        </h3>
        {motd.body && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{motd.body}</p>
        )}
        {motd.websiteUrl && (
          <button
            onClick={openLink}
            className="inline-flex items-center gap-1 mt-3 text-xs font-bold hover:opacity-70 transition-opacity"
            style={{ color: accent }}
          >
            Read more ↗
          </button>
        )}
      </div>
    </div>
  )
}

// ── Message Card ───────────────────────────────────────────────────────────────
interface MessageCardProps {
  msg: NewsMessage
  accent: string
}

const MessageCard = ({ msg, accent }: MessageCardProps) => (
  <div
    className="flex gap-4 p-4 rounded-2xl border border-white/5 transition-all hover:border-white/10"
    style={{ background: 'rgba(255,255,255,0.02)' }}
  >
    {msg.image && (
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
        <img src={msg.image} alt={msg.title} className="w-full h-full object-cover" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-1">{msg.title}</h4>
      {msg.body && (
        <p className="text-gray-500 text-xs leading-relaxed">{msg.body}</p>
      )}
      {msg.adspace && (
        <span
          className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full border"
          style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}
        >
          {msg.adspace}
        </span>
      )}
    </div>
  </div>
)

// ── Modal ──────────────────────────────────────────────────────────────────────
interface MotdModalProps {
  motd: NewsMotd
  accent: string
  onClose: () => void
}

const MotdModal = ({ motd, accent, onClose }: MotdModalProps) => {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const image = motd.image || motd.tileImage

  const openWebsite = () => {
    if (motd.websiteUrl) window.open(motd.websiteUrl, '_blank', 'noopener,noreferrer')
  }

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

        {image && (
          <div className="relative aspect-video">
            <img src={image} alt={motd.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-[#0d1117] via-transparent to-transparent" />
          </div>
        )}

        <div className="p-6">
          {motd.tabTitle && (
            <span
              className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 border"
              style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}
            >
              {motd.tabTitle}
            </span>
          )}

          <h2 className="text-white font-black text-2xl uppercase tracking-wide mb-3">
            {motd.title}
          </h2>

          {motd.body && (
            <p className="text-gray-300 text-sm leading-relaxed mb-4">{motd.body}</p>
          )}

          {motd.videoId && (
            <div className="rounded-xl overflow-hidden mb-4 border border-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${motd.videoId}`}
                title={motd.title}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                allowFullScreen
              />
            </div>
          )}

          {motd.videoString && !motd.videoId && (
            <div
              className="mb-4 p-3 rounded-xl border border-white/5"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <p className="text-gray-500 text-xs">Video: {motd.videoString}</p>
            </div>
          )}

          {motd.websiteUrl && (
            <button
              onClick={openWebsite}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:opacity-80"
              style={{
                color: accent,
                borderColor: `${accent}40`,
                background: `${accent}10`,
              }}
            >
              Visit Website ↗
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
const News = () => {
  const [newsData,  setNewsData]  = useState<NewsData | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('br')
  const [selected,  setSelected]  = useState<NewsMotd | null>(null)

  useEffect(() => {
    getNews()
      .then(d => { setNewsData(d); setLoading(false) })
      .catch(() => { setError('Failed to load news'); setLoading(false) })
  }, [])

  const currentTab  = TABS.find(t => t.value === activeTab)!
  const currentData = newsData?.[activeTab]

  const visibleMotds = (currentData?.motds ?? [])
    .filter(m => !m.hidden)
    .sort((a, b) => b.sortingPriority - a.sortingPriority)

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(180deg,#0a0e1a 0%,#0d1117 100%)' }}
    >
      {/* Sticky header */}
      <div
        className="sticky top-0 z-50 border-b border-white/5"
        style={{ background: 'rgba(10,14,26,0.97)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="mb-4">
            <h1 className="text-2xl font-black uppercase tracking-widest">
              Fortnite <span className="text-[#00d4ff]">News</span>
            </h1>
            {currentData?.date && (
              <p className="text-gray-500 text-xs mt-0.5">
                Updated{' '}
                {new Date(currentData.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200"
                style={
                  activeTab === tab.value
                    ? {
                        background: `${tab.accent}20`,
                        borderColor: `${tab.accent}40`,
                        color: tab.accent,
                      }
                    : {
                        background: 'rgba(255,255,255,0.05)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#9ca3af',
                      }
                }
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-8">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-96 gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-[#00d4ff]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#00d4ff] animate-spin" />
            </div>
            <p className="text-white font-bold text-sm uppercase tracking-widest">Loading News</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-400 font-bold">{error}</p>
          </div>
        )}

        {!loading && !error && currentData && (
          <>
            {/* Banner */}
            {currentData.image && (
              <div
                className="rounded-2xl overflow-hidden border border-white/10 mb-8 relative"
                style={{ aspectRatio: '21/6' }}
              >
                <img
                  src={currentData.image}
                  alt={currentTab.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-gray-300 text-xs uppercase tracking-widest mb-1">
                    {currentTab.icon} {currentTab.label}
                  </p>
                  <h2
                    className="text-4xl font-black uppercase tracking-widest"
                    style={{ color: currentTab.accent }}
                  >
                    News
                  </h2>
                </div>
              </div>
            )}

            {/* MOTDs */}
            {visibleMotds.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
                  <div
                    className="w-1 h-7 rounded-full shrink-0"
                    style={{ backgroundColor: currentTab.accent }}
                  />
                  <h2
                    className="text-xl font-black uppercase tracking-wider"
                    style={{ color: currentTab.accent }}
                  >
                    Latest Updates
                  </h2>
                  <span className="text-gray-600 text-sm">({visibleMotds.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visibleMotds.map(motd => (
                    <MotdCard
                      key={motd.id}
                      motd={motd}
                      accent={currentTab.accent}
                      onClick={() => setSelected(motd)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {currentData.messages && currentData.messages.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
                  <div
                    className="w-1 h-7 rounded-full shrink-0"
                    style={{ backgroundColor: currentTab.accent }}
                  />
                  <h2
                    className="text-xl font-black uppercase tracking-wider"
                    style={{ color: currentTab.accent }}
                  >
                    Announcements
                  </h2>
                  <span className="text-gray-600 text-sm">({currentData.messages.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentData.messages.map((msg, i) => (
                    <MessageCard key={i} msg={msg} accent={currentTab.accent} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {visibleMotds.length === 0 &&
              (!currentData.messages || currentData.messages.length === 0) && (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <div className="text-5xl">📭</div>
                <p className="text-gray-500">No news available for {currentTab.label}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <MotdModal
          motd={selected}
          accent={currentTab.accent}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

export default News