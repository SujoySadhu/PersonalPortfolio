/**
 * Process HTML content from Quill editor for public display:
 * 1. Converts YouTube/Vimeo URL links into responsive embedded iframes
 * 2. Resolves relative image paths to full backend URLs
 * 3. Ensures spacing between consecutive images for visual separation
 */
import { getImageUrl } from '../services/api';

export function processContentImages(html) {
    if (!html) return html;

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // --- Resolve relative image URLs to full backend URLs ---
        resolveImageUrls(doc);

        // --- Convert video URL links to iframes ---
        convertVideoLinks(doc);

        // --- Arrange groups of images into a responsive grid ---
        groupImageGrids(doc);

        return doc.body.innerHTML;
    } catch (err) {
        console.error('processContentImages error:', err);
        return html;
    }
}

/**
 * Arrange consecutive images into a responsive grid so multiple images render
 * side-by-side instead of as a tall stack. Handles both a single block holding
 * several <img> and a run of consecutive single-image paragraphs. A lone image
 * is left as-is (so it keeps whatever size it was resized to in the editor).
 * Columns: 2 images -> side by side, 4 -> 2x2, otherwise 3 across.
 */
function colsForCount(n) {
    if (n <= 1) return 1;
    if (n === 2 || n === 4) return 2;
    return 3;
}

function buildGrid(doc, imgs) {
    const grid = doc.createElement('div');
    grid.className = `image-grid image-grid-${colsForCount(imgs.length)}`;
    imgs.forEach(img => grid.appendChild(img));
    return grid;
}

function groupImageGrids(doc) {
    const body = doc.body;
    if (!body) return;

    // Case 1: a single block holding multiple images and no meaningful text
    Array.from(body.querySelectorAll('p, div')).forEach(block => {
        if (block.classList && block.classList.contains('image-grid')) return;
        if (block.querySelector('iframe, video, .video-embed-wrapper')) return;
        const imgs = Array.from(block.querySelectorAll('img'));
        if (imgs.length < 2) return;
        if ((block.textContent || '').trim().length > 0) return;
        const grid = buildGrid(doc, imgs);
        if (block.parentNode) block.parentNode.replaceChild(grid, block);
    });

    // Case 2: runs of consecutive single-image-only paragraphs
    const isImgOnlyP = (el) =>
        el && el.tagName === 'P' &&
        el.querySelectorAll('img').length === 1 &&
        (el.textContent || '').trim().length === 0 &&
        !el.querySelector('iframe, video');

    let child = body.firstElementChild;
    while (child) {
        if (isImgOnlyP(child)) {
            const run = [child];
            let next = child.nextElementSibling;
            while (next && isImgOnlyP(next)) {
                run.push(next);
                next = next.nextElementSibling;
            }
            if (run.length >= 2) {
                const imgs = run.map(p => p.querySelector('img'));
                const grid = buildGrid(doc, imgs);
                run[0].parentNode.insertBefore(grid, run[0]);
                run.forEach(p => p.parentNode.removeChild(p));
                child = grid.nextElementSibling;
                continue;
            }
        }
        child = child.nextElementSibling;
    }
}

/**
 * Finds <a> tags or plain-text YouTube/Vimeo URLs and converts
 * them into responsive <iframe> embeds.
 */
function convertVideoLinks(doc) {
    // Handle <a> tags pointing to YouTube/Vimeo
    const links = Array.from(doc.querySelectorAll('a'));
    for (const link of links) {
        // Use getAttribute to get the raw href (DOMParser doesn't resolve href property)
        const href = link.getAttribute('href') || link.href || '';
        const text = link.textContent || '';
        const embedUrl = getEmbedUrl(href) || getEmbedUrl(text);
        if (embedUrl) {
            const wrapper = createVideoEmbed(doc, embedUrl);
            // If the link's parent is a <p> or <blockquote> that only contains this link,
            // replace the entire parent to avoid invalid <div> inside <p>
            const parent = link.parentElement;
            if (parent && (parent.tagName === 'P' || parent.tagName === 'BLOCKQUOTE')) {
                const siblings = Array.from(parent.childNodes).filter(n => {
                    if (n === link) return false;
                    if (n.nodeType === 3 && n.textContent.trim() === '') return false;
                    if (n.nodeType === 1 && n.tagName === 'BR') return false;
                    return true;
                });
                if (siblings.length === 0) {
                    // Parent only contains this link — replace the whole parent
                    parent.parentNode.replaceChild(wrapper, parent);
                    continue;
                }
            }
            // Otherwise just replace the link itself
            link.parentNode.replaceChild(wrapper, link);
        }
    }

    // Handle bare text URLs inside paragraphs (e.g., user typed a YouTube URL)
    const allElements = Array.from(doc.querySelectorAll('p, blockquote, div'));
    for (const el of allElements) {
        // Skip if already contains an iframe or video-embed-wrapper
        if (el.querySelector('iframe, .video-embed-wrapper')) continue;

        const text = el.textContent.trim();
        const embedUrl = getEmbedUrl(text);
        if (embedUrl) {
            // Only process if the element contains just the URL (no other content)
            const nonEmptyChildren = Array.from(el.childNodes).filter(n => {
                if (n.nodeType === 3) return n.textContent.trim().length > 0;
                if (n.nodeType === 1) return n.tagName !== 'BR';
                return false;
            });
            // Should be just one text node or one link
            if (nonEmptyChildren.length <= 1) {
                const wrapper = createVideoEmbed(doc, embedUrl);
                el.parentNode.replaceChild(wrapper, el);
            }
        }
    }
}

/**
 * Convert a URL string to an embeddable URL, or return null if not a video.
 */
function getEmbedUrl(url) {
    if (!url) return null;
    url = url.trim();

    // Already an embed URL (from Quill's video tool)
    if (/youtube\.com\/embed\//.test(url)) {
        return url;
    }

    // youtube.com/watch?v=ID
    let match = url.match(/(?:youtube\.com\/watch\?v=)([\w-]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;

    // youtu.be/ID
    match = url.match(/(?:youtu\.be\/)([\w-]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;

    // vimeo.com/ID
    match = url.match(/(?:vimeo\.com\/)([\d]+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}`;

    return null;
}

function createVideoEmbed(doc, embedUrl) {
    const wrapper = doc.createElement('div');
    wrapper.className = 'video-embed-wrapper';
    const iframe = doc.createElement('iframe');
    iframe.src = embedUrl;
    iframe.className = 'ql-video';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    wrapper.appendChild(iframe);
    return wrapper;
}

/**
 * Resolves relative image src attributes (e.g. /uploads/...) to full backend URLs.
 */
function resolveImageUrls(doc) {
    const images = Array.from(doc.querySelectorAll('img'));
    for (const img of images) {
        const src = img.getAttribute('src');
        if (src) {
            const resolved = getImageUrl(src);
            if (resolved && resolved !== src) {
                img.setAttribute('src', resolved);
            }
        }
    }
}


