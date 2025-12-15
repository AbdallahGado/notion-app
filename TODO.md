# TODO: Document Page Changes

## 1. Improve Drag and Drop Area Styling

- Update `components/ui/DropZone.tsx` with better colors, borders, and responsiveness.
- [x] Increased icon size from w-16 h-16 to w-20 h-20 for better visibility
- [x] Enhanced text sizing with responsive classes (text-xl sm:text-2xl) and changed to font-bold
- [x] Improved color contrast for better readability in both light and dark modes

## 2. Ensure White Colors in Dark Mode

- Check and update text and icon colors in dark mode across `app/(main)/(routes)/documents/[id]/page.tsx`, `app/(main)/_components/Toolbar.tsx`, and `app/(main)/(routes)/documents/[id]/FloatingToolbar.tsx`.

## 3. Make Toolbar Sticky

- [x] Modify the Toolbar in `app/(main)/(routes)/documents/[id]/page.tsx` to be sticky and follow scroll.

## 4. Add White Color to Tools

- Add white (#ffffff) to the COLORS array in `app/(main)/_components/Toolbar.tsx`.
- Add white to HIGHLIGHT_COLORS in `app/(main)/(routes)/documents/[id]/FloatingToolbar.tsx`.
