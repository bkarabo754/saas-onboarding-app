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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  Calendar,
  Users,
  HardDrive,
  Zap,
  Crown,
  Download,
  Receipt,
  AlertCircle,
  CheckCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
  Star,
  Shield,
  Sparkles,
  Edit,
  Save,
  X,
  Lock,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckoutButton } from '@/components/ui/checkout-button';
import jsPDF from 'jspdf';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Up to 2 team members',
      'Basic analytics',
      'Community support',
      '1GB storage',
      'Basic integrations',
    ],
    limits: {
      teamMembers: 2,
      storage: 1,
      projects: 3,
      apiCalls: 100,
    },
    badgeColor: 'bg-gray-100 text-gray-800',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    features: [
      'Up to 5 team members',
      'Basic analytics',
      'Email support',
      '10GB storage',
      'Basic integrations',
    ],
    limits: {
      teamMembers: 5,
      storage: 10,
      projects: 10,
      apiCalls: 1000,
    },
    badgeColor: 'bg-green-100 text-green-800',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    features: [
      'Up to 25 team members',
      'Advanced analytics',
      'Priority support',
      '100GB storage',
      'API access',
      'Custom integrations',
      'Advanced reporting',
    ],
    popular: true,
    limits: {
      teamMembers: 25,
      storage: 100,
      projects: 50,
      apiCalls: 10000,
    },
    badgeColor: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    features: [
      'Unlimited team members',
      'Enterprise analytics',
      '24/7 phone support',
      'Unlimited storage',
      'Full API access',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    limits: {
      teamMembers: 999,
      storage: 999,
      projects: 999,
      apiCalls: 100000,
    },
    badgeColor: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
  },
];

