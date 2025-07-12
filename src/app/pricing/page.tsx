'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Brain, Users, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';

const plans = [
  {
    name: 'Free',
    price: 0,
    interval: 'forever',
    description: 'Perfect for getting started',
    features: [
      '1 AI analysis per day',
      'Basic match insights',
      'Standard match coverage',
      'Community support'
    ],
    limitations: [
      'Limited to 1 analysis per day',
      'No advanced insights',
      'No real-time updates'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Premium',
    price: 9.99,
    interval: 'month',
    description: 'For serious football enthusiasts',
    features: [
      'Unlimited AI analysis',
      'Advanced tactical insights',
      'Real-time match updates',
      'Betting recommendations',
      'Priority support',
      'Exclusive content'
    ],
    limitations: [],
    cta: 'Start Free Trial',
    popular: true
  }
];

export default function PricingPage() {
  const { user } = useAuth();
  const { isAuthenticated, isPremium } = useRoleSelector();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/?login=true';
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get the most out of AI-powered football analysis with our flexible pricing plans
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative bg-gray-800/50 border border-white/10 ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                  {plan.name === 'Premium' && <Crown className="w-6 h-6 text-yellow-400" />}
                  {plan.name}
                </CardTitle>
                <div className="text-3xl font-bold text-white">
                  €{plan.price}
                  <span className="text-lg text-gray-400 font-normal">
                    /{plan.interval}
                  </span>
                </div>
                <p className="text-gray-400">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white mb-3">What's included:</h4>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white mb-3">Limitations:</h4>
                    {plan.limitations.map((limitation) => (
                      <div key={limitation} className="flex items-center gap-3">
                        <div className="w-5 h-5 text-red-400 flex-shrink-0">×</div>
                        <span className="text-gray-400">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  onClick={plan.name === 'Premium' ? handleUpgrade : undefined}
                  disabled={isLoading || (plan.name === 'Premium' && isPremium)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isLoading ? (
                    'Loading...'
                  ) : plan.name === 'Premium' && isPremium ? (
                    'Already Premium'
                  ) : (
                    plan.cta
                  )}
                </Button>

                {plan.name === 'Premium' && (
                  <p className="text-xs text-gray-400 text-center">
                    7-day free trial • Cancel anytime
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Feature Comparison
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">AI Analysis</h3>
              <p className="text-gray-400">
                Advanced tactical insights and predictions powered by AI
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Real-time Updates</h3>
              <p className="text-gray-400">
                Live match updates and instant notifications
              </p>
            </div>
            <div className="text-center">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Premium Support</h3>
              <p className="text-gray-400">
                Priority customer support and exclusive content
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-400">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-400">
                Yes, Premium plans come with a 7-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-400">
                We accept all major credit cards, debit cards, and digital wallets through Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 