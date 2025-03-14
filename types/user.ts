export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  points: number;
  balance: number;
  commission: number;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

// Type for development mode test user
export const TEST_USER: User = {
  id: 1,
  username: 'test_admin',
  email: 'admin@test.com',
  role: 'admin',
  points: 1000,
  balance: 50000,
  commission: 2500,
  avatar: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
} 