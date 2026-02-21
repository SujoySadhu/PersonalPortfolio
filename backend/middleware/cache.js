const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const cacheMiddleware = (duration = 300) => {
    return (req, res, next) => {
        if (req.method !== 'GET') return next();

        const key = '__cache__' + (req.originalUrl || req.url);
        const cached = cache.get(key);

        if (cached) return res.status(200).json(cached);

        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode === 200) cache.set(key, body, duration);
            return originalJson(body);
        };

        next();
    };
};

const invalidateCache = (pattern) => {
    cache.keys().forEach(key => {
        if (key.includes(pattern)) cache.del(key);
    });
};

const invalidateAll = () => cache.flushAll();

module.exports = { cacheMiddleware, invalidateCache, invalidateAll, cache };
