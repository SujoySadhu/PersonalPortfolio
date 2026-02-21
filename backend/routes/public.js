const express = require('express');
const router = express.Router();
const { getHomeData, getPublicSettings } = require('../controllers/publicController');
const { cacheMiddleware } = require('../middleware/cache');

router.get('/home', cacheMiddleware(300), getHomeData);
router.get('/settings', cacheMiddleware(600), getPublicSettings);

module.exports = router;
