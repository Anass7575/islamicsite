'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from '@/lib/motion'
import { FiDollarSign, FiInfo } from '@/lib/icons'

export default function ZakatPage() {
  const [assets, setAssets] = useState({
    cash: '',
    gold: '',
    silver: '',
    stocks: '',
    business: '',
    other: '',
  })
  
  const [debts, setDebts] = useState('')
  const [zakatAmount, setZakatAmount] = useState<number | null>(null)
  
  const nisabThreshold = 3000 // Approximate nisab in USD
  const zakatRate = 0.025 // 2.5%
  
  const totalAssets = useMemo(() => {
    return Object.values(assets).reduce((sum, value) => {
      return sum + (parseFloat(value) || 0)
    }, 0)
  }, [assets])
  
  const totalDebts = useMemo(() => parseFloat(debts) || 0, [debts])
  
  const netAssets = useMemo(() => totalAssets - totalDebts, [totalAssets, totalDebts])
  
  const calculateZakat = useCallback(() => {
    if (netAssets >= nisabThreshold) {
      setZakatAmount(netAssets * zakatRate)
    } else {
      setZakatAmount(0)
    }
  }, [netAssets])
  
  const handleAssetChange = useCallback((key: keyof typeof assets, value: string) => {
    setAssets(prev => ({ ...prev, [key]: value }))
  }, [])
  
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">Zakat Calculator</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Calculate your annual Zakat obligation accurately
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FiDollarSign className="text-islamic-400" />
              Your Assets
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Cash & Bank Savings</label>
                <input
                  type="number"
                  value={assets.cash}
                  onChange={(e) => handleAssetChange('cash', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-glass-light border border-glass-border focus:border-islamic-400 focus:outline-none transition-colors"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Gold Value</label>
                <input
                  type="number"
                  value={assets.gold}
                  onChange={(e) => handleAssetChange('gold', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-glass-light border border-glass-border focus:border-islamic-400 focus:outline-none transition-colors"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Silver Value</label>
                <input
                  type="number"
                  value={assets.silver}
                  onChange={(e) => handleAssetChange('silver', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-glass-light border border-glass-border focus:border-islamic-400 focus:outline-none transition-colors"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Stocks & Investments</label>
                <input
                  type="number"
                  value={assets.stocks}
                  onChange={(e) => handleAssetChange('stocks', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-glass-light border border-glass-border focus:border-islamic-400 focus:outline-none transition-colors"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Business Assets</label>
                <input
                  type="number"
                  value={assets.business}
                  onChange={(e) => handleAssetChange('business', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-glass-light border border-glass-border focus:border-islamic-400 focus:outline-none transition-colors"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Other Assets</label>
                <input
                  type="number"
                  value={assets.other}
                  onChange={(e) => handleAssetChange('other', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-glass-light border border-glass-border focus:border-islamic-400 focus:outline-none transition-colors"
                  placeholder="0.00"
                />
              </div>
              
              <div className="border-t border-glass-border pt-4">
                <label className="block text-sm text-gray-400 mb-2">Total Debts & Liabilities</label>
                <input
                  type="number"
                  value={debts}
                  onChange={(e) => setDebts(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-glass-light border border-glass-border focus:border-islamic-400 focus:outline-none transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <button
              onClick={calculateZakat}
              className="glass-button w-full mt-6"
            >
              <FiDollarSign className="mr-2" />
              Calculate Zakat
            </button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {zakatAmount !== null && (
              <div className="glass-card p-8 text-center">
                <h3 className="text-2xl font-bold mb-2">Your Zakat Amount</h3>
                <p className="text-5xl font-bold text-islamic-400 mb-4">
                  ${zakatAmount.toFixed(2)}
                </p>
                <p className="text-gray-400">
                  {zakatAmount > 0 
                    ? 'This is your annual Zakat obligation'
                    : 'Your assets are below the Nisab threshold'}
                </p>
              </div>
            )}
            
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiInfo className="text-gold-400" />
                About Zakat
              </h3>
              <div className="space-y-3 text-gray-300">
                <p>
                  Zakat is one of the Five Pillars of Islam, requiring Muslims to give 2.5% of their qualifying wealth annually to those in need.
                </p>
                <p>
                  <strong className="text-islamic-400">Nisab:</strong> The minimum amount of wealth one must have to be obligated to pay Zakat (approximately $3,000 USD).
                </p>
                <p>
                  <strong className="text-islamic-400">Eligible Recipients:</strong> The poor, the needy, Zakat collectors, new Muslims, those in bondage, those in debt, in the way of Allah, and travelers.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}