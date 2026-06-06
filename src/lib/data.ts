/**
 * Data access layer that abstracts over MongoDB / in-memory store.
 * All API routes and server components should use this module.
 */

import { connectDB, isDBConnected } from "./db";
import { User, IUser } from "./models/User";
import { Task, ITask } from "./models/Task";
import { Message, IMessage } from "./models/Message";
import { store } from "./store";
import { hashPassword } from "./auth";

async function ensureDB() {
  if (!isDBConnected()) {
    await connectDB();
  }
  return isDBConnected();
}

// ─── Users ──────────────────────────────────────────────

export async function getUsers() {
  if (await ensureDB()) {
    return User.find({}).select("-password").lean();
  }
  return store.findUsers();
}

export async function getUserByEmail(email: string) {
  if (await ensureDB()) {
    return User.findOne({ email }).lean();
  }
  return store.findUserByEmail(email) || null;
}

export async function getUserByUsername(username: string) {
  if (await ensureDB()) {
    return User.findOne({ username }).lean();
  }
  return store.findUserByUsername(username) || null;
}

export async function getUserById(id: string) {
  if (await ensureDB()) {
    return User.findById(id).select("-password").lean();
  }
  return store.findUserById(id) || null;
}

export async function createUser(data: {
  email: string;
  username: string;
  password: string;
  role?: string;
}) {
  const hashed = hashPassword(data.password);
  if (await ensureDB()) {
    const user = await User.create({ ...data, password: hashed });
    const obj = user.toObject();
    delete (obj as any).password;
    return obj;
  }
  return store.createUser({ ...data, password: hashed });
}

// ─── Tasks ──────────────────────────────────────────────

export async function getTasks(filters?: {
  status?: string;
  priority?: string;
  assignee?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  if (await ensureDB()) {
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.priority) query.priority = filters.priority;
    if (filters?.assignee) query.assignee = filters.assignee;
    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { tags: { $in: [new RegExp(filters.search, "i")] } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const sortBy = filters?.sortBy || "createdAt";
    const sortOrder = filters?.sortOrder === "asc" ? 1 : -1;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("assignee", "username email")
        .populate("reporter", "username email")
        .lean(),
      Task.countDocuments(query),
    ]);

    return { tasks, total };
  }

  return store.findTasks(filters);
}

export async function getTaskById(id: string) {
  if (await ensureDB()) {
    return Task.findById(id)
      .populate("assignee", "username email")
      .populate("reporter", "username email")
      .populate("comments.userId", "username email")
      .lean();
  }
  return store.findTaskById(id) || null;
}

export async function createTask(data: any) {
  if (await ensureDB()) {
    const task = await Task.create(data);
    return task.toObject();
  }
  return store.createTask(data);
}

export async function updateTask(id: string, data: any) {
  if (await ensureDB()) {
    return Task.findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate("assignee", "username email")
      .populate("reporter", "username email")
      .lean();
  }
  return store.updateTask(id, data) || null;
}

export async function deleteTask(id: string) {
  if (await ensureDB()) {
    const result = await Task.findByIdAndDelete(id);
    return !!result;
  }
  return store.deleteTask(id);
}

export async function getStats() {
  if (await ensureDB()) {
    const [statusAgg, priorityAgg, totalUsers] = await Promise.all([
      Task.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Task.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
      User.countDocuments(),
    ]);

    const byStatus: any = {
      backlog: 0,
      todo: 0,
      "in-progress": 0,
      review: 0,
      done: 0,
    };
    statusAgg.forEach((s: any) => {
      byStatus[s._id] = s.count;
    });

    const byPriority: any = { low: 0, medium: 0, high: 0, urgent: 0 };
    priorityAgg.forEach((p: any) => {
      byPriority[p._id] = p.count;
    });

    const total = Object.values(byStatus).reduce(
      (a: any, b: any) => a + b,
      0
    ) as number;
    const completionRate =
      total > 0 ? Math.round((byStatus.done / total) * 100) : 0;

    return { total, byStatus, byPriority, totalUsers, completionRate };
  }

  return store.getStats();
}

// ─── Messages ───────────────────────────────────────────

export async function getMessages(channel: string = "general", limit: number = 50) {
  if (await ensureDB()) {
    return Message.find({ channel })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();
  }
  return store.findMessages(channel, limit);
}

export async function createMessage(data: {
  userId: string;
  username: string;
  text: string;
  channel?: string;
}) {
  if (await ensureDB()) {
    const msg = await Message.create(data);
    return msg.toObject();
  }
  return store.createMessage(data);
}
