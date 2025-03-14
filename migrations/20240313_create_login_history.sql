-- Create login history table
CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at);

-- Add RLS policies
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own login history
CREATE POLICY "Users can read own login history"
  ON login_history FOR SELECT
  USING (auth.uid() = user_id);

-- Allow system to insert login history
CREATE POLICY "System can insert login history"
  ON login_history FOR INSERT
  WITH CHECK (auth.uid() = user_id); 