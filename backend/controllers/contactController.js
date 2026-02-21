const { sendEmail } = require('../utils/emailHelper');

const TO_EMAIL = process.env.EMAIL_TO || process.env.EMAIL_USER;

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

        // Send email to portfolio owner (critical)
        await sendEmail({
            to: TO_EMAIL,
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
                                <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #60a5fa;">${phone}</a></td>
                            </tr>` : ''}
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

        // Respond immediately
        res.status(200).json({
            success: true,
            message: "Thanks for reaching out! I'll get back to you shortly."
        });

        // Auto-reply to sender — fire-and-forget
        sendEmail({
            to: email,
            subject: `✨ Got your message, ${name}! — Sujoy Sadhu`,
            html: `
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
                <body style="margin:0; padding:0; background:#0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <div style="max-width:560px; margin:40px auto; padding:20px;">

                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #1e3a5f, #1e293b); border-radius:16px 16px 0 0; padding:40px 36px 32px; text-align:center; border-bottom: 1px solid #334155;">
                            <div style="width:60px; height:60px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius:50%; margin: 0 auto 16px; display:flex; align-items:center; justify-content:center; font-size:28px; line-height:60px;">
                                🙏
                            </div>
                            <h1 style="color:#f1f5f9; font-size:24px; margin:0 0 8px; font-weight:700;">Thank You for Reaching Out!</h1>
                            <p style="color:#94a3b8; margin:0; font-size:15px;">Your message has been received</p>
                        </div>

                        <!-- Body -->
                        <div style="background:#1e293b; padding:36px; border-radius:0 0 16px 16px;">
                            <p style="color:#cbd5e1; font-size:16px; line-height:1.7; margin:0 0 20px;">
                                Hi <strong style="color:#f1f5f9;">${name}</strong>,
                            </p>
                            <p style="color:#cbd5e1; font-size:15px; line-height:1.8; margin:0 0 20px;">
                                Thank you so much for taking the time to contact me! It truly means a lot. 
                                I've received your message about <strong style="color:#60a5fa;">"${subject}"</strong> 
                                and I'm really excited to connect with you.
                            </p>
                            <p style="color:#cbd5e1; font-size:15px; line-height:1.8; margin:0 0 28px;">
                                I personally review every message and will get back to you as soon as possible — 
                                typically within <strong style="color:#f1f5f9;">24–48 hours</strong>. 
                                In the meantime, feel free to explore my work on my portfolio.
                            </p>

                            <!-- Quote box -->
                            <div style="background: linear-gradient(135deg, #1e3a5f22, #1e293b); border-left: 3px solid #3b82f6; border-radius:0 8px 8px 0; padding:16px 20px; margin-bottom:28px;">
                                <p style="color:#94a3b8; font-size:14px; font-style:italic; margin:0; line-height:1.7;">
                                    "Great things happen when passionate people connect. Looking forward to our conversation!"
                                </p>
                                <p style="color:#60a5fa; font-size:13px; margin:8px 0 0; font-weight:600;">— Sujoy Sadhu</p>
                            </div>

                            <!-- CTA -->
                            <div style="text-align:center; margin-bottom:28px;">
                                <a href="https://sujoy-sadhu.vercel.app" style="display:inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color:white; font-weight:600; text-decoration:none; padding:13px 32px; border-radius:10px; font-size:15px;">
                                    View My Portfolio →
                                </a>
                            </div>

                            <!-- Divider -->
                            <hr style="border:none; border-top:1px solid #334155; margin:0 0 24px;" />

                            <!-- Signature -->
                            <p style="color:#94a3b8; font-size:14px; margin:0 0 4px;">Warm regards,</p>
                            <p style="color:#f1f5f9; font-size:16px; font-weight:700; margin:0 0 16px;">Sujoy Sadhu</p>
                            <p style="color:#64748b; font-size:12px; margin:0; line-height:1.6;">
                                Full Stack Developer &amp; CS Enthusiast<br/>
                                📧 sujoysadhu5@gmail.com
                            </p>

                            <!-- Footer note -->
                            <div style="margin-top:24px; padding-top:20px; border-top:1px solid #1e293b;">
                                <p style="color:#475569; font-size:11px; margin:0; text-align:center; line-height:1.6;">
                                    This is an automated confirmation. Please do not reply to this email.<br/>
                                    You're receiving this because you submitted the contact form on my portfolio.
                                </p>
                            </div>
                        </div>

                    </div>
                </body>
                </html>
            `,
        }).catch(err => console.error('[Contact] Auto-reply failed (non-critical):', err.message));

    } catch (error) {
        console.error('[Contact] Error:', error.message);
        res.status(500).json({ success: false, message: `Failed to send message: ${error.message}` });
    }
};
