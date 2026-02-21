/**
 * emailHelper.js
 * Smart email sender: uses Resend (HTTP) on Render/production,
 * falls back to nodemailer (Gmail SMTP) locally.
 */

const nodemailer = require('nodemailer');

const useResend = () => {
    const key = process.env.RESEND_API_KEY;
    return key && key !== 're_your_api_key_here' && key.startsWith('re_');
};

/**
 * Send an email using the best available method.
 * @param {{ from?: string, to: string, replyTo?: string, subject: string, html: string }} options
 */
async function sendEmail({ from, to, replyTo, subject, html }) {
    if (useResend()) {
        // -- Resend (HTTP API - works on Render free tier) --
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromAddr = from || process.env.FROM_EMAIL || 'Portfolio Admin <onboarding@resend.dev>';

        const payload = { from: fromAddr, to, subject, html };
        if (replyTo) payload.reply_to = replyTo;

        const { error } = await resend.emails.send(payload);
        if (error) throw new Error(`Resend error: ${error.message}`);
    } else {
        // -- Nodemailer (Gmail SMTP - works locally) --
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            connectionTimeout: 10000,
            socketTimeout: 15000,
        });

        const fromAddr = from || `"Portfolio Admin" <${process.env.EMAIL_USER}>`;
        const mailOptions = { from: fromAddr, to, subject, html };
        if (replyTo) mailOptions.replyTo = replyTo;

        await transporter.sendMail(mailOptions);
    }
}

module.exports = { sendEmail, useResend };
