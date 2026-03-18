-- Local Development Seed Data (Corrected)

-- Clear existing data
TRUNCATE TABLE ads, sponsors, lost_found, users, notices RESTART IDENTITY CASCADE;

-- STEP 1: Insert users FIRST (ads reference them)
INSERT INTO users (phone, name, email, role, is_verified, created_at, updated_at) VALUES 
('9800000000', 'Admin User', 'admin@local.dev', 'admin', true, NOW(), NOW()),
('9800000001', 'Test User', 'user@local.dev', 'user', true, NOW(), NOW()),
('9812345678', 'Seller One', 'seller1@local.dev', 'user', true, NOW(), NOW()),
('9812345679', 'Seller Two', 'seller2@local.dev', 'user', true, NOW(), NOW()),
('9812345680', 'Seller Three', 'seller3@local.dev', 'user', true, NOW(), NOW()),
('9812345681', 'Seller Four', 'seller4@local.dev', 'user', true, NOW(), NOW());

-- STEP 2: Insert ads (users now exist with IDs 1-6)
INSERT INTO ads (title, description, category, price, word_count, total_cost, contact_phone, contact_email, location, status, is_premium, image_urls, created_at, updated_at, expires_at, user_id) VALUES 
('iPhone 13 Pro - Local Test', 'Great condition, barely used', 'electronics', 45000.00, 5, 450.00, '9812345678', 'seller1@local.dev', 'Kathmandu', 'active', false, ARRAY['https://via.placeholder.com/300'], NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', 3),
('Study Table - Wooden', 'Perfect for students', 'furniture', 3500.00, 4, 35.00, '9812345679', 'seller2@local.dev', 'Lalitpur', 'active', false, ARRAY['https://via.placeholder.com/300'], NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() + INTERVAL '30 days', 4),
('Honda Scooter 2019', 'Well maintained', 'vehicles', 85000.00, 4, 850.00, '9812345680', 'seller3@local.dev', 'Bhaktapur', 'active', true, ARRAY['https://via.placeholder.com/300'], NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() + INTERVAL '30 days', 5),
('Programming Books Bundle', 'Clean Code, Go books', 'books', 1200.00, 6, 12.00, '9812345681', 'seller4@local.dev', 'Kathmandu', 'active', false, ARRAY['https://via.placeholder.com/300'], NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours', NOW() + INTERVAL '30 days', 6);

-- STEP 3: Insert sponsors (use valid tier: 'Featured', 'Standard', or 'Basic')
INSERT INTO sponsors (name, category, location, website_url, logo_url, tier, status, display_order, tagline, created_at, updated_at) VALUES 
('Local Cyber Cafe', 'services', 'Kathmandu', 'https://cybercafe.local', 'https://via.placeholder.com/150', 'Featured', 'active', 1, 'Best internet in town', NOW(), NOW()),
('Student Bookstore', 'education', 'Lalitpur', 'https://bookstore.local', 'https://via.placeholder.com/150', 'Featured', 'active', 2, 'All academic books available', NOW(), NOW()),
('Tech Hub Nepal', 'technology', 'Kathmandu', 'https://techhub.local', 'https://via.placeholder.com/150', 'Featured', 'active', 3, 'Your tech partner', NOW(), NOW());

-- STEP 4: Insert lost & found
INSERT INTO lost_found (type, category, title, description, location, date_lost, phone, reward, photo_url, status, created_at, updated_at) VALUES 
('lost', 'documents', 'Lost Student ID Card', 'Lost near central library. Name: Ram Sharma.', 'Central Library, Kathmandu', '2026-03-16', '9812345678', 'Rs 500 reward', 'https://via.placeholder.com/150', 'pending', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('found', 'keys', 'Found House Keys', 'Set of house keys found in main cafeteria.', 'Main Cafeteria, Kathmandu', '2026-03-17', '9800000000', '', 'https://via.placeholder.com/150', 'pending', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('lost', 'electronics', 'Lost Wireless Earbuds', 'White AirPods lost in college parking.', 'College Parking', '2026-03-15', '9811111111', 'Rs 1000 reward', 'https://via.placeholder.com/150', 'resolved', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day');
