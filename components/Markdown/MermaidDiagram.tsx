import React, { useEffect, useRef, useState } from 'react';
import { IconDownload, IconFileText, IconMaximize, IconX, IconZoomIn, IconZoomOut, IconRefresh } from '@tabler/icons-react';

interface MermaidDiagramProps {
  code: string;
  id?: string;
  onFullscreenClick?: (code: string) => void;
  onPngPreviewClick?: (code: string) => void;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code, id, onFullscreenClick, onPngPreviewClick }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const diagramContentRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Add logging for prop changes
  useEffect(() => {
    console.log('🎨 [MERMAID COMPONENT] Props changed:', {
      id,
      codeLength: code?.length || 0,
      codePreview: code?.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });
  }, [code, id]);

  // PNG preview state
  const [showPngPreview, setShowPngPreview] = useState(false);
  const [pngPreviewUrl, setPngPreviewUrl] = useState<string | null>(null);

  // Download functions
  const downloadAsPNG = async () => {
    const sourceElement = isFullscreen ? fullscreenRef.current : elementRef.current;
    if (!sourceElement) return;

    try {
      const svgElement = sourceElement.querySelector('svg');
      if (!svgElement) return;

      // Clone the SVG and modify it for export
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      
      // Set explicit white background
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', '#ffffff');
      clonedSvg.insertBefore(rect, clonedSvg.firstChild);

      // Get SVG dimensions
      const bbox = svgElement.getBBox();
      const width = bbox.width || 800;
      const height = bbox.height || 600;

      // Set proper dimensions
      clonedSvg.setAttribute('width', width.toString());
      clonedSvg.setAttribute('height', height.toString());
      clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);

      // Serialize the SVG
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));

      // Create canvas for conversion
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set high resolution
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // Create image and convert
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Fill white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          
          // Draw the SVG
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob and show preview
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setPngPreviewUrl(url);
              setShowPngPreview(true);
            }
          }, 'image/png', 1.0);
        } catch (canvasError) {
          console.error('Canvas conversion error:', canvasError);
          // Fallback: download as SVG
          downloadAsSVG();
        }
      };

      img.onerror = () => {
        console.error('Image load error, falling back to SVG download');
        downloadAsSVG();
      };

      img.src = svgDataUrl;
    } catch (err) {
      console.error('Error generating PNG preview:', err);
      // Fallback: download as SVG
      downloadAsSVG();
    }
  };

  const downloadPngFromPreview = () => {
    if (pngPreviewUrl) {
      const link = document.createElement('a');
      link.download = `mermaid-diagram-${Date.now()}.png`;
      link.href = pngPreviewUrl;
      link.click();
    }
  };

  const closePngPreview = () => {
    if (pngPreviewUrl) {
      URL.revokeObjectURL(pngPreviewUrl);
      setPngPreviewUrl(null);
    }
    setShowPngPreview(false);
  };

  const downloadAsSVG = () => {
    const sourceElement = isFullscreen ? fullscreenRef.current : elementRef.current;
    if (!sourceElement) return;

    try {
      const svgElement = sourceElement.querySelector('svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `mermaid-diagram-${Date.now()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading SVG:', err);
    }
  };

  const downloadMermaidCode = () => {
    try {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `mermaid-diagram-${Date.now()}.mmd`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading Mermaid code:', err);
    }
  };

  // Fullscreen functions
  const openFullscreen = () => {
    setIsFullscreen(true);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    // Prevent body scroll when fullscreen is open
    document.body.style.overflow = 'hidden';
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  // Zoom functions
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 5)); // Max zoom 5x
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.1)); // Min zoom 0.1x
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Pan functions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
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

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.min(Math.max(prev * delta, 0.1), 5));
  };

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFullscreen) {
          closeFullscreen();
        } else if (showPngPreview) {
          closePngPreview();
        }
      }
    };

    if (isFullscreen || showPngPreview) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isFullscreen, showPngPreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isFullscreen) {
        document.body.style.overflow = 'unset';
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const renderDiagram = async () => {
      try {
        // Validate inputs
        if (!code || typeof code !== 'string' || code.trim().length === 0) {
          throw new Error('Invalid or empty diagram code');
        }

        // Wait for element to be available
        if (!elementRef.current) {
          console.warn('Mermaid element ref not available');
          return;
        }

        // Dynamically import mermaid
        const mermaid = (await import('mermaid')).default;
        
        if (!isMounted) return;

        // Initialize mermaid only once
        if (!mermaidLoaded) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit',
            suppressErrorRendering: true,
            themeVariables: {
              background: '#ffffff',
              primaryColor: '#ffffff',
              primaryTextColor: '#000000',
              primaryBorderColor: '#000000',
              lineColor: '#000000',
              secondaryColor: '#f8f8f8',
              tertiaryColor: '#f0f0f0',
            },
            // Add flowchart and sequence diagram specific configurations
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: 'basis',
              padding: 20,
            },
            sequence: {
              useMaxWidth: true,
              diagramMarginX: 50,
              diagramMarginY: 50,
              actorMargin: 50,
              width: 150,
              height: 65,
              boxMargin: 10,
              boxTextMargin: 5,
              noteMargin: 10,
              messageMargin: 35,
              mirrorActors: false,
              bottomMarginAdj: 1,
              rightAngles: false,
              showSequenceNumbers: false,
            },
            // Add gantt and other diagram types
            gantt: {
              useMaxWidth: true,
              leftPadding: 75,
              gridLineStartPadding: 35,
              fontSize: 11,
              sectionFontSize: 11,
              numberSectionStyles: 4,
            },
          });
          setMermaidLoaded(true);
        }

        // Generate a unique ID for this diagram
        const diagramId = id || `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        
        // Clean the code
        const cleanCode = code.trim();
        
        // Validate mermaid syntax by trying to parse it
        try {
          await mermaid.parse(cleanCode);
        } catch (parseError) {
          throw new Error(`Mermaid syntax error: ${parseError instanceof Error ? parseError.message : 'Invalid syntax'}`);
        }

        // Clear any existing content
        if (elementRef.current && isMounted) {
          elementRef.current.innerHTML = '';
        }
        
        // Render the diagram
        const { svg } = await mermaid.render(diagramId, cleanCode);
        
        // Set the SVG content if component is still mounted
        if (elementRef.current && isMounted) {
          elementRef.current.innerHTML = svg;
          
          // Minimal text enhancement only - preserve original SVG layout
          const svgElement = elementRef.current.querySelector('svg');
          if (svgElement) {
            // Only improve text styling without changing SVG structure
            const textElements = svgElement.querySelectorAll('text');
            textElements.forEach((textEl) => {
              const element = textEl as SVGTextElement;
              
              // Minimal styling improvements for better readability
              element.style.fontFamily = element.style.fontFamily || 'inherit';
              element.style.fill = element.style.fill || '#000000';
              
              // Slightly improve font weight for better visibility
              if (!element.style.fontWeight) {
                element.style.fontWeight = '500';
              }
            });
          }
          
          setIsLoaded(true);
          setError(null);
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
          setIsLoaded(true);
        }
      }
    };

    // Add a delay to ensure DOM is ready
    const timer = setTimeout(renderDiagram, 50);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [code, id, mermaidLoaded]);

  if (error) {
    return (
      <div className="border border-red-300 bg-red-50 dark:bg-red-900/20 p-4 rounded-md my-4">
        <h4 className="text-red-800 dark:text-red-200 font-medium mb-2">Mermaid Diagram Error</h4>
        <p className="text-red-600 dark:text-red-300 text-sm mb-2">{error}</p>
        <details className="text-sm">
          <summary className="cursor-pointer text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200">
            Show source code
          </summary>
          <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs overflow-x-auto">
            <code>{code}</code>
          </pre>
        </details>
      </div>
    );
  }

  return (
    <>
      <div className="mermaid-container my-4 w-full">
        {!isLoaded && (
          <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300 text-sm">Loading diagram...</span>
          </div>
        )}
        <div className="relative group">
          <div 
            ref={elementRef} 
            className={`mermaid-diagram w-full bg-white rounded-lg p-4 border border-gray-200 cursor-pointer ${!isLoaded ? 'hidden' : ''}`}
            style={{ 
              display: isLoaded ? 'flex' : 'none', 
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px'
            }}
            onClick={() => onFullscreenClick ? onFullscreenClick(code) : openFullscreen()}
            title="Click to open in fullscreen"
          />
          {isLoaded && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex gap-1 bg-white/90 backdrop-blur-sm rounded-md p-1 shadow-lg border border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFullscreenClick ? onFullscreenClick(code) : openFullscreen();
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Open in fullscreen"
                >
                  <IconMaximize size={14} />
                  Full
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPngPreviewClick ? onPngPreviewClick(code) : downloadAsPNG();
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Preview PNG (with SVG fallback)"
                >
                  <IconDownload size={14} />
                  Preview
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadAsSVG();
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Download as SVG"
                >
                  <IconDownload size={14} />
                  SVG
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadMermaidCode();
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Download Mermaid code"
                >
                  <IconFileText size={14} />
                  Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2">
          <div className="relative w-[98vw] h-[98vh] bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
              title="Close fullscreen (ESC)"
            >
              <IconX size={20} className="text-gray-600 hover:text-gray-800" />
            </button>

            {/* Download buttons in fullscreen */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
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
                <IconDownload size={16} />
                SVG
              </button>
              <button
                onClick={downloadMermaidCode}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 rounded-lg shadow-lg transition-colors"
                title="Download Mermaid code"
              >
                <IconFileText size={16} />
                Code
              </button>
            </div>

            {/* Zoom controls */}
            <div className="absolute top-4 right-16 z-20 flex gap-2">
              <button
                onClick={zoomOut}
                className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                title="Zoom out"
              >
                <IconZoomOut size={16} className="text-gray-600 hover:text-gray-800" />
              </button>
              <button
                onClick={resetZoom}
                className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                title="Reset zoom and position"
              >
                <IconRefresh size={16} className="text-gray-600 hover:text-gray-800" />
              </button>
              <button
                onClick={zoomIn}
                className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                title="Zoom in"
              >
                <IconZoomIn size={16} className="text-gray-600 hover:text-gray-800" />
              </button>
              <div className="px-3 py-2 bg-white/90 rounded-lg shadow-lg text-sm font-mono text-gray-600">
                {Math.round(zoomLevel * 100)}%
              </div>
            </div>

            {/* Fullscreen diagram with zoom and pan */}
            <div 
              className="w-full h-full bg-white overflow-hidden"
              style={{ paddingTop: '60px' }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div 
                ref={diagramContentRef}
                className="w-full h-full flex items-center justify-center transform-gpu"
                style={{
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
              >
                <div 
                  ref={fullscreenRef}
                  className="bg-white p-4 rounded-lg shadow-lg"
                >
                  {elementRef.current && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: elementRef.current.innerHTML
                      }}
                      className="mermaid-diagram"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/60 text-white px-4 py-2 rounded-lg text-sm">
              Mouse wheel: zoom • Drag: pan • ESC: close
            </div>
          </div>
        </div>
      )}

      {/* PNG Preview Modal */}
      {showPngPreview && pngPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2">
          <div className="relative w-[98vw] h-[98vh] bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={closePngPreview}
              className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
              title="Close preview"
            >
              <IconX size={20} className="text-gray-600 hover:text-gray-800" />
            </button>
            
            {/* Download button */}
            <button
              onClick={downloadPngFromPreview}
              className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
              title="Download PNG"
            >
              <IconDownload size={16} />
              Download PNG
            </button>
            
            <div className="w-full h-full flex items-center justify-center">
              <img src={pngPreviewUrl} alt="Mermaid Diagram Preview" className="max-w-full max-h-full cursor-pointer" onClick={downloadPngFromPreview} />
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/60 text-white px-4 py-2 rounded-lg text-sm">
              Click image or download button to save • ESC to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 