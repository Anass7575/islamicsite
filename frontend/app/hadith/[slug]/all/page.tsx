import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiChevronRight } from '@/lib/icons'
import { HadithCollectionClient } from '@/components/hadith/HadithCollectionClient'
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
    title: `All Hadiths - ${collection.name} | Al Hidaya`,
    description: `Browse all ${collection.total_hadiths} hadiths from ${collection.name} with Arabic text and translations.`,
  }
}

export default async function AllHadithsPage({ params }: PageProps) {
  const collections = await hadithApi.getCollections()
  const collection = collections.find(c => c.collection_id === params.slug)
  
  if (!collection) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-dark py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <FiChevronRight className="w-4 h-4" />
          <Link href="/hadith" className="hover:text-white transition-colors">
            Hadith
          </Link>
          <FiChevronRight className="w-4 h-4" />
          <Link href={`/hadith/${params.slug}`} className="hover:text-white transition-colors">
            {collection.name}
          </Link>
          <FiChevronRight className="w-4 h-4" />
          <span className="text-white">All Hadiths</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="text-gradient">All Hadiths</span>
          </h1>
          <h2 className="text-2xl text-gray-400 mb-4">
            {collection.name}
          </h2>
          <p className="text-gray-500">
            Showing all {collection.total_hadiths?.toLocaleString() || 0} hadiths
          </p>
        </div>

        {/* Client Component for Dynamic Content */}
        <HadithCollectionClient 
          collectionId={params.slug} 
          collectionName={collection.name}
          slug={params.slug}
        />
      </div>
    </div>
  )
}