import React from 'react';
import Link from 'next/link';
import { Brain, Shield, FileText, Mail, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">BetHub</h3>
                <p className="text-xs text-muted-foreground">AI Sports Analysis</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Intelligent football analysis powered by AI. Get insights that help you understand the beautiful game.
            </p>
            <div className="flex items-center space-x-3">
              <a 
                href="https://github.com/sh0ck-zy/bethub" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="mailto:sh0ck.zy.25@gmail.com" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Match Analysis
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => alert('Features page coming soon')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => alert('API documentation coming soon')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  API Access
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => alert('About page coming soon')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => alert('Blog coming soon')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  Blog
                </button>
              </li>
              <li>
                <button 
                  onClick={() => alert('Careers page coming soon')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  Careers
                </button>
              </li>
              <li>
                <a 
                  href="mailto:sh0ck.zy.25@gmail.com" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Shield className="w-4 h-4 mr-2 inline" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <FileText className="w-4 h-4 mr-2 inline" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => alert('GDPR compliance info coming soon')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  GDPR
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <p>&copy; 2024 BetHub. All rights reserved.</p>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center space-x-1">
                <Brain className="w-4 h-4" />
                <span>Powered by AI</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Made with ❤️ for football fans</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 