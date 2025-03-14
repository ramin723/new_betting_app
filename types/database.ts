export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          is_active: boolean
          username: string
          balance: number
          role: string
          created_at?: string
          updated_at?: string
        }
      }
      admin_profiles: {
        Row: {
          user_id: string
          two_factor_secret: string | null
          two_factor_enabled: boolean
          is2FAEnabled: boolean
          created_at?: string
          updated_at?: string
        }
      }
      login_history: {
        Row: {
          id: string
          user_id: string
          ip_address: string
          user_agent: string
          success: boolean
          created_at: string
        }
      }
    }
  }
} 