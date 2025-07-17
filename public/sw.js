const CACHE_NAME = 'smart-task-manager-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/media/logo.svg',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline tasks
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Get pending tasks from IndexedDB
  const pendingTasks = await getPendingTasks();
  
  for (const task of pendingTasks) {
    try {
      // Try to sync with server
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      
      // Remove from pending if successful
      await removePendingTask(task.id);
    } catch (error) {
      console.error('Failed to sync task:', error);
    }
  }
}

// Push notification event
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Task reminder',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    actions: [
      {
        action: 'mark-done',
        title: 'Mark as Done',
        icon: '/check-icon.png'
      },
      {
        action: 'snooze',
        title: 'Snooze',
        icon: '/snooze-icon.png'
      }
    ],
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification('Smart Task Manager', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'mark-done') {
    // Handle mark as done action
    event.waitUntil(
      clients.openWindow('/tasks?action=mark-done&id=' + event.notification.data.taskId)
    );
  } else if (event.action === 'snooze') {
    // Handle snooze action
    event.waitUntil(
      clients.openWindow('/tasks?action=snooze&id=' + event.notification.data.taskId)
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions for IndexedDB operations
async function getPendingTasks() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TaskManagerDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingTasks'], 'readonly');
      const store = transaction.objectStore('pendingTasks');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
  });
}

async function removePendingTask(taskId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TaskManagerDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingTasks'], 'readwrite');
      const store = transaction.objectStore('pendingTasks');
      const deleteRequest = store.delete(taskId);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}