import React, { useState } from 'react';
import { FiMail, FiMapPin, FiPhone, FiSend, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
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
        
        // Simulate form submission (you can integrate with your backend or email service)
        setTimeout(() => {
            setStatus({
                type: 'success',
                message: 'Thank you for your message! I will get back to you soon.'
            });
            setFormData({ name: '', email: '', subject: '', message: '' });
            setLoading(false);
        }, 1500);
    };

    const contactInfo = [
        {
            icon: FiMail,
            label: 'Email',
            value: 'your@email.com',
            link: 'mailto:your@email.com'
        },
        {
            icon: FiMapPin,
            label: 'Location',
            value: 'Your City, Country',
            link: null
        },
        {
            icon: FiPhone,
            label: 'Phone',
            value: '+1 234 567 890',
            link: 'tel:+1234567890'
        }
    ];

    const socialLinks = [
        { icon: FiGithub, url: 'https://github.com', label: 'GitHub' },
        { icon: FiLinkedin, url: 'https://linkedin.com', label: 'LinkedIn' },
        { icon: FiTwitter, url: 'https://twitter.com', label: 'Twitter' }
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Get In <span className="gradient-text">Touch</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Have a question or want to work together? Feel free to reach out!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Contact Cards */}
                        {contactInfo.map((info, index) => (
                            <div key={index} className="card p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <info.icon className="text-primary-400" size={24} />
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
                                        className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
                                        aria-label={social.label}
                                    >
                                        <social.icon size={20} />
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
                                <div className={`mb-6 p-4 rounded-lg ${
                                    status.type === 'success' 
                                        ? 'bg-green-500/20 text-green-400' 
                                        : 'bg-red-500/20 text-red-400'
                                }`}>
                                    {status.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="label">Your Name</label>
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
                                        <label className="label">Your Email</label>
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

                                <div>
                                    <label className="label">Subject</label>
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

                                <div>
                                    <label className="label">Message</label>
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
                                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
