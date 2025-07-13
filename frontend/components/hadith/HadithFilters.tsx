import { motion } from '@/lib/motion'

interface HadithFiltersProps {
  selectedGrade: string | null
  onGradeChange: (grade: string | null) => void
}

export function HadithFilters({
  selectedGrade,
  onGradeChange
}: HadithFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 mb-6"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Filter by Grade</label>
          <select
            value={selectedGrade || ''}
            onChange={(e) => onGradeChange(e.target.value || null)}
            className="w-full px-4 py-2 rounded-lg bg-glass-light border border-glass-border"
          >
            <option value="">All Grades</option>
            <option value="sahih">Sahih (Authentic)</option>
            <option value="hasan">Hasan (Good)</option>
            <option value="da'if">Da'if (Weak)</option>
          </select>
        </div>
      </div>
    </motion.div>
  )
}