import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiImage, FiX, FiPlus } from 'react-icons/fi';
import { blogsAPI, categoriesAPI, getImageUrl, BACKEND_URL } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const BlogForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [tagInput, setTagInput] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: [],
        author: '',
        published: false,
        featured: false,
        metaTitle: '',
        metaDescription: '',
        coverImage: null
    });

    useEffect(() => {
        fetchCategories();
        if (isEditing) {
            fetchBlog();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getBySection('blog');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBlog = async () => {
        try {
            setLoading(true);
            const response = await blogsAPI.getOne(id);
            const blog = response.data.data;
            setFormData({
                title: blog.title || '',
                content: blog.content || '',
                excerpt: blog.excerpt || '',
                category: blog.category || '',
                tags: blog.tags || [],
                author: blog.author || '',
                published: blog.published || false,
                featured: blog.featured || false,
                metaTitle: blog.metaTitle || '',
                metaDescription: blog.metaDescription || '',
                coverImage: null
            });
            if (blog.coverImage) {
                setImagePreview(getImageUrl(blog.coverImage));
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
            toast.error('Failed to load blog');
            navigate('/admin/blogs');
        } finally {
            setLoading(false);
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
            setFormData(prev => ({ ...prev, coverImage: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, coverImage: null }));
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        const tag = tagInput.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
        }
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }
        
        if (!formData.content.trim()) {
            toast.error('Content is required');
            return;
        }

        try {
            setSaving(true);
            const submitData = new FormData();
            
            submitData.append('title', formData.title);
            submitData.append('content', formData.content);
            if (formData.excerpt) submitData.append('excerpt', formData.excerpt);
            if (formData.category) submitData.append('category', formData.category);
            if (formData.tags.length > 0) {
                formData.tags.forEach(tag => submitData.append('tags[]', tag));
            }
            if (formData.author) submitData.append('author', formData.author);
            submitData.append('published', formData.published);
            submitData.append('featured', formData.featured);
            if (formData.metaTitle) submitData.append('metaTitle', formData.metaTitle);
            if (formData.metaDescription) submitData.append('metaDescription', formData.metaDescription);
            if (formData.coverImage) submitData.append('coverImage', formData.coverImage);

            if (isEditing) {
                await blogsAPI.update(id, submitData);
                toast.success('Blog updated successfully');
            } else {
                await blogsAPI.create(submitData);
                toast.success('Blog created successfully');
            }
            
            navigate('/admin/blogs');
        } catch (error) {
            console.error('Error saving blog:', error);
            toast.error(error.response?.data?.message || 'Failed to save blog');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/admin/blogs')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
                    </h1>
                    <p className="text-gray-600">
                        {isEditing ? 'Update your article' : 'Write a new article for your blog'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter blog title..."
                                className="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Content */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content * (HTML supported)
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows={15}
                                placeholder="Write your blog content here... HTML tags are supported for formatting."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Tip: Use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;code&gt;, &lt;pre&gt; for formatting.
                            </p>
                        </div>

                        {/* Excerpt */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Excerpt (Optional)
                            </label>
                            <textarea
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Brief summary of the post (auto-generated if left empty)"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* SEO Settings */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        name="metaTitle"
                                        value={formData.metaTitle}
                                        onChange={handleChange}
                                        placeholder="SEO title (defaults to post title)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meta Description
                                    </label>
                                    <textarea
                                        name="metaDescription"
                                        value={formData.metaDescription}
                                        onChange={handleChange}
                                        rows={2}
                                        placeholder="SEO description (defaults to excerpt)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Publish Settings */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publish</h3>
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="published"
                                        checked={formData.published}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-gray-700">Published</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-gray-700">Featured Post</span>
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full mt-6 inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? (
                                    <Spinner size="sm" />
                                ) : (
                                    <FiSave className="w-5 h-5" />
                                )}
                                {saving ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
                            </button>
                        </div>

                        {/* Cover Image */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Image</h3>
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Cover preview"
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors"
                                >
                                    <FiImage className="w-8 h-8" />
                                    <span>Upload Image</span>
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>

                        {/* Category */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat.name}>
                                        {cat.emoji} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                    >
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="text-gray-500 hover:text-red-500"
                                        >
                                            <FiX className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <form onSubmit={handleAddTag} className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Add tag..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                />
                                <button
                                    type="submit"
                                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    <FiPlus className="w-5 h-5" />
                                </button>
                            </form>
                        </div>

                        {/* Author */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Author</h3>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                placeholder="Author name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BlogForm;
