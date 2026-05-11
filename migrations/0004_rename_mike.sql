-- Rename seed founder 'mike' to the real account
UPDATE users
SET username = 'mikeposthumus', email = 'mikeposthumus@gmail.com'
WHERE id = 'u-mike' AND username = 'mike';
