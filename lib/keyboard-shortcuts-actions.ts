export interface RegisteredShortcut {
  id: string;
  description: string;
  keys: string[];
}

class ShortcutsRegistry {
  private shortcuts: Map<string, RegisteredShortcut> = new Map();
  private listeners: ((shortcuts: RegisteredShortcut[]) => void)[] = [];

  register(shortcut: RegisteredShortcut) {
    this.shortcuts.set(shortcut.id, shortcut);
    this.notifyListeners();
  }

  unregister(id: string) {
    this.shortcuts.delete(id);
    this.notifyListeners();
  }

  getAll(): RegisteredShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  subscribe(listener: (shortcuts: RegisteredShortcut[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  async execute(id: string) {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      // For now, just log. In a real implementation, you'd dispatch events or call handlers
      console.log(`Executing shortcut: ${shortcut.description}`);
    }
  }

  private notifyListeners() {
    const shortcuts = this.getAll();
    this.listeners.forEach((listener) => listener(shortcuts));
  }
}

export const shortcutsRegistry = new ShortcutsRegistry();

// Example shortcuts - you can register more as needed
shortcutsRegistry.register({
  id: "save",
  description: "Save document",
  keys: ["Ctrl", "S"],
});

shortcutsRegistry.register({
  id: "search",
  description: "Search documents",
  keys: ["Ctrl", "F"],
});

shortcutsRegistry.register({
  id: "new-document",
  description: "New document",
  keys: ["Ctrl", "N"],
});
