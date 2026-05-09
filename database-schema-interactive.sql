-- Interactive Features Database Schema for Noor Al Imaan
-- This schema adds tables for comments, donations, and materials

-- Comments Table for Yaadaa (Shuraa) feature
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_registration_id UUID REFERENCES user_registrations(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations Table for Mallaqaan (Money) feature
CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_registration_id UUID REFERENCES user_registrations(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    screenshot_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials Table for Meeshaalee (Materials) feature
CREATE TABLE IF NOT EXISTS materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_registration_id UUID REFERENCES user_registrations(id) ON DELETE CASCADE,
    material_type TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for all new tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for comments table
CREATE POLICY "Users can view their own comments" ON comments
    FOR SELECT USING (auth.uid()::text = (
        SELECT user_id::text FROM user_registrations 
        WHERE user_registrations.id = comments.user_registration_id
    ));

CREATE POLICY "Users can insert their own comments" ON comments
    FOR INSERT WITH CHECK (auth.uid()::text = (
        SELECT user_id::text FROM user_registrations 
        WHERE user_registrations.id = comments.user_registration_id
    ));

-- Create RLS policies for donations table
CREATE POLICY "Users can view their own donations" ON donations
    FOR SELECT USING (auth.uid()::text = (
        SELECT user_id::text FROM user_registrations 
        WHERE user_registrations.id = donations.user_registration_id
    ));

CREATE POLICY "Users can insert their own donations" ON donations
    FOR INSERT WITH CHECK (auth.uid()::text = (
        SELECT user_id::text FROM user_registrations 
        WHERE user_registrations.id = donations.user_registration_id
    ));

-- Create RLS policies for materials table
CREATE POLICY "Users can view their own materials" ON materials
    FOR SELECT USING (auth.uid()::text = (
        SELECT user_id::text FROM user_registrations 
        WHERE user_registrations.id = materials.user_registration_id
    ));

CREATE POLICY "Users can insert their own materials" ON materials
    FOR INSERT WITH CHECK (auth.uid()::text = (
        SELECT user_id::text FROM user_registrations 
        WHERE user_registrations.id = materials.user_registration_id
    ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_user_registration_id ON comments(user_registration_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_registration_id ON donations(user_registration_id);
CREATE INDEX IF NOT EXISTS idx_materials_user_registration_id ON materials(user_registration_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(material_type);

-- Create function to get all user data including interactive features
CREATE OR REPLACE FUNCTION get_user_complete_data(p_user_id UUID)
RETURNS TABLE (
    -- User registration data
    id UUID,
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
    comment_created_at TIMESTAMP WITH TIME ZONE,
    
    -- Donations data
    donation_amount NUMERIC,
    donation_screenshot_url TEXT,
    donation_status TEXT,
    donation_created_at TIMESTAMP WITH TIME ZONE,
    
    -- Materials data
    material_type TEXT,
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
        c.created_at as comment_created_at,
        d.amount as donation_amount,
        d.screenshot_url as donation_screenshot_url,
        d.status as donation_status,
        d.created_at as donation_created_at,
        m.material_type,
        m.quantity as material_quantity,
        m.size as material_size,
        m.created_at as material_created_at
    FROM user_registrations ur
    LEFT JOIN comments c ON ur.id = c.user_registration_id
    LEFT JOIN donations d ON ur.id = d.user_registration_id
    LEFT JOIN materials m ON ur.id = m.user_registration_id
    WHERE ur.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
