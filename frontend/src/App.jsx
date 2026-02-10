import React from "react";
import KanbanBoard from "./components/KanbanBoard";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Real-time Kanban Board
      </h1>
      <KanbanBoard />
    </div>
  );
}

export default App;
