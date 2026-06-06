"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

const statuses = ["backlog", "todo", "in-progress", "review", "done"];
const priorities = ["low", "medium", "high", "urgent"];

export function TaskFilters({
  currentStatus,
  currentPriority,
  currentSearch,
}: {
  currentStatus?: string;
  currentPriority?: string;
  currentSearch?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch || "");

  function updateFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset page on filter change
    router.push(`/tasks?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilter("search", search || undefined);
  }

  function clearFilters() {
    setSearch("");
    router.push("/tasks");
  }

  const hasFilters = currentStatus || currentPriority || currentSearch;

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500 mr-2">Status:</span>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() =>
              updateFilter("status", currentStatus === s ? undefined : s)
            }
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              currentStatus === s
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.replace("-", " ")}
          </button>
        ))}

        <span className="text-gray-300 mx-2">|</span>

        <span className="text-sm text-gray-500 mr-2">Priority:</span>
        {priorities.map((p) => (
          <button
            key={p}
            onClick={() =>
              updateFilter("priority", currentPriority === p ? undefined : p)
            }
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              currentPriority === p
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p}
          </button>
        ))}

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors ml-2"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
