import React, { useMemo, useRef } from 'react';
import JoditEditor from 'jodit-react';
import { BACKEND_URL } from '../../services/api';

/**
 * Full-featured WYSIWYG editor (Jodit) — Word-like.
 * Supports tables (add/edit rows & columns), source view, fonts, sizes,
 * colors, lists, alignment, images, video, and more.
 *
 * Uses onBlur to commit content to the parent (the editor-recommended,
 * cursor-safe pattern). A click on a Save button blurs the editor first,
 * so the latest content is captured before submit.
 */
const RichTextEditor = ({ value, onChange, placeholder = 'Start writing…', height = 520 }) => {
    const editor = useRef(null);

    const config = useMemo(() => ({
        theme: 'dark',
        height,
        minHeight: 320,
        placeholder,
        // Pin the toolbar so controls stay reachable while scrolling content
        toolbarSticky: true,
        toolbarStickyOffset: 0,
        toolbarAdaptive: true,
        statusbar: true,
        showCharsCounter: true,
        showWordsCounter: true,
        showXPathInStatusbar: false,
        spellcheck: true,
        // Drag an image (or media) with the cursor to move it anywhere in the content,
        // and resize it by dragging its corners.
        draggableTags: ['img', 'jodit-media'],
        enableDragAndDropFileToEditor: true,
        // Insert images at a modest size so two can sit side-by-side; resize by corners.
        imageDefaultWidth: 300,
        image: { useImageEditor: true, editSrc: true },
        // Paste behaviour — keep formatting, no annoying prompts
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        defaultActionOnPaste: 'insert_clear_html',
        // Color picker (the "brush" button) — default to the TEXT colour tab
        colorPickerDefaultTab: 'color',
        // Full Word-like toolbar
        buttons:
            'source,|,bold,italic,underline,strikethrough,|,superscript,subscript,|,ul,ol,|,outdent,indent,|,font,fontsize,paragraph,lineHeight,|,brush,|,align,|,image,video,table,link,|,hr,symbol,eraser,copyformat,|,undo,redo,|,fullsize',
        // Image upload -> Cloudinary via the existing backend endpoint
        uploader: {
            url: `${BACKEND_URL}/api/upload/editor-image`,
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
            isSuccess: function (resp) { return resp && resp.success; },
            getMessage: function (resp) { return (resp && resp.message) || 'Upload failed'; },
            process: function (resp) {
                // Support multiple uploaded images (resp.urls) or a single one
                const urls = resp && resp.urls && resp.urls.length
                    ? resp.urls
                    : (resp && resp.url ? [resp.url] : []);
                return {
                    files: urls,
                    error: resp && resp.success ? 0 : 1,
                    msg: (resp && resp.message) || ''
                };
            },
            defaultHandlerSuccess: function (data) {
                if (data && data.files && data.files.length) {
                    data.files.forEach((url) => {
                        this.s.insertImage(url, null, this.o.imageDefaultWidth);
                    });
                }
            }
        }
    }), [height, placeholder]);

    return (
        <JoditEditor
            ref={editor}
            value={value || ''}
            config={config}
            onBlur={(newContent) => onChange(newContent)}
        />
    );
};

export default React.memo(RichTextEditor);
