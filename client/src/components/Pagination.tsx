import React from 'react';

interface Props {
  total: number;
  page: number;
  limit: number;
  onChange: (page: number) => void;
}

export default function Pagination({ total, page, limit, onChange }: Props) {
  const last = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>
      <span>Page {page} of {last}</span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= last}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
