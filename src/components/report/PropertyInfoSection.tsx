
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageResponsePair } from "@/lib/pdf-utils";
import { ImageResponsePairEditor } from "../ImageResponsePairEditor";
import { Plus } from "lucide-react";

interface PropertyInfoSectionProps {
  address: string;
  type: string;
  imageResponsePairs: ImageResponsePair[];
  onUpdateField: (field: string, value: string) => void;
  onUpdatePairs: (pairs: ImageResponsePair[]) => void;
  onAddDemoPairs: () => void;
}

export function PropertyInfoSection({ 
  address, 
  type, 
  imageResponsePairs, 
  onUpdateField, 
  onUpdatePairs,
  onAddDemoPairs
}: PropertyInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Property Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Property Address</label>
          <Input 
            value={address} 
            onChange={e => onUpdateField("address", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Property Type</label>
          <Input 
            value={type} 
            onChange={e => onUpdateField("type", e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        <ImageResponsePairEditor 
          pairs={imageResponsePairs || []}
          onChange={onUpdatePairs}
        />
        
        {(imageResponsePairs || []).length === 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddDemoPairs}
            className="mt-2 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add Demo Pairs from Item Images
          </Button>
        )}
      </div>
    </div>
  );
}
