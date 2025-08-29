const fs = require('fs');
const path = require('path');
const https = require('https');

// Logo sources (you'll need to find actual URLs)
const TEAM_LOGOS = {
  'Botafogo FR': 'https://example.com/botafogo.png',
  'CR Flamengo': 'https://example.com/flamengo.png',
  'SE Palmeiras': 'https://example.com/palmeiras.png',
  'Santos FC': 'https://example.com/santos.png',
  'EC Vitória': 'https://example.com/vitoria.png',
  'Mirassol FC': 'https://example.com/mirassol.png',
};

const LEAGUE_LOGOS = {
  'Premier League': 'https://example.com/premier-league.png',
  'La Liga': 'https://example.com/la-liga.png',
  'Bundesliga': 'https://example.com/bundesliga.png',
  'Serie A': 'https://example.com/serie-a.png',
};

async function downloadLogo(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {}); // Delete file on error
      reject(err);
    });
  });
}

async function downloadAllLogos() {
  // Create directories
  const teamsDir = path.join(__dirname, '../public/logos/teams');
  const leaguesDir = path.join(__dirname, '../public/logos/leagues');
  
  if (!fs.existsSync(teamsDir)) fs.mkdirSync(teamsDir, { recursive: true });
  if (!fs.existsSync(leaguesDir)) fs.mkdirSync(leaguesDir, { recursive: true });

  // Download team logos
  for (const [teamName, url] of Object.entries(TEAM_LOGOS)) {
    const filename = path.join(teamsDir, `${teamName.toLowerCase().replace(/\s+/g, '-')}.png`);
    try {
      await downloadLogo(url, filename);
    } catch (error) {
      console.error(`❌ Failed to download ${teamName}:`, error.message);
    }
  }

  // Download league logos
  for (const [leagueName, url] of Object.entries(LEAGUE_LOGOS)) {
    const filename = path.join(leaguesDir, `${leagueName.toLowerCase().replace(/\s+/g, '-')}.png`);
    try {
      await downloadLogo(url, filename);
    } catch (error) {
      console.error(`❌ Failed to download ${leagueName}:`, error.message);
    }
  }

  console.log('🎉 Logo download complete!');
}

// Run the script
downloadAllLogos().catch(console.error);