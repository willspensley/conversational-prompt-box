
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ReportItem } from "@/lib/pdf-utils";
import { ImagePlus, Maximize, MessageSquare, Trash2 } from "lucide-react";
import { ZoomableImage } from "../ZoomableImage";
import { useToast } from "@/hooks/use-toast";

interface InventoryItemEditorProps {
  item: ReportItem;
  index: number;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  onEnlargeImage: (src: string, alt: string) => void;
}

export function InventoryItemEditor({ 
  item, 
  index, 
  onUpdate, 
  onRemove, 
  onEnlargeImage 
}: InventoryItemEditorProps) {
  const { toast } = useToast();

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Item {index + 1}</h4>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onRemove(index)}
          className="h-8 w-8 p-0 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Description</label>
          <Input 
            value={item.description} 
            onChange={e => onUpdate(index, "description", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Condition</label>
          <select
            className="w-full px-3 py-2 border rounded-md text-sm"
            value={item.condition}
            onChange={e => onUpdate(index, "condition", e.target.value as "Good" | "Fair" | "Poor")}
          >
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-1">
        <label className="text-xs font-medium">Notes</label>
        <Textarea 
          value={item.notes} 
          onChange={e => onUpdate(index, "notes", e.target.value)}
          className="h-16"
        />
      </div>
      
      {item.aiAnalysis !== undefined && (
        <div className="space-y-1">
          <label className="text-xs font-medium flex items-center gap-1 text-primary">
            <MessageSquare className="h-3 w-3" />
            AI Analysis (editable)
          </label>
          <Textarea
            value={item.aiAnalysis || ""}
            onChange={e => onUpdate(index, "aiAnalysis", e.target.value)}
            className="min-h-24 text-sm border border-primary/20"
            placeholder="AI analysis will appear here after processing images"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <label className="text-xs font-medium">Images ({item.images.length})</label>
        <div className="flex flex-wrap gap-2">
          {item.images.map((img, imgIndex) => (
            <div key={imgIndex} className="relative group">
              <div className="w-20 h-20 rounded-md overflow-hidden border">
                <ZoomableImage 
                  src={img} 
                  alt={`Item ${index + 1} image ${imgIndex + 1}`}
                  className="w-full h-full"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  onUpdate(
                    index, 
                    "images", 
                    item.images.filter((_, i) => i !== imgIndex)
                  );
                }}
                className="absolute top-1 right-1 bg-black bg-opacity-60 p-1 rounded-full hidden group-hover:block"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
              <button
                type="button"
                onClick={() => onEnlargeImage(
                  img,
                  `Item ${index + 1} image ${imgIndex + 1}`
                )}
                className="absolute bottom-1 right-1 bg-black bg-opacity-60 p-1 rounded-full hidden group-hover:block"
              >
                <Maximize className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          <button
            className="w-20 h-20 flex items-center justify-center border border-dashed rounded-md hover:bg-muted transition-colors"
            onClick={() => {
              toast({
                title: "Image Upload",
                description: "This functionality would be added in a future update.",
              });
            }}
          >
            <ImagePlus className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
