'use client';

import { useState, useEffect } from 'react';

// Simple fetch wrapper for admin API
const adminApiClient = {
  get: async (path: string) => {
    try {
      const response = await fetch(`/api${path}`);
      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText || `HTTP ${response.status}` };
        }
        console.error('API GET error:', {
          path,
          status: response.status,
          statusText: response.statusText,
          error,
        });
        throw new Error(error.message || error.error || `API error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },
  post: async (path: string, data: unknown) => {
    try {
      const response = await fetch(`/api${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText || `HTTP ${response.status}` };
        }
        console.error('API POST error:', {
          path,
          status: response.status,
          statusText: response.statusText,
          error,
          requestData: data,
        });
        throw new Error(error.message || error.error || `API error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },
};

interface ImportJob {
  id: string;
  jobType: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  productsProcessed: number;
  productsCreated: number;
  productsUpdated: number;
  errors: Array<{ message: string; timestamp: string }>;
  metadata: {
    useApi?: boolean;
    maxProducts?: number;
    category?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductPreview {
  id: string;
  name: string;
  sourceUrl: string;
  imageUrl?: string;
  description?: string;
  price?: number;
}

export default function ImportDashboard() {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [currentJob, setCurrentJob] = useState<ImportJob | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [recentProducts, setRecentProducts] = useState<ProductPreview[]>([]);
  const [importOptions, setImportOptions] = useState({
    maxProducts: 100,
    useApi: false,
    category: '',
  });
  const [isFixingCategories, setIsFixingCategories] = useState(false);
  const [categoryFixResult, setCategoryFixResult] = useState<any>(null);
  const [isFixingCategories, setIsFixingCategories] = useState(false);
  const [categoryFixResult, setCategoryFixResult] = useState<any>(null);

  // Fetch jobs on mount and periodically
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, []);

  // Poll current job status if importing
  useEffect(() => {
    if (isImporting && currentJob) {
      const interval = setInterval(async () => {
        try {
          const job = await adminApiClient.get(`/admin/import-jobs/${currentJob.id}/public`);
          setCurrentJob(job);
          setImportProgress({
            current: job.productsProcessed,
            total: job.metadata?.maxProducts || 0,
          });
          
          if (job.status === 'COMPLETED' || job.status === 'FAILED') {
            setIsImporting(false);
            fetchJobs();
            fetchRecentProducts();
          }
        } catch (error) {
          console.error('Error fetching job status:', error);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isImporting, currentJob]);

  const fetchJobs = async () => {
    try {
      const response = await adminApiClient.get('/admin/import-jobs/public');
      setJobs(response.jobs || []);
      
      // Set current job if there's a running one
      const runningJob = response.jobs?.find((j: ImportJob) => j.status === 'RUNNING');
      if (runningJob) {
        setCurrentJob(runningJob);
        setIsImporting(true);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchRecentProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=10');
      const data = await response.json();
      setRecentProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching recent products:', error);
    }
  };

  const handleFixCategories = async () => {
    setIsFixingCategories(true);
    setCategoryFixResult(null);
    try {
      const result = await adminApiClient.post('/admin/fix-categories', {});
      setCategoryFixResult(result);
      alert(`Categories fixed successfully!\n\nUpdated: ${result.summary.updated}\nCreated: ${result.summary.created}\nSkipped: ${result.summary.skipped}`);
      // Refresh the page to see updated categories
      window.location.reload();
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      console.error('Failed to fix categories:', error);
      alert(`Failed to fix categories: ${errorMessage}\n\nCheck the browser console for more details.`);
    } finally {
      setIsFixingCategories(false);
    }
  };

  const startImport = async () => {
    try {
      setIsImporting(true);
      console.log('Starting import with options:', importOptions);
      
      const response = await adminApiClient.post('/admin/import-jobs/start', {
        jobType: 'FULL',
        useApi: importOptions.useApi,
        maxProducts: importOptions.maxProducts || undefined,
        category: importOptions.category || undefined,
      });
      
      console.log('Import started successfully:', response);
      setCurrentJob(response);
      setImportProgress({ current: 0, total: importOptions.maxProducts });
      fetchRecentProducts();
    } catch (error) {
      console.error('Error starting import:', error);
      setIsImporting(false);
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      alert(`Failed to start import: ${errorMessage}\n\nCheck the browser console for more details.`);
    }
  };

  const stopImport = async () => {
    if (!currentJob) return;
    
    try {
      await adminApiClient.post(`/admin/import-jobs/${currentJob.id}/stop/public`, {});
      setIsImporting(false);
      setCurrentJob(null);
      fetchJobs();
      alert('Import stopped. The current product being processed will complete.');
    } catch (error) {
      console.error('Error stopping import:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to stop import: ${errorMessage}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50';
      case 'RUNNING':
        return 'text-blue-600 bg-blue-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Plantmark Import Dashboard</h1>

        {/* Import Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Start New Import</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Products
              </label>
              <input
                type="number"
                value={importOptions.maxProducts}
                onChange={(e) =>
                  setImportOptions({ ...importOptions, maxProducts: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isImporting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (optional)
              </label>
              <input
                type="text"
                value={importOptions.category}
                onChange={(e) =>
                  setImportOptions({ ...importOptions, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isImporting}
                placeholder="Leave empty for all"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={importOptions.useApi}
                  onChange={(e) =>
                    setImportOptions({ ...importOptions, useApi: e.target.checked })
                  }
                  className="mr-2"
                  disabled={isImporting}
                />
                <span className="text-sm text-gray-700">Use API (if available)</span>
              </label>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={startImport}
              disabled={isImporting || isFixingCategories}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Importing...' : 'Start Import'}
            </button>
            <button
              onClick={handleFixCategories}
              disabled={isFixingCategories || isImporting}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isFixingCategories ? 'Fixing Categories...' : 'Fix Categories'}
            </button>
            {isImporting && (
              <button
                onClick={stopImport}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Stop Import
              </button>
            )}
          </div>
        </div>

        {/* Current Import Status */}
        {currentJob && (isImporting || currentJob.status === 'RUNNING') && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Current Import</h2>
              <span className="text-sm text-gray-500">Job ID: {currentJob.id.substring(0, 8)}...</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">
                    {importProgress.current} / {importProgress.total || '?'}
                    {importProgress.total > 0 && ` (${Math.round((importProgress.current / importProgress.total) * 100)}%)`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{
                      width: `${importProgress.total > 0 ? Math.min((importProgress.current / importProgress.total) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {currentJob.productsCreated}
                  </div>
                  <div className="text-sm text-gray-600">Created</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {currentJob.productsUpdated}
                  </div>
                  <div className="text-sm text-gray-600">Updated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {(currentJob.metadata as any)?.skipped || 0}
                  </div>
                  <div className="text-sm text-gray-600">Skipped</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {currentJob.errors?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
              </div>
              {currentJob.errors && currentJob.errors.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Errors:</h3>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {currentJob.errors.slice(-5).map((error: any, idx: number) => (
                      <div key={idx} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {error.message || error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Import Jobs */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Import Jobs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Job ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.slice(0, 10).map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {job.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {job.productsCreated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {job.productsUpdated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {job.productsProcessed} processed
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recently Imported Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <a
                  href={product.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                >
                  View on Plantmark →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

