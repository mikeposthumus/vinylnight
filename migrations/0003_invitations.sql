-- Invitation-only membership + real seed passwords

-- Fix placeholder password hashes (password: vinylnight)
UPDATE users
SET password_hash = 'pbkdf2:e3a37ae40b04ccde1d8f3e0accbcb80f:be300b0ca1c0070599f6e6dc5abb8d9e86f6482c8ef88f231ff72e9a365986d1'
WHERE password_hash = 'placeholder';

-- Invitations table (founders invite by username)
CREATE TABLE IF NOT EXISTS group_invitations (
  id              TEXT PRIMARY KEY,
  group_id        TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  invited_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_by      TEXT NOT NULL REFERENCES users(id),
  status          TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined'
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invitations_user   ON group_invitations(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_group  ON group_invitations(group_id);
