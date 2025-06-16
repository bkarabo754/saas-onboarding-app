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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
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
  HelpCircle,
  MessageSquare,
  Phone,
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  CheckCircle,
  ArrowLeft,
  Video,
  FileText,
  Search,
  Send,
  Loader2,
  Star,
  ChevronRight,
  BookOpen,
  Headphones,
  Zap,
  Shield,
  Globe,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  format,
  addDays,
  isSameDay,
  isAfter,
  isBefore,
  startOfDay,
} from 'date-fns';

interface TimeSlot {
  time: string;
  available: boolean;
  timezone: string;
}

interface BookingData {
  date: Date;
  time: string;
  type: 'support' | 'onboarding' | 'technical' | 'sales';
  name: string;
  email: string;
  company: string;
  phone: string;
  topic: string;
  description: string;
  timezone: string;
}

interface CallType {
  id: string;
  name: string;
  description: string;
  duration: string;
  icon: LucideIcon;
  color: string;
}

interface SupportArticle {
  title: string;
  description: string;
  category: string;
  readTime: string;
  icon: LucideIcon;
}

const CALL_TYPES: CallType[] = [
  {
    id: 'support',
    name: 'General Support',
    description: 'Get help with your account, billing, or general questions',
    duration: '30 minutes',
    icon: HelpCircle,
    color: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'onboarding',
    name: 'Onboarding Call',
    description: 'Personalized setup and training session',
    duration: '45 minutes',
    icon: Users,
    color: 'bg-green-100 text-green-800',
  },
  {
    id: 'technical',
    name: 'Technical Support',
    description: 'Advanced technical assistance and troubleshooting',
    duration: '60 minutes',
    icon: Zap,
    color: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'sales',
    name: 'Sales Consultation',
    description: 'Discuss pricing, features, and custom solutions',
    duration: '30 minutes',
    icon: Phone,
    color: 'bg-orange-100 text-orange-800',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How do I reset my password?',
    answer:
      'You can reset your password by clicking the "Forgot Password" link on the login page. We\'ll send you a secure reset link via email.',
    category: 'Account',
  },
  {
    question: 'How do I upgrade my subscription?',
    answer:
      'Go to Settings > Subscription and click "Upgrade Plan". You can choose from our Starter, Professional, or Enterprise plans.',
    category: 'Billing',
  },
  {
    question: 'Can I invite team members?',
    answer:
      'Yes! Go to your workspace settings and click "Invite Team Members". You can assign different roles and permissions.',
    category: 'Team',
  },
  {
    question: 'How do I export my data?',
    answer:
      'Navigate to Settings > Privacy & Security > Data Export. You can download a comprehensive PDF report of all your data.',
    category: 'Data',
  },
  {
    question: 'What integrations are available?',
    answer:
      'We support integrations with Slack, Microsoft Teams, Google Workspace, Trello, GitHub, and many more through our API.',
    category: 'Integrations',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely! We use enterprise-grade encryption, regular security audits, and comply with SOC 2 Type II standards.',
    category: 'Security',
  },
];

const SUPPORT_ARTICLES: SupportArticle[] = [
  {
    title: 'Getting Started Guide',
    description: 'Complete walkthrough of setting up your workspace',
    category: 'Getting Started',
    readTime: '5 min read',
    icon: BookOpen,
  },
  {
    title: 'Team Management Best Practices',
    description: 'How to effectively manage and organize your team',
    category: 'Team Management',
    readTime: '8 min read',
    icon: Users,
  },
  {
    title: 'API Documentation',
    description: 'Complete API reference and integration examples',
    category: 'Developers',
    readTime: '15 min read',
    icon: FileText,
  },
  {
    title: 'Security & Compliance',
    description: 'Understanding our security measures and compliance',
    category: 'Security',
    readTime: '6 min read',
    icon: Shield,
  },
  {
    title: 'Troubleshooting Common Issues',
    description: 'Solutions to frequently encountered problems',
    category: 'Troubleshooting',
    readTime: '10 min read',
    icon: Headphones,
  },
  {
    title: 'Advanced Features Guide',
    description: 'Unlock the full potential of our platform',
    category: 'Advanced',
    readTime: '12 min read',
    icon: Zap,
  },
];

// Generate time slots for a given date
const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 9; // 9 AM
  const endHour = 17; // 5 PM

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      // Simulate some unavailable slots
      const isUnavailable = Math.random() < 0.3; // 30% chance of being unavailable

      slots.push({
        time: timeString,
        available: !isUnavailable,
        timezone: 'EST',
      });
    }
  }

  return slots;
};

