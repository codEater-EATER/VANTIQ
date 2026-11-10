'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { LeadDatabase } from '@/components/leads/lead-database';

export default function LeadsPage() {
  return (
    <MainLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-vantiq-ivory mb-2">Lead Database</h1>
          <p className="text-vantiq-ivory/60">
            Manage and import leads. Track qualification scores and distribution status.
          </p>
        </div>
        <LeadDatabase />
      </div>
    </MainLayout>
  );
}
