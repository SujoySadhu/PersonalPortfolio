/**
 * Shared Quill Editor Configuration
 * Registers custom fonts, sizes, and provides toolbar/format configs
 * for use in ProjectForm and BlogForm.
 */
import ReactQuill from 'react-quill-new';

const Quill = ReactQuill.Quill;

// ============================================
// REGISTER CUSTOM FONTS
// ============================================
const Font = Quill.import('formats/font');
Font.whitelist = [
    false,           // default (sans-serif)
    'serif',
    'monospace',
    'arial',
    'georgia',
    'impact',
    'tahoma',
    'verdana',
    'courier-new',
    'times-new-roman',
    'trebuchet-ms',
    'comic-sans',
    'lucida-console',
];
Quill.register(Font, true);

// ============================================
// REGISTER CUSTOM SIZES
// ============================================
const Size = Quill.import('formats/size');
Size.whitelist = ['10px', '12px', '14px', false, '18px', '20px', '24px', '28px', '32px', '36px', '48px', '64px'];
Quill.register(Size, true);

// ============================================
// OVERRIDE VIDEO FORMAT
// Ensures the video URL is preserved exactly as entered.
// Explicit static properties avoid prototype-chain issues
// that can cause the video blot to silently de-register.
// ============================================
const Video = Quill.import('formats/video');
class CleanVideo extends Video {
    static blotName = 'video';
    static className = 'ql-video';
    static tagName = 'IFRAME';

    static create(value) {
        const node = super.create(value);
        node.setAttribute('frameborder', '0');
        node.setAttribute('allowfullscreen', 'true');
        node.setAttribute('src', this.sanitize(value));
        return node;
    }

    static sanitize(url) {
        return url || '';
    }

    static value(domNode) {
        return domNode.getAttribute('src');
    }
}
Quill.register(CleanVideo, true);

// ============================================
// FORMATS LIST
// ============================================
export const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'indent',
    'align', 'direction',
    'blockquote', 'code', 'code-block',
    'link', 'image', 'video'
];

// ============================================
// TOOLBAR CONTAINER
// ============================================
export const quillToolbar = [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': Font.whitelist }],
    [{ 'size': Size.whitelist }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }, { 'direction': 'rtl' }],
    ['blockquote', 'code', 'code-block'],
    ['link', 'image', 'video'],
    ['clean'],
];

// ============================================
// IMAGE DELETE HANDLER
// Attaches to a Quill editor to show a delete
// button on each image inside the editor (top-right corner, visible on hover).
// Call this in useEffect after the editor is mounted.
// Returns a cleanup function.
// ============================================
export function attachImageDeleteHandler(quillRef) {
    const editor = quillRef.current?.getEditor?.() || quillRef.current?.editor;
    if (!editor) return () => {};

    const editorRoot = editor.root;
    const container = editorRoot.closest('.ql-container');
    if (!container) return () => {};

    // Ensure container is a positioning parent
    container.style.position = 'relative';

    // Create a single floating delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'ql-image-delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.type = 'button';
    deleteBtn.title = 'Delete image';
    deleteBtn.style.display = 'none';
    container.appendChild(deleteBtn);

    let activeImg = null;

    function showDeleteBtn(img) {
        activeImg = img;
        // Position at top-right corner of image relative to container
        const containerRect = container.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();

        deleteBtn.style.display = 'flex';
        deleteBtn.style.top = (imgRect.top - containerRect.top + 6) + 'px';
        deleteBtn.style.left = (imgRect.right - containerRect.left - 34) + 'px';
    }

    function hideDeleteBtn() {
        deleteBtn.style.display = 'none';
        activeImg = null;
    }

    function handleEditorClick(e) {
        if (e.target.tagName === 'IMG') {
            showDeleteBtn(e.target);
        } else if (e.target !== deleteBtn) {
            hideDeleteBtn();
        }
    }

    function handleDeleteClick(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (activeImg) {
            const blot = Quill.find(activeImg);
            if (blot) {
                const index = editor.getIndex(blot);
                editor.deleteText(index, 1);
            }
        }
        hideDeleteBtn();
    }

    function handleScroll() {
        if (activeImg) {
            // Check if image still exists in DOM
            if (!editorRoot.contains(activeImg)) {
                hideDeleteBtn();
                return;
            }
            showDeleteBtn(activeImg);
        }
    }

    editorRoot.addEventListener('click', handleEditorClick);
    deleteBtn.addEventListener('mousedown', handleDeleteClick);
    editorRoot.addEventListener('scroll', handleScroll);

    return () => {
        editorRoot.removeEventListener('click', handleEditorClick);
        deleteBtn.removeEventListener('mousedown', handleDeleteClick);
        editorRoot.removeEventListener('scroll', handleScroll);
        if (deleteBtn.parentNode) deleteBtn.parentNode.removeChild(deleteBtn);
    };
}
