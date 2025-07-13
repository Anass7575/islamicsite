'use client'

import { motion } from '@/lib/motion'
import { FiStar } from '@/lib/icons'

const testimonials = [
  {
    name: 'Ahmed Hassan',
    location: 'Dubai, UAE',
    rating: 5,
    text: 'Al-Hidaya has transformed my daily Islamic practice. The prayer reminders and Quran recitations are beautifully integrated.',
    avatar: '👨'
  },
  {
    name: 'Fatima Al-Rashid',
    location: 'London, UK',
    rating: 5,
    text: 'The most comprehensive Islamic app I have ever used. The 193 language support helps me share it with my entire family.',
    avatar: '👩'
  },
  {
    name: 'Ibrahim Yusuf',
    location: 'Istanbul, Turkey',
    rating: 5,
    text: 'Beautiful design meets functionality. The liquid glass UI makes reading Quran a truly immersive experience.',
    avatar: '👨'
  },
]

export function TestimonialsSection() {
  return (
    <section className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Our <span className="text-gradient">Community</span> Says
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Hear from Muslims around the world about their experience with Al-Hidaya
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-8"
            >
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">{testimonial.avatar}</span>
                <div>
                  <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FiStar key={i} className="w-5 h-5 text-gold-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-300 italic">"{testimonial.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}