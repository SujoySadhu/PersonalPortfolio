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

// Public routes
router.get('/', getBlogs);
router.get('/tags', getTags);
router.get('/:slug', getBlog);

// Protected routes (Admin only)
router.post('/', protect, upload.single('coverImage'), createBlog);
router.put('/:id', protect, upload.single('coverImage'), updateBlog);
router.delete('/:id', protect, deleteBlog);
router.put('/:id/publish', protect, togglePublish);
router.put('/:id/featured', protect, toggleFeatured);

module.exports = router;
