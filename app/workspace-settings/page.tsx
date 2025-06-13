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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Building,
  Users,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Trash2,
  AlertTriangle,
  //   Link,
  Mail,
  Loader2,
  Edit,
  Plus,
  X,
  Check,
  UserPlus,
  Crown,
  Link2,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const TEAM_ROLES = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full access to all features',
  },
  {
    value: 'editor',
    label: 'Editor',
    description: 'Can edit projects and content',
  },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
  {
    value: 'guest',
    label: 'Guest',
    description: 'Limited access to specific projects',
  },
];

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Pending' | 'Inactive';
  avatar?: string;
  joinedDate: string;
}

export default function WorkspaceSettingsPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'editor',
  });

  const [settings, setSettings] = useState({
    // General
    workspaceName: 'My Workspace',
    workspaceDescription: 'A collaborative workspace for our team',
    workspaceUrl: 'my-workspace',

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    projectUpdates: true,

    // Security
    twoFactorAuth: false,
    sessionTimeout: '24',
    allowGuestAccess: true,

    // Appearance
    theme: 'light',
    accentColor: 'blue',

    // Integrations
    slackWebhook: '',
    discordWebhook: '',
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'Active',
      joinedDate: '2023-01-15',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'editor',
      status: 'Active',
      joinedDate: '2023-02-20',
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike@example.com',
      role: 'viewer',
      status: 'Pending',
      joinedDate: '2023-03-10',
    },
  ]);

  // Apply theme changes immediately
  useEffect(() => {
    const root = document.documentElement;

    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply accent color (this would be more sophisticated in a real app)
    root.style.setProperty('--accent-color', settings.accentColor);
  }, [settings.theme, settings.accentColor]);

  const addNotification = (
    title: string,
    message: string,
    type: string = 'settings'
  ) => {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      link: '/workspace-settings',
    };

    const existingNotifications = JSON.parse(
      localStorage.getItem('notifications') || '[]'
    );
    localStorage.setItem(
      'notifications',
      JSON.stringify([notification, ...existingNotifications])
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Add notification for workspace changes
      addNotification(
        'Workspace Settings Updated',
        `Workspace "${settings.workspaceName}" settings have been saved successfully`,
        'workspace'
      );

      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setShowEditMemberModal(true);
  };

  const handleSaveMemberEdit = async () => {
    if (!editingMember) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTeamMembers((prev) =>
        prev.map((member) =>
          member.id === editingMember.id ? editingMember : member
        )
      );

      addNotification(
        'Team Member Updated',
        `${editingMember.name}'s role has been updated to ${editingMember.role}`,
        'team'
      );

      setShowEditMemberModal(false);
      setEditingMember(null);
      toast.success('Team member updated successfully!');
    } catch (error) {
      toast.error('Failed to update team member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const member: TeamMember = {
        id: Date.now().toString(),
        ...newMember,
        status: 'Pending',
        joinedDate: new Date().toISOString().split('T')[0],
      };

      setTeamMembers((prev) => [...prev, member]);

      addNotification(
        'Team Member Invited',
        `${newMember.name} has been invited to join the workspace`,
        'team'
      );

      setShowAddMemberModal(false);
      setNewMember({ name: '', email: '', role: 'editor' });
      toast.success('Team member invited successfully!');
    } catch (error) {
      toast.error('Failed to invite team member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (!member) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));

      addNotification(
        'Team Member Removed',
        `${member.name} has been removed from the workspace`,
        'team'
      );

      toast.success('Team member removed successfully!');
    } catch (error) {
      toast.error('Failed to remove team member');
    } finally {
      setIsLoading(false);
    }
  };

  const getThemeColors = () => {
    switch (settings.theme) {
      case 'dark':
        return 'bg-gray-900 text-white';
      case 'light':
        return 'bg-white text-gray-900';
      default:
        return 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900';
    }
  };

  const getAccentColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      pink: 'bg-pink-500',
      indigo: 'bg-indigo-500',
      teal: 'bg-teal-500',
    };
    return colorMap[color] || 'bg-blue-500';
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${getThemeColors()}`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              ← Back to Dashboard
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
              Workspace Settings
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage your workspace configuration and preferences
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className={`${getAccentColorClass(settings.accentColor)} hover:opacity-90 text-white`}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Responsive Tab List */}
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-[600px] lg:min-w-0">
              <TabsTrigger
                value="general"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">General</span>
                <span className="sm:hidden">Gen</span>
              </TabsTrigger>
              <TabsTrigger
                value="team"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Team</span>
                <span className="sm:hidden">Team</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Notif</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Security</span>
                <span className="sm:hidden">Sec</span>
              </TabsTrigger>
              <TabsTrigger
                value="integrations"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Link2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Integrations</span>
                <span className="sm:hidden">Int</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Information</CardTitle>
                  <CardDescription>
                    Basic information about your workspace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="workspaceName">Workspace Name</Label>
                    <Input
                      id="workspaceName"
                      value={settings.workspaceName}
                      onChange={(e) =>
                        updateSetting('workspaceName', e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="workspaceDescription">Description</Label>
                    <Textarea
                      id="workspaceDescription"
                      value={settings.workspaceDescription}
                      onChange={(e) =>
                        updateSetting('workspaceDescription', e.target.value)
                      }
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="workspaceUrl">Workspace URL</Label>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500 mr-2 hidden sm:inline">
                        https://app.example.com/
                      </span>
                      <span className="text-sm text-gray-500 mr-2 sm:hidden">
                        .../
                      </span>
                      <Input
                        id="workspaceUrl"
                        value={settings.workspaceUrl}
                        onChange={(e) =>
                          updateSetting('workspaceUrl', e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize the look and feel of your workspace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['light', 'dark', 'auto'].map((theme) => (
                        <Button
                          key={theme}
                          variant={
                            settings.theme === theme ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => updateSetting('theme', theme)}
                          className="capitalize"
                        >
                          {theme}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Accent Color</Label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2">
                      {[
                        'blue',
                        'purple',
                        'green',
                        'orange',
                        'red',
                        'pink',
                        'indigo',
                        'teal',
                      ].map((color) => (
                        <button
                          key={color}
                          onClick={() => updateSetting('accentColor', color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                            settings.accentColor === color
                              ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400'
                              : 'border-gray-300'
                          } ${getAccentColorClass(color)}`}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Theme Preview */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Preview</h4>
                    <div className={`p-3 rounded ${getThemeColors()} border`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getAccentColorClass(settings.accentColor)}`}
                        ></div>
                        <span className="text-sm font-medium">
                          Sample Content
                        </span>
                      </div>
                      <p className="text-xs opacity-75">
                        This is how your workspace will look
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Settings */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage your team members and their permissions
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddMemberModal(true)}
                    className={`${getAccentColorClass(settings.accentColor)} hover:opacity-90 text-white`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{member.name}</h4>
                            {member.role === 'admin' && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {member.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            Joined{' '}
                            {new Date(member.joinedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Badge
                          variant={
                            member.status === 'Active' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {member.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {member.role}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMember(member)}
                            className="text-xs px-2"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          {member.role !== 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-xs px-2 text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about workspace activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) =>
                        updateSetting('emailNotifications', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-600">
                        Receive browser push notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) =>
                        updateSetting('pushNotifications', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-gray-600">
                        Get a weekly summary of activity
                      </p>
                    </div>
                    <Switch
                      checked={settings.weeklyDigest}
                      onCheckedChange={(checked) =>
                        updateSetting('weeklyDigest', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Project Updates</Label>
                      <p className="text-sm text-gray-600">
                        Notifications for project changes
                      </p>
                    </div>
                    <Switch
                      checked={settings.projectUpdates}
                      onCheckedChange={(checked) =>
                        updateSetting('projectUpdates', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage security and access controls for your workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) =>
                        updateSetting('twoFactorAuth', checked)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="sessionTimeout">
                      Session Timeout (hours)
                    </Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) =>
                        updateSetting('sessionTimeout', e.target.value)
                      }
                      className="mt-1 w-full sm:w-32"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Guest Access</Label>
                      <p className="text-sm text-gray-600">
                        Let guests view public projects
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowGuestAccess}
                      onCheckedChange={(checked) =>
                        updateSetting('allowGuestAccess', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that will affect your workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Workspace
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Integrations</CardTitle>
                <CardDescription>
                  Connect your workspace with external services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                  <Input
                    id="slackWebhook"
                    value={settings.slackWebhook}
                    onChange={(e) =>
                      updateSetting('slackWebhook', e.target.value)
                    }
                    placeholder="https://hooks.slack.com/services/..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="discordWebhook">Discord Webhook URL</Label>
                  <Input
                    id="discordWebhook"
                    value={settings.discordWebhook}
                    onChange={(e) =>
                      updateSetting('discordWebhook', e.target.value)
                    }
                    placeholder="https://discord.com/api/webhooks/..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Integrations</CardTitle>
                <CardDescription>
                  Connect with popular tools and services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      name: 'Google Workspace',
                      status: 'Connected',
                      icon: Mail,
                    },
                    {
                      name: 'Microsoft Teams',
                      status: 'Available',
                      icon: Users,
                    },
                    { name: 'Trello', status: 'Available', icon: Globe },
                    { name: 'GitHub', status: 'Available', icon: Globe },
                  ].map((integration, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <integration.icon className="h-6 w-6 text-gray-600" />
                        <span className="font-medium">{integration.name}</span>
                      </div>
                      <Button
                        variant={
                          integration.status === 'Connected'
                            ? 'outline'
                            : 'default'
                        }
                        size="sm"
                      >
                        {integration.status === 'Connected'
                          ? 'Disconnect'
                          : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Member Modal */}
        <Dialog
          open={showEditMemberModal}
          onOpenChange={setShowEditMemberModal}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
              <DialogDescription>
                Update team member role and permissions
              </DialogDescription>
            </DialogHeader>
            {editingMember && (
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editingMember.name}
                    onChange={(e) =>
                      setEditingMember((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={editingMember.email}
                    onChange={(e) =>
                      setEditingMember((prev) =>
                        prev ? { ...prev, email: e.target.value } : null
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select
                    value={editingMember.role}
                    onValueChange={(value) =>
                      setEditingMember((prev) =>
                        prev ? { ...prev, role: value } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-xs text-gray-500">
                              {role.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditMemberModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveMemberEdit} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Member Modal */}
        <Dialog open={showAddMemberModal} onOpenChange={setShowAddMemberModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Invite a new member to your workspace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select
                  value={newMember.role}
                  onValueChange={(value) =>
                    setNewMember((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-gray-500">
                            {role.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddMemberModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddMember} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <UserPlus className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
