// PWA utility functions

// Service Worker registration
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Show update available notification
                showUpdateNotification();
              }
            });
          });
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Show update notification
const showUpdateNotification = () => {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div id="update-notification" style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: sans-serif;
      font-size: 14px;
      max-width: 300px;
    ">
      <div style="margin-bottom: 10px;">
        <strong>App Update Available</strong>
      </div>
      <div style="margin-bottom: 15px;">
        A new version of the app is available. Refresh to update.
      </div>
      <button id="update-btn" style="
        background: white;
        color: #2563eb;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 10px;
      ">Update Now</button>
      <button id="dismiss-btn" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      ">Later</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Handle update button
  document.getElementById('update-btn').addEventListener('click', () => {
    window.location.reload();
  });
  
  // Handle dismiss button
  document.getElementById('dismiss-btn').addEventListener('click', () => {
    document.body.removeChild(notification);
  });
};

// Push notification utilities
export const requestNotificationPermission = async () => {
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
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push messaging is not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }
    
    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(getVAPIDPublicKey())
    });
    
    // Send subscription to server
    await sendSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
};

// Utility function to convert VAPID key
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Mock VAPID public key (in production, get from server)
const getVAPIDPublicKey = () => {
  return 'BHxFPvnSMq_FRHZLMsFYyFtQGbJHIrTF_5J_vOv-vKfSYLqLlGLKCuSZL1YZLQWgxNEOMRPM-G0GfANJpPIHPcE';
};

// Send subscription to server
const sendSubscriptionToServer = async (subscription) => {
  try {
    const response = await fetch('/api/push-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
    
    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }
  } catch (error) {
    console.error('Error sending subscription to server:', error);
  }
};

// Local notification for deadline reminders
export const scheduleTaskNotification = (task) => {
  if (!task.deadline || task.completed) return;
  
  const now = new Date();
  const deadline = new Date(task.deadline);
  const timeUntilDeadline = deadline.getTime() - now.getTime();
  
  // Schedule notification 1 hour before deadline
  const notificationTime = timeUntilDeadline - (60 * 60 * 1000);
  
  if (notificationTime > 0) {
    setTimeout(() => {
      showLocalNotification(task);
    }, notificationTime);
  }
};

// Show local notification
const showLocalNotification = (task) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification('Task Reminder', {
      body: `"${task.title}" is due in 1 hour!`,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      tag: `task-${task.id}`,
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Task' },
        { action: 'complete', title: 'Mark Complete' }
      ]
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  }
};

// Offline storage utilities
export const initOfflineStorage = () => {
  if (!('indexedDB' in window)) {
    console.log('IndexedDB is not supported');
    return;
  }
  
  const request = indexedDB.open('TaskManagerDB', 1);
  
  request.onerror = (event) => {
    console.error('IndexedDB error:', event.target.error);
  };
  
  request.onsuccess = (event) => {
    console.log('IndexedDB initialized successfully');
  };
  
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    
    // Create object stores
    if (!db.objectStoreNames.contains('tasks')) {
      const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
      taskStore.createIndex('completed', 'completed', { unique: false });
      taskStore.createIndex('category', 'category', { unique: false });
    }
    
    if (!db.objectStoreNames.contains('pendingTasks')) {
      db.createObjectStore('pendingTasks', { keyPath: 'id' });
    }
  };
};

// Store task offline
export const storeTaskOffline = async (task) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TaskManagerDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const addRequest = store.put(task);
      
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };
  });
};

// Get offline tasks
export const getOfflineTasks = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TaskManagerDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
  });
};

// Check if app is running as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// Install prompt
let deferredPrompt;

export const handleInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });
};

const showInstallButton = () => {
  const installButton = document.createElement('button');
  installButton.textContent = '📱 Install App';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #2563eb;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    font-size: 14px;
    font-weight: 500;
  `;
  
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      
      deferredPrompt = null;
      document.body.removeChild(installButton);
    }
  });
  
  document.body.appendChild(installButton);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (document.body.contains(installButton)) {
      document.body.removeChild(installButton);
    }
  }, 10000);
};