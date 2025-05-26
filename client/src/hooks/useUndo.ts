import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UndoAction {
  type: 'delete' | 'move' | 'update';
  eventData: any;
  originalData?: any;
  description: string;
}

export function useUndo() {
  const [lastAction, setLastAction] = useState<UndoAction | null>(null);
  const { toast } = useToast();

  const recordAction = useCallback((action: UndoAction) => {
    setLastAction(action);
    
    // Show undo toast
    toast({
      title: action.description,
      description: "Action completed",
      action: (
        <button
          onClick={() => {
            // Trigger undo callback if provided
            if (action.type === 'delete') {
              // TODO: Implement undo delete
            } else if (action.type === 'move') {
              // TODO: Implement undo move
            }
            setLastAction(null);
          }}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Undo
        </button>
      ),
    });

    // Clear action after 10 seconds
    setTimeout(() => setLastAction(null), 10000);
  }, [toast]);

  const clearAction = useCallback(() => {
    setLastAction(null);
  }, []);

  return {
    recordAction,
    clearAction,
    lastAction
  };
}