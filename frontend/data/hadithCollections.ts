export interface HadithCollection {
  id: string
  name: string
  arabicName: string
  author: string
  authorArabic: string
  description: string
  totalHadiths: number
  books: number
  authenticity: 'sahih' | 'hasan' | 'mixed'
  icon: string
}

export interface HadithCategory {
  id: string
  name: string
  arabicName: string
  icon: string
  description: string
}

export const hadithCollections: HadithCollection[] = [
  {
    id: 'bukhari',
    name: 'Sahih al-Bukhari',
    arabicName: 'صحيح البخاري',
    author: 'Imam Muhammad al-Bukhari',
    authorArabic: 'الإمام محمد البخاري',
    description: 'The most authentic collection of hadith, compiled over 16 years',
    totalHadiths: 7563,
    books: 97,
    authenticity: 'sahih',
    icon: '📚'
  },
  {
    id: 'muslim',
    name: 'Sahih Muslim',
    arabicName: 'صحيح مسلم',
    author: 'Imam Muslim ibn al-Hajjaj',
    authorArabic: 'الإمام مسلم بن الحجاج',
    description: 'The second most authentic hadith collection after Bukhari',
    totalHadiths: 7453,
    books: 56,
    authenticity: 'sahih',
    icon: '📖'
  },
  {
    id: 'abudawud',
    name: 'Sunan Abu Dawud',
    arabicName: 'سنن أبي داود',
    author: 'Imam Abu Dawud',
    authorArabic: 'الإمام أبو داود',
    description: 'Focus on legal hadiths and practical Islamic jurisprudence',
    totalHadiths: 5274,
    books: 43,
    authenticity: 'mixed',
    icon: '📜'
  },
  {
    id: 'tirmidhi',
    name: "Jami' at-Tirmidhi",
    arabicName: 'جامع الترمذي',
    author: 'Imam at-Tirmidhi',
    authorArabic: 'الإمام الترمذي',
    description: 'Known for including the opinions of jurists on each hadith',
    totalHadiths: 3956,
    books: 49,
    authenticity: 'mixed',
    icon: '📕'
  },
  {
    id: 'nasai',
    name: "Sunan an-Nasa'i",
    arabicName: 'سنن النسائي',
    author: "Imam an-Nasa'i",
    authorArabic: 'الإمام النسائي',
    description: 'Known for its particular focus on the science of hadith criticism',
    totalHadiths: 5758,
    books: 51,
    authenticity: 'mixed',
    icon: '📗'
  },
  {
    id: 'ibnmajah',
    name: 'Sunan Ibn Majah',
    arabicName: 'سنن ابن ماجه',
    author: 'Imam Ibn Majah',
    authorArabic: 'الإمام ابن ماجه',
    description: 'The sixth canonical hadith collection, includes unique narrations',
    totalHadiths: 4341,
    books: 37,
    authenticity: 'mixed',
    icon: '📘'
  }
]

export const hadithCategories: HadithCategory[] = [
  {
    id: 'faith',
    name: 'Faith (Iman)',
    arabicName: 'الإيمان',
    icon: '🌟',
    description: 'Hadiths about belief, faith, and the pillars of Islam'
  },
  {
    id: 'prayer',
    name: 'Prayer (Salah)',
    arabicName: 'الصلاة',
    icon: '🕌',
    description: 'Hadiths about prayer, its importance, and how to perform it'
  },
  {
    id: 'fasting',
    name: 'Fasting (Sawm)',
    arabicName: 'الصيام',
    icon: '🌙',
    description: 'Hadiths about fasting, Ramadan, and voluntary fasts'
  },
  {
    id: 'zakat',
    name: 'Charity (Zakat)',
    arabicName: 'الزكاة',
    icon: '💝',
    description: 'Hadiths about charity, zakat, and helping others'
  },
  {
    id: 'hajj',
    name: 'Pilgrimage (Hajj)',
    arabicName: 'الحج',
    icon: '🕋',
    description: 'Hadiths about Hajj, Umrah, and visiting the holy sites'
  },
  {
    id: 'ethics',
    name: 'Ethics & Character',
    arabicName: 'الأخلاق والآداب',
    icon: '🌸',
    description: 'Hadiths about good character, manners, and ethical behavior'
  },
  {
    id: 'family',
    name: 'Family & Marriage',
    arabicName: 'الأسرة والنكاح',
    icon: '👨‍👩‍👧‍👦',
    description: 'Hadiths about family life, marriage, and relationships'
  },
  {
    id: 'business',
    name: 'Business & Trade',
    arabicName: 'البيوع والمعاملات',
    icon: '💼',
    description: 'Hadiths about commerce, trade, and financial ethics'
  },
  {
    id: 'knowledge',
    name: 'Knowledge & Learning',
    arabicName: 'العلم',
    icon: '📚',
    description: 'Hadiths about seeking knowledge and education'
  },
  {
    id: 'dua',
    name: "Supplications (Du'a)",
    arabicName: 'الأدعية والأذكار',
    icon: '🤲',
    description: 'Hadiths containing prayers and remembrances'
  }
]

// Sample hadiths for demonstration
export interface Hadith {
  id: string
  collectionId: string
  bookNumber: number
  bookName: string
  hadithNumber: number
  arabicText: string
  englishText: string
  narratorChain: string
  grade: 'sahih' | 'hasan' | 'da\'if' | 'mawdu\''
  gradeText: string
  categories: string[]
  reference: string
}

export const sampleHadiths: Hadith[] = [
  {
    id: 'bukhari-1',
    collectionId: 'bukhari',
    bookNumber: 1,
    bookName: 'Revelation',
    hadithNumber: 1,
    arabicText: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    englishText: 'Actions are judged by intentions, and every person will get what they intended.',
    narratorChain: 'Narrated by Umar ibn al-Khattab',
    grade: 'sahih',
    gradeText: 'Sahih (Authentic)',
    categories: ['faith', 'ethics'],
    reference: 'Sahih al-Bukhari 1'
  },
  {
    id: 'muslim-1',
    collectionId: 'muslim',
    bookNumber: 1,
    bookName: 'Faith',
    hadithNumber: 1,
    arabicText: 'الإِسْلاَمُ أَنْ تَشْهَدَ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
    englishText: 'Islam is to testify that there is no deity but Allah and Muhammad is the Messenger of Allah.',
    narratorChain: 'Narrated by Ibn Umar',
    grade: 'sahih',
    gradeText: 'Sahih (Authentic)',
    categories: ['faith'],
    reference: 'Sahih Muslim 8'
  }
]