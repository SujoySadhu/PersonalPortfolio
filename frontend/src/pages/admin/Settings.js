import React, { useState, useEffect, useCallback } from 'react';
import { FiSave, FiUpload, FiUser, FiMail, FiPhone, FiMapPin, FiGithub, FiLinkedin, FiTwitter, FiGlobe, FiCode, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { SiLeetcode, SiCodeforces, SiCodechef, SiHackerrank } from 'react-icons/si';
import { settingsAPI, authAPI } from '../../services/api';
import Loading from '../../components/common/Loading';

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        tagline: '',
        bio: '',
        email: '',
        phone: '',
        location: '',
        resumeLink: '',
        isAvailableForHire: true,
        socialLinks: {
            github: '',
            linkedin: '',
            twitter: '',
            website: '',
            leetcode: '',
            codeforces: '',
            codechef: '',
            hackerrank: ''
        }
    });
    const [profileImage, setProfileImage] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    
    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [changingPassword, setChangingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const fetchSettings = useCallback(async () => {
        try {
            const response = await settingsAPI.get();
            const data = response.data.data;
            setFormData({
                name: data.name || '',
                title: data.title || '',
                tagline: data.tagline || '',
                bio: data.bio || '',
                email: data.email || '',
                phone: data.phone || '',
                location: data.location || '',
                resumeLink: data.resumeLink || '',
                isAvailableForHire: data.isAvailableForHire ?? true,
                socialLinks: {
                    github: data.socialLinks?.github || '',
                    linkedin: data.socialLinks?.linkedin || '',
                    twitter: data.socialLinks?.twitter || '',
                    website: data.socialLinks?.website || '',
                    leetcode: data.socialLinks?.leetcode || '',
                    codeforces: data.socialLinks?.codeforces || '',
                    codechef: data.socialLinks?.codechef || '',
                    hackerrank: data.socialLinks?.hackerrank || ''
                }
            });
            setProfileImage(data.profileImage || '');
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('social_')) {
            const socialKey = name.replace('social_', '');
            setFormData(prev => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [socialKey]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload
        setUploadingImage(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('profileImage', file);
            const response = await settingsAPI.uploadProfileImage(formDataUpload);
            setProfileImage(response.data.profileImage);
            alert('Profile image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
            setPreviewImage('');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await settingsAPI.update(formData);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            alert('New password must be at least 6 characters!');
            return;
        }
        
        setChangingPassword(true);
        try {
            await authAPI.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            alert('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error changing password:', error);
            alert(error.response?.data?.message || 'Failed to change password. Check your current password.');
        } finally {
            setChangingPassword(false);
        }
    };

    const getImageUrl = () => {
        if (previewImage) return previewImage;
        if (profileImage) {
            return profileImage.startsWith('http') ? profileImage : `${API_URL}${profileImage}`;
        }
        return null;
    };

    if (loading) return <Loading />;

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                <p className="text-gray-400 mt-2">Manage your portfolio profile and information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Image Section */}
                <div className="bg-dark-200 rounded-xl p-6 border border-gray-800">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <FiUser className="text-primary-400" /> Profile Image
                    </h2>
                    <div className="flex items-center gap-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-500/50 bg-dark-300">
                                {getImageUrl() ? (
                                    <img
                                        src={getImageUrl()}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <FiUser size={48} />
                                    </div>
                                )}
                            </div>
                            {uploadingImage && (
                                <div className="absolute inset-0 bg-dark-300/80 rounded-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="btn-primary cursor-pointer flex items-center gap-2">
                                <FiUpload /> Upload New Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-gray-500 text-sm mt-2">
                                Recommended: Square image, at least 400x400px
                            </p>
                        </div>
                    </div>
                </div>

                {/* Basic Info Section */}
                <div className="bg-dark-200 rounded-xl p-6 border border-gray-800">
                    <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2">Professional Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Full Stack Developer"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-300 mb-2">Tagline</label>
                            <input
                                type="text"
                                name="tagline"
                                value={formData.tagline}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="I build things for the web."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-300 mb-2">Bio / About</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="input-field resize-none"
                                placeholder="Tell visitors about yourself..."
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Info Section */}
                <div className="bg-dark-200 rounded-xl p-6 border border-gray-800">
                    <h2 className="text-xl font-semibold text-white mb-6">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-300 mb-2 flex items-center gap-2">
                                <FiMail size={16} /> Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2 flex items-center gap-2">
                                <FiPhone size={16} /> Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2 flex items-center gap-2">
                                <FiMapPin size={16} /> Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="City, Country"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2">Resume Link</label>
                            <input
                                type="url"
                                name="resumeLink"
                                value={formData.resumeLink}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                {/* Social Links Section */}
                <div className="bg-dark-200 rounded-xl p-6 border border-gray-800">
                    <h2 className="text-xl font-semibold text-white mb-6">Social Links</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-300 mb-2 flex items-center gap-2">
                                <FiGithub size={16} /> GitHub
                            </label>
                            <input
                                type="url"
                                name="social_github"
                                value={formData.socialLinks.github}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://github.com/username"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2 flex items-center gap-2">
                                <FiLinkedin size={16} /> LinkedIn
                            </label>
                            <input
                                type="url"
                                name="social_linkedin"
                                value={formData.socialLinks.linkedin}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://linkedin.com/in/username"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2 flex items-center gap-2">
                                <FiTwitter size={16} /> Twitter
                            </label>
                            <input
                                type="url"
                                name="social_twitter"
                                value={formData.socialLinks.twitter}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://twitter.com/username"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2 flex items-center gap-2">
                                <FiGlobe size={16} /> Website
                            </label>
                            <input
                                type="url"
                                name="social_website"
                                value={formData.socialLinks.website}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://yourwebsite.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Competitive Programming Section */}
                <div className="bg-dark-200 rounded-xl p-6 border border-gray-800">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <FiCode className="text-primary-400" /> Competitive Programming
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-300 mb-2 flex items-center gap-2">
                                <SiLeetcode size={16} className="text-yellow-500" /> LeetCode
                            </label>
                            <input
                                type="url"
                                name="social_leetcode"
                                value={formData.socialLinks.leetcode}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://leetcode.com/username"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2 flex items-center gap-2">
                                <SiCodeforces size={16} className="text-blue-400" /> Codeforces
                            </label>
                            <input
                                type="url"
                                name="social_codeforces"
                                value={formData.socialLinks.codeforces}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://codeforces.com/profile/username"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2 flex items-center gap-2">
                                <SiCodechef size={16} className="text-amber-600" /> CodeChef
                            </label>
                            <input
                                type="url"
                                name="social_codechef"
                                value={formData.socialLinks.codechef}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://codechef.com/users/username"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2 flex items-center gap-2">
                                <SiHackerrank size={16} className="text-green-500" /> HackerRank
                            </label>
                            <input
                                type="url"
                                name="social_hackerrank"
                                value={formData.socialLinks.hackerrank}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://hackerrank.com/username"
                            />
                        </div>
                    </div>
                </div>

                {/* Availability Section */}
                <div className="bg-dark-200 rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Available for Hire</h3>
                            <p className="text-gray-400 text-sm">Show a badge indicating you're open to opportunities</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="isAvailableForHire"
                                checked={formData.isAvailableForHire}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary flex items-center gap-2 px-8"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <FiSave /> Save Settings
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Change Password Section - Separate from main form */}
            <div className="mt-8 bg-dark-200 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-600/20 rounded-lg">
                        <FiLock className="text-red-400" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Change Password</h3>
                        <p className="text-gray-400 text-sm">Update your admin account password</p>
                    </div>
                </div>
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="label">Current Password</label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="input-field pr-10"
                                placeholder="Enter current password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPasswords.current ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="input-field pr-10"
                                    placeholder="Enter new password"
                                    minLength={6}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPasswords.new ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label className="label">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="input-field pr-10"
                                    placeholder="Confirm new password"
                                    minLength={6}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPasswords.confirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={changingPassword}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
                        >
                            {changingPassword ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Changing...
                                </>
                            ) : (
                                <>
                                    <FiLock size={16} /> Change Password
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
