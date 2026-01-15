import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiStar } from 'react-icons/fi';
import { currentWorkAPI, categoriesAPI } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const AdminCurrentWork = () => {
    const [works, setWorks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'project',
        category: '',
        status: 'in-progress',
        progress: 0,
        technologies: [],
        startDate: '',
        expectedEndDate: '',
        links: [],
        order: 0,
        isFeatured: false
    });
    const [imageFile, setImageFile] = useState(null);
    const [techInput, setTechInput] = useState('');
    const [linkInput, setLinkInput] = useState({ title: '', url: '' });

    const typeOptions = [
        { value: 'project', label: 'Project' },
        { value: 'learning', label: 'Learning' },
        { value: 'research', label: 'Research' },
        { value: 'other', label: 'Other' }
    ];

    const statusOptions = [
        { value: 'planning', label: 'Planning', color: 'bg-blue-500' },
        { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-500' },
        { value: 'testing', label: 'Testing', color: 'bg-purple-500' },
        { value: 'nearly-done', label: 'Nearly Done', color: 'bg-green-500' }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [worksRes, categoriesRes] = await Promise.all([
                currentWorkAPI.getAll(),
                categoriesAPI.getBySection('currentwork')
            ]);
            setWorks(worksRes.data.data || []);
            setCategories(categoriesRes.data.data || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'project',
            category: '',
            status: 'in-progress',
            progress: 0,
            technologies: [],
            startDate: '',
            expectedEndDate: '',
            links: [],
            order: 0,
            isFeatured: false
        });
        setImageFile(null);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (work) => {
        setFormData({
            title: work.title,
            description: work.description,
            type: work.type || 'project',
            category: work.category || '',
            status: work.status || 'in-progress',
            progress: work.progress || 0,
            technologies: work.technologies || [],
            startDate: work.startDate ? work.startDate.split('T')[0] : '',
            expectedEndDate: work.expectedEndDate ? work.expectedEndDate.split('T')[0] : '',
            links: work.links || [],
            order: work.order || 0,
            isFeatured: work.isFeatured || false
        });
        setEditingId(work._id);
        setShowForm(true);
    };

    const handleAddTech = () => {
        if (techInput.trim()) {
            setFormData(prev => ({
                ...prev,
                technologies: [...prev.technologies, techInput.trim()]
            }));
            setTechInput('');
        }
    };

    const handleRemoveTech = (index) => {
        setFormData(prev => ({
            ...prev,
            technologies: prev.technologies.filter((_, i) => i !== index)
        }));
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
            Object.keys(formData).forEach(key => {
                if (key === 'technologies' || key === 'links') {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else {
                    submitData.append(key, formData[key]);
                }
            });
            if (imageFile) submitData.append('image', imageFile);

            if (editingId) {
                await currentWorkAPI.update(editingId, submitData);
                toast.success('Updated successfully');
            } else {
                await currentWorkAPI.create(submitData);
                toast.success('Created successfully');
            }
            resetForm();
            fetchData();
        } catch (error) {
            toast.error('Failed to save');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await currentWorkAPI.delete(id);
                toast.success('Deleted');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    const handleToggleFeatured = async (id) => {
        try {
            await currentWorkAPI.toggleFeatured(id);
            fetchData();
        } catch (error) {
            toast.error('Failed');
        }
    };

    const getStatusColor = (status) => {
        return statusOptions.find(s => s.value === status)?.color || 'bg-gray-500';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Currently Working On</h1>
                    <p className="text-gray-400">Manage your active projects and learning goals</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
                    <FiPlus /> Add Work
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-100 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {editingId ? 'Edit Work' : 'Add Work'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
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
                                    <label className="label">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="input-field"
                                    >
                                        {typeOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
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
                                <div>
                                    <label className="label">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="input-field"
                                    >
                                        {statusOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Progress ({formData.progress}%)</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={formData.progress}
                                        onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="label">Expected End Date</label>
                                    <input
                                        type="date"
                                        value={formData.expectedEndDate}
                                        onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Technologies</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Add technology"
                                        value={techInput}
                                        onChange={(e) => setTechInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                                        className="input-field flex-1"
                                    />
                                    <button type="button" onClick={handleAddTech} className="btn-secondary">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.technologies.map((tech, index) => (
                                        <span key={index} className="px-3 py-1 bg-dark-200 text-gray-300 rounded-full text-sm flex items-center gap-1">
                                            {tech}
                                            <button type="button" onClick={() => handleRemoveTech(index)} className="text-red-400">×</button>
                                        </span>
                                    ))}
                                </div>
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
                                        placeholder="Title"
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
                                    <button type="button" onClick={handleAddLink} className="btn-secondary">Add</button>
                                </div>
                                {formData.links.map((link, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-dark-200 px-3 py-2 rounded mb-1">
                                        <span className="text-gray-300">{link.title}</span>
                                        <span className="text-gray-500 text-sm truncate flex-1">{link.url}</span>
                                        <button type="button" onClick={() => handleRemoveLink(index)} className="text-red-400">×</button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    Featured
                                </label>
                                <div>
                                    <label className="text-gray-300 mr-2">Order:</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="input-field w-20"
                                    />
                                </div>
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
            ) : works.length === 0 ? (
                <div className="text-center py-12 bg-dark-100 rounded-xl">
                    <div className="text-6xl mb-4">🔧</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Nothing yet</h3>
                    <p className="text-gray-400">Add what you're working on</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {works.map((work) => (
                        <div key={work._id} className={`bg-dark-100 rounded-xl p-4 border ${work.isFeatured ? 'border-primary-500' : 'border-gray-800'}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {work.isFeatured && (
                                            <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded">Featured</span>
                                        )}
                                        <span className={`px-2 py-1 ${getStatusColor(work.status)} text-white text-xs rounded`}>
                                            {statusOptions.find(s => s.value === work.status)?.label}
                                        </span>
                                        <span className="px-2 py-1 bg-dark-200 text-gray-400 text-xs rounded">
                                            {typeOptions.find(t => t.value === work.type)?.label}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">{work.title}</h3>
                                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{work.description}</p>
                                    <div className="mt-2">
                                        <div className="h-2 bg-dark-200 rounded-full overflow-hidden w-48">
                                            <div className={`h-full ${getStatusColor(work.status)}`} style={{ width: `${work.progress}%` }} />
                                        </div>
                                        <span className="text-xs text-gray-500">{work.progress}% complete</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 ml-4">
                                    <button
                                        onClick={() => handleToggleFeatured(work._id)}
                                        className={`p-2 rounded ${work.isFeatured ? 'text-yellow-400' : 'text-gray-500'}`}
                                    >
                                        <FiStar className={work.isFeatured ? 'fill-current' : ''} />
                                    </button>
                                    <button onClick={() => handleEdit(work)} className="p-2 text-blue-400">
                                        <FiEdit2 />
                                    </button>
                                    <button onClick={() => handleDelete(work._id)} className="p-2 text-red-400">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCurrentWork;
