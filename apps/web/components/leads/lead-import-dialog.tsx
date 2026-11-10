'use client';

import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

interface ImportResult {
  totalRecords: number;
  successfulImports: number;
  duplicatesFound: number;
  failedImports: number;
  errors: Array<{ row: number; error: string }>;
  duplicateDetails: Array<{ row: number; matchedLeadId: string }>;
}

interface LeadImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: ImportResult) => void;
  campaignId?: string;
}

export function LeadImportDialog({
  isOpen,
  onClose,
  onSuccess,
  campaignId,
}: LeadImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
        setError('Only CSV and XLSX files are supported');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const ext = droppedFile.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
        setError('Only CSV and XLSX files are supported');
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const url = campaignId
        ? `/api/v1/leads/import/file?campaignId=${campaignId}`
        : '/api/v1/leads/import/file';

      const response = await axios.post<ImportResult>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      onSuccess?.(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to import leads');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-vantiq-charcoal border border-vantiq-purple/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-vantiq-purple/20">
          <h2 className="text-2xl font-bold text-vantiq-ivory">Import Leads</h2>
          <button
            onClick={onClose}
            className="text-vantiq-ivory/60 hover:text-vantiq-ivory transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!result ? (
            <>
              {/* File Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-vantiq-purple/30 rounded-lg p-8 text-center cursor-pointer hover:border-vantiq-purple/60 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-4 w-full"
                >
                  <Upload className="w-12 h-12 text-vantiq-purple" />
                  <div>
                    <p className="text-lg font-semibold text-vantiq-ivory">
                      {file ? file.name : 'Drop file here or click to browse'}
                    </p>
                    <p className="text-sm text-vantiq-ivory/60 mt-1">
                      Supported formats: CSV, XLSX
                    </p>
                  </div>
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* File Info */}
              {file && (
                <div className="mt-6 p-4 bg-vantiq-purple/10 rounded-lg">
                  <p className="text-sm text-vantiq-ivory/80">
                    <span className="font-semibold">File:</span> {file.name}
                  </p>
                  <p className="text-sm text-vantiq-ivory/60">
                    <span className="font-semibold">Size:</span>{' '}
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              {/* Help Text */}
              <div className="mt-6 p-4 bg-vantiq-purple/5 rounded-lg">
                <p className="text-sm font-semibold text-vantiq-ivory mb-2">
                  Required Columns:
                </p>
                <ul className="text-sm text-vantiq-ivory/70 space-y-1">
                  <li>• First Name</li>
                  <li>• Last Name</li>
                  <li>• Phone Number</li>
                  <li>• City</li>
                  <li>• State</li>
                  <li>• Loan Type (optional)</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-vantiq-purple/20 text-vantiq-ivory rounded-lg hover:bg-vantiq-purple/30 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file || isLoading}
                  className="flex-1 px-4 py-2 bg-vantiq-purple text-white rounded-lg hover:bg-vantiq-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Importing...' : 'Import Leads'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Results */}
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-vantiq-ivory/60">Successful</p>
                    <p className="text-3xl font-bold text-green-400">
                      {result.successfulImports}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-vantiq-ivory/60">Duplicates</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {result.duplicatesFound}
                    </p>
                  </div>
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-vantiq-ivory/60">Failed</p>
                    <p className="text-3xl font-bold text-red-400">
                      {result.failedImports}
                    </p>
                  </div>
                  <div className="p-4 bg-vantiq-purple/10 border border-vantiq-purple/30 rounded-lg">
                    <p className="text-sm text-vantiq-ivory/60">Total</p>
                    <p className="text-3xl font-bold text-vantiq-purple">
                      {result.totalRecords}
                    </p>
                  </div>
                </div>

                {/* Errors */}
                {result.errors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-vantiq-ivory mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      Errors ({result.errors.length})
                    </h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {result.errors.map((err, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400"
                        >
                          <span className="font-semibold">Row {err.row}:</span> {err.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duplicates */}
                {result.duplicateDetails.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-vantiq-ivory mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      Duplicates Detected ({result.duplicateDetails.length})
                    </h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {result.duplicateDetails.map((dup, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-400"
                        >
                          <span className="font-semibold">Row {dup.row}:</span> Matches
                          existing lead {dup.matchedLeadId.slice(0, 8)}...
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {result.successfulImports > 0 && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-400">
                      Successfully imported {result.successfulImports} leads!
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-vantiq-purple text-white rounded-lg hover:bg-vantiq-purple/90 transition-colors font-medium"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 bg-vantiq-purple/20 text-vantiq-ivory rounded-lg hover:bg-vantiq-purple/30 transition-colors font-medium"
                >
                  Import More
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
