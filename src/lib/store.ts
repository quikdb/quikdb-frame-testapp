/**
 * In-memory data store fallback when MongoDB is not available.
 * This allows the app to work standalone without any database.
 */

import bcrypt from "bcryptjs";

export interface InMemoryUser {
  _id: string;
  email: string;
  username: string;
  password: string;
  role: "admin" | "member" | "viewer";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InMemoryTask {
  _id: string;
  title: string;
  description: string;
  status: "backlog" | "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  reporter: string;
  tags: string[];
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  comments: { userId: string; text: string; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface InMemoryMessage {
  _id: string;
  userId: string;
  username: string;
  text: string;
  channel: string;
  createdAt: string;
}

function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

const hashedPassword = bcrypt.hashSync("password123", 10);

const defaultUsers: InMemoryUser[] = [
  {
    _id: "user_001",
    email: "admin@taskboard.dev",
    username: "admin",
    password: hashedPassword,
    role: "admin",
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
  },
  {
    _id: "user_002",
    email: "alice@taskboard.dev",
    username: "alice",
    password: hashedPassword,
    role: "member",
    createdAt: new Date("2024-01-05").toISOString(),
    updatedAt: new Date("2024-01-05").toISOString(),
  },
  {
    _id: "user_003",
    email: "bob@taskboard.dev",
    username: "bob",
    password: hashedPassword,
    role: "member",
    createdAt: new Date("2024-01-10").toISOString(),
    updatedAt: new Date("2024-01-10").toISOString(),
  },
  {
    _id: "user_004",
    email: "carol@taskboard.dev",
    username: "carol",
    password: hashedPassword,
    role: "viewer",
    createdAt: new Date("2024-02-01").toISOString(),
    updatedAt: new Date("2024-02-01").toISOString(),
  },
];

const defaultTasks: InMemoryTask[] = [
  {
    _id: "task_001",
    title: "Set up CI/CD pipeline",
    description:
      "Configure GitHub Actions for automated testing and deployment. Include linting, unit tests, and Docker build steps.",
    status: "done",
    priority: "high",
    assignee: "user_002",
    reporter: "user_001",
    tags: ["devops", "infrastructure"],
    estimatedHours: 8,
    actualHours: 6,
    comments: [
      {
        userId: "user_001",
        text: "Make sure to include staging environment deploy",
        createdAt: new Date("2024-03-01").toISOString(),
      },
    ],
    createdAt: new Date("2024-02-15").toISOString(),
    updatedAt: new Date("2024-03-05").toISOString(),
  },
  {
    _id: "task_002",
    title: "Implement user authentication",
    description:
      "Build JWT-based authentication with login, register, and token refresh endpoints. Include password hashing with bcrypt.",
    status: "in-progress",
    priority: "urgent",
    assignee: "user_003",
    reporter: "user_001",
    tags: ["backend", "security"],
    estimatedHours: 16,
    dueDate: new Date("2024-04-01").toISOString(),
    comments: [],
    createdAt: new Date("2024-03-01").toISOString(),
    updatedAt: new Date("2024-03-10").toISOString(),
  },
  {
    _id: "task_003",
    title: "Design dashboard mockups",
    description:
      "Create high-fidelity mockups for the analytics dashboard. Include charts for task completion rates, team velocity, and burndown.",
    status: "review",
    priority: "medium",
    assignee: "user_002",
    reporter: "user_003",
    tags: ["design", "frontend"],
    estimatedHours: 12,
    actualHours: 10,
    comments: [
      {
        userId: "user_003",
        text: "First draft ready for review",
        createdAt: new Date("2024-03-08").toISOString(),
      },
      {
        userId: "user_001",
        text: "Looks great! Minor tweaks needed on the color palette",
        createdAt: new Date("2024-03-09").toISOString(),
      },
    ],
    createdAt: new Date("2024-03-02").toISOString(),
    updatedAt: new Date("2024-03-09").toISOString(),
  },
  {
    _id: "task_004",
    title: "Write API documentation",
    description:
      "Document all REST API endpoints with request/response examples. Use OpenAPI 3.0 specification format.",
    status: "todo",
    priority: "low",
    reporter: "user_001",
    tags: ["documentation"],
    estimatedHours: 6,
    comments: [],
    createdAt: new Date("2024-03-05").toISOString(),
    updatedAt: new Date("2024-03-05").toISOString(),
  },
  {
    _id: "task_005",
    title: "Optimize database queries",
    description:
      "Profile slow queries and add proper indexes. Focus on task listing and filtering operations that currently cause N+1 queries.",
    status: "backlog",
    priority: "high",
    reporter: "user_002",
    tags: ["backend", "performance"],
    estimatedHours: 10,
    comments: [],
    createdAt: new Date("2024-03-06").toISOString(),
    updatedAt: new Date("2024-03-06").toISOString(),
  },
  {
    _id: "task_006",
    title: "Add real-time notifications",
    description:
      "Implement WebSocket-based notifications for task assignments, comments, and status changes. Use Socket.IO for transport.",
    status: "todo",
    priority: "medium",
    assignee: "user_003",
    reporter: "user_001",
    tags: ["backend", "frontend", "feature"],
    estimatedHours: 20,
    dueDate: new Date("2024-04-15").toISOString(),
    comments: [],
    createdAt: new Date("2024-03-07").toISOString(),
    updatedAt: new Date("2024-03-07").toISOString(),
  },
  {
    _id: "task_007",
    title: "Mobile responsive layout",
    description:
      "Make all pages fully responsive for mobile and tablet devices. Use Tailwind breakpoints consistently.",
    status: "in-progress",
    priority: "medium",
    assignee: "user_002",
    reporter: "user_001",
    tags: ["frontend", "design"],
    estimatedHours: 14,
    comments: [],
    createdAt: new Date("2024-03-08").toISOString(),
    updatedAt: new Date("2024-03-12").toISOString(),
  },
  {
    _id: "task_008",
    title: "Set up error monitoring",
    description:
      "Integrate Sentry or similar error tracking service. Configure source maps and environment-specific error reporting.",
    status: "backlog",
    priority: "low",
    reporter: "user_003",
    tags: ["devops", "monitoring"],
    estimatedHours: 4,
    comments: [],
    createdAt: new Date("2024-03-09").toISOString(),
    updatedAt: new Date("2024-03-09").toISOString(),
  },
  {
    _id: "task_009",
    title: "Implement task search",
    description:
      "Add full-text search capability for tasks. Support searching by title, description, and tags. Include auto-complete suggestions.",
    status: "todo",
    priority: "high",
    assignee: "user_002",
    reporter: "user_001",
    tags: ["backend", "frontend", "feature"],
    estimatedHours: 12,
    dueDate: new Date("2024-04-10").toISOString(),
    comments: [],
    createdAt: new Date("2024-03-10").toISOString(),
    updatedAt: new Date("2024-03-10").toISOString(),
  },
  {
    _id: "task_010",
    title: "Add file attachments",
    description:
      "Allow users to upload and attach files to tasks. Support images, PDFs, and documents up to 10MB. Store in S3.",
    status: "backlog",
    priority: "low",
    reporter: "user_002",
    tags: ["backend", "feature", "storage"],
    estimatedHours: 16,
    comments: [],
    createdAt: new Date("2024-03-11").toISOString(),
    updatedAt: new Date("2024-03-11").toISOString(),
  },
  {
    _id: "task_011",
    title: "Create onboarding flow",
    description:
      "Build a guided onboarding experience for new users. Include project creation wizard and team invite flow.",
    status: "todo",
    priority: "medium",
    assignee: "user_003",
    reporter: "user_001",
    tags: ["frontend", "ux"],
    estimatedHours: 10,
    comments: [],
    createdAt: new Date("2024-03-12").toISOString(),
    updatedAt: new Date("2024-03-12").toISOString(),
  },
  {
    _id: "task_012",
    title: "Implement role-based access control",
    description:
      "Enforce permissions based on user roles (admin, member, viewer). Admins can manage users, members can edit tasks, viewers are read-only.",
    status: "in-progress",
    priority: "urgent",
    assignee: "user_003",
    reporter: "user_001",
    tags: ["backend", "security"],
    estimatedHours: 14,
    dueDate: new Date("2024-03-25").toISOString(),
    comments: [
      {
        userId: "user_003",
        text: "Middleware layer is done, working on frontend guards now",
        createdAt: new Date("2024-03-14").toISOString(),
      },
    ],
    createdAt: new Date("2024-03-13").toISOString(),
    updatedAt: new Date("2024-03-14").toISOString(),
  },
];

class InMemoryStore {
  users: InMemoryUser[];
  tasks: InMemoryTask[];
  messages: InMemoryMessage[];

  constructor() {
    this.users = [...defaultUsers];
    this.tasks = [...defaultTasks];
    this.messages = [
      {
        _id: "msg_001",
        userId: "user_001",
        username: "admin",
        text: "Welcome to the Task Board chat!",
        channel: "general",
        createdAt: new Date("2024-03-01").toISOString(),
      },
      {
        _id: "msg_002",
        userId: "user_002",
        username: "alice",
        text: "Hey team, the CI pipeline is looking good",
        channel: "general",
        createdAt: new Date("2024-03-02").toISOString(),
      },
      {
        _id: "msg_003",
        userId: "user_003",
        username: "bob",
        text: "Auth implementation is coming along nicely",
        channel: "general",
        createdAt: new Date("2024-03-03").toISOString(),
      },
    ];
  }

  // Users
  findUsers(): InMemoryUser[] {
    return this.users.map((u) => ({ ...u, password: "" }));
  }

  findUserByEmail(email: string): InMemoryUser | undefined {
    return this.users.find((u) => u.email === email);
  }

  findUserByUsername(username: string): InMemoryUser | undefined {
    return this.users.find((u) => u.username === username);
  }

  findUserById(id: string): InMemoryUser | undefined {
    return this.users.find((u) => u._id === id);
  }

  createUser(data: Partial<InMemoryUser>): InMemoryUser {
    const user: InMemoryUser = {
      _id: generateId(),
      email: data.email || "",
      username: data.username || "",
      password: data.password || "",
      role: data.role || "member",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(user);
    return { ...user, password: "" };
  }

  // Tasks
  findTasks(filters?: {
    status?: string;
    priority?: string;
    assignee?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): { tasks: InMemoryTask[]; total: number } {
    let filtered = [...this.tasks];

    if (filters?.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }
    if (filters?.priority) {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }
    if (filters?.assignee) {
      filtered = filtered.filter((t) => t.assignee === filters.assignee);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          t.description.toLowerCase().includes(s) ||
          t.tags.some((tag) => tag.toLowerCase().includes(s))
      );
    }

    // Sort
    const sortBy = filters?.sortBy || "createdAt";
    const sortOrder = filters?.sortOrder === "asc" ? 1 : -1;
    filtered.sort((a: any, b: any) => {
      if (a[sortBy] < b[sortBy]) return -1 * sortOrder;
      if (a[sortBy] > b[sortBy]) return 1 * sortOrder;
      return 0;
    });

    const total = filtered.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const start = (page - 1) * limit;
    filtered = filtered.slice(start, start + limit);

    return { tasks: filtered, total };
  }

  findTaskById(id: string): InMemoryTask | undefined {
    return this.tasks.find((t) => t._id === id);
  }

  createTask(data: Partial<InMemoryTask>): InMemoryTask {
    const task: InMemoryTask = {
      _id: generateId(),
      title: data.title || "",
      description: data.description || "",
      status: data.status || "todo",
      priority: data.priority || "medium",
      assignee: data.assignee,
      reporter: data.reporter || "user_001",
      tags: data.tags || [],
      dueDate: data.dueDate,
      estimatedHours: data.estimatedHours,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.push(task);
    return task;
  }

  updateTask(
    id: string,
    data: Partial<InMemoryTask>
  ): InMemoryTask | undefined {
    const index = this.tasks.findIndex((t) => t._id === id);
    if (index === -1) return undefined;
    this.tasks[index] = {
      ...this.tasks[index],
      ...data,
      _id: id,
      updatedAt: new Date().toISOString(),
    };
    return this.tasks[index];
  }

  deleteTask(id: string): boolean {
    const index = this.tasks.findIndex((t) => t._id === id);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    return true;
  }

  getStats() {
    const statusCounts = {
      backlog: 0,
      todo: 0,
      "in-progress": 0,
      review: 0,
      done: 0,
    };
    const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };

    this.tasks.forEach((t) => {
      statusCounts[t.status]++;
      priorityCounts[t.priority]++;
    });

    return {
      total: this.tasks.length,
      byStatus: statusCounts,
      byPriority: priorityCounts,
      totalUsers: this.users.length,
      completionRate:
        this.tasks.length > 0
          ? Math.round((statusCounts.done / this.tasks.length) * 100)
          : 0,
    };
  }

  // Messages
  findMessages(channel: string = "general", limit: number = 50): InMemoryMessage[] {
    return this.messages
      .filter((m) => m.channel === channel)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .slice(-limit);
  }

  createMessage(data: Partial<InMemoryMessage>): InMemoryMessage {
    const msg: InMemoryMessage = {
      _id: generateId(),
      userId: data.userId || "",
      username: data.username || "anonymous",
      text: data.text || "",
      channel: data.channel || "general",
      createdAt: new Date().toISOString(),
    };
    this.messages.push(msg);
    return msg;
  }
}

// Singleton
declare global {
  var inMemoryStore: InMemoryStore | undefined;
}

export const store: InMemoryStore =
  global.inMemoryStore || new InMemoryStore();

if (!global.inMemoryStore) {
  global.inMemoryStore = store;
}
