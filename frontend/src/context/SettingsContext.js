/**
 * ============================================
 * SETTINGS CONTEXT - Centralized Settings Provider
 * ============================================
 * 
 * Fetches settings ONCE and shares across all components
 * (Navbar, Footer, Home, Contact etc.) to eliminate 
 * redundant API calls. Includes in-memory + sessionStorage cache.
 * 
 * IMPORTANT: Initializes with DEFAULT_SETTINGS so the UI
 * renders instantly, even before the backend wakes up.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';
import { DEFAULT_SETTINGS } from '../data/defaults';

const SettingsContext = createContext(null);

const CACHE_KEY = 'portfolio_settings';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Deep-merge backend settings on top of defaults.
 * Only overwrites a default value if the backend provides
 * a non-empty replacement.
 */
const mergeSettings = (defaults, remote) => {
    if (!remote) return defaults;
    const merged = { ...defaults };
    for (const key of Object.keys(remote)) {
        if (key === 'socialLinks' && remote.socialLinks) {
            merged.socialLinks = { ...defaults.socialLinks };
            for (const sk of Object.keys(remote.socialLinks)) {
                if (remote.socialLinks[sk]) {
                    merged.socialLinks[sk] = remote.socialLinks[sk];
                }
            }
        } else if (remote[key] !== undefined && remote[key] !== null && remote[key] !== '') {
            merged[key] = remote[key];
        }
    }
    return merged;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        // Try to load from sessionStorage for instant display
        try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    return mergeSettings(DEFAULT_SETTINGS, data);
                }
            }
        } catch (e) { /* ignore */ }
        // Fall back to hardcoded defaults — renders instantly
        return DEFAULT_SETTINGS;
    });
    // Start as false so the UI is never blocked
    const [loading, setLoading] = useState(false);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await settingsAPI.get();
            const data = res.data.data;
            const merged = mergeSettings(DEFAULT_SETTINGS, data);
            setSettings(merged);
            // Cache in sessionStorage
            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            } catch (e) { /* ignore */ }
        } catch (error) {
            console.error('Error fetching settings:', error);
            // Keep using defaults — no crash
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
