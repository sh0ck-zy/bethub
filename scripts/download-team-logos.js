#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { JSDOM } = require('jsdom');

// Configurações
const OUTPUT_DIR = './public/logos';
const TEMP_DIR = './temp/logos';
const LEAGUES = {
  'premier-league': {
    name: 'Premier League',
    country: 'england',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Premier_League',
    teamsSelector: 'table.wikitable tbody tr',
    teamNameIndex: 0, // índice da coluna com o nome da equipa
  },
  'la-liga': {
    name: 'La Liga',
    country: 'spain',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/La_Liga',
    teamsSelector: 'table.wikitable tbody tr',
    teamNameIndex: 0,
  },
  'bundesliga': {
    name: 'Bundesliga',
    country: 'germany',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Bundesliga',
    teamsSelector: 'table.wikitable tbody tr',
    teamNameIndex: 0,
  },
  'serie-a': {
    name: 'Serie A',
    country: 'italy',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Serie_A',
    teamsSelector: 'table.wikitable tbody tr',
    teamNameIndex: 0,
  },
  'ligue-1': {
    name: 'Ligue 1',
    country: 'france',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Ligue_1',
    teamsSelector: 'table.wikitable tbody tr',
    teamNameIndex: 0,
  },
  'brasileiro': {
    name: 'Campeonato Brasileiro',
    country: 'brazil',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Campeonato_Brasileiro_S%C3%A9rie_A',
    teamsSelector: 'table.wikitable tbody tr',
    teamNameIndex: 0,
  },
  'champions-league': {
    name: 'Champions League',
    country: 'europe',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/2024%E2%80%9325_UEFA_Champions_League',
    teamsSelector: 'table.wikitable tbody tr',
    teamNameIndex: 0,
  }
};

// Função para criar diretórios se não existirem
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Função para fazer requisições HTTP
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        if (response.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        }
      });
    }).on('error', reject);
  });
}

