import { render, screen } from "@testing-library/react"

import ApplicationsPage from "../page"

jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: { id: "test-user-id" },
        },
        error: null,
      }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    }),
  },
}))

describe("ApplicationsPage", () => {
  it("shows the empty state when there are no applications", async () => {
    render(<ApplicationsPage />)

    expect(
      await screen.findByText("No applications yet")
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        /Start tracking your job search by adding your first application/i
      )
    ).toBeInTheDocument()
  })
})