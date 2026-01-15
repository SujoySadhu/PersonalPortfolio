import React, { useState, useEffect } from 'react';
import { 
    FiPlus, FiEdit2, FiTrash2, FiGrid, FiEye, FiEyeOff,
    FiFolder, FiCode, FiFileText, FiAward, FiRefreshCw, FiEdit3,
    FiHeart, FiActivity
} from 'react-icons/fi';
import { categoriesAPI } from '../../services/api';
import Spinner from '../../components/common/Spinner';

const sectionIcons = {
    project: FiFolder,
    skill: FiCode,
    research: FiFileText,
    achievement: FiAward,
    blog: FiEdit3,
    interest: FiHeart,
    currentwork: FiActivity
};

const sectionLabels = {
    project: 'Projects',
    skill: 'Skills',
    research: 'Research',
    achievement: 'Achievements',
    blog: 'Blog',
    interest: 'Interests',
    currentwork: 'Current Work'
};

const colorOptions = [
    { value: 'from-blue-500 to-cyan-500', label: 'Blue', preview: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
    { value: 'from-green-500 to-emerald-500', label: 'Green', preview: 'bg-gradient-to-r from-green-500 to-emerald-500' },
    { value: 'from-purple-500 to-violet-500', label: 'Purple', preview: 'bg-gradient-to-r from-purple-500 to-violet-500' },
    { value: 'from-yellow-500 to-amber-500', label: 'Yellow', preview: 'bg-gradient-to-r from-yellow-500 to-amber-500' },
    { value: 'from-red-500 to-orange-500', label: 'Red', preview: 'bg-gradient-to-r from-red-500 to-orange-500' },
    { value: 'from-pink-500 to-rose-500', label: 'Pink', preview: 'bg-gradient-to-r from-pink-500 to-rose-500' },
    { value: 'from-indigo-500 to-blue-500', label: 'Indigo', preview: 'bg-gradient-to-r from-indigo-500 to-blue-500' },
    { value: 'from-teal-500 to-cyan-500', label: 'Teal', preview: 'bg-gradient-to-r from-teal-500 to-cyan-500' },
    { value: 'from-gray-500 to-slate-500', label: 'Gray', preview: 'bg-gradient-to-r from-gray-500 to-slate-500' }
];

const emojiOptions = ['📁', '🌐', '📱', '🤖', '📊', '⚙️', '🎨', '🗄️', '🚀', '🔧', '💻', '📦', '📄', '🎤', '📚', '🎓', '💡', '📝', '🏆', '📜', '🎖️', '⭐', '🔥', '💎', '🎯', '🛠️', '🧠', '🔬', '🎮', '☁️'];

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [seeding, setSeeding] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        section: 'project',
        icon: '📁',
        color: 'from-gray-500 to-slate-500',
        description: '',
        order: 0
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoriesAPI.getAll();
            setCategories(response.data.data);
        } catch (err) {
            setError('Failed to load categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSeedCategories = async () => {
        try {
            setSeeding(true);
            await categoriesAPI.seed();
            fetchCategories();
        } catch (err) {
            console.error('Failed to seed categories:', err);
        } finally {
            setSeeding(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoriesAPI.update(editingCategory._id, formData);
            } else {
                await categoriesAPI.create(formData);
            }
            setShowModal(false);
            setEditingCategory(null);
            resetForm();
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save category');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            section: category.section,
            icon: category.icon,
            color: category.color,
            description: category.description || '',
            order: category.order || 0
        });
        setShowModal(true);
    };

    const handleToggle = async (id) => {
        try {
            await categoriesAPI.toggle(id);
            fetchCategories();
        } catch (err) {
            console.error('Failed to toggle category:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await categoriesAPI.delete(id);
            setDeleteConfirm(null);
            fetchCategories();
        } catch (err) {
            console.error('Failed to delete category:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            section: 'project',
            icon: '📁',
            color: 'from-gray-500 to-slate-500',
            description: '',
            order: 0
        });
    };

    const openAddModal = () => {
        setEditingCategory(null);
        resetForm();
        setShowModal(true);
    };

    const filteredCategories = selectedSection === 'all' 
        ? categories 
        : categories.filter(c => c.section === selectedSection);

    const getCategoryCounts = () => {
        const counts = { all: categories.length };
        ['project', 'skill', 'research', 'achievement'].forEach(section => {
            counts[section] = categories.filter(c => c.section === section).length;
        });
        return counts;
    };

    const counts = getCategoryCounts();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FiGrid className="text-primary-500" />
                        Manage Categories
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Customize categories for all sections
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSeedCategories}
                        disabled={seeding}
                        className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <FiRefreshCw size={18} className={seeding ? 'animate-spin' : ''} />
                        {seeding ? 'Seeding...' : 'Seed Defaults'}
                    </button>
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                        <FiPlus size={18} />
                        Add Category
                    </button>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setSelectedSection('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSection === 'all'
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-200 text-gray-400 hover:bg-dark-300 hover:text-white border border-gray-700'
                    }`}
                >
                    All ({counts.all})
                </button>
                {Object.entries(sectionLabels).map(([key, label]) => {
                    const Icon = sectionIcons[key];
                    return (
                        <button
                            key={key}
                            onClick={() => setSelectedSection(key)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedSection === key
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-dark-200 text-gray-400 hover:bg-dark-300 hover:text-white border border-gray-700'
                            }`}
                        >
                            <Icon size={16} />
                            {label} ({counts[key]})
                        </button>
                    );
                })}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
                    {error}
                    <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>
                </div>
            )}

            {/* Categories Grid */}
            {filteredCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map((category) => {
                        const SectionIcon = sectionIcons[category.section];
                        return (
                            <div
                                key={category._id}
                                className={`bg-dark-200 rounded-xl border p-4 transition-all ${
                                    category.isActive 
                                        ? 'border-gray-700 hover:border-primary-500/50' 
                                        : 'border-gray-800 opacity-60'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl`}>
                                            {category.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium">{category.name}</h3>
                                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                <SectionIcon size={12} />
                                                <span className="capitalize">{category.section}</span>
                                                <span>•</span>
                                                <span>Order: {category.order}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {!category.isActive && (
                                        <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                                            Inactive
                                        </span>
                                    )}
                                </div>

                                {category.description && (
                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                        {category.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-700">
                                    <button
                                        onClick={() => handleToggle(category._id)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            category.isActive
                                                ? 'text-green-400 hover:bg-green-500/10'
                                                : 'text-gray-500 hover:bg-gray-700'
                                        }`}
                                        title={category.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {category.isActive ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-dark-300 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <FiEdit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(category._id)}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-300 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-dark-200 rounded-xl border border-gray-800">
                    <div className="text-6xl mb-4">📁</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Categories Found</h3>
                    <p className="text-gray-400 mb-6">
                        {selectedSection !== 'all' 
                            ? `No categories for ${sectionLabels[selectedSection]} yet.`
                            : 'Start by adding your first category or seed defaults.'}
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={handleSeedCategories}
                            className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <FiRefreshCw size={18} />
                            Seed Defaults
                        </button>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <FiPlus size={18} />
                            Add Category
                        </button>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-200 rounded-xl p-6 max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-white mb-6">
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Category name"
                                    className="w-full bg-dark-300 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                                />
                            </div>

                            {/* Section */}
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Section *
                                </label>
                                <select
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    className="w-full bg-dark-300 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                                >
                                    {Object.entries(sectionLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Icon */}
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Icon
                                </label>
                                <div className="flex flex-wrap gap-2 p-3 bg-dark-300 border border-gray-700 rounded-lg max-h-32 overflow-y-auto">
                                    {emojiOptions.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: emoji })}
                                            className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg transition-all ${
                                                formData.icon === emoji
                                                    ? 'bg-primary-500 ring-2 ring-primary-400'
                                                    : 'bg-dark-200 hover:bg-gray-700'
                                            }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Color
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            className={`w-10 h-10 rounded-lg ${color.preview} transition-all ${
                                                formData.color === color.value
                                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-200'
                                                    : 'opacity-70 hover:opacity-100'
                                            }`}
                                            title={color.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    placeholder="Optional description"
                                    className="w-full bg-dark-300 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                                />
                            </div>

                            {/* Order */}
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    min="0"
                                    className="w-full bg-dark-300 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                                />
                                <p className="text-gray-500 text-xs mt-1">Lower numbers appear first</p>
                            </div>

                            {/* Preview */}
                            <div className="pt-4 border-t border-gray-700">
                                <p className="text-gray-400 text-sm mb-2">Preview:</p>
                                <div className="flex items-center gap-3 p-3 bg-dark-300 rounded-lg">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${formData.color} flex items-center justify-center text-2xl`}>
                                        {formData.icon}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{formData.name || 'Category Name'}</p>
                                        <p className="text-gray-500 text-sm capitalize">{formData.section}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingCategory(null);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                                >
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-200 rounded-xl p-6 max-w-md w-full border border-gray-700">
                        <h3 className="text-xl font-semibold text-white mb-4">Delete Category?</h3>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to delete this category? Items using this category won't be deleted but may need reassignment.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
