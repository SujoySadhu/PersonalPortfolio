async function testCreateProject() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Njk2MTE2NGE1MjMxZmNiMWIyZjc2YyIsImlhdCI6MTc3MzY0ODk5OCwiZXhwIjoxNzc0MjUzNzk4fQ.2aQsBQY_0OwlB2TGCbeGNzih-jFXJ1KIXqr7BtcfLZo';
  
  const payload = {
    title: 'Vercel API Test Project',
    shortDescription: 'Testing if Vercel backend accepts cloudinaryUrls from JSON',
    description: 'This has no quill images.',
    techStack: [],
    cloudinaryUrls: ['https://res.cloudinary.com/dho9r4mcd/image/upload/v1773649096/portfolio/wz6wczqbi4quvpvodzpa.jpg']
  };

  try {
    const res = await fetch('https://personal-portfolio-tukd.vercel.app/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testCreateProject();
