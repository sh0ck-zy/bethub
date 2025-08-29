'use client';

import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>By using BetHub, you agree to our terms. This service is provided as-is without warranties.</p>
          <p>For questions, contact us at support@bethub.com.</p>
        </div>
      </div>
    </div>
  );
}


