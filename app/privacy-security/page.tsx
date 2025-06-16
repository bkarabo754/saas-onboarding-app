'use client';

import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Shield,
  Lock,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Users,
  FileText,
  Settings,
  Loader2,
  QrCode,
  Copy,
  RefreshCw,
  Activity,
  Database,
  UserX,
  Mail,
  Bell,
  Fingerprint,
  Zap,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import jsPDF from 'jspdf';
import { useRouter } from 'next/navigation';

interface SecurityEvent {
  id: string;
  type:
    | 'login'
    | 'password_change'
    | 'device_added'
    | 'data_export'
    | 'permission_change';
  description: string;
  timestamp: string;
  location: string;
  device: string;
  status: 'success' | 'failed' | 'pending';
}

interface ConnectedDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export default function PrivacySecurityPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // Separate loading states for different actions
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'team',
    activityTracking: true,
    dataCollection: true,
    marketingEmails: false,
    analyticsSharing: true,
    thirdPartyIntegrations: true,
    sessionTimeout: '24',
    twoFactorAuth: false,
    loginNotifications: true,
    deviceTracking: true,
    dataRetention: '2years',
    cookiePreferences: 'essential',
  });

  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'login',
      description: 'Successful login',
      timestamp: '2025-01-15T10:30:00Z',
      location: 'South Africa, ZA',
      device: 'Chrome on Windows',
      status: 'success',
    },
    {
      id: '2',
      type: 'password_change',
      description: 'Password updated',
      timestamp: '2025-05-14T15:45:00Z',
      location: 'South Africa, ZA',
      device: 'Chrome on Windows',
      status: 'success',
    },
    {
      id: '3',
      type: 'device_added',
      description: 'New device authorized',
      timestamp: '2025-06-13T09:15:00Z',
      location: 'South Africa, ZA',
      device: 'Safari on iPhone',
      status: 'success',
    },
    {
      id: '4',
      type: 'login',
      description: 'Failed login attempt',
      timestamp: '2025-04-12T22:30:00Z',
      location: 'Unknown',
      device: 'Chrome on Linux',
      status: 'failed',
    },
  ]);

  const [connectedDevices] = useState<ConnectedDevice[]>([
    {
      id: '1',
      name: 'MacBook Pro',
      type: 'desktop',
      browser: 'Chrome 120',
      location: 'South Africa, ZA',
      lastActive: '2025-06-16T10:30:00Z',
      current: true,
    },
    {
      id: '2',
      name: 'iPhone 15',
      type: 'mobile',
      browser: 'Safari Mobile',
      location: 'South Africa, ZA',
      lastActive: '2025-06-15T08:15:00Z',
      current: false,
    },
    {
      id: '3',
      name: 'iPad Air',
      type: 'tablet',
      browser: 'Safari',
      location: 'South Africa, ZA',
      lastActive: '2025-05-26T16:45:00Z',
      current: false,
    },
  ]);

  const updateSetting = (key: string, value: any) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSaveLoading(true); // Use separate loading state
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Add notification
      const notification = {
        id: Date.now().toString(),
        type: 'security',
        title: 'Privacy Settings Updated',
        message:
          'Your privacy and security settings have been updated successfully',
        timestamp: new Date(),
        read: false,
        link: '/privacy-security',
      };

      const existingNotifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );
      localStorage.setItem(
        'notifications',
        JSON.stringify([notification, ...existingNotifications])
      );

      toast.success('Privacy and security settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaveLoading(false); // Clear only save loading state
    }
  };

  const handleEnable2FA = async () => {
    setIs2FALoading(true); // Use separate loading state for 2FA
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate backup codes
      const codes = Array.from({ length: 8 }, () =>
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(codes);
      setShowBackupCodes(true);

      updateSetting('twoFactorAuth', true);
      setShowTwoFactorModal(false);
      setShow2FASetup(false);

      toast.success('Two-factor authentication enabled successfully!');
    } catch (error) {
      toast.error('Failed to enable 2FA');
    } finally {
      setIs2FALoading(false); // Clear only 2FA loading state
    }
  };

  const handleExportData = async () => {
    setIsExportLoading(true); // Use separate loading state for export
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create PDF document
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;

      // Helper function to add text with word wrapping
      const addText = (
        text: string,
        x: number,
        y: number,
        maxWidth?: number
      ) => {
        if (maxWidth) {
          const lines = pdf.splitTextToSize(text, maxWidth);
          pdf.text(lines, x, y);
          return y + lines.length * 7;
        } else {
          pdf.text(text, x, y);
          return y + 7;
        }
      };

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Privacy & Security Data Export', margin, yPosition);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(
        `Generated on: ${new Date().toLocaleString()}`,
        margin,
        yPosition + 10
      );
      yPosition = addText(
        `User: ${user?.fullName || 'N/A'}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Email: ${user?.emailAddresses[0]?.emailAddress || 'N/A'}`,
        margin,
        yPosition
      );

      // Account Information
      yPosition += 15;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Account Information', margin, yPosition);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(
        `Account Created: ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}`,
        margin,
        yPosition + 5
      );
      yPosition = addText(
        `Last Updated: ${new Date().toLocaleDateString()}`,
        margin,
        yPosition
      );

      // Privacy Settings
      yPosition += 15;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Privacy Settings', margin, yPosition);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(
        `Profile Visibility: ${privacySettings.profileVisibility}`,
        margin,
        yPosition + 5
      );
      yPosition = addText(
        `Activity Tracking: ${privacySettings.activityTracking ? 'Enabled' : 'Disabled'}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Data Collection: ${privacySettings.dataCollection ? 'Enabled' : 'Disabled'}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Marketing Emails: ${privacySettings.marketingEmails ? 'Enabled' : 'Disabled'}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Analytics Sharing: ${privacySettings.analyticsSharing ? 'Enabled' : 'Disabled'}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Third-party Integrations: ${privacySettings.thirdPartyIntegrations ? 'Enabled' : 'Disabled'}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Data Retention: ${privacySettings.dataRetention}`,
        margin,
        yPosition
      );

      // Security Settings
      yPosition += 15;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Security Settings', margin, yPosition);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(
        `Two-Factor Authentication: ${privacySettings.twoFactorAuth ? 'Enabled' : 'Disabled'}`,
        margin,
        yPosition + 5
      );
      yPosition = addText(
        `Session Timeout: ${privacySettings.sessionTimeout} hours`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Login Notifications: ${privacySettings.loginNotifications ? 'Enabled' : 'Disabled'}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Device Tracking: ${privacySettings.deviceTracking ? 'Enabled' : 'Disabled'}`,
        margin,
        yPosition
      );

      // Connected Devices
      yPosition += 15;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Connected Devices', margin, yPosition);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      connectedDevices.forEach((device, index) => {
        if (yPosition > 250) {
          // Check if we need a new page
          pdf.addPage();
          yPosition = 30;
        }
        yPosition = addText(
          `${index + 1}. ${device.name} (${device.browser})`,
          margin,
          yPosition + 5
        );
        yPosition = addText(
          `   Location: ${device.location}`,
          margin + 10,
          yPosition
        );
        yPosition = addText(
          `   Last Active: ${new Date(device.lastActive).toLocaleString()}`,
          margin + 10,
          yPosition
        );
        yPosition = addText(
          `   Status: ${device.current ? 'Current Device' : 'Other Device'}`,
          margin + 10,
          yPosition
        );
      });

      // Security Events
      yPosition += 15;
      if (yPosition > 200) {
        // Check if we need a new page
        pdf.addPage();
        yPosition = 30;
      }
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Recent Security Events', margin, yPosition);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      securityEvents.slice(0, 10).forEach((event, index) => {
        if (yPosition > 250) {
          // Check if we need a new page
          pdf.addPage();
          yPosition = 30;
        }
        yPosition = addText(
          `${index + 1}. ${event.description}`,
          margin,
          yPosition + 5
        );
        yPosition = addText(
          `   Date: ${new Date(event.timestamp).toLocaleString()}`,
          margin + 10,
          yPosition
        );
        yPosition = addText(
          `   Device: ${event.device}`,
          margin + 10,
          yPosition
        );
        yPosition = addText(
          `   Location: ${event.location}`,
          margin + 10,
          yPosition
        );
        yPosition = addText(
          `   Status: ${event.status.toUpperCase()}`,
          margin + 10,
          yPosition
        );
      });

      // Footer
      const pageCount = pdf.getNumberOfPages();
      const pageHeight = pdf.internal.pageSize.getHeight();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
        pdf.text(
          'Getting Started Guide - Confidential',
          margin,
          pageHeight - 10
        );
      }

      // Save the PDF
      const fileName = `privacy-security-export-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Add notification
      const notification = {
        id: Date.now().toString(),
        type: 'security',
        title: 'Data Export Completed',
        message: 'Your privacy and security data has been exported as a PDF',
        timestamp: new Date(),
        read: false,
        link: '/privacy-security',
      };

      const existingNotifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );
      localStorage.setItem(
        'notifications',
        JSON.stringify([notification, ...existingNotifications])
      );

      toast.success('Privacy and security data exported successfully as PDF!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExportLoading(false); // Clear only export loading state
    }
  };

  const handleDeleteAccount = async () => {
    // STRICT VALIDATION: Must be exactly "DELETE" in uppercase
    if (deleteConfirmation !== 'DELETE') {
      toast.error(
        'Please type "DELETE" exactly in uppercase to confirm account deletion'
      );
      return;
    }

    setIsDeleteLoading(true); // Use separate loading state for delete
    try {
      // Call the delete account API
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmation: deleteConfirmation,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Clear all local storage
        localStorage.clear();
        sessionStorage.clear();

        // Show success message
        toast.success(
          'Account deleted successfully. You will be redirected to the sign-up page.'
        );

        // Close modal
        setShowDeleteModal(false);
        setDeleteConfirmation('');

        // Sign out and redirect to sign-up page
        await signOut();

        // Small delay to ensure sign out completes
        setTimeout(() => {
          router.push('/sign-up');
        }, 1000);
      } else {
        throw new Error(result.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete account'
      );
    } finally {
      setIsDeleteLoading(false); // Clear only delete loading state
    }
  };

  const copyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Backup code copied to clipboard');
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return Activity;
      case 'password_change':
        return Key;
      case 'device_added':
        return Smartphone;
      case 'data_export':
        return Download;
      case 'permission_change':
        return Settings;
      default:
        return Activity;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop':
        return Globe;
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Globe;
      default:
        return Globe;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSecurityScore = () => {
    let score = 0;
    if (privacySettings.twoFactorAuth) score += 30;
    if (privacySettings.loginNotifications) score += 20;
    if (privacySettings.deviceTracking) score += 15;
    if (parseInt(privacySettings.sessionTimeout) <= 8) score += 15;
    if (!privacySettings.marketingEmails) score += 10;
    if (privacySettings.profileVisibility === 'private') score += 10;
    return Math.min(score, 100);
  };

  // STRICT VALIDATION: Check if DELETE is typed exactly in uppercase
  const isDeleteConfirmed = deleteConfirmation === 'DELETE';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              ← Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="h-8 w-8" />
              Privacy & Security
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your privacy settings and security preferences
            </p>
          </div>
        </div>

        {/* Security Score */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Security Score</h3>
                <p className="text-sm text-gray-600">
                  Your account security rating
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {getSecurityScore()}%
                </div>
                <Badge
                  className={
                    getSecurityScore() >= 80
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }
                >
                  {getSecurityScore() >= 80 ? 'Excellent' : 'Good'}
                </Badge>
              </div>
            </div>
            <Progress value={getSecurityScore()} className="h-3" />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle
                  className={`h-4 w-4 ${privacySettings.twoFactorAuth ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span>Two-Factor Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle
                  className={`h-4 w-4 ${privacySettings.loginNotifications ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span>Login Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle
                  className={`h-4 w-4 ${parseInt(privacySettings.sessionTimeout) <= 8 ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span>Secure Session Timeout</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="privacy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Profile Visibility
                  </CardTitle>
                  <CardDescription>
                    Control who can see your profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Profile Visibility</Label>
                    <Select
                      value={privacySettings.profileVisibility}
                      onValueChange={(value) =>
                        updateSetting('profileVisibility', value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          Public - Anyone can see
                        </SelectItem>
                        <SelectItem value="team">
                          Team Only - Team members only
                        </SelectItem>
                        <SelectItem value="private">
                          Private - Only you
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Activity Tracking</Label>
                      <p className="text-sm text-gray-600">
                        Track your workspace activity
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.activityTracking}
                      onCheckedChange={(checked) =>
                        updateSetting('activityTracking', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Analytics Sharing</Label>
                      <p className="text-sm text-gray-600">
                        Share anonymous usage data
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.analyticsSharing}
                      onCheckedChange={(checked) =>
                        updateSetting('analyticsSharing', checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Communication Preferences
                  </CardTitle>
                  <CardDescription>
                    Manage how we communicate with you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-gray-600">
                        Receive product updates and offers
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.marketingEmails}
                      onCheckedChange={(checked) =>
                        updateSetting('marketingEmails', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Third-party Integrations</Label>
                      <p className="text-sm text-gray-600">
                        Allow data sharing with integrations
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.thirdPartyIntegrations}
                      onCheckedChange={(checked) =>
                        updateSetting('thirdPartyIntegrations', checked)
                      }
                    />
                  </div>

                  <div>
                    <Label>Data Retention</Label>
                    <Select
                      value={privacySettings.dataRetention}
                      onValueChange={(value) =>
                        updateSetting('dataRetention', value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="2years">2 Years</SelectItem>
                        <SelectItem value="5years">5 Years</SelectItem>
                        <SelectItem value="forever">Forever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Authentication
                  </CardTitle>
                  <CardDescription>
                    Secure your account with additional protection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-600">
                        Add extra security to your account
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {privacySettings.twoFactorAuth && (
                        <Badge className="bg-green-100 text-green-800">
                          Enabled
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTwoFactorModal(true)}
                      >
                        {privacySettings.twoFactorAuth ? 'Manage' : 'Enable'}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sessionTimeout">
                      Session Timeout (hours)
                    </Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={privacySettings.sessionTimeout}
                      onChange={(e) =>
                        updateSetting('sessionTimeout', e.target.value)
                      }
                      className="mt-1 w-32"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Login Notifications</Label>
                      <p className="text-sm text-gray-600">
                        Get notified of new logins
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.loginNotifications}
                      onCheckedChange={(checked) =>
                        updateSetting('loginNotifications', checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Connected Devices
                  </CardTitle>
                  <CardDescription>
                    Manage devices that have access to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {connectedDevices.map((device) => {
                      const DeviceIcon = getDeviceIcon(device.type);
                      return (
                        <div
                          key={device.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <DeviceIcon className="h-5 w-5 text-gray-600" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {device.name}
                                </span>
                                {device.current && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {device.browser}
                              </p>
                              <p className="text-xs text-gray-500">
                                {device.location} •{' '}
                                {formatDate(device.lastActive)}
                              </p>
                            </div>
                          </div>
                          {!device.current && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Security Activity
                </CardTitle>
                <CardDescription>
                  Recent security events and account activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityEvents.map((event) => {
                    const EventIcon = getEventIcon(event.type);
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div
                          className={`p-2 rounded-full ${
                            event.status === 'success'
                              ? 'bg-green-100'
                              : event.status === 'failed'
                                ? 'bg-red-100'
                                : 'bg-yellow-100'
                          }`}
                        >
                          <EventIcon
                            className={`h-4 w-4 ${
                              event.status === 'success'
                                ? 'text-green-600'
                                : event.status === 'failed'
                                  ? 'text-red-600'
                                  : 'text-yellow-600'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{event.description}</h4>
                          <p className="text-sm text-gray-600">
                            {event.device}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(event.timestamp)} • {event.location}
                          </p>
                        </div>
                        <Badge
                          variant={
                            event.status === 'success'
                              ? 'default'
                              : event.status === 'failed'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {event.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Data Export
                  </CardTitle>
                  <CardDescription>
                    Download a comprehensive PDF report of your data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      PDF Export includes:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Account information and settings</li>
                      <li>• Privacy and security preferences</li>
                      <li>• Connected devices and sessions</li>
                      <li>• Recent security activity log</li>
                      <li>• Data retention and sharing settings</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleExportData}
                    disabled={isExportLoading} // Only disable when export is loading
                    className="w-full"
                  >
                    {isExportLoading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    <Download className="h-4 w-4 mr-2" />
                    Export Data as PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <UserX className="h-5 w-5" />
                    Delete Account
                  </CardTitle>
                  <CardDescription>
                    Permanently delete your account and all data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Warning</h4>
                    <p className="text-sm text-red-700">
                      This action cannot be undone. All your data will be
                      permanently deleted.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaveLoading} // Only disable when save is loading
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSaveLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Shield className="h-4 w-4 mr-2" />
            Save Security Settings
          </Button>
        </div>

        {/* Two-Factor Authentication Modal */}
        <Dialog open={showTwoFactorModal} onOpenChange={setShowTwoFactorModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5" />
                Two-Factor Authentication
              </DialogTitle>
              <DialogDescription>
                {privacySettings.twoFactorAuth
                  ? 'Manage your two-factor authentication settings'
                  : 'Secure your account with two-factor authentication'}
              </DialogDescription>
            </DialogHeader>

            {!privacySettings.twoFactorAuth ? (
              <div className="space-y-4">
                {!show2FASetup ? (
                  <>
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Enhanced Security</h3>
                      <p className="text-sm text-gray-600">
                        Two-factor authentication adds an extra layer of
                        security to your account.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Benefits:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Protect against unauthorized access</li>
                        <li>• Secure your sensitive data</li>
                        <li>• Get notified of login attempts</li>
                        <li>• Peace of mind</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">
                        Scan this QR code with your authenticator app
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="2faCode">Enter verification code</Label>
                      <Input
                        id="2faCode"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        placeholder="000000"
                        className="mt-1 text-center text-lg tracking-widest"
                        maxLength={6}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800">
                    Two-factor authentication is enabled
                  </span>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate Backup Codes
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Disable 2FA
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowTwoFactorModal(false)}
              >
                Cancel
              </Button>
              {!privacySettings.twoFactorAuth && (
                <Button
                  onClick={
                    show2FASetup ? handleEnable2FA : () => setShow2FASetup(true)
                  }
                  disabled={
                    is2FALoading || (show2FASetup && twoFactorCode.length !== 6)
                  } // Use separate 2FA loading state
                >
                  {is2FALoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {show2FASetup ? 'Enable 2FA' : 'Set Up 2FA'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Backup Codes Modal */}
        <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Backup Codes</DialogTitle>
              <DialogDescription>
                Save these backup codes in a safe place. You can use them to
                access your account if you lose your authenticator device.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                  >
                    <code className="font-mono text-sm">{code}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyBackupCode(code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Each backup code can only be used
                  once. Store them securely and don't share them with anyone.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowBackupCodes(false)}>
                I've Saved My Codes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Account Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Delete Account
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. All your data will be permanently
                deleted and you will be logged out.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">
                  What will be permanently deleted:
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Your profile and account information</li>
                  <li>• All projects and workspace data</li>
                  <li>• Team memberships and permissions</li>
                  <li>• Billing history and subscription</li>
                  <li>• All uploaded files and documents</li>
                  <li>• Security settings and connected devices</li>
                  <li>• All notifications and activity history</li>
                </ul>
              </div>
              <div>
                <Label htmlFor="confirmDelete">
                  Type "DELETE" to confirm *
                </Label>
                <Input
                  id="confirmDelete"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className={`mt-1 ${
                    deleteConfirmation && deleteConfirmation !== 'DELETE'
                      ? 'border-red-300 focus:border-red-500'
                      : deleteConfirmation === 'DELETE'
                        ? 'border-green-300 focus:border-green-500'
                        : ''
                  }`}
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">
                    You must type "DELETE" exactly in uppercase to enable the
                    delete button
                  </p>
                  {deleteConfirmation && deleteConfirmation !== 'DELETE' && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Must be exactly "DELETE" in uppercase
                    </p>
                  )}
                  {deleteConfirmation === 'DELETE' && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Confirmation verified
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeleteLoading || !isDeleteConfirmed} // Use separate delete loading state
                className={`${
                  !isDeleteConfirmed
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-red-700'
                }`}
              >
                {isDeleteLoading && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Delete Account Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
