/**
 * ============================================
 * DEFAULT SETTINGS - Hardcoded Frontend Defaults
 * ============================================
 * 
 * These values are displayed INSTANTLY on page load,
 * before the backend (Render free tier) wakes up.
 * 
 * When the backend responds, fresh data from MongoDB
 * is merged on top of these defaults.
 * 
 * ⚠️  UPDATE THESE VALUES with your real personal info!
 *     They are what visitors see during the ~30-60s cold start.
 */

export const DEFAULT_SETTINGS = {
    name: 'Sujoy Sadhu',
    title: 'Full Stack Developer',
    tagline: 'Building digital experiences with modern technologies.',
    bio: "I'm a full-stack developer specializing in building exceptional digital experiences. Currently focused on building accessible, human-centered products with modern web technologies.",
    email: '',
    phone: '',
    location: '',
    resumeLink: '',
    isAvailableForHire: true,
    socialLinks: {
        github: 'https://github.com/SujoySadhu',
        linkedin: '',
        twitter: '',
        website: '',
        leetcode: '',
        codeforces: '',
        codechef: '',
        hackerrank: ''
    }
};
