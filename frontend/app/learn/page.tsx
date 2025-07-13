'use client'

import { motion } from '@/lib/motion'
import { FiBook, FiPlay, FiClock, FiUsers } from '@/lib/icons'

export default function LearnPage() {
  const courses = [
    {
      title: 'Introduction to Islam',
      description: 'Learn the fundamentals of Islamic faith and practice',
      duration: '8 hours',
      students: '12.5k',
      level: 'Beginner',
      color: 'from-islamic-500 to-islamic-700',
    },
    {
      title: 'Quranic Arabic',
      description: 'Master the language of the Quran step by step',
      duration: '24 hours',
      students: '8.3k',
      level: 'Intermediate',
      color: 'from-gold-500 to-gold-700',
    },
    {
      title: 'Islamic History',
      description: 'Explore the rich history of Islamic civilization',
      duration: '16 hours',
      students: '6.7k',
      level: 'All Levels',
      color: 'from-islamic-600 to-islamic-800',
    },
    {
      title: 'Fiqh Essentials',
      description: 'Understanding Islamic jurisprudence and daily practices',
      duration: '12 hours',
      students: '9.1k',
      level: 'Intermediate',
      color: 'from-gold-600 to-gold-800',
    },
    {
      title: 'Seerah of Prophet Muhammad',
      description: 'The complete biography of the Prophet (PBUH)',
      duration: '20 hours',
      students: '15.2k',
      level: 'All Levels',
      color: 'from-islamic-500 to-islamic-700',
    },
    {
      title: 'Tafsir Studies',
      description: 'Deep dive into Quranic interpretation and meaning',
      duration: '30 hours',
      students: '5.4k',
      level: 'Advanced',
      color: 'from-gold-500 to-gold-700',
    },
  ]
  
  const categories = [
    'All Courses',
    'Quran & Tafsir',
    'Hadith Sciences',
    'Fiqh & Law',
    'Arabic Language',
    'Islamic History',
    'Spirituality',
  ]
  
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">Islamic Learning Center</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Deepen your understanding with expert-led courses
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category, index) => (
            <button
              key={category}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                index === 0 
                  ? 'bg-islamic-500 text-white' 
                  : 'glass-card hover:bg-glass-light'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card overflow-hidden group hover:scale-105 transition-all duration-300"
            >
              <div className={`h-48 bg-gradient-to-br ${course.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-sm">
                    {course.level}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-gradient transition-all">
                  {course.title}
                </h3>
                <p className="text-gray-400 mb-4">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiUsers className="w-4 h-4" />
                    <span>{course.students} students</span>
                  </div>
                </div>
                
                <button className="w-full py-3 rounded-xl bg-glass-light hover:bg-glass-medium transition-colors flex items-center justify-center gap-2 font-semibold">
                  <FiPlay className="w-4 h-4" />
                  Start Learning
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass-card p-12 text-center mt-16"
        >
          <h2 className="text-3xl font-bold mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Request a specific course or topic, and our scholars will create personalized content for your learning journey.
          </p>
          <button className="glass-button">
            Request a Course
          </button>
        </motion.div>
      </div>
    </div>
  )
}