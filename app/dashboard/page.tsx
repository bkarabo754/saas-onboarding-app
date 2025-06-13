'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Users,
  Settings,
  Plus,
  TrendingUp,
  Activity,
  Zap,
  FolderPlus,
  UserPlus,
  Megaphone,
  Code,
  PartyPopper,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { NotificationDropdown } from '@/components/ui/notification-dropdown';
import { UserAvatarDropdown } from '@/components/ui/user-avatar-dropdown';
import { NewProjectModal } from '@/components/modals/new-project-modal';
import { InviteTeamModal } from '@/components/modals/invite-team-modal';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type:
    | 'team'
    | 'project'
    | 'integration'
    | 'report'
    | 'subscription'
    | 'workspace'
    | 'billing';
  icon?: React.ComponentType<any>;
  color?: string;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  category: string;
  tasks: string[];
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with a clean slate',
    icon: FolderPlus,
    color: 'text-gray-600',
    category: 'General',
    tasks: [
      'Set up project structure',
      'Define project goals',
      'Create initial documentation',
      'Set up team permissions',
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign',
    description: 'Pre-configured for marketing workflows',
    icon: Megaphone,
    color: 'text-orange-600',
    category: 'Marketing',
    tasks: [
      'Define target audience and personas',
      'Create campaign strategy and goals',
      'Design marketing materials and assets',
      'Set up analytics and tracking',
      'Create content calendar',
      'Launch campaign across channels',
      'Monitor performance and optimize',
      'Analyze results and create report',
    ],
  },
  {
    id: 'development',
    name: 'Software Development',
    description: 'Perfect for development teams',
    icon: Code,
    color: 'text-blue-600',
    category: 'Development',
    tasks: [
      'Set up development environment',
      'Create project architecture and design',
      'Set up version control and CI/CD',
      'Implement core features and functionality',
      'Write comprehensive unit tests',
      'Conduct code review and QA testing',
      'Deploy to staging environment',
    ],
  },
  {
    id: 'event',
    name: 'Event Planning',
    description: 'Organize events and manage timelines',
    icon: PartyPopper,
    color: 'text-purple-600',
    category: 'Events',
    tasks: [
      'Define event objectives and scope',
      'Create detailed event timeline',
      'Research and book venue',
      'Coordinate with vendors and suppliers',
      'Create and send invitations',
      'Manage RSVPs and attendee list',
      'Coordinate day-of logistics',
      'Execute event and manage on-site',
      'Collect feedback and follow up',
      'Create post-event report and analysis',
    ],
  },
];

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 12,
    teamMembers: 8,
    activeTasks: 24,
    efficiency: 95,
  });
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Load activity from localStorage and listen for changes
  useEffect(() => {
    const loadActivity = () => {
      // Load notifications as activity
      const notifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');

      // Convert notifications to activity items
      const notificationActivity = notifications
        .slice(0, 10)
        .map((notif: any) => ({
          id: notif.id,
          title: notif.title,
          description: notif.message,
          time: getRelativeTime(new Date(notif.timestamp)),
          type: notif.type,
          icon: getActivityIcon(notif.type),
          color: getActivityColor(notif.type),
        }));

      // Add some default activity if none exists
      const defaultActivity: ActivityItem[] = [
        {
          id: 'default-1',
          title: 'Welcome to your workspace!',
          description: 'Your dashboard is ready to use',
          time: '1 hour ago',
          type: 'workspace',
          icon: Zap,
          color: 'bg-blue-100',
        },
      ];

      const combinedActivity =
        notificationActivity.length > 0
          ? notificationActivity
          : defaultActivity;
      setRecentActivity(combinedActivity);

      // Update stats based on stored data
      setStats((prev) => ({
        ...prev,
        totalProjects: projects.length || prev.totalProjects,
      }));
    };

    // Load initially
    loadActivity();

    // Listen for storage changes (when notifications are added)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notifications' || e.key === 'projects') {
        loadActivity();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check for changes every 5 seconds (for same-tab updates)
    const interval = setInterval(loadActivity, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'team':
        return UserPlus;
      case 'project':
        return FolderPlus;
      case 'integration':
        return Zap;
      case 'report':
        return BarChart3;
      case 'subscription':
        return CheckCircle;
      case 'workspace':
        return Settings;
      case 'billing':
        return AlertCircle;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'team':
        return 'bg-purple-100';
      case 'project':
        return 'bg-blue-100';
      case 'integration':
        return 'bg-green-100';
      case 'report':
        return 'bg-orange-100';
      case 'subscription':
        return 'bg-emerald-100';
      case 'workspace':
        return 'bg-indigo-100';
      case 'billing':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  const createProjectFromTemplate = async (template: ProjectTemplate) => {
    setIsCreatingProject(true);

    try {
      // Simulate project creation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const projectData = {
        id: Date.now().toString(),
        name: `${template.name} Project`,
        description: `${template.description} - Created from template`,
        template: template.id,
        templateName: template.name,
        tasks: template.tasks,
        createdAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        category: template.category,
        priority: 'medium',
        dueDate: '',
        teamMembers: [],
      };

      // Store project
      const existingProjects = JSON.parse(
        localStorage.getItem('projects') || '[]'
      );
      localStorage.setItem(
        'projects',
        JSON.stringify([projectData, ...existingProjects])
      );

      // Add notification
      const notification = {
        id: Date.now().toString(),
        type: 'project',
        title: 'Project Created from Template',
        message: `"${projectData.name}" created with ${template.tasks.length} tasks from ${template.name} template`,
        timestamp: new Date(),
        read: false,
        link: '/projects',
      };

      const existingNotifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );
      localStorage.setItem(
        'notifications',
        JSON.stringify([notification, ...existingNotifications])
      );

      // Trigger storage event for same-tab updates
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'notifications',
          newValue: JSON.stringify([notification, ...existingNotifications]),
        })
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalProjects: prev.totalProjects + 1,
      }));

      toast.success(
        `${template.name} project created successfully with ${template.tasks.length} tasks!`
      );

      // Navigate to projects page after a short delay
      setTimeout(() => {
        router.push('/projects');
      }, 1000);
    } catch (error) {
      toast.error('Failed to create project from template');
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'there'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your workspace today
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <NewProjectModal />
            <UserAvatarDropdown />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Projects
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalProjects}
                  </p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2 this month
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Team Members
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.teamMembers}
                  </p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +1 this week
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Tasks
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeTasks}
                  </p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <Activity className="h-3 w-3 mr-1" />5 due today
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Automation
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.efficiency}%
                  </p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <Zap className="h-3 w-3 mr-1" />
                    Efficiency
                  </p>
                </div>
                <div className="p-3 bg-teal-100 rounded-full">
                  <Zap className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your latest workspace updates
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((item) => {
                    const IconComponent = item.icon || Activity;
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div
                          className={`p-2 rounded-full ${item.color || 'bg-gray-100'}`}
                        >
                          <IconComponent className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {item.time}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.type}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400">
                      Start by creating a project or inviting team members
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <NewProjectModal
                  trigger={
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Project
                    </Button>
                  }
                />

                <InviteTeamModal />

                <Link href="/workspace-settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Workspace Settings
                  </Button>
                </Link>

                <Link href="/analytics">
                  <Button
                    variant="outline"
                    className="w-full justify-start mt-3"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Project Templates */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Project Templates</CardTitle>
                <CardDescription>
                  Quick start with pre-built templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {PROJECT_TEMPLATES.map((template) => {
                    const IconComponent = template.icon;
                    return (
                      <button
                        key={template.id}
                        onClick={() => createProjectFromTemplate(template)}
                        disabled={isCreatingProject}
                        className="p-4 border-2 rounded-lg text-center hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <IconComponent
                              className={`h-6 w-6 ${template.color} group-hover:text-blue-600 transition-colors`}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {template.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {template.tasks.length} tasks
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      Template Features:
                    </h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Pre-configured task lists</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Industry best practices</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Ready-to-use workflows</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Subscription Status</CardTitle>
                <CardDescription>Your current plan details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Plan</span>
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Professional
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Team members</span>
                      <span>{stats.teamMembers} / 25</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Storage used</span>
                      <span>24GB / 100GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Next billing</span>
                      <span>July 15, 2025</span>
                    </div>
                  </div>
                  <Link href="/subscription">
                    <Button variant="outline" className="w-full">
                      Manage Subscription
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
