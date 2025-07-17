// Mock API service using JSONPlaceholder as a base
// In a real app, you would replace this with your actual API endpoints

const BASE_URL = 'https://jsonplaceholder.typicode.com';

// Realistic example tasks data
const exampleTasks = [
  {
    id: 1,
    title: "Review Q4 project proposals",
    description: "Evaluate all submitted project proposals for Q4 and provide feedback to the team leads",
    category: "work",
    completed: false,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Schedule doctor appointment",
    description: "Book annual checkup with Dr. Smith for next month",
    category: "personal",
    completed: false,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Fix critical production bug",
    description: "User authentication is failing for Safari browsers - needs immediate attention",
    category: "urgent",
    completed: false,
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    title: "Buy groceries for dinner party",
    description: "Get ingredients for Saturday's dinner party: salmon, vegetables, wine, dessert",
    category: "personal",
    completed: true,
    deadline: null,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  },
  {
    id: 5,
    title: "Prepare client presentation",
    description: "Create slides and demo for the ABC Corp product showcase meeting",
    category: "work",
    completed: false,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    title: "Update project documentation",
    description: "Add API documentation and update README files for the new features released",
    category: "work",
    completed: true,
    deadline: null,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  },
  {
    id: 7,
    title: "Plan weekend hiking trip",
    description: "Research trails, check weather, pack equipment for the mountain hiking trip",
    category: "personal",
    completed: false,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 8,
    title: "Code review for security update",
    description: "Review and approve the security patches submitted by the development team",
    category: "urgent",
    completed: false,
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  }
];

// Mock data structure for tasks
const createMockTask = (id, title, completed = false) => {
  const example = exampleTasks.find(task => task.id === id);
  if (example) {
    return example;
  }
  
  return {
    id,
    title,
    description: `Description for task ${id}`,
    category: ['work', 'personal', 'urgent'][Math.floor(Math.random() * 3)],
    completed,
    deadline: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
    createdAt: new Date().toISOString()
  };
};

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API service
export const apiService = {
  // Get all tasks
  getTasks: async () => {
    try {
      await delay(500); // Simulate network delay
      
      // Use JSONPlaceholder todos as a base and transform them
      const response = await fetch(`${BASE_URL}/todos?_limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const todos = await response.json();
      
      // Transform JSONPlaceholder todos to our task format
      return todos.map(todo => createMockTask(todo.id, todo.title, todo.completed));
    } catch (error) {
      console.error('API Error - getTasks:', error);
      throw error;
    }
  },

  // Create a new task
  createTask: async (task) => {
    try {
      await delay(300);
      
      // Simulate creating a task (JSONPlaceholder will return a fake success)
      const response = await fetch(`${BASE_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          completed: task.completed,
          userId: 1
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      
      const result = await response.json();
      
      // Return the task with the mock ID
      return {
        ...task,
        id: result.id
      };
    } catch (error) {
      console.error('API Error - createTask:', error);
      throw error;
    }
  },

  // Update an existing task
  updateTask: async (taskId, task) => {
    try {
      await delay(300);
      
      const response = await fetch(`${BASE_URL}/todos/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: taskId,
          title: task.title,
          completed: task.completed,
          userId: 1
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      const result = await response.json();
      
      // Return the updated task
      return {
        ...task,
        id: result.id
      };
    } catch (error) {
      console.error('API Error - updateTask:', error);
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    try {
      await delay(300);
      
      const response = await fetch(`${BASE_URL}/todos/${taskId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      return { success: true };
    } catch (error) {
      console.error('API Error - deleteTask:', error);
      throw error;
    }
  },

  // Get task by ID
  getTask: async (taskId) => {
    try {
      await delay(200);
      
      const response = await fetch(`${BASE_URL}/todos/${taskId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }
      
      const todo = await response.json();
      return createMockTask(todo.id, todo.title, todo.completed);
    } catch (error) {
      console.error('API Error - getTask:', error);
      throw error;
    }
  }
};

// Alternative: Pure mock service without external API
export const mockApiService = {
  tasks: exampleTasks.slice(),

  getTasks: async () => {
    await delay(500);
    return [...mockApiService.tasks];
  },

  createTask: async (task) => {
    await delay(300);
    const newTask = {
      ...task,
      id: Date.now() + Math.random() // Simple ID generation
    };
    mockApiService.tasks.push(newTask);
    return newTask;
  },

  updateTask: async (taskId, updates) => {
    await delay(300);
    const index = mockApiService.tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      mockApiService.tasks[index] = { ...mockApiService.tasks[index], ...updates };
      return mockApiService.tasks[index];
    }
    throw new Error('Task not found');
  },

  deleteTask: async (taskId) => {
    await delay(300);
    const index = mockApiService.tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      mockApiService.tasks.splice(index, 1);
      return { success: true };
    }
    throw new Error('Task not found');
  }
};

// Use the mock service if you prefer not to use external API
// export { mockApiService as apiService };