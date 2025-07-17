import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import SmartTaskInput from './components/SmartTaskInput';
import AIAssistant from './components/AIAssistant';
import ProductivityDashboard from './components/ProductivityDashboard';
import FilterBar from './components/FilterBar';
import ThemeToggle from './components/ThemeToggle';
import ProgressTracker from './components/ProgressTracker';
import UserProfile from './components/UserProfile';
import AuthWrapper from './components/AuthWrapper';
import Dashboard from './components/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTasks } from './hooks/useTasks';
import { registerServiceWorker, handleInstallPrompt, initOfflineStorage } from './utils/pwa';
import notificationService from './services/notificationService';

const App = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentView, setCurrentView] = useState('tasks');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    loading,
    error
  } = useTasks();

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Initialize PWA features
  useEffect(() => {
    // Register service worker
    registerServiceWorker();
    
    // Handle install prompt
    handleInstallPrompt();
    
    // Initialize offline storage
    initOfflineStorage();
    
    // Initialize notification service
    notificationService.init();
    
    // Handle online/offline events
    const handleOnline = () => {
      notificationService.showOnlineNotification();
    };
    
    const handleOffline = () => {
      notificationService.showOfflineNotification();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesFilter = filter === 'all' || 
                         (filter === 'completed' && task.completed) ||
                         (filter === 'pending' && !task.completed);
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const handleAddTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: Date.now(),
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    
    addTask(newTask);
    
    // Schedule reminder for new task
    if (newTask.deadline) {
      notificationService.scheduleReminder(newTask);
    }
    
    // Show success notification
    notificationService.showInAppNotification('Task added successfully!', 'success');
  };

  const handleUpdateTask = (taskId, updates) => {
    // Add completion timestamp when task is completed
    if (updates.completed && updates.completed !== tasks.find(t => t.id === taskId)?.completed) {
      updates.completedAt = new Date().toISOString();
    } else if (updates.completed === false) {
      updates.completedAt = null;
    }
    
    updateTask(taskId, updates);
    
    // Cancel existing reminders and reschedule if needed
    notificationService.cancelReminders(taskId);
    
    const updatedTask = tasks.find(task => task.id === taskId);
    if (updatedTask && !updates.completed && updates.deadline) {
      notificationService.scheduleReminder({ ...updatedTask, ...updates });
    }
    
    // Show update notification
    if (updates.completed) {
      notificationService.showInAppNotification('Task completed!', 'success');
    } else {
      notificationService.showInAppNotification('Task updated!', 'info');
    }
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
    
    // Cancel reminders for deleted task
    notificationService.cancelReminders(taskId);
    
    // Show delete notification
    notificationService.showInAppNotification('Task deleted!', 'info');
  };


  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <AuthProvider>
      <AuthWrapper>
        <div className={`app ${theme}`}>
          <header className="app-header">
            <h1>Smart Task Manager</h1>
            <nav className="main-nav">
              <button 
                className={`nav-button ${currentView === 'tasks' ? 'active' : ''}`}
                onClick={() => setCurrentView('tasks')}
              >
                📋 Tasks
              </button>
              <button 
                className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('dashboard')}
              >
                📊 Analytics
              </button>
              <button 
                className={`nav-button ${currentView === 'ai-dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('ai-dashboard')}
              >
                🧠 AI Dashboard
              </button>
              <button 
                className="ai-assistant-btn"
                onClick={() => setShowAIAssistant(true)}
              >
                🤖 AI Assistant
              </button>
            </nav>
            <div className="header-actions">
              <ThemeToggle theme={theme} setTheme={setTheme} />
              <UserProfile />
            </div>
          </header>
          
          <main className="app-main">
            {currentView === 'tasks' ? (
              <>
                <div className="sidebar">
                  <SmartTaskInput onAddTask={handleAddTask} existingTasks={tasks} />
                  <FilterBar 
                    filter={filter}
                    setFilter={setFilter}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                  />
                  <ProgressTracker tasks={tasks} />
                </div>
                
                <div className="main-content">
                  <TaskList 
                    tasks={filteredTasks}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                  />
                </div>
              </>
            ) : currentView === 'dashboard' ? (
              <div className="dashboard-view">
                <Dashboard tasks={tasks} />
              </div>
            ) : currentView === 'ai-dashboard' ? (
              <div className="ai-dashboard-view">
                <ProductivityDashboard tasks={tasks} />
              </div>
            ) : null}
          </main>
          
          <AIAssistant 
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            isVisible={showAIAssistant}
            onClose={() => setShowAIAssistant(false)}
          />
        </div>
      </AuthWrapper>
    </AuthProvider>
  );
};

export default App;