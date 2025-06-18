'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Loader2,
  FolderPlus,
  Users,
  Calendar,
  Target,
  Code,
  Megaphone,
  PartyPopper,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface NewProjectModalProps {
  trigger?: React.ReactNode;
}

const PROJECT_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with a clean slate',
    icon: FolderPlus,
    defaultTasks: [
      'Set up project structure',
      'Define project goals',
      'Create initial documentation',
      'Set up team permissions',
    ],
    color: 'bg-gray-100 text-gray-800',
    category: 'General',
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign',
    description: 'Pre-configured for marketing workflows',
    icon: Megaphone,
    defaultTasks: [
      'Define target audience and personas',
      'Create campaign strategy and goals',
      'Design marketing materials and assets',
      'Set up analytics and tracking',
      'Create content calendar',
      'Launch campaign across channels',
      'Monitor performance and optimize',
      'Analyze results and create report',
    ],
    color: 'bg-orange-100 text-orange-800',
    category: 'Marketing',
  },
  {
    id: 'development',
    name: 'Software Development',
    description: 'Perfect for development teams',
    icon: Code,
    defaultTasks: [
      'Set up development environment',
      'Create project architecture and design',
      'Set up version control and CI/CD',
      'Implement core features and functionality',
      'Write comprehensive unit tests',
      'Conduct code review and QA testing',
      'Deploy to staging environment',
      'Deploy to production and monitor',
    ],
    color: 'bg-blue-100 text-blue-800',
    category: 'Development',
  },
  {
    id: 'event',
    name: 'Event Planning',
    description: 'Organize events and manage timelines',
    icon: PartyPopper,
    defaultTasks: [
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
    color: 'bg-purple-100 text-purple-800',
    category: 'Events',
  },
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export function NewProjectModal({ trigger }: NewProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    teamMembers: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call to create project
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const template = PROJECT_TEMPLATES.find((t) => t.id === selectedTemplate);

      // Create project with template-specific tasks
      const projectData = {
        ...formData,
        template: selectedTemplate,
        templateName: template?.name,
        tasks: template?.defaultTasks || [],
        createdAt: new Date().toISOString(),
        id: Date.now().toString(),
        status: 'active',
        progress: 0,
        category: template?.category || 'General',
      };

      // Store project (in real app, this would be an API call)
      const existingProjects = JSON.parse(
        localStorage.getItem('projects') || '[]'
      );
      localStorage.setItem(
        'projects',
        JSON.stringify([projectData, ...existingProjects])
      );

      // Add notification to recent activity
      const notification = {
        id: Date.now().toString(),
        type: 'project',
        title: 'New Project Created',
        message: `"${formData.name}" project created using ${template?.name} template with ${template?.defaultTasks.length} tasks`,
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

      toast.success(
        `${template?.name} project "${formData.name}" created successfully with ${template?.defaultTasks.length} tasks!`
      );
      setIsOpen(false);
      setFormData({
        name: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        teamMembers: [],
      });
      setSelectedTemplate('blank');
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTemplateData = PROJECT_TEMPLATES.find(
    (t) => t.id === selectedTemplate
  );

  const defaultTrigger = (
    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
      <Plus className="h-4 w-4 mr-2" />
      New Project
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden rounded-xl">
        <div className="max-h-[calc(90vh-2rem)] scroll-smooth p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Create New Project
            </DialogTitle>
            <DialogDescription>
              Choose a template and set up your project to organize work and
              collaborate with your team.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Templates */}
            <div>
              <Label className="text-base font-semibold">
                Choose a template
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {PROJECT_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${template.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {template.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        <Badge className={template.color}>
                          {template.defaultTasks.length} tasks
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template Preview */}
            {selectedTemplateData && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <selectedTemplateData.icon className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">
                    {selectedTemplateData.name} Template
                  </h4>
                </div>
                <p className="text-sm text-blue-800 mb-3">
                  {selectedTemplateData.description}
                </p>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-blue-900">
                    Included tasks:
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {selectedTemplateData.defaultTasks.map((task, index) => (
                      <div
                        key={index}
                        className="text-xs text-blue-700 flex items-center gap-2"
                      >
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter project name"
                  required
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe your project goals and objectives"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={level.color}>{level.label}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>

            {/* Project Summary */}
            {formData.name && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Project Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Template:</span>
                    <span className="ml-2 font-medium">
                      {selectedTemplateData?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tasks:</span>
                    <span className="ml-2 font-medium">
                      {selectedTemplateData?.defaultTasks.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <Badge
                      className={
                        PRIORITY_LEVELS.find(
                          (p) => p.value === formData.priority
                        )?.color
                      }
                      variant="destructive"
                    >
                      {
                        PRIORITY_LEVELS.find(
                          (p) => p.value === formData.priority
                        )?.label
                      }
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">
                      {selectedTemplateData?.category}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formData.name || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
