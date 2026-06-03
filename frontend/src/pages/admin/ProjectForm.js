import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    FiSave, FiArrowLeft, FiX, FiPlus, FiChevronDown, FiInfo,
    FiLink, FiLayers, FiPaperclip, FiTrash2, FiExternalLink,
    FiGithub, FiYoutube, FiGlobe, FiStar, FiLayout
} from 'react-icons/fi';
import { projectsAPI, categoriesAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import CanvasEditor from '../../components/common/CanvasEditor';
import { emptyCanvas, normalizeCanvas } from '../../config/canvasHelpers';
import {
    DOC_TYPE_OPTIONS, guessDocType, getFileMeta, FileTypeIcon
} from '../../config/fileHelpers';
import { TECH_CATEGORIES, TECH_CATEGORY_ORDER, getTechCategory } from '../../config/techCategories';

const defaultCategories = [
    { value: 'web', label: '🌐 Web Development' },
    { value: 'mobile', label: '📱 Mobile App' },
    { value: 'desktop', label: '🖥️ Desktop' },
    { value: 'ai-ml', label: '🤖 AI/ML' },
    { value: 'other', label: '📁 Other' }
];

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

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState(defaultCategories);

    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        description: '',
        youtubeLink: '',
        liveDemoLink: '',
        githubLink: '',
        techStack: [],
        attachments: [],
        canvas: emptyCanvas(),
        category: 'web',
        status: 'completed',
        featured: false,
        imageLayout: 'carousel'
    });
    const [techInput, setTechInput] = useState('');
    const [techCategory, setTechCategory] = useState('Frontend');
    const [customCategory, setCustomCategory] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Draft for adding a document by shareable link
    const [docDraft, setDocDraft] = useState({ name: '', url: '', format: 'link' });

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
                canvas: normalizeCanvas(project.canvas),
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
        const effectiveCategory = techCategory === '__custom__'
            ? (customCategory.trim() || 'Other')
            : techCategory;
        if (name && !formData.techStack.some(t => (t.name || t) === name)) {
            setFormData(prev => ({
                ...prev,
                techStack: [...normalizeTechStack(prev.techStack), { name, category: effectiveCategory }]
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

    // ----- Attachments (documents via shareable links) -----
    const addAttachmentLink = () => {
        const name = (docDraft.name || '').trim();
        let url = (docDraft.url || '').trim();
        if (!url) {
            toast.error('Paste a shareable link first');
            return;
        }
        if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
        try {
            // eslint-disable-next-line no-new
            new URL(url);
        } catch (e) {
            toast.error('That doesn’t look like a valid link');
            return;
        }
        // Respect a manually-chosen type; otherwise infer from the URL
        const format = docDraft.format && docDraft.format !== 'link'
            ? docDraft.format
            : guessDocType(url);

        const newAtt = {
            name: name || 'Document',
            url,
            format,
            bytes: 0,
            uploadedAt: new Date().toISOString()
        };
        setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), newAtt] }));
        setDocDraft({ name: '', url: '', format: 'link' });
        toast.success('Resource added');
    };

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
    normalizedStack.forEach(item => {
        const c = item.category || 'Other';
        (techGroups[c] = techGroups[c] || []).push(item);
    });
    // Preset categories first (in order), then any custom ones the user typed
    const categoryOrder = [
        ...TECH_CATEGORY_ORDER.filter(c => techGroups[c]?.length),
        ...Object.keys(techGroups).filter(c => !TECH_CATEGORY_ORDER.includes(c)).sort()
    ];
    const attachments = formData.attachments || [];

    return (
        <form onSubmit={handleSubmit} className="min-h-screen pb-16">
            {/* Sticky action bar */}
            <div className="sticky top-16 lg:top-0 z-20 bg-dark-200/85 backdrop-blur-md border-b border-gray-800/60">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
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

            <div className="max-w-6xl mx-auto px-4 pt-6 space-y-5">
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
                                <span className="text-xs text-gray-600">{formData.shortDescription.length}/500</span>
                            </div>
                            <textarea
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleChange}
                                className="input-field resize-y min-h-[80px]"
                                rows={3}
                                placeholder="A short summary shown on cards and as the intro on the project page"
                                maxLength={500}
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

                {/* Project description — a free canvas of images + formatted text boxes */}
                <Section icon={FiLayout} title="Project Description" subtitle="Compose your project page — add images and text boxes anywhere, format the text, and drag to arrange" tint="text-amber-400 bg-amber-500/10">
                    <CanvasEditor
                        value={formData.canvas}
                        onChange={(canvas) => setFormData(prev => ({ ...prev, canvas }))}
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
                        <div className="flex flex-wrap gap-2">
                            <div className="relative flex-1 sm:flex-initial">
                                <select
                                    value={techCategory}
                                    onChange={(e) => setTechCategory(e.target.value)}
                                    className="input-field appearance-none pr-8 sm:min-w-[150px] text-sm w-full"
                                >
                                    {TECH_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                    <option value="__custom__">+ Custom…</option>
                                </select>
                                <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                            </div>
                            {techCategory === '__custom__' && (
                                <input
                                    type="text"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech(); } }}
                                    className="input-field text-sm w-full sm:w-36"
                                    placeholder="Category name"
                                    autoFocus
                                />
                            )}
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
                            const meta = getTechCategory(cat);
                            return (
                                <div key={cat} className="mb-3">
                                    <span className={`inline-block text-xs font-semibold uppercase tracking-wider mb-1.5 px-2 py-0.5 rounded border ${meta.chip}`}>
                                        {meta.label}
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {items.map((tech, index) => (
                                            <span key={index} className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 border ${meta.chip}`}>
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
                    subtitle="Add reports, slide decks and files by pasting a shareable link (Google Drive, Dropbox, OneDrive…)"
                    tint="text-amber-400 bg-amber-500/10"
                    right={attachments.length > 0 && (
                        <span className="text-xs font-medium text-gray-500 bg-dark-200 border border-gray-800 rounded-full px-2.5 py-1 shrink-0">
                            {attachments.length} item{attachments.length > 1 ? 's' : ''}
                        </span>
                    )}
                >
                    {/* Add a resource by shareable link */}
                    <div className="rounded-xl border border-gray-800 bg-dark-200/40 p-4 space-y-3">
                        <div className="grid sm:grid-cols-[1fr_12rem] gap-3">
                            <input
                                type="text"
                                value={docDraft.name}
                                onChange={(e) => setDocDraft(d => ({ ...d, name: e.target.value }))}
                                placeholder="Name (e.g. Final Report, Slide Deck)"
                                className="input-field"
                            />
                            <div className="relative">
                                <select
                                    value={docDraft.format}
                                    onChange={(e) => setDocDraft(d => ({ ...d, format: e.target.value }))}
                                    className="input-field appearance-none pr-9"
                                >
                                    {DOC_TYPE_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
                                <input
                                    type="url"
                                    value={docDraft.url}
                                    onChange={(e) => setDocDraft(d => ({ ...d, url: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAttachmentLink(); } }}
                                    placeholder="Paste shareable link…"
                                    className="input-field pl-9"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addAttachmentLink}
                                className="btn-secondary inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                            >
                                <FiPlus size={16} /> Add
                            </button>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            In Google Drive: right-click the file → <span className="text-gray-400">Share</span> → set access to
                            <span className="text-gray-400"> “Anyone with the link”</span> → <span className="text-gray-400">Copy link</span>, then paste it above.
                        </p>
                    </div>

                    {/* Added resources */}
                    {attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {attachments.map((att, idx) => {
                                const meta = getFileMeta(att.format);
                                return (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-dark-200/60 border border-gray-800 hover:border-gray-700 transition-colors">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${meta.badge}`}>
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
                                                <span className={`uppercase font-medium ${meta.tint}`}>{meta.label}</span>
                                                <span>·</span>
                                                <a
                                                    href={att.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="truncate hover:text-primary-400 transition-colors"
                                                    title={att.url}
                                                >
                                                    {att.url.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        </div>
                                        <a
                                            href={att.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-gray-500 hover:text-white transition-colors"
                                            title="Open link"
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
