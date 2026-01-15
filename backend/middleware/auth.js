/**
 * ============================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================
 * 
 * Provides JWT-based authentication and authorization middleware.
 * Used to protect API routes and verify user permissions.
 * 
 * Features:
 * - JWT token verification from Authorization header
 * - User lookup and attachment to request object
 * - Role-based access control
 * 
 * Usage:
 *   router.get('/protected', protect, controller);
 *   router.get('/admin-only', protect, authorize('admin'), controller);
 * 
 * @author Portfolio Admin
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// PROTECT MIDDLEWARE
// ============================================
/**
 * Verifies JWT token and attaches user to request
 * Token should be sent in Authorization header as: "Bearer <token>"
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.protect = async (req, res, next) => {
    let token;

    // Extract token from Authorization header (Bearer Token format)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Verify token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        // Verify and decode the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from database and attach to request
        req.user = await User.findById(decoded.id);

        // Handle case where user no longer exists
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        next();  // Proceed to next middleware/controller
    } catch (error) {
        // Token verification failed (expired, invalid, etc.)
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// ============================================
// AUTHORIZE MIDDLEWARE
// ============================================
/**
 * Restricts access to specific user roles
 * Must be used AFTER the protect middleware
 * 
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'user')
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Only allow admin access
 * router.delete('/user/:id', protect, authorize('admin'), deleteUser);
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
