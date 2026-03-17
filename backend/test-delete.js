require('dotenv').config();
const { cloudinary } = require('./config/cloudinary');

async function testDelete() {
    try {
        // Upload a dummy image first
        const uploadRes = await cloudinary.uploader.upload('https://via.placeholder.com/150', {
            folder: 'portfolio',
        });
        console.log('Uploaded dummy image:', uploadRes.secure_url);
        console.log('Public ID:', uploadRes.public_id);

        const parts = uploadRes.secure_url.split('/');
        const folder = parts[parts.length - 2];
        const filename = parts[parts.length - 1].split('.')[0];
        
        console.log('Calculated Public ID from URL:', `${folder}/${filename}`);
        
        // Delete it
        const delRes = await cloudinary.uploader.destroy(`${folder}/${filename}`);
        console.log('Delete Response (calculated ID):', delRes);

        const delRes2 = await cloudinary.uploader.destroy(uploadRes.public_id);
        console.log('Delete Response (real ID):', delRes2);

    } catch (e) {
        console.error(e);
    }
}
testDelete();
