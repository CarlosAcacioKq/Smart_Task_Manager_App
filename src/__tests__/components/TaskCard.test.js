import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskCard from '../../components/TaskCard';

const mockTask = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  category: 'work',
  completed: false,
  deadline: '2024-12-31T23:59:59',
  createdAt: '2024-01-01T00:00:00'
};

const mockProps = {
  task: mockTask,
  onUpdateTask: jest.fn(),
  onDeleteTask: jest.fn(),
  isDragging: false
};

describe('TaskCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders task information correctly', () => {
    render(<TaskCard {...mockProps} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText(/Due: 12\/31\/2024/)).toBeInTheDocument();
  });

  test('shows completed state when task is completed', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskCard {...mockProps} task={completedTask} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  test('toggles task completion when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskCard {...mockProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(mockProps.onUpdateTask).toHaveBeenCalledWith(1, { completed: true });
  });

  test('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskCard {...mockProps} />);
    
    const editButton = screen.getByText('Edit');
    await user.click(editButton);
    
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('saves changes when save button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskCard {...mockProps} />);
    
    // Enter edit mode
    await user.click(screen.getByText('Edit'));
    
    // Modify the title
    const titleInput = screen.getByDisplayValue('Test Task');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');
    
    // Save changes
    await user.click(screen.getByText('Save'));
    
    expect(mockProps.onUpdateTask).toHaveBeenCalledWith(1, expect.objectContaining({
      title: 'Updated Task',
      description: 'Test Description',
      category: 'work'
    }));
  });

  test('cancels editing when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskCard {...mockProps} />);
    
    // Enter edit mode
    await user.click(screen.getByText('Edit'));
    
    // Modify the title
    const titleInput = screen.getByDisplayValue('Test Task');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');
    
    // Cancel changes
    await user.click(screen.getByText('Cancel'));
    
    // Should show original content
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(mockProps.onUpdateTask).not.toHaveBeenCalled();
  });

  test('deletes task when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskCard {...mockProps} />);
    
    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);
    
    expect(mockProps.onDeleteTask).toHaveBeenCalledWith(1);
  });

  test('shows overdue styling for overdue tasks', () => {
    const overdueTask = {
      ...mockTask,
      deadline: '2020-01-01T00:00:00' // Past date
    };
    
    const { container } = render(<TaskCard {...mockProps} task={overdueTask} />);
    
    expect(container.querySelector('.task-card')).toHaveClass('overdue');
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  test('shows dragging state when isDragging is true', () => {
    const { container } = render(<TaskCard {...mockProps} isDragging={true} />);
    
    expect(container.querySelector('.task-card')).toHaveClass('dragging');
  });

  test('displays correct category badge styling', () => {
    const { container } = render(<TaskCard {...mockProps} />);
    
    const categoryBadge = container.querySelector('.category-badge');
    expect(categoryBadge).toHaveClass('work');
    expect(categoryBadge).toHaveTextContent('work');
  });

  test('handles tasks without deadlines', () => {
    const taskWithoutDeadline = { ...mockTask, deadline: null };
    render(<TaskCard {...mockProps} task={taskWithoutDeadline} />);
    
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
  });

  test('handles tasks without descriptions', () => {
    const taskWithoutDescription = { ...mockTask, description: '' };
    render(<TaskCard {...mockProps} task={taskWithoutDescription} />);
    
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  test('shows time remaining for future deadlines', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    
    const futureTask = {
      ...mockTask,
      deadline: futureDate.toISOString()
    };
    
    render(<TaskCard {...mockProps} task={futureTask} />);
    
    expect(screen.getByText(/days? remaining/)).toBeInTheDocument();
  });
});