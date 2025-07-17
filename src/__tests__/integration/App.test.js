import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// Mock the API service
jest.mock('../../services/api', () => ({
  apiService: {
    getTasks: jest.fn().mockResolvedValue([
      {
        id: 1,
        title: 'Test Task 1',
        description: 'Description 1',
        category: 'work',
        completed: false,
        deadline: '2024-12-31T23:59:59',
        createdAt: '2024-01-01T00:00:00'
      },
      {
        id: 2,
        title: 'Test Task 2',
        description: 'Description 2',
        category: 'personal',
        completed: true,
        deadline: null,
        createdAt: '2024-01-01T00:00:00'
      }
    ]),
    createTask: jest.fn().mockResolvedValue({ id: 3 }),
    updateTask: jest.fn().mockResolvedValue({}),
    deleteTask: jest.fn().mockResolvedValue({ success: true })
  }
}));

// Mock recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />
}));

// Mock react-beautiful-dnd
jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }) => <div data-testid="drag-drop-context">{children}</div>,
  Droppable: ({ children }) => children({ droppableProps: {}, innerRef: jest.fn() }, {}),
  Draggable: ({ children }) => children({ 
    draggableProps: {}, 
    dragHandleProps: {}, 
    innerRef: jest.fn() 
  }, {})
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('shows login form when user is not authenticated', () => {
    render(<App />);
    
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  test('shows main app after successful login', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Login with demo account
    await user.click(screen.getByText('🚀 Try Demo Account'));
    
    // Wait for login to complete and app to load
    await waitFor(() => {
      expect(screen.getByText('Smart Task Manager')).toBeInTheDocument();
    });
    
    expect(screen.getByText('📋 Tasks')).toBeInTheDocument();
    expect(screen.getByText('📊 Dashboard')).toBeInTheDocument();
  });

  test('can add a new task', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Login first
    await user.click(screen.getByText('🚀 Try Demo Account'));
    await waitFor(() => {
      expect(screen.getByText('Smart Task Manager')).toBeInTheDocument();
    });
    
    // Add new task
    await user.type(screen.getByLabelText(/Task Title/), 'New Integration Test Task');
    await user.type(screen.getByLabelText(/Description/), 'Integration test description');
    await user.selectOptions(screen.getByLabelText(/Category/), 'urgent');
    await user.click(screen.getByText('Add Task'));
    
    // Check task was added
    await waitFor(() => {
      expect(screen.getByText('New Integration Test Task')).toBeInTheDocument();
    });
  });

  test('can filter tasks by category', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Login first
    await user.click(screen.getByText('🚀 Try Demo Account'));
    await waitFor(() => {
      expect(screen.getByText('Smart Task Manager')).toBeInTheDocument();
    });
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
    
    // Filter by work category
    await user.selectOptions(screen.getByLabelText('Category'), 'work');
    
    // Should show work tasks only
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Task 2')).not.toBeInTheDocument();
  });

  test('can search tasks', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Login first
    await user.click(screen.getByText('🚀 Try Demo Account'));
    await waitFor(() => {
      expect(screen.getByText('Smart Task Manager')).toBeInTheDocument();
    });
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
    
    // Search for specific task
    await user.type(screen.getByLabelText('Search Tasks'), 'Task 1');
    
    // Should show matching task only
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Task 2')).not.toBeInTheDocument();
  });

  test('can switch between tasks and dashboard views', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Login first
    await user.click(screen.getByText('🚀 Try Demo Account'));
    await waitFor(() => {
      expect(screen.getByText('Smart Task Manager')).toBeInTheDocument();
    });
    
    // Switch to dashboard
    await user.click(screen.getByText('📊 Dashboard'));
    
    expect(screen.getByText('📊 Dashboard Overview')).toBeInTheDocument();
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    
    // Switch back to tasks
    await user.click(screen.getByText('📋 Tasks'));
    
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });

  test('can toggle theme', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Login first
    await user.click(screen.getByText('🚀 Try Demo Account'));
    await waitFor(() => {
      expect(screen.getByText('Smart Task Manager')).toBeInTheDocument();
    });
    
    // Get the app container
    const appContainer = document.querySelector('.app');
    
    // Should start with light theme
    expect(appContainer).toHaveClass('light');
    
    // Toggle to dark theme
    await user.click(screen.getByText('🌙'));
    
    expect(appContainer).toHaveClass('dark');
  });

  test('can logout user', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Login first
    await user.click(screen.getByText('🚀 Try Demo Account'));
    await waitFor(() => {
      expect(screen.getByText('Smart Task Manager')).toBeInTheDocument();
    });
    
    // Click on user profile
    await user.click(screen.getByText('Demo User'));
    
    // Click logout
    await user.click(screen.getByText('🚪 Logout'));
    
    // Should return to login screen
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
  });

  test('displays progress tracker with correct data', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Login first
    await user.click(screen.getByText('🚀 Try Demo Account'));
    await waitFor(() => {
      expect(screen.getByText('Smart Task Manager')).toBeInTheDocument();
    });
    
    // Wait for progress tracker to load
    await waitFor(() => {
      expect(screen.getByText('Progress Overview')).toBeInTheDocument();
    });
    
    // Should show correct task counts (1 completed out of 2 total)
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByText('50% Complete')).toBeInTheDocument();
  });

  test('handles error states gracefully', async () => {
    // Mock API to throw error
    const { apiService } = require('../../services/api');
    apiService.getTasks.mockRejectedValueOnce(new Error('API Error'));
    
    const user = userEvent.setup();
    render(<App />);
    
    // Login first
    await user.click(screen.getByText('🚀 Try Demo Account'));
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to sync with server/)).toBeInTheDocument();
    });
  });

  test('persists user session across page refresh', () => {
    // Set up authenticated user in localStorage
    const userData = {
      id: 3,
      email: 'demo@taskmanager.com',
      name: 'Demo User',
      avatar: '🚀'
    };
    localStorage.setItem('taskmanager_user', JSON.stringify(userData));
    
    render(<App />);
    
    // Should show main app without login
    expect(screen.getByText('Smart Task Manager')).toBeInTheDocument();
    expect(screen.getByText('Demo User')).toBeInTheDocument();
  });
});