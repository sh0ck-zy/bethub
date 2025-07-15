-- Create settings table for storing app configurations
CREATE TABLE IF NOT EXISTS public.settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster key lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- Insert default spotlight match setting (will be empty initially)
INSERT INTO public.settings (key, value, description) 
VALUES ('spotlight_match_id', NULL, 'ID of the match to display in homepage carousel')
ON CONFLICT (key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust based on your RLS policies)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO anon;
GRANT USAGE ON SEQUENCE public.settings_id_seq TO service_role;
GRANT USAGE ON SEQUENCE public.settings_id_seq TO anon;