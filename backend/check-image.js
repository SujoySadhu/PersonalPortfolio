const https = require('https');
const url = 'https://res.cloudinary.com/dho9r4mcd/image/upload/v1773649096/portfolio/wz6wczqbi4quvpvodzpa.jpg';
https.request(url, { method: 'HEAD' }, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
}).end();
