import { supabase } from "@/integrations/supabase/client";

export interface NotificationOptions {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  subject?: string;
  topic?: string;
}

/**
 * Send a push notification to the current user
 */
export async function sendPushNotification(options: NotificationOptions): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found for push notification');
      return false;
    }

    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        user_id: user.id,
        title: options.title,
        body: options.body,
        tag: options.tag || 'general',
        data: {
          url: options.url || '/',
          subject: options.subject,
          topic: options.topic,
          timestamp: Date.now()
        }
      }
    });

    if (error) {
      console.error('Error sending push notification:', error);
      return false;
    }

    console.log('Push notification sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return false;
  }
}

/**
 * Show a browser notification (for immediate local notifications)
 */
export async function showBrowserNotification(options: NotificationOptions): Promise<boolean> {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    // Check permission
    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    // Create the notification
    const notification = new Notification(options.title, {
      body: options.body,
      icon: '/owl-notification.png',
      badge: '/owl-notification.png',
      image: '/owl-notification.png',
      tag: options.tag || 'general',
      requireInteraction: false,
      silent: false,
      vibrate: [100, 50, 100]
    });

    // Handle click
    notification.onclick = () => {
      window.focus();
      if (options.url) {
        window.location.href = options.url;
      }
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    return true;
  } catch (error) {
    console.error('Failed to show browser notification:', error);
    return false;
  }
}

/**
 * Send notification for timetable generation completion
 */
export async function notifyTimetableComplete(timetableName: string): Promise<void> {
  // Try push notification first
  const pushSent = await sendPushNotification({
    title: '🎉 Timetable Ready!',
    body: `"${timetableName}" has been generated successfully. Time to start studying!`,
    tag: 'timetable-complete',
    url: '/timetables'
  });

  // If push fails or user is on the page, also show browser notification
  if (!pushSent || document.visibilityState === 'visible') {
    await showBrowserNotification({
      title: '🎉 Timetable Ready!',
      body: `"${timetableName}" has been generated successfully. Time to start studying!`,
      tag: 'timetable-complete',
      url: '/timetables'
    });
  }
}

/**
 * Send notification for study reminder
 */
export async function notifyStudyReminder(subject: string, topic?: string, time?: string): Promise<void> {
  const body = topic 
    ? `Time to study ${topic}!` 
    : time
    ? `Your ${subject} session starts at ${time}`
    : `Don't forget to study ${subject}!`;

  await sendPushNotification({
    title: `📚 Study Time: ${subject}`,
    body,
    tag: 'study-reminder',
    url: '/timetables',
    subject,
    topic
  });
}
