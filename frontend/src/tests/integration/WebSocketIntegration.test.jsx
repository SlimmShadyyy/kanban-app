import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";
import React from "react";

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

    const calls = socketMock.on.mock.calls;
    const syncCall = calls.find((call) => call[0] === "sync:tasks");
    
    expect(syncCall).toBeDefined();
    
    const syncCallback = syncCall[1];

    const mockServerData = [
      { id: "99", title: "Integration Test Task", column: "To Do", priority: "High", category: "Bug" }
    ];
    
    syncCallback(mockServerData);

    await waitFor(() => {
        expect(screen.getByText("Integration Test Task")).toBeInTheDocument();
    });
  });
});
