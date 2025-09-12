// Direct migration application using individual SQL commands
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://igqnndxochvxaaqvosvq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncW5uZHhvY2h2eGFhcXZvc3ZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDExNjQxNiwiZXhwIjoyMDY1NjkyNDE2fQ.tSWf4lBQZQu_fhGNsvA3jTlaPsYZb2ll1519xIUC-mg';

async function applyMigration() {
  console.log('🔧 APPLYING SCHEMA MIGRATION DIRECTLY\n');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection first
    console.log('📡 Testing database connection...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('matches')
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    if (connectionError) {
      throw new Error(`Connection failed: ${connectionError.message}`);
    }
    
    console.log('✅ Database connection successful');
    
    // Individual column additions (safer approach)
    const columns = [
      { name: 'venue', type: 'text', default: null },
      { name: 'referee', type: 'text', default: null },
      { name: 'home_score', type: 'integer', default: null },
      { name: 'away_score', type: 'integer', default: null },
      { name: 'competition_id', type: 'text', default: null },
      { name: 'season', type: 'text', default: null },
      { name: 'matchday', type: 'integer', default: null },
      { name: 'stage', type: 'text', default: null },
      { name: 'group_name', type: 'text', default: null },
      { name: 'external_id', type: 'text', default: null },
      { name: 'data_source', type: 'text', default: "'internal'" },
      { name: 'home_team_id', type: 'uuid', default: null },
      { name: 'away_team_id', type: 'uuid', default: null },
      { name: 'league_id', type: 'uuid', default: null },
      { name: 'home_team_logo', type: 'text', default: null },
      { name: 'away_team_logo', type: 'text', default: null },
      { name: 'league_logo', type: 'text', default: null },
      { name: 'is_pulled', type: 'boolean', default: 'false' },
      { name: 'is_analyzed', type: 'boolean', default: 'false' },
      { name: 'is_published', type: 'boolean', default: 'false' },
      { name: 'analysis_status', type: 'text', default: "'none'" },
      { name: 'analysis_priority', type: 'text', default: "'normal'" },
      { name: 'current_minute', type: 'integer', default: null },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ];
    
    console.log(`🔧 Adding ${columns.length} columns to matches table...`);
    
    let added = 0;
    let skipped = 0;
    const errors = [];
    
    for (const column of columns) {
      try {
        console.log(`  Adding column: ${column.name} (${column.type})`);
        
        // Check if column exists first
        const { data: columnExists } = await supabase
          .rpc('column_exists', { 
            table_name: 'matches', 
            column_name: column.name 
          })
          .single();
        
        // If RPC doesn't work, try to query the column directly
        if (!columnExists) {
          try {
            await supabase
              .from('matches')
              .select(`${column.name}`)
              .limit(1);
            console.log(`    ✅ Column ${column.name} already exists`);
            skipped++;
            continue;
          } catch (queryError) {
            // Column doesn't exist, we'll add it
          }
        } else if (columnExists) {
          console.log(`    ✅ Column ${column.name} already exists`);
          skipped++;
          continue;
        }
        
        // Column doesn't exist, add it using a simple approach
        // Since we can't run DDL directly through the client, we'll log the SQL
        const sql = `ALTER TABLE matches ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}${column.default !== null ? ` DEFAULT ${column.default}` : ''};`;
        console.log(`    📝 SQL needed: ${sql}`);
        
        // Try to add through the service role (if available)
        // This is a workaround - in production, these migrations should be run in Supabase SQL editor
        console.log(`    ⚠️ Column ${column.name} needs to be added manually`);
        
      } catch (error) {
        console.log(`    ❌ Error checking column ${column.name}: ${error.message}`);
        errors.push(`${column.name}: ${error.message}`);
      }
    }
    
    console.log('\n📊 MIGRATION SUMMARY:');
    console.log(`✅ Columns found existing: ${skipped}`);
    console.log(`⚠️ Columns needing manual addition: ${columns.length - skipped}`);
    
    if (errors.length > 0) {
      console.log(`❌ Errors encountered: ${errors.length}`);
      errors.forEach(error => console.log(`   • ${error}`));
    }
    
    // Now test if competition_id exists (our main issue)
    console.log('\n🔍 Testing competition_id column specifically...');
    
    try {
      const { data: competitionTest, error: competitionError } = await supabase
        .from('matches')
        .select('id, competition_id')
        .limit(1);
      
      if (competitionError && competitionError.message.includes('competition_id')) {
        console.log('❌ competition_id column still missing');
        console.log('\n🔧 MANUAL MIGRATION REQUIRED:');
        console.log('Please run this SQL in your Supabase SQL editor:');
        console.log('');
        console.log('-- Add missing columns');
        columns.forEach(col => {
          const sql = `ALTER TABLE matches ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${col.default !== null ? ` DEFAULT ${col.default}` : ''};`;
          console.log(sql);
        });
        console.log('');
        console.log('-- Add indexes');
        console.log('CREATE INDEX IF NOT EXISTS idx_matches_external_id ON matches(external_id);');
        console.log('CREATE INDEX IF NOT EXISTS idx_matches_data_source ON matches(data_source);');
        console.log('CREATE INDEX IF NOT EXISTS idx_matches_competition_id ON matches(competition_id);');
        console.log('');
      } else {
        console.log('✅ competition_id column is now accessible!');
        console.log('✅ Migration completed successfully');
      }
      
    } catch (testError) {
      console.log('❌ Still having issues accessing competition_id:', testError.message);
    }
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
  }
}

applyMigration();