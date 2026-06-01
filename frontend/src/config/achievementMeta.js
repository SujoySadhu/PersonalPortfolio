/**
 * Shared achievement presentation config — used by AchievementCard, the
 * Achievements page, and the Home achievements section so category badges
 * and date formatting stay consistent.
 */
import { FiAward, FiBookOpen, FiCode, FiStar, FiGift, FiCheckCircle } from 'react-icons/fi';

export const ACH_CATEGORIES = {
    competition: { label: 'Competition', cls: 'bg-blue-500/15 text-blue-300 border-blue-500/20', Icon: FiCode },
    certification: { label: 'Certification', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20', Icon: FiCheckCircle },
    award: { label: 'Award', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/20', Icon: FiAward },
    publication: { label: 'Publication', cls: 'bg-violet-500/15 text-violet-300 border-violet-500/20', Icon: FiBookOpen },
    hackathon: { label: 'Hackathon', cls: 'bg-pink-500/15 text-pink-300 border-pink-500/20', Icon: FiCode },
    scholarship: { label: 'Scholarship', cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20', Icon: FiGift },
    other: { label: 'Achievement', cls: 'bg-gray-500/15 text-gray-300 border-gray-500/20', Icon: FiStar },
};

export const getAchCategory = (category) => ACH_CATEGORIES[category] || ACH_CATEGORIES.other;

export const formatAchDate = (date, opts = { year: 'numeric', month: 'short' }) =>
    date ? new Date(date).toLocaleDateString('en-US', opts) : null;
