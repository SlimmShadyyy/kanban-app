import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";

// ✅ FIX: Correct import path (removed extra 'src')
import KanbanBoard from "../../components/KanbanBoard"; 

// Mock Socket.io so the test doesn't crash
vi.mock("socket.io-client", () => ({
  default: () => ({
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
  }),
}));

describe("KanbanBoard Unit Tests", () => {
  it("renders the main board title", () => {
    render(<KanbanBoard />);
    // This looks for the <h2> we added earlier
    expect(screen.getByText("Kanban Board")).toBeInTheDocument();
  });

  it("renders all three columns", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("allows typing in the task input", () => {
    render(<KanbanBoard />);
    const input = screen.getByPlaceholderText("Task title...");
    fireEvent.change(input, { target: { value: "New Unit Test Task" } });
    expect(input.value).toBe("New Unit Test Task");
  });
});