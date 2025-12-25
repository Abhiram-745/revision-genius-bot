// Push notification service worker

self.addEventListener('push', function(event) {
  console.log('[SW] Push received:', event);
  
  let data = {
    title: 'Vistara',
    body: 'You have a new notification',
    icon: '/owl-notification.png',
    badge: '/owl-notification.png',
    image: '/owl-notification.png',
    tag: 'general',
    data: { url: '/' }
  };
  
  if (event.data) {
    try {
      const parsed = event.data.json();
      console.log('[SW] Parsed push data:', parsed);
      data = { ...data, ...parsed };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
      try {
        // Fallback: try to use text
        data.body = event.data.text();
      } catch (textError) {
        console.error('[SW] Error reading text:', textError);
      }
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/owl-notification.png',
    badge: data.badge || '/owl-notification.png',
    image: data.image || '/owl-notification.png',
    tag: data.tag || 'general',
    data: data.data || { url: '/' },
    vibrate: [100, 50, 100, 50, 100],
    requireInteraction: true,
    silent: false,
    timestamp: Date.now(),
    actions: [
      { action: 'open', title: 'Open', icon: '/owl-notification.png' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  console.log('[SW] Showing notification with options:', options);
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => console.log('[SW] Notification shown successfully'))
      .catch(err => console.error('[SW] Error showing notification:', err))
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if there's already an open window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open a new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('[SW] Notification closed');
});
