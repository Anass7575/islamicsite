import { motion } from '@/lib/motion'
import { FiSearch, FiFilter } from '@/lib/icons'

interface HadithSearchBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  showFilters: boolean
  onToggleFilters: () => void
}

export function HadithSearchBar({
  searchQuery,
  onSearchChange,
  showFilters,
  onToggleFilters
}: HadithSearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-4 mb-6"
    >
      <div className="flex items-center gap-4">
        <FiSearch className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search hadiths in this collection..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
        />
        <button
          onClick={onToggleFilters}
          className="p-2 rounded-full hover:bg-glass-light transition-colors"
        >
          <FiFilter className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}