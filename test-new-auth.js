const testAuth = async () => {
  console.log('🧪 Testing New Authentication System');
  
  try {
    // Test 1: Health Check
    console.log('\n📊 Test 1: Health Check');
    const healthResponse = await fetch('http://localhost:9002/api/auth/health');
    const healthData = await healthResponse.json();
    console.log('Health Status:', healthData.status);
    console.log('Service:', healthData.service);
    
    if (healthData.status !== 'OK') {
      throw new Error('Health check failed');
    }

    // Test 2: Signup
    console.log('\n👤 Test 2: User Signup');
    const signupData = {
      email: 'testuser@example.com',
      age: 25,
      password: 'test123',
      confirmPassword: 'test123'
    };

    const signupResponse = await fetch('http://localhost:9002/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });

    const signupResult = await signupResponse.json();
    console.log('Signup Status:', signupResponse.status);
    console.log('Signup Result:', signupResult);

    if (!signupResult.success) {
      throw new Error('Signup failed');
    }

    const token = signupResult.token;
    console.log('Generated Token:', token.substring(0, 20) + '...');

    // Test 3: Login
    console.log('\n🔐 Test 3: User Login');
    const loginData = {
      email: 'testuser@example.com',
      password: 'test123'
    };

    const loginResponse = await fetch('http://localhost:9002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginResponse.json();
    console.log('Login Status:', loginResponse.status);
    console.log('Login Result:', loginResult);

    if (!loginResult.success) {
      throw new Error('Login failed');
    }

    // Test 4: Protected Route
    console.log('\n🛡️ Test 4: Protected Profile Route');
    const profileResponse = await fetch('http://localhost:9002/api/profile', {
      headers: { 
        'Authorization': `Bearer ${loginResult.token}`
      }
    });

    const profileResult = await profileResponse.json();
    console.log('Profile Status:', profileResponse.status);
    console.log('Profile Result:', profileResult);

    if (!profileResult.success) {
      throw new Error('Profile access failed');
    }

    console.log('\n✅ All tests passed! New auth system is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
};

testAuth();
