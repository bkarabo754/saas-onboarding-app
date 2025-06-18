// components/landing-page/TopRightUserControls.tsx
'use client';

import { SignedIn } from '@clerk/nextjs';
import { UserAvatarDropdown } from '@/components/ui/user-avatar-dropdown';

export function TopRightUserControls() {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
      <SignedIn>
        <UserAvatarDropdown />
      </SignedIn>
    </div>
  );
}
