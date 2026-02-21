/**
 * ============================================
 * SETTINGS CONTEXT - Centralized Settings Provider
 * ============================================
 * 
 * Fetches settings ONCE and shares across all components
 * (Navbar, Footer, Home, Contact etc.) to eliminate 
 * redundant API calls. Includes in-memory + sessionStorage cache.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';

const SettingsContext = createContext(null);

const CACHE_KEY = 'portfolio_settings';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        // Try to load from sessionStorage for instant display
        try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    return data;
                }
            }
        } catch (e) { /* ignore */ }
        return null;
    });
    const [loading, setLoading] = useState(!settings);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await settingsAPI.get();
            const data = res.data.data;
            setSettings(data);
            // Cache in sessionStorage
            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            } catch (e) { /* ignore */ }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const refreshSettings = useCallback(() => {
        sessionStorage.removeItem(CACHE_KEY);
        return fetchSettings();
    }, [fetchSettings]);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export default SettingsContext;
