import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FiSave, FiArrowLeft, FiX, FiPlus, FiImage, FiGrid, FiColumns, FiChevronDown } from 'react-icons/fi';
import { projectsAPI, categoriesAPI, getImageUrl, BACKEND_URL } from '../../services/api';
import Loading from '../../components/common/Loading';
import { quillFormats, quillToolbar, attachImageDeleteHandler } from '../../config/quillConfig';

const defaultCategories = [
    { value: 'web', label: '🌐 Web Development' },
    { value: 'mobile', label: '📱 Mobile App' },
    { value: 'desktop', label: '🖥️ Desktop' },
    { value: 'ai-ml', label: '🤖 AI/ML' },
    { value: 'other', label: '📁 Other' }
];

const techCategories = [
    { value: 'Frontend', label: 'Frontend', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'Backend', label: 'Backend', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { value: 'Database', label: 'Database', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
    { value: 'DevOps', label: 'DevOps', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { value: 'Tools', label: 'Tools', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
];

const ProjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const quillRef = useRef(null);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState(defaultCategories);

    // Custom image handler: uploads to server, supports multi-select
    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.setAttribute('multiple', 'true');
        input.click();
        input.onchange = async () => {
            const files = Array.from(input.files);
            if (!files.length) return;
            const token = localStorage.getItem('token');
            const uploadedUrls = [];

            for (const file of files) {
                const data = new FormData();
                data.append('image', file);
                try {
                    const res = await fetch(`${BACKEND_URL}/api/upload/editor-image`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: data,
                    });
                    if (!res.ok) {
                        console.error('Upload failed:', res.status);
                        continue;
                    }
                    const json = await res.json();
                    if (json.success && json.url) {
                        // Cloudinary returns full URLs, no need to prepend BACKEND_URL
                        const imageUrl = json.url.startsWith('http') ? json.url : `${BACKEND_URL}${json.url}`;
                        uploadedUrls.push(imageUrl);
                    }
                } catch (err) {
                    console.error('Editor image upload error:', err);
                }
            }

            if (uploadedUrls.length === 0) {
                alert('Image upload failed');
                return;
            }

            const editor = quillRef.current?.getEditor?.() || quillRef.current?.editor;
            if (!editor) return;

            let insertAt = (editor.getSelection(true) || { index: editor.getLength() - 1 }).index;

            // Insert each image one by one
            for (const url of uploadedUrls) {
                editor.insertEmbed(insertAt, 'image', url);
                insertAt += 1;
            }
            editor.setSelection(insertAt);
        };
    }, []);

    const quillModules = useMemo(() => ({
        toolbar: {
            container: quillToolbar,
            handlers: { image: imageHandler }
        }
    }), [imageHandler]);
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        description: '',
        youtubeLink: '',
        liveDemoLink: '',
        githubLink: '',
        techStack: [],
        category: 'web',
        status: 'completed',
        featured: false,
        imageLayout: 'carousel'
    });
    const [techInput, setTechInput] = useState('');
    const [techCategory, setTechCategory] = useState('Frontend');
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getBySection('project');
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

    const fetchProject = React.useCallback(async () => {
        try {
            const response = await projectsAPI.getOne(id);
            const project = response.data.data;
            setFormData({
                title: project.title || '',
                shortDescription: project.shortDescription || '',
                description: project.description || '',
                youtubeLink: project.youtubeLink || '',
                liveDemoLink: project.liveDemoLink || '',
                githubLink: project.githubLink || '',
                techStack: project.techStack || [],
                category: project.category || 'web',
                status: project.status || 'completed',
                featured: project.featured || false,
                imageLayout: project.imageLayout || 'carousel'
            });
        } catch (error) {
            console.error('Error fetching project:', error);
            alert('Failed to load project');
            navigate('/admin/projects');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    React.useEffect(() => {
        if (isEdit) {
            fetchProject();
        }
    }, [isEdit, fetchProject]);

    // Attach image delete handler to Quill editor
    useEffect(() => {
        let cleanup = () => { };
        const timer = setTimeout(() => {
            cleanup = attachImageDeleteHandler(quillRef) || (() => { });
        }, 500);
        return () => {
            clearTimeout(timer);
            cleanup();
        };
    }, [loading]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Normalize techStack items (handle legacy string format)
    const normalizeTechStack = (stack) => {
        if (!stack || !Array.isArray(stack)) return [];
        return stack.map(item => {
            if (typeof item === 'string') return { name: item, category: 'Tools' };
            return { name: item.name || '', category: item.category || 'Tools' };
        });
    };

    const handleAddTech = () => {
        const name = techInput.trim();
        if (name && !formData.techStack.some(t => (t.name || t) === name)) {
            setFormData(prev => ({
                ...prev,
                techStack: [...normalizeTechStack(prev.techStack), { name, category: techCategory }]
            }));
            setTechInput('');
        }
    };

    const handleRemoveTech = (tech) => {
        setFormData(prev => ({
            ...prev,
            techStack: normalizeTechStack(prev.techStack).filter(t => t.name !== tech.name)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Project title is required';

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors({});
        setSaving(true);

        try {
            // Normalize techStack
            const normalizedTechStack = normalizeTechStack(formData.techStack).map(item => ({
                name: item.name,
                category: item.category || 'Tools'
            }));

            // Build a plain JSON payload
            const payload = {
                ...formData,
                techStack: normalizedTechStack,
            };

            if (isEdit) {
                await projectsAPI.update(id, payload);
            } else {
                await projectsAPI.create(payload);
            }

            navigate('/admin/projects');
        } catch (error) {
            console.error('Error saving project:', error);
            const msg = error.response?.data?.message || 'Failed to save project. Please try again.';
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <Loading text="Loading project..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/admin/projects')}
                        className="p-2 bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {isEdit ? 'Edit Project' : 'New Project'}
                        </h1>
                        <p className="text-gray-400">
                            {isEdit ? 'Update project details' : 'Add a new project to your portfolio'}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Project Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={(e) => { handleChange(e); setValidationErrors(prev => ({...prev, title: ''})); }}
                                    className={`input-field ${validationErrors.title ? 'border-red-500' : ''}`}
                                    placeholder="My Awesome Project"
                                />
                                {validationErrors.title && <p className="text-red-400 text-sm mt-1">{validationErrors.title}</p>}
                            </div>

                            <div>
                                <label className="label">Short Description</label>
                                <input
                                    type="text"
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="A brief description for cards (max 200 chars)"
                                    maxLength={200}
                                />
                            </div>

                            <div>
                                <label className="label">Full Description (optional)</label>
                                <ReactQuill
                                    ref={quillRef}
                                    theme="snow"
                                    value={formData.description}
                                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder="Write detailed project description — add images, colors, different fonts..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="input-field"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="label">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="input-field"
                                    >
                                        <option value="completed">Completed</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    id="featured"
                                    checked={formData.featured}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-gray-700 bg-dark-200 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="featured" className="text-gray-300">
                                    Mark as Featured Project
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Links</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="label">GitHub Repository</label>
                                <input
                                    type="url"
                                    name="githubLink"
                                    value={formData.githubLink}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="https://github.com/username/repo"
                                />
                            </div>

                            <div>
                                <label className="label">Live Demo URL</label>
                                <input
                                    type="url"
                                    name="liveDemoLink"
                                    value={formData.liveDemoLink}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="https://myproject.com"
                                />
                            </div>

                            <div>
                                <label className="label">YouTube Video URL</label>
                                <input
                                    type="url"
                                    name="youtubeLink"
                                    value={formData.youtubeLink}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Tech Stack</h2>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                                className="input-field flex-1"
                                placeholder="Add technology (e.g., React, Node.js)"
                            />
                            <div className="relative">
                                <select
                                    value={techCategory}
                                    onChange={(e) => setTechCategory(e.target.value)}
                                    className="input-field appearance-none pr-8 min-w-[130px] text-sm"
                                >
                                    {techCategories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                                <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddTech}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <FiPlus /> Add
                            </button>
                        </div>

                        {/* Grouped tech display */}
                        {(() => {
                            const normalized = normalizeTechStack(formData.techStack);
                            const groups = {};
                            normalized.forEach(item => {
                                (groups[item.category] = groups[item.category] || []).push(item);
                            });
                            const categoryOrder = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools'];
                            return categoryOrder.map(cat => {
                                const items = groups[cat];
                                if (!items || items.length === 0) return null;
                                const catInfo = techCategories.find(c => c.value === cat);
                                return (
                                    <div key={cat} className="mb-3">
                                        <span className={`inline-block text-xs font-semibold uppercase tracking-wider mb-1.5 px-2 py-0.5 rounded border ${catInfo?.color || 'text-gray-400'}`}>
                                            {cat}
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {items.map((tech, index) => (
                                                <span
                                                    key={index}
                                                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 border ${catInfo?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}
                                                >
                                                    {tech.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTech(tech)}
                                                        className="hover:text-red-400 transition-colors"
                                                    >
                                                        <FiX size={14} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>

                    {/* Images section removed as per request */}

                    {/* Submit */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/projects')}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FiSave /> {isEdit ? 'Update Project' : 'Create Project'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectForm;
