import React, { useRef, useState, useEffect } from 'react';
import { ActiveTool, SoundMarker, DrawingStroke, DrawingText } from '../types';
import { getPageContent } from '../data';
import { Volume2, Type, Trash2, Globe, Sparkles, AlertCircle } from 'lucide-react';

interface InteractiveTextbookPageProps {
  pageNumber: number;
  activeTool: ActiveTool;
  activeColor: string;
  activeWidth: number;
  scale: number;
  pdfDocument: any; // PDF.js Document instance if loaded
  soundMarkers: SoundMarker[];
  onAddSoundMarker: (marker: SoundMarker) => void;
  onRemoveSoundMarker: (id: string) => void;
  playingMarkerId: string | null;
  onPlaySoundMarker: (marker: SoundMarker) => void;
  strokes: DrawingStroke[];
  onAddStroke: (stroke: DrawingStroke) => void;
  onClearDrawing: () => void;
  texts: DrawingText[];
  onAddText: (text: DrawingText) => void;
  onRemoveText: (id: string) => void;
  onTranslateWord: (word: string, x: number, y: number) => void;
  isDarkMode: boolean;
}

export default function InteractiveTextbookPage({
  pageNumber,
  activeTool,
  activeColor,
  activeWidth,
  scale,
  pdfDocument,
  soundMarkers,
  onAddSoundMarker,
  onRemoveSoundMarker,
  playingMarkerId,
  onPlaySoundMarker,
  strokes,
  onAddStroke,
  onClearDrawing,
  texts,
  onAddText,
  onRemoveText,
  onTranslateWord,
  isDarkMode,
}: InteractiveTextbookPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const highlightCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [pdfRenderLoading, setPdfRenderLoading] = useState(false);
  const [pdfTextItems, setPdfTextItems] = useState<{
    str: string;
    left: number;
    top: number;
    width: number;
    height: number;
    fontSize: number;
  }[]>([]);

  // Multi-word phrase translation state
  const [selectedWords, setSelectedWords] = useState<{ id: string; text: string; rect: DOMRect; order: number }[]>([]);
  const [isWordDragging, setIsWordDragging] = useState(false);
  const lastClickedWordRef = useRef<{ id: string; text: string; rect: DOMRect; order: number } | null>(null);

  // Text element dragging states
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const dragStartPosRef = useRef<{ 
    clientX: number; 
    clientY: number; 
    startX: number; 
    startY: number; 
    hasMoved: boolean;
    dragOffsetX?: number;
    dragOffsetY?: number;
  } | null>(null);
  const wasMovedRef = useRef<boolean>(false);

  // Local drag coordinates to avoid laggy main app/localStorage writes on every single frame of a drag
  const [draggedTextPos, setDraggedTextPos] = useState<{ id: string; x: number; y: number } | null>(null);
  const draggedTextPosRef = useRef<{ id: string; x: number; y: number } | null>(null);
  useEffect(() => {
    draggedTextPosRef.current = draggedTextPos;
  }, [draggedTextPos]);

  const textsRef = useRef(texts);
  const onAddTextRef = useRef(onAddText);

  useEffect(() => {
    textsRef.current = texts;
  }, [texts]);

  useEffect(() => {
    onAddTextRef.current = onAddText;
  }, [onAddText]);

  useEffect(() => {
    if (!draggingTextId) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const start = dragStartPosRef.current;
      if (!start || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) return;

      const deltaX = e.clientX - start.clientX;
      const deltaY = e.clientY - start.clientY;

      if (!start.hasMoved && Math.sqrt(deltaX * deltaX + deltaY * deltaY) > 5) {
        start.hasMoved = true;
        wasMovedRef.current = true;
      }

      if (start.hasMoved) {
        // Calculate percentages using current mouse position with robust support for scaled/scrolled coordinates
        const currentMousePercentX = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        const currentMousePercentY = ((e.clientY - containerRect.top) / containerRect.height) * 100;

        const grabOffsetX = start.dragOffsetX ?? 0;
        const grabOffsetY = start.dragOffsetY ?? 0;

        let nextX = currentMousePercentX - grabOffsetX;
        let nextY = currentMousePercentY - grabOffsetY;

        // Clamp to avoid going off edge (2% - 98%)
        nextX = Math.max(2, Math.min(98, nextX));
        nextY = Math.max(2, Math.min(98, nextY));

        setDraggedTextPos({
          id: draggingTextId,
          x: nextX,
          y: nextY,
        });
      }
    };

    const handleWindowMouseUp = () => {
      setTimeout(() => {
        wasMovedRef.current = false;
      }, 50);

      // Commit the final position back to the parent once only after drag release
      const finalPos = draggedTextPosRef.current;
      if (finalPos) {
        const targetText = textsRef.current.find(t => t.id === finalPos.id);
        if (targetText && onAddTextRef.current) {
          onAddTextRef.current({
            ...targetText,
            x: finalPos.x,
            y: finalPos.y,
          });
        }
      }

      setDraggingTextId(null);
      setDraggedTextPos(null);
      dragStartPosRef.current = null;
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingTextId]);

  // Standard internal dimension for scaling drawing coordinates
  const internalWidth = 800;
  const internalHeight = 1100;

  // Get textbook Mock data
  const mockData = getPageContent(pageNumber);

  // Load and render PDF using PDF.js inside the canvas!
  useEffect(() => {
    if (!pdfDocument || !pdfCanvasRef.current) return;

    let isSubscribed = true;
    const renderPdfPage = async () => {
      try {
        setPdfRenderLoading(true);
        const page = await pdfDocument.getPage(pageNumber);
        if (!isSubscribed) return;

        const canvas = pdfCanvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Calculate scale to match our standard internal coordinate space (800 width)
        const pdfWidth = page.getViewport({ scale: 1 }).width;
        const viewport = page.getViewport({ scale: internalWidth / pdfWidth });
        
        canvas.width = internalWidth;
        canvas.height = internalHeight;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Extract native PDF text items to support dictionary/translation clicks
        try {
          const textContent = await page.getTextContent();
          if (isSubscribed) {
            const items = textContent.items.map((item: any) => {
              const tx = item.transform;
              const x = tx[4];
              const y = tx[5];
              const [vx, vy] = viewport.convertToViewportPoint(x, y);
              
              const fontScale = Math.abs(tx[3] || tx[0] || 12);
              const fontSize = fontScale * (internalWidth / pdfWidth);
              
              return {
                str: item.str,
                left: vx,
                top: vy - fontSize, // Baseline to top-left transform offset
                width: (item.width || 50) * (internalWidth / pdfWidth),
                height: fontSize,
                fontSize: fontSize
              };
            });
            setPdfTextItems(items);
          }
        } catch (textErr) {
          console.error("PDF.js text content extraction error:", textErr);
        }

        setPdfRenderLoading(false);
      } catch (err) {
        console.error("PDF.js Render error:", err);
        setPdfRenderLoading(false);
      }
    };

    renderPdfPage();
    return () => {
      isSubscribed = false;
    };
  }, [pdfDocument, pageNumber]);

  // Redraw Pen & Highlighter canvasses whenever strokes change
  useEffect(() => {
    drawStrokes();
  }, [strokes, currentPoints, pageNumber]);

  const drawStrokes = () => {
    const drawCanvas = drawCanvasRef.current;
    const highlightCanvas = highlightCanvasRef.current;
    if (!drawCanvas || !highlightCanvas) return;

    const drawCtx = drawCanvas.getContext('2d');
    const highlightCtx = highlightCanvas.getContext('2d');
    if (!drawCtx || !highlightCtx) return;

    // Clear both
    drawCtx.clearRect(0, 0, internalWidth, internalHeight);
    highlightCtx.clearRect(0, 0, internalWidth, internalHeight);

    // Draw saved strokes
    const allStrokes = [...strokes];
    
    // If active drawing, append temporary points
    if (isDrawing && currentPoints.length > 1) {
      allStrokes.push({
        id: 'temp',
        pageNumber,
        tool: activeTool === 'highlighter' ? 'highlighter' : 'pencil',
        color: activeColor,
        width: activeWidth,
        points: currentPoints
      });
    }

    allStrokes.forEach(stroke => {
      if (stroke.pageNumber !== pageNumber) return;
      
      const ctx = stroke.tool === 'highlighter' ? highlightCtx : drawCtx;
      
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;

      if (stroke.tool === 'highlighter') {
        ctx.globalAlpha = 0.4;
      } else {
        ctx.globalAlpha = 1.0;
      }

      const points = stroke.points;
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
      }
    });
  };

  // Convert pixel click coordinates to our standard 800x1100 page scale
  const getInternalCoords = (clientX: number, clientY: number) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    const x = ((clientX - rect.left) / rect.width) * internalWidth;
    const y = ((clientY - rect.top) / rect.height) * internalHeight;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // If a text box is currently being edited, clicking elsewhere on the page background should commit and deselect it without triggering other actions or creating new boxes.
    if (editingTextId) {
      setEditingTextId(null);
      return;
    }

    if (activeTool === 'select') return;
    
    const { x, y } = getInternalCoords(e.clientX, e.clientY);

    // 1. TEXT TOOL
    if (activeTool === 'text') {
      const rect = containerRef.current?.getBoundingClientRect();
      const relativeX = ((e.clientX - (rect?.left || 0)) / (rect?.width || 1)) * 100;
      const relativeY = ((e.clientY - (rect?.top || 0)) / (rect?.height || 1)) * 100;
      
      const newId = 'text_' + Date.now();
      const newText: DrawingText = {
        id: newId,
        pageNumber,
        text: '',
        x: relativeX,
        y: relativeY,
        color: activeColor,
        fontSize: Math.max(12, activeWidth * 2)
      };
      onAddText(newText);
      setEditingTextId(newId);
      return;
    }

    // 2. SOUND MARKER TOOL
    if (activeTool === 'sound') {
      const rect = containerRef.current?.getBoundingClientRect();
      const relativeX = ((e.clientX - (rect?.left || 0)) / (rect?.width || 1)) * 100;
      const relativeY = ((e.clientY - (rect?.top || 0)) / (rect?.height || 1)) * 100;
      
      const newMarker: SoundMarker = {
        id: 'sound_' + Date.now(),
        pageNumber,
        x: relativeX,
        y: relativeY,
        audioSrc: '', // Assigned loaded MP3 or mock sound later
        audioName: `Piste Audio (Page ${pageNumber})`,
      };
      onAddSoundMarker(newMarker);
      return;
    }

    // 3. ERASER TOOL
    if (activeTool === 'eraser') {
      // Find drawings or markers on that spot to erase
      // Pencil & Highlighter strokes erasing (distance check)
      const clickedStrokeIndex = strokes.findIndex(s => {
        if (s.pageNumber !== pageNumber) return false;
        return s.points.some(p => {
          const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
          return dist < 20; // threshold
        });
      });

      if (clickedStrokeIndex > -1) {
        // Remove it (this works seamlessly in drawing canvas)
        const updated = [...strokes];
        updated.splice(clickedStrokeIndex, 1);
        // Dispatch to parent
        onClearDrawing(); // clear all
        updated.forEach(s => onAddStroke(s)); // redraw everything remaining
      }
      return;
    }

    // 4. DRAWING & HIGHLIGHTING
    if (activeTool === 'pencil' || activeTool === 'highlighter') {
      setIsDrawing(true);
      setCurrentPoints([{ x, y }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawing) {
      const { x, y } = getInternalCoords(e.clientX, e.clientY);
      setCurrentPoints(prev => [...prev, { x, y }]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editingTextId) {
      e.preventDefault();
      setEditingTextId(null);
    }
  };

  const handleWordMouseDown = (id: string, text: string, rect: DOMRect, order: number, e: React.MouseEvent) => {
    if (activeTool !== 'translate' && activeTool !== 'highlighter') return;
    e.stopPropagation();
    setIsWordDragging(true);
    
    const wordItem = { id, text, rect, order };
    lastClickedWordRef.current = wordItem;

    if (e.shiftKey) {
      setSelectedWords(prev => {
        if (prev.some(w => w.id === id)) return prev.filter(w => w.id !== id);
        return [...prev, wordItem];
      });
    } else {
      setSelectedWords([wordItem]);
    }
  };

  const handleWordMouseEnter = (id: string, text: string, rect: DOMRect, order: number) => {
    if (!isWordDragging || (activeTool !== 'translate' && activeTool !== 'highlighter')) return;
    setSelectedWords(prev => {
      if (prev.some(w => w.id === id)) return prev;
      return [...prev, { id, text, rect, order }];
    });
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (currentPoints.length > 1) {
        const newStroke: DrawingStroke = {
          id: 'stroke_' + Date.now() + Math.random().toString(36).substr(2, 5),
          pageNumber,
          tool: activeTool === 'highlighter' ? 'highlighter' : 'pencil',
          color: activeColor,
          width: activeWidth,
          points: currentPoints
        };
        onAddStroke(newStroke);
      }
      setCurrentPoints([]);
    }

    if (isWordDragging) {
      setIsWordDragging(false);
      
      let wordsToTranslate = [...selectedWords];
      // Fallback to synchronously updated Ref if rapid click occurred before state updated
      if (wordsToTranslate.length === 0 && lastClickedWordRef.current) {
        wordsToTranslate = [lastClickedWordRef.current];
      }

      if (wordsToTranslate.length > 0) {
        // Sort selected words according to language order
        const sorted = [...wordsToTranslate].sort((a, b) => a.order - b.order);
        
        if (activeTool === 'highlighter') {
          // Word selection highlighter - draw a nice horizontal highlight stroke covering these words of activeColor
          const pts: { x: number; y: number }[] = [];
          sorted.forEach(w => {
            const leftCoords = getInternalCoords(w.rect.left, w.rect.top + w.rect.height / 2);
            const rightCoords = getInternalCoords(w.rect.right, w.rect.top + w.rect.height / 2);
            pts.push(leftCoords);
            pts.push(rightCoords);
          });
          if (pts.length > 0) {
            const newStroke: DrawingStroke = {
              id: 'stroke_h_' + Date.now() + Math.random().toString(36).substr(2, 5),
              pageNumber,
              tool: 'highlighter',
              color: activeColor,
              width: Math.max(14, activeWidth * 2.5), // thicker for word lines
              points: pts
            };
            onAddStroke(newStroke);
          }
        } else if (activeTool === 'translate') {
          const combinedText = sorted.map(w => w.text).join(' ').trim();
          if (combinedText) {
            // Put the translation bubble over the last word
            const lastWord = sorted[sorted.length - 1];
            onTranslateWord(combinedText, lastWord.rect.left + lastWord.rect.width / 2, lastWord.rect.top);
          }
        }
      }
      // Reset
      setSelectedWords([]);
      lastClickedWordRef.current = null;
    }
  };

  // Convert clicked paragraph words to clickable spans for live premium translation
  const renderInteractiveText = (text: string, paragraphIdx: number = 0) => {
    const words = text.split(" ");
    return words.map((word, wordIdx) => {
      // Clean word punctuation to search cleanly while preserving internal apostrophes, ligatures, and hyphens (e.g. l'enregistrement, d'été, bœuf)
      const cleanWord = word.trim().replace(/^[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ]+|[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ]+$/g, "");
      const isInteractive = activeTool === 'translate' || activeTool === 'highlighter';
      const wordId = `fallback-${paragraphIdx}-${wordIdx}`;
      const order = paragraphIdx * 1000 + wordIdx;
      
      const isSelected = selectedWords.some(w => w.id === wordId);
      
      return (
        <span
          key={wordIdx}
          className={`${
            isSelected
              ? 'bg-yellow-300 border border-yellow-400 text-slate-900 rounded px-0.5 font-semibold font-medium text-slate-950 font-bold'
              : activeTool === 'highlighter'
                ? 'active-word hover:bg-amber-100 cursor-crosshair transition-all duration-100 rounded text-slate-800'
                : activeTool === 'translate'
                  ? 'active-word hover:bg-yellow-100 cursor-help transition-all duration-100 rounded text-slate-800'
                  : 'text-slate-600'
          } inline-block mr-1 translate-word`}
          onMouseDown={(e) => {
            if (isInteractive && cleanWord.length > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              handleWordMouseDown(wordId, cleanWord, rect, order, e);
            }
          }}
          onMouseEnter={() => {
            if (isInteractive && cleanWord.length > 0) {
              const rect = document.getElementById(wordId)?.getBoundingClientRect();
              // Try finding manually or using trigger target element ref inside page event loop mapping dynamically
            }
          }}
          onMouseOver={(e) => {
            if (isInteractive && cleanWord.length > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              handleWordMouseEnter(wordId, cleanWord, rect, order);
            }
          }}
        >
          {word}
        </span>
      );
    });
  };

  // Convert PDF-projected text to interactive SVG tspans with precise horizontal spacing properties
  const renderPdfSvgWords = (phrase: string, itemIdx: number) => {
    const rawWords = phrase.split(/(\s+)/); // Keep spacing elements
    return rawWords.map((word, wordIdx) => {
      const cleanWord = word.trim().replace(/^[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ]+|[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ]+$/g, "");
      if (!cleanWord) {
        return (
          <tspan 
            key={wordIdx} 
            fill="transparent"
            className="select-none pointer-events-none"
          >
            {word}
          </tspan>
        );
      }
      const isInteractive = activeTool === 'translate' || activeTool === 'highlighter';
      const wordId = `pdf-word-${itemIdx}-${wordIdx}`;
      const order = itemIdx * 1000 + wordIdx;
      const isSelected = selectedWords.some(w => w.id === wordId);

      return (
        <tspan
          key={wordIdx}
          fill="transparent"
          stroke="transparent"
          className={`translate-word-svg select-none ${isSelected ? 'translate-word-svg-selected' : ''}`}
          style={{
            pointerEvents: isInteractive ? 'auto' : 'none',
          }}
          onMouseDown={(e) => {
            if (isInteractive && cleanWord.length > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              handleWordMouseDown(wordId, cleanWord, rect, order, e);
            }
          }}
          onMouseOver={(e) => {
            if (isInteractive && cleanWord.length > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              handleWordMouseEnter(wordId, cleanWord, rect, order);
            }
          }}
        >
          {word}
        </tspan>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      id={`interactive-page-container-${pageNumber}`}
      className="relative mx-auto bg-white shadow-xl transition-all select-none"
      style={{
        width: `${internalWidth}px`,
        height: `${internalHeight}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        willChange: 'transform'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      {/* Dynamic encapsulated stylesheet to provide beautiful glowing highlights on SVG hover and selection state */}
      <style>{`
        .translate-word-svg {
          transition: all 0.15s ease;
          paint-order: stroke fill;
        }
        .translate-word-svg:hover {
          fill: ${activeTool === 'translate' ? 'rgba(234, 179, 8, 0.12)' : activeTool === 'highlighter' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(59, 130, 246, 0.08)'} !important;
          stroke: ${activeTool === 'translate' ? 'rgba(234, 179, 8, 0.35)' : activeTool === 'highlighter' ? 'rgba(234, 179, 8, 0.5)' : 'rgba(59, 130, 246, 0.25)'} !important;
          stroke-width: 8px !important;
          stroke-linejoin: round !important;
          stroke-linecap: round !important;
          cursor: ${activeTool === 'highlighter' ? 'crosshair' : 'help'} !important;
        }
        .translate-word-svg-selected {
          fill: #0f172a !important;
          stroke: rgba(234, 179, 8, 0.5) !important;
          stroke-width: 12px !important;
          stroke-linejoin: round !important;
          stroke-linecap: round !important;
        }
      `}</style>

      {/* 1. BASE LAYER: PDF RENDER OR fallback TEXTBOOK DESIGN */}
      {pdfDocument ? (
        <>
          <canvas
            ref={pdfCanvasRef}
            id={`pdf-canvas-${pageNumber}`}
            className="pdf-canvas-layer w-full h-full bg-slate-100"
            style={{
              filter: isDarkMode ? 'invert(0.9) hue-rotate(180deg) contrast(0.9)' : 'none',
              transition: 'filter 0.3s ease',
            }}
          />
          {/* Real PDF Interactive Text Overlay Layer (invisible active word spans mapping PDF coordinates) */}
          {pdfTextItems.length > 0 && (
            <svg 
              className={`absolute inset-0 w-full h-full z-10 select-none ${
                activeTool === 'translate' || activeTool === 'highlighter' ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
              viewBox="0 0 800 1100"
            >
              {pdfTextItems.map((item, idx) => {
                if (!item.str || !item.str.trim()) return null;
                return (
                  <text
                    key={idx}
                    x={item.left}
                    y={item.top + item.fontSize} // Align baseline correctly with the canvas background
                    fontSize={item.fontSize}
                    fontFamily="sans-serif"
                    fill="transparent"
                    textLength={item.width}
                    lengthAdjust="spacingAndGlyphs"
                    className="select-none leading-none"
                    style={{ pointerEvents: 'none' }}
                  >
                    {renderPdfSvgWords(item.str, idx)}
                  </text>
                );
              })}
            </svg>
          )}
        </>
      ) : (
        /* Fallback Textbook Design */
        <div 
          className={`pdf-canvas-layer w-full h-full p-16 flex flex-col justify-between select-text relative ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200/50 text-slate-850'
          }`}
          style={{
            filter: isDarkMode ? 'invert(0.9) hue-rotate(180deg) contrast(0.9)' : 'none',
            transition: 'filter 0.3s ease',
          }}
        >
          <div>
            {/* Absolute layout header from spec */}
            <div className="absolute top-6 left-6 text-[10px] text-slate-400 font-mono tracking-widest font-semibold">
              DÉPARTEMENT DE FRANÇAIS
            </div>

            {/* Header / Chapter */}
            <header className="mb-10 mt-4">
              <span className="font-sans font-bold text-xs text-blue-600 uppercase tracking-widest mb-1.5 block">
                {mockData.unitTitle}
              </span>
              <h1 className="font-serif italic text-4xl text-slate-800 mb-3 tracking-normal font-normal">
                {mockData.title}
              </h1>
              <div className="h-0.5 w-20 bg-blue-600"></div>
            </header>

            {/* Paragraph layout parsed to clickable words */}
            <div className="space-y-6 text-slate-700 leading-relaxed text-[15px] font-serif max-w-2xl select-text">
              {mockData.texts.map((paragraph, idx) => (
                <p key={idx} className="indent-6 select-text text-justify">
                  {renderInteractiveText(paragraph, idx)}
                </p>
              ))}
            </div>

            {/* Separator Divider */}
            <div className="border-t my-8 border-slate-100"></div>

            {/* Exercises block */}
            <div className="space-y-4 mt-6 select-text">
              {mockData.exercises.map((ex, exIdx) => (
                <div key={exIdx} className="bg-slate-50 p-5 rounded-xl border border-slate-150 select-text">
                  <h4 className="font-sans font-bold text-xs text-blue-600 mb-3 uppercase tracking-wider flex items-center space-x-2">
                    <span className="bg-blue-50 text-blue-600 font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border border-blue-100">
                      {exIdx + 1}
                    </span>
                    <span>{ex.instruction}</span>
                  </h4>
                  <ul className="space-y-2 font-mono text-xs text-slate-600 pl-7 select-text list-disc marker:text-blue-500">
                    {ex.questions.map((q, qIdx) => (
                      <li key={qIdx} className="select-text">{renderInteractiveText(q, 100 + exIdx * 10 + qIdx)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Page Footer & Tips */}
          <div className="border-t pt-5 flex justify-between items-center text-slate-400 text-xs mt-6">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-sans font-medium text-[11px] text-slate-500">
                {mockData.interactiveTips}
              </span>
            </div>
            <div className="font-sans font-bold text-2xl text-slate-400 italic">
              {mockData.bookPageNumber}
            </div>
          </div>
        </div>
      )}

      {/* 2. HIGHLIGHT LAYER */}
      <canvas
        ref={highlightCanvasRef}
        width={internalWidth}
        height={internalHeight}
        className="pdf-highlight-layer w-full h-full pointer-events-none"
      />

      {/* 3. DRAW CANVAS LAYER */}
      <canvas
        ref={drawCanvasRef}
        width={internalWidth}
        height={internalHeight}
        className="pdf-draw-layer w-full h-full pointer-events-none"
      />

      {/* 4. HTML OVERLAYS LAYER (Audio Buttons & Text Tool) */}
      <div className="pdf-html-layer w-full h-full absolute inset-0 pointer-events-none">
        
         {/* Render texts added by text tool */}
        {texts.map((t) => {
          if (t.pageNumber !== pageNumber) return null;
          const isEditingThis = editingTextId === t.id;
          const renderX = (draggedTextPos && draggedTextPos.id === t.id) ? draggedTextPos.x : t.x;
          const renderY = (draggedTextPos && draggedTextPos.id === t.id) ? draggedTextPos.y : t.y;
          return (
            <EditableTextItem
              key={t.id}
              t={t}
              activeTool={activeTool}
              isDarkMode={isDarkMode}
              draggingTextId={draggingTextId}
              setDraggingTextId={setDraggingTextId}
              dragStartPosRef={dragStartPosRef}
              isEditingThis={isEditingThis}
              setEditingTextId={setEditingTextId}
              onAddText={onAddText}
              onRemoveText={onRemoveText}
              renderX={renderX}
              renderY={renderY}
            />
          );
        })}

        {/* Render interactive audio markers placed relative (percentage) */}
        {soundMarkers.map((m) => {
          if (m.pageNumber !== pageNumber) return null;
          const isPlayingThis = playingMarkerId === m.id;
          return (
            <div
              key={m.id}
              className="absolute pointer-events-auto group"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlaySoundMarker(m);
                }}
                className={`w-9 h-9 rounded-full relative flex items-center justify-center transition-all duration-300 shadow-md border ${
                  isPlayingThis
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400 animate-pulse scale-110'
                    : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 hover:scale-105'
                } cursor-pointer`}
                title={`${m.audioName} çalmak için tıkla`}
              >
                <Volume2 className={`w-4 h-4 ${isPlayingThis ? 'animate-bounce' : ''}`} />
                {isPlayingThis && (
                  <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping opacity-60"></span>
                )}
              </button>

              {/* Delete sound marker button on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSoundMarker(m.id);
                }}
                className="opacity-0 group-hover:opacity-100 absolute -top-4 -right-4 bg-rose-600 text-white rounded-full p-1 border border-white hover:bg-rose-700 pointer-events-auto shadow-md transition-opacity duration-150 cursor-pointer"
                title="Ses Butonunu Sil"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Real rendering fallback loader indicator inside page if resolving PDF */}
      {pdfRenderLoading && (
        <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center z-50 backdrop-blur-[1px]">
          <div className="bg-white p-4 rounded-xl shadow-lg flex items-center space-x-3 text-xs text-slate-600 font-medium">
            <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
            <span>Sayfa PDF.js ile Yükleniyor...</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface EditableTextItemProps {
  key?: string;
  t: DrawingText;
  activeTool: ActiveTool;
  isDarkMode: boolean;
  draggingTextId: string | null;
  setDraggingTextId: (id: string | null) => void;
  dragStartPosRef: React.MutableRefObject<{ clientX: number; clientY: number; startX: number; startY: number; hasMoved: boolean } | null>;
  isEditingThis: boolean;
  setEditingTextId: (id: string | null) => void;
  onAddText: (text: DrawingText) => void;
  onRemoveText: (id: string) => void;
  renderX: number;
  renderY: number;
}

function EditableTextItem({
  t,
  activeTool,
  isDarkMode,
  draggingTextId,
  setDraggingTextId,
  dragStartPosRef,
  isEditingThis,
  setEditingTextId,
  onAddText,
  onRemoveText,
  renderX,
  renderY,
}: EditableTextItemProps) {
  const [localValue, setLocalValue] = useState(t.text);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local state when external model changes, but NEVER while actively typing
  useEffect(() => {
    if (!isEditingThis) {
      setLocalValue(t.text);
    }
  }, [t.text, isEditingThis]);

  // Robust focus execution with safety timeout to prevent browser focus-stealing
  useEffect(() => {
    if (isEditingThis) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isEditingThis]);

  const handleFinish = () => {
    const val = localValue.trim();
    if (!val) {
      onRemoveText(t.id);
    } else {
      onAddText({
        ...t,
        text: val,
      });
    }
    setEditingTextId(null);
  };

  return (
    <div
      className={`absolute rounded-lg px-2 py-1 border border-dashed z-20 group select-text ${
        draggingTextId === t.id ? '' : 'transition-all duration-150'
      } ${
        activeTool === 'select' || activeTool === 'text'
          ? 'pointer-events-auto'
          : 'pointer-events-none'
      } ${
        isEditingThis
          ? 'border-blue-500/50 bg-blue-50/5 dark:bg-blue-950/10'
          : draggingTextId === t.id
            ? 'cursor-grabbing border-blue-500 bg-blue-500/10 scale-105 shadow-md font-bold'
            : 'cursor-grab border-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
      }`}
      style={{
        left: `${renderX}%`,
        top: `${renderY}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseDown={(e) => {
        if (isEditingThis) {
          e.stopPropagation();
          return;
        }
        // Only allow dragging if active tool is select or text
        if (activeTool !== 'select' && activeTool !== 'text') return;
        // Don't drag if clicked on a button or trash icon
        if ((e.target as HTMLElement).closest('button')) return;

        e.preventDefault();
        e.stopPropagation();

        const parentPageElement = document.getElementById(`interactive-page-container-${t.pageNumber}`);
        let dragOffsetX = 0;
        let dragOffsetY = 0;
        if (parentPageElement) {
          const rect = parentPageElement.getBoundingClientRect();
          const currentMousePercentX = ((e.clientX - rect.left) / rect.width) * 100;
          const currentMousePercentY = ((e.clientY - rect.top) / rect.height) * 100;
          dragOffsetX = currentMousePercentX - t.x;
          dragOffsetY = currentMousePercentY - t.y;
        }

        setDraggingTextId(t.id);
        dragStartPosRef.current = {
          clientX: e.clientX,
          clientY: e.clientY,
          startX: t.x,
          startY: t.y,
          hasMoved: false,
          dragOffsetX,
          dragOffsetY,
        };
      }}
      onMouseUp={(e) => {
        if (isEditingThis) {
          e.stopPropagation();
          return;
        }
        
        const start = dragStartPosRef.current;
        if (start && !start.hasMoved) {
          setEditingTextId(t.id);
        }
      }}
    >
      {isEditingThis ? (
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          placeholder="Yazın..."
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleFinish}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
              e.preventDefault();
              handleFinish();
            }
          }}
          onKeyPress={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className={`font-sans font-semibold border-b border-dashed outline-none focus:ring-0 p-0 text-center select-text placeholder-slate-400 dark:placeholder-slate-500 ${
            isDarkMode && t.color === '#000000' ? 'text-white border-white' : ''
          }`}
          style={{
            color: isDarkMode && (t.color === '#000000' || t.color === 'black') ? '#ffffff' : t.color,
            borderColor: isDarkMode && (t.color === '#000000' || t.color === 'black') ? '#ffffff' : t.color,
            backgroundColor: 'transparent',
            fontSize: `${t.fontSize}px`,
            width: `${Math.max(80, (localValue || 'Yazın...').length * t.fontSize * 0.65)}px`,
            userSelect: 'text',
            WebkitUserSelect: 'text',
            MozUserSelect: 'text',
            msUserSelect: 'text',
            cursor: 'text',
          }}
        />
      ) : (
        <span
          style={{
            color: isDarkMode && (t.color === '#000000' || t.color === 'black') ? '#ffffff' : t.color,
            fontSize: `${t.fontSize}px`,
            fontWeight: 600,
          }}
          title="Düzenlemek için tıklayın, taşımak için sürükleyin"
        >
          {t.text}
        </span>
      )}
      
      {!isEditingThis && (activeTool === 'select' || activeTool === 'text') && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemoveText(t.id);
          }}
          className="opacity-0 group-hover:opacity-100 absolute -top-5 right-0 bg-red-600 text-white rounded p-0.5 text-[8px] hover:bg-red-700 pointer-events-auto shadow cursor-pointer shadow-md z-35"
          title="Yazıyı Sil"
        >
          <Trash2 className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
}

