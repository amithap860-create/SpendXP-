// Test script for authentication system
const testAuth = async () => {
  console.log('🧪 Starting Authentication System Test');
  
  try {
    // Test 1: Health Check
    console.log('\n📊 Test 1: Health Check');
    const healthResponse = await fetch('http://localhost:3000/api/auth/health');
    const healthData = await healthResponse.json();
    console.log('Health Status:', healthData.status);
    console.log('Overall:', healthData.overall);
    
    // Test 2: Create User
    console.log('\n👤 Test 2: Create User');
    const signupResponse = await fetch('http://localhost:3000/api/auth/signup-fixed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testpassword123',
        displayName: 'Test User',
        age: '16',
        confirmPassword: 'testpassword123'
      })
    });
    const signupData = await signupResponse.json();
    console.log('Signup Success:', signupData.success);
    console.log('Message:', signupData.message);
    
    if (signupData.success && signupData.token) {
      // Test 3: Login User
      console.log('\n🔐 Test 3: Login User');
      const loginResponse = await fetch('http://localhost:3000/api/auth/login-fixed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'testpassword123'
        })
      });
      const loginData = await loginResponse.json();
      console.log('Login Success:', loginData.success);
      console.log('Message:', loginData.message);
      
      if (loginData.success && loginData.token) {
        // Test 4: Access Protected Route
        console.log('\n🛡️ Test 4: Access Protected Route');
        const profileResponse = await fetch('http://localhost:3000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        const profileData = await profileResponse.json();
        console.log('Profile Access Success:', profileData.success);
        console.log('User Email:', profileData.user?.email);
      }
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run tests
testAuth();
