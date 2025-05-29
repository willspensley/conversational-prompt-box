import { useState, useEffect } from "react";
import { ReportData } from "@/lib/pdf-utils";

const DRAFT_STORAGE_KEY = 'report-drafts';

interface DraftData {
  id: string;
  data: ReportData;
  lastModified: string;
  isTemplate?: boolean;
}

export function useDraftStorage() {
  const [drafts, setDrafts] = useState<DraftData[]>([]);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsedDrafts = JSON.parse(saved);
        setDrafts(parsedDrafts);
      }
    } catch (error) {
      console.error("Failed to load drafts:", error);
    }
  };

  const saveDraft = (data: ReportData, draftId?: string) => {
    try {
      const draft: DraftData = {
        id: draftId || `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        data,
        lastModified: new Date().toISOString()
      };

      const updatedDrafts = drafts.filter(d => d.id !== draft.id);
      updatedDrafts.unshift(draft);
      
      // Keep only the 10 most recent drafts
      const limitedDrafts = updatedDrafts.slice(0, 10);
      
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(limitedDrafts));
      setDrafts(limitedDrafts);
      
      return draft.id;
    } catch (error) {
      console.error("Failed to save draft:", error);
      throw error;
    }
  };

  const deleteDraft = (draftId: string) => {
    try {
      const updatedDrafts = drafts.filter(d => d.id !== draftId);
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
    } catch (error) {
      console.error("Failed to delete draft:", error);
    }
  };

  const getDraft = (draftId: string): DraftData | undefined => {
    return drafts.find(d => d.id === draftId);
  };

  const clearAllDrafts = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDrafts([]);
  };

  return {
    drafts,
    saveDraft,
    deleteDraft,
    getDraft,
    clearAllDrafts,
    loadDrafts
  };
}
