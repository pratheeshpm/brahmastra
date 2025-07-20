import React, { useEffect, useRef, useState } from 'react';
import { IconDownload, IconFileText, IconMaximize, IconX, IconZoomIn, IconZoomOut, IconRefresh } from '@tabler/icons-react';

// Type definitions for Mermaid
declare global {
  interface Window {
    mermaid: {
      initialize: (config: any) => void;
      render: (id: string, code: string) => Promise<{ svg: string }>;
    };
  }
}

interface MermaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  mermaidCode: string;
  mode: 'fullscreen' | 'png' | null;
}

export const MermaidModal: React.FC<MermaidModalProps> = ({
  isOpen,
  onClose,
  mermaidCode,
  mode
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const diagramContentRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pngPreviewUrl, setPngPreviewUrl] = useState<string | null>(null);

  // Load Mermaid library
  useEffect(() => {
    if (typeof window !== 'undefined' && !mermaidLoaded) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js';
      script.onload = () => {
        if (window.mermaid) {
          window.mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'Arial, sans-serif'
          });
          setMermaidLoaded(true);
        }
      };
      document.head.appendChild(script);
    }
  }, [mermaidLoaded]);

  // Render diagram when modal opens and mermaid is loaded
  useEffect(() => {
    if (isOpen && mermaidLoaded && mermaidCode && elementRef.current) {
      renderDiagram();
    }
  }, [isOpen, mermaidLoaded, mermaidCode]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const renderDiagram = async () => {
    if (!elementRef.current || !window.mermaid) return;

    try {
      setError(null);
      setIsLoaded(false);

      const element = elementRef.current;
      element.innerHTML = '';

      const uniqueId = `mermaid-modal-${Date.now()}`;
      const { svg } = await window.mermaid.render(uniqueId, mermaidCode);
      
      element.innerHTML = svg;
      setIsLoaded(true);

      // Generate PNG preview if in PNG mode
      if (mode === 'png') {
        generatePngPreview();
      }
    } catch (error) {
      console.error('❌ [MERMAID MODAL] Error rendering diagram:', error);
      setError(`Failed to render diagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generatePngPreview = async () => {
    if (!elementRef.current) return;

    try {
      const svgElement = elementRef.current.querySelector('svg');
      if (!svgElement) return;

      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      
      // Set explicit white background
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', 'white');
      clonedSvg.insertBefore(rect, clonedSvg.firstChild);
      
      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        if (!ctx) return;
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx.scale(2, 2);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setPngPreviewUrl(url);
          }
        }, 'image/png');
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    } catch (error) {
      console.error('Error generating PNG preview:', error);
    }
  };

  const downloadAsPNG = async () => {
    if (!elementRef.current) return;

    try {
      const svgElement = elementRef.current.querySelector('svg');
      if (!svgElement) return;

      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      
      // Set explicit white background
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', 'white');
      clonedSvg.insertBefore(rect, clonedSvg.firstChild);
      
      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        if (!ctx) return;
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx.scale(2, 2);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mermaid-diagram-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    } catch (error) {
      console.error('Error downloading PNG:', error);
    }
  };

  const downloadAsSVG = () => {
    if (!elementRef.current) return;

    const svgElement = elementRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mermaid-diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Zoom and pan handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-2">
      <div className="relative w-[98vw] h-[98vh] bg-white rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-indigo-500/30 overflow-hidden">
        {/* Modal Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {mode === 'png' ? '🖼️' : '📊'}
            </span>
            <span className="font-semibold">
              {mode === 'png' ? 'Mermaid Diagram - PNG Preview' : 'Mermaid Diagram - Fullscreen View'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title="Close (ESC)"
          >
            <IconX size={20} className="text-white" />
          </button>
        </div>

        {/* Download buttons */}
        <div className="absolute top-4 left-4 z-20 flex gap-2" style={{ top: '70px' }}>
          <button
            onClick={downloadAsPNG}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 rounded-lg shadow-lg transition-colors"
            title="Download as PNG"
          >
            <IconDownload size={16} />
            PNG
          </button>
          <button
            onClick={downloadAsSVG}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 rounded-lg shadow-lg transition-colors"
            title="Download as SVG"
          >
            <IconFileText size={16} />
            SVG
          </button>
        </div>

        {/* Zoom controls */}
        {mode === 'fullscreen' && (
          <div className="absolute top-4 right-4 z-20 flex gap-2" style={{ top: '70px' }}>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.1, prev * 0.8))}
              className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors"
              title="Zoom out"
            >
              <IconZoomOut size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.min(5, prev * 1.25))}
              className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors"
              title="Zoom in"
            >
              <IconZoomIn size={16} className="text-gray-600" />
            </button>
            <button
              onClick={resetView}
              className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors"
              title="Reset view"
            >
              <IconRefresh size={16} className="text-gray-600" />
            </button>
          </div>
        )}

        {/* Content */}
        <div 
          className="w-full h-full bg-white overflow-hidden"
          style={{ paddingTop: '70px' }}
        >
          {mode === 'png' && pngPreviewUrl ? (
            <div className="w-full h-full flex items-center justify-center" style={{ paddingTop: '70px' }}>
              <img 
                src={pngPreviewUrl} 
                alt="Mermaid Diagram Preview" 
                className="max-w-full max-h-full cursor-pointer" 
                onClick={downloadAsPNG}
              />
            </div>
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center cursor-move"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                ref={elementRef}
                className="diagram-container select-none"
                style={{
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  minWidth: '100px',
                  minHeight: '100px'
                }}
              />
            </div>
          )}

          {!isLoaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading diagram...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <div className="text-center text-red-600">
                <p className="font-semibold">Error loading diagram</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 