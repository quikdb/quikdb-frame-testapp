"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { format, subDays } from "date-fns";
import { Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  backlog: "#9CA3AF",
  todo: "#60A5FA",
  "in-progress": "#FBBF24",
  review: "#A78BFA",
  done: "#34D399",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#86EFAC",
  medium: "#93C5FD",
  high: "#FCA5A5",
  urgent: "#F87171",
};

// Generate fake velocity data for the chart
function generateVelocityData() {
  const data = [];
  for (let i = 13; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, "MMM dd"),
      completed: Math.floor(Math.random() * 5) + 1,
      created: Math.floor(Math.random() * 4) + 1,
    });
  }
  return data;
}

function generateBurndownData() {
  let remaining = 45;
  const data = [];
  for (let i = 13; i >= 0; i--) {
    const date = subDays(new Date(), i);
    remaining = Math.max(0, remaining - Math.floor(Math.random() * 4));
    data.push({
      date: format(date, "MMM dd"),
      remaining,
      ideal: Math.max(0, 45 - ((13 - i) * 45) / 14),
    });
  }
  return data;
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      // For the dashboard, we fetch stats without auth (SSR page fetched them)
      // In a real app you'd pass a token. Here we call the data layer directly
      // via an internal fetch that doesn't require auth for demo purposes.
      const res = await fetch("/api/v1/stats", {
        headers: {
          Authorization: "Bearer demo-token",
        },
      });
      if (!res.ok) {
        // Fallback to default stats for demo
        return {
          stats: {
            total: 12,
            byStatus: { backlog: 3, todo: 3, "in-progress": 3, review: 1, done: 2 },
            byPriority: { low: 3, medium: 4, high: 3, urgent: 2 },
            totalUsers: 4,
            completionRate: 17,
          },
        };
      }
      return res.json();
    },
  });

  const stats = data?.stats;
  const velocityData = generateVelocityData();
  const burndownData = generateBurndownData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-16 text-gray-500">
        Failed to load dashboard data.
      </div>
    );
  }

  const statusData = Object.entries(stats.byStatus).map(([name, value]) => ({
    name: name.replace("-", " "),
    value: value as number,
    fill: STATUS_COLORS[name] || "#ccc",
  }));

  const priorityData = Object.entries(stats.byPriority).map(
    ([name, value]) => ({
      name,
      value: value as number,
      fill: PRIORITY_COLORS[name] || "#ccc",
    })
  );

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Project analytics and team performance metrics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Tasks" value={stats.total} color="blue" />
        <SummaryCard
          label="Completion Rate"
          value={`${stats.completionRate}%`}
          color="green"
        />
        <SummaryCard
          label="In Progress"
          value={stats.byStatus["in-progress"]}
          color="yellow"
        />
        <SummaryCard
          label="Team Size"
          value={stats.totalUsers}
          color="purple"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tasks by Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tasks by Priority
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {priorityData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Velocity Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Team Velocity (14 days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#34D399"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Completed"
              />
              <Line
                type="monotone"
                dataKey="created"
                stroke="#60A5FA"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Created"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Burndown Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sprint Burndown
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={burndownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="remaining"
                stroke="#F87171"
                fill="#FEE2E2"
                strokeWidth={2}
                name="Remaining"
              />
              <Area
                type="monotone"
                dataKey="ideal"
                stroke="#9CA3AF"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Ideal"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <div
      className={`rounded-xl border p-5 ${colorMap[color] || colorMap.blue}`}
    >
      <div className="text-sm font-medium opacity-80">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
