import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiX, FiPlus } from 'react-icons/fi';
import { researchAPI, categoriesAPI } from '../../services/api';
import Loading from '../../components/common/Loading';

const defaultTypes = [
    { value: 'journal', label: '📄 Journal Article' },
    { value: 'conference', label: '🎤 Conference Paper' },
    { value: 'thesis', label: '🎓 Thesis' },
    { value: 'preprint', label: '📝 Preprint' },
    { value: 'other', label: '📁 Other' }
];

const ResearchForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [types, setTypes] = useState(defaultTypes);
    const [formData, setFormData] = useState({
        title: '',
        abstract: '',
        journalName: '',
        conferenceName: '',
        publicationDate: '',
        pdfLink: '',
        doiLink: '',
        citations: 0,
        type: 'journal',
        featured: false
    });
    const [authors, setAuthors] = useState([]);
    const [authorInput, setAuthorInput] = useState('');
    const [keywords, setKeywords] = useState([]);
    const [keywordInput, setKeywordInput] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getBySection('research');
            if (response.data.data && response.data.data.length > 0) {
                const cats = response.data.data.map(cat => ({
                    value: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
                    label: `${cat.icon} ${cat.name}`
                }));
                setTypes(cats);
            }
        } catch (err) {
            console.log('Using default types');
        }
    };

    const fetchResearch = React.useCallback(async () => {
        try {
            const response = await researchAPI.getOne(id);
            const item = response.data.data;
            setFormData({
                title: item.title || '',
                abstract: item.abstract || '',
                journalName: item.journalName || '',
                conferenceName: item.conferenceName || '',
                publicationDate: item.publicationDate ? item.publicationDate.split('T')[0] : '',
                pdfLink: item.pdfLink || '',
                doiLink: item.doiLink || '',
                citations: item.citations || 0,
                type: item.type || 'journal',
                featured: item.featured || false
            });
            setAuthors(item.authors || []);
            setKeywords(item.keywords || []);
        } catch (error) {
            console.error('Error fetching research:', error);
            alert('Failed to load publication');
            navigate('/admin/research');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    React.useEffect(() => {
        if (isEdit) {
            fetchResearch();
        }
    }, [isEdit, fetchResearch]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddAuthor = () => {
        if (authorInput.trim() && !authors.includes(authorInput.trim())) {
            setAuthors([...authors, authorInput.trim()]);
            setAuthorInput('');
        }
    };

    const handleRemoveAuthor = (author) => {
        setAuthors(authors.filter(a => a !== author));
    };

    const handleAddKeyword = () => {
        if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
            setKeywords([...keywords, keywordInput.trim()]);
            setKeywordInput('');
        }
    };

    const handleRemoveKeyword = (keyword) => {
        setKeywords(keywords.filter(k => k !== keyword));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = {
                ...formData,
                authors,
                keywords
            };

            if (isEdit) {
                await researchAPI.update(id, data);
            } else {
                await researchAPI.create(data);
            }

            navigate('/admin/research');
        } catch (error) {
            console.error('Error saving research:', error);
            alert('Failed to save publication');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <Loading text="Loading publication..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/admin/research')}
                        className="p-2 bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {isEdit ? 'Edit Publication' : 'New Publication'}
                        </h1>
                        <p className="text-gray-400">
                            {isEdit ? 'Update publication details' : 'Add a new research publication'}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Research paper title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Abstract *</label>
                                <textarea
                                    name="abstract"
                                    value={formData.abstract}
                                    onChange={handleChange}
                                    rows="6"
                                    className="input-field resize-none"
                                    placeholder="Paper abstract..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="input-field"
                                    >
                                        {types.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="label">Publication Date</label>
                                    <input
                                        type="date"
                                        name="publicationDate"
                                        value={formData.publicationDate}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Journal Name</label>
                                    <input
                                        type="text"
                                        name="journalName"
                                        value={formData.journalName}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="e.g., IEEE Transactions"
                                    />
                                </div>

                                <div>
                                    <label className="label">Conference Name</label>
                                    <input
                                        type="text"
                                        name="conferenceName"
                                        value={formData.conferenceName}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="e.g., NeurIPS 2024"
                                    />
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
                                    Mark as Featured Publication
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Authors */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Authors</h2>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={authorInput}
                                onChange={(e) => setAuthorInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAuthor())}
                                className="input-field flex-1"
                                placeholder="Add author name"
                            />
                            <button
                                type="button"
                                onClick={handleAddAuthor}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <FiPlus /> Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {authors.map((author, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-sm flex items-center gap-2"
                                >
                                    {author}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAuthor(author)}
                                        className="hover:text-red-400"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Keywords */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Keywords</h2>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                                className="input-field flex-1"
                                placeholder="Add keyword"
                            />
                            <button
                                type="button"
                                onClick={handleAddKeyword}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <FiPlus /> Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {keywords.map((keyword, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm flex items-center gap-2"
                                >
                                    {keyword}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveKeyword(keyword)}
                                        className="hover:text-red-400"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Links</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="label">PDF Link</label>
                                <input
                                    type="url"
                                    name="pdfLink"
                                    value={formData.pdfLink}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="https://example.com/paper.pdf"
                                />
                            </div>

                            <div>
                                <label className="label">DOI Link</label>
                                <input
                                    type="url"
                                    name="doiLink"
                                    value={formData.doiLink}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="https://doi.org/10.xxxx/xxxxx"
                                />
                            </div>

                            <div>
                                <label className="label">Citations Count</label>
                                <input
                                    type="number"
                                    name="citations"
                                    value={formData.citations}
                                    onChange={handleChange}
                                    className="input-field"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/research')}
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
                                    <FiSave /> {isEdit ? 'Update Publication' : 'Create Publication'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResearchForm;
