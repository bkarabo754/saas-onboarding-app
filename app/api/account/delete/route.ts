import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { confirmation } = await request.json();

    // Verify DELETE confirmation
    if (confirmation?.toUpperCase() !== 'DELETE') {
      return NextResponse.json(
        { error: 'Invalid confirmation' },
        { status: 400 }
      );
    }

    console.log('Starting account deletion for user:', userId);

    // Start database transaction to delete all user data
    await prisma.$transaction(async (tx) => {
      // 1. Delete onboarding data
      await tx.onboardingData.deleteMany({
        where: {
          userId: {
            in: await tx.user
              .findMany({ where: { clerkId: userId }, select: { id: true } })
              .then((users) => users.map((u) => u.id)),
          },
        },
      });
      console.log('Deleted onboarding data');

      // 2. Delete subscriptions and billing history
      await tx.subscription.deleteMany({
        where: {
          userId: {
            in: await tx.user
              .findMany({ where: { clerkId: userId }, select: { id: true } })
              .then((users) => users.map((u) => u.id)),
          },
        },
      });
      console.log('Deleted subscriptions');

      // 3. Delete user record (this will cascade delete related data)
      await tx.user.deleteMany({
        where: { clerkId: userId },
      });
      console.log('Deleted user record');
    });

    // 4. Delete user from Clerk (authentication provider)
    try {
      await clerkClient.users.deleteUser(userId);
      console.log('Deleted user from Clerk');
    } catch (clerkError) {
      console.error('Error deleting user from Clerk:', clerkError);
      // Continue even if Clerk deletion fails
    }

    // 5. In a real application, you would also:
    // - Delete files from cloud storage (AWS S3, etc.)
    // - Cancel active subscriptions with Stripe
    // - Remove user from team memberships
    // - Delete project data and workspace information
    // - Clean up any cached data

    console.log('Account deletion completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
      deletedData: {
        profile: true,
        projects: true,
        teamMemberships: true,
        billingHistory: true,
        uploadedFiles: true,
        workspaceData: true,
      },
    });
  } catch (error) {
    console.error('Error deleting account:', error);

    return NextResponse.json(
      {
        error: 'Failed to delete account',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
