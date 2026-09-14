import { render, screen } from "@testing-library/react"
import ProjectWorkSpace from "../project-workspace"

jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: "project-123",
              name: "Test Project",
              description: "Test project description",
              image_src: "",
              status: "Planning",
              tech_stack: ["Next.js", "Supabase"],
              due_date: null,
            },
            error: null,
          }),
        })),
      })),
    })),
  },
}))
jest.mock("@/components/build/overview", () => ({
  Overview: ({ projectId }: { projectId: string }) => (
    <div>Overview project: {projectId}</div>
  ),
}))

jest.mock("@/components/build/kanban", () => ({
  Kanban: ({ projectId }: { projectId: string }) => (
    <div>Kanban project: {projectId}</div>
  ),
}))

jest.mock("@/components/build/roadmap", () => ({
  Roadmap: ({ projectId }: { projectId: string }) => (
    <div>Roadmap project: {projectId}</div>
  ),
}))

jest.mock("@/components/build/coding-assistant", () => ({
  CodingAssistant: ({ projectId }: { projectId: string }) => (
    <div>Coding AI project: {projectId}</div>
  ),
}))

describe("ProjectWorkSpace", () => {
  it("loads and passes the current project ID to the workspace", async () => {
    render(
      <ProjectWorkSpace
        id="project-123"
        conversationId={null}
        requestedTab="overview"
      />
    )

    expect(
      await screen.findByText("Test Project")
    ).toBeInTheDocument()

    expect(
      screen.getByText("Overview project: project-123")
    ).toBeInTheDocument()
  })
})