const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixMatchesTable() {
  try {
    console.log('🔧 Adding missing columns to matches table...');
    
    // Add the missing columns
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add referee column (this is the one causing the error)
        ALTER TABLE matches ADD COLUMN IF NOT EXISTS referee text;
        
        -- Add venue column
        ALTER TABLE matches ADD COLUMN IF NOT EXISTS venue text;
        
        -- Add score columns
        ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_score integer;
        ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_score integer;
        
        -- Add data source column
        ALTER TABLE matches ADD COLUMN IF NOT EXISTS data_source text DEFAULT 'manual';
        
        -- Add relationship columns (these might not exist yet)
        ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_team_id uuid;
        ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_team_id uuid;
        ALTER TABLE matches ADD COLUMN IF NOT EXISTS league_id uuid;
        
        -- Add analysis status column
        ALTER TABLE matches ADD COLUMN IF NOT EXISTS analysis_status text DEFAULT 'none';
        
        -- Add is_published column
        ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;
        
        -- Add created_at and updated_at columns
        ALTER TABLE matches ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
        ALTER TABLE matches ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
      `
    });

    if (error) {
      console.error('❌ Error adding columns:', error);
      return false;
    }

    console.log('✅ Successfully added missing columns to matches table');
    return true;

  } catch (error) {
    console.error('❌ Error fixing matches table:', error);
    return false;
  }
}

async function testSync() {
  try {
    console.log('🧪 Testing sync functionality...');
    
    // Test the sync API endpoint
    const response = await fetch('/api/v1/admin/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operation: 'teams' })
    });

    const result = await response.json();
    console.log('Sync test result:', result);
    
    return result.success;

  } catch (error) {
    console.error('❌ Error testing sync:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting matches table fix...');
  
  const fixed = await fixMatchesTable();
  if (!fixed) {
    console.log('❌ Failed to fix matches table');
    return;
  }

  console.log('✅ Matches table fixed successfully!');
  console.log('🎉 You can now try the sync operation again.');
}

main().catch(console.error); 