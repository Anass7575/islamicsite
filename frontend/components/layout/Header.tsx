'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from '@/lib/motion'
import { FiUser, FiLogOut, FiMenu, FiX, FiBookmark } from '@/lib/icons'
import { useAuth } from '@/contexts/AuthContext'
import { LoginModal } from '@/components/auth/LazyLoginModal'
import { RegisterModal } from '@/components/auth/LazyRegisterModal'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { useTranslation } from 'react-i18next'

export function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const { t } = useTranslation('common')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { href: '/quran', label: mounted ? t('navigation.quran') : 'Quran' },
    { href: '/hadith', label: mounted ? t('navigation.hadith') : 'Hadith' },
    { href: '/prayer-times', label: mounted ? t('navigation.prayerTimes') : 'Prayer Times' },
    { href: '/qibla', label: mounted ? t('navigation.qibla') : 'Qibla' },
    { href: '/calendar', label: mounted ? t('navigation.calendar') : 'Calendar' },
    { href: '/zakat', label: mounted ? t('navigation.zakat') : 'Zakat' },
    { href: '/learn', label: mounted ? t('navigation.learn') : 'Learn' },
    { href: '/chat', label: mounted ? t('navigation.chat') : 'AI Chat' },
  ]

  const handleSwitchToRegister = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  return (
    <>
      <header className="manuscript-nav">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo with Calligraphic Style */}
            <Link href="/" className="text-3xl font-bold">
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-gold text-4xl">◆</span>
                <span className="font-calligraphy text-ink-900 text-3xl tracking-wide">
                  Al-Hidaya
                </span>
                <span className="text-gold text-4xl">◆</span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <motion.div 
                  key={link.href} 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={link.href}
                    className="relative text-ink-700 hover:text-ink-900 font-manuscript text-lg tracking-wide transition-all duration-300 ink-stroke"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <LanguageSelector />
              
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <Link href="/bookmarks">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full bg-ink-900 text-cream shadow-md hover:shadow-lg transition-all border border-gold"
                      title="My Bookmarks"
                    >
                      <FiBookmark className="w-5 h-5" />
                    </motion.button>
                  </Link>
                  <div className="text-sm font-manuscript text-ink-700">
                    <FiUser className="inline mr-1 text-gold" />
                    {user?.username}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={logout}
                    className="p-2 rounded-full bg-ink-900 text-cream shadow-md hover:shadow-lg transition-all border border-gold"
                    title="Logout"
                  >
                    <FiLogOut className="w-5 h-5" />
                  </motion.button>
                </div>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLoginModal(true)}
                    className="px-8 py-3 rounded-sm font-manuscript font-medium bg-cream/90 backdrop-blur-sm border-2 border-gold/50 text-ink-700 hover:bg-cream hover:border-gold transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {mounted ? t('auth.signIn') : 'Sign In'}
                  </motion.button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="calligraphy-button"
                  >
                    {mounted ? t('auth.signUp') : 'Sign Up'}
                  </button>
                </>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-sm bg-ink-900 text-cream shadow-lg border border-gold"
              >
                {showMobileMenu ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-6 border-t-2 border-gold/30 bg-cream/95 backdrop-blur-md rounded-b-lg"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 px-4 text-ink-700 hover:text-ink-900 font-manuscript text-lg transition-all duration-300 hover:bg-warm-beige/30"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {link.label}
                </Link>
              ))}
            </motion.nav>
          )}
        </div>

        {/* Decorative Border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"></div>
      </header>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  )
}