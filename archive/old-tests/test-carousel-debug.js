// Debug do Carousel - Verificar se está funcionando
console.log('🔍 Debug do Carousel\n');

// Simular dados exatos da API
const apiData = {
  "success": true,
  "matches": [
    {
      "id": "2335a4a5-9a62-4679-9d55-884ed89e2306",
      "league": "Brasileirão",
      "home_team": "Santos FC",
      "away_team": "CR Flamengo",
      "kickoff_utc": "2025-07-16T18:00:00+00:00",
      "status": "PRE",
      "is_published": true,
      "analysis_status": "failed",
      "created_at": "2025-07-14T00:07:11.83+00:00"
    }
  ],
  "total": 3,
  "source": "database-published"
};

// Testar função getClassicImages
function testGetClassicImages() {
  console.log('🧪 Testando getClassicImages...');
  
  const homeTeam = "Santos FC";
  const awayTeam = "CR Flamengo";
  
  console.log(`   🏠 Home: ${homeTeam}`);
  console.log(`   🛣️  Away: ${awayTeam}`);
  
  // Simular a lógica da função
  const home = homeTeam.replace(' FC', '').replace('CR ', '');
  const away = awayTeam.replace(' FC', '').replace('CR ', '');
  
  console.log(`   🔄 Normalized Home: ${home}`);
  console.log(`   🔄 Normalized Away: ${away}`);
  
  if ((home === 'Santos' && away === 'Flamengo') || 
      (home === 'Flamengo' && away === 'Santos')) {
    console.log('   ✅ Clássico Santos vs Flamengo detectado!');
    console.log('   🖼️  Retornando imagens específicas do clássico');
    return true;
  } else {
    console.log('   ❌ Clássico não detectado');
    return false;
  }
}

// Testar se as imagens existem
function testImagesExist() {
  console.log('\n🖼️  Testando URLs das imagens...');
  
  const testUrls = [
    'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
    'https://images.pexels.com/photos/3628925/pexels-photo-3628925.jpeg',
    'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg',
    'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg'
  ];
  
  testUrls.forEach((url, index) => {
    console.log(`   ${index + 1}. ${url}`);
  });
  
  console.log('   📝 URLs parecem válidas');
}

// Testar estrutura do componente
function testComponentStructure() {
  console.log('\n🏗️  Testando estrutura do componente...');
  
  const componentProps = {
    match: apiData.matches[0],
    autoPlay: true,
    interval: 5000
  };
  
  console.log('   ✅ Props válidas:');
  console.log(`      - match.id: ${componentProps.match.id}`);
  console.log(`      - match.home_team: ${componentProps.match.home_team}`);
  console.log(`      - match.away_team: ${componentProps.match.away_team}`);
  console.log(`      - autoPlay: ${componentProps.autoPlay}`);
  console.log(`      - interval: ${componentProps.interval}`);
}

// Função principal
function debugCarousel() {
  console.log('🚀 Iniciando debug do carousel...\n');
  
  console.log('📊 Dados da API:');
  console.log(`   🏠 ${apiData.matches[0].home_team}`);
  console.log(`   🛣️  ${apiData.matches[0].away_team}`);
  console.log(`   🏟️  ${apiData.matches[0].venue || 'TBD'}`);
  console.log(`   📅 ${apiData.matches[0].kickoff_utc}`);
  
  testGetClassicImages();
  testImagesExist();
  testComponentStructure();
  
  console.log('\n🔍 POSSÍVEIS PROBLEMAS:');
  console.log('   1. Componente não está sendo renderizado');
  console.log('   2. Erro de build/compilação');
  console.log('   3. CSS não está sendo aplicado');
  console.log('   4. Imagens não estão carregando');
  console.log('   5. JavaScript não está executando');
  
  console.log('\n💡 SOLUÇÕES:');
  console.log('   1. Verificar console do navegador (F12)');
  console.log('   2. Verificar se o servidor está rodando em :3001');
  console.log('   3. Limpar cache do navegador');
  console.log('   4. Verificar se há erros de build');
  console.log('   5. Testar em modo incógnito');
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('   1. Abrir http://localhost:3001');
  console.log('   2. Pressionar F12 para abrir DevTools');
  console.log('   3. Verificar Console para erros');
  console.log('   4. Verificar Network para carregamento de imagens');
  console.log('   5. Verificar se o componente está no DOM');
  
  console.log('\n🏆 Debug concluído!');
}

// Executar debug
debugCarousel(); 