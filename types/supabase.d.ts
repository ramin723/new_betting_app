import { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

declare module '#app' {
  interface NuxtApp {
    $supabase: SupabaseClient
    $user: Ref<User | null>
  }
}

export {} 