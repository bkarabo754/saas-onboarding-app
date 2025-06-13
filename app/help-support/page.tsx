'use client';

import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  HelpCircle,
  MessageCircle,
  Book,
  Video,
  Search,
  Send,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Download,
  PlayCircle,
  FileText,
  Users,
  Zap,
  Settings,
  CreditCard,
  Shield,
  Loader2,
  ChevronRight,
  Globe,
  Headphones,
  Calendar,
  MessageSquare,
  Lightbulb,
  Target,
  Rocket,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  lastUpdate: string;
  category: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'video' | 'tutorial' | 'webinar';
  duration?: string;
  category: string;
  url: string;
  popular: boolean;
}

export default function HelpSupportPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    description: '',
    attachments: [],
  });

  const [feedbackForm, setFeedbackForm] = useState({
    type: 'suggestion',
    rating: 5,
    title: '',
    description: '',
  });

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I create a new project?',
      answer:
        'To create a new project, click the "New Project" button in your dashboard, choose a template, fill in the project details, and click "Create Project". You can also use our pre-built templates for faster setup.',
      category: 'projects',
      helpful: 45,
      notHelpful: 2,
    },
    {
      id: '2',
      question: 'How do I invite team members to my workspace?',
      answer:
        'Go to your workspace settings, click on the "Team" tab, and click "Add Member". Enter their email address, select their role, and send the invitation. They will receive an email to join your workspace.',
      category: 'team',
      helpful: 38,
      notHelpful: 1,
    },
    {
      id: '3',
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through Stripe.',
      category: 'billing',
      helpful: 52,
      notHelpful: 3,
    },
    {
      id: '4',
      question: 'How do I upgrade my subscription plan?',
      answer:
        'Visit the Subscription page in your account settings, select the plan you want to upgrade to, and follow the checkout process. Your new features will be available immediately.',
      category: 'billing',
      helpful: 41,
      notHelpful: 1,
    },
    {
      id: '5',
      question: 'Is my data secure?',
      answer:
        'Yes, we take security seriously. All data is encrypted in transit and at rest, we use industry-standard security practices, and we are SOC 2 compliant. You can also enable two-factor authentication for additional security.',
      category: 'security',
      helpful: 67,
      notHelpful: 0,
    },
    {
      id: '6',
      question: 'How do I set up integrations?',
      answer:
        'Go to Workspace Settings > Integrations tab. You can connect with popular tools like Slack, Google Workspace, and more. Click "Connect" next to the service you want to integrate and follow the authorization process.',
      category: 'integrations',
      helpful: 29,
      notHelpful: 4,
    },
  ];

  const supportTickets: SupportTicket[] = [
    {
      id: 'TICK-001',
      subject: 'Unable to upload files larger than 10MB',
      status: 'in-progress',
      priority: 'medium',
      createdAt: '2024-01-15T10:30:00Z',
      lastUpdate: '2024-01-15T14:20:00Z',
      category: 'technical',
    },
    {
      id: 'TICK-002',
      subject: 'Question about enterprise pricing',
      status: 'resolved',
      priority: 'low',
      createdAt: '2024-01-14T09:15:00Z',
      lastUpdate: '2024-01-14T16:45:00Z',
      category: 'billing',
    },
    {
      id: 'TICK-003',
      subject: 'Feature request: Dark mode',
      status: 'open',
      priority: 'low',
      createdAt: '2024-01-13T11:20:00Z',
      lastUpdate: '2024-01-13T11:20:00Z',
      category: 'feature',
    },
  ];

  const resources: Resource[] = [
    {
      id: '1',
      title: 'Getting Started Guide',
      description:
        'Complete walkthrough of setting up your workspace and creating your first project',
      type: 'guide',
      category: 'getting-started',
      url: '#',
      popular: true,
    },
    {
      id: '2',
      title: 'Team Collaboration Best Practices',
      description:
        'Learn how to effectively collaborate with your team using our platform',
      type: 'video',
      duration: '15 min',
      category: 'collaboration',
      url: '#',
      popular: true,
    },
    {
      id: '3',
      title: 'Advanced Project Management',
      description: 'Master advanced features for complex project management',
      type: 'tutorial',
      duration: '25 min',
      category: 'projects',
      url: '#',
      popular: false,
    },
    {
      id: '4',
      title: 'Security and Privacy Webinar',
      description: 'Understanding our security features and privacy controls',
      type: 'webinar',
      duration: '45 min',
      category: 'security',
      url: '#',
      popular: true,
    },
    {
      id: '5',
      title: 'API Documentation',
      description: 'Complete reference for our REST API and webhooks',
      type: 'guide',
      category: 'developers',
      url: '#',
      popular: false,
    },
    {
      id: '6',
      title: 'Billing and Subscription Management',
      description:
        'How to manage your subscription, billing, and payment methods',
      type: 'guide',
      category: 'billing',
      url: '#',
      popular: true,
    },
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'getting-started', label: 'Getting Started' },
    { value: 'projects', label: 'Projects' },
    { value: 'team', label: 'Team Management' },
    { value: 'billing', label: 'Billing & Subscriptions' },
    { value: 'security', label: 'Security & Privacy' },
    { value: 'integrations', label: 'Integrations' },
    { value: 'developers', label: 'Developers' },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitContact = async () => {
    if (!contactForm.subject || !contactForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Add notification
      const notification = {
        id: Date.now().toString(),
        type: 'support',
        title: 'Support Ticket Created',
        message: `Your support ticket "${contactForm.subject}" has been submitted successfully`,
        timestamp: new Date(),
        read: false,
        link: '/help-support',
      };

      const existingNotifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );
      localStorage.setItem(
        'notifications',
        JSON.stringify([notification, ...existingNotifications])
      );

      toast.success(
        "Support ticket submitted successfully! We'll get back to you soon."
      );
      setShowContactModal(false);
      setContactForm({
        subject: '',
        category: 'general',
        priority: 'medium',
        description: '',
        attachments: [],
      });
    } catch (error) {
      toast.error('Failed to submit support ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackForm.title || !feedbackForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Thank you for your feedback! We appreciate your input.');
      setShowFeedbackModal(false);
      setFeedbackForm({
        type: 'suggestion',
        rating: 5,
        title: '',
        description: '',
      });
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'guide':
        return FileText;
      case 'video':
        return PlayCircle;
      case 'tutorial':
        return Book;
      case 'webinar':
        return Video;
      default:
        return FileText;
    }
  };

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
              <HelpCircle className="h-8 w-8" />
              Help & Support
            </h1>
            <p className="text-gray-600 mt-1">
              Get help, find answers, and contact our support team
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setShowContactModal(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Contact Support</h3>
              <p className="text-sm text-gray-600">
                Get help from our support team
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Schedule Call</h3>
              <p className="text-sm text-gray-600">
                Book a call with our experts
              </p>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setShowFeedbackModal(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <Lightbulb className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Send Feedback</h3>
              <p className="text-sm text-gray-600">
                Share your ideas and suggestions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for help articles, guides, or FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="border rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium">{faq.question}</span>
                          <Badge variant="outline" className="ml-2 capitalize">
                            {faq.category}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 pb-6">
                        <p className="text-gray-600 mb-4">{faq.answer}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              Was this helpful?
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {faq.helpful}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                              >
                                <ThumbsDown className="h-3 w-3 mr-1" />
                                {faq.notHelpful}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {filteredFAQs.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No FAQs found matching your search
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => {
                const ResourceIcon = getResourceIcon(resource.type);
                return (
                  <Card
                    key={resource.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ResourceIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        {resource.popular && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold mb-2">{resource.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {resource.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {resource.type}
                          </Badge>
                          {resource.duration && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {resource.duration}
                            </Badge>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredResources.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No resources found matching your search
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Support Tickets</CardTitle>
                    <CardDescription>
                      Track your support requests and their status
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowContactModal(true)}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    New Ticket
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{ticket.subject}</h4>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status.replace('-', ' ')}
                            </Badge>
                            <Badge
                              className={getPriorityColor(ticket.priority)}
                            >
                              {ticket.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Ticket #{ticket.id}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Created:{' '}
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          Last update:{' '}
                          {new Date(ticket.lastUpdate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {supportTickets.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No support tickets yet</p>
                    <Button onClick={() => setShowContactModal(true)}>
                      Create Your First Ticket
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Multiple ways to get in touch with our team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Email Support</h4>
                      <p className="text-sm text-gray-600">
                        support@example.com
                      </p>
                      <p className="text-xs text-gray-500">
                        Response within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Phone Support</h4>
                      <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                      <p className="text-xs text-gray-500">
                        Mon-Fri, 9 AM - 6 PM EST
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Live Chat</h4>
                      <p className="text-sm text-gray-600">Available 24/7</p>
                      <p className="text-xs text-gray-500">Instant responses</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Schedule a Call</h4>
                      <p className="text-sm text-gray-600">
                        Book a consultation
                      </p>
                      <p className="text-xs text-gray-500">
                        For complex issues
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Support Hours</CardTitle>
                  <CardDescription>
                    When our team is available to help
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Email Support</span>
                      <Badge className="bg-green-100 text-green-800">
                        24/7
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Live Chat</span>
                      <Badge className="bg-green-100 text-green-800">
                        24/7
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Phone Support</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        Business Hours
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Business Hours</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span>9:00 AM - 6:00 PM EST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span>10:00 AM - 4:00 PM EST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span>Closed</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Emergency Support</h4>
                    <p className="text-sm text-gray-600">
                      For critical issues affecting your business operations,
                      contact our emergency line at +1 (555) 999-0000
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact Support Modal */}
        <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </DialogTitle>
              <DialogDescription>
                Describe your issue and we'll get back to you as soon as
                possible
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  placeholder="Brief description of your issue"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={contactForm.category}
                    onValueChange={(value) =>
                      setContactForm((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Question</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">
                        Billing & Payments
                      </SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="security">Security Concern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select
                    value={contactForm.priority}
                    onValueChange={(value) =>
                      setContactForm((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={contactForm.description}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Please provide as much detail as possible about your issue..."
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Before submitting:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Check our FAQ section for quick answers</li>
                  <li>• Include steps to reproduce the issue</li>
                  <li>• Mention your browser and operating system</li>
                  <li>• Attach screenshots if relevant</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowContactModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitContact}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Send className="h-4 w-4 mr-2" />
                Submit Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Feedback Modal */}
        <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Send Feedback
              </DialogTitle>
              <DialogDescription>
                Help us improve by sharing your thoughts and suggestions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Feedback Type</Label>
                <Select
                  value={feedbackForm.type}
                  onValueChange={(value) =>
                    setFeedbackForm((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="compliment">Compliment</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Overall Rating</Label>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() =>
                        setFeedbackForm((prev) => ({ ...prev, rating }))
                      }
                      className={`p-1 rounded ${
                        rating <= feedbackForm.rating
                          ? 'text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="feedbackTitle">Title *</Label>
                <Input
                  id="feedbackTitle"
                  value={feedbackForm.title}
                  onChange={(e) =>
                    setFeedbackForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Brief summary of your feedback"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="feedbackDescription">Details *</Label>
                <Textarea
                  id="feedbackDescription"
                  value={feedbackForm.description}
                  onChange={(e) =>
                    setFeedbackForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Please share your detailed feedback..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowFeedbackModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Send className="h-4 w-4 mr-2" />
                Send Feedback
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
