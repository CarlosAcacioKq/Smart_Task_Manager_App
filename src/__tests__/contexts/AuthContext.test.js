import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Test component that uses the auth context
const TestComponent = () => {
  const { user, login, logout, register, loading, isAuthenticated } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user">{user ? user.name : 'No User'}</div>
      <button onClick={() => login('admin@taskmanager.com', 'admin123')}>
        Login
      </button>
      <button onClick={() => register('new@test.com', 'password123', 'New User')}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('provides initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  test('logs in user with valid credentials', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    // Should show loading state
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('Admin User');
  });

  test('persists user in localStorage after login', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    // Check localStorage
    const storedUser = JSON.parse(localStorage.getItem('taskmanager_user'));
    expect(storedUser).toEqual({
      id: 1,
      email: 'admin@taskmanager.com',
      name: 'Admin User',
      avatar: '👨‍💻'
    });
  });

  test('logs out user and clears localStorage', async () => {
    // First login
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    // Then logout
    fireEvent.click(screen.getByText('Logout'));

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
    expect(localStorage.getItem('taskmanager_user')).toBeNull();
  });

  test('registers new user successfully', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('New User');
  });

  test('handles invalid login credentials', async () => {
    const TestComponentWithError = () => {
      const { login } = useAuth();
      const [error, setError] = React.useState('');

      const handleLogin = async () => {
        const result = await login('invalid@email.com', 'wrongpassword');
        if (!result.success) {
          setError(result.error);
        }
      };

      return (
        <div>
          <button onClick={handleLogin}>Login with Invalid Credentials</button>
          <div data-testid="error">{error}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponentWithError />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login with Invalid Credentials'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid email or password');
    });
  });

  test('handles duplicate user registration', async () => {
    const TestComponentWithRegister = () => {
      const { register } = useAuth();
      const [error, setError] = React.useState('');

      const handleRegister = async () => {
        const result = await register('admin@taskmanager.com', 'password123', 'Duplicate User');
        if (!result.success) {
          setError(result.error);
        }
      };

      return (
        <div>
          <button onClick={handleRegister}>Register Duplicate User</button>
          <div data-testid="error">{error}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponentWithRegister />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Register Duplicate User'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('User already exists');
    });
  });

  test('restores user from localStorage on initialization', () => {
    const userData = {
      id: 1,
      email: 'admin@taskmanager.com',
      name: 'Admin User',
      avatar: '👨‍💻'
    };

    localStorage.setItem('taskmanager_user', JSON.stringify(userData));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('Admin User');
  });

  test('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem('taskmanager_user', 'invalid-json');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(localStorage.getItem('taskmanager_user')).toBeNull();
  });

  test('throws error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });
});