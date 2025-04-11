
import { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, ZoomReset } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ZoomableImage({ src, alt, className = "" }: ZoomableImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Reset zoom and position when image changes
    setIsZoomed(false);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  const toggleZoom = () => {
    if (isZoomed) {
      // Reset zoom
      setIsZoomed(false);
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    } else {
      // Zoom to the default zoom level
      setIsZoomed(true);
      setZoomLevel(2);
    }
  };

  const increaseZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(true);
    setZoomLevel(prev => Math.min(prev + 0.5, 5));
  };

  const decreaseZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => {
      const newLevel = Math.max(prev - 0.5, 1);
      if (newLevel === 1) {
        setIsZoomed(false);
        setPosition({ x: 0, y: 0 });
      }
      return newLevel;
    });
  };

  const resetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed && zoomLevel > 1) {
      isDragging.current = true;
      lastPosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      const deltaX = e.clientX - lastPosition.current.x;
      const deltaY = e.clientY - lastPosition.current.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastPosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Also handle when mouse leaves the container
  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  return (
    <div className={`relative group ${className}`} ref={containerRef}>
      <div 
        className={`overflow-hidden ${isZoomed ? "cursor-grab" : "cursor-zoom-in"} w-full h-full`}
        onClick={toggleZoom}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-200"
          style={{ 
            transform: isZoomed ? `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)` : "scale(1)",
            transformOrigin: "center center",
            userSelect: "none", // Prevent selection during drag
          }}
          draggable={false} // Prevent native dragging
        />
      </div>
      
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white"
          onClick={increaseZoom}
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white"
          onClick={decreaseZoom}
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white"
          onClick={resetZoom}
          title="Reset Zoom"
        >
          <ZoomReset className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
