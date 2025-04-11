
import { Button } from "@/components/ui/button";
import { ReportItem } from "@/lib/pdf-utils";
import { Plus } from "lucide-react";
import { InventoryItemEditor } from "./InventoryItemEditor";

interface InventoryItemsSectionProps {
  items: ReportItem[];
  onUpdateItem: (index: number, field: string, value: any) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onEnlargeImage: (src: string, alt: string) => void;
}

export function InventoryItemsSection({ 
  items, 
  onUpdateItem, 
  onAddItem, 
  onRemoveItem,
  onEnlargeImage
}: InventoryItemsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Inventory Items</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddItem}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>
      
      {items.map((item, index) => (
        <InventoryItemEditor 
          key={item.id} 
          item={item} 
          index={index}
          onUpdate={onUpdateItem}
          onRemove={onRemoveItem}
          onEnlargeImage={onEnlargeImage}
        />
      ))}
    </div>
  );
}
