/**
 * Quick script to populate database with team logos from local config
 * Run with: node populate-team-logos.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Team data from your local config with additional logo URLs
const TEAM_LOGOS = {
  'Manchester United': {
    logo_url: '/logos/manchester-united.svg',
    primary: '#DA291C',
    country: 'England'
  },
  'Liverpool': {
    logo_url: '/logos/liverpool.svg', 
    primary: '#C8102E',
    country: 'England'
  },
  'Arsenal': {
    logo_url: '/logos/arsenal.svg',
    primary: '#EF0107', 
    country: 'England'
  },
  'Chelsea': {
    logo_url: '/logos/chelsea.svg',
    primary: '#034694',
    country: 'England'
  },
  'Real Madrid': {
    logo_url: '/logos/real-madrid.svg',
    primary: '#FEBE10',
    country: 'Spain'
  },
  'Barcelona': {
    logo_url: '/logos/barcelona.svg',
    primary: '#A50044',
    country: 'Spain'
  },
  'Bayern Munich': {
    logo_url: '/logos/bayern-munich.svg',
    primary: '#DC052D',
    country: 'Germany'
  },
  'Borussia Dortmund': {
    logo_url: '/logos/borussia-dortmund.svg',
    primary: '#FDE100',
    country: 'Germany'
  },
  'Juventus': {
    logo_url: '/logos/juventus.svg',
    primary: '#000000',
    country: 'Italy'
  },
  'AC Milan': {
    logo_url: '/logos/ac-milan.svg',
    primary: '#FF0000',
    country: 'Italy'
  },
  // Brazilian teams with placeholder logos for now
  'Botafogo FR': {
    logo_url: null,
    primary: '#000000',
    country: 'Brazil'
  },
  'CR Flamengo': {
    logo_url: null,
    primary: '#FF0000', 
    country: 'Brazil'
  },
  'SE Palmeiras': {
    logo_url: null,
    primary: '#006400',
    country: 'Brazil'
  },
  'Santos FC': {
    logo_url: null,
    primary: '#FFFFFF',
    country: 'Brazil'
  },
  'EC Vitória': {
    logo_url: null,
    primary: '#FF0000',
    country: 'Brazil'
  },
  'Mirassol FC': {
    logo_url: null,
    primary: '#FFD700',
    country: 'Brazil'
  }
};

async function populateTeamLogos() {
  console.log('🔄 Populating team logos in database...');
  
  try {
    const teamsToInsert = Object.entries(TEAM_LOGOS).map(([teamName, data]) => ({
      name: teamName,
      short_name: teamName.split(' ').slice(-1)[0],
      logo_url: data.logo_url,
      country: data.country,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('teams')
      .upsert(teamsToInsert, { 
        onConflict: 'name',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('❌ Database error:', error);
      return;
    }

    console.log(`✅ Successfully added ${data?.length || 0} teams to database`);
    
    // Test a few lookups
    console.log('\n🧪 Testing team lookups:');
    const testTeams = ['Manchester United', 'Arsenal', 'Bayern Munich'];
    
    for (const teamName of testTeams) {
      const { data: team } = await supabase
        .from('teams')
        .select('name, logo_url')
        .ilike('name', teamName)
        .single();
      
      if (team) {
        const hasLogo = team.logo_url ? '✅' : '⚠️ ';
        console.log(`   ${hasLogo} ${team.name}: ${team.logo_url || 'No logo'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to populate teams:', error);
  }
}

// Run the script
populateTeamLogos();