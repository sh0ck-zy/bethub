#!/usr/bin/env node
/**
 * BetHub Match Population Script
 * Adds real match data from external APIs and creates test data for today
 * Run with: node populate_matches.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}🚀 ${msg}${colors.reset}\n`),
};

class MatchPopulator {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async checkConnection() {
    log.info('Testing database connection...');
    
    try {
      const { data, error } = await this.supabase
        .from('matches')
        .select('count', { count: 'exact', head: true });
      
      if (error) throw error;
      
      log.success('Database connection successful');
      return true;
    } catch (error) {
      log.error(`Database connection failed: ${error.message}`);
      return false;
    }
  }

  async fetchExternalMatches() {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;
    if (!apiKey) {
      log.warn('No FOOTBALL_DATA_API_KEY found, skipping external API');
      return [];
    }

    log.info('Fetching matches from Football-Data.org...');
    
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dateFrom = today.toISOString().split('T')[0];
      const dateTo = tomorrow.toISOString().split('T')[0];
      
      const competitions = ['PL', 'PD', 'BL1', 'SA', 'FL1', 'CL', 'EC'];
      const allMatches = [];
      
      for (const competition of competitions) {
        try {
          const url = `https://api.football-data.org/v4/competitions/${competition}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
          
          const response = await fetch(url, {
            headers: {
              'X-Auth-Token': apiKey
            }
          });
          
          if (!response.ok) {
            log.warn(`Failed to fetch ${competition}: ${response.status} ${response.statusText}`);
            continue;
          }
          
          const data = await response.json();
          
          if (data.matches && data.matches.length > 0) {
            log.success(`Found ${data.matches.length} matches for ${competition}`);
            allMatches.push(...data.matches);
          }
          
          // Rate limiting - Football-data.org allows 10 requests per minute
          await new Promise(resolve => setTimeout(resolve, 6000));
          
        } catch (error) {
          log.warn(`Error fetching ${competition}: ${error.message}`);
        }
      }
      
      log.info(`Total external matches found: ${allMatches.length}`);
      return allMatches;
      
    } catch (error) {
      log.error(`External API error: ${error.message}`);
      return [];
    }
  }

  transformMatch(match, source = 'football-data') {
    const now = new Date().toISOString();
    
    return {
      external_id: match.id?.toString() || Math.random().toString(),
      data_source: source,
      league: match.competition?.name || 'Unknown League',
      home_team: match.homeTeam?.name || match.homeTeam?.shortName || 'TBD',
      away_team: match.awayTeam?.name || match.awayTeam?.shortName || 'TBD',
      home_team_id: match.homeTeam?.id?.toString() || null,
      away_team_id: match.awayTeam?.id?.toString() || null,
      league_id: match.competition?.id?.toString() || null,
      kickoff_utc: match.utcDate || now,
      venue: match.venue || null,
      status: this.mapStatus(match.status),
      home_score: match.score?.fullTime?.home || null,
      away_score: match.score?.fullTime?.away || null,
      current_minute: match.minute || null,
      is_published: true, // Make matches visible by default
      is_pulled: true,
      is_analyzed: false,
      analysis_status: 'none',
      analysis_priority: 'normal',
      created_at: now,
      updated_at: now,
      created_by: 'populate-script'
    };
  }

  mapStatus(status) {
    const statusMap = {
      'SCHEDULED': 'PRE',
      'TIMED': 'PRE',
      'IN_PLAY': 'LIVE',
      'PAUSED': 'LIVE',
      'FINISHED': 'FT',
      'AWARDED': 'FT',
      'POSTPONED': 'POSTPONED',
      'CANCELLED': 'POSTPONED',
      'SUSPENDED': 'POSTPONED'
    };
    
    return statusMap[status] || 'PRE';
  }

  generateTodayMatches() {
    log.info('Generating sample matches for today...');
    
    const today = new Date();
    const matches = [];
    
    const sampleMatches = [
      {
        league: 'Premier League',
        home_team: 'Manchester United FC',
        away_team: 'Liverpool FC',
        kickoff_offset: 2 // hours from now
      },
      {
        league: 'Premier League', 
        home_team: 'Chelsea FC',
        away_team: 'Arsenal FC',
        kickoff_offset: 4
      },
      {
        league: 'La Liga',
        home_team: 'Real Madrid CF',
        away_team: 'FC Barcelona',
        kickoff_offset: 6
      },
      {
        league: 'Bundesliga',
        home_team: 'FC Bayern München',
        away_team: 'Borussia Dortmund',
        kickoff_offset: 8
      },
      {
        league: 'Serie A',
        home_team: 'Juventus FC',
        away_team: 'AC Milan',
        kickoff_offset: 10
      },
      {
        league: 'Ligue 1',
        home_team: 'Paris Saint-Germain FC',
        away_team: 'Olympique de Marseille',
        kickoff_offset: 12
      }
    ];
    
    sampleMatches.forEach((match, index) => {
      const kickoffTime = new Date(today.getTime() + (match.kickoff_offset * 60 * 60 * 1000));
      
      matches.push({
        external_id: `sample-${Date.now()}-${index}`,
        data_source: 'football-data',
        league: match.league,
        home_team: match.home_team,
        away_team: match.away_team,
        home_team_id: `${1000 + index}`,
        away_team_id: `${2000 + index}`,
        league_id: `${100 + Math.floor(index / 2)}`,
        kickoff_utc: kickoffTime.toISOString(),
        venue: 'Stadium',
        status: kickoffTime > today ? 'PRE' : (Math.random() > 0.5 ? 'LIVE' : 'FT'),
        home_score: kickoffTime <= today ? Math.floor(Math.random() * 4) : null,
        away_score: kickoffTime <= today ? Math.floor(Math.random() * 4) : null,
        current_minute: kickoffTime <= today && kickoffTime > new Date(today.getTime() - 90 * 60 * 1000) ? 
          Math.floor(Math.random() * 90) + 1 : null,
        is_published: true,
        is_pulled: true,
        is_analyzed: Math.random() > 0.7, // 30% chance of being analyzed
        analysis_status: Math.random() > 0.7 ? 'completed' : 'none',
        analysis_priority: 'high',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'populate-script'
      });
    });
    
    log.success(`Generated ${matches.length} sample matches for today`);
    return matches;
  }

  async upsertMatches(matches) {
    if (matches.length === 0) {
      log.warn('No matches to upsert');
      return { created: 0, updated: 0 };
    }
    
    log.info(`Upserting ${matches.length} matches to database...`);
    
    try {
      const { data, error } = await this.supabase
        .from('matches')
        .upsert(matches, {
          onConflict: 'external_id,data_source',
          ignoreDuplicates: false
        })
        .select('id, external_id, home_team, away_team, league');
      
      if (error) {
        throw error;
      }
      
      log.success(`Successfully upserted ${data?.length || 0} matches`);
      
      // Show sample of what was added
      if (data && data.length > 0) {
        log.info('Sample of upserted matches:');
        data.slice(0, 3).forEach((match, i) => {
          console.log(`  ${i + 1}. ${match.home_team} vs ${match.away_team} (${match.league})`);
        });
        if (data.length > 3) {
          console.log(`  ... and ${data.length - 3} more`);
        }
      }
      
      return { created: data?.length || 0, updated: 0 };
      
    } catch (error) {
      log.error(`Database upsert error: ${error.message}`);
      throw error;
    }
  }

  async clearOldMatches() {
    log.info('Clearing old generated matches...');
    
    try {
      const { data, error } = await this.supabase
        .from('matches')
        .delete()
        .eq('created_by', 'populate-script');
      
      if (error) {
        log.warn(`Could not clear old matches: ${error.message}`);
      } else {
        log.success(`Cleared old generated matches`);
      }
    } catch (error) {
      log.warn(`Error clearing old matches: ${error.message}`);
    }
  }

  async getMatchStats() {
    log.info('Getting match statistics...');
    
    try {
      const { data: stats, error } = await this.supabase
        .from('matches')
        .select('league, status, is_published, data_source')
        .order('kickoff_utc', { ascending: false });
      
      if (error) throw error;
      
      if (!stats || stats.length === 0) {
        log.warn('No matches found in database');
        return;
      }
      
      const summary = {
        total: stats.length,
        byStatus: {},
        byLeague: {},
        bySource: {},
        published: stats.filter(m => m.is_published).length
      };
      
      stats.forEach(match => {
        summary.byStatus[match.status] = (summary.byStatus[match.status] || 0) + 1;
        summary.byLeague[match.league] = (summary.byLeague[match.league] || 0) + 1;
        summary.bySource[match.created_by || match.data_source] = (summary.bySource[match.created_by || match.data_source] || 0) + 1;
      });
      
      log.header('Match Statistics');
      log.info(`Total matches: ${summary.total}`);
      log.info(`Published matches: ${summary.published}`);
      
      console.log('\nBy Status:');
      Object.entries(summary.byStatus).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
      
      console.log('\nBy League:');
      Object.entries(summary.byLeague)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([league, count]) => {
          console.log(`  ${league}: ${count}`);
        });
      
      console.log('\nBy Source:');
      Object.entries(summary.bySource).forEach(([source, count]) => {
        console.log(`  ${source}: ${count}`);
      });
      
    } catch (error) {
      log.error(`Error getting stats: ${error.message}`);
    }
  }

  async run() {
    log.header('BetHub Match Population Script');
    
    // Check database connection
    const connected = await this.checkConnection();
    if (!connected) {
      log.error('Cannot proceed without database connection');
      process.exit(1);
    }
    
    try {
      // Clear old generated matches
      await this.clearOldMatches();
      
      // Fetch real matches from external APIs
      const externalMatches = await this.fetchExternalMatches();
      
      // Transform external matches
      const transformedExternal = externalMatches.map(match => this.transformMatch(match));
      
      // Generate today's sample matches
      const todayMatches = this.generateTodayMatches();
      
      // Combine all matches
      const allMatches = [...transformedExternal, ...todayMatches];
      
      if (allMatches.length === 0) {
        log.warn('No matches to populate');
        return;
      }
      
      // Upsert to database
      await this.upsertMatches(allMatches);
      
      // Show final statistics
      await this.getMatchStats();
      
      log.header('Population Complete');
      log.success('Database has been populated with match data!');
      log.info('You can now test the APIs:');
      console.log('  • Admin matches: curl http://localhost:3000/api/v1/admin/matches');
      console.log('  • Today matches: curl http://localhost:3000/api/v1/today');
      console.log('  • Debug script: node api_debug_script.js');
      
    } catch (error) {
      log.error(`Population failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const populator = new MatchPopulator();
  populator.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = MatchPopulator;