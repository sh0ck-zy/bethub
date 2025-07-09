-- Create Admin User Script
-- Run this AFTER you've signed up and logged in to your app

-- Replace 'your-email@example.com' with your actual email
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify the admin user was created
SELECT id, email, role, created_at 
FROM profiles 
WHERE role = 'admin'; 