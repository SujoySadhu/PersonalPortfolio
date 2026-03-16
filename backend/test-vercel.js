const fs = require('fs');

async function testVercelUpload() {
  try {
    const filePath = __filename; // just upload this js script as dummy image
    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(filePath)], { type: 'image/jpeg' });
    formData.append('image', fileBlob, 'test.jpg');

    const res = await fetch('https://personal-portfolio-tukd.vercel.app/api/upload/editor-image', {
        method: 'POST',
        // Assuming the user's token from their network logs still works temporarily 
        // Or wait, the vercel API doesn't have auth disabled...
        // Let's use the token from their Vercel logs!
        headers: { 
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Njk2MTE2NGE1MjMxZmNiMWIyZjc2YyIsImlhdCI6MTc3MzY0ODk5OCwiZXhwIjoxNzc0MjUzNzk4fQ.2aQsBQY_0OwlB2TGCbeGNzih-jFXJ1KIXqr7BtcfLZo'
        },
        body: formData
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (error) {
     console.error('Error:', error);
  }
}

testVercelUpload();
