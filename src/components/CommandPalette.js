import React, { useState, useEffect, useRef } from 'react';

const CommandPalette = ({ isOpen, onClose, onCommand }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const commands = [
    {
      id: 'add-task',
      title: 'Add New Task',
      description: 'Create a new task',
      icon: '➕',
      keywords: ['add', 'new', 'create', 'task'],
      action: () => onCommand('add-task')
    },
    {
      id: 'search-tasks',
      title: 'Search Tasks',
      description: 'Search through your tasks',
      icon: '🔍',
      keywords: ['search', 'find', 'filter'],
      action: () => onCommand('search-tasks')
    },
    {
      id: 'view-dashboard',
      title: 'View Dashboard',
      description: 'Open the analytics dashboard',
      icon: '📊',
      keywords: ['dashboard', 'analytics', 'stats', 'charts'],
      action: () => onCommand('view-dashboard')
    },
    {
      id: 'view-tasks',
      title: 'View Tasks',
      description: 'Go to the tasks view',
      icon: '📋',
      keywords: ['tasks', 'list', 'todo'],
      action: () => onCommand('view-tasks')
    },
    {
      id: 'toggle-theme',
      title: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: '🌓',
      keywords: ['theme', 'dark', 'light', 'mode'],
      action: () => onCommand('toggle-theme')
    },
    {
      id: 'filter-completed',
      title: 'Show Completed Tasks',
      description: 'Filter to show only completed tasks',
      icon: '✅',
      keywords: ['completed', 'done', 'finished'],
      action: () => onCommand('filter-completed')
    },
    {
      id: 'filter-pending',
      title: 'Show Pending Tasks',
      description: 'Filter to show only pending tasks',
      icon: '⏳',
      keywords: ['pending', 'todo', 'incomplete'],
      action: () => onCommand('filter-pending')
    },
    {
      id: 'filter-all',
      title: 'Show All Tasks',
      description: 'Clear all filters',
      icon: '📝',
      keywords: ['all', 'clear', 'reset'],
      action: () => onCommand('filter-all')
    },
    {
      id: 'logout',
      title: 'Logout',
      description: 'Sign out of your account',
      icon: '🚪',
      keywords: ['logout', 'signout', 'exit'],
      action: () => onCommand('logout')
    },
    {
      id: 'help',
      title: 'Show Help',
      description: 'View keyboard shortcuts and help',
      icon: '❓',
      keywords: ['help', 'shortcuts', 'support', 'keyboard'],
      action: () => onCommand('help')
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

  // Reset selection when commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          handleClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  const executeCommand = (command) => {
    command.action();
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedIndex(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={handleClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette-header">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="command-palette-input"
          />
        </div>
        
        <div className="command-palette-content">
          {filteredCommands.length > 0 ? (
            <ul ref={listRef} className="command-list">
              {filteredCommands.map((command, index) => (
                <li
                  key={command.id}
                  className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => executeCommand(command)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="command-icon">{command.icon}</span>
                  <div className="command-text">
                    <div className="command-title">{command.title}</div>
                    <div className="command-description">{command.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-commands">
              <span className="no-commands-icon">🔍</span>
              <div className="no-commands-text">No commands found</div>
              <div className="no-commands-description">
                Try searching for "add", "search", or "help"
              </div>
            </div>
          )}
        </div>
        
        <div className="command-palette-footer">
          <div className="command-palette-shortcuts">
            <span className="shortcut-item">
              <kbd>↑</kbd><kbd>↓</kbd> to navigate
            </span>
            <span className="shortcut-item">
              <kbd>Enter</kbd> to select
            </span>
            <span className="shortcut-item">
              <kbd>Esc</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;