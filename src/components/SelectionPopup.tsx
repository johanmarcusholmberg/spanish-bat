import React, { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTextSelection } from "@/hooks/useTextSelection";
import { useLanguage } from "@/contexts/LanguageContext";
import SelectionContent from "@/components/vocabulary/SelectionContent";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface SelectionPopupProps {
  containerRef: React.RefObject<HTMLElement>;
}

const SelectionPopup: React.FC<SelectionPopupProps> = ({ containerRef }) => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const { selection, position, visible, dismiss, suppress } = useTextSelection({
    containerRef,
    language: language as "sv" | "en",
  });

  const popupRef = useRef<HTMLDivElement>(null);

  // Close on click outside (desktop only)
  useEffect(() => {
    if (!visible || isMobile) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        dismiss();
      }
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [visible, dismiss, isMobile]);

  if (!visible || !selection) return null;

  const handleClose = () => {
    suppress();
    dismiss();
  };

  // Mobile: bottom sheet
  if (isMobile) {
    return (
      <Drawer open={visible} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DrawerContent>
          <DrawerHeader className="pb-0">
            <DrawerTitle className="text-base">
              {language === "sv" ? "Spara till ordbok" : "Save to dictionary"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 pt-2">
            <SelectionContent
              selection={selection}
              onClose={handleClose}
              onSaved={suppress}
              mobile
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: floating popup
  return (
    <div
      ref={popupRef}
      className="fixed z-[9999] animate-in fade-in-0 zoom-in-95 duration-150"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="w-72 rounded-xl border bg-popover p-3 shadow-lg text-popover-foreground">
        <SelectionContent
          selection={selection}
          onClose={handleClose}
          onSaved={suppress}
        />
      </div>
    </div>
  );
};

export default SelectionPopup;
