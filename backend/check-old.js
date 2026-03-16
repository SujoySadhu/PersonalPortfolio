const https = require('https');
const url = 'https://res.cloudinary.com/dho9r4mcd/image/upload/portfolio/grlvtxjw0yuigy0wkxyd';
https.request(url, { method: 'HEAD' }, (res) => {
  console.log('Status:', res.statusCode);
}).end();
