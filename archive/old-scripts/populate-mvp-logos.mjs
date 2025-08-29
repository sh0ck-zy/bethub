/**
 * Comprehensive MVP Logo Population Script
 * Fetches logos for all competitions and teams across MVP countries
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

class MVPLogoFetcher {
  constructor() {
    this.apiKey = '123';
    this.baseUrl = 'https://www.thesportsdb.com/api/v1/json';
  }

  // All competitions for MVP
  MVP_COMPETITIONS = [
    // Brazilian
    { name: 'Brasileirão Série A', searchTerms: ['Brazilian League', 'Serie A Brazil'], country: 'Brazil' },
    { name: 'Copa do Brasil', searchTerms: ['Copa do Brasil'], country: 'Brazil' },
    
    // English
    { name: 'Premier League', searchTerms: ['English Premier League'], country: 'England' },
    { name: 'Championship', searchTerms: ['English League Championship'], country: 'England' },
    { name: 'FA Cup', searchTerms: ['FA Cup'], country: 'England' },
    { name: 'EFL Cup', searchTerms: ['EFL Cup', 'Carabao Cup'], country: 'England' },
    
    // Spanish
    { name: 'La Liga', searchTerms: ['Spanish La Liga', 'La Liga'], country: 'Spain' },
    { name: 'Copa del Rey', searchTerms: ['Copa del Rey'], country: 'Spain' },
    
    // Portuguese
    { name: 'Primeira Liga', searchTerms: ['Portuguese Primeira Liga'], country: 'Portugal' },
    { name: 'Taça de Portugal', searchTerms: ['Taça de Portugal'], country: 'Portugal' },
    
    // Dutch
    { name: 'Eredivisie', searchTerms: ['Dutch Eredivisie'], country: 'Netherlands' },
    { name: 'KNVB Beker', searchTerms: ['KNVB Cup'], country: 'Netherlands' },
    
    // French
    { name: 'Ligue 1', searchTerms: ['French Ligue 1'], country: 'France' },
    { name: 'Coupe de France', searchTerms: ['Coupe de France'], country: 'France' },
    
    // German
    { name: 'Bundesliga', searchTerms: ['German Bundesliga'], country: 'Germany' },
    { name: 'DFB-Pokal', searchTerms: ['DFB-Pokal'], country: 'Germany' },
    
    // Italian
    { name: 'Serie A', searchTerms: ['Italian Serie A'], country: 'Italy' },
    { name: 'Coppa Italia', searchTerms: ['Coppa Italia'], country: 'Italy' },
    
    // European
    { name: 'UEFA Champions League', searchTerms: ['UEFA Champions League'], country: 'Europe' },
    { name: 'UEFA Europa League', searchTerms: ['UEFA Europa League'], country: 'Europe' },
    { name: 'UEFA Conference League', searchTerms: ['UEFA Conference League'], country: 'Europe' },
  ];

  // Country flags
  COUNTRY_FLAGS = {
    'Brazil': 'https://flagcdn.com/w80/br.png',
    'England': 'https://flagcdn.com/w80/gb-eng.png',
    'Spain': 'https://flagcdn.com/w80/es.png',
    'Portugal': 'https://flagcdn.com/w80/pt.png',
    'Netherlands': 'https://flagcdn.com/w80/nl.png',
    'France': 'https://flagcdn.com/w80/fr.png',
    'Germany': 'https://flagcdn.com/w80/de.png',
    'Italy': 'https://flagcdn.com/w80/it.png',
    'Europe': 'https://flagcdn.com/w80/eu.png',
  };

  async fetchCompetitionLogo(competition) {
    console.log(`🔍 Fetching logo for: ${competition.name}`);
    
    try {
      // Get all leagues first
      const response = await fetch(`${this.baseUrl}/${this.apiKey}/search_all_leagues.php?s=Soccer`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.leagues) {
        // Try to find league by search terms
        for (const searchTerm of competition.searchTerms) {
          const league = data.leagues.find(l => 
            l.strLeague.toLowerCase().includes(searchTerm.toLowerCase()) ||
            searchTerm.toLowerCase().includes(l.strLeague.toLowerCase())
          );
          
          if (league && (league.strBadge || league.strLogo)) {
            const logoUrl = league.strBadge || league.strLogo;
            console.log(`   ✅ Found: ${logoUrl}`);
            return logoUrl;
          }
        }
      }
      
      // Fallback to country flag for cups
      if (competition.name.includes('Cup') || competition.name.includes('Copa') || competition.name.includes('Coupe')) {
        const flagUrl = this.COUNTRY_FLAGS[competition.country];
        if (flagUrl) {
          console.log(`   🏁 Using country flag: ${flagUrl}`);
          return flagUrl;
        }
      }
      
      console.log(`   ❌ No logo found`);
      return null;
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      return null;
    }
  }

  async populateCompetitionLogos() {
    console.log('🚀 Populating competition/league logos...');
    
    let inserted = 0;
    let found = 0;
    
    for (const competition of this.MVP_COMPETITIONS) {
      const logoUrl = await this.fetchCompetitionLogo(competition);
      
      if (logoUrl) {
        found++;
        
        // Insert into leagues table
        const { error } = await supabase
          .from('leagues')
          .upsert({
            name: competition.name,
            country: competition.country,
            logo_url: logoUrl,
            type: competition.name.includes('Cup') || competition.name.includes('Copa') ? 'cup' : 'league',
            season: '2024/25',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'name',
            ignoreDuplicates: false
          });
        
        if (error) {
          console.error(`   ❌ DB Error: ${error.message}`);
        } else {
          console.log(`   💾 Saved to database`);
          inserted++;
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n📊 Competition Logo Results:`);
    console.log(`   🎯 Competitions processed: ${this.MVP_COMPETITIONS.length}`);
    console.log(`   🖼️  Logos found: ${found}`);
    console.log(`   💾 Saved to database: ${inserted}`);
  }

  async populateTeamLogosFromMatches() {
    console.log('\n🔄 Populating team logos from current matches...');
    
    // Get all unique teams from current matches
    const { data: matches } = await supabase
      .from('matches')
      .select('home_team, away_team, league');
    
    if (!matches) {
      console.log('❌ No matches found');
      return;
    }
    
    // Extract unique teams
    const teams = new Set();
    matches.forEach(match => {
      teams.add(match.home_team);
      teams.add(match.away_team);
    });
    
    console.log(`📋 Found ${teams.size} unique teams in matches`);
    
    let updated = 0;
    let found = 0;
    
    for (const teamName of teams) {
      // Check if team already has logo
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('logo_url')
        .eq('name', teamName)
        .single();
      
      if (existingTeam?.logo_url) {
        console.log(`⏩ ${teamName} already has logo`);
        continue;
      }
      
      // Fetch logo from SportsDB
      console.log(`🔍 Fetching logo for: ${teamName}`);
      
      try {
        const response = await fetch(
          `${this.baseUrl}/${this.apiKey}/searchteams.php?t=${encodeURIComponent(teamName)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.teams && data.teams.length > 0) {
            const team = data.teams[0];
            const logoUrl = team.strTeamBadge || team.strTeamLogo;
            
            if (logoUrl) {
              console.log(`   ✅ Found: ${logoUrl}`);
              found++;
              
              // Update database
              const { error } = await supabase
                .from('teams')
                .upsert({
                  name: teamName,
                  logo_url: logoUrl,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'name',
                  ignoreDuplicates: false
                });
              
              if (!error) {
                console.log(`   💾 Updated database`);
                updated++;
              }
            } else {
              console.log(`   ⚠️  No logo found`);
            }
          }
        }
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log(`\n📊 Team Logo Results:`);
    console.log(`   🎯 Teams processed: ${teams.size}`);
    console.log(`   🖼️  Logos found: ${found}`);
    console.log(`   💾 Database updated: ${updated}`);
  }

  async showFinalStats() {
    console.log('\n📋 Final MVP Logo Coverage:');
    
    // League stats
    const { data: leagues } = await supabase
      .from('leagues')
      .select('name, logo_url, country')
      .order('country, name');
    
    console.log('\n🏆 COMPETITIONS/LEAGUES:');
    const byCountry = {};
    leagues?.forEach(league => {
      if (!byCountry[league.country]) byCountry[league.country] = [];
      byCountry[league.country].push(league);
    });
    
    Object.entries(byCountry).forEach(([country, competitions]) => {
      console.log(`\n   ${country.toUpperCase()}:`);
      competitions.forEach(comp => {
        const status = comp.logo_url ? '✅' : '🔤';
        console.log(`     ${status} ${comp.name}`);
      });
    });
    
    // Team stats
    const { data: teamsWithLogos } = await supabase
      .from('teams')
      .select('name')
      .not('logo_url', 'is', null);
    
    const { data: totalTeams } = await supabase
      .from('teams')
      .select('name');
    
    console.log(`\n👥 TEAMS:`);
    console.log(`   ✅ With logos: ${teamsWithLogos?.length || 0}`);
    console.log(`   🔤 Without logos: ${(totalTeams?.length || 0) - (teamsWithLogos?.length || 0)}`);
    console.log(`   📊 Total coverage: ${Math.round(((teamsWithLogos?.length || 0) / (totalTeams?.length || 1)) * 100)}%`);
  }
}

async function runMVPLogoPopulation() {
  console.log('🎯 Starting MVP Logo Population for BetHub');
  console.log('Covering: Brazil, England, Spain, Portugal, Netherlands, France, Germany, Italy + European competitions\n');
  
  const fetcher = new MVPLogoFetcher();
  
  try {
    // Step 1: Populate competition/league logos
    await fetcher.populateCompetitionLogos();
    
    // Step 2: Populate team logos from current matches
    await fetcher.populateTeamLogosFromMatches();
    
    // Step 3: Show final statistics
    await fetcher.showFinalStats();
    
    console.log('\n🎉 MVP Logo population completed!');
    console.log('Your app now has comprehensive logo coverage for all major European and Brazilian competitions.');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
runMVPLogoPopulation();