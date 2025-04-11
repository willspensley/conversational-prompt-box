
import { useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ZoomableImage({ src, alt, className = "" }: ZoomableImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    setZoomLevel(isZoomed ? 1 : 2);
  };

  const increaseZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(true);
    setZoomLevel(prev => Math.min(prev + 0.5, 4));
  };

  const decreaseZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => {
      const newLevel = Math.max(prev - 0.5, 1);
      if (newLevel === 1) setIsZoomed(false);
      return newLevel;
    });
  };

  return (
    <div className="relative group">
      <div 
        className={`overflow-hidden ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"} ${className}`}
        onClick={toggleZoom}
        style={{ position: "relative" }}
      >
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-200"
          style={{ 
            transform: isZoomed ? `scale(${zoomLevel})` : "scale(1)",
            transformOrigin: "center center",
          }}
        />
      </div>
      
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
          onClick={increaseZoom}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
          onClick={decreaseZoom}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
