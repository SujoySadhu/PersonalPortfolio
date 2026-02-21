import React, { useState } from 'react';
import { FiMail, FiMapPin, FiSend, FiGithub, FiLinkedin, FiTwitter, FiPhone } from 'react-icons/fi';
import { useSettings } from '../context/SettingsContext';
import { contactAPI } from '../services/api';

const Contact = () => {
    const { settings } = useSettings();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await contactAPI.submit(formData);
            setStatus({
                type: 'success',
                message: response.data.message || 'Message sent successfully! Check your email for confirmation.'
            });
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to send message. Please try again or email directly.'
            });
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        {
            icon: FiMail,
            label: 'Email',
            value: settings?.email || 'your@email.com',
            link: settings?.email ? `mailto:${settings.email}` : 'mailto:your@email.com'
        },
        ...(settings?.phone ? [{
            icon: FiPhone,
            label: 'Phone',
            value: settings.phone,
            link: `tel:${settings.phone}`
        }] : []),
        {
            icon: FiMapPin,
            label: 'Location',
            value: settings?.location || 'Your City, Country',
            link: null
        }
    ];

    const socialLinks = [
        ...(settings?.socialLinks?.github ? [{ icon: FiGithub, url: settings.socialLinks.github, label: 'GitHub' }] : [{ icon: FiGithub, url: 'https://github.com', label: 'GitHub' }]),
        ...(settings?.socialLinks?.linkedin ? [{ icon: FiLinkedin, url: settings.socialLinks.linkedin, label: 'LinkedIn' }] : [{ icon: FiLinkedin, url: 'https://linkedin.com', label: 'LinkedIn' }]),
        ...(settings?.socialLinks?.twitter ? [{ icon: FiTwitter, url: settings.socialLinks.twitter, label: 'Twitter' }] : [])
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative gradient orbs */}
            <div className="contact-orb w-96 h-96 bg-blue-500 -top-20 -right-20 animate-float" />
            <div className="contact-orb w-80 h-80 bg-violet-500 bottom-20 -left-20 animate-float-delay" />
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <div className="section-ornament" />
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Get In Touch
                    </h1>
                    <p className="text-gray-400 text-base">
                        Have a question or want to work together? Feel free to reach out.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Contact Cards */}
                        {contactInfo.map((info, index) => (
                            <div key={index} className="card p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-800/60 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <info.icon className="text-gray-400" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium mb-1">{info.label}</h3>
                                        {info.link ? (
                                            <a
                                                href={info.link}
                                                className="text-gray-400 hover:text-primary-400 transition-colors"
                                            >
                                                {info.value}
                                            </a>
                                        ) : (
                                            <p className="text-gray-400">{info.value}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Social Links */}
                        <div className="card p-6">
                            <h3 className="text-white font-medium mb-4">Follow Me</h3>
                            <div className="flex gap-3">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 bg-gray-800/60 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                                        aria-label={social.label}
                                    >
                                        <social.icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="card p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>

                            {status.message && (
                                <div className={`mb-6 p-4 rounded-lg ${status.type === 'success'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {status.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="label">Your Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Your Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="label">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="+880 1XXX-XXXXXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Subject *</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="What's this about?"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Message *</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="6"
                                        className="input-field resize-none"
                                        placeholder="Your message here..."
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-gradient w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <FiSend /> Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
