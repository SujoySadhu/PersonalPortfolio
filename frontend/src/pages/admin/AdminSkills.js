import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import { skillsAPI, categoriesAPI } from '../../services/api';
import Loading from '../../components/common/Loading';

const defaultCategories = [
    { value: 'frontend', label: '🎨 Frontend' },
    { value: 'backend', label: '⚙️ Backend' },
    { value: 'database', label: '🗄️ Database' },
    { value: 'devops', label: '🚀 DevOps' },
    { value: 'tools', label: '🔧 Tools' },
    { value: 'languages', label: '💻 Languages' },
    { value: 'frameworks', label: '📦 Frameworks' },
    { value: 'other', label: '📁 Other' }
];

const AdminSkills = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState(defaultCategories);
    const [formData, setFormData] = useState({
        name: '',
        category: 'frontend',
        proficiency: 50,
        icon: ''
    });

    useEffect(() => {
        fetchCategories();
        fetchSkills();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getBySection('skill');
            if (response.data.data && response.data.data.length > 0) {
                const cats = response.data.data.map(cat => ({
                    value: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
                    label: `${cat.icon} ${cat.name}`
                }));
                setCategories(cats);
            }
        } catch (err) {
            console.log('Using default categories');
        }
    };

    const fetchSkills = async () => {
        try {
            const response = await skillsAPI.getAll();
            setSkills(response.data.data || []);
        } catch (error) {
            console.error('Error fetching skills:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (skill = null) => {
        if (skill) {
            setEditingSkill(skill);
            setFormData({
                name: skill.name,
                category: skill.category,
                proficiency: skill.proficiency,
                icon: skill.icon || ''
            });
        } else {
            setEditingSkill(null);
            setFormData({
                name: '',
                category: 'frontend',
                proficiency: 50,
                icon: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSkill(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'proficiency' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingSkill) {
                const response = await skillsAPI.update(editingSkill._id, formData);
                setSkills(skills.map(s => 
                    s._id === editingSkill._id ? response.data.data : s
                ));
            } else {
                const response = await skillsAPI.create(formData);
                setSkills([...skills, response.data.data]);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving skill:', error);
            alert(error.response?.data?.message || 'Failed to save skill');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this skill?')) return;

        try {
            await skillsAPI.delete(id);
            setSkills(skills.filter(s => s._id !== id));
        } catch (error) {
            console.error('Error deleting skill:', error);
            alert('Failed to delete skill');
        }
    };

    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) {
            acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <Loading text="Loading skills..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Manage Skills</h1>
                        <p className="text-gray-400">Add, edit, or remove your skills</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="btn-primary flex items-center gap-2"
                    >
                        <FiPlus /> Add Skill
                    </button>
                </div>

                {/* Skills by Category */}
                {Object.keys(groupedSkills).length > 0 ? (
                    <div className="space-y-8">
                        {categories.map(category => {
                            const categorySkills = groupedSkills[category.value];
                            if (!categorySkills || categorySkills.length === 0) return null;

                            return (
                                <div key={category.value} className="card p-6">
                                    <h2 className="text-xl font-semibold text-white mb-4">
                                        {category.label} ({categorySkills.length})
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {categorySkills.map(skill => (
                                            <div
                                                key={skill._id}
                                                className="bg-dark-200 rounded-lg p-4 flex items-center justify-between group"
                                            >
                                                <div className="flex-1">
                                                    <p className="text-white font-medium">{skill.name}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary-500 rounded-full"
                                                                style={{ width: `${skill.proficiency}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-gray-400 text-sm">
                                                            {skill.proficiency}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleOpenModal(skill)}
                                                        className="p-2 bg-gray-700 rounded text-gray-400 hover:text-primary-400"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(skill._id)}
                                                        className="p-2 bg-gray-700 rounded text-gray-400 hover:text-red-400"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card p-12 text-center">
                        <p className="text-gray-400 mb-4">No skills yet.</p>
                        <button 
                            onClick={() => handleOpenModal()}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <FiPlus /> Add Your First Skill
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-dark-100 rounded-xl w-full max-w-md p-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-white"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Skill Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g., React, Python"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">Proficiency ({formData.proficiency}%)</label>
                                <input
                                    type="range"
                                    name="proficiency"
                                    min="0"
                                    max="100"
                                    value={formData.proficiency}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Beginner</span>
                                    <span>Expert</span>
                                </div>
                            </div>

                            <div>
                                <label className="label">Icon (optional)</label>
                                <input
                                    type="text"
                                    name="icon"
                                    value={formData.icon}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Icon name or URL"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <FiSave /> Save
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSkills;
