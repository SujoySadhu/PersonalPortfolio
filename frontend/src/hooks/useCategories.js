import { useState, useEffect } from 'react';
import { categoriesAPI } from '../services/api';

export const useCategories = (section) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await categoriesAPI.getBySection(section);
                setCategories(response.data.data);
            } catch (err) {
                setError('Failed to load categories');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (section) {
            fetchCategories();
        }
    }, [section]);

    // Transform to simple array for dropdowns
    const categoryOptions = categories.map(cat => ({
        value: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
        label: `${cat.icon} ${cat.name}`,
        name: cat.name,
        icon: cat.icon,
        color: cat.color
    }));

    return { categories, categoryOptions, loading, error };
};

// Helper to get category details by value/slug
export const getCategoryDetails = (categories, value) => {
    if (!value || !categories.length) return null;
    return categories.find(cat => 
        cat.slug === value || 
        cat.name.toLowerCase() === value.toLowerCase() ||
        cat.name.toLowerCase().replace(/\s+/g, '-') === value.toLowerCase()
    );
};

export default useCategories;
