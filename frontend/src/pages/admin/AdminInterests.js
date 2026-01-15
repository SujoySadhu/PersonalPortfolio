import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import { interestsAPI, categoriesAPI } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const AdminInterests = () => {
    const [interests, setInterests] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: '💡',
        category: '',
        links: [],
        order: 0
    });
    const [imageFile, setImageFile] = useState(null);
    const [linkInput, setLinkInput] = useState({ title: '', url: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [interestsRes, categoriesRes] = await Promise.all([
                interestsAPI.getAll(),
                categoriesAPI.getBySection('interest')
            ]);
            setInterests(interestsRes.data.data || []);
            setCategories(categoriesRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load interests');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            icon: '💡',
            category: '',
            links: [],
            order: 0
        });
        setImageFile(null);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (interest) => {
        setFormData({
            title: interest.title,
            description: interest.description,
            icon: interest.icon || '💡',
            category: interest.category || '',
            links: interest.links || [],
            order: interest.order || 0
        });
        setEditingId(interest._id);
        setShowForm(true);
    };

    const handleAddLink = () => {
        if (linkInput.title && linkInput.url) {
            setFormData(prev => ({
                ...prev,
                links: [...prev.links, { ...linkInput }]
            }));
            setLinkInput({ title: '', url: '' });
        }
    };

    const handleRemoveLink = (index) => {
        setFormData(prev => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('icon', formData.icon);
            submitData.append('category', formData.category);
            submitData.append('links', JSON.stringify(formData.links));
            submitData.append('order', formData.order);
            if (imageFile) submitData.append('image', imageFile);

            if (editingId) {
                await interestsAPI.update(editingId, submitData);
                toast.success('Interest updated successfully');
            } else {
                await interestsAPI.create(submitData);
                toast.success('Interest created successfully');
            }
            resetForm();
            fetchData();
        } catch (error) {
            toast.error('Failed to save interest');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this interest?')) {
            try {
                await interestsAPI.delete(id);
                toast.success('Interest deleted');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete interest');
            }
        }
    };

    const handleToggle = async (id) => {
        try {
            await interestsAPI.toggle(id);
            fetchData();
        } catch (error) {
            toast.error('Failed to toggle status');
        }
    };

    const emojiOptions = ['💡', '🎮', '📚', '🎵', '🎨', '⚽', '🏃', '🧘', '🎬', '📷', '✈️', '🍳', '🌱', '🔬', '💻', '🎯'];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Interests</h1>
                    <p className="text-gray-400">Manage your interests and hobbies</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <FiPlus /> Add Interest
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-100 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {editingId ? 'Edit Interest' : 'Add Interest'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat.name}>{cat.icon} {cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label">Icon</label>
                                <div className="flex flex-wrap gap-2">
                                    {emojiOptions.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: emoji })}
                                            className={`w-10 h-10 text-xl rounded-lg ${
                                                formData.icon === emoji ? 'bg-primary-600' : 'bg-dark-200'
                                            }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="label">Links</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Link title"
                                        value={linkInput.title}
                                        onChange={(e) => setLinkInput({ ...linkInput, title: e.target.value })}
                                        className="input-field flex-1"
                                    />
                                    <input
                                        type="url"
                                        placeholder="URL"
                                        value={linkInput.url}
                                        onChange={(e) => setLinkInput({ ...linkInput, url: e.target.value })}
                                        className="input-field flex-1"
                                    />
                                    <button type="button" onClick={handleAddLink} className="btn-secondary">
                                        Add
                                    </button>
                                </div>
                                {formData.links.map((link, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-dark-200 px-3 py-2 rounded mb-1">
                                        <span className="text-gray-300">{link.title}</span>
                                        <span className="text-gray-500 text-sm truncate flex-1">{link.url}</span>
                                        <button type="button" onClick={() => handleRemoveLink(index)} className="text-red-400">×</button>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="label">Order</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    className="input-field w-24"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="btn-primary flex-1">
                                    {editingId ? 'Update' : 'Create'}
                                </button>
                                <button type="button" onClick={resetForm} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : interests.length === 0 ? (
                <div className="text-center py-12 bg-dark-100 rounded-xl">
                    <div className="text-6xl mb-4">💡</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No interests yet</h3>
                    <p className="text-gray-400">Add your first interest to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {interests.map((interest) => (
                        <div key={interest._id} className={`bg-dark-100 rounded-xl p-4 border ${interest.isActive ? 'border-gray-800' : 'border-red-500/50 opacity-60'}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{interest.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-white">{interest.title}</h3>
                                        {interest.category && (
                                            <span className="text-xs text-gray-500">{interest.category}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleToggle(interest._id)}
                                        className={`p-2 rounded ${interest.isActive ? 'text-green-400' : 'text-gray-500'}`}
                                    >
                                        {interest.isActive ? <FiEye /> : <FiEyeOff />}
                                    </button>
                                    <button onClick={() => handleEdit(interest)} className="p-2 text-blue-400">
                                        <FiEdit2 />
                                    </button>
                                    <button onClick={() => handleDelete(interest._id)} className="p-2 text-red-400">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-2">{interest.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminInterests;
