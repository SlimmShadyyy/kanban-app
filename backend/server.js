const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow requests from your React frontend

const server = http.createServer(app);

// Configure Socket.IO with CORS to allow the frontend connection
const io = new Server(server, {
  cors: {
    origin: "*", // Allow any origin (e.g. localhost:5173)
    methods: ["GET", "POST"]
  }
});

// --- In-Memory Database ---
// This array acts as our database. It resets if you restart the server.
let tasks = [
  { id: "1", title: "Setup Project", category: "Feature", priority: "High", column: "Done" },
  { id: "2", title: "Build WebSocket Server", category: "Feature", priority: "High", column: "In Progress" },
  { id: "3", title: "Write Unit Tests", category: "Enhancement", priority: "Medium", column: "To Do" }
];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // 1. Initial Sync: Send existing tasks to the user who just connected
  socket.emit("sync:tasks", tasks);

  // 2. Create Task: Receive new task -> Add to list -> Broadcast to ALL users
  socket.on("task:create", (newTask) => {
    const taskWithId = { ...newTask, id: Date.now().toString() }; // Generate simple ID
    tasks.push(taskWithId);
    io.emit("sync:tasks", tasks); // Update everyone's board immediately
  });

  // 3. Move Task: Update the column status -> Broadcast
  socket.on("task:move", ({ taskId, targetColumn }) => {
    tasks = tasks.map(task => 
      task.id === taskId ? { ...task, column: targetColumn } : task
    );
    io.emit("sync:tasks", tasks);
  });

  // 4. Update Task: Edit details (priority, etc.) -> Broadcast
  socket.on("task:update", (updatedTask) => {
    tasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    io.emit("sync:tasks", tasks);
  });

  // 5. Delete Task: Remove from list -> Broadcast
  socket.on("task:delete", (taskId) => {
    tasks = tasks.filter(task => task.id !== taskId);
    io.emit("sync:tasks", tasks);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));