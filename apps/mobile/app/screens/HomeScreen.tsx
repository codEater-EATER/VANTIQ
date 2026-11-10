import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react-native';
import axios from 'axios';

interface DashboardMetrics {
  overview: {
    totalLeads: number;
    qualifiedLeads: number;
    distributedLeads: number;
    acceptedLeads: number;
  };
  revenue: {
    totalCommission: number;
    paidCommission: number;
    pendingCommission: number;
  };
  distribution: {
    acceptanceRate: number;
    rejectionRate: number;
  };
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await axios.get('/api/v1/dashboard/metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#8C7BB8" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back to VANTIQ</Text>
      </View>

      {/* KPI Cards */}
      {metrics && (
        <View>
          {/* Row 1 */}
          <View style={styles.row}>
            <MetricCard
              icon={Users}
              label="Total Leads"
              value={metrics.overview.totalLeads}
              color="#8C7BB8"
            />
            <MetricCard
              icon={TrendingUp}
              label="Qualified"
              value={metrics.overview.qualifiedLeads}
              color="#10B981"
            />
          </View>

          {/* Row 2 */}
          <View style={styles.row}>
            <MetricCard
              icon={BarChart3}
              label="Distributed"
              value={metrics.overview.distributedLeads}
              color="#3B82F6"
            />
            <MetricCard
              icon={DollarSign}
              label="Commission"
              value={`$${Math.round(metrics.revenue.totalCommission)}`}
              color="#F59E0B"
            />
          </View>

          {/* Distribution Metrics */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Distribution Performance</Text>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Acceptance Rate</Text>
                <Text style={styles.metricValue}>{metrics.distribution.acceptanceRate}%</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${metrics.distribution.acceptanceRate}%`,
                        backgroundColor: '#10B981',
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Rejection Rate</Text>
                <Text style={styles.metricValue}>{metrics.distribution.rejectionRate}%</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${metrics.distribution.rejectionRate}%`,
                        backgroundColor: '#EF4444',
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Revenue Breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Revenue Status</Text>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueLabel}>Total Commission</Text>
              <Text style={styles.revenueValue}>
                ${Math.round(metrics.revenue.totalCommission)}
              </Text>
            </View>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueLabel}>Paid</Text>
              <Text style={[styles.revenueValue, styles.paidText]}>
                ${Math.round(metrics.revenue.paidCommission)}
              </Text>
            </View>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueLabel}>Pending</Text>
              <Text style={[styles.revenueValue, styles.pendingText]}>
                ${Math.round(metrics.revenue.pendingCommission)}
              </Text>
            </View>
          </View>

          {/* Refresh Button */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadMetrics}
          >
            <Text style={styles.refreshButtonText}>Refresh Metrics</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

interface MetricCardProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  value: number | string;
  color: string;
}

function MetricCard({ icon: Icon, label, value, color }: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <Icon size={24} color={color} />
      <Text style={styles.metricCardLabel}>{label}</Text>
      <Text style={styles.metricCardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#262d52',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
  },
  metricCardLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  metricCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#262d52',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#1f2937',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  revenueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  revenueLabel: {
    fontSize: 14,
    color: '#d1d5db',
  },
  revenueValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  paidText: {
    color: '#10B981',
  },
  pendingText: {
    color: '#F59E0B',
  },
  refreshButton: {
    backgroundColor: '#8C7BB8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 24,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
