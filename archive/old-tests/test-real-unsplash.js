// Teste da API Real do Unsplash
console.log('🌐 Testando API Real do Unsplash\n');

// Verificar se a chave está configurada
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'demo_key') {
  console.log('❌ CHAVE DO UNSPLASH NÃO CONFIGURADA!');
  console.log('');
  console.log('📋 PASSO A PASSO:');
  console.log('');
  console.log('1. 🌐 Acesse: https://unsplash.com/developers');
  console.log('2. 📝 Registre-se como desenvolvedor');
  console.log('3. 🆕 Crie uma nova aplicação');
  console.log('4. 🔑 Copie a Access Key');
  console.log('5. ⚙️  Adicione ao arquivo .env.local:');
  console.log('   UNSPLASH_ACCESS_KEY=sua_chave_aqui');
  console.log('6. 🔄 Reinicie o servidor');
  console.log('');
  console.log('💡 A chave deve ter algo como: abc123def456ghi789...');
  console.log('');
  process.exit(1);
}

console.log('✅ Chave do Unsplash configurada!');
console.log(`🔑 Chave: ${UNSPLASH_ACCESS_KEY.substring(0, 10)}...`);

// Função para testar a API real
async function testRealUnsplashAPI() {
  try {
    console.log('\n🔍 Testando busca real no Unsplash...');
    
    const query = 'santos fc vila belmiro';
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`;
    
    console.log(`🌐 URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro da API: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ API respondendo corretamente!');
    console.log(`📊 Total de resultados: ${data.total}`);
    console.log(`📸 Resultados retornados: ${data.results.length}`);
    
    if (data.results.length > 0) {
      console.log('\n🖼️  Primeiras imagens encontradas:');
      data.results.slice(0, 3).forEach((image, index) => {
        console.log(`   ${index + 1}. ${image.alt_description || 'Sem descrição'}`);
        console.log(`      👤 Fotógrafo: ${image.user?.name || 'N/A'}`);
        console.log(`      🔗 URL: ${image.urls.regular.substring(0, 50)}...`);
        console.log(`      📏 Dimensões: ${image.width}x${image.height}`);
      });
    }
    
    console.log('\n🎯 RESULTADO:');
    console.log('   ✅ API do Unsplash funcionando!');
    console.log('   ✅ Imagens reais sendo buscadas!');
    console.log('   ✅ Carousel com fotos autênticas!');
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('   1. Reiniciar o servidor Next.js');
    console.log('   2. Acessar http://localhost:3001');
    console.log('   3. Ver o carousel com imagens reais!');
    
  } catch (error) {
    console.log('❌ ERRO ao testar API:');
    console.log(`   ${error.message}`);
    
    if (error.message.includes('401')) {
      console.log('\n💡 SOLUÇÃO:');
      console.log('   - Verificar se a chave está correta');
      console.log('   - Verificar se a aplicação está ativa');
      console.log('   - Aguardar alguns minutos após criar a aplicação');
    }
  }
}

// Executar teste
testRealUnsplashAPI(); 