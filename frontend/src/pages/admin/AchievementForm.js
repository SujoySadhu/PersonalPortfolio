import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiAward } from 'react-icons/fi';
import { achievementsAPI, categoriesAPI } from '../../services/api';
import Spinner from '../../components/common/Spinner';

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Fallback categories if API fails
const defaultCategories = [
    { value: 'competition', label: '🏆 Competition', icon: '🏆', color: 'from-blue-500 to-cyan-500', description: 'Contest wins, programming competitions' },
    { value: 'certification', label: '📜 Certification', icon: '📜', color: 'from-green-500 to-emerald-500', description: 'Professional certifications, courses' },
    { value: 'award', label: '🎖️ Award', icon: '🎖️', color: 'from-yellow-500 to-amber-500', description: 'Recognition, honors, medals' },
    { value: 'publication', label: '📚 Publication', icon: '📚', color: 'from-purple-500 to-violet-500', description: 'Research papers, articles, books' },
    { value: 'hackathon', label: '💻 Hackathon', icon: '💻', color: 'from-red-500 to-orange-500', description: 'Hackathon wins and participations' },
    { value: 'scholarship', label: '🎓 Scholarship', icon: '🎓', color: 'from-pink-500 to-rose-500', description: 'Academic scholarships, grants' },
    { value: 'other', label: '⭐ Other', icon: '⭐', color: 'from-gray-500 to-slate-500', description: 'Other achievements' }
];

const AchievementForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [categories, setCategories] = useState(defaultCategories);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'award',
        date: '',
        issuer: '',
        credentialLink: '',
        position: '',
        featured: false,
        order: 0
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetchCategories();
        if (isEditing) {
            fetchAchievement();
        }
        // eslint-disable-next-line
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getBySection('achievement');
            if (response.data.data && response.data.data.length > 0) {
                const cats = response.data.data.map(cat => ({
                    value: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
                    label: `${cat.icon} ${cat.name}`,
                    icon: cat.icon,
                    color: cat.color,
                    description: cat.description || ''
                }));
                setCategories(cats);
            }
        } catch (err) {
            console.log('Using default categories');
        }
    };

    const fetchAchievement = async () => {
        try {
            setFetching(true);
            const response = await achievementsAPI.getOne(id);
            const achievement = response.data.data;
            
            // Format date for input
            let formattedDate = '';
            if (achievement.date) {
                const date = new Date(achievement.date);
                formattedDate = date.toISOString().split('T')[0];
            }

            setFormData({
                title: achievement.title || '',
                description: achievement.description || '',
                category: achievement.category || 'award',
                date: formattedDate,
                issuer: achievement.issuer || '',
                credentialLink: achievement.credentialLink || '',
                position: achievement.position || '',
                featured: achievement.featured || false,
                order: achievement.order || 0
            });

            if (achievement.image) {
                setImagePreview(achievement.image.startsWith('http') ? achievement.image : `${API_URL}${achievement.image}`);
            }
        } catch (err) {
            setError('Failed to fetch achievement');
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const submitData = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '' && formData[key] !== null) {
                    submitData.append(key, formData[key]);
                }
            });

            if (imageFile) {
                submitData.append('image', imageFile);
            }

            if (isEditing) {
                await achievementsAPI.update(id, submitData);
            } else {
                await achievementsAPI.create(submitData);
            }

            navigate('/admin/achievements');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save achievement');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    to="/admin/achievements"
                    className="p-2 text-gray-400 hover:text-white hover:bg-dark-200 rounded-lg transition-colors"
                >
                    <FiArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FiAward className="text-primary-500" />
                        {isEditing ? 'Edit Achievement' : 'Add New Achievement'}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {isEditing ? 'Update achievement details' : 'Add a new achievement to your portfolio'}
                    </p>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div className="bg-dark-200 rounded-xl p-6 border border-gray-800">
                            <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., First Place in ACM ICPC Regional"
                                        className="w-full bg-dark-300 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Describe your achievement..."
                                        className="w-full bg-dark-300 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Issuer / Organization
                                        </label>
                                        <input
                                            type="text"
                                            name="issuer"
                                            value={formData.issuer}
                                            onChange={handleChange}
                                            placeholder="e.g., ACM, Google, MIT"
                                            className="w-full bg-dark-300 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Position / Rank
                                        </label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleChange}
                                            placeholder="e.g., 1st Place, Top 10%"
                                            className="w-full bg-dark-300 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="bg-dark-200 rounded-xl p-6 border border-gray-800">
                            <h2 className="text-lg font-semibold text-white mb-4">Additional Details</h2>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Date Achieved
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="w-full bg-dark-300 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Display Order
                                        </label>
                                        <input
                                            type="number"
                                            name="order"
                                            value={formData.order}
                                            onChange={handleChange}
                                            min="0"
                                            placeholder="0"
                                            className="w-full bg-dark-300 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                                        />
                                        <p className="text-gray-500 text-xs mt-1">Lower numbers appear first</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Credential / Certificate Link
                                    </label>
                                    <input
                                        type="url"
                                        name="credentialLink"
                                        value={formData.credentialLink}
                                        onChange={handleChange}
                                        placeholder="https://example.com/certificate"
                                        className="w-full bg-dark-300 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                                    />
                                </div>

                                {/* Featured Checkbox */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        id="featured"
                                        checked={formData.featured}
                                        onChange={handleChange}
                                        className="w-5 h-5 bg-dark-300 border border-gray-700 rounded text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-200"
                                    />
                                    <label htmlFor="featured" className="text-gray-300 cursor-pointer">
                                        Mark as Featured Achievement
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Category */}
                        <div className="bg-dark-200 rounded-xl p-6 border border-gray-800">
                            <h2 className="text-lg font-semibold text-white mb-4">Category</h2>
                            
                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <label
                                        key={cat.value}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                            formData.category === cat.value
                                                ? 'bg-primary-500/10 border-primary-500/50 text-white'
                                                : 'bg-dark-300 border-gray-700 text-gray-400 hover:border-gray-600'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="category"
                                            value={cat.value}
                                            checked={formData.category === cat.value}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <span className="text-lg">{cat.label.split(' ')[0]}</span>
                                        <div>
                                            <div className="font-medium text-sm">{cat.label.split(' ').slice(1).join(' ')}</div>
                                            <div className="text-xs text-gray-500">{cat.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="bg-dark-200 rounded-xl p-6 border border-gray-800">
                            <h2 className="text-lg font-semibold text-white mb-4">Image</h2>
                            
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-primary-500/50 transition-colors">
                                    <FiUpload className="text-gray-400 mb-2" size={24} />
                                    <span className="text-gray-400 text-sm">Upload Image</span>
                                    <span className="text-gray-500 text-xs mt-1">PNG, JPG up to 5MB</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-800">
                    <Link
                        to="/admin/achievements"
                        className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white px-6 py-2.5 rounded-lg transition-colors font-medium"
                    >
                        {loading ? (
                            <>
                                <Spinner size="sm" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <FiSave size={18} />
                                {isEditing ? 'Update Achievement' : 'Create Achievement'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AchievementForm;
