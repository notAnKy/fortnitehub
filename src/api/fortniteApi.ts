const BASE_URL = 'https://fortnite-api.com'
const API_KEY  = import.meta.env.VITE_FORTNITE_API_KEY
const headers  = { 'Authorization': API_KEY }

export const getItemShop = async () => {
  const res  = await fetch(`${BASE_URL}/v2/shop`, { headers })
  const data = await res.json()
  return data.data
}

export const getMap = async () => {
  const res  = await fetch(`${BASE_URL}/v1/map`, { headers })
  const data = await res.json()
  return data.data
}

export const getNewCosmetics = async () => {
  const res  = await fetch(`${BASE_URL}/v2/cosmetics/new`, { headers })
  const data = await res.json()
  return data.data
}

export const getAllBRCosmetics = async () => {
  const res  = await fetch(`${BASE_URL}/v2/cosmetics/br`, { headers })
  const data = await res.json()
  return data.data as BRCosmetic[]
}

export const getPlayerStats = async (
  name: string,
  timeWindow: 'season' | 'lifetime' = 'lifetime'
): Promise<{ data: PlayerStats; platform: string }> => {
  const platforms = ['epic', 'psn', 'xbl'] as const
  const results = await Promise.allSettled(
    platforms.map(async accountType => {
      const params = new URLSearchParams({ name, accountType, timeWindow })
      const res    = await fetch(`${BASE_URL}/v2/stats/br/v2?${params}`, { headers })
      const json   = await res.json()
      if (json.status !== 200) throw new Error('not found')
      return { data: json.data as PlayerStats, platform: accountType }
    })
  )
  const found = results.find(r => r.status === 'fulfilled') as
    PromiseFulfilledResult<{ data: PlayerStats; platform: string }> | undefined
  if (!found) throw new Error('Player not found on any platform')
  return found.value
}

export const getNews = async () => {
  const res  = await fetch(`${BASE_URL}/v2/news`, { headers })
  const data = await res.json()
  return data.data as NewsData
}

export const getPlaylists = async () => {
  const res  = await fetch(`${BASE_URL}/v1/playlists`, { headers })
  const data = await res.json()
  return data.data as Playlist[]
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Playlist {
  id: string
  name: string
  subName?: string
  description?: string
  gameType?: string
  ratingType?: string
  minPlayers: number
  maxPlayers: number
  maxTeams: number
  maxTeamSize: number
  maxSquads: number
  maxSquadSize: number
  isDefault: boolean
  isTournament: boolean
  isLimitedTimeMode: boolean
  isLargeTeamGame: boolean
  accumulateToProfileStats: boolean
  images: {
    showcase?: string
    missionIcon?: string
  }
  gameplayTags: string[]
  path: string
  added: string
}

export interface BRCosmetic {
  id: string
  name: string
  description: string
  type: { value: string; displayValue: string }
  rarity: { value: string; displayValue: string }
  series?: { value: string; image: string; colors: string[] }
  set?: { value: string; text: string }
  introduction?: { chapter: string; season: string; text: string }
  images: {
    smallIcon: string
    icon: string
    featured: string | null
    lego?: { small: string; large: string }
    bean?: { small: string; large: string }
  }
  added: string
  shopHistory?: string[]
}

export interface ModeStats {
  score?: number
  scorePerMatch?: number
  wins?: number
  kills?: number
  deaths?: number
  kd?: number
  matches?: number
  winRate?: number
  killsPerMatch?: number
  killsPerMin?: number
  minutesPlayed?: number
  playersOutlived?: number
  top3?: number
  top5?: number
  top6?: number
  top10?: number
  top12?: number
  top25?: number
}

export interface InputStats {
  overall?: ModeStats
  solo?: ModeStats
  duo?: ModeStats
  squad?: ModeStats
  ltm?: ModeStats
}

export interface PlayerStats {
  account: { id: string; name: string }
  battlePass: { level: number; progress: number }
  image?: string
  stats: {
    all?: InputStats
    keyboardMouse?: InputStats
    gamepad?: InputStats
    touch?: InputStats
  }
}

export interface NewsMotd {
  id: string
  title: string
  tabTitle: string
  body: string
  image: string
  tileImage: string
  sortingPriority: number
  hidden: boolean
  websiteUrl?: string
  videoString?: string
  videoId?: string
}

export interface NewsMessage {
  title: string
  body: string
  image: string
  adspace?: string
}

export interface NewsSection {
  hash: string
  date: string
  image: string
  motds: NewsMotd[]
  messages: NewsMessage[]
}

export interface NewsData {
  br: NewsSection
  stw: NewsSection
  creative: NewsSection
}