// Notification service for push notifications and reminders

class NotificationService {
  constructor() {
    this.subscription = null;
    this.reminders = new Map();
    this.init();
  }

  async init() {
    // Request notification permission
    await this.requestPermission();
    
    // Initialize push notifications
    await this.initializePushNotifications();
    
    // Set up periodic checks for deadlines
    this.startDeadlineChecker();
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async initializePushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push messaging is not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      this.subscription = await registration.pushManager.getSubscription();
      
      if (!this.subscription) {
        // Subscribe to push notifications
        this.subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.getVAPIDPublicKey())
        });
        
        // Send subscription to server (mock implementation)
        await this.sendSubscriptionToServer(this.subscription);
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  getVAPIDPublicKey() {
    // In production, this should come from your server
    return 'BHxFPvnSMq_FRHZLMsFYyFtQGbJHIrTF_5J_vOv-vKfSYLqLlGLKCuSZL1YZLQWgxNEOMRPM-G0GfANJpPIHPcE';
  }

  async sendSubscriptionToServer(subscription) {
    // Mock implementation - in production, send to your server
    try {
      console.log('Subscription sent to server:', subscription);
      // Store subscription in localStorage for demo
      localStorage.setItem('push_subscription', JSON.stringify(subscription));
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  }

  // Schedule a reminder for a task
  scheduleReminder(task) {
    if (!task.deadline || task.completed) return;

    const now = new Date();
    const deadline = new Date(task.deadline);
    const timeUntilDeadline = deadline.getTime() - now.getTime();

    // Schedule reminders at different intervals
    const reminderIntervals = [
      { time: 24 * 60 * 60 * 1000, message: 'Due tomorrow' },
      { time: 60 * 60 * 1000, message: 'Due in 1 hour' },
      { time: 15 * 60 * 1000, message: 'Due in 15 minutes' },
      { time: 0, message: 'Due now!' }
    ];

    reminderIntervals.forEach(interval => {
      const reminderTime = timeUntilDeadline - interval.time;
      
      if (reminderTime > 0) {
        const timeoutId = setTimeout(() => {
          this.showNotification(task, interval.message);
        }, reminderTime);

        // Store timeout ID for cancellation
        const reminderId = `${task.id}-${interval.time}`;
        this.reminders.set(reminderId, timeoutId);
      }
    });
  }

  // Cancel reminders for a task
  cancelReminders(taskId) {
    for (const [reminderId, timeoutId] of this.reminders.entries()) {
      if (reminderId.startsWith(taskId)) {
        clearTimeout(timeoutId);
        this.reminders.delete(reminderId);
      }
    }
  }

  // Show notification
  showNotification(task, message) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(`Task Reminder: ${task.title}`, {
        body: `${message}\n${task.description || 'No description'}`,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: `task-${task.id}`,
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Task', icon: '/view-icon.png' },
          { action: 'complete', title: 'Mark Complete', icon: '/check-icon.png' },
          { action: 'snooze', title: 'Snooze 15min', icon: '/snooze-icon.png' }
        ],
        data: {
          taskId: task.id,
          url: '/'
        }
      });

      notification.onclick = () => {
        window.focus();
        this.openTaskView(task.id);
        notification.close();
      };

      // Auto-close after 10 seconds if not interacted with
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Play notification sound
      this.playNotificationSound();
    }
  }

  // Play notification sound
  playNotificationSound() {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(err => {
        console.log('Could not play notification sound:', err);
      });
    } catch (error) {
      console.log('Audio not supported');
    }
  }

  // Open task view
  openTaskView(taskId) {
    // This would navigate to the specific task
    window.location.hash = `#/task/${taskId}`;
  }

  // Start periodic deadline checker
  startDeadlineChecker() {
    // Check every 5 minutes for approaching deadlines
    setInterval(() => {
      this.checkUpcomingDeadlines();
    }, 5 * 60 * 1000);
  }

  // Check for upcoming deadlines
  checkUpcomingDeadlines() {
    const tasks = this.getTasksFromStorage();
    const now = new Date();
    
    tasks.forEach(task => {
      if (task.deadline && !task.completed) {
        const deadline = new Date(task.deadline);
        const timeUntilDeadline = deadline.getTime() - now.getTime();
        
        // Show notification for tasks due within 2 hours
        if (timeUntilDeadline > 0 && timeUntilDeadline <= 2 * 60 * 60 * 1000) {
          const minutes = Math.floor(timeUntilDeadline / (60 * 1000));
          const hours = Math.floor(minutes / 60);
          
          let message;
          if (hours > 0) {
            message = `Due in ${hours} hour${hours > 1 ? 's' : ''}`;
          } else {
            message = `Due in ${minutes} minute${minutes > 1 ? 's' : ''}`;
          }
          
          this.showNotification(task, message);
        }
      }
    });
  }

  // Get tasks from storage
  getTasksFromStorage() {
    try {
      const tasks = localStorage.getItem('tasks');
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Error getting tasks from storage:', error);
      return [];
    }
  }

  // Show in-app notification
  showInAppNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `in-app-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getIconForType(type)}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.getColorForType(type)};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      max-width: 350px;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Handle close button
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        closeButton.click();
      }
    }, 5000);
  }

  getIconForType(type) {
    const icons = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    };
    return icons[type] || 'ℹ️';
  }

  getColorForType(type) {
    const colors = {
      'info': '#2563eb',
      'success': '#10b981',
      'warning': '#f59e0b',
      'error': '#ef4444'
    };
    return colors[type] || '#2563eb';
  }

  // Show offline notification
  showOfflineNotification() {
    this.showInAppNotification('You are offline. Changes will sync when connection is restored.', 'warning');
  }

  // Show online notification
  showOnlineNotification() {
    this.showInAppNotification('You are back online. Syncing changes...', 'success');
  }

  // Batch notification for multiple tasks
  showBatchNotification(tasks, action) {
    const count = tasks.length;
    const message = `${count} task${count > 1 ? 's' : ''} ${action}`;
    this.showInAppNotification(message, 'success');
  }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    margin-left: auto;
  }
  
  .notification-close:hover {
    opacity: 0.8;
  }
`;
document.head.appendChild(style);

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;