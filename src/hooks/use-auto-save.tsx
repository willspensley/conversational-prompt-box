
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface AutoSaveOptions {
  data: any;
  onSave: (data: any) => void;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ data, onSave, delay = 2000, enabled = true }: AutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled || !data) return;

    const currentDataString = JSON.stringify(data);
    
    // Don't save if data hasn't changed
    if (currentDataString === lastSavedRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      try {
        onSave(data);
        lastSavedRef.current = currentDataString;
        
        // Show subtle auto-save notification
        toast({
          title: "Auto-saved",
          description: "Your changes have been saved automatically.",
          duration: 2000,
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
        toast({
          title: "Auto-save failed",
          description: "Unable to save changes automatically. Please save manually.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }, delay);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, enabled, toast]);

  // Manual save function
  const saveNow = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onSave(data);
    lastSavedRef.current = JSON.stringify(data);
  };

  return { saveNow };
}
