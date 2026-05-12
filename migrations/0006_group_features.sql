-- Create group_invitations table (missing from prod) with role support
CREATE TABLE IF NOT EXISTS group_invitations (
  id              TEXT PRIMARY KEY,
  group_id        TEXT NOT NULL REFERENCES groups(id),
  invited_user_id TEXT NOT NULL REFERENCES users(id),
  invited_by      TEXT NOT NULL REFERENCES users(id),
  role            TEXT NOT NULL DEFAULT 'member',
  status          TEXT NOT NULL DEFAULT 'pending',
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invitations_user  ON group_invitations(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_group ON group_invitations(group_id);
