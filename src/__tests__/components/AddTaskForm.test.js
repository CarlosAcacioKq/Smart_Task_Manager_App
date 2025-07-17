import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTaskForm from '../../components/AddTaskForm';

const mockOnAddTask = jest.fn();

describe('AddTaskForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form elements correctly', () => {
    render(<AddTaskForm onAddTask={mockOnAddTask} />);
    
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByLabelText(/Task Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Deadline/)).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAddTask={mockOnAddTask} />);
    
    // Fill out the form
    await user.type(screen.getByLabelText(/Task Title/), 'New Task');
    await user.type(screen.getByLabelText(/Description/), 'Task description');
    await user.selectOptions(screen.getByLabelText(/Category/), 'urgent');
    await user.type(screen.getByLabelText(/Deadline/), '2024-12-31T23:59');
    
    // Submit form
    await user.click(screen.getByText('Add Task'));
    
    expect(mockOnAddTask).toHaveBeenCalledWith({
      title: 'New Task',
      description: 'Task description',
      category: 'urgent',
      deadline: '2024-12-31T23:59'
    });
  });

  test('shows error when title is empty', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAddTask={mockOnAddTask} />);
    
    // Try to submit without title
    await user.click(screen.getByText('Add Task'));
    
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(mockOnAddTask).not.toHaveBeenCalled();
  });

  test('shows error when deadline is in the past', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAddTask={mockOnAddTask} />);
    
    // Fill form with past deadline
    await user.type(screen.getByLabelText(/Task Title/), 'Test Task');
    await user.type(screen.getByLabelText(/Deadline/), '2020-01-01T00:00');
    
    await user.click(screen.getByText('Add Task'));
    
    expect(screen.getByText('Deadline must be in the future')).toBeInTheDocument();
    expect(mockOnAddTask).not.toHaveBeenCalled();
  });

  test('clears form after successful submission', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAddTask={mockOnAddTask} />);
    
    const titleInput = screen.getByLabelText(/Task Title/);
    const descriptionInput = screen.getByLabelText(/Description/);
    
    // Fill and submit form
    await user.type(titleInput, 'Test Task');
    await user.type(descriptionInput, 'Test description');
    await user.click(screen.getByText('Add Task'));
    
    // Check form is cleared
    expect(titleInput.value).toBe('');
    expect(descriptionInput.value).toBe('');
  });

  test('clears error when user starts typing', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAddTask={mockOnAddTask} />);
    
    // Trigger error
    await user.click(screen.getByText('Add Task'));
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    
    // Start typing
    await user.type(screen.getByLabelText(/Task Title/), 'T');
    
    // Error should be gone
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
  });

  test('defaults to work category', () => {
    render(<AddTaskForm onAddTask={mockOnAddTask} />);
    
    const categorySelect = screen.getByLabelText(/Category/);
    expect(categorySelect.value).toBe('work');
  });

  test('handles form submission with minimal required data', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAddTask={mockOnAddTask} />);
    
    // Only fill required field
    await user.type(screen.getByLabelText(/Task Title/), 'Minimal Task');
    await user.click(screen.getByText('Add Task'));
    
    expect(mockOnAddTask).toHaveBeenCalledWith({
      title: 'Minimal Task',
      description: '',
      category: 'work',
      deadline: ''
    });
  });

  test('shows correct input types', () => {
    render(<AddTaskForm onAddTask={mockOnAddTask} />);
    
    expect(screen.getByLabelText(/Task Title/)).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/Description/)).toHaveAttribute('rows', '3');
    expect(screen.getByLabelText(/Deadline/)).toHaveAttribute('type', 'datetime-local');
  });

  test('has correct accessibility attributes', () => {
    render(<AddTaskForm onAddTask={mockOnAddTask} />);
    
    const titleInput = screen.getByLabelText(/Task Title/);
    const descriptionInput = screen.getByLabelText(/Description/);
    const categorySelect = screen.getByLabelText(/Category/);
    const deadlineInput = screen.getByLabelText(/Deadline/);
    
    expect(titleInput).toHaveAttribute('placeholder', 'Enter task title');
    expect(descriptionInput).toHaveAttribute('placeholder', 'Enter task description');
    expect(categorySelect).toHaveAttribute('aria-label', 'Select task category');
    expect(deadlineInput).toHaveAttribute('aria-label', 'Select task deadline');
  });
});