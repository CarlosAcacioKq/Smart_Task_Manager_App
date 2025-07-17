import React from 'react';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'General',
      items: [
        { keys: ['Ctrl', 'K'], description: 'Open command palette' },
        { keys: ['?'], description: 'Show this help' },
        { keys: ['Esc'], description: 'Close modal/palette' }
      ]
    },
    {
      category: 'Navigation',
      items: [
        { keys: ['1'], description: 'Go to Tasks view' },
        { keys: ['2'], description: 'Go to Dashboard view' },
        { keys: ['Tab'], description: 'Navigate between elements' },
        { keys: ['Shift', 'Tab'], description: 'Navigate backwards' }
      ]
    },
    {
      category: 'Tasks',
      items: [
        { keys: ['N'], description: 'Add new task' },
        { keys: ['S'], description: 'Focus search' },
        { keys: ['F'], description: 'Filter tasks' },
        { keys: ['R'], description: 'Refresh tasks' }
      ]
    },
    {
      category: 'Filters',
      items: [
        { keys: ['A'], description: 'Show all tasks' },
        { keys: ['C'], description: 'Show completed tasks' },
        { keys: ['P'], description: 'Show pending tasks' },
        { keys: ['X'], description: 'Clear filters' }
      ]
    },
    {
      category: 'Theme & UI',
      items: [
        { keys: ['T'], description: 'Toggle theme' },
        { keys: ['Ctrl', 'Shift', 'I'], description: 'Toggle sidebar' },
        { keys: ['F11'], description: 'Toggle fullscreen' }
      ]
    },
    {
      category: 'Quick Actions',
      items: [
        { keys: ['Ctrl', 'Enter'], description: 'Save current form' },
        { keys: ['Ctrl', 'S'], description: 'Save and sync' },
        { keys: ['Delete'], description: 'Delete selected item' },
        { keys: ['Ctrl', 'Z'], description: 'Undo last action' }
      ]
    }
  ];

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="help-modal-content">
          <div className="shortcuts-grid">
            {shortcuts.map((category, index) => (
              <div key={index} className="shortcut-category">
                <h3>{category.category}</h3>
                <ul className="shortcut-list">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="shortcut-item">
                      <div className="shortcut-keys">
                        {item.keys.map((key, keyIndex) => (
                          <kbd key={keyIndex}>{key}</kbd>
                        ))}
                      </div>
                      <div className="shortcut-description">{item.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="help-tips">
            <h3>💡 Tips</h3>
            <ul>
              <li>Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to quickly access any command</li>
              <li>Use <kbd>Tab</kbd> to navigate between form fields</li>
              <li>Most shortcuts work globally, even when not focused on input fields</li>
              <li>Hold <kbd>Shift</kbd> while clicking to select multiple items</li>
              <li>Use <kbd>?</kbd> anytime to show this help</li>
            </ul>
          </div>
          
          <div className="help-features">
            <h3>🚀 Features</h3>
            <ul>
              <li><strong>PWA Support:</strong> Install as an app on your device</li>
              <li><strong>Offline Mode:</strong> Works without internet connection</li>
              <li><strong>Push Notifications:</strong> Get reminders for deadlines</li>
              <li><strong>Real-time Sync:</strong> Changes sync across devices</li>
              <li><strong>Dark Mode:</strong> Easy on the eyes</li>
              <li><strong>Drag & Drop:</strong> Reorder tasks intuitively</li>
            </ul>
          </div>
        </div>
        
        <div className="help-modal-footer">
          <div className="help-footer-info">
            <span>Smart Task Manager v1.0.0</span>
            <span>•</span>
            <span>Built with React</span>
          </div>
          <button className="help-close-btn" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;