// Função para download de arquivos
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        file.close();
        fs.unlink(filePath, () => {}); // Remove arquivo parcial
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Função para extrair SVG da página do Wikipedia da equipa
async function getTeamSvgFromWikipedia(teamName) {
  try {
    const searchUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(teamName.replace(/\s+/g, '_'))}`;
    console.log(`Procurando SVG para ${teamName} em: ${searchUrl}`);
    
    const html = await fetchUrl(searchUrl);
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Procurar por imagens SVG na infobox
    const infobox = document.querySelector('.infobox');
    if (infobox) {
      const svgLinks = infobox.querySelectorAll('a[href*=".svg"]');
      for (const link of svgLinks) {
        const href = link.getAttribute('href');
        if (href && href.includes('.svg')) {
          const fullUrl = href.startsWith('//') ? `https:${href}` : 
                         href.startsWith('/') ? `https://en.wikipedia.org${href}` : href;
          return fullUrl;
        }
      }
      
      // Procurar por imagens com "logo" ou "crest" no alt text
      const images = infobox.querySelectorAll('img');
      for (const img of images) {
        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt') || '';
        if (src && src.includes('.svg') && 
            (alt.toLowerCase().includes('logo') || 
             alt.toLowerCase().includes('crest') || 
             alt.toLowerCase().includes('badge'))) {
          return src.startsWith('//') ? `https:${src}` : src;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao buscar SVG para ${teamName}:`, error.message);
    return null;
  }
}

// Função para normalizar o nome da equipa para nome de arquivo
function normalizeTeamName(teamName) {
  return teamName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Função para extrair equipas de uma página do Wikipedia
async function extractTeamsFromLeague(leagueKey, leagueConfig) {
  try {
    console.log(`Extraindo equipas da ${leagueConfig.name}...`);
    
    const html = await fetchUrl(leagueConfig.wikipediaUrl);
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const teams = [];
    const rows = document.querySelectorAll(leagueConfig.teamsSelector);
    
    for (const row of rows) {
      const cells = row.querySelectorAll('td, th');
      if (cells.length > leagueConfig.teamNameIndex) {
        const teamCell = cells[leagueConfig.teamNameIndex];
        const teamName = teamCell.textContent.trim();
        
        // Filtrar linhas que não são equipas
        if (teamName && 
            teamName.length > 2 && 
            !teamName.includes('Position') && 
            !teamName.includes('Team') && 
            !teamName.includes('Club') &&
            !teamName.match(/^\d+$/)) {
          
          // Limpar o nome da equipa
          const cleanName = teamName
            .replace(/\[.*?\]/g, '') // Remove referências
            .replace(/\(.*?\)/g, '') // Remove parênteses
            .trim();
          
          if (cleanName) {
            teams.push({
              name: cleanName,
              league: leagueKey,
              country: leagueConfig.country,
              normalizedName: normalizeTeamName(cleanName)
            });
          }
        }
      }
    }
    
    console.log(`Encontradas ${teams.length} equipas na ${leagueConfig.name}`);
    return teams;
  } catch (error) {
    console.error(`Erro ao extrair equipas da ${leagueConfig.name}:`, error.message);
    return [];
  }
}

// Função principal para fazer download dos logos
async function downloadTeamLogos() {
  console.log('Iniciando download automático de logos das equipas...\n');
  
  // Criar diretórios
  ensureDirectoryExists(OUTPUT_DIR);
  ensureDirectoryExists(TEMP_DIR);
  
  const allTeams = [];
  const downloadResults = [];
  
  // Extrair equipas de todas as ligas
  for (const [leagueKey, leagueConfig] of Object.entries(LEAGUES)) {
    const teams = await extractTeamsFromLeague(leagueKey, leagueConfig);
    allTeams.push(...teams);
    
    // Pequena pausa entre ligas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\nTotal de equipas encontradas: ${allTeams.length}\n`);
  
  // Fazer download dos SVGs
  for (const team of allTeams) {
    try {
      console.log(`Processando: ${team.name} (${team.league})`);
      
      const svgUrl = await getTeamSvgFromWikipedia(team.name);
      if (svgUrl) {
        // Criar pasta para a liga se não existir
        const leagueDir = path.join(OUTPUT_DIR, team.league);
        ensureDirectoryExists(leagueDir);
        
        const fileName = `${team.normalizedName}.svg`;
        const filePath = path.join(leagueDir, fileName);
        
        await downloadFile(svgUrl, filePath);
        
        downloadResults.push({
          team: team.name,
          league: team.league,
          country: team.country,
          fileName: fileName,
          filePath: filePath,
          svgUrl: svgUrl,
          success: true
        });
        
        console.log(`✓ Download concluído: ${fileName}`);
      } else {
        console.log(`✗ SVG não encontrado para: ${team.name}`);
        downloadResults.push({
          team: team.name,
          league: team.league,
          country: team.country,
          success: false,
          error: 'SVG não encontrado'
        });
      }
      
      // Pausa entre downloads para não sobrecarregar o servidor
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Erro ao processar ${team.name}:`, error.message);
      downloadResults.push({
        team: team.name,
        league: team.league,
        country: team.country,
        success: false,
        error: error.message
      });
    }
  }
  
  // Gerar relatório
  const successful = downloadResults.filter(r => r.success);
  const failed = downloadResults.filter(r => !r.success);
  
  console.log('\n=== RELATÓRIO DE DOWNLOAD ===');
  console.log(`Downloads bem-sucedidos: ${successful.length}`);
  console.log(`Downloads falhados: ${failed.length}`);
  console.log(`Total processado: ${downloadResults.length}`);
  
  // Salvar relatório detalhado
  const reportPath = path.join(OUTPUT_DIR, 'download-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      successful: successful.length,
      failed: failed.length,
      total: downloadResults.length
    },
    results: downloadResults
  }, null, 2));
  
  console.log(`\nRelatório detalhado salvo em: ${reportPath}`);
  
  // Gerar arquivo TypeScript atualizado
  generateTeamsTypeScript(successful);
  
  console.log('\n✓ Download automático concluído!');
}

// Função para gerar arquivo TypeScript atualizado
function generateTeamsTypeScript(successfulDownloads) {
  const teamsConfig = {};
  
  successfulDownloads.forEach(download => {
    const teamKey = download.team;
    const slug = download.fileName.replace('.svg', '');
    const logoPath = `/logos/${download.league}/${download.fileName}`;
    
    teamsConfig[teamKey] = {
      slug: slug,
      league: download.league,
      country: download.country,
      logo: logoPath,
      primary: '#64748b' // Cor padrão - pode ser customizada depois
    };
  });
  
  const tsContent = `// Auto-generated file - Do not edit manually
// Generated on: ${new Date().toISOString()}

export const TEAMS = ${JSON.stringify(teamsConfig, null, 2)} as const;

export type TeamName = keyof typeof TEAMS;

export type TeamData = {
  slug: string;
  league: string;
  country: string;
  logo: string;
  primary: string;
};
`;
  
  const tsPath = path.join(OUTPUT_DIR, 'teams-generated.ts');
  fs.writeFileSync(tsPath, tsContent);
  
  console.log(`Arquivo TypeScript gerado em: ${tsPath}`);
}

// Executar se chamado diretamente
if (require.main === module) {
  downloadTeamLogos().catch(console.error);
}

module.exports = { downloadTeamLogos, LEAGUES };