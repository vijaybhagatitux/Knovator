import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchJobs } from "../store/jobsSlice";
import DOMPurify from "isomorphic-dompurify";
import {
  Users,
  FileText,
  Search as SearchIcon,
  PlusCircle,
  Upload,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

export default function JobsPageImproved() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.jobs);

  // ✅ Get page + limit from router
  const page = Number(router.query.page || 1);
  const limit = Number(router.query.limit || 10);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ✅ Fetch jobs from backend whenever page or filters change
  useEffect(() => {
    dispatch(fetchJobs({ page, limit, searchQuery, type: typeFilter, location: locationFilter }));
  }, [dispatch, page, limit, searchQuery, typeFilter, locationFilter]);

  // ✅ Get jobs and pagination data directly from backend
  const jobs = data?.rows || [];
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / (data?.limit || limit)));

  // ✅ Function to navigate pages
  const goToPage = (p: number) => {
    const nextPage = Math.max(1, Math.min(totalPages, p));
    router.push(
      {
        pathname: "/jobs",
        query: { page: nextPage, limit },
      },
      undefined,
      { shallow: true }
    );
  };

  // ✅ (Optional) Export CSV
  const handleExport = () => {
    if (!jobs.length) return alert("No jobs to export.");
    const csv = [
      Object.keys(jobs[0]).join(","),
      ...jobs.map((j) =>
        Object.values(j)
          .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobs-export-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ✅ Delete (placeholder)
  const handleDelete = (id: string) => setConfirmDeleteId(id);
  const confirmDelete = () => {
    console.log("delete job", confirmDeleteId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Jobs Board</h1>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        {/* Search + Filters */}
        <div className="flex px-4 py-3 items-center gap-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="pl-10 w-full border rounded-lg px-3 py-2"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm"
          >
            <option value="all">All Types</option>
            <option value="remote">Remote</option>
            <option value="onsite">Onsite</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm"
          >
            <option value="all">All Locations</option>
            <option value="usa">USA</option>
            <option value="india">India</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Published</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center p-6">
                    Loading…
                  </td>
                </tr>
              ) : (
                jobs.map((job, idx) => (
                  <tr key={job._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{(page - 1) * limit + idx + 1}</td>
                    <td
                      className="p-3 text-blue-600 font-medium"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(job.title || ""),
                      }}
                    />
                    <td className="p-3">{job.company}</td>
                    <td className="p-3">{job.location}</td>
                    <td className="p-3">{job.type}</td>
                    <td className="p-3">
                      {job.publishedAt
                        ? new Date(job.publishedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          title="View"
                          onClick={() => router.push(`/jobs/${job._id}`)}
                          className="w-8 h-8 p-0 border rounded hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => router.push(`/jobs/edit/${job._id}`)}
                          className="w-8 h-8 p-0 border rounded hover:bg-gray-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(job._id)}
                          className="w-8 h-8 p-0 border rounded hover:bg-gray-100 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!loading && jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-6 text-gray-500">
                    No jobs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Backend Pagination Controls */}
        {data && totalPages > 1 && (
          <div className="border-t bg-gray-50 p-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {data.page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className={`px-3 py-1 rounded border ${
                  page <= 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  className={`px-2 py-1 rounded border ${
                    data.page === i + 1
                      ? "bg-indigo-600 text-white"
                      : "bg-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className={`px-3 py-1 rounded border ${
                  page >= totalPages ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation (optional) */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/20 z-50"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 font-semibold text-lg">
              Are you sure you want to delete this job?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
