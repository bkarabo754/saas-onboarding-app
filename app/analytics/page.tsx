'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Clock,
  Target,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Minus,
} from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Pending' | 'Inactive';
  avatar?: string;
  joinedDate: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  template: string;
  templateName: string;
  tasks: string[];
  createdAt: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  progress: number;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  teamMembers: string[];
}

interface ProductivityPeriod {
  label: string;
  tasksCompleted: number;
  projectsCreated: number;
  teamActivity: number;
  efficiency: number;
  relativeTasksBar: number;
  relativeProjectsBar: number;
  relativeActivityBar: number;
  relativeEfficiencyBar: number;
}

interface GrowthMetric {
  name: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  isPositive: boolean;
  unit: string;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [productivityTrends, setProductivityTrends] = useState<
    ProductivityPeriod[]
  >([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      const storedTeamMembers = JSON.parse(
        localStorage.getItem('teamMembers') || '[]'
      );
      const storedProjects = JSON.parse(
        localStorage.getItem('projects') || '[]'
      );

      setTeamMembers(storedTeamMembers);
      setProjects(storedProjects);
    };

    loadData();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teamMembers' || e.key === 'projects') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // Fixed: Empty dependency array

  // Calculate analytics data when timeRange, teamMembers, or projects change
  useEffect(() => {
    calculateAnalyticsData();
  }, [timeRange, teamMembers, projects]); // Fixed: Consistent dependency array

  const calculateAnalyticsData = () => {
    // Calculate productivity trends
    const trends = calculateProductivityTrends();
    setProductivityTrends(trends);

    // Calculate growth metrics
    const metrics = calculateGrowthMetrics();
    setGrowthMetrics(metrics);
  };

  const getTimeRangeDetails = () => {
    const now = new Date();
    let periods: { start: Date; end: Date; label: string }[] = [];

    switch (timeRange) {
      case '7d':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          periods.push({
            start: new Date(date.setHours(0, 0, 0, 0)),
            end: new Date(date.setHours(23, 59, 59, 999)),
            label:
              i === 0
                ? 'Today'
                : i === 1
                  ? 'Yesterday'
                  : date.toLocaleDateString('en-US', { weekday: 'short' }),
          });
        }
        break;
      case '30d':
        for (let i = 3; i >= 0; i--) {
          const startDate = new Date(now);
          startDate.setDate(startDate.getDate() - (i + 1) * 7);
          const endDate = new Date(now);
          endDate.setDate(endDate.getDate() - i * 7);
          periods.push({
            start: startDate,
            end: endDate,
            label:
              i === 0 ? 'This Week' : `${i + 1} Week${i > 0 ? 's' : ''} Ago`,
          });
        }
        break;
      case '90d':
        for (let i = 2; i >= 0; i--) {
          const startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - (i + 1));
          const endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() - i);
          periods.push({
            start: startDate,
            end: endDate,
            label:
              i === 0 ? 'This Month' : `${i + 1} Month${i > 0 ? 's' : ''} Ago`,
          });
        }
        break;
      case '1y':
        for (let i = 3; i >= 0; i--) {
          const startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - (i + 1) * 3);
          const endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() - i * 3);
          periods.push({
            start: startDate,
            end: endDate,
            label: i === 0 ? 'This Quarter' : `Q${4 - i} ${now.getFullYear()}`,
          });
        }
        break;
      default:
        periods = [];
    }

    return periods;
  };

  const calculateProductivityTrends = (): ProductivityPeriod[] => {
    const periods = getTimeRangeDetails();

    if (periods.length === 0) return [];

    const trends = periods.map((period) => {
      // Calculate projects created in this period
      const projectsInPeriod = projects.filter((project) => {
        const createdDate = new Date(project.createdAt);
        return createdDate >= period.start && createdDate <= period.end;
      });

      // Calculate team members joined in this period
      const teamMembersInPeriod = teamMembers.filter((member) => {
        const joinedDate = new Date(member.joinedDate);
        return joinedDate >= period.start && joinedDate <= period.end;
      });

      // Calculate tasks (based on projects created)
      const tasksCompleted = projectsInPeriod.reduce(
        (sum, project) => sum + project.tasks.length,
        0
      );

      // Calculate team activity (new members + project activity)
      const teamActivity = teamMembersInPeriod.length + projectsInPeriod.length;

      // Calculate efficiency (based on completed projects vs total projects)
      const completedProjects = projectsInPeriod.filter(
        (p) => p.status === 'completed'
      ).length;
      const efficiency =
        projectsInPeriod.length > 0
          ? Math.round((completedProjects / projectsInPeriod.length) * 100)
          : 0;

      return {
        label: period.label,
        tasksCompleted,
        projectsCreated: projectsInPeriod.length,
        teamActivity,
        efficiency,
        relativeTasksBar: 0,
        relativeProjectsBar: 0,
        relativeActivityBar: 0,
        relativeEfficiencyBar: 0,
      };
    });

    // Calculate relative bars (percentage of max value)
    const maxTasks = Math.max(...trends.map((t) => t.tasksCompleted), 1);
    const maxProjects = Math.max(...trends.map((t) => t.projectsCreated), 1);
    const maxActivity = Math.max(...trends.map((t) => t.teamActivity), 1);
    const maxEfficiency = Math.max(...trends.map((t) => t.efficiency), 1);

    return trends.map((trend) => ({
      ...trend,
      relativeTasksBar: Math.round((trend.tasksCompleted / maxTasks) * 100),
      relativeProjectsBar: Math.round(
        (trend.projectsCreated / maxProjects) * 100
      ),
      relativeActivityBar: Math.round((trend.teamActivity / maxActivity) * 100),
      relativeEfficiencyBar: Math.round(
        (trend.efficiency / maxEfficiency) * 100
      ),
    }));
  };

  const calculateGrowthMetrics = (): GrowthMetric[] => {
    const periods = getTimeRangeDetails();

    if (periods.length < 2) {
      return [
        {
          name: 'Project Completion Rate',
          current: 0,
          previous: 0,
          change: 0,
          trend: 'stable',
          isPositive: true,
          unit: '%',
        },
        {
          name: 'Team Productivity',
          current: 0,
          previous: 0,
          change: 0,
          trend: 'stable',
          isPositive: true,
          unit: ' tasks/week',
        },
        {
          name: 'Task Completion Time',
          current: 0,
          previous: 0,
          change: 0,
          trend: 'stable',
          isPositive: false,
          unit: ' days',
        },
        {
          name: 'Team Efficiency',
          current: 0,
          previous: 0,
          change: 0,
          trend: 'stable',
          isPositive: true,
          unit: '%',
        },
      ];
    }

    const currentPeriod = periods[periods.length - 1];
    const previousPeriod = periods[periods.length - 2];

    // Calculate current period metrics
    const currentProjects = projects.filter((project) => {
      const createdDate = new Date(project.createdAt);
      return (
        createdDate >= currentPeriod.start && createdDate <= currentPeriod.end
      );
    });

    const currentCompleted = currentProjects.filter(
      (p) => p.status === 'completed'
    ).length;
    const currentCompletionRate =
      currentProjects.length > 0
        ? Math.round((currentCompleted / currentProjects.length) * 100)
        : 0;
    const currentTasks = currentProjects.reduce(
      (sum, project) => sum + project.tasks.length,
      0
    );
    const currentAvgTime =
      currentProjects.length > 0 ? Math.round(Math.random() * 5 + 2) : 0; // Simulated
    const currentEfficiency =
      teamMembers.length > 0
        ? Math.round((currentTasks / teamMembers.length) * 10)
        : 0;

    // Calculate previous period metrics
    const previousProjects = projects.filter((project) => {
      const createdDate = new Date(project.createdAt);
      return (
        createdDate >= previousPeriod.start && createdDate <= previousPeriod.end
      );
    });

    const previousCompleted = previousProjects.filter(
      (p) => p.status === 'completed'
    ).length;
    const previousCompletionRate =
      previousProjects.length > 0
        ? Math.round((previousCompleted / previousProjects.length) * 100)
        : 0;
    const previousTasks = previousProjects.reduce(
      (sum, project) => sum + project.tasks.length,
      0
    );
    const previousAvgTime =
      previousProjects.length > 0 ? Math.round(Math.random() * 5 + 2) : 0; // Simulated
    const previousEfficiency =
      teamMembers.length > 0
        ? Math.round((previousTasks / teamMembers.length) * 10)
        : 0;

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const getTrend = (change: number): 'up' | 'down' | 'stable' => {
      if (Math.abs(change) < 5) return 'stable';
      return change > 0 ? 'up' : 'down';
    };

    return [
      {
        name: 'Project Completion Rate',
        current: currentCompletionRate,
        previous: previousCompletionRate,
        change: calculateChange(currentCompletionRate, previousCompletionRate),
        trend: getTrend(
          calculateChange(currentCompletionRate, previousCompletionRate)
        ),
        isPositive: true,
        unit: '%',
      },
      {
        name: 'Team Productivity',
        current: currentTasks,
        previous: previousTasks,
        change: calculateChange(currentTasks, previousTasks),
        trend: getTrend(calculateChange(currentTasks, previousTasks)),
        isPositive: true,
        unit: ' tasks',
      },
      {
        name: 'Task Completion Time',
        current: currentAvgTime,
        previous: previousAvgTime,
        change: calculateChange(currentAvgTime, previousAvgTime),
        trend: getTrend(calculateChange(currentAvgTime, previousAvgTime)),
        isPositive: false, // Lower is better for completion time
        unit: ' days',
      },
      {
        name: 'Team Efficiency',
        current: currentEfficiency,
        previous: previousEfficiency,
        change: calculateChange(currentEfficiency, previousEfficiency),
        trend: getTrend(calculateChange(currentEfficiency, previousEfficiency)),
        isPositive: true,
        unit: '%',
      },
    ];
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      calculateAnalyticsData();
      toast.success('Analytics data refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh analytics data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create PDF document
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;

      // Helper function to add text
      const addText = (text: string, x: number, y: number, options?: any) => {
        pdf.text(text, x, y, options);
        return y + 7;
      };

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Analytics Dashboard Report', margin, yPosition);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(
        `Generated on: ${new Date().toLocaleString()}`,
        margin,
        yPosition + 10
      );
      yPosition = addText(`Time Range: ${timeRange}`, margin, yPosition);
      yPosition = addText(
        `Total Team Members: ${teamMembers.length}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Total Projects: ${projects.length}`,
        margin,
        yPosition
      );

      // Key Metrics
      yPosition += 15;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Key Metrics', margin, yPosition);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(
        `Total Projects: ${projects.length}`,
        margin,
        yPosition + 5
      );
      yPosition = addText(
        `Completed Projects: ${projects.filter((p) => p.status === 'completed').length}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Active Projects: ${projects.filter((p) => p.status === 'active').length}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Team Members: ${teamMembers.length}`,
        margin,
        yPosition
      );
      yPosition = addText(
        `Total Tasks: ${projects.reduce((sum, p) => sum + p.tasks.length, 0)}`,
        margin,
        yPosition
      );

      // Productivity Trends
      yPosition += 15;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Productivity Trends', margin, yPosition);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      productivityTrends.forEach((trend, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        yPosition = addText(
          `${index + 1}. ${trend.label}`,
          margin,
          yPosition + 5
        );
        yPosition = addText(
          `   Tasks Completed: ${trend.tasksCompleted}`,
          margin + 10,
          yPosition
        );
        yPosition = addText(
          `   Projects Created: ${trend.projectsCreated}`,
          margin + 10,
          yPosition
        );
        yPosition = addText(
          `   Team Activity: ${trend.teamActivity}`,
          margin + 10,
          yPosition
        );
        yPosition = addText(
          `   Efficiency: ${trend.efficiency}%`,
          margin + 10,
          yPosition
        );
      });

      // Growth Metrics
      yPosition += 15;
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 30;
      }
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Growth Metrics', margin, yPosition);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      growthMetrics.forEach((metric, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        const trendSymbol =
          metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→';
        yPosition = addText(
          `${index + 1}. ${metric.name}`,
          margin,
          yPosition + 5
        );
        yPosition = addText(
          `   Current: ${metric.current}${metric.unit}`,
          margin + 10,
          yPosition
        );
        yPosition = addText(
          `   Previous: ${metric.previous}${metric.unit}`,
          margin + 10,
          yPosition
        );
        yPosition = addText(
          `   Change: ${metric.change > 0 ? '+' : ''}${metric.change}% ${trendSymbol}`,
          margin + 10,
          yPosition
        );
      });

      // Team Members
      yPosition += 15;
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 30;
      }
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Team Members', margin, yPosition);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      teamMembers.forEach((member, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        yPosition = addText(
          `${index + 1}. ${member.name} (${member.role})`,
          margin,
          yPosition + 5
        );
        yPosition = addText(
          `   Email: ${member.email}`,
          margin + 10,
          yPosition
        );
        yPosition = addText(
          `   Status: ${member.status}`,
          margin + 10,
          yPosition
        );
        yPosition = addText(
          `   Joined: ${new Date(member.joinedDate).toLocaleDateString()}`,
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
      const fileName = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success('Analytics report exported successfully!');
    } catch (error) {
      console.error('Error generating analytics report:', error);
      toast.error('Failed to export analytics report');
    } finally {
      setIsExporting(false);
    }
  };

  const getStats = () => {
    const totalProjects = projects.length;
    const completedTasks = projects.reduce(
      (sum, project) => sum + project.tasks.length,
      0
    );
    const teamMemberCount = teamMembers.length;
    const completedProjects = projects.filter(
      (p) => p.status === 'completed'
    ).length;
    const avgCompletionTime =
      totalProjects > 0 ? Math.round(Math.random() * 5 + 2) : 0; // Simulated

    return {
      totalProjects,
      completedTasks,
      teamMembers: teamMemberCount,
      avgCompletionTime,
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                ← Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="h-8 w-8" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Insights and metrics for your workspace performance
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Projects
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalProjects}
                  </p>
                  <div className="flex items-center mt-2">
                    {stats.totalProjects > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Active workspace
                        </span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-400">
                          No projects yet
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Completed Tasks
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.completedTasks}
                  </p>
                  <div className="flex items-center mt-2">
                    {stats.completedTasks > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          From {stats.totalProjects} projects
                        </span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-400">
                          No tasks yet
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Team Members
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.teamMembers}
                  </p>
                  <div className="flex items-center mt-2">
                    {stats.teamMembers > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Active team
                        </span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-400">
                          No team members
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg. Completion Time
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.avgCompletionTime}d
                  </p>
                  <div className="flex items-center mt-2">
                    {stats.avgCompletionTime > 0 ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Efficient delivery
                        </span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-400">
                          No data yet
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100"
            >
              Team Performance
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100"
            >
              Trends
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Project Status Distribution
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Current status of all projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No projects to analyze
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Create your first project to see analytics
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[
                        {
                          status: 'completed',
                          label: 'Completed',
                          color: 'bg-green-500',
                          bgColor: 'bg-green-100 dark:bg-green-900',
                          textColor: 'text-green-800 dark:text-green-200',
                        },
                        {
                          status: 'active',
                          label: 'In Progress',
                          color: 'bg-blue-500',
                          bgColor: 'bg-blue-100 dark:bg-blue-900',
                          textColor: 'text-blue-800 dark:text-blue-200',
                        },
                        {
                          status: 'paused',
                          label: 'Paused',
                          color: 'bg-yellow-500',
                          bgColor: 'bg-yellow-100 dark:bg-yellow-900',
                          textColor: 'text-yellow-800 dark:text-yellow-200',
                        },
                        {
                          status: 'archived',
                          label: 'Archived',
                          color: 'bg-gray-500',
                          bgColor: 'bg-gray-100 dark:bg-gray-900',
                          textColor: 'text-gray-800 dark:text-gray-200',
                        },
                      ].map((item) => {
                        const count = projects.filter(
                          (p) => p.status === item.status
                        ).length;
                        const percentage = Math.round(
                          (count / projects.length) * 100
                        );
                        return (
                          <div
                            key={item.status}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 ${item.color} rounded-full`}
                              ></div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {item.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {count} projects
                              </span>
                              <Badge
                                className={`${item.bgColor} ${item.textColor}`}
                              >
                                {percentage}%
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Latest workspace activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 && teamMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No activity to show
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Start by creating projects or inviting team members
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[
                        ...projects.slice(0, 2).map((project) => ({
                          action: `Project "${project.name}" created`,
                          time: new Date(
                            project.createdAt
                          ).toLocaleDateString(),
                          type: 'success',
                        })),
                        ...teamMembers.slice(0, 2).map((member) => ({
                          action: `${member.name} joined the team`,
                          time: new Date(
                            member.joinedDate
                          ).toLocaleDateString(),
                          type: 'info',
                        })),
                      ]
                        .slice(0, 4)
                        .map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                activity.type === 'success'
                                  ? 'bg-green-500'
                                  : 'bg-blue-500'
                              }`}
                            ></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {activity.action}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Project Performance
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Detailed breakdown of project metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No projects to analyze
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Create your first project to see detailed performance
                      metrics
                    </p>
                    <Link href="/projects">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Create Your First Project
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {project.name}
                          </h4>
                          <Badge
                            variant={
                              project.status === 'completed'
                                ? 'default'
                                : project.status === 'active'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="dark:bg-gray-700 dark:text-gray-300"
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">
                              Progress
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {project.progress}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">
                              Tasks
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {project.tasks.length}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">
                              Category
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {project.category}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">
                              Priority
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {project.priority}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Performance Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Team Performance Metrics
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Individual team member statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No team members yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Invite team members to see performance analytics
                    </p>
                    <Link href="/workspace-settings">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Invite Team Members
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamMembers.map((member, index) => {
                      // Calculate member-specific metrics
                      const memberProjects = projects.filter((p) =>
                        p.teamMembers.includes(member.id)
                      );
                      const tasksCompleted = memberProjects.reduce(
                        (sum, p) => sum + p.tasks.length,
                        0
                      );
                      const efficiency =
                        memberProjects.length > 0
                          ? Math.round(Math.random() * 30 + 70)
                          : 0; // Simulated efficiency
                      const activeProjects = memberProjects.filter(
                        (p) => p.status === 'active'
                      ).length;

                      return (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {member.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                  {member.role}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                              {efficiency}% Efficiency
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">
                                Tasks Completed
                              </p>
                              <p className="font-medium text-lg text-gray-900 dark:text-white">
                                {tasksCompleted}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">
                                Active Projects
                              </p>
                              <p className="font-medium text-lg text-gray-900 dark:text-white">
                                {activeProjects}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">
                                Status
                              </p>
                              <Badge
                                variant={
                                  member.status === 'Active'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {member.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Productivity Trends
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Performance over time ({timeRange})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {productivityTrends.length === 0 ||
                  productivityTrends.every(
                    (t) => t.tasksCompleted === 0 && t.projectsCreated === 0
                  ) ? (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No productivity data available
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Create projects to see trends
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {productivityTrends.map((trend, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">
                              {trend.label}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {trend.tasksCompleted} tasks,{' '}
                              {trend.projectsCreated} projects
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-16">
                                Tasks
                              </span>
                              <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${trend.relativeTasksBar}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 w-8">
                                {trend.tasksCompleted}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-16">
                                Projects
                              </span>
                              <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${trend.relativeProjectsBar}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 w-8">
                                {trend.projectsCreated}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Growth Metrics
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Key performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {growthMetrics.length === 0 ||
                  growthMetrics.every(
                    (m) => m.current === 0 && m.previous === 0
                  ) ? (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No growth data available
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Need more data to show trends
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {growthMetrics.map((metric, index) => {
                        const TrendIcon =
                          metric.trend === 'up'
                            ? TrendingUp
                            : metric.trend === 'down'
                              ? TrendingDown
                              : Minus;
                        const trendColor =
                          metric.trend === 'stable'
                            ? 'text-gray-500'
                            : (metric.isPositive && metric.trend === 'up') ||
                                (!metric.isPositive && metric.trend === 'down')
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400';

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {metric.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {metric.current}
                                {metric.unit}
                              </span>
                              <div
                                className={`flex items-center gap-1 ${trendColor}`}
                              >
                                <TrendIcon className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  {metric.change > 0 ? '+' : ''}
                                  {metric.change}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
