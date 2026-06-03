import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiType, FiImage, FiTrash2, FiBold, FiItalic, FiUnderline,
    FiAlignLeft, FiAlignCenter, FiAlignRight, FiChevronUp, FiChevronDown,
    FiCopy, FiRotateCcw, FiRotateCw, FiList, FiLink2
} from 'react-icons/fi';
import { projectsAPI, getImageUrl } from '../../services/api';
import {
    CANVAS_SIZE_PRESETS, MIN_HEIGHT, MAX_HEIGHT, FONT_SIZE_OPTIONS, FONT_FAMILIES, DEFAULT_FONT_SIZE, TEXT_COLORS, BG_COLORS,
    normalizeCanvas, createTextElement, createImageElement,
    elementBoxStyle, textInnerStyle, clamp, genId
} from '../../config/canvasHelpers';

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const HANDLE_POS = {
    nw: { left: '0%', top: '0%', cursor: 'nwse-resize' },
    n: { left: '50%', top: '0%', cursor: 'ns-resize' },
    ne: { left: '100%', top: '0%', cursor: 'nesw-resize' },
    e: { left: '100%', top: '50%', cursor: 'ew-resize' },
    se: { left: '100%', top: '100%', cursor: 'nwse-resize' },
    s: { left: '50%', top: '100%', cursor: 'ns-resize' },
    sw: { left: '0%', top: '100%', cursor: 'nesw-resize' },
    w: { left: '0%', top: '50%', cursor: 'ew-resize' }
};

/**
 * PowerPoint-style free canvas. Pick the Text Box tool and DRAW a box anywhere;
 * add images; then drag/resize/edit any element freely. Geometry is stored as
 * percentages so it renders identically on the public page (see CanvasView).
 */
