#!/usr/bin/env node

/**
 * Download essential team and league logos
 * This script downloads logos for major teams to test the logo system
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Essential team logos (from free sources)
const teamLogos = {
  'real-madrid': 'https://assets.stickpng.com/images/584a9b3bb080d7616d298777.png',
  'barcelona': 'https://assets.stickpng.com/images/584a9b53b080d7616d298778.png',
  'liverpool': 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4e8.png',
  'manchester-united': 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4e7.png',
  'arsenal': 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4e6.png',
  'chelsea': 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4e9.png',
  'bayern-munich': 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4ea.png',
  'juventus': 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4eb.png',
  'ac-milan': 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4ec.png',
  'paris-saint-germain': 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4ed.png',
};

// Essential league logos
const leagueLogos = {
  'premier-league': 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4ee.png',
  'la-liga': 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4ef.png',
  'bundesliga': 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4f0.png',
  'serie-a': 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4f1.png',
  'champions-league': 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4f2.png',
};

// Ensure directories exist
const teamDir = path.join(__dirname, 'public', 'logos', 'teams');
const leagueDir = path.join(__dirname, 'public', 'logos', 'leagues');

if (!fs.existsSync(teamDir)) {
  fs.mkdirSync(teamDir, { recursive: true });
}

if (!fs.existsSync(leagueDir)) {
  fs.mkdirSync(leagueDir, { recursive: true });
}

// Download function
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${path.basename(filename)}`);
          resolve();
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Main download function
async function downloadLogos() {
  console.log('🔽 Downloading essential team logos...\n');
  
  try {
    // Download team logos
    for (const [name, url] of Object.entries(teamLogos)) {
      const filename = path.join(teamDir, `${name}.png`);
      if (!fs.existsSync(filename)) {
        await downloadImage(url, filename);
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
      } else {
        console.log(`⏭️  Skipped: ${name}.png (already exists)`);
      }
    }
    
    console.log('\n🔽 Downloading essential league logos...\n');
    
    // Download league logos
    for (const [name, url] of Object.entries(leagueLogos)) {
      const filename = path.join(leagueDir, `${name}.png`);
      if (!fs.existsSync(filename)) {
        await downloadImage(url, filename);
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
      } else {
        console.log(`⏭️  Skipped: ${name}.png (already exists)`);
      }
    }
    
    console.log('\n✅ Logo download completed!');
    console.log(`📁 Team logos: ${teamDir}`);
    console.log(`📁 League logos: ${leagueDir}`);
    
  } catch (error) {
    console.error('❌ Download failed:', error.message);
    console.log('\n💡 You can manually download logos from:');
    console.log('- Team logos: https://www.stickpng.com/cat/sports/football');
    console.log('- League logos: https://www.stickpng.com/cat/sports/football');
  }
}

// Create fallback logos if download fails
function createFallbackLogos() {
  console.log('\n🎨 Creating fallback logo files...');
  
  // Create simple SVG fallbacks
  const teams = ['real-madrid', 'barcelona', 'liverpool', 'manchester-united', 'arsenal'];
  const leagues = ['premier-league', 'la-liga', 'champions-league'];
  
  teams.forEach(team => {
    const filename = path.join(teamDir, `${team}.png`);
    if (!fs.existsSync(filename)) {
      // Create a simple text file that tells us to add the logo
      fs.writeFileSync(
        path.join(teamDir, `${team}.txt`), 
        `Add ${team} logo here as ${team}.png`
      );
    }
  });
  
  leagues.forEach(league => {
    const filename = path.join(leagueDir, `${league}.png`);
    if (!fs.existsSync(filename)) {
      fs.writeFileSync(
        path.join(leagueDir, `${league}.txt`), 
        `Add ${league} logo here as ${league}.png`
      );
    }
  });
  
  console.log('✅ Fallback files created');
}

// Run the download
if (require.main === module) {
  downloadLogos().then(() => {
    createFallbackLogos();
  });
}

module.exports = { downloadLogos, createFallbackLogos };
