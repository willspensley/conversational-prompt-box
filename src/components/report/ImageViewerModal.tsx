
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ZoomableImage } from "../ZoomableImage";

interface ImageViewerModalProps {
  image: { src: string; alt: string } | null;
  onClose: () => void;
}

export function ImageViewerModal({ image, onClose }: ImageViewerModalProps) {
  if (!image) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
        <ZoomableImage 
          src={image.src} 
          alt={image.alt}
          className="w-full h-full rounded-lg overflow-hidden"
        />
      </div>
    </div>
  );
}
