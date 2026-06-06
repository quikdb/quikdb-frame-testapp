import { getStats } from "@/lib/data";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          TaskBoard
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          A full-featured project management tool. Track tasks, collaborate
          with your team, and ship faster.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Open Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            View Tasks
          </Link>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <StatCard
          icon={<CheckCircle2 className="w-8 h-8 text-green-500" />}
          label="Total Tasks"
          value={stats.total}
          sub={`${stats.completionRate}% complete`}
        />
        <StatCard
          icon={<Clock className="w-8 h-8 text-blue-500" />}
          label="In Progress"
          value={stats.byStatus["in-progress"]}
          sub={`${stats.byStatus.review} in review`}
        />
        <StatCard
          icon={<AlertTriangle className="w-8 h-8 text-orange-500" />}
          label="Urgent Tasks"
          value={stats.byPriority.urgent}
          sub={`${stats.byPriority.high} high priority`}
        />
        <StatCard
          icon={<Users className="w-8 h-8 text-purple-500" />}
          label="Team Members"
          value={stats.totalUsers}
          sub="Active contributors"
        />
      </section>

      {/* Status Breakdown */}
      <section className="bg-white rounded-xl border border-gray-200 p-8 mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Task Status Breakdown
        </h2>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {count as number}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {status.replace("-", " ")}
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getStatusColor(status)}`}
                  style={{
                    width: `${
                      stats.total > 0
                        ? ((count as number) / stats.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <FeatureCard
          title="Real-time Chat"
          description="Collaborate with your team using built-in WebSocket-powered chat. Discuss tasks and share updates instantly."
          href="/chat"
        />
        <FeatureCard
          title="Analytics Dashboard"
          description="Visualize your project progress with interactive charts. Track velocity, completion rates, and team performance."
          href="/dashboard"
        />
        <FeatureCard
          title="Task Management"
          description="Create, assign, and track tasks with priorities, tags, and due dates. Filter and sort to find what matters."
          href="/tasks"
        />
      </section>

      <footer className="text-center text-gray-400 text-sm py-8 border-t border-gray-200">
        TaskBoard v1.0.0 — Built with Next.js, MongoDB, Socket.IO, Recharts,
        TanStack Query, and more.
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          <div className="text-sm font-medium text-gray-600">{label}</div>
          <div className="text-xs text-gray-400 mt-1">{sub}</div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all group"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    backlog: "bg-gray-400",
    todo: "bg-blue-400",
    "in-progress": "bg-yellow-400",
    review: "bg-purple-400",
    done: "bg-green-400",
  };
  return colors[status] || "bg-gray-400";
}
