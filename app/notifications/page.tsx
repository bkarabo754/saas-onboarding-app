'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  Archive,
  Star,
  Clock,
  Users,
  FolderPlus,
  Zap,
  Settings,
  CreditCard,
  Shield,
  Activity,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

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
    | 'security'
    | 'settings';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
}

const NOTIFICATION_TYPES = [
  { value: 'all', label: 'All Notifications' },
  { value: 'team', label: 'Team' },
  { value: 'project', label: 'Projects' },
  { value: 'billing', label: 'Billing' },
  { value: 'security', label: 'Security' },
  { value: 'workspace', label: 'Workspace' },
  { value: 'integration', label: 'Integrations' },
  { value: 'settings', label: 'Settings' },
];

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function NotificationsPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

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

  // Filter notifications
  useEffect(() => {
    let filtered = notifications;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (notif) =>
          notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notif.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((notif) => notif.type === typeFilter);
    }

    // Status filter
    if (statusFilter === 'unread') {
      filtered = filtered.filter((notif) => !notif.read);
    } else if (statusFilter === 'read') {
      filtered = filtered.filter((notif) => notif.read);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, typeFilter, statusFilter]);

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
      case 'settings':
        return Settings;
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
      case 'settings':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const markAsRead = async (notificationId: string) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );

    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const markAsUnread = async (notificationId: string) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === notificationId ? { ...notif, read: false } : notif
    );

    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedNotifications = notifications.map((notif) => ({
        ...notif,
        read: true,
      }));
      setNotifications(updatedNotifications);
      localStorage.setItem(
        'notifications',
        JSON.stringify(updatedNotifications)
      );

      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const updatedNotifications = notifications.filter(
      (notif) => notif.id !== notificationId
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    toast.success('Notification deleted');
  };

  const deleteSelected = async () => {
    if (selectedNotifications.length === 0) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedNotifications = notifications.filter(
        (notif) => !selectedNotifications.includes(notif.id)
      );

      setNotifications(updatedNotifications);
      localStorage.setItem(
        'notifications',
        JSON.stringify(updatedNotifications)
      );
      setSelectedNotifications([]);

      toast.success(`${selectedNotifications.length} notification(s) deleted`);
    } catch (error) {
      toast.error('Failed to delete notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectNotification = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredNotifications.map((notif) => notif.id);
    setSelectedNotifications(visibleIds);
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
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
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return timestamp.toLocaleDateString();
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                ← Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="h-8 w-8" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
                Stay updated with your workspace activity
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={markAllAsRead}
              disabled={isLoading || unreadCount === 0}
              variant="outline"
              size="sm"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>

            {selectedNotifications.length > 0 && (
              <Button
                onClick={deleteSelected}
                disabled={isLoading}
                variant="destructive"
                size="sm"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedNotifications.length})
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>

                {filteredNotifications.length > 0 && (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllVisible}
                      disabled={
                        selectedNotifications.length ===
                        filteredNotifications.length
                      }
                    >
                      Select All
                    </Button>
                    {selectedNotifications.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {notifications.length === 0
                  ? 'No notifications yet'
                  : 'No notifications match your filters'}
              </h3>
              <p className="text-gray-600">
                {notifications.length === 0
                  ? "When you have notifications, they'll appear here."
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const isSelected = selectedNotifications.includes(
                notification.id
              );

              return (
                <Card
                  key={notification.id}
                  className={`border-0 shadow-lg transition-all hover:shadow-xl cursor-pointer ${
                    !notification.read
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : ''
                  } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <button
                        onClick={() =>
                          toggleSelectNotification(notification.id)
                        }
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>

                      {/* Notification Icon */}
                      <div
                        className={`p-3 rounded-full ${getNotificationColor(notification.type)}`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}
                            >
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
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

                        <p
                          className={`text-sm mb-3 ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}
                        >
                          {notification.message}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {notification.link && (
                            <Link href={notification.link}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </Link>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              notification.read
                                ? markAsUnread(notification.id)
                                : markAsRead(notification.id)
                            }
                          >
                            {notification.read ? (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Mark Unread
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Mark Read
                              </>
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {filteredNotifications.length > 0 && (
          <Card className="mt-8 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {filteredNotifications.length} of{' '}
                  {notifications.length} notifications
                </span>
                <span>{unreadCount} unread</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
