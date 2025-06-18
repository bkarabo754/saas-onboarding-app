'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  CreditCard,
  Crown,
  Check,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  DollarSign,
  Users,
  Zap,
  Shield,
  Download,
  FileText,
  Loader2,
  Lock,
  CheckCircle,
  AlertCircle,
  Star,
  Info,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PRICING_PLANS } from '@/lib/stripe';
import {
  paymentMethodSchema,
  type PaymentMethodFormData,
  formatCardNumber,
  formatExpiryDate,
  formatCVV,
  getCardType,
} from '@/lib/validations/payment-method';
import jsPDF from 'jspdf';

const COUNTRIES = [
  { code: 'ZA', name: 'South Africa' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
];

interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  period: string;
  invoiceUrl: string;
  paymentMethod?: string;
  transactionId?: string;
  cardType?: string;
  billingAddress?: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function SubscriptionPageContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null); // Track which plan is loading
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<
    string | null
  >(null); // Track which invoice is downloading
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showCVVInfo, setShowCVVInfo] = useState(false);

  // Use ref to track if we've already processed the success URL
  const hasProcessedSuccess = useRef(false);

  // Initialize currentPlan from localStorage with fallback
  const [currentPlan, setCurrentPlan] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentPlan') || 'professional';
    }
    return 'professional';
  });

  const [paymentDetails, setPaymentDetails] = useState<PaymentMethodFormData>({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: 'US',
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [billingHistory] = useState<BillingHistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('billingHistory') || '[]');
    }
    return [];
  });

  // Handle URL parameters for successful payments - ONLY ONCE
  useEffect(() => {
    const success = searchParams.get('success');
    const planFromUrl = searchParams.get('plan');

    // Only process if we haven't already processed this success and both parameters exist
    if (success === 'true' && planFromUrl && !hasProcessedSuccess.current) {
      hasProcessedSuccess.current = true; // Mark as processed

      // Update current plan and persist to localStorage
      setCurrentPlan(planFromUrl);
      localStorage.setItem('currentPlan', planFromUrl);

      const planName =
        PRICING_PLANS[planFromUrl as keyof typeof PRICING_PLANS]?.name ||
        planFromUrl;
      toast.success(`Successfully upgraded to ${planName} plan!`);

      // Clean up URL parameters after processing
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      url.searchParams.delete('plan');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  // Validate form in real-time
  useEffect(() => {
    try {
      paymentMethodSchema.parse(paymentDetails);
      setValidationErrors({});
    } catch (error: any) {
      const errors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            errors[err.path[0]] = err.message;
          }
        });
      }
      setValidationErrors(errors);
    }
  }, [paymentDetails]);

  const handlePlanChange = async (planId: string) => {
    setLoadingPlanId(planId); // Set loading for this specific plan
    try {
      if (planId === 'free') {
        // Handle free plan directly
        setCurrentPlan(planId);
        localStorage.setItem('currentPlan', planId);

        toast.success('Successfully downgraded to Free plan!');
        setShowDowngradeModal(false);
        setShowUpgradeModal(false);
        setSelectedPlan('');
      } else {
        // For paid plans, redirect to checkout
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            successUrl: `${window.location.origin}/subscription?success=true&plan=${planId}`,
            cancelUrl: `${window.location.origin}/subscription?canceled=true`,
          }),
        });

        const { redirectUrl } = await response.json();

        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      }
    } catch (error) {
      toast.error('Failed to process plan change');
    } finally {
      setLoadingPlanId(null); // Clear loading state
    }
  };

  const handleUpdatePaymentMethod = async () => {
    // Validate form
    try {
      paymentMethodSchema.parse(paymentDetails);
    } catch (error: any) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setIsPaymentLoading(true);
    try {
      // Simulate API call to update payment method
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Add notification
      const notification = {
        id: Date.now().toString(),
        type: 'billing',
        title: 'Payment Method Updated',
        message: `Payment method ending in ${paymentDetails.cardNumber.slice(-4)} has been updated successfully`,
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

      toast.success('Payment method updated successfully!');
      setShowPaymentModal(false);

      // Reset form
      setPaymentDetails({
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        billingAddress: '',
        city: '',
        zipCode: '',
        country: 'US',
      });
    } catch (error) {
      toast.error('Failed to update payment method');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleDownloadInvoice = async (item: BillingHistoryItem) => {
    setDownloadingInvoiceId(item.id);

    try {
      // Simulate download delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create PDF invoice
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;

      // Helper function to add text
      const addText = (text: string, x: number, y: number, options?: any) => {
        pdf.text(text, x, y, options);
        return y + 7;
      };

      // Header with company info
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('INVOICE', margin, yPosition);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText('SaaS Platform Inc.', margin, yPosition + 10);
      yPosition = addText('123 Business Street', margin, yPosition);
      yPosition = addText('San Francisco, CA 94105', margin, yPosition);
      yPosition = addText('support@saasplatform.com', margin, yPosition);

      // Invoice details (right side)
      pdf.setFont('helvetica', 'bold');
      pdf.text('Invoice #:', pageWidth - 80, 50);
      pdf.text('Date:', pageWidth - 80, 60);
      pdf.text('Due Date:', pageWidth - 80, 70);
      pdf.text('Status:', pageWidth - 80, 80);

      pdf.setFont('helvetica', 'normal');
      pdf.text(item.id, pageWidth - 50, 50);
      pdf.text(item.date, pageWidth - 50, 60);
      pdf.text(item.date, pageWidth - 50, 70);
      pdf.text(item.status.toUpperCase(), pageWidth - 50, 80);

      yPosition = 100;

      // Bill to section
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('BILL TO:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');

      if (item.billingAddress) {
        yPosition = addText(item.billingAddress.name, margin, yPosition);
        yPosition = addText(item.billingAddress.email, margin, yPosition);
        yPosition = addText(item.billingAddress.address, margin, yPosition);
        yPosition = addText(
          `${item.billingAddress.city}, ${item.billingAddress.state} ${item.billingAddress.zipCode}`,
          margin,
          yPosition
        );
        yPosition = addText(item.billingAddress.country, margin, yPosition);
      } else {
        yPosition = addText(user?.fullName || 'Customer', margin, yPosition);
        yPosition = addText(
          user?.emailAddresses[0]?.emailAddress || 'customer@example.com',
          margin,
          yPosition
        );
      }

      yPosition += 20;

      // Service details table
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('DESCRIPTION', margin, yPosition);
      pdf.text('PERIOD', margin + 80, yPosition - 7);
      pdf.text('AMOUNT', pageWidth - 50, yPosition - 7);

      // Table line
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      yPosition = addText(`${item.plan} Plan Subscription`, margin, yPosition);
      pdf.text(item.period, margin + 80, yPosition - 7);
      pdf.text(`R${item.amount.toFixed(2)}`, pageWidth - 50, yPosition - 7);

      yPosition += 20;

      // Totals
      pdf.line(margin + 100, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      const subtotal = item.amount / 1.08; // Assuming 8% tax
      const tax = item.amount - subtotal;

      pdf.text('Subtotal:', margin + 100, yPosition);
      pdf.text(`R${subtotal.toFixed(2)}`, pageWidth - 50, yPosition);
      yPosition += 10;

      pdf.text('Tax (8%):', margin + 100, yPosition);
      pdf.text(`R${tax.toFixed(2)}`, pageWidth - 50, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Total:', margin + 100, yPosition);
      pdf.text(`R${item.amount.toFixed(2)}`, pageWidth - 50, yPosition);

      yPosition += 30;

      // Payment information
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('PAYMENT INFORMATION', margin, yPosition);
      pdf.setFont('helvetica', 'normal');

      if (item.paymentMethod) {
        yPosition = addText(
          `Payment Method: ${item.paymentMethod}`,
          margin,
          yPosition
        );
      }
      if (item.transactionId) {
        yPosition = addText(
          `Transaction ID: ${item.transactionId}`,
          margin,
          yPosition
        );
      }

      yPosition += 20;

      // Footer
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      yPosition = addText('Thank you for your business!', margin, yPosition);
      yPosition = addText(
        'For questions about this invoice, please contact support@saasplatform.com',
        margin,
        yPosition
      );

      // Page footer
      pdf.text(
        'This is a computer-generated invoice.',
        margin,
        pdf.internal.pageSize.getHeight() - 20
      );
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()}`,
        pageWidth - 80,
        pdf.internal.pageSize.getHeight() - 20
      );

      // Save the PDF
      const fileName = `invoice-${item.id}-${item.date}.pdf`;
      pdf.save(fileName);

      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const getUpgradePlans = () => {
    const plans = Object.entries(PRICING_PLANS);
    const currentPlanIndex = plans.findIndex(([key]) => key === currentPlan);
    return plans
      .slice(currentPlanIndex + 1)
      .map(([key, plan]) => ({ id: key, ...plan }));
  };

  const getDowngradePlans = () => {
    const plans = Object.entries(PRICING_PLANS);
    const currentPlanIndex = plans.findIndex(([key]) => key === currentPlan);
    return plans
      .slice(0, currentPlanIndex)
      .map(([key, plan]) => ({ id: key, ...plan }));
  };

  const currentPlanData =
    PRICING_PLANS[currentPlan as keyof typeof PRICING_PLANS];
  const cardType = getCardType(paymentDetails.cardNumber);

  // Check if form is valid for enabling the button
  const isFormValid = () => {
    try {
      paymentMethodSchema.parse(paymentDetails);
      return true;
    } catch {
      return false;
    }
  };

  // Handle formatted input changes
  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setPaymentDetails((prev) => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryDateChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    setPaymentDetails((prev) => ({ ...prev, expiryDate: formatted }));
  };

  const handleCVVChange = (value: string) => {
    const formatted = formatCVV(value);
    setPaymentDetails((prev) => ({ ...prev, cvv: formatted }));
  };

  const updatePaymentDetail = (
    field: keyof PaymentMethodFormData,
    value: string
  ) => {
    setPaymentDetails((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              ← Back to Dashboard
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Crown className="h-6 w-6 sm:h-8 sm:w-8" />
              Subscription Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage your subscription plan and billing information
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Plan */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Current Plan
                  </CardTitle>
                  <CardDescription>
                    Your active subscription details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {currentPlanData?.name}
                      </h3>
                      <p className="text-gray-600">
                        R{currentPlanData?.price}/month
                      </p>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Active
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Plan Features:</h4>
                    <ul className="space-y-2">
                      {currentPlanData?.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row gap-2">
                    {getUpgradePlans().length > 0 && (
                      <Button
                        onClick={() => setShowUpgradeModal(true)}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 flex-1"
                      >
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    )}

                    {getDowngradePlans().length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => setShowDowngradeModal(true)}
                        className="flex-1"
                      >
                        <ArrowDownCircle className="h-4 w-4 mr-2" />
                        Downgrade Plan
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Billing Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>
                    Manage your payment information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <CreditCard className="h-8 w-8 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-600">Expires 12/25</p>
                    </div>
                    <Badge variant="outline">Visa</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Next billing date:</span>
                      <span className="font-medium">January 15, 2024</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Billing amount:</span>
                      <span className="font-medium">
                        R{currentPlanData?.price}/month
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Payment Method
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Usage Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>
                  Your current usage across plan limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Team Members</span>
                      <span>8 / 25</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: '32%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage Used</span>
                      <span>24GB / 100GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: '24%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>API Calls</span>
                      <span>1.2K / 10K</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: '12%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(PRICING_PLANS).map(([planId, plan]) => (
                <Card
                  key={planId}
                  className={`border-0 shadow-lg transition-all hover:shadow-xl ${
                    currentPlan === planId ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <CardHeader className="text-center">
                    {currentPlan === planId && (
                      <Badge className="bg-blue-100 text-blue-800 mb-2 w-fit mx-auto">
                        Current Plan
                      </Badge>
                    )}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      R{plan.price}
                      <span className="text-sm font-normal text-gray-600">
                        /month
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {currentPlan !== planId && (
                      <Button
                        onClick={() => handlePlanChange(planId)}
                        disabled={loadingPlanId === planId} // Only disable this specific plan
                        className="w-full"
                        variant={planId === 'free' ? 'outline' : 'default'}
                      >
                        {loadingPlanId === planId && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        {planId === 'free' ? 'Downgrade' : 'Upgrade'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Billing History
                </CardTitle>
                <CardDescription>
                  View and download your past invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                {billingHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No billing history available
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {billingHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.plan} Plan</h4>
                            <Badge
                              variant={
                                item.status === 'paid'
                                  ? 'default'
                                  : item.status === 'pending'
                                    ? 'secondary'
                                    : 'destructive'
                              }
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{item.period}</p>
                          <p className="text-xs text-gray-500">
                            {item.paymentMethod && `${item.paymentMethod} • `}
                            Transaction ID: {item.transactionId}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">
                              R{item.amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">{item.date}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(item)}
                            disabled={downloadingInvoiceId === item.id}
                          >
                            {downloadingInvoiceId === item.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-2" />
                            )}
                            {downloadingInvoiceId === item.id
                              ? 'Generating...'
                              : 'Invoice'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upgrade Modal */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-700">
                <ArrowUpCircle className="h-5 w-5" />
                Upgrade Your Plan
              </DialogTitle>
              <DialogDescription>
                Choose a higher-tier plan to unlock more features and
                capabilities.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getUpgradePlans().map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{plan.name}</h4>
                      <span className="text-xl font-bold">
                        R{plan.price}/month
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
                disabled={loadingPlanId === selectedPlan || !selectedPlan}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loadingPlanId === selectedPlan && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Upgrade Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Downgrade Modal */}
        <Dialog open={showDowngradeModal} onOpenChange={setShowDowngradeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-700">
                <ArrowDownCircle className="h-5 w-5" />
                Downgrade Plan
              </DialogTitle>
              <DialogDescription>
                Choose a lower-tier plan. Some features may be limited.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-orange-800 mb-2">Important:</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• You may lose access to some premium features</li>
                  <li>• Team member limits may apply</li>
                  <li>• Storage limits may be reduced</li>
                  <li>
                    • Changes take effect at the end of your billing cycle
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                {getDowngradePlans().map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{plan.name}</h4>
                      <span className="text-xl font-bold">
                        R{plan.price}/month
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDowngradeModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedPlan && handlePlanChange(selectedPlan)}
                disabled={loadingPlanId === selectedPlan || !selectedPlan}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loadingPlanId === selectedPlan && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Downgrade Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Method Update Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Update Payment Method
              </DialogTitle>
              <DialogDescription>
                Update your payment information for future billing cycles
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900">
                      Secure Payment
                    </h4>
                    <p className="text-sm text-green-700">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cardholder Name */}
                <div className="md:col-span-2">
                  <Label htmlFor="cardholderName">Cardholder Name *</Label>
                  <Input
                    id="cardholderName"
                    value={paymentDetails.cardholderName}
                    onChange={(e) =>
                      updatePaymentDetail('cardholderName', e.target.value)
                    }
                    placeholder="John Doe"
                    className={`mt-1 ${validationErrors.cardholderName ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {validationErrors.cardholderName && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.cardholderName}
                    </p>
                  )}
                </div>

                {/* Card Number */}
                <div className="md:col-span-2">
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      value={paymentDetails.cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`mt-1 pr-16 ${validationErrors.cardNumber ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                    {cardType !== 'Unknown' && paymentDetails.cardNumber && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Badge variant="outline" className="text-xs">
                          {cardType}
                        </Badge>
                      </div>
                    )}
                  </div>
                  {validationErrors.cardNumber && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.cardNumber}
                    </p>
                  )}
                </div>

                {/* Expiry Date */}
                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    value={paymentDetails.expiryDate}
                    onChange={(e) => handleExpiryDateChange(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={`mt-1 ${validationErrors.expiryDate ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {validationErrors.expiryDate && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.expiryDate}
                    </p>
                  )}
                </div>

                {/* CVV */}
                <div>
                  <Label htmlFor="cvv" className="flex items-center gap-2">
                    CVV *
                    <button
                      type="button"
                      onClick={() => setShowCVVInfo(!showCVVInfo)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Info className="h-3 w-3" />
                    </button>
                  </Label>
                  <Input
                    id="cvv"
                    value={paymentDetails.cvv}
                    onChange={(e) => handleCVVChange(e.target.value)}
                    placeholder={
                      cardType === 'American Express' ? '1234' : '123'
                    }
                    maxLength={cardType === 'American Express' ? 4 : 3}
                    className={`mt-1 ${validationErrors.cvv ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {showCVVInfo && (
                    <p className="text-xs bg-blue-50 p-2 rounded border mt-1">
                      The CVV is the{' '}
                      {cardType === 'American Express' ? '4-digit' : '3-digit'}{' '}
                      security code
                      {cardType === 'American Express'
                        ? ' on the front'
                        : ' on the back'}{' '}
                      of your card.
                    </p>
                  )}
                  {validationErrors.cvv && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.cvv}
                    </p>
                  )}
                </div>

                {/* Billing Address */}
                <div className="md:col-span-2">
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <Input
                    id="billingAddress"
                    value={paymentDetails.billingAddress}
                    onChange={(e) =>
                      updatePaymentDetail('billingAddress', e.target.value)
                    }
                    placeholder="123 Main Street"
                    className={`mt-1 ${validationErrors.billingAddress ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {validationErrors.billingAddress && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.billingAddress}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={paymentDetails.city}
                    onChange={(e) =>
                      updatePaymentDetail('city', e.target.value)
                    }
                    placeholder="New York"
                    className={`mt-1 ${validationErrors.city ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {validationErrors.city && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.city}
                    </p>
                  )}
                </div>

                {/* ZIP Code */}
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={paymentDetails.zipCode}
                    onChange={(e) =>
                      updatePaymentDetail('zipCode', e.target.value)
                    }
                    placeholder="10001"
                    className={`mt-1 ${validationErrors.zipCode ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {validationErrors.zipCode && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.zipCode}
                    </p>
                  )}
                </div>

                {/* Country */}
                <div className="md:col-span-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={paymentDetails.country}
                    onValueChange={(value) =>
                      updatePaymentDetail('country', value)
                    }
                  >
                    <SelectTrigger
                      className={`mt-1 ${validationErrors.country ? 'border-red-300 focus:border-red-500' : ''}`}
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.country && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.country}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Summary */}
              {isFormValid() && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Payment Method Summary
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      Card: {cardType} ending in{' '}
                      {paymentDetails.cardNumber.slice(-4)}
                    </p>
                    <p>Expires: {paymentDetails.expiryDate}</p>
                    <p>Cardholder: {paymentDetails.cardholderName}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentDetails({
                    cardholderName: '',
                    cardNumber: '',
                    expiryDate: '',
                    cvv: '',
                    billingAddress: '',
                    city: '',
                    zipCode: '',
                    country: 'US',
                  });
                  setValidationErrors({});
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePaymentMethod}
                disabled={isPaymentLoading || !isFormValid()}
                className={`${
                  !isFormValid()
                    ? 'opacity-50 cursor-not-allowed bg-gray-300'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {isPaymentLoading && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
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
