'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  Lock,
  Shield,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Star,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  Info,
  Smartphone,
  Tablet,
  Monitor,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PRICING_PLANS } from '@/lib/stripe';
import {
  checkoutFormSchema,
  type CheckoutFormData,
  formatCardNumber,
  formatExpiryDate,
  formatCVV,
  getCardType,
} from '@/lib/validations/checkout';

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

export default function CheckoutPageContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [planId, setPlanId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [showCVVInfo, setShowCVVInfo] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop'
  );

  // Detect device type for responsive design
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Initialize form with Zod validation
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      cardholderName: '',
      email: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      billingAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'ZA',
    },
    mode: 'onChange', // Validate on change for better UX
  });

  const {
    watch,
    setValue,
    formState: { errors, isValid },
  } = form;
  const watchedCardNumber = watch('cardNumber');
  const cardType = getCardType(watchedCardNumber);

  // Get plan and session from URL params
  useEffect(() => {
    const plan = searchParams.get('plan');
    const session = searchParams.get('session_id');

    if (plan) setPlanId(plan);
    if (session) setSessionId(session);

    // If no plan specified, redirect to subscription page
    if (!plan) {
      router.push('/subscription');
    }
  }, [searchParams, router]);

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setValue('cardholderName', user.fullName || '');
      setValue('email', user.emailAddresses[0]?.emailAddress || '');
    }
  }, [user, setValue]);

  const plan = planId
    ? PRICING_PLANS[planId as keyof typeof PRICING_PLANS]
    : null;

  // Handle form submission
  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);

    try {
      // Simulate payment processing with validation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // In production, this would process the payment with Stripe
      const paymentResult = {
        success: true,
        paymentIntentId: `pi_demo_${Date.now()}`,
        subscriptionId: `sub_demo_${Date.now()}`,
        customerId: `cus_demo_${Date.now()}`,
      };

      if (paymentResult.success) {
        // Calculate totals
        const subtotal = plan?.price || 0;
        const tax = Math.round(subtotal * 0.08 * 100) / 100;
        const total = subtotal + tax;

        // Add billing history entry
        const newBillingEntry = {
          id: `inv_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amount: total,
          status: 'paid',
          plan: plan?.name || '',
          period: `${new Date().toLocaleDateString()} - ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
          invoiceUrl: '#',
          paymentMethod: `**** ${data.cardNumber.slice(-4)}`,
          transactionId: paymentResult.paymentIntentId,
          cardType: cardType,
          billingAddress: {
            name: data.cardholderName,
            email: data.email,
            address: data.billingAddress,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
          },
        };

        // Store billing history
        const existingBilling = JSON.parse(
          localStorage.getItem('billingHistory') || '[]'
        );
        localStorage.setItem(
          'billingHistory',
          JSON.stringify([newBillingEntry, ...existingBilling])
        );

        // Add success notification
        const notification = {
          id: Date.now().toString(),
          type: 'subscription',
          title: 'Payment Successful',
          message: `Your ${plan?.name} subscription has been activated successfully. Total charged: R${total.toFixed(2)}`,
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
          `Payment successful! Your ${plan?.name} subscription has been activated.`
        );

        // Redirect to success page
        setTimeout(() => {
          router.push(
            `/subscription?success=true&plan=${planId}&session_id=${sessionId}`
          );
        }, 1500);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(
        'Payment failed. Please check your information and try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle formatted input changes
  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setValue('cardNumber', formatted, { shouldValidate: true });
  };

  const handleExpiryDateChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    setValue('expiryDate', formatted, { shouldValidate: true });
  };

  const handleCVVChange = (value: string) => {
    const formatted = formatCVV(value);
    setValue('cvv', formatted, { shouldValidate: true });
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  const subtotal = plan.price;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + tax;

  // Get device-specific icon
  const DeviceIcon =
    deviceType === 'mobile'
      ? Smartphone
      : deviceType === 'tablet'
        ? Tablet
        : Monitor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <Link href="/subscription">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8" />
              Secure Checkout
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Complete your subscription to {plan.name}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
            <DeviceIcon className="h-4 w-4" />
            <span className="capitalize">{deviceType} View</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {/* Payment Form */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Security Notice */}
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-green-900 text-sm sm:text-base">
                          Secure Payment
                        </h3>
                        <p className="text-xs sm:text-sm text-green-700">
                          Your payment information is encrypted and secure
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                      Payment Information
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Enter your payment details to complete your subscription
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Cardholder Name */}
                      <div className="sm:col-span-2">
                        <FormField
                          control={form.control}
                          name="cardholderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Cardholder Name *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="John Doe"
                                  className={`mt-1 ${errors.cardholderName ? 'border-red-300 focus:border-red-500' : ''}`}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Email */}
                      <div className="sm:col-span-2">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Email Address *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="john@example.com"
                                  className={`mt-1 ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Card Number */}
                      <div className="sm:col-span-2">
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Card Number *
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    onChange={(e) =>
                                      handleCardNumberChange(e.target.value)
                                    }
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
                                    className={`mt-1 pr-16 ${errors.cardNumber ? 'border-red-300 focus:border-red-500' : ''}`}
                                  />
                                  {cardType !== 'Unknown' &&
                                    watchedCardNumber && (
                                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {cardType}
                                        </Badge>
                                      </div>
                                    )}
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Expiry Date */}
                      <div>
                        <FormField
                          control={form.control}
                          name="expiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Expiry Date *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  onChange={(e) =>
                                    handleExpiryDateChange(e.target.value)
                                  }
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  className={`mt-1 ${errors.expiryDate ? 'border-red-300 focus:border-red-500' : ''}`}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* CVV */}
                      <div>
                        <FormField
                          control={form.control}
                          name="cvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                CVV *
                                <button
                                  type="button"
                                  onClick={() => setShowCVVInfo(!showCVVInfo)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <Info className="h-3 w-3" />
                                </button>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  onChange={(e) =>
                                    handleCVVChange(e.target.value)
                                  }
                                  placeholder={
                                    cardType === 'American Express'
                                      ? '1234'
                                      : '123'
                                  }
                                  maxLength={
                                    cardType === 'American Express' ? 4 : 3
                                  }
                                  className={`mt-1 ${errors.cvv ? 'border-red-300 focus:border-red-500' : ''}`}
                                />
                              </FormControl>
                              {showCVVInfo && (
                                <FormDescription className="text-xs bg-blue-50 p-2 rounded border">
                                  The CVV is the{' '}
                                  {cardType === 'American Express'
                                    ? '4-digit'
                                    : '3-digit'}{' '}
                                  security code
                                  {cardType === 'American Express'
                                    ? ' on the front'
                                    : ' on the back'}{' '}
                                  of your card.
                                </FormDescription>
                              )}
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Address */}
                <Card>
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl">
                      Billing Address
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Enter your billing address for payment verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Address */}
                      <div className="sm:col-span-2">
                        <FormField
                          control={form.control}
                          name="billingAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Address
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="123 Main Street"
                                  className={`mt-1 ${errors.billingAddress ? 'border-red-300 focus:border-red-500' : ''}`}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* City */}
                      <div>
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                City
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Johannesburg"
                                  className={`mt-1 ${errors.city ? 'border-red-300 focus:border-red-500' : ''}`}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* State */}
                      <div>
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                State/Province
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Gauteng"
                                  className={`mt-1 ${errors.state ? 'border-red-300 focus:border-red-500' : ''}`}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* ZIP Code */}
                      <div>
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                ZIP/Postal Code
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="10001"
                                  className={`mt-1 ${errors.zipCode ? 'border-red-300 focus:border-red-500' : ''}`}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Country */}
                      <div>
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Country *
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {COUNTRIES.map((country) => (
                                    <SelectItem
                                      key={country.code}
                                      value={country.code}
                                    >
                                      {country.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary - Sticky on desktop */}
              <div className="space-y-4 sm:space-y-6">
                <Card className="lg:sticky lg:top-8">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl">
                      Order Summary
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Review your subscription details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Plan Details */}
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-blue-900 text-sm sm:text-base">
                          {plan.name} Plan
                        </h3>
                        <p className="text-xs sm:text-sm text-blue-700">
                          Monthly subscription
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl sm:text-2xl font-bold text-blue-900">
                          R{plan.price}
                        </p>
                        <p className="text-xs sm:text-sm text-blue-600">
                          /month
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">
                        Included features:
                      </h4>
                      <ul className="space-y-1 max-h-32 sm:max-h-40 overflow-y-auto">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-xs sm:text-sm"
                          >
                            <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    {/* Pricing Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>R{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (8%)</span>
                        <span>R{tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-sm sm:text-base">
                        <span>Total</span>
                        <span>R{total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Billing Info */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-800">
                            Billing Information
                          </p>
                          <p className="text-yellow-700 text-xs sm:text-sm">
                            You'll be charged R{total.toFixed(2)} today, then R
                            {plan.price}/month
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Button */}
                    <Button
                      type="submit"
                      disabled={isProcessing || !isValid}
                      className={`w-full py-3 sm:py-4 text-sm sm:text-base font-medium transition-all ${
                        !isValid
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white hover:shadow-lg'
                      }`}
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Complete Payment R{total.toFixed(2)}
                        </>
                      )}
                    </Button>

                    {/* Security Notice */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Shield className="h-3 w-3" />
                        <span>Secured by 256-bit SSL encryption</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Money Back Guarantee */}
                <Card className="border-green-200">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-green-900 text-sm">
                          30-Day Money Back Guarantee
                        </h3>
                        <p className="text-xs text-green-700">
                          Cancel anytime within 30 days for a full refund
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
