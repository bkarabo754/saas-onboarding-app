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
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FolderPlus,
  Calendar,
  Users,
  MoreVertical,
  Play,
  Pause,
  Archive,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Plus,
  Target,
  TrendingUp,
  Activity,
  Loader2,
  Eye,
  Star,
  Share2,
  Save,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { NewProjectModal } from '@/components/modals/new-project-modal';

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

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  medium:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  paused:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export default function ProjectsPage() {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newTask, setNewTask] = useState('');

  // Load projects from localStorage
  useEffect(() => {
    const loadProjects = () => {
      const storedProjects = JSON.parse(
        localStorage.getItem('projects') || '[]'
      );
      setProjects(storedProjects);
    };

    loadProjects();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'projects') {
        loadProjects();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter projects based on search and filters
  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          project.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(
        (project) => project.priority === priorityFilter
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (project) => project.category === categoryFilter
      );
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedProjects = projects.map((project) =>
        project.id === projectId
          ? { ...project, status: newStatus as any }
          : project
      );

      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));

      toast.success(`Project status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update project status');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedProjects = projects.filter(
        (project) => project.id !== projectId
      );
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));

      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject({ ...project });
    setShowEditModal(true);
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;

    if (!editingProject.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedProjects = projects.map((project) =>
        project.id === editingProject.id ? editingProject : project
      );

      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));

      // Add notification
      const notification = {
        id: Date.now().toString(),
        type: 'project',
        title: 'Project Updated',
        message: `"${editingProject.name}" has been updated successfully`,
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

      setShowEditModal(false);
      setEditingProject(null);
      toast.success('Project updated successfully!');
    } catch (error) {
      toast.error('Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  const updateEditingProject = (field: keyof Project, value: any) => {
    if (!editingProject) return;
    setEditingProject({ ...editingProject, [field]: value });
  };

  const addTask = () => {
    if (!newTask.trim() || !editingProject) return;

    const updatedTasks = [...editingProject.tasks, newTask.trim()];
    setEditingProject({ ...editingProject, tasks: updatedTasks });
    setNewTask('');
  };

  const removeTask = (index: number) => {
    if (!editingProject) return;

    const updatedTasks = editingProject.tasks.filter((_, i) => i !== index);
    setEditingProject({ ...editingProject, tasks: updatedTasks });
  };

  const updateTask = (index: number, newValue: string) => {
    if (!editingProject) return;

    const updatedTasks = editingProject.tasks.map((task, i) =>
      i === index ? newValue : task
    );
    setEditingProject({ ...editingProject, tasks: updatedTasks });
  };

  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === 'active').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const overdue = projects.filter(
      (p) =>
        p.dueDate &&
        new Date(p.dueDate) < new Date() &&
        p.status !== 'completed'
    ).length;

    return { total, active, completed, overdue };
  };

  const stats = getProjectStats();
  const categories = [...new Set(projects.map((p) => p.category))];

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
                <FolderPlus className="h-8 w-8" />
                Projects
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage and track your projects and tasks
              </p>
            </div>
          </div>

          <NewProjectModal />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Projects
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
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
                    Active Projects
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.active}
                  </p>
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
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.completed}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Overdue
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.overdue}
                  </p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-32 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-32 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category, index) => (
                      <SelectItem
                        key={`category-${index}-${category}`}
                        value={category}
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <FolderPlus className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {projects.length === 0
                  ? 'No projects yet'
                  : 'No projects match your filters'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {projects.length === 0
                  ? 'Create your first project to get started with organizing your work.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              {projects.length === 0 && <NewProjectModal />}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={`project-${project.id}`}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 text-gray-900 dark:text-white">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        {project.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Badge className={STATUS_COLORS[project.status]}>
                      {project.status}
                    </Badge>
                    <Badge className={PRIORITY_COLORS[project.priority]}>
                      {project.priority}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      {project.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Progress
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {project.progress}%
                      </span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>{project.tasks.length} tasks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {project.dueDate
                          ? new Date(project.dueDate).toLocaleDateString()
                          : 'No due date'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setShowProjectModal(true);
                        }}
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProject(project)}
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {project.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateProjectStatus(project.id, 'paused')
                          }
                          disabled={isLoading}
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateProjectStatus(project.id, 'active')
                          }
                          disabled={isLoading}
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProject(project.id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Project Details Modal - Fixed positioning and scrollbars */}
        <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
          <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-600">
              <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <FolderPlus className="h-5 w-5" />
                {selectedProject?.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Project details and task breakdown
              </DialogDescription>
            </DialogHeader>

            {selectedProject && (
              <div className="p-6 space-y-6 overflow-y-auto scrollbar-none max-h-[calc(90vh-140px)]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">
                      Template
                    </h4>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedProject.templateName}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">
                      Category
                    </h4>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedProject.category}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">
                      Status
                    </h4>
                    <Badge className={STATUS_COLORS[selectedProject.status]}>
                      {selectedProject.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">
                      Priority
                    </h4>
                    <Badge
                      className={PRIORITY_COLORS[selectedProject.priority]}
                    >
                      {selectedProject.priority}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {selectedProject.description || 'No description provided'}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Tasks ({selectedProject.tasks.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedProject.tasks.map((task, index) => (
                      <div
                        key={`task-${selectedProject.id}-${index}`}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    Created:{' '}
                    {new Date(selectedProject.createdAt).toLocaleDateString()}
                  </span>
                  {selectedProject.dueDate && (
                    <span>
                      Due:{' '}
                      {new Date(selectedProject.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="p-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button
                variant="outline"
                onClick={() => setShowProjectModal(false)}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => {
                  if (selectedProject) {
                    setShowProjectModal(false);
                    handleEditProject(selectedProject);
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Project Modal - Fixed positioning and scrollbars */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[95vh] p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-600">
              <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Edit className="h-5 w-5" />
                Edit Project
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Modify project details, tasks, and settings
              </DialogDescription>
            </DialogHeader>

            {editingProject && (
              <div className="p-6 space-y-6 overflow-y-auto scrollbar-none max-h-[calc(95vh-140px)]">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="edit-name"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Project Name *
                    </Label>
                    <Input
                      id="edit-name"
                      value={editingProject.name}
                      onChange={(e) =>
                        updateEditingProject('name', e.target.value)
                      }
                      placeholder="Enter project name"
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label
                      htmlFor="edit-description"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={editingProject.description}
                      onChange={(e) =>
                        updateEditingProject('description', e.target.value)
                      }
                      placeholder="Describe your project"
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">
                      Status
                    </Label>
                    <Select
                      value={editingProject.status}
                      onValueChange={(value) =>
                        updateEditingProject('status', value)
                      }
                    >
                      <SelectTrigger className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">
                      Priority
                    </Label>
                    <Select
                      value={editingProject.priority}
                      onValueChange={(value) =>
                        updateEditingProject('priority', value)
                      }
                    >
                      <SelectTrigger className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        {PRIORITY_OPTIONS.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="edit-category"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Category
                    </Label>
                    <Input
                      id="edit-category"
                      value={editingProject.category}
                      onChange={(e) =>
                        updateEditingProject('category', e.target.value)
                      }
                      placeholder="Project category"
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="edit-dueDate"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Due Date
                    </Label>
                    <Input
                      id="edit-dueDate"
                      type="date"
                      value={editingProject.dueDate}
                      onChange={(e) =>
                        updateEditingProject('dueDate', e.target.value)
                      }
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="edit-progress"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Progress (%)
                    </Label>
                    <Input
                      id="edit-progress"
                      type="number"
                      min="0"
                      max="100"
                      value={editingProject.progress}
                      onChange={(e) =>
                        updateEditingProject(
                          'progress',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="edit-template"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Template
                    </Label>
                    <Input
                      id="edit-template"
                      value={editingProject.templateName}
                      onChange={(e) =>
                        updateEditingProject('templateName', e.target.value)
                      }
                      placeholder="Template name"
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Tasks Management */}
                <div>
                  <Label className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    Tasks ({editingProject.tasks.length})
                  </Label>

                  {/* Add New Task */}
                  <div className="flex gap-2 mt-3 mb-4">
                    <Input
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="Add a new task..."
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                      className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                    <Button
                      type="button"
                      onClick={addTask}
                      disabled={!newTask.trim()}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-2 border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    {editingProject.tasks.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No tasks yet. Add your first task above.
                      </p>
                    ) : (
                      editingProject.tasks.map((task, index) => (
                        <div
                          key={`edit-task-${index}`}
                          className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                        >
                          <CheckCircle className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <Input
                            value={task}
                            onChange={(e) => updateTask(index, e.target.value)}
                            className="flex-1 text-sm border-none bg-transparent p-0 h-auto focus:ring-0 text-gray-900 dark:text-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTask(index)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Project Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Project Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">
                        Status:
                      </span>
                      <Badge
                        className={STATUS_COLORS[editingProject.status]}
                        variant="destructive"
                      >
                        {editingProject.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">
                        Priority:
                      </span>
                      <Badge
                        className={PRIORITY_COLORS[editingProject.priority]}
                        variant="outline"
                      >
                        {editingProject.priority}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">
                        Tasks:
                      </span>
                      <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                        {editingProject.tasks.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">
                        Progress:
                      </span>
                      <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                        {editingProject.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="p-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProject(null);
                  setNewTask('');
                }}
                disabled={isLoading}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProject}
                disabled={isLoading || !editingProject?.name.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