export default function SubscriptionPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('professional');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);

  const [planDetails, setPlanDetails] = useState({
    teamMembers: 8,
    nextBilling: '2025-07-15',
    paymentMethod: '**** 4242',
    cardExpiry: '12/25',
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: 'ZA',
  });

  // Load billing history from localStorage
  useEffect(() => {
    const storedBilling = JSON.parse(
      localStorage.getItem('billingHistory') || '[]'
    );
    if (storedBilling.length === 0) {
      // Set default billing history if none exists
      const defaultBilling = [
        {
          id: 'inv_001',
          date: '2024-01-15',
          amount: 79,
          status: 'paid',
          plan: 'Professional',
          period: 'Jan 15 - Feb 15, 2024',
          invoiceUrl: '#',
          paymentMethod: '**** 4242',
          transactionId: 'pi_demo_123456',
        },
        {
          id: 'inv_002',
          date: '2023-12-15',
          amount: 79,
          status: 'paid',
          plan: 'Professional',
          period: 'Dec 15 - Jan 15, 2024',
          invoiceUrl: '#',
          paymentMethod: '**** 4242',
          transactionId: 'pi_demo_123455',
        },
      ];
      setBillingHistory(defaultBilling);
      localStorage.setItem('billingHistory', JSON.stringify(defaultBilling));
    } else {
      setBillingHistory(storedBilling);
    }
  }, []);

  // Handle success/cancel from checkout
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const plan = searchParams.get('plan');
    const sessionId = searchParams.get('session_id');

    if (success && plan) {
      setCurrentPlan(plan);

      // Add billing entry for successful payment (except free plan)
      if (plan !== 'free') {
        const selectedPlanData = PLANS.find((p) => p.id === plan);
        if (selectedPlanData) {
          const newBillingEntry = {
            id: `inv_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            amount: selectedPlanData.price,
            status: 'paid',
            plan: selectedPlanData.name,
            period: `${new Date().toLocaleDateString()} - ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
            invoiceUrl: '#',
            paymentMethod: '**** 4242',
            transactionId: sessionId || `pi_demo_${Date.now()}`,
          };

          const existingBilling = JSON.parse(
            localStorage.getItem('billingHistory') || '[]'
          );
          const updatedBilling = [newBillingEntry, ...existingBilling];
          setBillingHistory(updatedBilling);
          localStorage.setItem(
            'billingHistory',
            JSON.stringify(updatedBilling)
          );
        }
      }

      toast.success(
        `Successfully ${plan === 'free' ? 'activated' : 'upgraded to'} ${PLANS.find((p) => p.id === plan)?.name} plan!`
      );

      // Add notification
      const notification = {
        id: Date.now().toString(),
        type: 'subscription',
        title: plan === 'free' ? 'Free Plan Activated' : 'Plan Upgraded',
        message: `Your subscription has been ${plan === 'free' ? 'activated' : 'upgraded'} to the ${PLANS.find((p) => p.id === plan)?.name} plan`,
        timestamp: new Date(),
        read: false,
        link: '/subscription',
      };

      const existingNotifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );
      localStorage.setItem(
        'notifications',
        JSON.stringify([notification, ...existingNotifications])
      );
    }

    if (canceled) {
      toast.error('Payment was canceled. Your plan remains unchanged.');
    }
  }, [searchParams]);

  const handlePlanChange = async (planId: string) => {
    setIsLoading(true);
    try {
      const selectedPlanData = PLANS.find((p) => p.id === planId);
      const currentPlanData = PLANS.find((p) => p.id === currentPlan);

      if (!selectedPlanData || !currentPlanData) {
        throw new Error('Invalid plan selection');
      }

      // Simulate plan change
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setCurrentPlan(planId);

      const planName = selectedPlanData.name;
      const isUpgrade = selectedPlanData.price > currentPlanData.price;
      const isDowngrade = selectedPlanData.price < currentPlanData.price;

      let message = '';
      if (isUpgrade) {
        message = `Successfully upgraded to ${planName} plan!`;
      } else if (isDowngrade) {
        message = `Successfully downgraded to ${planName} plan!`;
      } else {
        message = `Successfully switched to ${planName} plan!`;
      }

      toast.success(message);

      // Add notification
      const notification = {
        id: Date.now().toString(),
        type: 'subscription',
        title: isUpgrade
          ? 'Plan Upgraded'
          : isDowngrade
            ? 'Plan Downgraded'
            : 'Plan Changed',
        message: `Your subscription has been ${isUpgrade ? 'upgraded' : isDowngrade ? 'downgraded' : 'changed'} to the ${planName} plan`,
        timestamp: new Date(),
        read: false,
        link: '/subscription',
      };

      const existingNotifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );
      localStorage.setItem(
        'notifications',
        JSON.stringify([notification, ...existingNotifications])
      );
    } catch (error) {
      toast.error('Failed to change plan');
    } finally {
      setIsLoading(false);
      setShowUpgradeModal(false);
      setShowDowngradeModal(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setShowCancelModal(false);

      // Add notification
      const notification = {
        id: Date.now().toString(),
        type: 'subscription',
        title: 'Subscription Cancelled',
        message:
          'Your subscription will be downgraded to Free plan at the end of billing cycle',
        timestamp: new Date(),
        read: false,
        link: '/subscription',
      };

      const existingNotifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );
      localStorage.setItem(
        'notifications',
        JSON.stringify([notification, ...existingNotifications])
      );

      toast.success(
        'Subscription cancelled. You will be downgraded to Free plan at the end of your billing cycle.'
      );
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDetails = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsEditingDetails(false);
      toast.success('Plan details updated successfully!');

      // Add notification
      const notification = {
        id: Date.now().toString(),
        type: 'subscription',
        title: 'Plan Details Updated',
        message: 'Your subscription details have been updated successfully',
        timestamp: new Date(),
        read: false,
        link: '/subscription',
      };

      const existingNotifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );
      localStorage.setItem(
        'notifications',
        JSON.stringify([notification, ...existingNotifications])
      );
    } catch (error) {
      toast.error('Failed to update details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    setIsLoading(true);
    try {
      // Validate payment details
      if (
        !paymentDetails.cardNumber ||
        !paymentDetails.expiryDate ||
        !paymentDetails.cvv ||
        !paymentDetails.cardholderName
      ) {
        toast.error('Please fill in all required payment details');
        setIsLoading(false);
        return;
      }

      // Validate expiry date format (MM/YY)
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expiryRegex.test(paymentDetails.expiryDate)) {
        toast.error('Please enter expiry date in MM/YY format');
        setIsLoading(false);
        return;
      }

      // Simulate payment method update
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update the displayed payment method AND expiry date
      const lastFour = paymentDetails.cardNumber.slice(-4);
      setPlanDetails((prev) => ({
        ...prev,
        paymentMethod: `**** ${lastFour}`,
        cardExpiry: paymentDetails.expiryDate,
      }));

      setShowPaymentModal(false);
      toast.success('Payment method and expiry date updated successfully!');

      // Add notification
      const notification = {
        id: Date.now().toString(),
        type: 'billing',
        title: 'Payment Method Updated',
        message: `Your payment method has been updated to card ending in ${lastFour} (expires ${paymentDetails.expiryDate})`,
        timestamp: new Date(),
        read: false,
        link: '/subscription',
      };

      const existingNotifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );
      localStorage.setItem(
        'notifications',
        JSON.stringify([notification, ...existingNotifications])
      );

      // Reset form
      setPaymentDetails({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        billingAddress: '',
        city: '',
        zipCode: '',
        country: 'ZA',
      });
    } catch (error) {
      toast.error('Failed to update payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoice = async (invoice: any) => {
    try {
      // Create PDF document
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;

      // Header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVOICE', margin, yPosition);

      // Invoice details
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      yPosition += 20;
      pdf.text(`Invoice #: ${invoice.id}`, margin, yPosition);
      yPosition += 10;
      pdf.text(
        `Date: ${new Date(invoice.date).toLocaleDateString()}`,
        margin,
        yPosition
      );
      yPosition += 10;
      pdf.text(`Status: ${invoice.status.toUpperCase()}`, margin, yPosition);

      // Company info (right side)
      pdf.text('Your Company Name', pageWidth - 80, 30);
      pdf.text('123 Business Street', pageWidth - 80, 40);
      pdf.text('City, State 12345', pageWidth - 80, 50);
      pdf.text('contact@company.com', pageWidth - 80, 60);

      // Bill to
      yPosition += 30;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      yPosition += 10;
      pdf.text(user?.fullName || 'Customer Name', margin, yPosition);
      yPosition += 10;
      pdf.text(
        user?.emailAddresses[0]?.emailAddress || 'customer@email.com',
        margin,
        yPosition
      );

      // Invoice items
      yPosition += 30;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Description', margin, yPosition);
      pdf.text('Amount', pageWidth - 60, yPosition);

      // Line
      yPosition += 5;
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);

      // Item
      yPosition += 15;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${invoice.plan} Plan Subscription`, margin, yPosition);
      pdf.text(`R${invoice.amount.toFixed(2)}`, pageWidth - 60, yPosition);

      pdf.text(`Billing Period: ${invoice.period}`, margin, yPosition + 10);

      // Total
      yPosition += 30;
      pdf.line(pageWidth - 100, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total:', pageWidth - 80, yPosition);
      pdf.text(`R${invoice.amount.toFixed(2)}`, pageWidth - 60, yPosition);

      // Payment info
      yPosition += 30;
      pdf.setFont('helvetica', 'normal');
      pdf.text('Payment Method:', margin, yPosition);
      pdf.text(invoice.paymentMethod || '**** 4242', margin + 50, yPosition);
      yPosition += 10;
      pdf.text('Transaction ID:', margin, yPosition);
      pdf.text(invoice.transactionId || 'N/A', margin + 50, yPosition);

      // Footer
      yPosition = pdf.internal.pageSize.getHeight() - 30;
      pdf.setFontSize(10);
      pdf.text('Thank you for your business!', margin, yPosition);
      pdf.text(
        `Generated on ${new Date().toLocaleString()}`,
        pageWidth - 100,
        yPosition
      );

      // Save the PDF
      const fileName = `invoice-${invoice.id}.pdf`;
      pdf.save(fileName);

      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to download invoice');
    }
  };

  // Format card number input with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date input (MM/YY)
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Get current plan data and ensure it updates when currentPlan changes
  const currentPlanData = PLANS.find((plan) => plan.id === currentPlan);

  // Get available upgrade plans (higher price than current)
  const getUpgradePlans = () => {
    const currentPrice = currentPlanData?.price || 0;
    return PLANS.filter((plan) => plan.price > currentPrice);
  };

  // Get available downgrade plans (lower price than current)
  const getDowngradePlans = () => {
    const currentPrice = currentPlanData?.price || 0;
    return PLANS.filter((plan) => plan.price < currentPrice);
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
              <CreditCard className="h-8 w-8" />
              Subscription Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your subscription, billing, and usage
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
            <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Plan */}
              <Card className="lg:col-span-2 border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-600" />
                        Current Plan
                      </CardTitle>
                      <CardDescription>
                        Your active subscription details
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          currentPlanData?.badgeColor ||
                          'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        }
                      >
                        {currentPlanData?.name || 'Professional'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingDetails(!isEditingDetails)}
                      >
                        {isEditingDetails ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Cost</p>
                      <p className="text-2xl font-bold">
                        R{currentPlanData?.price || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Billing</p>
                      {isEditingDetails ? (
                        <Input
                          type="date"
                          value={planDetails.nextBilling}
                          onChange={(e) =>
                            setPlanDetails((prev) => ({
                              ...prev,
                              nextBilling: e.target.value,
                            }))
                          }
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-lg font-medium">
                          {new Date(
                            planDetails.nextBilling
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Team Members</span>
                      {isEditingDetails ? (
                        <Input
                          type="number"
                          value={planDetails.teamMembers}
                          onChange={(e) =>
                            setPlanDetails((prev) => ({
                              ...prev,
                              teamMembers: parseInt(e.target.value),
                            }))
                          }
                          className="w-20"
                          max={currentPlanData?.limits.teamMembers}
                        />
                      ) : (
                        <span>
                          {planDetails.teamMembers} /{' '}
                          {currentPlanData?.limits.teamMembers}
                        </span>
                      )}
                    </div>
                    <Progress
                      value={
                        (planDetails.teamMembers /
                          (currentPlanData?.limits.teamMembers || 1)) *
                        100
                      }
                      className="h-2"
                    />

                    <div className="flex items-center justify-between text-sm">
                      <span>Storage Used</span>
                      <span>24GB / {currentPlanData?.limits.storage}GB</span>
                    </div>
                    <Progress
                      value={
                        (24 / (currentPlanData?.limits.storage || 1)) * 100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    {isEditingDetails ? (
                      <Button
                        onClick={handleUpdateDetails}
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      >
                        {isLoading && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowUpgradeModal(true)}
                          disabled={getUpgradePlans().length === 0}
                        >
                          <ArrowUpCircle className="h-4 w-4 mr-2" />
                          Upgrade Plan
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowDowngradeModal(true)}
                          disabled={getDowngradePlans().length === 0}
                        >
                          <ArrowDownCircle className="h-4 w-4 mr-2" />
                          Downgrade Plan
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          This Month
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          R{currentPlanData?.price || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Annual Savings
                        </p>
                        <p className="text-2xl font-bold text-gray-900">R190</p>
                        <p className="text-xs text-gray-500">
                          vs monthly billing
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Status
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {currentPlan === 'free' ? 'Free Plan' : 'Active'}
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <Zap className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Payment Method */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Your default payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{planDetails.paymentMethod}</p>
                      <p className="text-sm text-gray-600">
                        Expires {planDetails.cardExpiry}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans & Pricing Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-gray-600">
                Upgrade or downgrade your subscription anytime
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative border-0 shadow-lg transition-all hover:shadow-xl hover:scale-105 ${
                    currentPlan === plan.id ? 'ring-2 ring-blue-500' : ''
                  } ${plan.popular ? 'border-purple-200' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {currentPlan === plan.id && (
                    <div className="absolute -top-3 right-4">
                      <Badge className={plan.badgeColor}>Current Plan</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl capitalize">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-2">
                      <span className="text-4xl font-bold">R{plan.price}</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <CheckoutButton
                      planId={plan.id}
                      planName={plan.name}
                      price={plan.price}
                      className={`w-full ${
                        currentPlan === plan.id
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }`}
                      variant={currentPlan === plan.id ? 'outline' : 'default'}
                    >
                      {currentPlan === plan.id
                        ? 'Current Plan'
                        : `Subscribe to ${plan.name}`}
                    </CheckoutButton>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cancel Subscription */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Cancel Subscription
                </CardTitle>
                <CardDescription>
                  Cancel your subscription. You'll continue to have access until
                  the end of your billing period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelModal(true)}
                  disabled={isLoading || currentPlan === 'free'}
                >
                  {isLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Cancel Subscription
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  Your payment history and invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingHistory.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded">
                          <Receipt className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.plan} Plan</p>
                          <p className="text-sm text-gray-600">
                            {invoice.period}
                          </p>
                          <p className="text-xs text-gray-500">
                            {invoice.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">R{invoice.amount}</p>
                          <Badge
                            className={
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadInvoice(invoice)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage & Limits Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members
                  </CardTitle>
                  <CardDescription>Current team size and limit</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Used</span>
                    <span className="font-medium">
                      {planDetails.teamMembers} /{' '}
                      {currentPlanData?.limits.teamMembers}
                    </span>
                  </div>
                  <Progress
                    value={
                      (planDetails.teamMembers /
                        (currentPlanData?.limits.teamMembers || 1)) *
                      100
                    }
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600">
                    You have{' '}
                    {(currentPlanData?.limits.teamMembers || 0) -
                      planDetails.teamMembers}{' '}
                    team member slots remaining
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Storage
                  </CardTitle>
                  <CardDescription>Storage usage and limit</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Used</span>
                    <span className="font-medium">
                      24GB / {currentPlanData?.limits.storage}GB
                    </span>
                  </div>
                  <Progress
                    value={(24 / (currentPlanData?.limits.storage || 1)) * 100}
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600">
                    You have {(currentPlanData?.limits.storage || 0) - 24}GB of
                    storage remaining
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    API Calls
                  </CardTitle>
                  <CardDescription>Monthly API usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Used</span>
                    <span className="font-medium">
                      1,250 /{' '}
                      {currentPlanData?.limits.apiCalls?.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={
                      (1250 / (currentPlanData?.limits.apiCalls || 1)) * 100
                    }
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600">
                    You have{' '}
                    {(
                      (currentPlanData?.limits.apiCalls || 0) - 1250
                    ).toLocaleString()}{' '}
                    API calls remaining this month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Projects
                  </CardTitle>
                  <CardDescription>Active projects limit</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Used</span>
                    <span className="font-medium">
                      12 / {currentPlanData?.limits.projects}
                    </span>
                  </div>
                  <Progress
                    value={(12 / (currentPlanData?.limits.projects || 1)) * 100}
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600">
                    You can create{' '}
                    {(currentPlanData?.limits.projects || 0) - 12} more projects
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Cancel Subscription Modal */}
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Cancel Subscription
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your subscription? You'll be
                downgraded to the Free plan at the end of your billing cycle.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">
                  What happens when you cancel:
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• You'll keep access until {planDetails.nextBilling}</li>
                  <li>• After that, you'll be moved to the Free plan</li>
                  <li>
                    • You can reactivate anytime before the billing cycle ends
                  </li>
                  <li>• No refunds for the current billing period</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Subscription
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Cancel Subscription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upgrade Modal */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-green-600" />
                Upgrade Your Plan
              </DialogTitle>
              <DialogDescription>
                Choose a higher tier plan to unlock more features and
                capabilities
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
              {getUpgradePlans().map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedPlan === plan.id
                      ? 'ring-2 ring-green-500 bg-green-50'
                      : ''
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">R{plan.price}</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-xs text-gray-500">
                          +{plan.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUpgradeModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedPlan && handlePlanChange(selectedPlan)}
                disabled={!selectedPlan || isLoading}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Upgrade to{' '}
                {selectedPlan && PLANS.find((p) => p.id === selectedPlan)?.name}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Downgrade Modal */}
        <Dialog open={showDowngradeModal} onOpenChange={setShowDowngradeModal}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-orange-600" />
                Downgrade Your Plan
              </DialogTitle>
              <DialogDescription>
                Choose a lower tier plan. Note that some features may become
                unavailable.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
              {getDowngradePlans().map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedPlan === plan.id
                      ? 'ring-2 ring-orange-500 bg-orange-50'
                      : ''
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">R{plan.price}</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-xs text-gray-500">
                          +{plan.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedPlan && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Important Notice:
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>
                    • Your downgrade will take effect at the end of your current
                    billing cycle
                  </li>
                  <li>• You'll keep access to current features until then</li>
                  <li>
                    • Some data may become inaccessible if it exceeds new plan
                    limits
                  </li>
                  <li>• You can upgrade again at any time</li>
                </ul>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDowngradeModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedPlan && handlePlanChange(selectedPlan)}
                disabled={!selectedPlan || isLoading}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <ArrowDownCircle className="h-4 w-4 mr-2" />
                Downgrade to{' '}
                {selectedPlan && PLANS.find((p) => p.id === selectedPlan)?.name}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Method Update Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Update Payment Method
              </DialogTitle>
              <DialogDescription>
                Update your payment information for future billing cycles
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="cardholderName">Cardholder Name *</Label>
                  <Input
                    id="cardholderName"
                    value={paymentDetails.cardholderName}
                    onChange={(e) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        cardholderName: e.target.value,
                      }))
                    }
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      setPaymentDetails((prev) => ({
                        ...prev,
                        cardNumber: formatted,
                      }));
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    value={paymentDetails.expiryDate}
                    onChange={(e) => {
                      const formatted = formatExpiryDate(e.target.value);
                      setPaymentDetails((prev) => ({
                        ...prev,
                        expiryDate: formatted,
                      }));
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    value={paymentDetails.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPaymentDetails((prev) => ({ ...prev, cvv: value }));
                    }}
                    placeholder="123"
                    maxLength={4}
                    className="mt-1"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <Input
                    id="billingAddress"
                    value={paymentDetails.billingAddress}
                    onChange={(e) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        billingAddress: e.target.value,
                      }))
                    }
                    placeholder="123 Main Street"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={paymentDetails.city}
                    onChange={(e) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    placeholder="New York"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={paymentDetails.zipCode}
                    onChange={(e) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        zipCode: e.target.value,
                      }))
                    }
                    placeholder="10001"
                    className="mt-1"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={paymentDetails.country}
                    onValueChange={(value) =>
                      setPaymentDetails((prev) => ({ ...prev, country: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZA">South Africa</SelectItem>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="BR">Brazil</SelectItem>
                      <SelectItem value="IT">Italy</SelectItem>
                      <SelectItem value="ES">Spain</SelectItem>
                      <SelectItem value="MX">Mexico</SelectItem>
                      <SelectItem value="SG">Singapore</SelectItem>
                      <SelectItem value="NL">Netherlands</SelectItem>
                      <SelectItem value="SE">Sweden</SelectItem>
                      <SelectItem value="CH">Switzerland</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Shield className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-700">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePaymentMethod}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Lock className="h-4 w-4 mr-2" />
                Update Payment Method
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
