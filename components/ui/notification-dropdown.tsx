'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  Check,
  X,
  Trash2,
  Settings,
  CreditCard,
  Users,
  FolderPlus,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'subscription' | 'billing' | 'project' | 'team' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'subscription':
      return CreditCard;
    case 'billing':
      return CreditCard;
    case 'project':
      return FolderPlus;
    case 'team':
      return Users;
    case 'system':
      return Settings;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'subscription':
      return 'text-blue-600 bg-blue-100';
    case 'billing':
      return 'text-green-600 bg-green-100';
    case 'project':
      return 'text-purple-600 bg-purple-100';
    case 'team':
      return 'text-orange-600 bg-orange-100';
    case 'system':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-blue-600 bg-blue-100';
  }
};

const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load notifications from localStorage
    const loadNotifications = () => {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(parsed);
      } else {
        // Initialize with some default notifications
        const defaultNotifications: Notification[] = [
          {
            id: '1',
            type: 'subscription',
            title: 'Welcome to Professional Plan',
            message: 'Your subscription is now active. Enjoy premium features!',
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            read: false,
            link: '/subscription',
          },
          {
            id: '2',
            type: 'team',
            title: 'New team member joined',
            message: 'Sarah Johnson has joined your workspace',
            timestamp: new Date(Date.now() - 7200000), // 2 hours ago
            read: false,
            link: '/workspace-settings',
          },
          {
            id: '3',
            type: 'project',
            title: 'Project milestone completed',
            message: 'Website redesign Phase 1 is complete',
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
            read: true,
            link: '/projects',
          },
        ];
        setNotifications(defaultNotifications);
        localStorage.setItem(
          'notifications',
          JSON.stringify(defaultNotifications)
        );
      }
    };

    loadNotifications();

    // Listen for storage changes (when notifications are added from other components)
    const handleStorageChange = () => {
      loadNotifications();
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events
    const handleNotificationUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('notificationUpdate', handleNotificationUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'notificationUpdate',
        handleNotificationUpdate
      );
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    toast.success('Notification marked as read');
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    toast.success('All notifications marked as read');
  };

  const removeNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    toast.success('Notification removed');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('notifications', JSON.stringify([]));
    toast.success('All notifications cleared');
  };

  const filterByType = (type: string) => {
    return notifications.filter((n) => n.type === type);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-80">
              {notifications.slice(0, 10).map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);

                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`p-3 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      if (notification.link) {
                        window.location.href = notification.link;
                      }
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex gap-3 w-full">
                      <div
                        className={`p-2 rounded-full ${colorClass} flex-shrink-0`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4
                            className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}
                          >
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="h-auto p-1 opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </ScrollArea>

            <DropdownMenuSeparator />

            <div className="p-2 space-y-1">
              {notifications.length > 10 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                >
                  View all {notifications.length} notifications
                </Button>
              )}

              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Clear all notifications
                </Button>
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
