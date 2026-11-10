'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import axios from 'axios';

interface DashboardMetrics {
  overview: {
    totalLeads: number;
    qualifiedLeads: number;
    distributedLeads: number;
    acceptedLeads: number;
    qualificationRate: number;
    distributionRate: number;
  };
  revenue: {
    totalCommission: any;
    pendingCommission: any;
    paidCommission: any;
    averageCommissionPerLead: any;
  };
  performance: {
    topPerformingBuyers: Array<any>;
    topLeadSources: Array<any>;
    leadsByLoanType: Array<any>;
    qualificationTrend: Array<any>;
  };
  distribution: {
    acceptanceRate: number;
    rejectionRate: number;
    pendingCount: number;
    averageTimeToAcceptance: number;
  };
}

interface ConversionFunnel {
  imported: number;
  qualified: number;
  distributed: number;
  accepted: number;
  qualificationConversionRate: number;
  distributionConversionRate: number;
  acceptanceConversionRate: number;
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [funnel, setFunnel] = useState<ConversionFunnel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [metricsRes, funnelRes] = await Promise.all([
        axios.get('/api/v1/dashboard/metrics'),
        axios.get('/api/v1/dashboard/funnel'),
      ]);

      setMetrics(metricsRes.data);
      setFunnel(funnelRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-vantiq-ivory/60">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top KPIs */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-vantiq-purple/10 border border-vantiq-purple/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vantiq-ivory/60 mb-2">Total Leads</p>
                <p className="text-4xl font-bold text-vantiq-ivory">
                  {metrics.overview.totalLeads.toLocaleString()}
                </p>
              </div>
              <Users className="w-12 h-12 text-vantiq-purple/40" />
            </div>
          </div>

          <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vantiq-ivory/60 mb-2">Qualified</p>
                <p className="text-4xl font-bold text-green-400">
                  {metrics.overview.qualifiedLeads.toLocaleString()}
                </p>
                <p className="text-xs text-green-400/60 mt-1">
                  {metrics.overview.qualificationRate}% rate
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400/40" />
            </div>
          </div>

          <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vantiq-ivory/60 mb-2">Distributed</p>
                <p className="text-4xl font-bold text-blue-400">
                  {metrics.overview.distributedLeads.toLocaleString()}
                </p>
                <p className="text-xs text-blue-400/60 mt-1">
                  {metrics.overview.distributionRate}% rate
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-blue-400/40" />
            </div>
          </div>

          <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vantiq-ivory/60 mb-2">Accepted</p>
                <p className="text-4xl font-bold text-yellow-400">
                  {metrics.overview.acceptedLeads.toLocaleString()}
                </p>
                <p className="text-xs text-yellow-400/60 mt-1">
                  {Math.round(
                    (metrics.overview.acceptedLeads / metrics.overview.totalLeads) * 100,
                  )}% of total
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-yellow-400/40" />
            </div>
          </div>
        </div>
      )}

      {/* Revenue Section */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-gradient-to-br from-vantiq-purple/20 to-vantiq-purple/5 border border-vantiq-purple/30 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-vantiq-purple" />
              <h3 className="text-lg font-semibold text-vantiq-ivory">Revenue</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-vantiq-ivory/60 mb-1">Total Commission</p>
                <p className="text-3xl font-bold text-vantiq-purple">
                  ${Number(metrics.revenue.totalCommission).toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-vantiq-ivory/60">Paid</p>
                  <p className="text-lg font-semibold text-green-400">
                    ${Number(metrics.revenue.paidCommission).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-vantiq-ivory/60">Pending</p>
                  <p className="text-lg font-semibold text-yellow-400">
                    ${Number(metrics.revenue.pendingCommission).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-vantiq-purple/20">
                <p className="text-xs text-vantiq-ivory/60">Avg per Lead</p>
                <p className="text-xl font-semibold text-vantiq-ivory">
                  ${Number(metrics.revenue.averageCommissionPerLead).toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-vantiq-purple/20 to-vantiq-purple/5 border border-vantiq-purple/30 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-vantiq-purple" />
              <h3 className="text-lg font-semibold text-vantiq-ivory">Distribution</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-vantiq-ivory/60">Acceptance Rate</p>
                  <p className="text-lg font-semibold text-green-400">
                    {metrics.distribution.acceptanceRate}%
                  </p>
                </div>
                <div className="w-full bg-vantiq-purple/20 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full"
                    style={{ width: `${metrics.distribution.acceptanceRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-vantiq-ivory/60">Rejection Rate</p>
                  <p className="text-lg font-semibold text-red-400">
                    {metrics.distribution.rejectionRate}%
                  </p>
                </div>
                <div className="w-full bg-vantiq-purple/20 rounded-full h-2">
                  <div
                    className="bg-red-400 h-2 rounded-full"
                    style={{ width: `${metrics.distribution.rejectionRate}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-vantiq-purple/20">
                <div>
                  <p className="text-xs text-vantiq-ivory/60">Pending</p>
                  <p className="text-lg font-semibold text-vantiq-ivory">
                    {metrics.distribution.pendingCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-vantiq-ivory/60">Avg Acceptance Time</p>
                  <p className="text-lg font-semibold text-vantiq-ivory">
                    {metrics.distribution.averageTimeToAcceptance}h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      {funnel && (
        <div className="p-6 bg-gradient-to-br from-vantiq-purple/20 to-vantiq-purple/5 border border-vantiq-purple/30 rounded-lg">
          <h3 className="text-lg font-semibold text-vantiq-ivory mb-6">Conversion Funnel</h3>
          <div className="space-y-4">
            {[
              { label: 'Imported', value: funnel.imported, color: 'bg-vantiq-purple' },
              { label: 'Qualified', value: funnel.qualified, color: 'bg-green-400' },
              { label: 'Distributed', value: funnel.distributed, color: 'bg-blue-400' },
              { label: 'Accepted', value: funnel.accepted, color: 'bg-yellow-400' },
            ].map((stage, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-vantiq-ivory/60">{stage.label}</p>
                  <p className="text-sm font-semibold text-vantiq-ivory">{stage.value}</p>
                </div>
                <div className="w-full bg-vantiq-purple/10 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${stage.color} h-3 rounded-full`}
                    style={{
                      width: `${(stage.value / funnel.imported) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-vantiq-charcoal/50 rounded">
              <p className="text-vantiq-ivory/60">Qualification Rate</p>
              <p className="text-2xl font-bold text-green-400">
                {funnel.qualificationConversionRate}%
              </p>
            </div>
            <div className="text-center p-3 bg-vantiq-charcoal/50 rounded">
              <p className="text-vantiq-ivory/60">Distribution Rate</p>
              <p className="text-2xl font-bold text-blue-400">
                {funnel.distributionConversionRate}%
              </p>
            </div>
            <div className="text-center p-3 bg-vantiq-charcoal/50 rounded">
              <p className="text-vantiq-ivory/60">Acceptance Rate</p>
              <p className="text-2xl font-bold text-yellow-400">
                {funnel.acceptanceConversionRate}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-vantiq-purple/10 border border-vantiq-purple/30 rounded-lg">
            <h3 className="text-lg font-semibold text-vantiq-ivory mb-4">Top Lead Sources</h3>
            <div className="space-y-3">
              {metrics.performance.topLeadSources.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <p className="text-sm text-vantiq-ivory">{source.source}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-vantiq-purple/20 rounded-full h-2">
                      <div
                        className="bg-vantiq-purple h-2 rounded-full"
                        style={{
                          width: `${
                            (source.count /
                              metrics.performance.topLeadSources[0].count) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-vantiq-ivory w-8 text-right">
                      {source.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-vantiq-purple/10 border border-vantiq-purple/30 rounded-lg">
            <h3 className="text-lg font-semibold text-vantiq-ivory mb-4">Loan Types</h3>
            <div className="space-y-3">
              {metrics.performance.leadsByLoanType.map((type, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <p className="text-sm text-vantiq-ivory">{type.type}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-vantiq-purple/20 rounded-full h-2">
                      <div
                        className="bg-green-400 h-2 rounded-full"
                        style={{
                          width: `${
                            (type.count / metrics.performance.leadsByLoanType[0].count) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-vantiq-ivory w-8 text-right">
                      {type.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
