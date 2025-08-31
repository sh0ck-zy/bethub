-- Create Tables Script
-- This script creates all the tables needed for BetHub with correct structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom ENUM types
CREATE TYPE match_status AS ENUM ('PRE', 'LIVE', 'HT', 'FT', 'POSTPONED', 'CANCELLED');
CREATE TYPE analysis_status AS ENUM ('none', 'pending', 'completed', 'failed');
CREATE TYPE analysis_priority AS ENUM ('low', 'normal', 'high');
CREATE TYPE data_source AS ENUM ('football-data', 'api-sports', 'manual');

-- Create matches table
CREATE TABLE matches (
    -- Primary identifiers
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(50),
    data_source data_source DEFAULT 'football-data',
    
    -- Match details  
    league VARCHAR(200) NOT NULL,
    home_team VARCHAR(200) NOT NULL,
    away_team VARCHAR(200) NOT NULL,
    home_team_id VARCHAR(50), -- External API team IDs
    away_team_id VARCHAR(50),
    league_id VARCHAR(50), -- External API league ID
    kickoff_utc TIMESTAMP WITH TIME ZONE NOT NULL,
    venue VARCHAR(200),
    
    -- Live data
    status match_status DEFAULT 'PRE',
    home_score INTEGER,
    away_score INTEGER,
    current_minute INTEGER,
    live_stats JSONB, -- Flexible live statistics
    
    -- Admin workflow states
    is_pulled BOOLEAN DEFAULT FALSE,
    is_analyzed BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    
    -- Analysis workflow
    analysis_status analysis_status DEFAULT 'none',
    analysis_priority analysis_priority DEFAULT 'normal',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analyzed_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100),
    
    -- Optional display data
    home_team_logo VARCHAR(500),
    away_team_logo VARCHAR(500),
    league_logo VARCHAR(500),
    
    -- Constraints
    UNIQUE(external_id, data_source)
);

-- Create analysis_snapshots table (renamed from analyses for clarity)
CREATE TABLE analysis_snapshots (
    -- Primary identifiers
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    
    -- AI-generated content
    prediction TEXT NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    key_insights TEXT[] NOT NULL DEFAULT '{}',
    
    -- Detailed analysis (flexible JSON structure)
    statistical_analysis JSONB NOT NULL DEFAULT '{}',
    
    -- Metadata
    ai_model_version VARCHAR(50) NOT NULL DEFAULT 'dummy-v1.0',
    processing_time_ms INTEGER DEFAULT 0,
    analysis_quality_score DECIMAL(3,2) CHECK (analysis_quality_score >= 0.0 AND analysis_quality_score <= 1.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    UNIQUE(match_id) -- One analysis per match for now
);

-- Create profiles table (for user management)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_matches_kickoff ON matches(kickoff_utc);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_is_published ON matches(is_published);
CREATE INDEX idx_matches_analysis_status ON matches(analysis_status);
CREATE INDEX idx_matches_league ON matches(league);
CREATE INDEX idx_matches_external_id ON matches(external_id, data_source);
CREATE INDEX idx_analysis_match_id ON analysis_snapshots(match_id);
CREATE INDEX idx_analysis_created_at ON analysis_snapshots(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for published matches
CREATE POLICY "Public matches are viewable by everyone" ON matches
    FOR SELECT USING (is_published = true);

-- Admin full access to all matches operations (INSERT, UPDATE, DELETE, SELECT)
CREATE POLICY "Service role can do everything on matches" ON matches
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view all matches" ON matches
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admin operations on matches (for admin API endpoints)
CREATE POLICY "Admin operations on matches" ON matches
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin updates on matches" ON matches  
    FOR UPDATE USING (true);

CREATE POLICY "Admin deletes on matches" ON matches
    FOR DELETE USING (true);

-- Analysis snapshots policies
CREATE POLICY "Public can view analysis for published matches" ON analysis_snapshots
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = analysis_snapshots.match_id 
            AND matches.is_published = true
        )
    );

-- Service role full access to analysis
CREATE POLICY "Service role can manage analysis" ON analysis_snapshots
    FOR ALL USING (auth.role() = 'service_role');

-- Admin operations on analysis
CREATE POLICY "Admin operations on analysis" ON analysis_snapshots
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin updates on analysis" ON analysis_snapshots
    FOR UPDATE USING (true);

CREATE POLICY "Admin deletes on analysis" ON analysis_snapshots
    FOR DELETE USING (true);

-- Profiles policies
CREATE POLICY "Service role can manage profiles" ON profiles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Success message
SELECT 'Tables created successfully with proper structure and security' as status;