import { Metadata } from 'next'
import { BookmarksClient } from '@/components/bookmarks/BookmarksClient'

export const metadata: Metadata = {
  title: 'My Bookmarks | Al-Hidaya',
  description: 'View and manage your saved hadiths, verses, and other bookmarks',
}

export default function BookmarksPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">My Bookmarks</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Your saved hadiths, verses, and spiritual content
          </p>
        </div>

        <BookmarksClient />
      </div>
    </div>
  )
}