import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, isStripeConfigured } from '@/lib/stripe';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Check if required services are configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payment system is not configured' },
        { status: 503 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database is not configured' },
        { status: 503 }
      );
    }

    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const supabase = getSupabaseServer();
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create checkout session
    const session = await createCheckoutSession(userId, email);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 