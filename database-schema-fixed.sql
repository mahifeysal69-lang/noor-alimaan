-- Noor Al Imaan Database Schema (Fixed Version)
-- This file creates tables for user registrations and feedbacks
-- Handles existing policies gracefully

-- ============================================
-- CLEANUP EXISTING POLICIES FIRST
-- ============================================

-- Drop existing policies to avoid conflicts
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop policies for user_registrations
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'user_registrations'
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON user_registrations', policy_record.policyname);
        EXCEPTION WHEN OTHERS THEN
            -- Policy might not exist, continue
            NULL;
        END;
    END LOOP;
    
    -- Drop policies for user_feedbacks
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'user_feedbacks'
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON user_feedbacks', policy_record.policyname);
        EXCEPTION WHEN OTHERS THEN
            -- Policy might not exist, continue
            NULL;
        END;
    END LOOP;
END $$;

-- ============================================
-- USER REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_registrations (
    id BIGSERIAL PRIMARY KEY,
    
    -- Personal Information (Afaan Oromo/Amharic)
    full_name_oromo TEXT,
    age_oromo INTEGER,
    city_oromo TEXT,
    gender_oromo TEXT,
    village_oromo TEXT,
    mosque_oromo TEXT,
    phone_oromo TEXT,
    
    -- Personal Information (English/Amharic)
    full_name_english TEXT,
    age_english INTEGER,
    city_english TEXT,
    gender_english TEXT,
    village_english TEXT,
    mosque_english TEXT,
    phone_english TEXT,
    
    -- Participation Options
    participation_idea BOOLEAN DEFAULT FALSE,
    participation_money BOOLEAN DEFAULT FALSE,
    participation_material BOOLEAN DEFAULT FALSE,
    participation_provision BOOLEAN DEFAULT FALSE,
    participation_all BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_age_oromo CHECK (age_oromo >= 0 AND age_oromo <= 150),
    CONSTRAINT check_age_english CHECK (age_english >= 0 AND age_english <= 150),
    CONSTRAINT check_phone_oromo CHECK (phone_oromo ~ '^[+]?[0-9\s\-\(\)]+$' OR phone_oromo IS NULL),
    CONSTRAINT check_phone_english CHECK (phone_english ~ '^[+]?[0-9\s\-\(\)]+$' OR phone_english IS NULL)
);

