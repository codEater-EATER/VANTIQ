'use client';

import { useState, useEffect } from 'react';
import { Upload, Search, Filter, Download } from 'lucide-react';
import { LeadImportDialog } from './lead-import-dialog';
import axios from 'axios';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  city: string;
  state: string;
  loanType: string;
  status: string;
  qualificationScore: number;
  createdAt: string;
}

interface ImportStats {
  totalLeads: number;
  thisMonth: number;
  thisWeek: number;
  today: number;
}

export function LeadDatabase() {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeads();
    loadStats();
  }, []);

  const loadLeads = async () => {
    try {
      const response = await axios.get('/api/v1/leads');
      setLeads(response.data);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/v1/leads/import/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleImportSuccess = () => {
    loadLeads();
    loadStats();
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phoneNumber.includes(searchQuery) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      QUALIFIED: 'bg-green-500/20 text-green-400 border-green-500/30',
      DISTRIBUTED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-vantiq-purple/20 text-vantiq-purple border-vantiq-purple/30';
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-vantiq-purple/10 border border-vantiq-purple/30 rounded-lg">
            <p className="text-sm text-vantiq-ivory/60 mb-2">Total Leads</p>
            <p className="text-4xl font-bold text-vantiq-ivory">{stats.totalLeads}</p>
          </div>
          <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-vantiq-ivory/60 mb-2">This Month</p>
            <p className="text-4xl font-bold text-green-400">{stats.thisMonth}</p>
          </div>
          <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-vantiq-ivory/60 mb-2">This Week</p>
            <p className="text-4xl font-bold text-blue-400">{stats.thisWeek}</p>
          </div>
          <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-vantiq-ivory/60 mb-2">Today</p>
            <p className="text-4xl font-bold text-yellow-400">{stats.today}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-vantiq-ivory/40" />
          <input
            type="text"
            placeholder="Search leads by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-vantiq-purple/10 border border-vantiq-purple/30 rounded-lg text-vantiq-ivory placeholder-vantiq-ivory/40 focus:outline-none focus:border-vantiq-purple/60"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-vantiq-purple/20 text-vantiq-ivory rounded-lg hover:bg-vantiq-purple/30 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-4 py-2 bg-vantiq-purple/20 text-vantiq-ivory rounded-lg hover:bg-vantiq-purple/30 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="px-4 py-2 bg-vantiq-purple text-white rounded-lg hover:bg-vantiq-purple/90 transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-vantiq-purple/20 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-vantiq-ivory/60">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center">
            <Upload className="w-12 h-12 text-vantiq-purple/40 mx-auto mb-3" />
            <p className="text-vantiq-ivory/60">No leads imported yet</p>
            <p className="text-sm text-vantiq-ivory/40 mt-1">
              Import your first batch of leads using the Import button above
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-vantiq-purple/10 border-b border-vantiq-purple/20">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-vantiq-ivory">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-vantiq-ivory">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-vantiq-ivory">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-vantiq-ivory">
                    Loan Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-vantiq-ivory">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-vantiq-ivory">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, idx) => (
                  <tr
                    key={lead.id}
                    className={`border-b border-vantiq-purple/10 hover:bg-vantiq-purple/5 transition-colors ${
                      idx % 2 === 0 ? 'bg-vantiq-charcoal/50' : 'bg-vantiq-charcoal'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-vantiq-ivory">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-vantiq-ivory/80">
                      <div>{lead.phoneNumber}</div>
                      {lead.email && (
                        <div className="text-xs text-vantiq-ivory/60">{lead.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-vantiq-ivory/80">
                      {lead.city}, {lead.state}
                    </td>
                    <td className="px-6 py-4 text-sm text-vantiq-ivory/80">
                      {lead.loanType}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-vantiq-purple/20 rounded-full h-2">
                          <div
                            className="bg-vantiq-purple h-2 rounded-full"
                            style={{ width: `${lead.qualificationScore}%` }}
                          />
                        </div>
                        <span className="text-vantiq-ivory font-semibold w-10 text-right">
                          {lead.qualificationScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          lead.status,
                        )}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Import Dialog */}
      <LeadImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          handleImportSuccess();
          setIsImportOpen(false);
        }}
      />
    </div>
  );
}
