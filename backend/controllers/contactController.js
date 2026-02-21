const nodemailer = require('nodemailer');

// Create reusable transporter with timeouts
const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,  // 10s to connect
    greetingTimeout: 10000,    // 10s for greeting
    socketTimeout: 15000,      // 15s for socket idle
});

// Create contact from form submission and send email notification
exports.submitContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields (name, email, subject, message)'
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        const transporter = createTransporter();

        // Verify SMTP connection first (fast-fail on auth errors)
        await transporter.verify();

        // Email to portfolio owner (critical - must succeed)
        await transporter.sendMail({
            from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_TO || process.env.EMAIL_USER,
            replyTo: email,
            subject: `[Portfolio Contact] ${subject}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 30px; border-radius: 12px; color: #e2e8f0;">
                        <h2 style="color: #60a5fa; margin-top: 0;">New Contact Form Submission</h2>
                        <hr style="border: 1px solid #334155; margin: 20px 0;" />
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #94a3b8; width: 100px;"><strong>Name:</strong></td>
                                <td style="padding: 8px 0; color: #f1f5f9;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #94a3b8;"><strong>Email:</strong></td>
                                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #60a5fa;">${email}</a></td>
                            </tr>
                            ${phone ? `
                            <tr>
                                <td style="padding: 8px 0; color: #94a3b8;"><strong>Phone:</strong></td>
                                <td style="padding: 8px 0; color: #f1f5f9;"><a href="tel:${phone}" style="color: #60a5fa;">${phone}</a></td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td style="padding: 8px 0; color: #94a3b8;"><strong>Subject:</strong></td>
                                <td style="padding: 8px 0; color: #f1f5f9;">${subject}</td>
                            </tr>
                        </table>
                        
                        <hr style="border: 1px solid #334155; margin: 20px 0;" />
                        
                        <h3 style="color: #94a3b8; margin-bottom: 10px;">Message:</h3>
                        <div style="background: #0f172a; padding: 16px; border-radius: 8px; color: #cbd5e1; line-height: 1.6; white-space: pre-wrap;">${message}</div>
                        
                        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
                            Sent from your portfolio contact form • ${new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
            `,
        });

        // Respond immediately — owner got the message, no more waiting
        res.status(200).json({
            success: true,
            message: 'Message sent successfully! You will receive a confirmation email shortly.'
        });

        // Auto-reply to sender — fire-and-forget (non-blocking, won't delay response)
        transporter.sendMail({
            from: `"Sujoy Sadhu" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Re: ${subject} — Thank you for reaching out!`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 30px; border-radius: 12px; color: #e2e8f0;">
                        <h2 style="color: #60a5fa; margin-top: 0;">Thank you for reaching out!</h2>
                        <p style="color: #cbd5e1; line-height: 1.6;">
                            Hi ${name},<br/><br/>
                            Thank you for your message. I've received your inquiry about "<strong>${subject}</strong>" and will get back to you as soon as possible.
                        </p>
                        <p style="color: #cbd5e1; line-height: 1.6;">
                            In the meantime, feel free to check out my latest work on my portfolio.
                        </p>
                        <p style="color: #94a3b8; margin-top: 20px;">
                            Best regards,<br/>
                            <strong style="color: #f1f5f9;">Sujoy Sadhu</strong>
                        </p>
                        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
                            This is an automated response. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            `,
        }).catch(err => console.error('[Contact] Auto-reply failed (non-critical):', err.message));

    } catch (error) {
        console.error('[Contact] Error:', error.message);

        if (error.code === 'EAUTH' || error.responseCode === 535) {
            return res.status(500).json({
                success: false,
                message: 'Email service configuration error. Please contact the site owner directly.'
            });
        }

        res.status(500).json({
            success: false,
            message: `Failed to send message: ${error.message}`
        });
    }
};
