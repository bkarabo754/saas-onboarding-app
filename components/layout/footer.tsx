'use client';

import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Sparkles,
  Shield,
  Zap,
  Users,
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '/#features' },
        { name: 'Analytics', href: '/analytics' },
        { name: 'Projects', href: '/projects' },
        { name: 'Team Management', href: '/workspace-settings' },
        { name: 'Integrations', href: '/workspace-settings' },
        { name: 'API Documentation', href: '/help-support' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Blog', href: '/blog' },
        { name: 'Press Kit', href: '/press' },
        { name: 'Contact', href: '/help-support' },
        { name: 'Partners', href: '/partners' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Help Center', href: '/help-support' },
        { name: 'Documentation', href: '/help-support' },
        { name: 'Community', href: '/community' },
        { name: 'Tutorials', href: '/tutorials' },
        { name: 'Webinars', href: '/webinars' },
        { name: 'Status Page', href: '/status' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy-security' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'GDPR Compliance', href: '/gdpr' },
        { name: 'Security', href: '/privacy-security' },
        { name: 'Data Processing', href: '/data-processing' },
      ],
    },
  ];

  const socialLinks = [
    {
      name: 'Twitter',
      href: 'https://twitter.com/onboardingiq',
      icon: Twitter,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/onboardingiq',
      icon: Linkedin,
    },
    { name: 'GitHub', href: 'https://github.com/onboardingiq', icon: Github },
    {
      name: 'YouTube',
      href: 'https://youtube.com/onboardingiq',
      icon: Youtube,
    },
  ];

  const features = [
    { name: 'AI-Powered', icon: Sparkles },
    { name: 'Enterprise Security', icon: Shield },
    { name: 'Lightning Fast', icon: Zap },
    { name: 'Team Collaboration', icon: Users },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="md:text-2xl font-bold dark:text-white">
                Onboarding
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  IQ
                </span>
              </h1>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">
              Empowering teams worldwide with intelligent project management and
              collaboration tools. Transform your workflow with AI-powered
              insights and seamless team coordination.
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {features.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <div key={feature.name} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">
                      {feature.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="h-4 w-4 text-blue-400" />
                <a
                  href="mailto:hello@onboardingiq.com"
                  className="hover:text-white transition-colors"
                >
                  hello@onboardingiq.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="h-4 w-4 text-blue-400" />
                <a
                  href="tel:+27 (065) 807-3689"
                  className="hover:text-white transition-colors"
                >
                  +27 (065) 807-3689
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span>310 Boundary Rd, North Riding AH, Roodepoort, 2169</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Stay Updated
              </h3>
              <p className="text-gray-300">
                Get the latest updates, tips, and insights delivered to your
                inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Social Links & Trust Badges */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Social Media */}
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm">Follow us:</span>
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
                    aria-label={social.name}
                  >
                    <IconComponent className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                  </a>
                );
              })}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-300">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-sm">SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-sm">GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-sm">ISO 27001</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {currentYear} OnboardingIQ, Inc. All rights reserved.
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/privacy-security"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cookies
              </Link>
              <Link
                href="/help-support"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
