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

const BILLING_HISTORY = [
  {
    id: 'inv_001',
    date: '2024-01-15',
    amount: 79,
    status: 'paid',
    plan: 'Professional',
    period: 'Jan 15 - March 15, 2025',
    invoiceUrl: '#',
  },
  {
    id: 'inv_002',
    date: '2023-12-15',
    amount: 79,
    status: 'paid',
    plan: 'Professional',
    period: 'Dec 15 - Jan 15, 2025',
    invoiceUrl: '#',
  },
  {
    id: 'inv_003',
    date: '2023-11-15',
    amount: 79,
    status: 'paid',
    plan: 'Professional',
    period: 'Sep 9 - May 02, 2025',
    invoiceUrl: '#',
  },
  {
    id: 'inv_004',
    date: '2023-10-15',
    amount: 29,
    status: 'paid',
    plan: 'Starter',
    period: 'April 26 - Nov 15, 2024',
    invoiceUrl: '#',
  },
];

export default function SubscriptionPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('professional');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [planDetails, setPlanDetails] = useState({
    teamMembers: 8,
    nextBilling: '2025-02-15',
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
    country: 'US',
  });

  // Handle success/cancel from Stripe
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const plan = searchParams.get('plan');

    if (success && plan) {
      setCurrentPlan(plan);
      toast.success(`Successfully upgraded to ${plan} plan!`);

      // Add notification
      const notification = {
        id: Date.now().toString(),
        type: 'subscription',
        title: 'Plan Upgraded',
        message: `Your subscription has been upgraded to the ${plan} plan`,
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
      if (planId === 'free') {
        // Handle downgrade to free
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setCurrentPlan('free');
        toast.success('Successfully downgraded to Free plan!');

        // Add notification
        const notification = {
          id: Date.now().toString(),
          type: 'subscription',
          title: 'Plan Downgraded',
          message: 'Your subscription has been downgraded to the Free plan',
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
      } else {
        // For demo purposes, simulate successful upgrade without Stripe
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setCurrentPlan(planId);

        const planName = PLANS.find((p) => p.id === planId)?.name;
        toast.success(`Successfully upgraded to ${planName} plan!`);

        // Add notification
        const notification = {
          id: Date.now().toString(),
          type: 'subscription',
          title: 'Plan Upgraded',
          message: `Your subscription has been upgraded to the ${planName} plan`,
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
    } catch (error) {
      toast.error('Failed to change plan');
    } finally {
      setIsLoading(false);
      setShowUpgradeModal(false);
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
        country: 'US',
      });
    } catch (error) {
      toast.error('Failed to update payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const invoice = BILLING_HISTORY.find((inv) => inv.id === invoiceId);
      if (invoice) {
        // Create a simple PDF-like content
        const pdfContent = `
INVOICE ${invoiceId}
=====================================

Date: ${invoice.date}
Plan: ${invoice.plan}
Period: ${invoice.period}
Amount: R${invoice.amount}
Status: ${invoice.status.toUpperCase()}

Thank you for your business!
        `;

        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Invoice downloaded successfully');
      }
    } catch (error) {
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
                          onClick={() => {
                            setSelectedPlan('enterprise');
                            setShowUpgradeModal(true);
                          }}
                          disabled={currentPlan === 'enterprise'}
                        >
                          <ArrowUpCircle className="h-4 w-4 mr-2" />
                          Upgrade Plan
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedPlan('free');
                            setShowUpgradeModal(true);
                          }}
                          disabled={currentPlan === 'free'}
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

                    <Button
                      className={`w-full ${
                        currentPlan === plan.id
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }`}
                      disabled={currentPlan === plan.id || isLoading}
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        setShowUpgradeModal(true);
                      }}
                    >
                      {isLoading && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
                    </Button>
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
                  {BILLING_HISTORY.map((invoice) => (
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
                          onClick={() => downloadInvoice(invoice.id)}
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

        {/* Upgrade/Downgrade Modal */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {selectedPlan === 'free' ? 'Downgrade Plan' : 'Upgrade Plan'}
              </DialogTitle>
              <DialogDescription>
                {selectedPlan === 'free'
                  ? 'Downgrade to the Free plan and lose access to premium features'
                  : `Upgrade to ${PLANS.find((p) => p.id === selectedPlan)?.name} plan for enhanced features`}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedPlan && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium capitalize">
                      {PLANS.find((p) => p.id === selectedPlan)?.name} Plan
                    </h4>
                    <span className="text-2xl font-bold">
                      R{PLANS.find((p) => p.id === selectedPlan)?.price}/month
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {PLANS.find((p) => p.id === selectedPlan)?.features.map(
                      (feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {feature}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUpgradeModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handlePlanChange(selectedPlan)}
                disabled={isLoading}
                className={
                  selectedPlan === 'free'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {selectedPlan === 'free' ? 'Downgrade to Free' : 'Upgrade Plan'}
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
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
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
