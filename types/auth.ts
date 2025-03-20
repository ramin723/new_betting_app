export type UserRole = 'admin' | 'user' | 'moderator';

export interface SessionUser {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role: UserRole;
  balance: number;
  avatar?: string;
  commission?: number;
  points?: number;
} 