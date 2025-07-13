'use client'

import { useState, useEffect } from 'react'

export default function TestHooksPage() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('Initial')

  useEffect(() => {
    setMessage('Component mounted')
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Test Hooks Page</h1>
      <p>Count: {count}</p>
      <p>Message: {message}</p>
      <button 
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Increment
      </button>
    </div>
  )
}