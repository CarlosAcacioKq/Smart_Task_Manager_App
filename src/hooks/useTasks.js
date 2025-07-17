import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { apiService } from '../services/api';

export const useTasks = () => {
  const [localTasks, setLocalTasks] = useLocalStorage('tasks', []);
  const [tasks, setTasks] = useState(localTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync local tasks with state when localStorage changes
  useEffect(() => {
    setTasks(localTasks);
  }, [localTasks]);

  // Load tasks from API on mount
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiTasks = await apiService.getTasks();
        
        // Merge API tasks with local tasks, preferring local versions
        const mergedTasks = [...localTasks];
        
        apiTasks.forEach(apiTask => {
          const existingTask = mergedTasks.find(task => task.id === apiTask.id);
          if (!existingTask) {
            mergedTasks.push(apiTask);
          }
        });
        
        setTasks(mergedTasks);
        setLocalTasks(mergedTasks);
      } catch (err) {
        console.error('Failed to load tasks from API:', err);
        setError('Failed to sync with server. Using local data.');
        // Continue with local tasks if API fails
        setTasks(localTasks);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []); // Only run on mount

  const addTask = async (newTask) => {
    setLoading(true);
    setError(null);
    
    try {
      // Add to local state immediately for better UX
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      setLocalTasks(updatedTasks);
      
      // Sync with API in background
      await apiService.createTask(newTask);
    } catch (err) {
      console.error('Failed to create task on server:', err);
      setError('Failed to sync with server. Task saved locally.');
      // Task is already saved locally, so we don't need to rollback
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId, updates) => {
    // Don't show loading for quick updates like completion toggle
    const isQuickUpdate = Object.keys(updates).length <= 2;
    
    if (!isQuickUpdate) {
      setLoading(true);
    }
    setError(null);
    
    try {
      // Update local state immediately
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      );
      setTasks(updatedTasks);
      setLocalTasks(updatedTasks);
      
      // Sync with API in background
      const taskToUpdate = updatedTasks.find(task => task.id === taskId);
      await apiService.updateTask(taskId, taskToUpdate);
    } catch (err) {
      console.error('Failed to update task on server:', err);
      setError('Failed to sync with server. Changes saved locally.');
      // Task is already updated locally, so we don't need to rollback
    } finally {
      if (!isQuickUpdate) {
        setLoading(false);
      }
    }
  };

  const deleteTask = async (taskId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Remove from local state immediately
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      setLocalTasks(updatedTasks);
      
      // Sync with API in background
      await apiService.deleteTask(taskId);
    } catch (err) {
      console.error('Failed to delete task on server:', err);
      setError('Failed to sync with server. Task deleted locally.');
      // Task is already deleted locally, so we don't need to rollback
    } finally {
      setLoading(false);
    }
  };


  const syncWithServer = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get fresh data from server
      const serverTasks = await apiService.getTasks();
      
      // For now, we'll use a simple last-write-wins strategy
      // In a real app, you might want more sophisticated conflict resolution
      setTasks(serverTasks);
      setLocalTasks(serverTasks);
    } catch (err) {
      console.error('Failed to sync with server:', err);
      setError('Failed to sync with server.');
    } finally {
      setLoading(false);
    }
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    syncWithServer,
    loading,
    error,
    clearError: () => setError(null)
  };
};