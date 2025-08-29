import { NextRequest, NextResponse } from 'next/server';
import { getStripe, STRIPE_CONFIG, isStripeConfigured } from '@/lib/stripe';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabase-server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Payment system is not configured' },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !STRIPE_CONFIG.webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripeInstance = getStripe();
    event = stripeInstance.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        
        if (userId) {
          // Update user profile to premium
          const supabase = getSupabaseServer();
          await supabase
            .from('profiles')
            .update({ 
              role: 'premium',
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
          
          console.log(`User ${userId} upgraded to premium`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        
        if (userId) {
          // Downgrade user to regular user
          const supabase = getSupabaseServer();
          await supabase
            .from('profiles')
            .update({ 
              role: 'user',
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
          
          console.log(`User ${userId} subscription cancelled`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = invoice.metadata?.userId;
        
        if (userId) {
          // Handle failed payment
          console.log(`Payment failed for user ${userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 