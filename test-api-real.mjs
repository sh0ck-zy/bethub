async function testAPIRealData() {
  console.log('🧪 Testing API Real Data...\n');
  
  try {
    // Test 1: Normal API call (should use database)
    console.log('📡 Testing normal API call...');
    const normalResponse = await fetch('http://localhost:3000/api/v1/today');
    const normalData = await normalResponse.json();
    console.log(`✅ Normal API: ${normalData.length} matches`);
    
    // Test 2: Force real data
    console.log('\n📡 Testing real data API call...');
    const realResponse = await fetch('http://localhost:3000/api/v1/today?real=true');
    const realData = await realResponse.json();
    console.log(`✅ Real data API: ${realData.length} matches`);
    
    // Test 3: Disable real data
    console.log('\n📡 Testing disabled real data...');
    const disabledResponse = await fetch('http://localhost:3000/api/v1/today?real=false');
    const disabledData = await disabledResponse.json();
    console.log(`✅ Disabled real data: ${disabledData.length} matches`);
    
    // Compare the results
    console.log('\n📊 Comparison:');
    console.log(`   Normal API: ${normalData.length} matches`);
    console.log(`   Real data API: ${realData.length} matches`);
    console.log(`   Disabled real data: ${disabledData.length} matches`);
    
    if (realData.length === 0) {
      console.log('\n⚠️  Real data API returned 0 matches - this might indicate an issue');
      console.log('   This could be because:');
      console.log('   1. No matches scheduled for today');
      console.log('   2. Service is not working properly');
      console.log('   3. Date filtering is too strict');
    }
    
    // Show sample data structure
    if (realData.length > 0) {
      console.log('\n📋 Sample real data:');
      console.log(JSON.stringify(realData[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testAPIRealData(); 