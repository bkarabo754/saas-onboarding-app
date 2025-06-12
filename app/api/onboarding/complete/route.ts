import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const onboardingData = await request.json();

    console.log('Creating/updating user for:', userId);
    console.log('User email:', clerkUser.emailAddresses[0]?.emailAddress);

    // Create or update user record
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
      },
      create: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
      },
    });

    console.log('User created/updated:', user.id);

    // Create or update onboarding data
    const onboardingRecord = await prisma.onboardingData.upsert({
      where: { userId: user.id },
      update: {
        ...onboardingData,
        completedSteps: 5,
        isCompleted: true,
      },
      create: {
        userId: user.id,
        ...onboardingData,
        completedSteps: 5,
        isCompleted: true,
      },
    });

    console.log('Onboarding data saved:', onboardingRecord.id);

    return NextResponse.json({
      success: true,
      userId: user.id,
      onboardingId: onboardingRecord.id,
    });
  } catch (error) {
    console.error('Detailed error in onboarding completion:', error);

    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        return NextResponse.json(
          {
            error:
              'Database connection failed. Please check your DATABASE_URL.',
          },
          { status: 500 }
        );
      }
      if (
        error.message.includes('relation') ||
        error.message.includes('table')
      ) {
        return NextResponse.json(
          {
            error: 'Database tables not found. Please run: npx prisma db push',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to complete onboarding',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
