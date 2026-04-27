export interface ShopEntry {
  regularPrice: number
  finalPrice: number
  outDate?: string
  inDate?: string
  sortPriority?: number
  bundle: { name: string; info: string; image: string } | null
  banner: { value: string; intensity: string; backendValue: string } | null
  brItems?: ShopItem[]
  cars?: CarItem[]
  tracks?: TrackItem[]
  instruments?: InstrumentItem[]
  legoKits?: LegoKitItem[]
  layout?: {
    id: string
    name: string
    category: string
    index: number
    rank: number
    background?: string
  }
}

export interface ShopItem {
  id: string
  name: string
  description: string
  type: { value: string; displayValue: string }
  rarity: { value: string; displayValue: string }
  images: {
    smallIcon: string
    icon: string
    featured: string | null
    lego?: { small: string; large: string; wide?: string }
    bean?: { small: string; large: string }
  }
  series?: { value: string; image: string; colors: string[] }
  set?: { value: string; text: string }
  introduction?: { chapter: string; season: string; text: string }
}

export interface CarItem {
  id: string
  name: string
  description: string
  type: { value: string; displayValue: string }
  rarity: { value: string; displayValue: string }
  images: { small: string; large: string }
}

export interface TrackItem {
  id: string
  title: string
  artist: string
  album?: string
  releaseYear?: number
  bpm?: number
  duration?: number
  albumArt?: string
  genres?: string[]
}

export interface InstrumentItem {
  id: string
  name: string
  description: string
  type: { value: string; displayValue: string }
  rarity: { value: string; displayValue: string }
  images: { small: string; large: string }
}

export interface LegoKitItem {
  id: string
  name: string
  type: { value: string; displayValue: string }
  series?: { value: string; image: string; colors: string[] }
  images: { small: string; large: string; wide?: string }
}