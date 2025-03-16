import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, '../../database.sqlite')

export const DB_CONFIG = {
  storage: dbPath,
  logging: false,
  dialect: 'sqlite',
  define: {
    underscored: true,
    timestamps: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
} 