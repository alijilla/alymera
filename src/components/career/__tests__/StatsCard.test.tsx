import { render, screen } from "@testing-library/react"
import { StatsCard } from "../StatsCard"

describe("StatsCard", () => {
  it("renders the label and value", () => {
    render(<StatsCard label="Applications" value={12} />)

    expect(screen.getByText("Applications")).toBeInTheDocument()
    expect(screen.getByText("12")).toBeInTheDocument()
  })
})