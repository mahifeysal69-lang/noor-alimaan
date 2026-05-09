-- Final Fixed Database Schema for Noor Al Imaan Interactive Features
-- This version fixes UUID vs BIGINT compatibility and RLS policy issues

-- Comments Table with admin review field (using BIGINT for foreign key)
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_registration_id BIGINT REFERENCES user_registrations(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    admin_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations Table with improved tracking (using BIGINT for foreign key)
CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_registration_id BIGINT REFERENCES user_registrations(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    screenshot_url TEXT,
    screenshot_path TEXT, -- Supabase storage path
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    payment_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials Table with custom material field (using BIGINT for foreign key)
CREATE TABLE IF NOT EXISTS materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_registration_id BIGINT REFERENCES user_registrations(id) ON DELETE CASCADE,
    material_type TEXT NOT NULL,
    material_custom TEXT, -- For "others" option
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table for anonymous users (using BIGINT for foreign key)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    user_registration_id BIGINT REFERENCES user_registrations(id) ON DELETE SET NULL
);

-- Create Storage Bucket for donation screenshots
-- This needs to be created via Supabase Dashboard or API
-- Bucket name: donation-proofs
-- Public access: false (signed URLs only)

-- Enable Row Level Security (RLS) for all new tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for comments table
CREATE POLICY "Users can view their own comments" ON comments
    FOR SELECT USING (auth.uid()::text = (
        SELECT id::text FROM user_registrations 
        WHERE user_registrations.id = comments.user_registration_id
    ));

CREATE POLICY "Users can insert their own comments" ON comments
    FOR INSERT WITH CHECK (auth.uid()::text = (
        SELECT id::text FROM user_registrations 
        WHERE user_registrations.id = comments.user_registration_id
    ));

CREATE POLICY "Admins can view all comments" ON comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create RLS policies for donations table
CREATE POLICY "Users can view their own donations" ON donations
    FOR SELECT USING (auth.uid()::text = (
        SELECT id::text FROM user_registrations 
        WHERE user_registrations.id = donations.user_registration_id
    ));

CREATE POLICY "Users can insert their own donations" ON donations
    FOR INSERT WITH CHECK (auth.uid()::text = (
        SELECT id::text FROM user_registrations 
        WHERE user_registrations.id = donations.user_registration_id
    ));

CREATE POLICY "Admins can view all donations" ON donations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create RLS policies for materials table
CREATE POLICY "Users can view their own materials" ON materials
    FOR SELECT USING (auth.uid()::text = (
        SELECT id::text FROM user_registrations 
        WHERE user_registrations.id = materials.user_registration_id
    ));

CREATE POLICY "Users can insert their own materials" ON materials
    FOR INSERT WITH CHECK (auth.uid()::text = (
        SELECT id::text FROM user_registrations 
        WHERE user_registrations.id = materials.user_registration_id
    ));

CREATE POLICY "Admins can view all materials" ON materials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create RLS policies for user_sessions table
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR ALL USING (session_id = current_setting('app.current_session_id', true));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_user_registration_id ON comments(user_registration_id);
CREATE INDEX IF NOT EXISTS idx_comments_admin_reviewed ON comments(admin_reviewed);
CREATE INDEX IF NOT EXISTS idx_donations_user_registration_id ON donations(user_registration_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_payment_completed ON donations(payment_completed);
CREATE INDEX IF NOT EXISTS idx_materials_user_registration_id ON materials(user_registration_id);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(material_type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Function to create or get user session
CREATE OR REPLACE FUNCTION get_or_create_session()
RETURNS TEXT AS $$
DECLARE
    session_uuid TEXT;
    session_exists BOOLEAN;
BEGIN
    -- Check if session already exists in app setting
    SELECT current_setting('app.current_session_id', true) INTO session_uuid;
    
    IF session_uuid IS NULL OR session_uuid = '' THEN
        -- Create new session
        session_uuid := gen_random_uuid()::TEXT;
        
        -- Insert into sessions table
        INSERT INTO user_sessions (session_id) VALUES (session_uuid);
        
        -- Set session in app setting (for this transaction)
        PERFORM set_config('app.current_session_id', session_uuid, true);
    END IF;
    
    RETURN session_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to link session to user registration
CREATE OR REPLACE FUNCTION link_session_to_registration(p_session_id TEXT, p_registration_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE user_sessions 
    SET user_registration_id = p_registration_id 
    WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user data by session
CREATE OR REPLACE FUNCTION get_user_data_by_session(p_session_id TEXT)
RETURNS TABLE (
    -- User registration data
    id BIGINT,
    full_name_oromo TEXT,
    age_oromo INTEGER,
    city_oromo TEXT,
    gender_oromo TEXT,
    village_oromo TEXT,
    mosque_oromo TEXT,
    phone_oromo TEXT,
    full_name_english TEXT,
    age_english INTEGER,
    city_english TEXT,
    gender_english TEXT,
    village_english TEXT,
    mosque_english TEXT,
    phone_english TEXT,
    participation_idea BOOLEAN,
    participation_money BOOLEAN,
    participation_material BOOLEAN,
    participation_provision BOOLEAN,
    participation_all BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    
    -- Comments data
    comment_message TEXT,
    comment_admin_reviewed BOOLEAN,
    comment_created_at TIMESTAMP WITH TIME ZONE,
    
    -- Donations data
    donation_amount NUMERIC,
    donation_screenshot_url TEXT,
    donation_screenshot_path TEXT,
    donation_status TEXT,
    donation_payment_completed BOOLEAN,
    donation_created_at TIMESTAMP WITH TIME ZONE,
    
    -- Materials data
    material_type TEXT,
    material_custom TEXT,
    material_quantity INTEGER,
    material_size TEXT,
    material_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ur.id,
        ur.full_name_oromo,
        ur.age_oromo,
        ur.city_oromo,
        ur.gender_oromo,
        ur.village_oromo,
        ur.mosque_oromo,
        ur.phone_oromo,
        ur.full_name_english,
        ur.age_english,
        ur.city_english,
        ur.gender_english,
        ur.village_english,
        ur.mosque_english,
        ur.phone_english,
        ur.participation_idea,
        ur.participation_money,
        ur.participation_material,
        ur.participation_provision,
        ur.participation_all,
        ur.created_at,
        c.message as comment_message,
        c.admin_reviewed as comment_admin_reviewed,
        c.created_at as comment_created_at,
        d.amount as donation_amount,
        d.screenshot_url as donation_screenshot_url,
        d.screenshot_path as donation_screenshot_path,
        d.status as donation_status,
        d.payment_completed as donation_payment_completed,
        d.created_at as donation_created_at,
        m.material_type,
        m.material_custom,
        m.quantity as material_quantity,
        m.size as material_size,
        m.created_at as material_created_at
    FROM user_sessions us
    LEFT JOIN user_registrations ur ON us.user_registration_id = ur.id
    LEFT JOIN comments c ON ur.id = c.user_registration_id
    LEFT JOIN donations d ON ur.id = d.user_registration_id
    LEFT JOIN materials m ON ur.id = m.user_registration_id
    WHERE us.session_id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS VOID AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic cleanup
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_sessions()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM cleanup_expired_sessions();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- This trigger would need to be called periodically or set up as a cron job
-- For now, it's a manual cleanup function
