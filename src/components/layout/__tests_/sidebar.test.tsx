import { render, screen } from "@testing-library/react"
import { SidebarLayout } from "../sidebar"

jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: null,
        },
        error: null,
      }),
    },
    from: jest.fn(),
  },
}))

jest.mock("@/components/layout/header", () => ({
  Header: () => <div>Header</div>,
}))

jest.mock("../SidebarUserInfo", () => ({
  SidebarUserInfo: () => <div>User Info</div>,
}))

describe("SidebarLayout", () => {
  it("renders the main navigation links", () => {
    render(
      <SidebarLayout>
        <div>Page Content</div>
      </SidebarLayout>
    )

    expect(
      screen.getByRole("link", { name: /dashboard/i })
    ).toHaveAttribute("href", "/dashboard")

    expect(
      screen.getByRole("link", { name: /build mode/i })
    ).toHaveAttribute("href", "/build")

    expect(
      screen.getByRole("link", { name: /career mode/i })
    ).toHaveAttribute("href", "/career")

    expect(
      screen.getByRole("link", { name: /alymera ai/i })
    ).toHaveAttribute("href", "/aly")

    expect(
      screen.getByRole("link", { name: /history/i })
    ).toHaveAttribute("href", "/history")

    const profileLinks = screen.getAllByRole("link", {
      name: /profile/i,
    })

    expect(profileLinks[0]).toHaveAttribute("href", "/profile")

    expect(
      screen.getByRole("link", { name: /settings/i })
    ).toHaveAttribute("href", "/settings")
  })

  it("renders the page content inside the layout", () => {
    render(
      <SidebarLayout>
        <div>Test Page Content</div>
      </SidebarLayout>
    )

    expect(screen.getByText("Test Page Content")).toBeInTheDocument()
  })
})