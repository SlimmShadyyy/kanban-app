import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";
import React from "react";

// ✅ FIX: Use vi.hoisted to ensure this exists before the mock runs
const { socketMock } = vi.hoisted(() => {
  return {
    socketMock: {
      on: vi.fn(),
      emit: vi.fn(),
      off: vi.fn(),
    },
  };
});

vi.mock("socket.io-client", () => ({
  default: () => socketMock,
}));

describe("WebSocket Integration", () => {
  it("updates the board when 'sync:tasks' event is received", async () => {
    render(<KanbanBoard />);

    // 1. Find the callback the component registered
    // We look into our mock to find the listener for "sync:tasks"
    // .calls looks like: [ ["sync:tasks", callbackFunction], ... ]
    const calls = socketMock.on.mock.calls;
    const syncCall = calls.find((call) => call[0] === "sync:tasks");
    
    // Safety check in case the component didn't register the event yet
    expect(syncCall).toBeDefined();
    
    const syncCallback = syncCall[1];

    // 2. Simulate server sending a task
    const mockServerData = [
      { id: "99", title: "Integration Test Task", column: "To Do", priority: "High", category: "Bug" }
    ];
    
    // Execute the callback (simulate incoming data)
    syncCallback(mockServerData);

    // 3. Verify the task appears on the screen
    await waitFor(() => {
        expect(screen.getByText("Integration Test Task")).toBeInTheDocument();
    });
  });
});