import React from 'react';
import { elementBoxStyle, textInnerStyle, normalizeCanvas } from '../../config/canvasHelpers';
import { getImageUrl } from '../../services/api';

/**
 * Read-only renderer for a "slide canvas". Used on the public Project details
 * page. Renders exactly what the editor produced (same % geometry + cqw fonts),
 * so it is pixel-faithful at any width.
 */
const CanvasView = ({ canvas, className = '' }) => {
    const c = normalizeCanvas(canvas);
    if (!c.elements.length) return null;

    return (
        <div
            className={`canvas-slide ${className}`}
            style={{
                position: 'relative',
                width: '100%',
                aspectRatio: String(100 / (c.height || 56.25)),
                background: c.bg,
                containerType: 'inline-size',
                borderRadius: '0.75rem',
                overflow: 'hidden'
            }}
        >
            {c.elements.map((el) => (
                <div key={el.id} style={elementBoxStyle(el)}>
                    {el.type === 'image' ? (
                        <img
                            src={getImageUrl(el.src)}
                            alt=""
                            draggable={false}
                            style={{ width: '100%', height: '100%', objectFit: el.fit || 'contain', display: 'block' }}
                        />
                    ) : (
                        <div className="canvas-rt" style={textInnerStyle(el)} dangerouslySetInnerHTML={{ __html: el.text || '' }} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default CanvasView;
