'use client';

import React from 'react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>We use essential cookies to keep the site working and analytics cookies only with your consent.</p>
          <p>You can update your preferences anytime via the consent banner.</p>
        </div>
      </div>
    </div>
  );
}


