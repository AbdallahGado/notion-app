# Fix Workspace Problems

## Toolbar.tsx Fixes
- [ ] Fix setLinkInitialUrl type error (line 240): Cast href to string
- [ ] Fix setImage method (line 255): Use insertContent or cast to any
- [ ] Fix chain method invocations (lines 355, 366, 371, 407, 426, 427, 445, 468): Add type checks or cast to any

## Toolbar.test.tsx Fixes
- [ ] Update mockEditor insertContent to match real Editor type
- [ ] Add types to button parameters in forEach loops (lines 157, 166)
- [ ] Ensure modules are found after node_modules reinstall

## Verification
- [ ] Run tests to confirm fixes
- [ ] Check for any remaining TypeScript errors
