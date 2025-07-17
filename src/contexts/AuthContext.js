import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user data
const mockUsers = [
  {
    id: 1,
    email: 'admin@taskmanager.com',
    password: 'admin123',
    name: 'Admin User',
    avatar: '👨‍💻'
  },
  {
    id: 2,
    email: 'user@taskmanager.com',
    password: 'user123',
    name: 'Regular User',
    avatar: '👩‍💼'
  },
  {
    id: 3,
    email: 'demo@taskmanager.com',
    password: 'demo123',
    name: 'Demo User',
    avatar: '🚀'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('taskmanager_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('taskmanager_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(
      u => u.email === email && u.password === password
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('taskmanager_user', JSON.stringify(userWithoutPassword));
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      return { success: false, error: 'Invalid email or password' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskmanager_user');
    // Also clear tasks when logging out
    localStorage.removeItem('tasks');
  };

  const register = async (email, password, name) => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      setLoading(false);
      return { success: false, error: 'User already exists' };
    }
    
    // Create new user
    const newUser = {
      id: Date.now(),
      email,
      name,
      avatar: '👤'
    };
    
    mockUsers.push({ ...newUser, password });
    setUser(newUser);
    localStorage.setItem('taskmanager_user', JSON.stringify(newUser));
    setLoading(false);
    return { success: true };
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};