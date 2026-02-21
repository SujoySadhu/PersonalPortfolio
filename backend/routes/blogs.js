const express = require('express');
const router = express.Router();
const {
    getBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    togglePublish,
    toggleFeatured,
    getTags
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { cacheMiddleware } = require('../middleware/cache');

// Public routes
router.get('/', cacheMiddleware(120), getBlogs);
router.get('/tags', cacheMiddleware(300), getTags);
router.get('/:slug', cacheMiddleware(120), getBlog);

// Protected routes (Admin only)
router.post('/', protect, upload.single('coverImage'), createBlog);
router.put('/:id', protect, upload.single('coverImage'), updateBlog);
router.delete('/:id', protect, deleteBlog);
router.put('/:id/publish', protect, togglePublish);
router.put('/:id/featured', protect, toggleFeatured);

module.exports = router;
