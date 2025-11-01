import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchImportLogs } from '../store/importsSlice';
import Pagination from '../components/Pagination';

// Enhanced Imports page: search, sort, filters, CSV export, row details, skeleton loader
export default function ImportsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((s) => s.imports);

  const page = Number(router.query.page || 1);
  const limit = Number(router.query.limit || 10);

  // UI state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(limit);

  useEffect(() => {
    dispatch(fetchImportLogs({ page, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  // Push query params when rowsPerPage changes
  useEffect(() => {
    router.replace({ pathname: '/imports', query: { page, limit: rowsPerPage } }, undefined, { shallow: true });
  }, [rowsPerPage]);

  function goToPage(p: number) {
    router.push({ pathname: '/imports', query: { page: p, limit: rowsPerPage } }, undefined, { shallow: true });
  }

  // Helpers
  const formatDate = (d?: string | number | null) => (d ? new Date(d).toLocaleString() : '-');

  const statusBadge = (s: string) => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
    if (s === 'success') return <span className={base + ' bg-green-100 text-green-800'}>Success</span>;
    if (s === 'failed') return <span className={base + ' bg-red-100 text-red-800'}>Failed</span>;
    return <span className={base + ' bg-yellow-100 text-yellow-800'}>{s}</span>;
  };

  // Derived & client-side presentation filtering/sorting/searching (UI only)
  const displayedRows = useMemo(() => {
    if (!data?.rows) return [];
    let rows = [...data.rows];

    // client-side search across a few fields
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) =>
        [r.sourceUrl, r.status, String(r._id), r.failures, r.updatedJobs]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }

    // status filter
    if (statusFilter !== 'all') rows = rows.filter((r) => r.status === statusFilter);

    // client-side sort
    if (sortBy) {
      rows.sort((a, b) => {
        const A = (a as any)[sortBy.key];
        const B = (b as any)[sortBy.key];
        if (A == null && B == null) return 0;
        if (A == null) return sortBy.dir === 'asc' ? -1 : 1;
        if (B == null) return sortBy.dir === 'asc' ? 1 : -1;
        if (typeof A === 'number' && typeof B === 'number') return sortBy.dir === 'asc' ? A - B : B - A;
        return sortBy.dir === 'asc' ? String(A).localeCompare(String(B)) : String(B).localeCompare(String(A));
      });
    }

    return rows;
  }, [data, search, statusFilter, sortBy]);

  // CSV export
  function downloadCSV() {
    if (!data?.rows) return;
    const cols = [
      'id',
      'createdAt',
      'startedAt',
      'finishedAt',
      'status',
      'sourceUrl',
      'newJobs',
      'failedJobs',
      'failures',
      'totalFetched',
      'totalImported',
      'updatedJobs',
      'updatedAt',
    ];
    const csvRows = [cols.join(',')];
    for (const r of data.rows) {
      const vals = cols.map((c) => JSON.stringify((r as any)[c] ?? ''));
      csvRows.push(vals.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-logs-page-${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Small utility for toggling sort
  function toggleSort(key: string) {
    if (!sortBy || sortBy.key !== key) setSortBy({ key, dir: 'asc' });
    else setSortBy({ key, dir: sortBy.dir === 'asc' ? 'desc' : 'asc' });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Import Logs</h1>

        <div className="flex gap-2 items-center">
          <button onClick={downloadCSV} className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Export CSV</button>
          <label className="text-sm">Rows:</label>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by URL, status, id, failures..."
          className="border rounded px-3 py-2"
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="border rounded px-3 py-2">
          <option value="all">All statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>

        <div className="text-sm text-gray-600">Total logs: <span className="font-medium">{data?.total ?? 0}</span></div>
      </div>

      {loading && (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-4 rounded shadow-sm border" style={{ minHeight: 48 }} />
          ))}
        </div>
      )}

      {error && <div className="text-red-600">Error: {error}</div>}

      {!loading && data?.rows && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('createdAt')}>
                  Created {sortBy?.key === 'createdAt' ? (sortBy.dir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Source</th>
                <th className="px-4 py-3 text-right cursor-pointer" onClick={() => toggleSort('totalFetched')}>
                  Fetched {sortBy?.key === 'totalFetched' ? (sortBy.dir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-3 text-right">Imported</th>
                <th className="px-4 py-3 text-right">Failed</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((log) => (
                <>
                  <tr key={log._id} className="hover:bg-gray-50 align-top border-b">
                    <td className="px-4 py-3 max-w-[140px] truncate">{String(log._id).slice(0, 10)}...</td>
                    <td className="px-4 py-3">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3">{statusBadge(log.status)}</td>
                    <td className="px-4 py-3 max-w-[300px] truncate" title={log.sourceUrl}>{log.sourceUrl}</td>
                    <td className="px-4 py-3 text-right">{log.totalFetched ?? 0}</td>
                    <td className="px-4 py-3 text-right">{log.totalImported ?? 0}</td>
                    <td className="px-4 py-3 text-right">{log.failedJobs ?? 0}</td>
                    <td className="px-4 py-3">{formatDate(log.updatedAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigator.clipboard?.writeText(String(log._id))}
                          title="Copy ID"
                          className="text-xs px-2 py-1 border rounded"
                        >
                          Copy
                        </button>

                        <button
                          onClick={() => setExpandedId(expandedId === log._id ? null : log._id)}
                          className="text-xs px-2 py-1 border rounded"
                        >
                          {expandedId === log._id ? 'Hide' : 'Details'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === log._id && (
                    <tr className="bg-gray-50">
                      <td colSpan={9} className="px-4 py-3 text-sm text-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="font-semibold">Timestamps</div>
                            <div className="text-xs">Started: {formatDate(log.startedAt)}</div>
                            <div className="text-xs">Finished: {formatDate(log.finishedAt)}</div>
                            <div className="text-xs">Updated: {formatDate(log.updatedAt)}</div>
                          </div>

                          <div>
                            <div className="font-semibold">Counts</div>
                            <div className="text-xs">New Jobs: {log.newJobs ?? 0}</div>
                            <div className="text-xs">Updated Jobs: {log.updatedJobs ?? 0}</div>
                            <div className="text-xs">Failed Jobs: {log.failedJobs ?? 0}</div>
                          </div>

                          <div>
                            <div className="font-semibold">Failures / Notes</div>
                            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(log.failures ?? '-', null, 2)}</pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}

              {displayedRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-500">No logs match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination component (backend-driven) */}
      {data && (
        <div className="mt-6 flex justify-center">
          <Pagination total={data.total} page={data.page} limit={data.limit} onChange={goToPage} />
        </div>
      )}
    </div>
  );
}
