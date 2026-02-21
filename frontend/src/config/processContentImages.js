/**
 * Process HTML content from Quill editor for public display:
 * 1. Converts YouTube/Vimeo URL links into responsive embedded iframes
 * 2. Ensures spacing between consecutive images for visual separation
 */
export function processContentImages(html) {
    if (!html) return html;

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // --- Convert video URL links to iframes ---
        convertVideoLinks(doc);

        return doc.body.innerHTML;
    } catch (err) {
        console.error('processContentImages error:', err);
        return html;
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


