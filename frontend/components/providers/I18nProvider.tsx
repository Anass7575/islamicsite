'use client'

import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n, { changeLanguage } from '@/lib/i18n'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize i18n on mount
    const savedLang = localStorage.getItem('preferredLanguage')
    if (savedLang && i18n.language !== savedLang) {
      changeLanguage(savedLang)
    }
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
}