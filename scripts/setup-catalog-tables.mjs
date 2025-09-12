// Script to setup leagues and teams tables for catalog
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = join(__dirname, '..', '.env.local');
let envContent = '';
try {
  envContent = readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('No .env.local file found, using system environment variables');
}

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupCatalogTables() {
  console.log('🏗️  Setting up leagues and teams tables...\n');

  try {
    // Read the SQL file
    const sqlPath = join(__dirname, 'create-leagues-teams.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');

    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }

    // Test the setup
    console.log('\n🔍 Testing the setup...');
    
    const { data: leagues, error: leaguesError } = await supabase
      .from('leagues')
      .select('*')
      .limit(5);

    if (leaguesError) {
      console.error('❌ Error fetching leagues:', leaguesError.message);
    } else {
      console.log(`✅ Found ${leagues?.length || 0} leagues`);
    }

    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .limit(5);

    if (teamsError) {
      console.error('❌ Error fetching teams:', teamsError.message);
    } else {
      console.log(`✅ Found ${teams?.length || 0} teams`);
    }

    console.log('\n🎉 Catalog tables setup completed!');
    console.log('You can now visit /catalog to see your interactive database catalog.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setupCatalogTables();
