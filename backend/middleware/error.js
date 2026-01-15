/**
 * ============================================
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * ============================================
 * 
 * Centralized error handling for all API routes.
 * Catches and formats errors into consistent JSON responses.
 * 
 * Handled Error Types:
 * - Mongoose CastError: Invalid ObjectId format
 * - Mongoose Duplicate Key: Unique constraint violation
 * - Mongoose ValidationError: Schema validation failures
 * - Generic errors: Any other server errors
 * 
 * Response Format:
 * {
 *   success: false,
 *   message: "Error description"
 * }
 * 
 * @author Portfolio Admin
 */

/**
 * Express error handling middleware
 * Must be registered AFTER all routes
 * 
 * @param {Error} err - Error object thrown or passed to next()
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function (unused but required)
 */
const errorHandler = (err, req, res, next) => {
    // Create error object copy to avoid mutation
    let error = { ...err };
    error.message = err.message;

    // Log full error for debugging (server console only)
    console.error('❌ Error:', err);

    // ----------------------------------------
    // Handle Mongoose CastError (Invalid ObjectId)
    // ----------------------------------------
    // Occurs when an invalid MongoDB ObjectId is passed
    // Example: GET /api/projects/invalid-id-format
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // ----------------------------------------
    // Handle Mongoose Duplicate Key Error
    // ----------------------------------------
    // Occurs when trying to insert a document with
    // a value that violates a unique index constraint
    // Example: Creating user with existing email
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }

    // ----------------------------------------
    // Handle Mongoose Validation Error
    // ----------------------------------------
    // Occurs when document fails schema validation
    // Extracts all validation error messages
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = { message, statusCode: 400 };
    }

    // Send JSON error response
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};

module.exports = errorHandler;
