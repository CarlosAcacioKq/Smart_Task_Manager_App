import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBar from '../../components/FilterBar';

const mockProps = {
  filter: 'all',
  setFilter: jest.fn(),
  searchTerm: '',
  setSearchTerm: jest.fn(),
  selectedCategory: 'all',
  setSelectedCategory: jest.fn()
};

describe('FilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders filter controls correctly', () => {
    render(<FilterBar {...mockProps} />);
    
    expect(screen.getByText('Filter & Search')).toBeInTheDocument();
    expect(screen.getByLabelText('Search Tasks')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  test('calls setSearchTerm when search input changes', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...mockProps} />);
    
    const searchInput = screen.getByLabelText('Search Tasks');
    await user.type(searchInput, 'test search');
    
    expect(mockProps.setSearchTerm).toHaveBeenCalledWith('test search');
  });

  test('calls setFilter when status filter changes', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...mockProps} />);
    
    const statusSelect = screen.getByLabelText('Status');
    await user.selectOptions(statusSelect, 'completed');
    
    expect(mockProps.setFilter).toHaveBeenCalledWith('completed');
  });

  test('calls setSelectedCategory when category filter changes', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...mockProps} />);
    
    const categorySelect = screen.getByLabelText('Category');
    await user.selectOptions(categorySelect, 'work');
    
    expect(mockProps.setSelectedCategory).toHaveBeenCalledWith('work');
  });

  test('displays current filter values', () => {
    const propsWithValues = {
      ...mockProps,
      filter: 'pending',
      searchTerm: 'test',
      selectedCategory: 'urgent'
    };
    
    render(<FilterBar {...propsWithValues} />);
    
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('pending')).toBeInTheDocument();
    expect(screen.getByDisplayValue('urgent')).toBeInTheDocument();
  });

  test('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...mockProps} />);
    
    const clearButton = screen.getByText('Clear Filters');
    await user.click(clearButton);
    
    expect(mockProps.setFilter).toHaveBeenCalledWith('all');
    expect(mockProps.setSearchTerm).toHaveBeenCalledWith('');
    expect(mockProps.setSelectedCategory).toHaveBeenCalledWith('all');
  });

  test('has correct select options for status', () => {
    render(<FilterBar {...mockProps} />);
    
    const statusSelect = screen.getByLabelText('Status');
    const options = Array.from(statusSelect.options).map(option => option.value);
    
    expect(options).toEqual(['all', 'pending', 'completed']);
  });

  test('has correct select options for category', () => {
    render(<FilterBar {...mockProps} />);
    
    const categorySelect = screen.getByLabelText('Category');
    const options = Array.from(categorySelect.options).map(option => option.value);
    
    expect(options).toEqual(['all', 'work', 'personal', 'urgent']);
  });

  test('search input has correct placeholder', () => {
    render(<FilterBar {...mockProps} />);
    
    const searchInput = screen.getByLabelText('Search Tasks');
    expect(searchInput).toHaveAttribute('placeholder', 'Search by title or description...');
  });

  test('has correct CSS classes', () => {
    const { container } = render(<FilterBar {...mockProps} />);
    
    expect(container.querySelector('.filter-bar')).toBeInTheDocument();
    expect(container.querySelector('.search-input')).toBeInTheDocument();
    expect(container.querySelector('.filter-select')).toBeInTheDocument();
    expect(container.querySelector('.clear-filters-btn')).toBeInTheDocument();
  });

  test('maintains accessibility attributes', () => {
    render(<FilterBar {...mockProps} />);
    
    const searchInput = screen.getByLabelText('Search Tasks');
    const statusSelect = screen.getByLabelText('Status');
    const categorySelect = screen.getByLabelText('Category');
    
    expect(searchInput).toHaveAttribute('id', 'search');
    expect(statusSelect).toHaveAttribute('id', 'status-filter');
    expect(categorySelect).toHaveAttribute('id', 'category-filter');
  });
});