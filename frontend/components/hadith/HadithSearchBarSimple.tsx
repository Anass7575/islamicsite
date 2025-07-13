import { motion } from '@/lib/motion'
import { FiSearch } from '@/lib/icons'

interface HadithSearchBarProps {
  onSearch: (value: string) => void
  placeholder?: string
}

export function HadithSearchBar({
  onSearch,
  placeholder = "Search hadiths..."
}: HadithSearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-4">
        <FiSearch className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => onSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
        />
      </div>
    </motion.div>
  )
}