-- Add Telegram linking columns to users table
ALTER TABLE users
ADD COLUMN telegram_chat_id TEXT UNIQUE,
ADD COLUMN telegram_link_code TEXT;

-- Create index for faster lookups when bot receives messages or linking commands
CREATE INDEX idx_users_telegram_chat_id ON users(telegram_chat_id);
CREATE INDEX idx_users_telegram_link_code ON users(telegram_link_code);
