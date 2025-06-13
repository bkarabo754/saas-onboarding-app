'use client';

import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Settings,
  CreditCard,
  BarChart3,
  Shield,
  HelpCircle,
  LogOut,
  Home,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function UserAvatarDropdown() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success('Successfully signed out');
      router.push('/');
    } catch (error) {
      toast.error('Failed to sign out');
      setIsLoggingOut(false);
    }
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    if (user?.firstName) {
      return user.firstName.charAt(0);
    }
    if (user?.username) {
      return user.username.charAt(0);
    }
    if (user?.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress.charAt(0);
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.username) {
      return user.username;
    }
    return 'User';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-white shadow-lg">
            <AvatarImage src={user?.imageUrl} alt={getDisplayName()} />
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {getDisplayName()}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.emailAddresses?.[0]?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <Link href="/">
          <DropdownMenuItem className="cursor-pointer">
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/dashboard">
          <DropdownMenuItem className="cursor-pointer">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <Link href="/workspace-settings">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Workspace Settings</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/subscription">
          <DropdownMenuItem className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Subscription</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/analytics">
          <DropdownMenuItem className="cursor-pointer">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <Link href="/privacy-security">
          <DropdownMenuItem className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4" />
            <span>Privacy & Security</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/help-support">
          <DropdownMenuItem className="cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
