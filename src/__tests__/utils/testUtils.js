import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';

// Custom render function that includes providers
function render(ui, { provideAuth = false, ...renderOptions } = {}) {
  function Wrapper({ children }) {
    if (provideAuth) {
      return <AuthProvider>{children}</AuthProvider>;
    }
    return children;
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock task data for testing
export const mockTasks = [
  {
    id: 1,
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the project',
    category: 'work',
    completed: false,
    deadline: '2024-12-31T23:59:59',
    createdAt: '2024-01-01T00:00:00'
  },
  {
    id: 2,
    title: 'Buy groceries',
    description: 'Milk, bread, eggs, and fruits',
    category: 'personal',
    completed: true,
    deadline: null,
    createdAt: '2024-01-02T00:00:00'
  },
  {
    id: 3,
    title: 'Fix critical bug',
    description: 'Urgent bug in production that needs immediate attention',
    category: 'urgent',
    completed: false,
    deadline: '2024-01-15T09:00:00',
    createdAt: '2024-01-03T00:00:00'
  }
];

// Mock user data for testing
export const mockUsers = {
  admin: {
    id: 1,
    email: 'admin@taskmanager.com',
    name: 'Admin User',
    avatar: '👨‍💻'
  },
  user: {
    id: 2,
    email: 'user@taskmanager.com',
    name: 'Regular User',
    avatar: '👩‍💼'
  },
  demo: {
    id: 3,
    email: 'demo@taskmanager.com',
    name: 'Demo User',
    avatar: '🚀'
  }
};

// Utility function to create a task
export const createTask = (overrides = {}) => ({
  id: Date.now(),
  title: 'Test Task',
  description: 'Test Description',
  category: 'work',
  completed: false,
  deadline: null,
  createdAt: new Date().toISOString(),
  ...overrides
});

// Utility function to create a user
export const createUser = (overrides = {}) => ({
  id: Date.now(),
  email: 'test@example.com',
  name: 'Test User',
  avatar: '👤',
  ...overrides
});

// Utility function to wait for async operations
export const waitFor = (callback, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      try {
        const result = callback();
        if (result) {
          resolve(result);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 10);
        }
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error);
        } else {
          setTimeout(check, 10);
        }
      }
    };
    
    check();
  });
};

// Utility function to simulate localStorage
export const mockLocalStorage = () => {
  const store = {};
  
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };
};

// Utility function to simulate API responses
export const mockApiResponse = (data, delay = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// Utility function to simulate API errors
export const mockApiError = (message = 'API Error', delay = 100) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
};

// Common test data generators
export const generateTasks = (count = 5) => {
  return Array.from({ length: count }, (_, index) => createTask({
    id: index + 1,
    title: `Task ${index + 1}`,
    description: `Description for task ${index + 1}`,
    category: ['work', 'personal', 'urgent'][index % 3],
    completed: index % 2 === 0
  }));
};

// Export everything with named exports
export * from '@testing-library/react';
export { render };