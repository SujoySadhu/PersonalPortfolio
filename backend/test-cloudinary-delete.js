require('dotenv').config();
const { cloudinary } = require('./config/cloudinary');

async function testDelete() {
    try {
        // base64 1x1 pixel image
        const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

        const resUpload = await cloudinary.uploader.upload(dummyImage, { folder: 'portfolio' });
        console.log('--- Upload Success ---');
        console.log('Real Public ID:', resUpload.public_id);
        
        const url = resUpload.secure_url; 
        console.log('Secure URL returned:', url);
        
        const parts = url.split('/');
        const folder = parts[parts.length - 2];
        const filename = parts[parts.length - 1].split('.')[0];
        
        const calculatedId = `${folder}/${filename}`;
        console.log('Calculated Public ID:', calculatedId);
        
        if (calculatedId === resUpload.public_id) {
            console.log('✅ IDs match perfectly!');
        } else {
            console.log('❌ IDs DO NOT MATCH!');
        }

        const resDel = await cloudinary.uploader.destroy(calculatedId);
        console.log('--- Delete Success ---');
        console.log('Delete result:', resDel);
        
    } catch (e) {
        console.log('Error:', e.message);
    }
}
testDelete();
