const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); 

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

let tasks = [
  { id: "1", title: "Setup Project", category: "Feature", priority: "High", column: "Done" },
  { id: "2", title: "Build WebSocket Server", category: "Feature", priority: "High", column: "In Progress" },
  { id: "3", title: "Write Unit Tests", category: "Enhancement", priority: "Medium", column: "To Do" }
];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);


  socket.emit("sync:tasks", tasks);

  socket.on("task:create", (newTask) => {
    const taskWithId = { ...newTask, id: Date.now().toString() }; 
    tasks.push(taskWithId);
    io.emit("sync:tasks", tasks); 
  });

  socket.on("task:move", ({ taskId, targetColumn }) => {
    tasks = tasks.map(task => 
      task.id === taskId ? { ...task, column: targetColumn } : task
    );
    io.emit("sync:tasks", tasks);
  });
  socket.on("task:update", (updatedTask) => {
    tasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    io.emit("sync:tasks", tasks);
  });

  socket.on("task:delete", (taskId) => {
    tasks = tasks.filter(task => task.id !== taskId);
    io.emit("sync:tasks", tasks);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
