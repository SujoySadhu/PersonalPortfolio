const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // Determine a dummy file path (any file works, even this script)
    const filePath = __filename;
    
    // Create FormData manually using native fetch in Node 18+
    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(filePath)], { type: 'text/plain' });
    formData.append('image', fileBlob, 'test.txt');

    // Need a valid token. Let's just login first.
    let token = '';
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password123' }) // Assuming typical dev credentials
        });
        const loginData = await loginRes.json();
        if (loginData.token) token = loginData.token;
    } catch(e) {}

    console.log('Token ready:', !!token);

    const res = await fetch('http://localhost:5000/api/upload/editor-image', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (error) {
     console.error('Error:', error);
  }
}

testUpload();
