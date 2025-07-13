import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiBook, FiBookOpen, FiChevronRight, FiList, FiGrid, FiTag } from '@/lib/icons'
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
      description: 'The requested hadith collection could not be found.'
    }
  }

  return {
    title: `${collection.name} - Hadith Collection | Al Hidaya`,
    description: collection.description || `Browse ${collection.name} with Arabic text and translations. ${collection.total_hadiths} authentic hadiths organized in ${collection.books} books.`,
    keywords: `${collection.name}, ${collection.arabic_name}, hadith, Islamic narrations, authentic hadith, sunnah`,
    openGraph: {
      title: `${collection.name} - Hadith Collection`,
      description: collection.description || `${collection.total_hadiths} authentic hadiths organized in ${collection.books} books`,
      type: 'book',
      url: `https://al-hidaya.com/hadith/${params.slug}`,
      siteName: 'Al-Hidaya',
    },
    twitter: {
      card: 'summary',
      title: collection.name,
      description: `${collection.total_hadiths} authentic hadiths in ${collection.books} books`,
    },
  }
}

export default async function HadithCollectionPage({ params }: PageProps) {
  const collections = await hadithApi.getCollections()
  const collection = collections.find(c => c.collection_id === params.slug)
  
  if (!collection) {
    notFound()
  }

  // Fetch books and categories
  const [books, categories] = await Promise.all([
    hadithApi.getBooks(params.slug),
    hadithApi.getCategories()
  ])

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <FiChevronRight className="w-4 h-4" />
          <Link href="/hadith" className="hover:text-white transition-colors">
            Hadith
          </Link>
          <FiChevronRight className="w-4 h-4" />
          <span className="text-white">{collection.name}</span>
        </nav>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-islamic-600 to-islamic-500 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {collection.name}
            </h1>
            <h2 className="text-3xl font-arabic text-white/90 mb-6">
              {collection.arabic_name}
            </h2>
            <p className="text-lg text-white/80 mb-2">
              by {collection.author}
            </p>
            <p className="text-white/70 max-w-3xl mx-auto mb-8">
              {collection.description}
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 text-white/80 mb-8">
              <div className="flex items-center gap-2">
                <FiBook className="w-5 h-5" />
                <span className="font-semibold">{books.length} Books</span>
              </div>
              <div className="flex items-center gap-2">
                <FiBookOpen className="w-5 h-5" />
                <span className="font-semibold">{collection.total_hadiths?.toLocaleString() || 0} Hadiths</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center gap-4 flex-wrap">
              <Link 
                href={`/hadith/${params.slug}/all`}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <FiList className="w-5 h-5" />
                Browse All Hadiths
              </Link>
              <Link 
                href={`/hadith/${params.slug}/search`}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                Search in Collection
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-4">Browse by Categories</h3>
          <p className="text-gray-400 mb-6">Explore hadiths organized by themes</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category: any) => (
              <Link
                key={category.id}
                href={`/hadith/${params.slug}/category/${category.category_id}`}
                className="glass-card p-4 hover:bg-glass-light transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-islamic-400 transition-colors">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-400 font-arabic">
                      {category.arabic_name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Books Section */}
        <div className="mb-8 pt-8 border-t border-glass-light">
          <h3 className="text-2xl font-bold text-white mb-2">Browse by Books</h3>
          <p className="text-gray-400">Read hadiths in their original book order</p>
        </div>
        
        {books.length > 0 ? (
          <CollectionBooksClient 
            collectionId={params.slug}
            collectionName={collection.name}
            slug={params.slug}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No books found in this collection.</p>
          </div>
        )}
      </div>
    </div>
  )
}