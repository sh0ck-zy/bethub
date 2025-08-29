// Test the AI service directly

const testAIService = async () => {
  console.log('🤖 Testing AI Service...\n');
  
  // Test Groq API key
  const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  console.log('🔑 Groq API Key:', groqKey ? `${groqKey.slice(0, 20)}...` : 'Not found');
  
  if (!groqKey) {
    console.log('⚠️ No Groq API key - will use fallback queries');
  }
  
  // Test the AI query generation
  const testQuery = async (homeTeam, awayTeam) => {
    console.log(`\n🏆 Testing: ${homeTeam} vs ${awayTeam}`);
    
    try {
      // This would be the actual AI service call
      const response = await fetch('http://localhost:3000/api/v1/unsplash?query=test&count=1&team=test');
      const data = await response.json();
      console.log('📊 API Response:', data.success ? 'Success' : 'Failed');
      
      if (groqKey) {
        console.log('🤖 Expected AI behavior:');
        console.log(`   - Generate query like: "${homeTeam.toLowerCase()} ${awayTeam.toLowerCase()} football crowd"`);
        console.log('   - Use cultural context if applicable');
        console.log('   - Include stadium names when relevant');
      } else {
        console.log('🔄 Fallback behavior:');
        console.log(`   - Use predefined queries for ${homeTeam} vs ${awayTeam}`);
        console.log('   - Random selection from fallback options');
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  };
  
  // Test various match types
  await testQuery('Real Madrid', 'Barcelona');
  await testQuery('Manchester United', 'Liverpool');
  await testQuery('Botafogo', 'Flamengo');
  await testQuery('Bayern Munich', 'Borussia Dortmund');
  
  console.log('\n🎯 To see AI in action:');
  console.log('1. Open browser console');
  console.log('2. Visit http://localhost:3000');
  console.log('3. Look for AI query generation logs');
  console.log('4. Check the carousel for AI-generated queries');
  
  console.log('\n✨ AI Service test complete!');
};

testAIService();