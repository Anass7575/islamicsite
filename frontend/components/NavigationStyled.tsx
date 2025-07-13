'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from '@/lib/motion'
import { FiMenu, FiX, FiMoon, FiSun } from '@/lib/icons'
import { useTheme } from '@/components/providers/ThemeProvider'
import { IslamicPatterns } from '@/components/ui/IslamicPatterns'

const navItems = [
  { href: '/', label: 'Home', arabicLabel: 'الرئيسية' },
  { href: '/quran', label: 'Quran', arabicLabel: 'القرآن' },
  { href: '/hadith', label: 'Hadith', arabicLabel: 'الحديث' },
  { href: '/prayer-times', label: 'Prayer Times', arabicLabel: 'أوقات الصلاة' },
  { href: '/learning', label: 'Learning', arabicLabel: 'التعلم' },
]

export function NavigationStyled() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav className={`
        fixed top-0 w-full z-50 transition-all duration-500
        ${scrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg' 
          : 'bg-transparent'
        }
      `}>
        <div className="container-wide">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="group flex items-center space-x-3">
              <motion.div 
                className="relative w-12 h-12 bg-gradient-to-br from-emerald-deep to-emerald-dark rounded-organic flex items-center justify-center overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-white font-arabic text-2xl z-10">ه</span>
                <div className="absolute inset-0 opacity-20">
                  <IslamicPatterns.StarPattern />
                </div>
              </motion.div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-gradient group-hover:text-gradient-gold transition-all duration-300">
                  Al-Hidaya
                </span>
                <span className="text-xs text-[var(--text-muted)] arabic">الهداية</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative group px-4 py-2"
                  >
                    <span className={`
                      text-sm font-medium transition-all duration-300
                      ${isActive
                        ? 'text-emerald-deep dark:text-emerald-light'
                        : 'text-[var(--text-secondary)] hover:text-emerald-deep dark:hover:text-emerald-light'
                      }
                    `}>
                      {item.label}
                    </span>
                    <span className={`
                      block text-xs arabic text-center mt-1 transition-all duration-300
                      ${isActive
                        ? 'text-gold-soft'
                        : 'text-[var(--text-muted)] group-hover:text-gold-soft'
                      }
                    `}>
                      {item.arabicLabel}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-emerald-deep to-emerald-light rounded-full"
                        layoutId="nav-active"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {/* Hover effect */}
                    <motion.div
                      className="absolute inset-0 bg-emerald-deep/5 rounded-lg -z-10"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={toggleTheme}
                className="p-3 rounded-xl hover:bg-emerald-deep/10 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiSun className="w-5 h-5 text-gold-soft" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiMoon className="w-5 h-5 text-emerald-deep" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <button className="hidden lg:block btn btn-primary">
                Sign In
              </button>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-3 rounded-xl hover:bg-emerald-deep/10 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiX className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiMenu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden"
            >
              <div className="relative h-full overflow-y-auto">
                {/* Mobile nav header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gradient">Menu</h2>
                    <motion.button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-lg hover:bg-emerald-deep/10"
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiX className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Mobile nav items */}
                <div className="p-6 space-y-2">
                  {navItems.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`
                            block px-4 py-3 rounded-xl transition-all duration-300
                            ${isActive
                              ? 'bg-emerald-deep/10 text-emerald-deep'
                              : 'hover:bg-emerald-deep/5'
                            }
                          `}
                        >
                          <span className="font-medium">{item.label}</span>
                          <span className="block text-sm arabic text-gold-soft mt-1">
                            {item.arabicLabel}
                          </span>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Mobile nav footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[var(--border-subtle)]">
                  <button className="btn btn-primary w-full">
                    Sign In
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}