/**
 * Shared helpers for project document attachments (reports, slide decks, etc.)
 * Used by the admin Project editor and the public Project details page so the
 * icon / label / colour treatment for each file type stays consistent.
 */
import React from 'react';
import {
    FaFilePdf,
    FaFilePowerpoint,
    FaFileWord,
    FaFileExcel,
    FaFileCsv,
    FaFileArchive,
    FaFileAlt,
    FaFile
} from 'react-icons/fa';

// Allowed upload types (must mirror the backend DOCUMENT_FORMATS list)
export const ALLOWED_DOC_TYPES = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'zip'];
export const MAX_DOC_BYTES = 25 * 1024 * 1024; // 25MB

// Per-extension presentation metadata
const FILE_META = {
    pdf: { label: 'PDF', tint: 'text-red-400', badge: 'bg-red-500/10 text-red-400 border-red-500/20', Icon: FaFilePdf },
    ppt: { label: 'Slides', tint: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', Icon: FaFilePowerpoint },
    pptx: { label: 'Slides', tint: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', Icon: FaFilePowerpoint },
    doc: { label: 'Document', tint: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', Icon: FaFileWord },
    docx: { label: 'Document', tint: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', Icon: FaFileWord },
    xls: { label: 'Spreadsheet', tint: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', Icon: FaFileExcel },
    xlsx: { label: 'Spreadsheet', tint: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', Icon: FaFileExcel },
    csv: { label: 'CSV', tint: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', Icon: FaFileCsv },
    zip: { label: 'Archive', tint: 'text-violet-400', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', Icon: FaFileArchive },
    txt: { label: 'Text', tint: 'text-slate-300', badge: 'bg-slate-500/10 text-slate-300 border-slate-500/20', Icon: FaFileAlt }
};

const DEFAULT_META = { label: 'File', tint: 'text-gray-400', badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20', Icon: FaFile };

export const getFileMeta = (format = '') => FILE_META[String(format).toLowerCase()] || DEFAULT_META;

// Human-readable file size, e.g. 1536 -> "1.5 KB"
export const formatBytes = (bytes) => {
    const n = Number(bytes);
    if (!n || n <= 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
    const val = n / Math.pow(1024, i);
    return `${val >= 10 || i === 0 ? Math.round(val) : val.toFixed(1)} ${units[i]}`;
};

// Convenience component: renders the icon for a given file format
export const FileTypeIcon = ({ format, className = '', size }) => {
    const { Icon, tint } = getFileMeta(format);
    return <Icon className={`${tint} ${className}`} size={size} />;
};
