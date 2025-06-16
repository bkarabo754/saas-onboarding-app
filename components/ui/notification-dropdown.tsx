'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Check,
  Users,
  FolderPlus,
  Zap,
  Activity,
  CreditCard,
  Settings,
  Shield,
  Eye,
  Trash2,
  CheckCheck,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type:
    | 'team'
    | 'project'
    | 'integration'
    | 'report'
    | 'subscription'
    | 'workspace'
    | 'billing'
    | 'security';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

export function NotificationDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      const storedNotifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );
      const parsedNotifications = storedNotifications.map((notif: any) => ({
        ...notif,
        timestamp: new Date(notif.timestamp),
      }));
      setNotifications(parsedNotifications);
    };

    loadNotifications();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notifications') {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'team':
        return Users;
      case 'project':
        return FolderPlus;
      case 'integration':
        return Zap;
      case 'report':
        return Activity;
      case 'subscription':
        return CreditCard;
      case 'workspace':
        return Settings;
      case 'billing':
        return CreditCard;
      case 'security':
        return Shield;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'team':
        return 'bg-purple-100 text-purple-600';
      case 'project':
        return 'bg-blue-100 text-blue-600';
      case 'integration':
        return 'bg-green-100 text-green-600';
      case 'report':
        return 'bg-orange-100 text-orange-600';
      case 'subscription':
        return 'bg-emerald-100 text-emerald-600';
      case 'workspace':
        return 'bg-indigo-100 text-indigo-600';
      case 'billing':
        return 'bg-yellow-100 text-yellow-600';
      case 'security':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );

    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({
      ...notif,
      read: true,
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedNotifications = notifications.filter(
      (notif) => notif.id !== notificationId
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    toast.success('Notification deleted');
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);

    // Close dropdown
    setIsOpen(false);

    // Navigate to link if available
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleViewAllClick = () => {
    setIsOpen(false);
    router.push('/notifications');
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;
  const recentNotifications = notifications
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5); // Show only 5 most recent

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 max-h-[80vh] flex flex-col"
        sideOffset={5}
      >
        {/* Header - Fixed */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white text-xs">
                  {unreadCount}
                </Badge>
              )}
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-6 px-2"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List - Scrollable */}
        <div className="flex-1 overflow-y-auto max-h-80">
          {recentNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read
                        ? 'bg-blue-50 border-l-4 border-l-blue-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${getNotificationColor(notification.type)} flex-shrink-0`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={`text-sm font-medium truncate ${
                              !notification.read
                                ? 'text-gray-900'
                                : 'text-gray-700'
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <button
                              onClick={(e) =>
                                deleteNotification(notification.id, e)
                              }
                              className="opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <p
                          className={`text-xs mt-1 line-clamp-2 ${
                            !notification.read
                              ? 'text-gray-800'
                              : 'text-gray-600'
                          }`}
                        >
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3 bg-gray-50">
              <Button
                variant="ghost"
                className="w-full justify-between text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={handleViewAllClick}
              >
                <span>View All Notifications</span>
                <div className="flex items-center gap-1">
                  {notifications.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{notifications.length - 5} more
                    </Badge>
                  )}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
