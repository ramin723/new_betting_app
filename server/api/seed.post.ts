import { defineEventHandler } from 'h3'
import { seedDatabase } from '../data/seed'

export default defineEventHandler(async () => {
  try {
    // فقط در محیط development اجازه سید دادن داریم
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Seeding is not allowed in production')
    }

    const result = await seedDatabase()
    return result
  } catch (error) {
    console.error('Error in seed endpoint:', error)
    throw error
  }
}) 