import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CollectionBooksClient } from '@/components/hadith/CollectionBooksClient'
import { hadithApi } from '@/services/api'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const collections = await hadithApi.getCollections()
  const collection = collections.find(c => c.collection_id === params.slug)
  
  if (!collection) {
    return {
      title: 'Collection Not Found',
    }
  }

  return {
    title: `${collection.name} - Books | Al Hidaya`,
    description: `Browse all books in ${collection.name}. ${collection.description}`,
  }
}

export default async function CollectionBooksPage({ params }: PageProps) {
  const collections = await hadithApi.getCollections()
  const collection = collections.find(c => c.collection_id === params.slug)
  
  if (!collection) {
    notFound()
  }

  const books = await hadithApi.getBooks(params.slug)

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <a href="/" className="hover:text-white transition-colors">Home</a>
          <span>/</span>
          <a href="/hadith" className="hover:text-white transition-colors">Hadith</a>
          <span>/</span>
          <a href={`/hadith/${params.slug}`} className="hover:text-white transition-colors">
            {collection.name}
          </a>
          <span>/</span>
          <span className="text-white">Books</span>
        </nav>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-islamic-600 to-islamic-500 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {collection.name}
          </h1>
          <p className="text-xl text-white/80 mb-4">
            {collection.arabic_name}
          </p>
          <p className="text-lg text-white/70 max-w-3xl">
            {collection.description}
          </p>
          <div className="mt-6 flex items-center gap-4 text-white/80">
            <span>{books.length} Books</span>
            <span>•</span>
            <span>{collection.total_hadiths?.toLocaleString() || 0} Total Hadiths</span>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="container mx-auto px-4 py-12">
        <CollectionBooksClient 
          collectionId={params.slug}
          collectionName={collection.name}
          slug={params.slug}
        />
      </div>
    </div>
  )
}