export default function HelpSupportPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Booking state
  const [selectedCallType, setSelectedCallType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [bookingData, setBookingData] = useState<BookingData>({
    date: new Date(),
    time: '',
    type: 'support',
    name: '',
    email: '',
    company: '',
    phone: '',
    topic: '',
    description: '',
    timezone: 'EST',
  });
  const [confirmedBooking, setConfirmedBooking] = useState<BookingData | null>(
    null
  );

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium',
  });

  // Filter FAQ items
  const filteredFAQ = FAQ_ITEMS.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      item.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter support articles
  const filteredArticles = SUPPORT_ARTICLES.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      article.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTime('');
      setAvailableSlots(generateTimeSlots(date));
      setBookingData((prev) => ({ ...prev, date }));
    }
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingData((prev) => ({ ...prev, time }));
  };

  // Handle call type selection
  const handleCallTypeSelect = (typeId: string) => {
    setSelectedCallType(typeId);
    setBookingData((prev) => ({
      ...prev,
      type: typeId as BookingData['type'],
    }));
  };

  // Initialize booking modal
  const initializeBooking = (callType: string = 'support') => {
    setSelectedCallType(callType);
    setBookingData((prev) => ({
      ...prev,
      type: callType as BookingData['type'],
      name: user?.fullName || '',
      email: user?.emailAddresses[0]?.emailAddress || '',
    }));
    setSelectedDate(undefined);
    setSelectedTime('');
    setAvailableSlots([]);
    setShowBookingModal(true);
  };

  // Submit booking
  const handleBookingSubmit = async () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !bookingData.name ||
      !bookingData.email
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const finalBookingData = {
        ...bookingData,
        date: selectedDate,
        time: selectedTime,
      };

      setConfirmedBooking(finalBookingData);

      // Add notification
      const selectedCallTypeData = CALL_TYPES.find(
        (t) => t.id === bookingData.type
      );
      const notification = {
        id: Date.now().toString(),
        type: 'support',
        title: 'Call Scheduled Successfully',
        message: `Your ${selectedCallTypeData?.name || 'support'} call is scheduled for ${format(selectedDate, 'MMMM d, yyyy')} at ${selectedTime}`,
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

      setShowBookingModal(false);
      setShowSuccessModal(true);
      toast.success('Call scheduled successfully!');
    } catch (error) {
      toast.error('Failed to schedule call. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit contact form
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Add notification
      const notification = {
        id: Date.now().toString(),
        type: 'support',
        title: 'Support Ticket Created',
        message: `Your support request "${contactForm.subject}" has been submitted. We'll respond within 24 hours.`,
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

      toast.success('Support request submitted successfully!');
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium',
      });
    } catch (error) {
      toast.error('Failed to submit support request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if date is available for booking
  const isDateAvailable = (date: Date) => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 30); // 30 days in advance
    return isAfter(date, today) && isBefore(date, maxDate);
  };

  const categories = [
    'all',
    ...new Set([
      ...FAQ_ITEMS.map((item) => item.category.toLowerCase()),
      ...SUPPORT_ARTICLES.map((article) => article.category.toLowerCase()),
    ]),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              ← Back to Dashboard
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8" />
              Help & Support
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
              Get the help you need, when you need it
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card
            className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            onClick={() => initializeBooking('support')}
          >
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit mx-auto mb-4">
                <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Schedule a Call
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Book a personalized support session
              </p>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            onClick={() => setActiveTab('contact')}
          >
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Send Message
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get help via email support
              </p>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            onClick={() => setActiveTab('articles')}
          >
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full w-fit mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Browse Articles
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Self-service documentation
              </p>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            onClick={() => setActiveTab('faq')}
          >
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full w-fit mx-auto mb-4">
                <HelpCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                FAQ
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quick answers to common questions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8 border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full lg:w-48 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="capitalize"
                    >
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger
              value="faq"
              className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100"
            >
              FAQ
            </TabsTrigger>
            <TabsTrigger
              value="articles"
              className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100"
            >
              Articles
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100"
            >
              Contact
            </TabsTrigger>
            <TabsTrigger
              value="booking"
              className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100"
            >
              Book Call
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Find quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFAQ.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No FAQ items match your search
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFAQ.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {item.question}
                          </h4>
                          <Badge
                            variant="outline"
                            className="ml-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                          >
                            {item.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Help Articles
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Comprehensive guides and documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No articles match your search
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredArticles.map((article, index) => {
                      const IconComponent = article.icon;
                      return (
                        <div
                          key={index}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                              <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {article.title}
                                </h4>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {article.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                >
                                  {article.category}
                                </Badge>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {article.readTime}
                                </span>
                              </div>
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

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Contact Support
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Send us a message and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="contact-name"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Name *
                      </Label>
                      <Input
                        id="contact-name"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Your full name"
                        required
                        className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="contact-email"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Email *
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="your@email.com"
                        required
                        className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="contact-subject"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Subject *
                      </Label>
                      <Input
                        id="contact-subject"
                        value={contactForm.subject}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            subject: e.target.value,
                          }))
                        }
                        placeholder="Brief description of your issue"
                        required
                        className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="contact-priority"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Priority
                      </Label>
                      <Select
                        value={contactForm.priority}
                        onValueChange={(value) =>
                          setContactForm((prev) => ({
                            ...prev,
                            priority: value,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="contact-message"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Message *
                    </Label>
                    <Textarea
                      id="contact-message"
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      placeholder="Please describe your issue in detail..."
                      required
                      rows={6}
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking Tab */}
          <TabsContent value="booking" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {CALL_TYPES.map((callType) => {
                const IconComponent = callType.icon;
                return (
                  <Card
                    key={callType.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    onClick={() => initializeBooking(callType.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full w-fit mx-auto mb-4">
                        <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {callType.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {callType.description}
                      </p>
                      <Badge className={callType.color}>
                        {callType.duration}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Schedule Your Call
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Choose a call type above to get started with booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Select a call type to begin scheduling
                  </p>
                  <Button
                    onClick={() => initializeBooking('support')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Schedule Support Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Booking Modal */}
        <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Schedule Your Call
              </DialogTitle>
              <DialogDescription>
                Book a personalized session with our support team
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Calendar and Time Slots */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    Select Date
                  </h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => !isDateAvailable(date)}
                    className="rounded-md border border-gray-200 dark:border-gray-600"
                  />
                </div>

                {selectedDate && availableSlots.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Available Times - {format(selectedDate, 'MMMM d, yyyy')}
                    </h3>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={
                            selectedTime === slot.time ? 'default' : 'outline'
                          }
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot.time)}
                          className={`text-xs ${selectedTime === slot.time ? 'bg-blue-600 text-white' : ''}`}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Booking Form */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    Call Details
                  </h3>
                  {selectedCallType && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg mb-4">
                      {(() => {
                        const callTypeData = CALL_TYPES.find(
                          (t) => t.id === selectedCallType
                        );
                        if (!callTypeData) return null;
                        const IconComponent = callTypeData.icon;
                        return (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                                {callTypeData.name}
                              </h4>
                            </div>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              {callTypeData.description}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                              Duration: {callTypeData.duration}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="booking-name">Name *</Label>
                    <Input
                      id="booking-name"
                      value={bookingData.name}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Your full name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="booking-email">Email *</Label>
                    <Input
                      id="booking-email"
                      type="email"
                      value={bookingData.email}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="your@email.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="booking-company">Company</Label>
                    <Input
                      id="booking-company"
                      value={bookingData.company}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          company: e.target.value,
                        }))
                      }
                      placeholder="Your company name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="booking-phone">Phone</Label>
                    <Input
                      id="booking-phone"
                      value={bookingData.phone}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="Your phone number"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="booking-topic">Topic</Label>
                    <Input
                      id="booking-topic"
                      value={bookingData.topic}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          topic: e.target.value,
                        }))
                      }
                      placeholder="What would you like to discuss?"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="booking-description">
                      Additional Details
                    </Label>
                    <Textarea
                      id="booking-description"
                      value={bookingData.description}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Any additional information or questions..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBookingModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBookingSubmit}
                disabled={
                  isSubmitting ||
                  !selectedDate ||
                  !selectedTime ||
                  !bookingData.name ||
                  !bookingData.email
                }
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Call
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Modal - Fixed with proper border radius and no scrollbar */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-lg rounded-lg">
            <DialogHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <DialogTitle className="text-xl text-green-700 dark:text-green-300">
                Call Scheduled Successfully!
              </DialogTitle>
              <DialogDescription className="text-green-600 dark:text-green-400">
                Your appointment has been confirmed
              </DialogDescription>
            </DialogHeader>

            {confirmedBooking && (
              <div className="space-y-4">
                {/* Booking Summary */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          {format(confirmedBooking.date, 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {confirmedBooking.time} {confirmedBooking.timezone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          {
                            CALL_TYPES.find(
                              (t) => t.id === confirmedBooking.type
                            )?.name
                          }
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Duration:{' '}
                          {
                            CALL_TYPES.find(
                              (t) => t.id === confirmedBooking.type
                            )?.duration
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          {confirmedBooking.name}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {confirmedBooking.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    What's Next?
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Calendar invitation sent to your email</li>
                    <li>• Reminder email 24 hours before</li>
                    <li>• Join via the video link provided</li>
                    <li>• Prepare any questions or topics</li>
                  </ul>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Perfect, Thanks!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
