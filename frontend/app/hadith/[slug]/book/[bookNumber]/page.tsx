import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiChevronRight } from '@/lib/icons'
import { HadithBookClient } from '@/components/hadith/HadithBookClient'

// Map slugs to collection IDs
const slugToId: { [key: string]: string } = {
  'sahih-bukhari': 'bukhari',
  'sahih-muslim': 'muslim',
  'sunan-abu-dawud': 'abudawud',
  'jami-at-tirmidhi': 'tirmidhi',
  'sunan-an-nasai': 'nasai',
  'sunan-ibn-majah': 'ibnmajah'
}

// Collection metadata
const collectionMetadata: { [key: string]: any } = {
  'sahih-bukhari': {
    name: 'Sahih al-Bukhari',
    arabicName: 'صحيح البخاري',
  },
  'sahih-muslim': {
    name: 'Sahih Muslim',
    arabicName: 'صحيح مسلم',
  },
  'sunan-abu-dawud': {
    name: 'Sunan Abu Dawud',
    arabicName: 'سنن أبي داود',
  },
  'jami-at-tirmidhi': {
    name: "Jami' at-Tirmidhi",
    arabicName: 'جامع الترمذي',
  },
  'sunan-an-nasai': {
    name: "Sunan an-Nasa'i",
    arabicName: 'سنن النسائي',
  },
  'sunan-ibn-majah': {
    name: 'Sunan Ibn Majah',
    arabicName: 'سنن ابن ماجه',
  }
}

interface Props {
  params: {
    slug: string
    bookNumber: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = collectionMetadata[params.slug]
  
  if (!collection) {
    return { title: 'Collection Not Found' }
  }

  return {
    title: `Book ${params.bookNumber} - ${collection.name} | Al-Hidaya`,
    description: `Read hadiths from Book ${params.bookNumber} of ${collection.name}`,
  }
}

export default function HadithBookPage({ params }: Props) {
  const collection = collectionMetadata[params.slug]
  const collectionId = slugToId[params.slug]
  const bookNumber = parseInt(params.bookNumber)
  
  if (!collection || !collectionId || isNaN(bookNumber)) {
    notFound()
  }

  return (
    <div className="min-h-screen py-20 px-4">
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
          <Link href={`/hadith/${params.slug}/books`} className="hover:text-white transition-colors">
            Books
          </Link>
          <FiChevronRight className="w-4 h-4" />
          <span className="text-white">Book {bookNumber}</span>
        </nav>

        <HadithBookClient
          collectionId={collectionId}
          collectionName={collection.name}
          collectionArabicName={collection.arabicName}
          slug={params.slug}
          bookNumber={bookNumber}
        />
      </div>
    </div>
  )
}