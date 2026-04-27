import { useState } from 'react'
import type { ShopEntry, ShopItem } from '../../types/fortnite'
import ItemDetailModal from './ItemDetailModal'
import BundleModal from './BundleModal'

interface Props {
  entry: ShopEntry
  entryIndex: number
}

const rarityColors: Record<string, string> = {
  common: 'from-gray-500 to-gray-700',
  uncommon: 'from-green-600 to-green-800',
  rare: 'from-blue-500 to-blue-800',
  epic: 'from-purple-500 to-purple-900',
  legendary: 'from-yellow-500 to-orange-700',
  mythic: 'from-yellow-300 to-yellow-600',
  exotic: 'from-teal-400 to-cyan-700',
  transcendent: 'from-red-500 to-pink-900',
}

const rarityBorder: Record<string, string> = {
  common: 'border-gray-500',
  uncommon: 'border-green-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500',
  mythic: 'border-yellow-300',
  exotic: 'border-cyan-400',
  transcendent: 'border-pink-500',
}

const VBuckIcon = () => (
  <img src="https://fortnite-api.com/images/vbuck.png" alt="vbucks" className="w-3.5 h-3.5 inline-block" />
)

const ShopItemCard = ({ entry, entryIndex }: Props) => {
  const [showBundle, setShowBundle] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)

  const isBundle = !!(entry.bundle && entry.bundle.name)
  const allBrItems = entry.brItems ?? []
  const mainItem = allBrItems[0] ?? null
  const mainCar = entry.cars?.[0] ?? null
  const mainTrack = entry.tracks?.[0] ?? null
  const mainInstrument = entry.instruments?.[0] ?? null
  const mainLegoKit = entry.legoKits?.[0] ?? null

  const hasContent = mainItem || mainCar || mainTrack || mainInstrument || mainLegoKit || isBundle
  if (!hasContent) return null

  const rarity = mainItem?.rarity?.value ?? mainCar?.rarity?.value ?? mainInstrument?.rarity?.value ?? 'common'
  const gradient = rarityColors[rarity] ?? rarityColors.common
  const border = rarityBorder[rarity] ?? 'border-white/20'

  // Get display name
  const displayName = isBundle
    ? (entry.bundle?.name ?? 'Bundle')
    : mainItem?.name
    ?? mainCar?.name
    ?? mainTrack?.title
    ?? mainInstrument?.name
    ?? mainLegoKit?.name
    ?? 'Unknown'

  // Get subtitle
  const subtitle = isBundle
    ? `${allBrItems.length} items`
    : mainItem?.type?.displayValue
    ?? mainCar?.type?.displayValue
    ?? (mainTrack ? mainTrack.artist : null)
    ?? mainInstrument?.type?.displayValue
    ?? mainLegoKit?.type?.displayValue
    ?? ''

  // Get image
  const getImage = () => {
    if (isBundle && entry.bundle?.image) return entry.bundle.image
    if (mainItem) return mainItem.images?.featured ?? mainItem.images?.icon ?? mainItem.images?.smallIcon ?? null
    if (mainCar) return mainCar.images?.large ?? mainCar.images?.small ?? null
    if (mainTrack) return mainTrack.albumArt ?? null
    if (mainInstrument) return mainInstrument.images?.large ?? mainInstrument.images?.small ?? null
    if (mainLegoKit) return mainLegoKit.images?.large ?? mainLegoKit.images?.small ?? null
    return null
  }

  const image = getImage()

  // Special card style for tracks
  const isTrack = !!mainTrack && !mainItem
  const isInstrument = !!mainInstrument && !mainItem
  const isLegoKit = !!mainLegoKit && !mainItem
  const isCar = !!mainCar && !mainItem

  const getSpecialGradient = () => {
    if (isTrack) return 'from-pink-900 to-purple-900'
    if (isInstrument) return 'from-orange-900 to-red-900'
    if (isLegoKit) return 'from-yellow-900 to-orange-900'
    if (isCar) return 'from-blue-900 to-cyan-900'
    return gradient
  }

  const getSpecialBorder = () => {
    if (isTrack) return 'border-pink-500'
    if (isInstrument) return 'border-orange-500'
    if (isLegoKit) return 'border-yellow-500'
    if (isCar) return 'border-cyan-500'
    return border
  }

  const getTypeBadge = () => {
    if (isTrack) return { label: '🎵 JAM TRACK', color: 'bg-pink-500' }
    if (isInstrument) return { label: '🎸 INSTRUMENT', color: 'bg-orange-500' }
    if (isLegoKit) return { label: '🧱 LEGO KIT', color: 'bg-yellow-500 text-black' }
    if (isCar) return { label: '🚗 CAR', color: 'bg-cyan-500 text-black' }
    return null
  }

  const typeBadge = getTypeBadge()
  const cardGradient = getSpecialGradient()
  const cardBorder = getSpecialBorder()

  return (
    <>
      <div
        className={`group relative rounded-xl overflow-hidden border ${cardBorder} cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
        onClick={() => {
          if (isBundle) setShowBundle(true)
          else if (mainItem) setSelectedItem(mainItem)
        }}
      >
        <div className={`absolute inset-0 bg-linear-to-b ${cardGradient} opacity-80`} />

        {/* Image / Album art */}
        <div className="relative aspect-square">
          {image
            ? <img src={image} alt={displayName} className="w-full h-full object-cover" />
            : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl">
                  {isTrack ? '🎵' : isInstrument ? '🎸' : isLegoKit ? '🧱' : '🎮'}
                </span>
              </div>
            )
          }

          {/* Track duration overlay */}
          {isTrack && mainTrack?.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              {Math.floor(mainTrack.duration / 60)}:{String(mainTrack.duration % 60).padStart(2, '0')}
            </div>
          )}
        </div>

        {/* Banner */}
        {entry.banner?.value && (
          <div className={`absolute top-2 left-2 text-xs font-black px-2 py-0.5 rounded ${
            entry.banner.value.toLowerCase().includes('leav')
              ? 'bg-red-500 text-white'
              : 'bg-yellow-400 text-black'
          }`}>
            {entry.banner.value}
          </div>
        )}

        {/* Type badge top right */}
        {typeBadge && (
          <div className={`absolute top-2 right-2 ${typeBadge.color} text-white text-xs font-bold px-1.5 py-0.5 rounded`}>
            {typeBadge.label}
          </div>
        )}

        {/* Bundle badge */}
        {isBundle && (
          <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            BUNDLE
          </div>
        )}

        {/* Bottom info */}
        <div className="relative bg-black/70 backdrop-blur-sm px-2 py-2">
          <p className="text-white font-black text-xs uppercase leading-tight truncate">{displayName}</p>
          <p className="text-gray-400 text-xs truncate capitalize">{subtitle}</p>
          {isBundle && (
            <p className="text-gray-500 text-xs">tap to expand</p>
          )}
          <div className="flex items-center gap-1 mt-1">
            <VBuckIcon />
            <span className="text-yellow-400 font-bold text-xs">{entry.finalPrice.toLocaleString()}</span>
            {entry.regularPrice !== entry.finalPrice && (
              <span className="text-gray-500 line-through text-xs ml-1">
                {entry.regularPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {showBundle && (
        <BundleModal entry={entry} onClose={() => setShowBundle(false)} />
      )}
      {selectedItem && (
        <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  )
}

export default ShopItemCard