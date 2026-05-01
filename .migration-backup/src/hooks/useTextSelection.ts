import { useState, useCallback, useEffect, useRef } from "react";
import { validateSelection, ValidatedSelection } from "@/lib/selectionUtils";

interface SelectionPosition {
  x: number;
  y: number;
}

interface UseTextSelectionOptions {
  containerRef: React.RefObject<HTMLElement>;
  language?: "sv" | "en";
}

export function useTextSelection({ containerRef, language = "sv" }: UseTextSelectionOptions) {
  const [selection, setSelection] = useState<ValidatedSelection | null>(null);
  const [position, setPosition] = useState<SelectionPosition>({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const suppressRef = useRef(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    setSelection(null);
  }, []);

  /** Temporarily suppress the next selection event (e.g. after saving) */
  const suppress = useCallback(() => {
    suppressRef.current = true;
    setTimeout(() => { suppressRef.current = false; }, 300);
  }, []);

  const handleSelectionEnd = useCallback(() => {
    if (suppressRef.current) return;

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      return; // don't dismiss here — let click-outside handle it
    }

    const text = sel.toString();
    const container = containerRef.current;
    if (!container) return;

    const anchor = sel.anchorNode;
    if (!anchor || !container.contains(anchor)) return;

    const validated = validateSelection(text, language);

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
    setSelection(validated);
    setVisible(true);
  }, [containerRef, language]);

  useEffect(() => {
    const handler = () => setTimeout(handleSelectionEnd, 120);
    document.addEventListener("mouseup", handler);
    document.addEventListener("touchend", handler);
    return () => {
      document.removeEventListener("mouseup", handler);
      document.removeEventListener("touchend", handler);
    };
  }, [handleSelectionEnd]);

  return { selection, position, visible, dismiss, suppress };
}
