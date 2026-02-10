import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Trash2, Plus } from "lucide-react"; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Connect to backend
const socket = io("http://localhost:5000");

const COLUMNS = ["To Do", "In Progress", "Done"];

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", category: "Feature", priority: "Medium" });
  const [file, setFile] = useState(null);

  useEffect(() => {
    socket.on("sync:tasks", (serverTasks) => setTasks(serverTasks));
    return () => socket.off("sync:tasks");
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const targetColumn = destination.droppableId;

    const updatedTasks = tasks.map(t => 
      t.id === draggableId ? { ...t, column: targetColumn } : t
    );
    setTasks(updatedTasks);
    socket.emit("task:move", { taskId: draggableId, targetColumn });
  };

  const handleAddTask = () => {
    if (!newTask.title) return;
    const taskPayload = {
      ...newTask,
      column: "To Do",
      filePreview: file ? URL.createObjectURL(file) : null
    };
    socket.emit("task:create", taskPayload);
    setNewTask({ title: "", category: "Feature", priority: "Medium" });
    setFile(null);
  };

  const handleDelete = (id) => socket.emit("task:delete", id);

  const graphData = COLUMNS.map(col => ({
    name: col,
    count: tasks.filter(t => t.column === col).length
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <h2 className="text-2xl font-bold mb-4">Kanban Board</h2>

      {/* --- FORM --- */}
      <div className="bg-white p-4 rounded shadow mb-6 flex gap-4 items-end flex-wrap">
        <div>
            <label className="block text-xs font-bold">Title</label>
            <input className="border p-2 rounded" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Task title..." />
        </div>
        <div>
            <label className="block text-xs font-bold">Priority</label>
            <select className="border p-2 rounded" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                <option>Low</option><option>Medium</option><option>High</option>
            </select>
        </div>
        <button onClick={handleAddTask} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
            <Plus size={16} /> Add
        </button>
      </div>

      {/* --- GRAPH --- */}
      <div className="mb-8 h-40 w-full bg-gray-50 p-4 rounded border">
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graphData}>
               <XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#8884d8" />
            </BarChart>
         </ResponsiveContainer>
      </div>

      {/* --- BOARD --- */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(colId => (
            <Droppable key={colId} droppableId={colId}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="bg-gray-100 p-4 rounded-lg min-h-[300px]" data-testid={`column-${colId}`}>
                  <h3 className="font-bold mb-3 text-gray-700">{colId}</h3>
                  {tasks.filter(t => t.column === colId).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-white p-3 mb-2 rounded shadow border-l-4 border-blue-500 relative group" style={{ ...provided.draggableProps.style }}>
                            <div className="flex justify-between">
                                <span className="font-medium">{task.title}</span>
                                <button onClick={() => handleDelete(task.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{task.priority} • {task.category}</div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;