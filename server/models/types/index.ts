import type { UserModel } from './UserInterface'
import type { EventModel } from './EventInterface'
import type { BetModel } from './BetInterface'

export * from './UserInterface'
export * from './EventInterface'
export * from './BetInterface'

// تعریف روابط بین مدل‌ها
export interface ModelRelations {
  User: {
    events?: EventModel[]
    bets?: BetModel[]
  }
  Event: {
    creator?: UserModel
    bets?: BetModel[]
  }
  Bet: {
    user?: UserModel
    event?: EventModel
  }
} 