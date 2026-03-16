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
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        @media screen and (max-width: 480px) {
                            .container { padding: 10px !important; }
                            .card { padding: 20px !important; }
                            td { font-size: 14px !important; }
                            .label-cell { width: 70px !important; }
                        }
                    </style>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f4f4f5;">
                    <div class="container" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; width: 100%; max-width: 700px; margin: 0 auto; padding: 20px; box-sizing: border-box;">
                        <div class="card" style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 30px; border-radius: 12px; color: #e2e8f0; width: 100%; box-sizing: border-box;">
                            <h2 style="color: #60a5fa; margin-top: 0; font-size: 22px;">New Contact Form Submission</h2>
                            <hr style="border: 1px solid #334155; margin: 20px 0;" />
                            <div style="padding: 10px 0;">
                                <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.5;">
                                    <strong style="color: #94a3b8; display: inline-block; width: 70px;">Name:</strong> 
                                    <span style="color: #f1f5f9; word-break: break-all;">${name}</span>
                                </p>
                                <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.5;">
                                    <strong style="color: #94a3b8; display: inline-block; width: 70px;">Email:</strong> 
                                    <a href="mailto:${email}" style="color: #60a5fa; text-decoration: none; word-break: break-all;">${email}</a>
                                </p>
                                ${phone ? `
                                <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.5;">
                                    <strong style="color: #94a3b8; display: inline-block; width: 70px;">Phone:</strong> 
                                    <a href="tel:${phone}" style="color: #60a5fa; text-decoration: none; word-break: break-all;">${phone}</a>
                                </p>` : ''}
                                <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.5;">
                                    <strong style="color: #94a3b8; display: inline-block; width: 70px;">Subject:</strong> 
                                    <span style="color: #f1f5f9; word-break: break-all;">${subject}</span>
                                </p>
                            </div>
                            <hr style="border: 1px solid #334155; margin: 20px 0;" />
                            <h3 style="color: #94a3b8; margin-bottom: 10px; font-size: 16px;">Message:</h3>
                            <div style="background: #0f172a; padding: 16px; border-radius: 8px; color: #cbd5e1; line-height: 1.6; white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word; font-size: 15px;">${message}</div>
                            <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
                                Sent from your portfolio contact form • ${new Date().toLocaleString()}
                            </p>
                        </div>
                    </div>
                </body>
                </html>
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
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                    <style>
                        @media screen and (max-width: 480px) {
                            .main-container { margin: 10px auto !important; width: 100% !important; border-radius: 0 !important; }
                            .header-banner { padding: 30px 20px !important; }
                            .header-banner h1 { font-size: 24px !important; }
                            .content-body { padding: 24px 20px !important; }
                            .highlight-box { padding: 16px !important; }
                            .footer { padding: 20px !important; }
                            .btn { width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
                        }
                    </style>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; color: #334155;">
                    <div class="main-container" style="width: 100%; max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);">
                        
                        <!-- Header Banner -->
                        <div class="header-banner" style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 48px 40px; text-align: center; position: relative; overflow: hidden;">
                            <!-- Decorative Circle -->
                            <div style="position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; background: rgba(255, 255, 255, 0.1); border-radius: 50%;"></div>
                            <div style="position: absolute; bottom: -20px; left: -20px; width: 80px; height: 80px; background: rgba(255, 255, 255, 0.1); border-radius: 50%;"></div>
                            
                            <div style="background: white; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                                <span style="font-size: 32px; line-height: 64px;">✨</span>
                            </div>
                            <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px; font-weight: 700; letter-spacing: -0.5px;">Message Received!</h1>
                            <p style="color: #e2e8f0; font-size: 16px; margin: 0; font-weight: 400;">Thank you for getting in touch</p>
                        </div>

                        <!-- Content Body -->
                        <div class="content-body" style="padding: 40px;">
                            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px; color: #334155;">
                                Hi <strong style="color: #0f172a;">${name}</strong>,
                            </p>
                            
                            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px; color: #475569; word-break: break-all;">
                                Thanks for reaching out through my portfolio! I'm thrilled to connect with you. 
                                I have successfully received your message regarding <strong style="color: #2563eb;">"${subject}"</strong>.
                            </p>

                            <!-- Highlight Box -->
                            <div class="highlight-box" style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; border-radius: 4px 8px 8px 4px; padding: 20px; margin: 28px 0;">
                                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #475569; font-style: italic;">
                                    "I personally read every single message and aim to respond within <strong style="color: #0f172a; font-style: normal;">24-48 hours</strong>. 
                                    I'm looking forward to reading what you have to say and continuing our conversation."
                                </p>
                            </div>

                            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 32px; color: #475569;">
                                In the meantime, feel free to check out some of my latest projects or read through my technical articles on my portfolio.
                            </p>

                            <!-- Call to Action -->
                            <div style="text-align: left; margin-bottom: 40px;">
                                <a href="https://sujoysadhu.vercel.app" class="btn" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 15px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1); transition: background-color 0.2s;">
                                    Return to Portfolio
                                </a>
                            </div>

                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0 0 32px;" />

                            <!-- Signature Profile -->
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); width: 48px; height: 48px; border-radius: 50%; min-width: 48px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">
                                    S
                                </div>
                                <div>
                                    <h3 style="margin: 0 0 4px; font-size: 16px; color: #0f172a; font-weight: 600;">Sujoy Sadhu</h3>
                                    <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.4;">Competitive Programmer & Full-Stack Developer</p>
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="footer" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 13px; color: #64748b;">
                                Find me around the web:
                            </p>
                            <p style="margin: 0 0 16px; font-size: 13px; font-weight: 500;">
                                <a href="https://github.com/sujoyy19" style="color: #2563eb; text-decoration: none; margin: 0 8px;">GitHub</a> • 
                                <a href="https://www.linkedin.com/in/sujoy-sadhu/" style="color: #2563eb; text-decoration: none; margin: 0 8px;">LinkedIn</a> • 
                                <a href="mailto:sujoysadhu5@gmail.com" style="color: #2563eb; text-decoration: none; margin: 0 8px;">Email</a>
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                                This is an automated confirmation email.<br/>
                                Please do not reply directly to this address.
                            </p>
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
