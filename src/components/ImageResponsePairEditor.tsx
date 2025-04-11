
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ZoomableImage } from "./ZoomableImage";
import { ImageResponsePair } from "@/lib/pdf-utils";
import { Pencil, Trash2, Save, Plus, Maximize, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageResponsePairEditorProps {
  pairs: ImageResponsePair[];
  onChange: (pairs: ImageResponsePair[]) => void;
}

export function ImageResponsePairEditor({ pairs, onChange }: ImageResponsePairEditorProps) {
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [enlargedImage, setEnlargedImage] = useState<{src: string; alt: string} | null>(null);
  const { toast } = useToast();

  const toggleEditMode = (id: string) => {
    setEditMode(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleResponseChange = (id: string, newResponse: string) => {
    const updatedPairs = pairs.map(pair => 
      pair.id === id ? { ...pair, response: newResponse } : pair
    );
    onChange(updatedPairs);
  };

  const handleDeletePair = (id: string) => {
    const updatedPairs = pairs.filter(pair => pair.id !== id);
    onChange(updatedPairs);
    toast({
      title: "Pair Deleted",
      description: "The image-response pair has been removed.",
    });
  };

  const handleAddPair = () => {
    toast({
      title: "Upload Feature",
      description: "This functionality would allow adding new image-response pairs in a future update.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Image-Response Pairs ({pairs.length})</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAddPair}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Pair
        </Button>
      </div>
      
      <ScrollArea className="h-80 rounded-md border border-neutral-800">
        <div className="space-y-4 p-4">
          {pairs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p>No image-response pairs available.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddPair}
                className="mt-2 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add First Pair
              </Button>
            </div>
          ) : (
            pairs.map((pair) => (
              <div 
                key={pair.id} 
                className="flex flex-col md:flex-row gap-4 p-4 rounded-lg border border-neutral-800 bg-neutral-900/50"
              >
                {/* Image container with controls */}
                <div className="relative group">
                  <div className="w-full md:w-[300px] h-[300px] rounded-md overflow-hidden">
                    <ZoomableImage 
                      src={pair.imageUrl} 
                      alt={`Analysis image ${pair.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setEnlargedImage({
                      src: pair.imageUrl,
                      alt: `Analysis image ${pair.id}`
                    })}
                    className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Response container with controls */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-primary">AI Analysis</h4>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleEditMode(pair.id)}
                        className="h-8 w-8 text-primary"
                      >
                        {editMode[pair.id] ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeletePair(pair.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1 h-[250px] border border-neutral-800 rounded-md bg-background">
                    {editMode[pair.id] ? (
                      <Textarea
                        value={pair.response}
                        onChange={(e) => handleResponseChange(pair.id, e.target.value)}
                        className="min-h-[250px] h-full p-3 text-sm bg-transparent border-none focus-visible:ring-0"
                        placeholder="AI analysis will appear here..."
                      />
                    ) : (
                      <div 
                        className="p-3 text-sm whitespace-pre-wrap h-full"
                        style={{ minHeight: "250px" }}
                      >
                        {pair.response || "No analysis available."}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Full Screen Image Modal */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setEnlargedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <ZoomableImage 
              src={enlargedImage.src} 
              alt={enlargedImage.alt}
              className="w-full h-full rounded-lg overflow-hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}
