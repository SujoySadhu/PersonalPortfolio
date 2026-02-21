const User = require('../models/User');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailHelper');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Generate 6-digit code
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send 2FA code via email
const send2FAEmail = async (email, code, name) => {
    await sendEmail({
        to: email,
        subject: `🔐 Your Login Verification Code: ${code}`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 40px 30px; border-radius: 16px; color: #e2e8f0; text-align: center;">
                    <h2 style="color: #60a5fa; margin-top: 0; font-size: 20px;">Admin Login Verification</h2>
                    <p style="color: #94a3b8; margin-bottom: 30px;">Hi ${name}, enter this code to complete your login:</p>
                    <div style="background: #0f172a; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; margin: 0 auto; max-width: 280px;">
                        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #60a5fa; font-family: monospace;">${code}</span>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin-top: 25px;">
                        This code expires in <strong style="color: #f59e0b;">5 minutes</strong>.<br/>
                        If you didn't request this, ignore this email.
                    </p>
                </div>
            </div>
        `,
    });
};
// Check if 2FA is enabled (reads from DB Settings)
const is2FAEnabled = async () => {
    try {
        const settings = await Settings.findOne().lean();
        if (!settings) return true;
        return settings.enable2FA !== false;
    } catch {
        return true;
    }
};

// @desc    Register admin user
// @route   POST /api/auth/register
// @access  Public (should be disabled after first admin created)
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin user already exists'
            });
        }

        const user = await User.create({ name, email, password, role: 'admin' });
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login user (Step 1: validate credentials, optionally send 2FA code)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email and password'
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // If 2FA is disabled, login directly
        if (!(await is2FAEnabled())) {
            const token = generateToken(user._id);
            return res.status(200).json({
                success: true,
                token,
                user: { id: user._id, name: user.name, email: user.email, role: user.role }
            });
        }

        // 2FA enabled: generate code, save to user, send email
        const code = generateCode();
        user.twoFactorCode = code;
        user.twoFactorExpires = new Date(Date.now() + 5 * 60 * 1000);
        await user.save({ validateModifiedOnly: true });

        try {
            await send2FAEmail(user.email, code, user.name);
        } catch (emailErr) {
            console.error('2FA email send error:', emailErr);
            const token = generateToken(user._id);
            return res.status(200).json({
                success: true,
                token,
                user: { id: user._id, name: user.name, email: user.email, role: user.role }
            });
        }

        res.status(200).json({
            success: true,
            requires2FA: true,
            tempUserId: user._id,
            message: `Verification code sent to ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify 2FA code (Step 2: complete login)
// @route   POST /api/auth/verify-2fa
// @access  Public
exports.verify2FA = async (req, res) => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            return res.status(400).json({
                success: false,
                message: 'User ID and verification code are required'
            });
        }

        const user = await User.findById(userId).select('+twoFactorCode +twoFactorExpires');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid request' });
        }

        if (!user.twoFactorExpires || user.twoFactorExpires < Date.now()) {
            user.twoFactorCode = undefined;
            user.twoFactorExpires = undefined;
            await user.save({ validateModifiedOnly: true });
            return res.status(401).json({
                success: false,
                message: 'Verification code has expired. Please login again.'
            });
        }

        if (user.twoFactorCode !== code.trim()) {
            return res.status(401).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        user.twoFactorCode = undefined;
        user.twoFactorExpires = undefined;
        await user.save({ validateModifiedOnly: true });

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Resend 2FA code
// @route   POST /api/auth/resend-2fa
// @access  Public
exports.resend2FA = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid request' });
        }

        const code = generateCode();
        user.twoFactorCode = code;
        user.twoFactorExpires = new Date(Date.now() + 5 * 60 * 1000);
        await user.save({ validateModifiedOnly: true });

        await send2FAEmail(user.email, code, user.name);

        res.status(200).json({
            success: true,
            message: 'New verification code sent'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = { name: req.body.name, email: req.body.email };
        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true, runValidators: true
        });
        res.status(200).json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({ success: false, message: 'Password is incorrect' });
        }
        user.password = req.body.newPassword;
        await user.save();
        const token = generateToken(user._id);
        res.status(200).json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Forgot password - send 6-digit code via email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email address' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // Always return success to prevent email enumeration
        if (!user) {
            console.log(`[ForgotPassword] No user found for email: ${email}`);
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a verification code has been sent.'
            });
        }

        // Generate 6-digit code
        const code = generateCode();
        console.log(`[ForgotPassword] Generated code for ${user.email}: ${code}`); // fallback: visible in server logs

        // Store code hashed with expiry
        user.resetPasswordToken = crypto.createHash('sha256').update(code).digest('hex');
        user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save({ validateModifiedOnly: true });

        // Send reset code email (uses Resend on production, nodemailer locally)
        console.log(`[ForgotPassword] Sending reset code to ${user.email}...`);
        await sendEmail({
            to: user.email,
            subject: `🔑 Your Password Reset Code: ${code}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 40px 30px; border-radius: 16px; color: #e2e8f0; text-align: center;">
                        <h2 style="color: #60a5fa; margin-top: 0; font-size: 22px;">Password Reset</h2>
                        <p style="color: #94a3b8; margin-bottom: 30px; line-height: 1.6;">
                            Hi ${user.name},<br/>Use this code to reset your password:
                        </p>
                        <div style="background: #0f172a; border: 2px solid #3b82f6; border-radius: 12px; padding: 24px; margin: 0 auto; max-width: 280px;">
                            <span style="font-size: 40px; font-weight: 700; letter-spacing: 10px; color: #60a5fa; font-family: monospace;">${code}</span>
                        </div>
                        <p style="color: #64748b; font-size: 13px; margin-top: 25px; line-height: 1.6;">
                            This code expires in <strong style="color: #f59e0b;">10 minutes</strong>.<br/>
                            If you didn't request this, ignore this email.
                        </p>
                    </div>
                </div>
            `,
        });

        console.log(`[ForgotPassword] Email sent successfully to ${user.email}`);
        res.status(200).json({
            success: true,
            message: 'Verification code sent! Check your email (and spam folder).'
        });
    } catch (error) {
        console.error('[ForgotPassword] Error:', error.message);
        // Return the actual error so we can debug from the UI
        res.status(500).json({
            success: false,
            message: `Email sending failed: ${error.message}. Check server logs.`
        });
    }
};

// @desc    Reset password using 6-digit code
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { email, code, password } = req.body;

        if (!email || !code || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email, verification code, and new password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Hash the code to compare with DB
        const hashedCode = crypto.createHash('sha256').update(code.trim()).digest('hex');

        // Find user with matching code that hasn't expired
        const user = await User.findOne({
            email,
            resetPasswordToken: hashedCode,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code. Please request a new one.'
            });
        }

        // Set new password and clear reset fields
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully!'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
