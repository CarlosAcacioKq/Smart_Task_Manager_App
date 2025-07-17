import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// Test component that uses the useLocalStorage hook
const TestComponent = ({ storageKey, initialValue }) => {
  const [value, setValue] = useLocalStorage(storageKey, initialValue);

  return (
    <div>
      <div data-testid="current-value">{JSON.stringify(value)}</div>
      <button onClick={() => setValue('new-value')}>Set String</button>
      <button onClick={() => setValue({ key: 'object-value' })}>Set Object</button>
      <button onClick={() => setValue(prev => prev + '-updated')}>Update Function</button>
      <button onClick={() => setValue(null)}>Set Null</button>
    </div>
  );
};

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('returns initial value when localStorage is empty', () => {
    render(<TestComponent storageKey="test-key" initialValue="initial" />);
    
    expect(screen.getByTestId('current-value')).toHaveTextContent('"initial"');
  });

  test('returns stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));
    
    render(<TestComponent storageKey="test-key" initialValue="initial" />);
    
    expect(screen.getByTestId('current-value')).toHaveTextContent('"stored-value"');
  });

  test('updates localStorage when value changes', () => {
    render(<TestComponent storageKey="test-key" initialValue="initial" />);
    
    fireEvent.click(screen.getByText('Set String'));
    
    expect(localStorage.getItem('test-key')).toBe('"new-value"');
    expect(screen.getByTestId('current-value')).toHaveTextContent('"new-value"');
  });

  test('handles object values correctly', () => {
    render(<TestComponent storageKey="test-key" initialValue={{}} />);
    
    fireEvent.click(screen.getByText('Set Object'));
    
    expect(localStorage.getItem('test-key')).toBe('{"key":"object-value"}');
    expect(screen.getByTestId('current-value')).toHaveTextContent('{"key":"object-value"}');
  });

  test('handles function updates correctly', () => {
    render(<TestComponent storageKey="test-key" initialValue="initial" />);
    
    fireEvent.click(screen.getByText('Update Function'));
    
    expect(localStorage.getItem('test-key')).toBe('"initial-updated"');
    expect(screen.getByTestId('current-value')).toHaveTextContent('"initial-updated"');
  });

  test('handles null values correctly', () => {
    render(<TestComponent storageKey="test-key" initialValue="initial" />);
    
    fireEvent.click(screen.getByText('Set Null'));
    
    expect(localStorage.getItem('test-key')).toBe('null');
    expect(screen.getByTestId('current-value')).toHaveTextContent('null');
  });

  test('handles localStorage errors gracefully', () => {
    // Mock localStorage to throw error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error('localStorage error');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<TestComponent storageKey="test-key" initialValue="initial" />);
    
    fireEvent.click(screen.getByText('Set String'));
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error setting localStorage key "test-key":',
      expect.any(Error)
    );

    localStorage.setItem = originalSetItem;
    consoleSpy.mockRestore();
  });

  test('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem('test-key', 'invalid-json');
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<TestComponent storageKey="test-key" initialValue="initial" />);
    
    expect(screen.getByTestId('current-value')).toHaveTextContent('"initial"');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error reading localStorage key "test-key":',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  test('responds to storage events from other tabs', () => {
    render(<TestComponent storageKey="test-key" initialValue="initial" />);
    
    // Simulate storage event from another tab
    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'test-key',
        newValue: '"external-update"',
        oldValue: '"initial"'
      });
      window.dispatchEvent(storageEvent);
    });

    expect(screen.getByTestId('current-value')).toHaveTextContent('"external-update"');
  });

  test('ignores storage events for different keys', () => {
    render(<TestComponent storageKey="test-key" initialValue="initial" />);
    
    // Simulate storage event for different key
    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'different-key',
        newValue: '"external-update"',
        oldValue: '"old-value"'
      });
      window.dispatchEvent(storageEvent);
    });

    expect(screen.getByTestId('current-value')).toHaveTextContent('"initial"');
  });

  test('handles storage events with null newValue', () => {
    render(<TestComponent storageKey="test-key" initialValue="initial" />);
    
    // Simulate storage event with null newValue (key deletion)
    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'test-key',
        newValue: null,
        oldValue: '"initial"'
      });
      window.dispatchEvent(storageEvent);
    });

    expect(screen.getByTestId('current-value')).toHaveTextContent('"initial"');
  });

  test('handles storage events with invalid JSON gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<TestComponent storageKey="test-key" initialValue="initial" />);
    
    // Simulate storage event with invalid JSON
    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'test-key',
        newValue: 'invalid-json',
        oldValue: '"initial"'
      });
      window.dispatchEvent(storageEvent);
    });

    expect(screen.getByTestId('current-value')).toHaveTextContent('"initial"');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error parsing localStorage key "test-key":',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});