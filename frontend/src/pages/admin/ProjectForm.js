import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    FiSave, FiArrowLeft, FiX, FiPlus, FiChevronDown, FiInfo, FiFileText,
    FiLink, FiLayers, FiPaperclip, FiUploadCloud, FiTrash2, FiExternalLink,
    FiGithub, FiYoutube, FiGlobe, FiStar
} from 'react-icons/fi';
import { projectsAPI, categoriesAPI, BACKEND_URL } from '../../services/api';
import Loading from '../../components/common/Loading';
import { quillFormats, quillToolbar, attachImageDeleteHandler } from '../../config/quillConfig';
import {
    ALLOWED_DOC_TYPES, MAX_DOC_BYTES, getFileMeta, formatBytes, FileTypeIcon
} from '../../config/fileHelpers';

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

const ACCEPT_ATTR = ALLOWED_DOC_TYPES.map(t => `.${t}`).join(',');

// Reusable section wrapper — icon chip + title + optional subtitle
const Section = ({ icon: Icon, title, subtitle, tint = 'text-primary-400 bg-primary-500/10', children, right }) => (
    <div className="card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tint}`}>
                    <Icon size={18} />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-white leading-tight">{title}</h2>
                    {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
            </div>
            {right}
        </div>
        {children}
    </div>
);

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
                        const imageUrl = json.url.startsWith('http') ? json.url : `${BACKEND_URL}${json.url}`;
                        uploadedUrls.push(imageUrl);
                    }
                } catch (err) {
                    console.error('Editor image upload error:', err);
                }
            }

            if (uploadedUrls.length === 0) {
                toast.error('Image upload failed');
                return;
            }

            const editor = quillRef.current?.getEditor?.() || quillRef.current?.editor;
            if (!editor) return;

            let insertAt = (editor.getSelection(true) || { index: editor.getLength() - 1 }).index;
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
        attachments: [],
        category: 'web',
        status: 'completed',
        featured: false,
        imageLayout: 'carousel'
    });
    const [techInput, setTechInput] = useState('');
    const [techCategory, setTechCategory] = useState('Frontend');
    const [validationErrors, setValidationErrors] = useState({});

    // Attachment upload state
    const [uploadingDocs, setUploadingDocs] = useState([]); // [{ id, name, progress }]
    const [dragActive, setDragActive] = useState(false);

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
                attachments: project.attachments || [],
                category: project.category || 'web',
                status: project.status || 'completed',
                featured: project.featured || false,
                imageLayout: project.imageLayout || 'carousel'
            });
        } catch (error) {
            console.error('Error fetching project:', error);
            toast.error('Failed to load project');
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

    // ----- Tech stack -----
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

    // ----- Attachments (documents) -----
    const handleFiles = useCallback(async (fileList) => {
        const files = Array.from(fileList || []);
        for (const file of files) {
            const ext = (file.name.split('.').pop() || '').toLowerCase();
            if (!ALLOWED_DOC_TYPES.includes(ext)) {
                toast.error(`"${file.name}" — unsupported type (.${ext})`);
                continue;
            }
            if (file.size > MAX_DOC_BYTES) {
                toast.error(`"${file.name}" exceeds the 25MB limit`);
                continue;
            }

            const tempId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            setUploadingDocs(prev => [...prev, { id: tempId, name: file.name, progress: 0 }]);

            try {
                const fd = new FormData();
                fd.append('file', file);
                const res = await projectsAPI.uploadDocument(fd, (evt) => {
                    const pct = evt.total ? Math.round((evt.loaded / evt.total) * 100) : 0;
                    setUploadingDocs(prev => prev.map(d => d.id === tempId ? { ...d, progress: pct } : d));
                });
                const data = res.data || {};
                if (!data.url) throw new Error('No URL returned');

                const newAtt = {
                    name: file.name.replace(/\.[^.]+$/, ''),
                    url: data.url,
                    format: (data.format || ext).toLowerCase(),
                    bytes: data.bytes || file.size,
                    uploadedAt: new Date().toISOString()
                };
                setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), newAtt] }));
                toast.success(`Uploaded "${file.name}"`);
            } catch (err) {
                console.error('Document upload error:', err);
                toast.error(err.response?.data?.message || `Failed to upload "${file.name}"`);
            } finally {
                setUploadingDocs(prev => prev.filter(d => d.id !== tempId));
            }
        }
    }, []);

    const onDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
    };
    const onDragOver = (e) => { e.preventDefault(); setDragActive(true); };
    const onDragLeave = (e) => { e.preventDefault(); setDragActive(false); };

    const renameAttachment = (idx, name) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.map((a, i) => i === idx ? { ...a, name } : a)
        }));
    };
    const removeAttachment = (idx) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== idx)
        }));
    };

    // ----- Submit -----
    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = {};
        if (!formData.title.trim()) errors.title = 'Project title is required';
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error('Please fix the highlighted fields');
            return;
        }
        if (uploadingDocs.length > 0) {
            toast.error('Please wait for uploads to finish');
            return;
        }

        setValidationErrors({});
        setSaving(true);

        try {
            const normalizedTechStack = normalizeTechStack(formData.techStack).map(item => ({
                name: item.name,
                category: item.category || 'Tools'
            }));

            const payload = {
                ...formData,
                techStack: normalizedTechStack,
                attachments: (formData.attachments || []).map(a => ({
                    name: (a.name || '').trim() || 'Document',
                    url: a.url,
                    format: a.format,
                    bytes: a.bytes,
                    uploadedAt: a.uploadedAt
                }))
            };

            if (isEdit) {
                await projectsAPI.update(id, payload);
                toast.success('Project updated');
            } else {
                await projectsAPI.create(payload);
                toast.success('Project created');
            }

            navigate('/admin/projects');
        } catch (error) {
            console.error('Error saving project:', error);
            toast.error(error.response?.data?.message || 'Failed to save project. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading text="Loading project..." />
            </div>
        );
    }

    const normalizedStack = normalizeTechStack(formData.techStack);
    const techGroups = {};
    normalizedStack.forEach(item => { (techGroups[item.category] = techGroups[item.category] || []).push(item); });
    const categoryOrder = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools'];
    const attachments = formData.attachments || [];

    return (
        <form onSubmit={handleSubmit} className="min-h-screen pb-16">
            {/* Sticky action bar */}
            <div className="sticky top-16 lg:top-0 z-20 bg-dark-200/85 backdrop-blur-md border-b border-gray-800/60">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/projects')}
                        className="p-2 -ml-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        title="Back to projects"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg font-bold text-white truncate">
                            {isEdit ? 'Edit Project' : 'New Project'}
                        </h1>
                        <p className="text-xs text-gray-500 truncate hidden sm:block">
                            {isEdit ? 'Update your project details and resources' : 'Add a new project to your portfolio'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/projects')}
                        className="btn-secondary hidden sm:inline-flex py-2 px-4"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-gradient inline-flex items-center gap-2 py-2.5 px-5 rounded-lg font-medium disabled:opacity-60"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <FiSave size={16} /> {isEdit ? 'Save changes' : 'Create project'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-6 space-y-5">
                {/* Project details */}
                <Section icon={FiInfo} title="Project details" subtitle="The essentials shown on cards and the project page">
                    <div className="space-y-4">
                        <div>
                            <label className="label">Project Title <span className="text-red-400">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={(e) => { handleChange(e); setValidationErrors(prev => ({ ...prev, title: '' })); }}
                                className={`input-field ${validationErrors.title ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder="My Awesome Project"
                            />
                            {validationErrors.title && <p className="text-red-400 text-sm mt-1.5">{validationErrors.title}</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label className="label">Short Description</label>
                                <span className="text-xs text-gray-600">{formData.shortDescription.length}/200</span>
                            </div>
                            <input
                                type="text"
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="A concise one-liner used on project cards"
                                maxLength={200}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Category</label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="input-field appearance-none pr-9"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div>
                                <label className="label">Status</label>
                                <div className="relative">
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="input-field appearance-none pr-9"
                                    >
                                        <option value="completed">Completed</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Featured toggle */}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}
                            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-colors ${formData.featured
                                ? 'border-amber-500/40 bg-amber-500/5'
                                : 'border-gray-800 bg-dark-200/40 hover:border-gray-700'}`}
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${formData.featured ? 'bg-amber-500/15 text-amber-400' : 'bg-gray-800 text-gray-500'}`}>
                                <FiStar size={18} className={formData.featured ? 'fill-amber-400' : ''} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white">Featured project</p>
                                <p className="text-xs text-gray-500">Highlight this project on your home page</p>
                            </div>
                            <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${formData.featured ? 'bg-amber-500' : 'bg-gray-700'}`}>
                                <span className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white transition-transform ${formData.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </span>
                        </button>
                    </div>
                </Section>

                {/* Overview / rich text */}
                <Section icon={FiFileText} title="Overview" subtitle="Tell the full story — add images, headings, and formatting" tint="text-sky-400 bg-sky-500/10">
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={formData.description}
                        onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Write a detailed description — the problem, your approach, key features, and results…"
                    />
                </Section>

                {/* Links */}
                <Section icon={FiLink} title="Links" subtitle="Where people can see the code and the live project" tint="text-emerald-400 bg-emerald-500/10">
                    <div className="space-y-4">
                        {[
                            { name: 'githubLink', label: 'GitHub Repository', icon: FiGithub, placeholder: 'https://github.com/username/repo' },
                            { name: 'liveDemoLink', label: 'Live Demo URL', icon: FiGlobe, placeholder: 'https://myproject.com' },
                            { name: 'youtubeLink', label: 'YouTube Video URL', icon: FiYoutube, placeholder: 'https://youtube.com/watch?v=…' }
                        ].map(({ name, label, icon: Icon, placeholder }) => (
                            <div key={name}>
                                <label className="label">{label}</label>
                                <div className="relative">
                                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="url"
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        className="input-field pl-10"
                                        placeholder={placeholder}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Tech stack */}
                <Section icon={FiLayers} title="Tech Stack" subtitle="The technologies that power this project" tint="text-violet-400 bg-violet-500/10">
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <input
                            type="text"
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech(); } }}
                            className="input-field flex-1"
                            placeholder="Add technology (e.g., React, Node.js)"
                        />
                        <div className="flex gap-2">
                            <div className="relative flex-1 sm:flex-initial">
                                <select
                                    value={techCategory}
                                    onChange={(e) => setTechCategory(e.target.value)}
                                    className="input-field appearance-none pr-8 sm:min-w-[140px] text-sm w-full"
                                >
                                    {techCategories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                                <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                            </div>
                            <button type="button" onClick={handleAddTech} className="btn-secondary flex items-center gap-2 whitespace-nowrap">
                                <FiPlus /> Add
                            </button>
                        </div>
                    </div>

                    {normalizedStack.length === 0 ? (
                        <p className="text-sm text-gray-600 italic">No technologies added yet.</p>
                    ) : (
                        categoryOrder.map(cat => {
                            const items = techGroups[cat];
                            if (!items || items.length === 0) return null;
                            const catInfo = techCategories.find(c => c.value === cat);
                            return (
                                <div key={cat} className="mb-3">
                                    <span className={`inline-block text-xs font-semibold uppercase tracking-wider mb-1.5 px-2 py-0.5 rounded border ${catInfo?.color || 'text-gray-400'}`}>
                                        {cat}
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {items.map((tech, index) => (
                                            <span key={index} className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 border ${catInfo?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                                                {tech.name}
                                                <button type="button" onClick={() => handleRemoveTech(tech)} className="hover:text-red-400 transition-colors">
                                                    <FiX size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </Section>

                {/* Documents & Resources */}
                <Section
                    icon={FiPaperclip}
                    title="Documents & Resources"
                    subtitle="Reports, slide decks and files — shown for viewing & download on the project page"
                    tint="text-amber-400 bg-amber-500/10"
                    right={attachments.length > 0 && (
                        <span className="text-xs font-medium text-gray-500 bg-dark-200 border border-gray-800 rounded-full px-2.5 py-1 shrink-0">
                            {attachments.length} file{attachments.length > 1 ? 's' : ''}
                        </span>
                    )}
                >
                    {/* Drop zone */}
                    <label
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`flex flex-col items-center justify-center gap-2 px-6 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${dragActive
                            ? 'border-primary-500 bg-primary-500/5'
                            : 'border-gray-700 hover:border-gray-600 bg-dark-200/40'}`}
                    >
                        <input
                            type="file"
                            multiple
                            accept={ACCEPT_ATTR}
                            className="hidden"
                            onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
                        />
                        <div className="w-11 h-11 rounded-full bg-dark-100 border border-gray-700 flex items-center justify-center">
                            <FiUploadCloud className="text-gray-400" size={20} />
                        </div>
                        <p className="text-sm text-gray-300">
                            <span className="text-primary-400 font-medium">Click to upload</span> or drag &amp; drop
                        </p>
                        <p className="text-xs text-gray-600 text-center">
                            PDF, PPT, DOC, XLS, CSV, TXT, ZIP · up to 25MB each
                        </p>
                    </label>

                    {/* In-progress uploads */}
                    {uploadingDocs.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {uploadingDocs.map(d => (
                                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-200/60 border border-gray-800">
                                    <div className="w-9 h-9 rounded-lg bg-dark-100 border border-gray-800 flex items-center justify-center shrink-0">
                                        <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-300 truncate">{d.name}</p>
                                        <div className="mt-1.5 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                                            <div className="h-full bg-primary-500 transition-all duration-200" style={{ width: `${d.progress}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 w-9 text-right">{d.progress}%</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Uploaded files */}
                    {attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {attachments.map((att, idx) => {
                                const meta = getFileMeta(att.format);
                                return (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-dark-200/60 border border-gray-800 hover:border-gray-700 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-dark-100 border border-gray-800 flex items-center justify-center shrink-0">
                                            <FileTypeIcon format={att.format} size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <input
                                                value={att.name}
                                                onChange={(e) => renameAttachment(idx, e.target.value)}
                                                className="w-full bg-transparent text-sm text-white font-medium focus:outline-none focus:bg-dark-100 rounded px-1.5 -ml-1.5 py-0.5 transition-colors"
                                                placeholder="Document name"
                                            />
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 px-0.5">
                                                <span className={`uppercase font-medium ${meta.tint}`}>{att.format}</span>
                                                {att.bytes > 0 && (<><span>·</span><span>{formatBytes(att.bytes)}</span></>)}
                                            </div>
                                        </div>
                                        <a
                                            href={att.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-gray-500 hover:text-white transition-colors"
                                            title="Open file"
                                        >
                                            <FiExternalLink size={16} />
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(idx)}
                                            className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                            title="Remove"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Section>

                {/* Bottom actions (mobile-friendly) */}
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => navigate('/admin/projects')} className="btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving} className="btn-gradient inline-flex items-center gap-2 py-2.5 px-5 rounded-lg font-medium disabled:opacity-60">
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <FiSave size={16} /> {isEdit ? 'Save changes' : 'Create project'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ProjectForm;
