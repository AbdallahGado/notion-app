# ESLint Errors Fix Plan

## Files to Fix:

### 1. app/(main)/(routes)/documents/[id]/page.tsx
- [ ] Remove unused 'saving' variable (line 201)

### 2. app/(main)/_components/modals/CustomizeModal.tsx
- [ ] Escape unescaped quotes in JSX (line 172)

### 3. app/(main)/_components/navigation.tsx
- [ ] Remove unused imports: showErrorToast, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
- [ ] Fix useMemo dependency warning for 'docs'
- [ ] Change 'let result' to 'const result'

### 4. app/(main)/_components/toolbar/ToolbarFormattingGroup.tsx
- [ ] Remove unused ToolbarShortcut import

### 5. app/(main)/_components/toolbar/types.ts
- [ ] Replace 'any' types with proper types (lines 91, 92, 173, 202)

### 6. app/(main)/_components/toolbar/__tests__/Toolbar.test.tsx
- [ ] Remove unused imports: ToolbarButton, Bold
- [ ] Replace 'any' types in mock functions
- [ ] Remove unused parameters: onClose, type

### 7. app/(main)/_components/Toolbar.tsx
- [ ] Remove unused imports: UploadCloud, Settings, AlignLeft, AlignCenter, AlignRight
- [ ] Remove unused variables: error, handleFileImport, handleMarkdownFile
- [ ] Escape unescaped quote in JSX (line 402)

### 8. app/(main)/_components/user-item.tsx
- [ ] Remove unused imports: Button, cn

### 9. components/Editor.tsx
- [ ] Replace 'any' type for setEditor prop

### 10. components/IconPicker.tsx
- [ ] Remove unused 'currentTheme' variable

### 11. components/ImageResizer.tsx
- [ ] Replace 'any' type for api query
- [ ] Add missing dependency 'onPointerUp' to useEffect
- [ ] Consider replacing img with Next.js Image component

### 12. components/ui/input.tsx
- [ ] Fix empty interface issue
