import { useState, useEffect } from 'react'
import type { ShopEntry, ShopItem } from '../../types/fortnite'
import ItemDetailModal from './ItemDetailModal'

interface Props {
  entry: ShopEntry
  onClose: () => void
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
  common: 'border-gray-500/50',
  uncommon: 'border-green-500/50',
  rare: 'border-blue-500/50',
  epic: 'border-purple-500/50',
  legendary: 'border-yellow-500/50',
  mythic: 'border-yellow-300/50',
  exotic: 'border-cyan-400/50',
  transcendent: 'border-pink-500/50',
}

const BundleModal = ({ entry, onClose }: Props) => {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)

  // ALL hooks must be before any early return
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedItem) setSelectedItem(null)
        else onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, selectedItem])

  const allBrItems = entry.brItems ?? []
  const bundleName = entry.bundle?.name ?? 'Bundle'
  const bundleInfo = entry.bundle?.info ?? ''
  const bundleImage = entry.bundle?.image ?? null

  // Early return is safe now — all hooks are above
  if (selectedItem) {
    return <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d1117] rounded-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-linear-to-r from-purple-900 to-blue-900 p-5 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/60 text-lg font-bold"
          >
            ×
          </button>

          <div className="flex gap-4 items-center">
            {bundleImage && (
              <img src={bundleImage} alt={bundleName} loading="lazy" decoding="async" className="w-20 h-20 object-cover rounded-xl border border-white/20" />
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-purple-500 text-white text-xs font-black px-2 py-0.5 rounded uppercase">Bundle</span>
                {entry.banner?.value && (
                  <span className="bg-yellow-400 text-black text-xs font-black px-2 py-0.5 rounded uppercase">{entry.banner.value}</span>
                )}
              </div>
              <h2 className="text-white font-black text-2xl uppercase">{bundleName}</h2>
              {bundleInfo && <p className="text-gray-300 text-sm mt-1">{bundleInfo}</p>}
              <div className="flex items-center gap-2 mt-2">
                <img src="https://fortnite-api.com/images/vbuck.png" alt="vbucks" loading="lazy" decoding="async" className="w-5 h-5" />
                <span className="text-yellow-400 font-black text-xl">{entry.finalPrice.toLocaleString()}</span>
                {entry.regularPrice !== entry.finalPrice && (
                  <span className="text-gray-400 line-through text-sm">{entry.regularPrice.toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Items grid */}
        <div className="overflow-y-auto p-4 flex-1">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">
            {allBrItems.length} items included — click any item to inspect
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {allBrItems.map((item, i) => {
              const itemRarity = item?.rarity?.value ?? 'common'
              const itemGradient = rarityColors[itemRarity] ?? rarityColors.common
              const itemBorder = rarityBorder[itemRarity] ?? 'border-white/20'
              const itemImg = item?.images?.featured ?? item?.images?.icon ?? item?.images?.smallIcon

              return (
                <div
                  key={item?.id ?? `bundle-item-${i}`}
                  className={`relative rounded-xl overflow-hidden border ${itemBorder} cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg`}
                  onClick={() => item && setSelectedItem(item)}
                >
                  <div className={`absolute inset-0 bg-linear-to-b ${itemGradient} opacity-75`} />
                  <div className="relative aspect-square">
                    {itemImg && (
                      <img src={itemImg} alt={item?.name ?? ''} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    )}
                  </div>
                  <div className="relative bg-black/70 px-2 py-1.5">
                    <p className="text-white text-xs font-bold truncate">{item?.name ?? ''}</p>
                    <p className="text-gray-400 text-xs capitalize">{item?.type?.displayValue ?? ''}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BundleModal