import { getTasks } from "@/lib/data";
import { format } from "date-fns";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskFilters } from "@/components/TaskFilters";

export const dynamic = "force-dynamic";

interface TasksPageProps {
  searchParams: {
    page?: string;
    status?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

const statusStyles: Record<string, string> = {
  backlog: "bg-gray-100 text-gray-700",
  todo: "bg-blue-100 text-blue-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  review: "bg-purple-100 text-purple-700",
  done: "bg-green-100 text-green-700",
};

const priorityStyles: Record<string, string> = {
  low: "bg-green-50 text-green-600 border-green-200",
  medium: "bg-blue-50 text-blue-600 border-blue-200",
  high: "bg-orange-50 text-orange-600 border-orange-200",
  urgent: "bg-red-50 text-red-600 border-red-200",
};

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;

  const { tasks, total } = await getTasks({
    status: searchParams.status,
    priority: searchParams.priority,
    search: searchParams.search,
    page,
    limit,
    sortBy: searchParams.sortBy || "createdAt",
    sortOrder: searchParams.sortOrder || "desc",
  });

  const totalPages = Math.ceil(total / limit);

  function buildUrl(params: Record<string, string>) {
    const sp = new URLSearchParams();
    const merged = { ...searchParams, ...params };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    return `/tasks?${sp.toString()}`;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">
            {total} task{total !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      <TaskFilters
        currentStatus={searchParams.status}
        currentPriority={searchParams.priority}
        currentSearch={searchParams.search}
      />

      {/* Task List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-3">Created</div>
        </div>

        {/* Rows */}
        {tasks.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            No tasks found matching your filters.
          </div>
        ) : (
          tasks.map((task: any) => (
            <Link
              key={task._id}
              href={`/tasks/${task._id}`}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center"
            >
              <div className="col-span-5">
                <div className="font-medium text-gray-900 truncate">
                  {task.title}
                </div>
                <div className="text-sm text-gray-400 truncate mt-0.5">
                  {task.description.substring(0, 80)}...
                </div>
              </div>
              <div className="col-span-2">
                <span
                  className={cn(
                    "inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                    statusStyles[task.status]
                  )}
                >
                  {task.status.replace("-", " ")}
                </span>
              </div>
              <div className="col-span-2">
                <span
                  className={cn(
                    "inline-block px-2.5 py-1 rounded text-xs font-medium capitalize border",
                    priorityStyles[task.priority]
                  )}
                >
                  {task.priority}
                </span>
              </div>
              <div className="col-span-3 text-sm text-gray-500">
                {format(new Date(task.createdAt), "MMM dd, yyyy")}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
