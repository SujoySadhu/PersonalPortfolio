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
    FaFile,
    FaLink
} from 'react-icons/fa';

// Allowed upload types (must mirror the backend DOCUMENT_FORMATS list)
export const ALLOWED_DOC_TYPES = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'zip'];
export const MAX_DOC_BYTES = 25 * 1024 * 1024; // 25MB

// Document types offered when adding a resource by shareable link
export const DOC_TYPE_OPTIONS = [
    { value: 'link', label: 'Link / Other' },
    { value: 'pdf', label: 'PDF' },
    { value: 'pptx', label: 'Slides (PowerPoint)' },
    { value: 'docx', label: 'Document (Word)' },
    { value: 'xlsx', label: 'Spreadsheet (Excel)' },
    { value: 'csv', label: 'CSV' },
    { value: 'zip', label: 'Archive (ZIP)' }
];

// Best-effort guess of a document type from a URL's file extension.
// Drive/Dropbox links (no real extension) fall back to the generic "link" type.
export const guessDocType = (url = '') => {
    const path = String(url).toLowerCase().split(/[?#]/)[0];
    const ext = (path.match(/\.([a-z0-9]+)$/) || [])[1];
    const map = {
        pdf: 'pdf', ppt: 'pptx', pptx: 'pptx', doc: 'docx', docx: 'docx',
        xls: 'xlsx', xlsx: 'xlsx', csv: 'csv', zip: 'zip', txt: 'txt'
    };
    return map[ext] || 'link';
};

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
    txt: { label: 'Text', tint: 'text-slate-300', badge: 'bg-slate-500/10 text-slate-300 border-slate-500/20', Icon: FaFileAlt },
    link: { label: 'Link', tint: 'text-sky-400', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20', Icon: FaLink }
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
