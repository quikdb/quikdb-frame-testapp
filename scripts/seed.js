/**
 * Database seeder — populates MongoDB with sample data.
 * Run: node scripts/seed.js
 * Requires MONGODB_URI environment variable.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI environment variable is required.");
  console.error("Usage: MONGODB_URI=mongodb://localhost:27017/taskboard node scripts/seed.js");
  process.exit(1);
}

// ─── Schemas (inline to avoid TS import issues) ───

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "member", "viewer"], default: "member" },
    avatar: { type: String },
  },
  { timestamps: true }
);

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["backlog", "todo", "in-progress", "review", "done"],
      default: "todo",
    },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String }],
    dueDate: { type: Date },
    estimatedHours: { type: Number },
    actualHours: { type: Number },
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const MessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    channel: { type: String, default: "general" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const Task = mongoose.model("Task", TaskSchema);
const Message = mongoose.model("Message", MessageSchema);

// ─── Seed Data ───

const password = bcrypt.hashSync("password123", 12);

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  // Clear existing data
  await User.deleteMany({});
  await Task.deleteMany({});
  await Message.deleteMany({});
  console.log("Cleared existing data.");

  // Create users
  const users = await User.insertMany([
    { email: "admin@taskboard.dev", username: "admin", password, role: "admin" },
    { email: "alice@taskboard.dev", username: "alice", password, role: "member" },
    { email: "bob@taskboard.dev", username: "bob", password, role: "member" },
    { email: "carol@taskboard.dev", username: "carol", password, role: "viewer" },
  ]);
  console.log(`Created ${users.length} users.`);

  const [admin, alice, bob, carol] = users;

  // Create tasks
  const tasks = await Task.insertMany([
    {
      title: "Set up CI/CD pipeline",
      description: "Configure GitHub Actions for automated testing and deployment. Include linting, unit tests, and Docker build steps.",
      status: "done",
      priority: "high",
      assignee: alice._id,
      reporter: admin._id,
      tags: ["devops", "infrastructure"],
      estimatedHours: 8,
      actualHours: 6,
      comments: [{ userId: admin._id, text: "Make sure to include staging environment deploy" }],
    },
    {
      title: "Implement user authentication",
      description: "Build JWT-based authentication with login, register, and token refresh endpoints. Include password hashing with bcrypt.",
      status: "in-progress",
      priority: "urgent",
      assignee: bob._id,
      reporter: admin._id,
      tags: ["backend", "security"],
      estimatedHours: 16,
      dueDate: new Date("2024-04-01"),
    },
    {
      title: "Design dashboard mockups",
      description: "Create high-fidelity mockups for the analytics dashboard. Include charts for task completion rates, team velocity, and burndown.",
      status: "review",
      priority: "medium",
      assignee: alice._id,
      reporter: bob._id,
      tags: ["design", "frontend"],
      estimatedHours: 12,
      actualHours: 10,
      comments: [
        { userId: bob._id, text: "First draft ready for review" },
        { userId: admin._id, text: "Looks great! Minor tweaks needed on the color palette" },
      ],
    },
    {
      title: "Write API documentation",
      description: "Document all REST API endpoints with request/response examples. Use OpenAPI 3.0 specification format.",
      status: "todo",
      priority: "low",
      reporter: admin._id,
      tags: ["documentation"],
      estimatedHours: 6,
    },
    {
      title: "Optimize database queries",
      description: "Profile slow queries and add proper indexes. Focus on task listing and filtering operations that currently cause N+1 queries.",
      status: "backlog",
      priority: "high",
      reporter: alice._id,
      tags: ["backend", "performance"],
      estimatedHours: 10,
    },
    {
      title: "Add real-time notifications",
      description: "Implement WebSocket-based notifications for task assignments, comments, and status changes. Use Socket.IO for transport.",
      status: "todo",
      priority: "medium",
      assignee: bob._id,
      reporter: admin._id,
      tags: ["backend", "frontend", "feature"],
      estimatedHours: 20,
      dueDate: new Date("2024-04-15"),
    },
    {
      title: "Mobile responsive layout",
      description: "Make all pages fully responsive for mobile and tablet devices. Use Tailwind breakpoints consistently.",
      status: "in-progress",
      priority: "medium",
      assignee: alice._id,
      reporter: admin._id,
      tags: ["frontend", "design"],
      estimatedHours: 14,
    },
    {
      title: "Set up error monitoring",
      description: "Integrate Sentry or similar error tracking service. Configure source maps and environment-specific error reporting.",
      status: "backlog",
      priority: "low",
      reporter: bob._id,
      tags: ["devops", "monitoring"],
      estimatedHours: 4,
    },
    {
      title: "Implement task search",
      description: "Add full-text search capability for tasks. Support searching by title, description, and tags. Include auto-complete suggestions.",
      status: "todo",
      priority: "high",
      assignee: alice._id,
      reporter: admin._id,
      tags: ["backend", "frontend", "feature"],
      estimatedHours: 12,
      dueDate: new Date("2024-04-10"),
    },
    {
      title: "Add file attachments",
      description: "Allow users to upload and attach files to tasks. Support images, PDFs, and documents up to 10MB. Store in S3.",
      status: "backlog",
      priority: "low",
      reporter: alice._id,
      tags: ["backend", "feature", "storage"],
      estimatedHours: 16,
    },
    {
      title: "Create onboarding flow",
      description: "Build a guided onboarding experience for new users. Include project creation wizard and team invite flow.",
      status: "todo",
      priority: "medium",
      assignee: bob._id,
      reporter: admin._id,
      tags: ["frontend", "ux"],
      estimatedHours: 10,
    },
    {
      title: "Implement role-based access control",
      description: "Enforce permissions based on user roles (admin, member, viewer). Admins can manage users, members can edit tasks, viewers are read-only.",
      status: "in-progress",
      priority: "urgent",
      assignee: bob._id,
      reporter: admin._id,
      tags: ["backend", "security"],
      estimatedHours: 14,
      dueDate: new Date("2024-03-25"),
      comments: [{ userId: bob._id, text: "Middleware layer is done, working on frontend guards now" }],
    },
  ]);
  console.log(`Created ${tasks.length} tasks.`);

  // Create messages
  const messages = await Message.insertMany([
    { userId: admin._id, username: "admin", text: "Welcome to the Task Board chat!", channel: "general" },
    { userId: alice._id, username: "alice", text: "Hey team, the CI pipeline is looking good", channel: "general" },
    { userId: bob._id, username: "bob", text: "Auth implementation is coming along nicely", channel: "general" },
    { userId: admin._id, username: "admin", text: "Great progress everyone! Let's keep it up.", channel: "general" },
    { userId: carol._id, username: "carol", text: "Just joined as a viewer, looking forward to following progress!", channel: "general" },
  ]);
  console.log(`Created ${messages.length} messages.`);

  console.log("\nSeed complete! Default credentials:");
  console.log("  Email: admin@taskboard.dev");
  console.log("  Password: password123");

  await mongoose.disconnect();
  console.log("Disconnected.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
