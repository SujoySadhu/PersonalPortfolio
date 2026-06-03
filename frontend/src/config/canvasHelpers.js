/**
 * Shared model + helpers for the free "slide canvas" (PowerPoint-like).
 *
 * A canvas is: { height, bg, version, elements: [ ... ] }
 *   - height  : canvas height expressed as a PERCENT OF ITS WIDTH (so 56.25 =
 *               16:9, 100 = square, 200 = twice as tall as wide, …). The canvas
 *               can be made arbitrarily tall (scrollable) to hold many images.
 *   - bg      : slide background colour
 *   - elements: absolutely-positioned text boxes & images
 *
 * ALL element geometry (x, y, w, h) and font sizes are stored in `cqw` units —
 * i.e. as a PERCENT OF THE CANVAS WIDTH (1cqw = 1% of canvas width). The canvas
 * is a CSS container (container-type: inline-size), so everything scales with
 * the slide width and — crucially — making the canvas taller never moves the
 * elements (vertical positions are width-relative, not height-relative).
 */

export const DEFAULT_HEIGHT = 56.25;   // 16:9
export const MIN_HEIGHT = 20;
export const MAX_HEIGHT = 4000;        // room for ~30+ stacked images
export const DEFAULT_BG = '#ffffff';

// Starting canvas shapes (height as % of width). The bottom handle fine-tunes it.
export const CANVAS_SIZE_PRESETS = [
    { label: 'Wide 16:9', value: 56.25 },
    { label: 'Standard 4:3', value: 75 },
    { label: 'Square', value: 100 },
    { label: 'Portrait', value: 133 },
    { label: 'Tall', value: 200 },
    { label: 'Long', value: 320 }
];

// Font sizes are stored as "design points" against a 1000px-wide reference slide
// and rendered in cqw so they scale with the slide (fontSize / 10 = cqw).
export const CANVAS_DESIGN_WIDTH = 1000;
export const FONT_SIZE_OPTIONS = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];
export const DEFAULT_FONT_SIZE = 24;

export const FONT_FAMILIES = [
    { label: 'Sans', value: 'Inter, system-ui, -apple-system, sans-serif' },
    { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
    { label: 'Mono', value: 'ui-monospace, "Courier New", monospace' },
    { label: 'Rounded', value: '"Poppins", "Segoe UI", sans-serif' },
    { label: 'Condensed', value: '"Arial Narrow", "Roboto Condensed", sans-serif' }
];

export const TEXT_COLORS = ['#111827', '#ffffff', '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed'];
export const BG_COLORS = ['transparent', '#ffffff', '#0f172a', '#fde68a', '#bfdbfe', '#bbf7d0', '#fecaca'];

let _seq = 0;
export const genId = () => `el_${Date.now().toString(36)}_${(_seq++).toString(36)}`;

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Build an empty canvas
export const emptyCanvas = () => ({ height: DEFAULT_HEIGHT, bg: DEFAULT_BG, version: 2, elements: [] });

// Normalise whatever comes back from the API into a safe canvas object.
// Migrates legacy (aspect-ratio, %-of-height) canvases to the width-relative model.
export const normalizeCanvas = (c) => {
    if (!c || typeof c !== 'object') return emptyCanvas();
    const isNew = c.version === 2 || c.height !== undefined;
    const aspect = Number(c.aspect) || (16 / 9);
    // legacy y/h were % of height; convert to % of width by dividing by aspect
    const factor = isNew ? 1 : (1 / aspect);
    const height = isNew ? (Number(c.height) || DEFAULT_HEIGHT) : (100 / aspect);
    const elements = Array.isArray(c.elements) ? c.elements.filter(Boolean).map((el) => ({
        ...el,
        id: el.id || genId(),
        x: Number(el.x) || 0,
        y: (Number(el.y) || 0) * factor,
        w: Number(el.w) || 20,
        h: (Number(el.h) || 12) * factor
    })) : [];
    return { height: clamp(height, MIN_HEIGHT, MAX_HEIGHT), bg: c.bg || DEFAULT_BG, version: 2, elements };
};

export const createTextElement = (rect) => ({
    id: genId(),
    type: 'text',
    x: clamp(rect.x, 0, 99),
    y: clamp(rect.y, 0, MAX_HEIGHT),
    w: clamp(rect.w, 6, 100),
    h: clamp(rect.h, 3, MAX_HEIGHT),
    text: 'Text',
    fontSize: DEFAULT_FONT_SIZE,
    fontFamily: '',
    color: '#111827',
    bg: 'transparent',
    align: 'left',
    bold: false,
    italic: false,
    underline: false
});

export const createImageElement = (src, rect) => ({
    id: genId(),
    type: 'image',
    x: clamp(rect.x, 0, 99),
    y: clamp(rect.y, 0, MAX_HEIGHT),
    w: clamp(rect.w, 5, 100),
    h: clamp(rect.h, 5, MAX_HEIGHT),
    src,
    fit: 'contain'
});

// Absolute box geometry in cqw (% of canvas width) — shared by editor + viewer
export const elementBoxStyle = (el) => ({
    position: 'absolute',
    left: `${el.x}cqw`,
    top: `${el.y}cqw`,
    width: `${el.w}cqw`,
    height: `${el.h}cqw`
});

// Inner text styling (shared by editor + public renderer)
export const textInnerStyle = (el) => ({
    // design points -> cqw so text scales with the slide width
    fontSize: `${(el.fontSize || DEFAULT_FONT_SIZE) / (CANVAS_DESIGN_WIDTH / 100)}cqw`,
    fontFamily: el.fontFamily || 'inherit',
    color: el.color || '#111827',
    textAlign: el.align || 'left',
    fontWeight: el.bold ? 700 : 400,
    fontStyle: el.italic ? 'italic' : 'normal',
    textDecoration: el.underline ? 'underline' : 'none',
    background: el.bg && el.bg !== 'transparent' ? el.bg : 'transparent',
    lineHeight: 1.3,
    width: '100%',
    minHeight: '100%',
    padding: '0.25em 0.4em',
    boxSizing: 'border-box',
    overflow: 'visible',      // never clip the text (fixes cut-off descenders)
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap'
});

// Collect all Cloudinary image URLs used inside a canvas (for cleanup / payload)
export const canvasImageUrls = (c) => {
    const out = [];
    if (c && Array.isArray(c.elements)) {
        for (const el of c.elements) {
            if (el && el.type === 'image' && typeof el.src === 'string') out.push(el.src);
        }
    }
    return out;
};
