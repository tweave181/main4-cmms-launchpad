import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
}

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts?: KeyboardShortcut[];
}

const defaultShortcuts: KeyboardShortcut[] = [
  {
    keys: ['Ctrl', 'S'],
    description: 'Toggle filter saving on/off',
    category: 'Filters',
  },
  {
    keys: ['Ctrl', '/'],
    description: 'Open keyboard shortcuts help',
    category: 'General',
  },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  open,
  onOpenChange,
  shortcuts = defaultShortcuts,
}) => {
  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const formatKey = (key: string) => {
    if (key === 'Ctrl' && isMac) return 'Cmd';
    return key;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Quick access to common actions using keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs px-2 py-1 bg-background"
                          >
                            {formatKey(key)}
                          </Badge>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong> Press <Badge variant="outline" className="font-mono text-xs mx-1">Ctrl</Badge> + 
            <Badge variant="outline" className="font-mono text-xs mx-1">/</Badge> anytime to view this help
            {isMac && ' (Cmd on Mac)'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
