/**
 * ============================================
 * USER MODEL - Admin Authentication Schema
 * ============================================
 * 
 * Defines the schema for admin users who can access the dashboard.
 * Includes password hashing and verification methods.
 * 
 * Features:
 * - Automatic password hashing on save
 * - Password comparison method for authentication
 * - Email validation with regex pattern
 * - Role-based access (currently only 'admin' role)
 * 
 * @author Portfolio Admin
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ============================================
// SCHEMA DEFINITION
// ============================================
const UserSchema = new mongoose.Schema({
    // User's display name
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    // Login email (must be unique)
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    // Hashed password (excluded from queries by default for security)
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false  // Security: Don't return password in queries by default
    },
    // User role for authorization
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin'
    },
    // Timestamp of account creation
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ============================================
// MIDDLEWARE: Password Hashing
// ============================================
/**
 * Pre-save hook to automatically hash password
 * Only runs when password field is modified
 * Uses bcrypt with salt rounds of 10
 */
UserSchema.pre('save', async function(next) {
    // Skip hashing if password wasn't modified
    if (!this.isModified('password')) {
        next();
    }
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// ============================================
// INSTANCE METHODS
// ============================================
/**
 * Compare entered password with stored hashed password
 * Used during login authentication
 * 
 * @param {string} enteredPassword - Plain text password to verify
 * @returns {boolean} True if passwords match, false otherwise
 */
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
