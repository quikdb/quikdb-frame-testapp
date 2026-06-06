import { getTaskById } from "@/lib/data";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  User,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  backlog: "bg-gray-100 text-gray-700",
  todo: "bg-blue-100 text-blue-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  review: "bg-purple-100 text-purple-700",
  done: "bg-green-100 text-green-700",
};

const priorityStyles: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const task = await getTaskById(params.id);

  if (!task) {
    notFound();
  }

  const assigneeName =
    typeof task.assignee === "object" && task.assignee
      ? (task.assignee as any).username
      : task.assignee || "Unassigned";

  const reporterName =
    typeof task.reporter === "object" && task.reporter
      ? (task.reporter as any).username
      : task.reporter || "Unknown";

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tasks
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {(task as any).title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium capitalize",
                    statusStyles[(task as any).status]
                  )}
                >
                  {(task as any).status.replace("-", " ")}
                </span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium capitalize",
                    priorityStyles[(task as any).priority]
                  )}
                >
                  {(task as any).priority}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              ID: {String((task as any)._id).substring(0, 8)}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {(task as any).description}
              </p>
            </div>

            {/* Tags */}
            {(task as any).tags && (task as any).tags.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(task as any).tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comments ({(task as any).comments?.length || 0})
                </span>
              </h2>
              {(task as any).comments && (task as any).comments.length > 0 ? (
                <div className="space-y-4">
                  {(task as any).comments.map(
                    (comment: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {typeof comment.userId === "object"
                              ? comment.userId?.username
                              : comment.userId}
                          </span>
                          <span className="text-xs text-gray-400">
                            {format(
                              new Date(comment.createdAt),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.text}</p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No comments yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <DetailItem
              icon={<User className="w-4 h-4" />}
              label="Assignee"
              value={assigneeName}
            />
            <DetailItem
              icon={<User className="w-4 h-4" />}
              label="Reporter"
              value={reporterName}
            />
            {(task as any).dueDate && (
              <DetailItem
                icon={<Calendar className="w-4 h-4" />}
                label="Due Date"
                value={format(
                  new Date((task as any).dueDate),
                  "MMM dd, yyyy"
                )}
              />
            )}
            {(task as any).estimatedHours && (
              <DetailItem
                icon={<Clock className="w-4 h-4" />}
                label="Estimated"
                value={`${(task as any).estimatedHours}h`}
              />
            )}
            {(task as any).actualHours && (
              <DetailItem
                icon={<Clock className="w-4 h-4" />}
                label="Actual"
                value={`${(task as any).actualHours}h`}
              />
            )}
            <DetailItem
              icon={<Calendar className="w-4 h-4" />}
              label="Created"
              value={format(
                new Date((task as any).createdAt),
                "MMM dd, yyyy"
              )}
            />
            <DetailItem
              icon={<Calendar className="w-4 h-4" />}
              label="Updated"
              value={format(
                new Date((task as any).updatedAt),
                "MMM dd, yyyy"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}
