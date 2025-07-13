'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from '@/lib/motion'
import { FiMenu, FiX, FiMoon, FiSun, FiGlobe, FiUser } from '@/lib/icons'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface NavItem {
  href: string
  label: string
  icon?: React.ReactNode
}

const navItems: NavItem[] = [
  { href: '/', label: 'home' },
  { href: '/quran', label: 'quran' },
  { href: '/hadith', label: 'hadith' },
  { href: '/prayer-times', label: 'prayers' },
  { href: '/qibla', label: 'qibla' },
  { href: '/calendar', label: 'calendar' },
  { href: '/zakat', label: 'zakat' },
]

export function ModernNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const pathname = usePathname()
  const { t, i18n } = useTranslation('navigation')

  // Scroll handler with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setScrolled(window.scrollY > 10)
      }, 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [])

  // Theme persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }, [theme])

  const toggleLanguage = useCallback(() => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(newLang)
  }, [i18n])

  return (
    <>
      {/* Main Navigation */}
      <nav className={`nav transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-3 group"
              aria-label="Al-Hidaya Home"
            >
              <div className="relative w-10 h-10">
                {/* Minimalist Islamic Star */}
                <svg 
                  viewBox="0 0 40 40" 
                  className="w-full h-full transition-transform duration-300 group-hover:rotate-12"
                >
                  <polygon
                    points="20,2 24,14 36,14 26,22 30,34 20,26 10,34 14,22 4,14 16,14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-accent-green"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gradient">
                Al-Hidaya
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item relative ${
                    pathname === item.href ? 'nav-item-active' : ''
                  }`}
                >
                  {t(item.label)}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-0.5 left-4 right-4 h-0.5 bg-accent-green rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="p-2.5 rounded-lg hover:bg-primary-100 hover:bg-opacity-10 transition-colors"
                aria-label="Toggle Language"
              >
                <span className="text-sm font-medium">
                  {i18n.language.toUpperCase()}
                </span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg hover:bg-primary-100 hover:bg-opacity-10 transition-colors"
                aria-label="Toggle Theme"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === 'dark' ? 
                      <FiSun className="w-5 h-5" /> : 
                      <FiMoon className="w-5 h-5" />
                    }
                  </motion.div>
                </AnimatePresence>
              </button>

              {/* User Menu */}
              <button
                className="p-2.5 rounded-lg hover:bg-primary-100 hover:bg-opacity-10 transition-colors hidden sm:block"
                aria-label="User Menu"
              >
                <FiUser className="w-5 h-5" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 rounded-lg hover:bg-primary-100 hover:bg-opacity-10 transition-colors"
                aria-label="Toggle Menu"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isOpen ? 'close' : 'open'}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isOpen ? 
                      <FiX className="w-6 h-6" /> : 
                      <FiMenu className="w-6 h-6" />
                    }
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-bg-primary z-50 lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-primary-100 border-opacity-20">
                  <span className="text-lg font-semibold">Menu</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-primary-100 hover:bg-opacity-10"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Mobile Menu Items */}
                <nav className="flex-1 overflow-y-auto py-4">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`block px-6 py-3 text-lg ${
                          pathname === item.href
                            ? 'text-accent-green font-medium bg-accent-green bg-opacity-10'
                            : 'text-primary-700 hover:bg-primary-100 hover:bg-opacity-10'
                        } transition-colors`}
                      >
                        {t(item.label)}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Mobile Menu Footer */}
                <div className="p-4 border-t border-primary-100 border-opacity-20">
                  <button className="btn btn-primary w-full mb-3">
                    {t('signIn')}
                  </button>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={toggleLanguage}
                      className="flex items-center space-x-2 text-sm text-primary-700"
                    >
                      <FiGlobe className="w-4 h-4" />
                      <span>{i18n.language.toUpperCase()}</span>
                    </button>
                    <button
                      onClick={toggleTheme}
                      className="flex items-center space-x-2 text-sm text-primary-700"
                    >
                      {theme === 'dark' ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
                      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}