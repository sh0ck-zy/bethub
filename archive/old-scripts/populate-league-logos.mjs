/**
 * Quick script to populate database with league logos
 * Run with: node populate-league-logos.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const LEAGUE_LOGOS = {
  'Premier League': {
    logo_url: 'https://ssl.gstatic.com/onebox/media/sports/logos/udQ6Q2hQx_PEwHIMASGkCg_96x96.png',
    country: 'England',
    type: 'league'
  },
  'La Liga': {
    logo_url: 'https://ssl.gstatic.com/onebox/media/sports/logos/7spCx_to_z6CHmEkpDE2pA_96x96.png',
    country: 'Spain', 
    type: 'league'
  },
  'Bundesliga': {
    logo_url: 'https://ssl.gstatic.com/onebox/media/sports/logos/C3J4TlgD-A-3guT_bY7V4g_96x96.png',
    country: 'Germany',
    type: 'league'
  },
  'Europa League': {
    logo_url: 'https://ssl.gstatic.com/onebox/media/sports/logos/1pcFFy6J2bV1A-ImA5O2sg_96x96.png',
    country: 'Europe',
    type: 'international'
  },
  'Serie A': {
    logo_url: 'https://ssl.gstatic.com/onebox/media/sports/logos/1Dv6GjRCWOVqqcpL0GjmXV_96x96.png',
    country: 'Italy',
    type: 'league'
  },
  'Champions League': {
    logo_url: 'https://ssl.gstatic.com/onebox/media/sports/logos/G5c9UKb3-xNBsLxL4P6glw_96x96.png',
    country: 'Europe',
    type: 'international'
  },
  'Ligue 1': {
    logo_url: 'https://ssl.gstatic.com/onebox/media/sports/logos/7fSaTUfYm6r_OMlgNz4fIw_96x96.png',
    country: 'France',
    type: 'league'
  }
};

async function populateLeagueLogos() {
  console.log('🔄 Populating league logos in database...');
  
  try {
    const leaguesToInsert = Object.entries(LEAGUE_LOGOS).map(([leagueName, data]) => ({
      name: leagueName,
      logo_url: data.logo_url,
      country: data.country,
      type: data.type,
      season: '2024/25',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('leagues')
      .insert(leaguesToInsert)
      .select();

    if (error) {
      console.error('❌ Database error:', error);
      return;
    }

    console.log(`✅ Successfully added ${data?.length || 0} leagues to database`);
    
    // Test a few lookups
    console.log('\n🧪 Testing league lookups:');
    const testLeagues = ['Premier League', 'Bundesliga', 'La Liga'];
    
    for (const leagueName of testLeagues) {
      const { data: league } = await supabase
        .from('leagues')
        .select('name, logo_url')
        .ilike('name', leagueName)
        .single();
      
      if (league) {
        const hasLogo = league.logo_url ? '✅' : '⚠️ ';
        console.log(`   ${hasLogo} ${league.name}: ${league.logo_url || 'No logo'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to populate leagues:', error);
  }
}

// Run the script
populateLeagueLogos();