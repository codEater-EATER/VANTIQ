'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, BarChart3, Brain, Target, Cpu, Users, BarChart2, Shield } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-vantiq-navy via-vantiq-charcoal to-vantiq-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-vantiq-navy/80 backdrop-blur border-b border-vantiq-violet/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10">
              <Image
                src="/logo.png"
                alt="VANTIQ Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="hidden sm:block text-lg sm:text-xl font-bold text-vantiq-gold">VANTIQ</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-2 sm:gap-4 items-center">
            <Link href="/auth/signin">
              <Button 
                variant="ghost" 
                className="text-xs sm:text-sm text-vantiq-ivory hover:text-vantiq-gold px-2 sm:px-4"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button 
                className="bg-vantiq-violet hover:bg-vantiq-violet/80 text-xs sm:text-sm px-3 sm:px-6"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo Display */}
          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
              <Image
                src="/logo.png"
                alt="VANTIQ Logo"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>

          {/* Tagline Badge */}
          <div className="inline-block mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 bg-vantiq-violet/10 border border-vantiq-violet/30 rounded-full">
            <span className="text-vantiq-gold text-xs sm:text-sm font-semibold">AI • Leads • Business Intelligence</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 text-vantiq-ivory leading-tight">
            Intelligence That Converts
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-vantiq-ivory/80 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            VANTIQ combines AI-powered lead generation, intelligent CRM, and advanced business intelligence to help you discover, qualify, and convert leads at scale.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button size="lg" className="bg-vantiq-gold hover:bg-vantiq-gold/80 text-vantiq-navy w-full sm:w-auto">
                Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="border-vantiq-violet text-vantiq-ivory hover:bg-vantiq-violet/10 w-full sm:w-auto">
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-20">
            <div className="p-4 sm:p-6 bg-vantiq-charcoal/50 border border-vantiq-violet/20 rounded-lg hover:border-vantiq-violet/50 transition">
              <Brain className="w-6 sm:w-8 h-6 sm:h-8 text-vantiq-violet mb-3 sm:mb-4 mx-auto" />
              <h3 className="text-sm sm:text-lg font-semibold text-vantiq-ivory mb-2">AI-Powered Qualification</h3>
              <p className="text-xs sm:text-sm text-vantiq-ivory/60">Intelligent lead scoring and qualification powered by multi-model AI</p>
            </div>

            <div className="p-4 sm:p-6 bg-vantiq-charcoal/50 border border-vantiq-violet/20 rounded-lg hover:border-vantiq-violet/50 transition">
              <Target className="w-6 sm:w-8 h-6 sm:h-8 text-vantiq-gold mb-3 sm:mb-4 mx-auto" />
              <h3 className="text-sm sm:text-lg font-semibold text-vantiq-ivory mb-2">Lead Generation</h3>
              <p className="text-xs sm:text-sm text-vantiq-ivory/60">Discover qualified leads from multiple sources with advanced filtering</p>
            </div>

            <div className="p-4 sm:p-6 bg-vantiq-charcoal/50 border border-vantiq-violet/20 rounded-lg hover:border-vantiq-violet/50 transition">
              <BarChart3 className="w-6 sm:w-8 h-6 sm:h-8 text-vantiq-sage mb-3 sm:mb-4 mx-auto" />
              <h3 className="text-sm sm:text-lg font-semibold text-vantiq-ivory mb-2">Advanced Analytics</h3>
              <p className="text-xs sm:text-sm text-vantiq-ivory/60">Real-time dashboards with comprehensive performance tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-vantiq-charcoal/50 border-t border-vantiq-violet/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-16 text-vantiq-ivory">
            Built for Modern Lead Generation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-vantiq-violet/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 sm:w-6 h-5 sm:h-6 text-vantiq-violet" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-semibold text-vantiq-ivory mb-1">Multi-Source Lead Acquisition</h3>
                  <p className="text-xs sm:text-sm text-vantiq-ivory/60">Apollo, Apify, DuckDuckGo, Google Sheets, and custom integrations</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-vantiq-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 sm:w-6 h-5 sm:h-6 text-vantiq-gold" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-semibold text-vantiq-ivory mb-1">AI Assistant</h3>
                  <p className="text-xs sm:text-sm text-vantiq-ivory/60">Qwen, Grok, and Nemotron with intelligent fallback</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-vantiq-sage/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 sm:w-6 h-5 sm:h-6 text-vantiq-sage" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-semibold text-vantiq-ivory mb-1">Lead Deduplication</h3>
                  <p className="text-xs sm:text-sm text-vantiq-ivory/60">Intelligent duplicate detection across campaigns</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-vantiq-rosewood/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart2 className="w-5 sm:w-6 h-5 sm:h-6 text-vantiq-rosewood" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-semibold text-vantiq-ivory mb-1">Commission Protection</h3>
                  <p className="text-xs sm:text-sm text-vantiq-ivory/60">Immutable lead attribution and distribution tracking</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-vantiq-terracotta/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 sm:w-6 h-5 sm:h-6 text-vantiq-terracotta" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-semibold text-vantiq-ivory mb-1">Buyer Portal</h3>
                  <p className="text-xs sm:text-sm text-vantiq-ivory/60">Authorized buyer management and lead acceptance workflows</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-vantiq-violet/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-vantiq-violet" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-semibold text-vantiq-ivory mb-1">DPDP Compliance</h3>
                  <p className="text-xs sm:text-sm text-vantiq-ivory/60">Comprehensive consent management and audit trails</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-vantiq-gold mb-2">1000+</div>
              <p className="text-xs sm:text-sm text-vantiq-ivory/60">Leads/Day</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-vantiq-violet mb-2">95%</div>
              <p className="text-xs sm:text-sm text-vantiq-ivory/60">Accuracy</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-vantiq-sage mb-2">24/7</div>
              <p className="text-xs sm:text-sm text-vantiq-ivory/60">AI Support</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-vantiq-terracotta mb-2">∞</div>
              <p className="text-xs sm:text-sm text-vantiq-ivory/60">Scalability</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-vantiq-ivory">
            Ready to Transform Your Lead Generation?
          </h2>
          <p className="text-sm sm:text-xl text-vantiq-ivory/60 mb-6 sm:mb-8">
            Join businesses generating 1,000+ qualified leads daily with VANTIQ
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-vantiq-gold hover:bg-vantiq-gold/80 text-vantiq-navy">
              Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-vantiq-violet/20 py-8 sm:py-12 px-4 sm:px-6 bg-vantiq-charcoal/50">
        <div className="max-w-6xl mx-auto text-center text-xs sm:text-sm text-vantiq-ivory/60">
          <p>&copy; 2024 VANTIQ. All rights reserved. | Intelligence That Converts.</p>
        </div>
      </footer>
    </main>
  );
}
