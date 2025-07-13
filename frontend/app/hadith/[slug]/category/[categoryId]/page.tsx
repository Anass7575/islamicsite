import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiChevronRight, FiTag } from '@/lib/icons'
import { HadithCategoryClient } from '@/components/hadith/HadithCategoryClient'
import { hadithApi } from '@/services/api'

interface PageProps {
  params: {
    slug: string
    categoryId: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [collections, categories] = await Promise.all([
    hadithApi.getCollections(),
    hadithApi.getCategories()
  ])
  
  const collection = collections.find((c: any) => c.collection_id === params.slug)
  const category = categories.find((c: any) => c.category_id === params.categoryId)
  
  if (!collection || !category) {
    return {
      title: 'Not Found',
    }
  }

  return {
    title: `${category.name} - ${collection.name} | Al Hidaya`,
    description: `Browse ${category.name} hadiths from ${collection.name}. ${category.description}`,
  }
}

export default async function HadithCategoryPage({ params }: PageProps) {
  const [collections, categories] = await Promise.all([
    hadithApi.getCollections(),
    hadithApi.getCategories()
  ])
  
  const collection = collections.find((c: any) => c.collection_id === params.slug)
  const category = categories.find((c: any) => c.category_id === params.categoryId)
  
  if (!collection || !category) {
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
          <span className="text-white">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">{category.icon}</span>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient">{category.name}</span>
            </h1>
          </div>
          <h2 className="text-2xl font-arabic text-gold-400 mb-4">
            {category.arabic_name}
          </h2>
          <p className="text-gray-400 mb-2">
            {collection.name}
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {category.description}
          </p>
        </div>

        {/* Client Component for Dynamic Content */}
        <HadithCategoryClient 
          collectionId={params.slug} 
          collectionName={collection.name}
          categoryId={params.categoryId}
          categoryName={category.name}
        />
      </div>
    </div>
  )
}