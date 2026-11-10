'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-vantiq-ivory mb-2">Analytics Dashboard</h1>
          <p className="text-vantiq-ivory/60">Real-time insights and performance metrics</p>
        </div>

        {/* Analytics */}
        <AnalyticsDashboard />
      </div>
    </MainLayout>
  );
}