-- ============================================
-- USER FEEDBACKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_feedbacks (
    id BIGSERIAL PRIMARY KEY,
    
    -- User Information (can link to registration or be anonymous)
    user_registration_id BIGINT REFERENCES user_registrations(id) ON DELETE SET NULL,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    
    -- Feedback Content
    feedback_type VARCHAR(50) NOT NULL, -- 'suggestion', 'complaint', 'praise', 'question', 'other'
    subject TEXT,
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1-5 star rating
    
    -- Categorization
    category VARCHAR(100), -- 'website', 'registration', 'mosque', 'general', 'other'
    urgency_level VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_review', 'resolved', 'closed'
    admin_response TEXT,
    admin_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT check_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL),
    CONSTRAINT check_feedback_phone CHECK (phone ~ '^[+]?[0-9\s\-\(\)]+$' OR phone IS NULL)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for user_registrations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_registrations_created_at ON user_registrations(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_registrations_city_oromo ON user_registrations(city_oromo);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_registrations_city_english ON user_registrations(city_english);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_registrations_mosque_oromo ON user_registrations(mosque_oromo);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_registrations_mosque_english ON user_registrations(mosque_english);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_registrations_phone_oromo ON user_registrations(phone_oromo);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_registrations_phone_english ON user_registrations(phone_english);

-- Indexes for user_feedbacks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_feedbacks_created_at ON user_feedbacks(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_feedbacks_status ON user_feedbacks(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_feedbacks_feedback_type ON user_feedbacks(feedback_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_feedbacks_category ON user_feedbacks(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_feedbacks_urgency ON user_feedbacks(urgency_level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_feedbacks_user_reg_id ON user_feedbacks(user_registration_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on both tables
ALTER TABLE user_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedbacks ENABLE ROW LEVEL SECURITY;

-- Policies for user_registrations
-- Allow public insertions (for registration form)
CREATE POLICY "Allow public insert registrations" ON user_registrations
    FOR INSERT WITH CHECK (true);

-- Allow public read access (for viewing registrations)
CREATE POLICY "Allow public read registrations" ON user_registrations
    FOR SELECT USING (true);

-- Allow authenticated users to update registrations (for admin features)
CREATE POLICY "Allow authenticated update registrations" ON user_registrations
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete registrations (for admin features)
CREATE POLICY "Allow authenticated delete registrations" ON user_registrations
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for user_feedbacks
-- Allow public insertions (for feedback form)
CREATE POLICY "Allow public insert feedbacks" ON user_feedbacks
    FOR INSERT WITH CHECK (true);

-- Allow public read access (for viewing feedbacks)
CREATE POLICY "Allow public read feedbacks" ON user_feedbacks
    FOR SELECT USING (true);

-- Allow authenticated users to update feedbacks (for admin responses)
CREATE POLICY "Allow authenticated update feedbacks" ON user_feedbacks
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete feedbacks (for admin moderation)
CREATE POLICY "Allow authenticated delete feedbacks" ON user_feedbacks
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_registrations
DROP TRIGGER IF EXISTS update_user_registrations_updated_at ON user_registrations;
CREATE TRIGGER update_user_registrations_updated_at 
    BEFORE UPDATE ON user_registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_feedbacks
DROP TRIGGER IF EXISTS update_user_feedbacks_updated_at ON user_feedbacks;
CREATE TRIGGER update_user_feedbacks_updated_at 
    BEFORE UPDATE ON user_feedbacks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for registration statistics
CREATE OR REPLACE VIEW registration_stats AS
SELECT 
    COUNT(*) as total_registrations,
    COUNT(CASE WHEN participation_idea = true THEN 1 END) as idea_participants,
    COUNT(CASE WHEN participation_money = true THEN 1 END) as money_participants,
    COUNT(CASE WHEN participation_material = true THEN 1 END) as material_participants,
    COUNT(CASE WHEN participation_provision = true THEN 1 END) as provision_participants,
    COUNT(CASE WHEN participation_all = true THEN 1 END) as all_participants,
    DATE_TRUNC('day', created_at) as registration_date
FROM user_registrations 
GROUP BY DATE_TRUNC('day', created_at);

-- View for feedback summary
CREATE OR REPLACE VIEW feedback_summary AS
SELECT 
    feedback_type,
    status,
    COUNT(*) as count,
    AVG(rating) as average_rating,
    DATE_TRUNC('day', created_at) as feedback_date
FROM user_feedbacks 
GROUP BY feedback_type, status, DATE_TRUNC('day', created_at);

-- ============================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================

-- Uncomment the following for testing purposes only
/*
INSERT INTO user_registrations (
    full_name_oromo, age_oromo, city_oromo, gender_oromo, village_oromo, mosque_oromo, phone_oromo,
    full_name_english, age_english, city_english, gender_english, village_english, mosque_english, phone_english,
    participation_idea, participation_money, participation_material, participation_provision, participation_all
) VALUES (
    'Ahmad Taha Hussein', 25, 'Finfinnee', 'Dhiirraa (Dhiiraa) / ወንድ', 'Ganda X, Wereda 03', 'Masjid Al-Furqaan', '+251 91 123 4567',
    'Ahmad Taha Hussein', 25, 'Addis Ababa', 'Male / ወንድ', 'District 03', 'Al-Furqaan Mosque', '+251 91 123 4567',
    true, false, false, false, false
);

INSERT INTO user_feedbacks (
    full_name, email, feedback_type, subject, message, rating, category, urgency_level
) VALUES (
    'Test User', 'test@example.com', 'suggestion', 'Website Improvement', 'The website looks great! Consider adding more language options.', 5, 'website', 'low'
);
*/

-- ============================================
-- COMPLETED SCHEMA
-- ============================================

-- Schema is ready for use!
-- Tables created: user_registrations, user_feedbacks
-- Views created: registration_stats, feedback_summary
-- RLS enabled with appropriate policies
-- Indexes created for performance
-- Existing policies handled gracefully
