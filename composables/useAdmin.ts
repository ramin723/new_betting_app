import type { Event, User, Transaction, Stats } from '~/types/admin'

export const useAdmin = () => {
  const { $supabase } = useNuxtApp()

  // دریافت لیست رویدادها
  const getEvents = async () => {
    try {
      const { data, error } = await $supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Event[]
    } catch (error) {
      console.error('Error fetching events:', error)
      return []
    }
  }

  // ایجاد رویداد جدید
  const createEvent = async (event: Omit<Event, 'id' | 'participants_count'>) => {
    try {
      const { data, error } = await $supabase
        .from('events')
        .insert([event])
        .select()
        .single()

      if (error) throw error
      return data as Event
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  }

  // ویرایش رویداد
  const updateEvent = async (id: number, event: Partial<Event>) => {
    try {
      const { data, error } = await $supabase
        .from('events')
        .update(event)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Event
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  }

  // حذف رویداد
  const deleteEvent = async (id: number) => {
    try {
      const { error } = await $supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  }

  // دریافت لیست کاربران
  const getUsers = async () => {
    try {
      const { data, error } = await $supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as User[]
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

  // ویرایش کاربر
  const updateUser = async (id: number, user: Partial<User>) => {
    try {
      const { data, error } = await $supabase
        .from('users')
        .update(user)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as User
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  // دریافت آمار و گزارشات
  const getStats = async () => {
    try {
      // دریافت تعداد کل کاربران
      const { count: totalUsers } = await $supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // دریافت تعداد رویدادهای فعال
      const { count: activeEvents } = await $supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // دریافت حجم کل معاملات
      const { data: transactions } = await $supabase
        .from('transactions')
        .select('amount')

      const totalTransactions = transactions?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0

      // دریافت معاملات روزانه
      const { data: dailyTransactions } = await $supabase
        .from('transactions')
        .select('amount, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })

      const stats: Stats = {
        totalUsers: totalUsers || 0,
        activeEvents: activeEvents || 0,
        totalTransactions,
        dailyTransactions: dailyTransactions?.map((t: { created_at: string; amount: number }) => ({
          date: new Date(t.created_at).toISOString().split('T')[0],
          amount: t.amount
        })) || []
      }

      return stats
    } catch (error) {
      console.error('Error fetching stats:', error)
      throw error
    }
  }

  // دریافت آخرین معاملات
  const getRecentTransactions = async () => {
    try {
      const { data, error } = await $supabase
        .from('transactions')
        .select(`
          *,
          users (username),
          events (title)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      return data.map((t: { id: number; users: { username: string }; events: { title: string }; amount: number; created_at: string }) => ({
        id: t.id,
        user: t.users.username,
        event: t.events.title,
        amount: t.amount,
        date: t.created_at
      })) as Transaction[]
    } catch (error) {
      console.error('Error fetching recent transactions:', error)
      return []
    }
  }

  return {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getUsers,
    updateUser,
    getStats,
    getRecentTransactions
  }
} 