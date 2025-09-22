import { useEffect } from "react";

export function useDropdownOutsideClick({
  isOpen,
  buttonRef,
  dropdownId,
  onClose,
}: {
  isOpen: boolean;
  buttonRef: React.RefObject<HTMLElement>;
  dropdownId: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      const dropdownEl = document.getElementById(dropdownId);
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        dropdownEl &&
        !dropdownEl.contains(e.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, buttonRef, dropdownId, onClose]);
}