const CanvasEditor = ({ value, onChange }) => {
    const canvasRef = useRef(null);
    const fileRef = useRef(null);

    const [doc, setDocState] = useState(() => normalizeCanvas(value));
    const docRef = useRef(doc);

    const [tool, setTool] = useState('select');      // 'select' | 'text'
    const [selectedId, setSelectedId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [rubber, setRubber] = useState(null);      // {x,y,w,h} px while drawing
    const [uploading, setUploading] = useState(false);

    const interaction = useRef(null); // { mode:'move'|'resize'|'draw', id, handle, startX, startY, startEl, startPx }
    const pendingCmd = useRef(null);  // an execCommand to run once a box enters edit mode

    // ---- undo / redo history ----
    const history = useRef(null);
    if (!history.current) history.current = { stack: [docRef.current], i: 0 };
    const [hist, setHist] = useState({ canUndo: false, canRedo: false });

    const pushHistory = useCallback((snap) => {
        const h = history.current;
        h.stack = h.stack.slice(0, h.i + 1);
        h.stack.push(snap);
        if (h.stack.length > 60) h.stack.shift();
        h.i = h.stack.length - 1;
        setHist({ canUndo: h.i > 0, canRedo: false });
    }, []);

    // Keep a synchronous mirror of the doc + write through to local state
    const apply = useCallback((updater, commit) => {
        const next = updater(docRef.current);
        docRef.current = next;
        setDocState(next);
        if (commit) {
            if (onChange) onChange(next);
            pushHistory(next);
        }
    }, [onChange, pushHistory]);

    const commit = useCallback(() => {
        if (onChange) onChange(docRef.current);
        pushHistory(docRef.current);
    }, [onChange, pushHistory]);

    // Write a text element's HTML through to the live doc + parent (no React state,
    // so the uncontrolled editor keeps its caret).
    const writeText = useCallback((id, html) => {
        const next = { ...docRef.current, elements: docRef.current.elements.map((x) => x.id === id ? { ...x, text: html } : x) };
        docRef.current = next;
        if (onChange) onChange(next);
        return next;
    }, [onChange]);

    const restoreSnap = (snap) => {
        docRef.current = snap;
        setDocState(snap);
        if (onChange) onChange(snap);
        setSelectedId(null);
        setEditingId(null);
    };
    const undo = () => {
        const h = history.current;
        if (h.i <= 0) return;
        h.i -= 1;
        restoreSnap(h.stack[h.i]);
        setHist({ canUndo: h.i > 0, canRedo: h.i < h.stack.length - 1 });
    };
    const redo = () => {
        const h = history.current;
        if (h.i >= h.stack.length - 1) return;
        h.i += 1;
        restoreSnap(h.stack[h.i]);
        setHist({ canUndo: h.i > 0, canRedo: h.i < h.stack.length - 1 });
    };

    const canvasRect = () => canvasRef.current.getBoundingClientRect();

    // ---- global pointer handlers (active during an interaction) ----
    useEffect(() => {
        const onMove = (e) => {
            const it = interaction.current;
            if (!it) return;
            const r = canvasRect();

            if (it.mode === 'draw') {
                const x = clamp(e.clientX - r.left, 0, r.width);
                const y = clamp(e.clientY - r.top, 0, r.height);
                setRubber({
                    x: Math.min(x, it.startPx.x), y: Math.min(y, it.startPx.y),
                    w: Math.abs(x - it.startPx.x), h: Math.abs(y - it.startPx.y)
                });
                return;
            }

            // All geometry is in cqw (% of canvas WIDTH) - so BOTH axes divide by width.
            const dxPct = ((e.clientX - it.startX) / r.width) * 100;
            const dyPct = ((e.clientY - it.startY) / r.width) * 100;
            const H = docRef.current.height || 100; // canvas height in cqw

            if (it.mode === 'canvasResize') {
                const nh = clamp(it.startH + dyPct, MIN_HEIGHT, MAX_HEIGHT);
                apply((d) => ({ ...d, height: nh }), false);
            } else if (it.mode === 'move') {
                const s = it.startEl;
                const nx = clamp(s.x + dxPct, 0, 100 - s.w);
                const ny = clamp(s.y + dyPct, 0, Math.max(0, H - s.h));
                apply((d) => ({ ...d, elements: d.elements.map((el) => el.id === it.id ? { ...el, x: nx, y: ny } : el) }), false);
            } else if (it.mode === 'resize') {
                let { x, y, w, h } = it.startEl;
                const minW = 4, minH = 3;
                const handle = it.handle;
                if (handle.includes('w')) { const nx = clamp(x + dxPct, 0, x + w - minW); w = w - (nx - x); x = nx; }
                if (handle.includes('e')) { w = clamp(w + dxPct, minW, 100 - x); }
                if (handle.includes('n')) { const ny = clamp(y + dyPct, 0, y + h - minH); h = h - (ny - y); y = ny; }
                if (handle.includes('s')) { h = clamp(h + dyPct, minH, MAX_HEIGHT); }
                apply((d) => ({ ...d, elements: d.elements.map((el) => el.id === it.id ? { ...el, x, y, w, h } : el) }), false);
            }
        };

        const onUp = (e) => {
            const it = interaction.current;
            if (!it) return;
            interaction.current = null;

            if (it.mode === 'draw') {
                const r = canvasRect();
                const endX = clamp(e.clientX - r.left, 0, r.width);
                const endY = clamp(e.clientY - r.top, 0, r.height);
                const px = Math.min(endX, it.startPx.x), py = Math.min(endY, it.startPx.y);
                const pw = Math.abs(endX - it.startPx.x), ph = Math.abs(endY - it.startPx.y);
                // everything in cqw (% of width)
                const rectPct = {
                    x: (px / r.width) * 100, y: (py / r.width) * 100,
                    w: (pw / r.width) * 100, h: (ph / r.width) * 100
                };
                // a click (no real drag) -> a sensible default box at that point
                if (pw < 12 || ph < 10) { rectPct.w = 34; rectPct.h = 8; }
                const el = createTextElement(rectPct);
                apply((d) => ({ ...d, elements: [...d.elements, el] }), true);
                setSelectedId(el.id);
                setTool('select');
                setRubber(null);
                setEditingId(el.id); // jump straight into editing
                return;
            }
            // move / resize / canvas-resize finished -> commit once
            commit();
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [apply, commit]);

    // On entering edit: seed the (uncontrolled) editor with the element's current
    // text, focus it, and select all so the first keystroke replaces it.
    useEffect(() => {
        if (!editingId || !canvasRef.current) return;
        const node = canvasRef.current.querySelector(`[data-edit-id="${editingId}"]`);
        if (!node) return;
        const el = docRef.current.elements.find((x) => x.id === editingId);
        node.innerHTML = (el && el.text) || '';
        node.focus();
        const range = document.createRange();
        range.selectNodeContents(node);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        // run a queued formatting command (e.g. user hit Bold while not yet editing)
        if (pendingCmd.current) {
            const { cmd, val } = pendingCmd.current;
            pendingCmd.current = null;
            try { document.execCommand(cmd, false, val); } catch (e) { /* ignore */ }
            writeText(editingId, node.innerHTML);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingId]);

    // delete selected element with keyboard (when not editing text)
    useEffect(() => {
        const onKey = (e) => {
            if (!selectedId || editingId) return;
            const t = e.target;
            if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                removeElement(selectedId);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, editingId]);

    // ---- element interactions ----
    const startMove = (e, el) => {
        if (tool !== 'select' || editingId === el.id) return;
        e.preventDefault();
        e.stopPropagation();
        setSelectedId(el.id);
        interaction.current = { mode: 'move', id: el.id, startX: e.clientX, startY: e.clientY, startEl: { x: el.x, y: el.y, w: el.w, h: el.h } };
    };

    const startResize = (e, el, handle) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedId(el.id);
        interaction.current = { mode: 'resize', id: el.id, handle, startX: e.clientX, startY: e.clientY, startEl: { x: el.x, y: el.y, w: el.w, h: el.h } };
    };

    const startCanvasResize = (e) => {
        e.preventDefault();
        e.stopPropagation();
        interaction.current = { mode: 'canvasResize', startY: e.clientY, startH: docRef.current.height };
    };

    const bumpHeight = (delta) => apply((d) => ({ ...d, height: clamp((d.height || 100) + delta, MIN_HEIGHT, MAX_HEIGHT) }), true);

    // ---- canvas-level mouse (draw / deselect) ----
    const onCanvasMouseDown = (e) => {
        if (e.target !== canvasRef.current) return; // only when clicking empty slide
        if (tool === 'text') {
            const r = canvasRect();
            interaction.current = { mode: 'draw', startPx: { x: e.clientX - r.left, y: e.clientY - r.top } };
            setRubber({ x: e.clientX - r.left, y: e.clientY - r.top, w: 0, h: 0 });
        } else {
            setSelectedId(null);
            setEditingId(null);
        }
    };

    // ---- toolbar actions ----
    const updateSelected = (patch, doCommit = true) => {
        if (!selectedId) return;
        apply((d) => ({ ...d, elements: d.elements.map((el) => el.id === selectedId ? { ...el, ...patch } : el) }), doCommit);
    };

    const removeElement = (id) => {
        apply((d) => ({ ...d, elements: d.elements.filter((el) => el.id !== id) }), true);
        setSelectedId(null);
        setEditingId(null);
    };

    const reorder = (dir) => {
        if (!selectedId) return;
        apply((d) => {
            const els = [...d.elements];
            const i = els.findIndex((el) => el.id === selectedId);
            if (i < 0) return d;
            const j = dir === 'front' ? els.length - 1 : 0;
            const [m] = els.splice(i, 1);
            els.splice(j, 0, m);
            return { ...d, elements: els };
        }, true);
    };

    const duplicateSelected = () => {
        const src = docRef.current.elements.find((el) => el.id === selectedId);
        if (!src) return;
        const copy = { ...src, id: genId(), x: clamp(src.x + 3, 0, 100 - src.w), y: clamp(src.y + 3, 0, 100 - src.h) };
        apply((d) => ({ ...d, elements: [...d.elements, copy] }), true);
        setSelectedId(copy.id);
    };

    // Commit the typed text to the live doc + parent on EVERY keystroke, so a
    // Save (even mid-edit) always captures it. Updates docRef + onChange but not
    // React state, so the uncontrolled editor keeps the caret position.
    const onTextInput = (e, el) => {
        writeText(el.id, e.currentTarget.innerHTML);
    };

    const onTextBlur = (e, el) => {
        const next = writeText(el.id, e.currentTarget.innerHTML);
        setDocState(next);
        pushHistory(next);
        setEditingId(null);
    };

    // Inline rich-text formatting (Bold/Italic/lists/link/…) via the browser's
    // execCommand on the selection inside the box. If the box isn't being edited
    // yet, enter edit mode (select-all) and run the command once it's focused.
    const execInline = (cmd, val) => {
        if (!selectedId) return;
        const node = canvasRef.current && canvasRef.current.querySelector(`[data-edit-id="${selectedId}"]`);
        if (editingId === selectedId && node) {
            node.focus();
            try { document.execCommand(cmd, false, val); } catch (e) { /* ignore */ }
            writeText(selectedId, node.innerHTML);
        } else {
            pendingCmd.current = { cmd, val };
            setEditingId(selectedId);
        }
    };

    const addLink = () => {
        const url = window.prompt('Link URL', 'https://');
        if (url) execInline('createLink', url);
    };

    // Upload one OR MANY images at once. New images are auto-arranged in a 2-column
    // grid below whatever is already on the canvas, and the canvas grows to fit.
    const onPickImage = async (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (!files.length) return;
        setUploading(true);

        const startY = docRef.current.elements.reduce((m, el) => Math.max(m, (el.y || 0) + (el.h || 0)), 0) + 4;
        const COLS = 2, CW = 47, CH = 33, GAP = 4, XS = [2, 51];
        let added = 0;
        let firstId = null;

        try {
            for (let i = 0; i < files.length; i++) {
                try {
                    const fd = new FormData();
                    fd.append('image', files[i]);
                    const res = await projectsAPI.uploadImage(fd);
                    const url = res.data && res.data.url;
                    if (!url) continue;
                    const col = added % COLS, row = Math.floor(added / COLS);
                    const x = XS[col];
                    const y = startY + row * (CH + GAP);
                    const el = createImageElement(url, { x, y, w: CW, h: CH });
                    if (!firstId) firstId = el.id;
                    apply((d) => ({
                        ...d,
                        elements: [...d.elements, el],
                        height: Math.max(d.height || 56.25, y + CH + 6)
                    }), true);
                    added += 1;
                } catch (err) {
                    console.error('Image upload failed:', err);
                }
            }
            if (added) {
                setTool('select');
                if (firstId) setSelectedId(firstId);
                toast.success(`Added ${added} image${added > 1 ? 's' : ''}`);
            } else {
                toast.error('Image upload failed — is the backend running?');
            }
        } finally {
            setUploading(false);
        }
    };

    const selected = doc.elements.find((el) => el.id === selectedId) || null;

    // ---- shared little button ----
    const TBtn = ({ active, onClick, title, children, disabled }) => (
        <button
            type="button" title={title} disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-2.5 h-9 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50
                ${active ? 'bg-primary-500/20 border-primary-500/50 text-primary-300' : 'bg-dark-200/60 border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="space-y-3">
            {/* ---- Toolbar ---- */}
            <div className="flex flex-wrap items-center gap-2">
                <TBtn active={tool === 'text'} onClick={() => { setTool(tool === 'text' ? 'select' : 'text'); }} title="Draw a text box anywhere on the slide">
                    <FiType size={15} /> Text Box
                </TBtn>
                <TBtn onClick={() => fileRef.current && fileRef.current.click()} title="Add an image" disabled={uploading}>
                    <FiImage size={15} /> {uploading ? 'Uploading...' : 'Images'}
                </TBtn>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickImage} />

                <span className="w-px h-6 bg-gray-700 mx-1" />

                <TBtn onClick={undo} disabled={!hist.canUndo} title="Undo"><FiRotateCcw size={15} /></TBtn>
                <TBtn onClick={redo} disabled={!hist.canRedo} title="Redo"><FiRotateCw size={15} /></TBtn>

                <span className="w-px h-6 bg-gray-700 mx-1" />

                <label className="flex items-center gap-1.5 text-xs text-gray-400">
                    Size
                    <select
                        value={CANVAS_SIZE_PRESETS.some((p) => Math.abs(p.value - doc.height) < 0.5) ? String(doc.height) : 'custom'}
                        onChange={(e) => { if (e.target.value !== 'custom') apply((d) => ({ ...d, height: Number(e.target.value) }), true); }}
                        className="bg-dark-200 border border-gray-700 rounded-lg text-sm text-white px-2 h-9"
                    >
                        {CANVAS_SIZE_PRESETS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
                        <option value="custom" disabled>Custom</option>
                    </select>
                </label>
                <div className="flex items-center gap-1" title="Make the canvas taller / shorter">
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => bumpHeight(-25)}
                        className="w-8 h-9 rounded-lg bg-dark-200/60 border border-gray-700 text-gray-300 hover:text-white">-</button>
                    <span className="text-[11px] text-gray-500 w-9 text-center">H {Math.round(doc.height)}</span>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => bumpHeight(25)}
                        className="w-8 h-9 rounded-lg bg-dark-200/60 border border-gray-700 text-gray-300 hover:text-white">+</button>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-gray-400" title="Slide background">
                    BG
                    <input
                        type="color" value={doc.bg}
                        onChange={(e) => apply((d) => ({ ...d, bg: e.target.value }), true)}
                        className="w-9 h-9 rounded-lg bg-dark-200 border border-gray-700 cursor-pointer p-0.5"
                    />
                </label>
            </div>

            {/* ---- Selected-element controls ---- */}
            {selected && (
                <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-dark-200/40 border border-gray-800">
                    {selected.type === 'text' && (
                        <>
                            <select
                                value={selected.fontFamily || ''}
                                onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                                title="Font"
                                className="bg-dark-200 border border-gray-700 rounded-lg text-sm text-white px-2 h-9 max-w-[120px]"
                            >
                                <option value="">Default</option>
                                {FONT_FAMILIES.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
                            </select>
                            <select
                                value={selected.fontSize || DEFAULT_FONT_SIZE}
                                onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                                title="Font size"
                                className="bg-dark-200 border border-gray-700 rounded-lg text-sm text-white px-2 h-9"
                            >
                                {FONT_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <span className="w-px h-6 bg-gray-700" />
                            <TBtn onClick={() => execInline('bold')} title="Bold (Ctrl+B)"><FiBold size={15} /></TBtn>
                            <TBtn onClick={() => execInline('italic')} title="Italic (Ctrl+I)"><FiItalic size={15} /></TBtn>
                            <TBtn onClick={() => execInline('underline')} title="Underline (Ctrl+U)"><FiUnderline size={15} /></TBtn>
                            <TBtn onClick={() => execInline('strikeThrough')} title="Strikethrough"><span className="line-through text-[13px]">S</span></TBtn>
                            <TBtn onClick={() => execInline('superscript')} title="Superscript"><span className="text-[13px]">x<sup>2</sup></span></TBtn>
                            <TBtn onClick={() => execInline('subscript')} title="Subscript"><span className="text-[13px]">x<sub>2</sub></span></TBtn>
                            <TBtn onClick={() => execInline('insertUnorderedList')} title="Bulleted list"><FiList size={15} /></TBtn>
                            <TBtn onClick={() => execInline('insertOrderedList')} title="Numbered list"><span className="text-[12px] font-bold tracking-tight">1.</span></TBtn>
                            <TBtn onClick={addLink} title="Insert link"><FiLink2 size={15} /></TBtn>
                            <span className="w-px h-6 bg-gray-700" />
                            <TBtn active={selected.align === 'left'} onClick={() => updateSelected({ align: 'left' })} title="Align left"><FiAlignLeft size={15} /></TBtn>
                            <TBtn active={selected.align === 'center'} onClick={() => updateSelected({ align: 'center' })} title="Align center"><FiAlignCenter size={15} /></TBtn>
                            <TBtn active={selected.align === 'right'} onClick={() => updateSelected({ align: 'right' })} title="Align right"><FiAlignRight size={15} /></TBtn>
                            <span className="w-px h-6 bg-gray-700" />
                            <div className="flex items-center gap-1" title="Text colour">
                                {TEXT_COLORS.map((c) => (
                                    <button key={c} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => updateSelected({ color: c })}
                                        className={`w-6 h-6 rounded-full border ${selected.color === c ? 'ring-2 ring-primary-400 border-transparent' : 'border-gray-600'}`}
                                        style={{ background: c }} />
                                ))}
                            </div>
                            <div className="flex items-center gap-1" title="Highlight / box colour">
                                {BG_COLORS.map((c) => (
                                    <button key={c} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => updateSelected({ bg: c })}
                                        className={`w-6 h-6 rounded border ${selected.bg === c ? 'ring-2 ring-primary-400 border-transparent' : 'border-gray-600'}`}
                                        style={c === 'transparent'
                                            ? { backgroundImage: 'linear-gradient(45deg,#64748b 25%,transparent 25%,transparent 75%,#64748b 75%),linear-gradient(45deg,#64748b 25%,#334155 25%,#334155 75%,#64748b 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0,4px 4px' }
                                            : { background: c }} />
                                ))}
                            </div>
                        </>
                    )}
                    {selected.type === 'image' && (
                        <TBtn active onClick={() => updateSelected({ fit: selected.fit === 'cover' ? 'contain' : 'cover' })} title="Toggle fill mode">
                            Fit: {selected.fit === 'cover' ? 'Cover' : 'Contain'}
                        </TBtn>
                    )}
                    <span className="w-px h-6 bg-gray-700" />
                    <TBtn onClick={duplicateSelected} title="Duplicate"><FiCopy size={15} /></TBtn>
                    <TBtn onClick={() => reorder('front')} title="Bring to front"><FiChevronUp size={15} /></TBtn>
                    <TBtn onClick={() => reorder('back')} title="Send to back"><FiChevronDown size={15} /></TBtn>
                    <TBtn onClick={() => removeElement(selected.id)} title="Delete"><FiTrash2 size={15} /></TBtn>
                </div>
            )}

            {/* ---- The slide (scrolls internally so a tall canvas keeps the toolbar in view) ---- */}
            <div
                className="rounded-xl border border-gray-800 bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] bg-[length:24px_24px] p-3"
                style={{ maxHeight: '72vh', overflow: 'auto' }}
            >
                <div
                    ref={canvasRef}
                    onMouseDown={onCanvasMouseDown}
                    style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: String(100 / (doc.height || 56.25)),
                        background: doc.bg,
                        containerType: 'inline-size',
                        cursor: tool === 'text' ? 'crosshair' : 'default',
                        userSelect: 'none',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                        borderRadius: '0.5rem',
                        overflow: 'hidden'
                    }}
                >
                    {doc.elements.map((el) => {
                        const isSel = el.id === selectedId;
                        const isEditing = el.id === editingId;
                        return (
                            <div
                                key={el.id}
                                style={{
                                    ...elementBoxStyle(el),
                                    outline: isSel ? '2px solid #3b82f6' : 'none',
                                    outlineOffset: '1px',
                                    cursor: tool === 'text' ? 'crosshair' : (isEditing ? 'text' : 'move'),
                                    pointerEvents: tool === 'text' ? 'none' : 'auto'
                                }}
                                onMouseDown={(e) => startMove(e, el)}
                                onDoubleClick={(e) => { if (el.type === 'text') { e.stopPropagation(); setSelectedId(el.id); setEditingId(el.id); } }}
                            >
                                {el.type === 'image' ? (
                                    <img src={getImageUrl(el.src)} alt="" draggable={false}
                                        style={{ width: '100%', height: '100%', objectFit: el.fit || 'contain', display: 'block', pointerEvents: 'none' }} />
                                ) : isEditing ? (
                                    // Uncontrolled while editing: content is seeded imperatively and
                                    // captured on every keystroke, so React never resets the caret/text.
                                    <div
                                        key={`edit-${el.id}`}
                                        data-edit-id={el.id}
                                        className="canvas-rt"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onInput={(e) => onTextInput(e, el)}
                                        onBlur={(e) => onTextBlur(e, el)}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        style={{ ...textInnerStyle(el), cursor: 'text', outline: 'none' }}
                                    />
                                ) : (
                                    <div className="canvas-rt" style={{ ...textInnerStyle(el), outline: 'none' }}
                                        dangerouslySetInnerHTML={{ __html: el.text || '' }} />
                                )}

                                {/* resize handles */}
                                {isSel && !isEditing && tool !== 'text' && HANDLES.map((h) => (
                                    <span
                                        key={h}
                                        onMouseDown={(e) => startResize(e, el, h)}
                                        style={{
                                            position: 'absolute', width: 10, height: 10, background: '#3b82f6',
                                            border: '1px solid #fff', borderRadius: 2, zIndex: 5,
                                            left: HANDLE_POS[h].left, top: HANDLE_POS[h].top,
                                            transform: 'translate(-50%, -50%)', cursor: HANDLE_POS[h].cursor
                                        }}
                                    />
                                ))}
                            </div>
                        );
                    })}

                    {/* rubber-band while drawing */}
                    {rubber && (
                        <div style={{
                            position: 'absolute', left: rubber.x, top: rubber.y, width: rubber.w, height: rubber.h,
                            border: '1.5px dashed #3b82f6', background: 'rgba(59,130,246,0.12)', pointerEvents: 'none', zIndex: 10
                        }} />
                    )}
                </div>

                {/* drag this bar to make the canvas taller / shorter */}
                <div
                    onMouseDown={startCanvasResize}
                    title="Drag to resize the canvas height"
                    style={{ height: 16, marginTop: 8, borderRadius: 8, cursor: 'ns-resize', background: 'rgba(148,163,184,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <div style={{ width: 48, height: 4, borderRadius: 2, background: 'rgba(148,163,184,0.7)' }} />
                </div>
            </div>

            <p className="text-xs text-gray-500">
                Click <span className="text-gray-300">Text Box</span> then <span className="text-gray-300">drag on the slide</span> to draw it anywhere. Click an item to select | drag to move | drag the blue handles to resize | double-click a text box to edit | press Delete to remove | use <span className="text-gray-300">Size / H +-</span> or the bottom bar to make room for more images.
            </p>
        </div>
    );
};

export default React.memo(CanvasEditor);
