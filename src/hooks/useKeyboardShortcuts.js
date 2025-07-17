import { useEffect, useCallback, useRef } from 'react';

export const useKeyboardShortcuts = (shortcuts = {}) => {
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event) => {
    const { key, metaKey, ctrlKey, altKey, shiftKey } = event;
    
    // Don't trigger shortcuts when user is typing in input fields
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.contentEditable === 'true'
    ) {
      return;
    }

    const modifierKeys = {
      ctrl: ctrlKey || metaKey, // Use cmd on Mac, ctrl on Windows/Linux
      alt: altKey,
      shift: shiftKey
    };

    // Check each shortcut
    Object.entries(shortcutsRef.current).forEach(([shortcut, callback]) => {
      if (matchesShortcut(shortcut, key, modifierKeys)) {
        event.preventDefault();
        callback(event);
      }
    });
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Helper function to match shortcuts
const matchesShortcut = (shortcut, key, modifiers) => {
  const parts = shortcut.toLowerCase().split('+');
  const shortcutKey = parts[parts.length - 1];
  
  // Check if the key matches
  if (key.toLowerCase() !== shortcutKey) {
    return false;
  }
  
  // Check modifiers
  const hasCtrl = parts.includes('ctrl') || parts.includes('cmd');
  const hasAlt = parts.includes('alt');
  const hasShift = parts.includes('shift');
  
  return (
    modifiers.ctrl === hasCtrl &&
    modifiers.alt === hasAlt &&
    modifiers.shift === hasShift
  );
};

// Command palette hook
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    {
      id: 'add-task',
      title: 'Add New Task',
      description: 'Create a new task',
      icon: '➕',
      keywords: ['add', 'new', 'create', 'task'],
      action: () => console.log('Add task')
    },
    {
      id: 'search-tasks',
      title: 'Search Tasks',
      description: 'Search through your tasks',
      icon: '🔍',
      keywords: ['search', 'find', 'filter'],
      action: () => console.log('Search tasks')
    },
    {
      id: 'view-dashboard',
      title: 'View Dashboard',
      description: 'Open the analytics dashboard',
      icon: '📊',
      keywords: ['dashboard', 'analytics', 'stats'],
      action: () => console.log('View dashboard')
    },
    {
      id: 'toggle-theme',
      title: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: '🌓',
      keywords: ['theme', 'dark', 'light', 'mode'],
      action: () => console.log('Toggle theme')
    },
    {
      id: 'help',
      title: 'Show Help',
      description: 'View keyboard shortcuts and help',
      icon: '❓',
      keywords: ['help', 'shortcuts', 'support'],
      action: () => console.log('Show help')
    }
  ];

  const filteredCommands = commands.filter(command => {
    const searchLower = searchTerm.toLowerCase();
    return (
      command.title.toLowerCase().includes(searchLower) ||
      command.description.toLowerCase().includes(searchLower) ||
      command.keywords.some(keyword => keyword.includes(searchLower))
    );
  });

  const executeCommand = (command) => {
    command.action();
    setIsOpen(false);
    setSearchTerm('');
    setSelectedIndex(0);
  };

  return {
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    selectedIndex,
    setSelectedIndex,
    commands: filteredCommands,
    executeCommand
  };
};

// Custom hook for focus management
export const useFocusManagement = () => {
  const focusableElements = useRef([]);
  const currentFocusIndex = useRef(0);

  const updateFocusableElements = useCallback(() => {
    const elements = document.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusableElements.current = Array.from(elements).filter(
      el => !el.disabled && el.offsetParent !== null
    );
  }, []);

  const focusNext = useCallback(() => {
    updateFocusableElements();
    const elements = focusableElements.current;
    if (elements.length > 0) {
      currentFocusIndex.current = (currentFocusIndex.current + 1) % elements.length;
      elements[currentFocusIndex.current].focus();
    }
  }, [updateFocusableElements]);

  const focusPrevious = useCallback(() => {
    updateFocusableElements();
    const elements = focusableElements.current;
    if (elements.length > 0) {
      currentFocusIndex.current = currentFocusIndex.current - 1;
      if (currentFocusIndex.current < 0) {
        currentFocusIndex.current = elements.length - 1;
      }
      elements[currentFocusIndex.current].focus();
    }
  }, [updateFocusableElements]);

  return { focusNext, focusPrevious, updateFocusableElements };
};