#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Essential team logos to download
const ESSENTIAL_LOGOS = {
  // Premier League
  'arsenal': 'https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png',
  'chelsea': 'https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png',
  'liverpool': 'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png',
  'manchester-united': 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
  'manchester-city': 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png',
  'tottenham': 'https://logos-world.net/wp-content/uploads/2020/06/Tottenham-Logo.png',
  
  // La Liga
  'real-madrid': 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png',
  'barcelona': 'https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png',
  'atletico-madrid': 'https://logos-world.net/wp-content/uploads/2020/06/Atletico-Madrid-Logo.png',
  
  // Serie A
  'juventus': 'https://logos-world.net/wp-content/uploads/2020/06/Juventus-Logo.png',
  'ac-milan': 'https://logos-world.net/wp-content/uploads/2020/06/AC-Milan-Logo.png',
  'inter-milan': 'https://logos-world.net/wp-content/uploads/2020/06/Inter-Milan-Logo.png',
  
  // Bundesliga
  'bayern-munich': 'https://logos-world.net/wp-content/uploads/2020/06/Bayern-Munich-Logo.png',
  'borussia-dortmund': 'https://logos-world.net/wp-content/uploads/2020/06/Borussia-Dortmund-Logo.png',
  
  // Ligue 1
  'psg': 'https://logos-world.net/wp-content/uploads/2020/06/PSG-Logo.png'
};

const LEAGUE_LOGOS = {
  'premier-league': 'https://logos-world.net/wp-content/uploads/2020/06/Premier-League-Logo.png',
  'la-liga': 'https://logos-world.net/wp-content/uploads/2020/06/LaLiga-Logo.png',
  'serie-a': 'https://logos-world.net/wp-content/uploads/2020/06/Serie-A-Logo.png',
  'bundesliga': 'https://logos-world.net/wp-content/uploads/2020/06/Bundesliga-Logo.png',
  'ligue-1': 'https://logos-world.net/wp-content/uploads/2020/06/Ligue-1-Logo.png',
  'champions-league': 'https://logos-world.net/wp-content/uploads/2020/06/UEFA-Champions-League-Logo.png',
  'europa-league': 'https://logos-world.net/wp-content/uploads/2020/06/UEFA-Europa-League-Logo.png'
};

const BETTING_LOGOS = {
  'bet365': 'https://logos-world.net/wp-content/uploads/2021/02/Bet365-Logo.png',
  'betfair': 'https://logos-world.net/wp-content/uploads/2021/02/Betfair-Logo.png',
  'william-hill': 'https://logos-world.net/wp-content/uploads/2021/02/William-Hill-Logo.png',
  'ladbrokes': 'https://logos-world.net/wp-content/uploads/2021/02/Ladbrokes-Logo.png',
  'paddy-power': 'https://logos-world.net/wp-content/uploads/2021/02/Paddy-Power-Logo.png',
  'unibet': 'https://logos-world.net/wp-content/uploads/2021/02/Unibet-Logo.png'
};

// Ensure directories exist
const publicDir = path.join(__dirname, '..', 'public', 'logos');
const teamsDir = path.join(publicDir, 'teams');
const leaguesDir = path.join(publicDir, 'leagues');
const bettingDir = path.join(publicDir, 'bookmakers');

[publicDir, teamsDir, leaguesDir, bettingDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${path.basename(filepath)}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete incomplete file
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadLogos() {
  console.log('🔽 Downloading essential team logos...');
  
  // Download team logos
  for (const [name, url] of Object.entries(ESSENTIAL_LOGOS)) {
    const filepath = path.join(teamsDir, `${name}.png`);
    try {
      await downloadImage(url, filepath);
    } catch (error) {
      console.error(`❌ Failed to download ${name}:`, error.message);
    }
  }
  
  console.log('🔽 Downloading league logos...');
  
  // Download league logos
  for (const [name, url] of Object.entries(LEAGUE_LOGOS)) {
    const filepath = path.join(leaguesDir, `${name}.png`);
    try {
      await downloadImage(url, filepath);
    } catch (error) {
      console.error(`❌ Failed to download ${name}:`, error.message);
    }
  }
  
  console.log('🔽 Downloading betting site logos...');
  
  // Download betting site logos
  for (const [name, url] of Object.entries(BETTING_LOGOS)) {
    const filepath = path.join(bettingDir, `${name}.png`);
    try {
      await downloadImage(url, filepath);
    } catch (error) {
      console.error(`❌ Failed to download ${name}:`, error.message);
    }
  }
  
  console.log('✅ Logo download completed!');
  
  // Clean up old .txt files
  console.log('🧹 Cleaning up .txt files...');
  
  [teamsDir, leaguesDir, bettingDir].forEach(dir => {
    fs.readdirSync(dir).forEach(file => {
      if (file.endsWith('.txt')) {
        fs.unlinkSync(path.join(dir, file));
        console.log(`🗑️ Removed: ${file}`);
      }
    });
  });
  
  console.log('🎉 All done!');
}

downloadLogos().catch(console.error);