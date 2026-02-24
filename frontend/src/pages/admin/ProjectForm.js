import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FiSave, FiArrowLeft, FiX, FiPlus, FiImage, FiGrid, FiColumns } from 'react-icons/fi';
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
                        uploadedUrls.push(`${BACKEND_URL}${json.url}`);
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
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

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
            setExistingImages(project.images || []);
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

    const handleAddTech = () => {
        if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
            setFormData(prev => ({
                ...prev,
                techStack: [...prev.techStack, techInput.trim()]
            }));
            setTechInput('');
        }
    };

    const handleRemoveTech = (tech) => {
        setFormData(prev => ({
            ...prev,
            techStack: prev.techStack.filter(t => t !== tech)
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);
    };

    const handleRemoveNewImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = async (index) => {
        const imagePath = existingImages[index];
        if (!window.confirm('Are you sure you want to remove this image? This cannot be undone.')) return;

        try {
            await projectsAPI.removeImage(id, imagePath);
            setExistingImages(prev => prev.filter((_, i) => i !== index));
        } catch (error) {
            console.error('Error removing image:', error);
            alert('Failed to remove image');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = new FormData();

            // Append text fields
            Object.keys(formData).forEach(key => {
                if (key === 'techStack') {
                    data.append(key, formData[key].join(','));
                } else {
                    data.append(key, formData[key]);
                }
            });

            // Append new images
            images.forEach(image => {
                data.append('images', image);
            });

            if (isEdit) {
                // For edit, we might want to keep existing images
                data.append('existingImages', JSON.stringify(existingImages));
                await projectsAPI.update(id, data);
            } else {
                await projectsAPI.create(data);
            }

            navigate('/admin/projects');
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Failed to save project');
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
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="My Awesome Project"
                                    required
                                />
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
                                <label className="label">Full Description *</label>
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
                            <button
                                type="button"
                                onClick={handleAddTech}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <FiPlus /> Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {formData.techStack.map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-sm flex items-center gap-2"
                                >
                                    {tech}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTech(tech)}
                                        className="hover:text-red-400"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Images</h2>

                            {/* Layout Toggle */}
                            <div className="flex items-center gap-1 bg-dark-200 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, imageLayout: 'carousel' }))}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${formData.imageLayout === 'carousel'
                                            ? 'bg-primary-600 text-white'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <FiColumns size={14} /> Carousel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, imageLayout: 'grid' }))}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${formData.imageLayout === 'grid'
                                            ? 'bg-primary-600 text-white'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <FiGrid size={14} /> Grid
                                </button>
                            </div>
                        </div>

                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div className="mb-4">
                                <p className="text-gray-400 text-sm mb-2">Existing Images ({existingImages.length})</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {existingImages.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={getImageUrl(img)}
                                                alt={`Existing ${index + 1}`}
                                                className="w-full aspect-square object-cover rounded-lg bg-dark-200"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('bg-dark-200'); }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingImage(index)}
                                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Images */}
                        {images.length > 0 && (
                            <div className="mb-4">
                                <p className="text-gray-400 text-sm mb-2">New Images ({images.length})</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {images.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt={`New ${index + 1}`}
                                                className="w-full aspect-square object-cover rounded-lg bg-dark-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNewImage(index)}
                                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                            <FiImage className="text-gray-500 mb-2" size={32} />
                            <span className="text-gray-400 text-sm">Click to upload images</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>

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
