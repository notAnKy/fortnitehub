import type { ShopItem } from '../../types/fortnite'
import { useEffect } from 'react'

interface Props {
  item: ShopItem
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
}

const ItemDetailModal = ({ item, onClose }: Props) => {
  const rarity = item.rarity?.value ?? 'common'
  const gradient = rarityColors[rarity] ?? rarityColors.common
  const hasLego = !!(item.images?.lego?.large || item.images?.lego?.small)
  const hasBean = !!(item.images?.bean?.large || item.images?.bean?.small)
  const featuredImg = item.images?.featured ?? item.images?.icon ?? item.images?.smallIcon


useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }
  window.addEventListener('keydown', handleKey)
  return () => window.removeEventListener('keydown', handleKey)
}, [onClose])

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d1117] rounded-2xl overflow-hidden max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/80 text-lg font-bold"
        >
          ×
        </button>

        {/* Hero image */}
        <div className={`relative bg-linear-to-b ${gradient} aspect-square`}>
          {featuredImg && (
            <img src={featuredImg} alt={item.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full">
            <span className="text-white text-xs font-bold capitalize">{item.rarity?.displayValue}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h2 className="text-white font-black text-xl uppercase">{item.name}</h2>
          <p className="text-gray-400 text-sm capitalize mb-1">{item.type?.displayValue}</p>

          {item.description && (
            <p className="text-gray-300 text-sm mt-2 leading-relaxed">{item.description}</p>
          )}

          <div className="mt-3 space-y-1">
            {item.set && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs w-20">Set</span>
                <span className="text-white text-xs font-bold">{item.set.value}</span>
              </div>
            )}
            {item.introduction && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs w-20">Introduced</span>
                <span className="text-white text-xs font-bold">{item.introduction.text}</span>
              </div>
            )}
            {item.series && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs w-20">Series</span>
                <span className="text-white text-xs font-bold">{item.series.value}</span>
              </div>
            )}
          </div>

          {/* Alternate versions */}
          {(hasLego || hasBean) && (
            <div className="mt-4">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Alternate Versions</p>
              <div className="flex gap-3">
                {hasLego && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-yellow-900/30 border border-yellow-500/30">
                      <img
                        src={item.images.lego!.large ?? item.images.lego!.small}
                        alt="LEGO version"
                        className="w-full h-full object-cover"
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
                        alt="Bean version"
                        className="w-full h-full object-cover"
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

export default ItemDetailModal