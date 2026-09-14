import { render, screen } from "@testing-library/react"
import { AlymeraAssistant } from "../alymera-assistant"

jest.mock("@ai-sdk/react", () => ({
  useChat: jest.fn(() => ({
    messages: [],
    sendMessage: jest.fn(),
    status: "ready",
    error: null,
    stop: jest.fn(),
    setMessages: jest.fn(),
    addToolApprovalResponse: jest.fn(),
  })),
}))

jest.mock("ai", () => ({
  DefaultChatTransport: jest.fn().mockImplementation(() => ({})),
  lastAssistantMessageIsCompleteWithApprovalResponses: jest.fn(),
}))

jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: jest.fn(),
  },
}))

jest.mock("@react-three/fiber", () => ({
  Canvas: () => <div>Mock Canvas</div>,
}))

jest.mock("@/components/hero/Mascot", () => ({
  __esModule: true,
  default: () => <div>Mock Mascot</div>,
}))

jest.mock("@/components/ai-elements/conversation", () => ({
  Conversation: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ConversationContent: ({
    children,
  }: {
    children: React.ReactNode
  }) => <div>{children}</div>,
  ConversationScrollButton: () => null,
}))

jest.mock("@/components/ai-elements/message", () => ({
  Message: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  MessageContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  MessageResponse: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

jest.mock("@/components/ai-elements/tool", () => ({
  Tool: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ToolHeader: () => null,
  ToolContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ToolInput: () => null,
  ToolOutput: () => null,
}))

jest.mock("@/components/ai-elements/prompt-input", () => ({
  PromptInput: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PromptInputTextarea: () => <textarea />,
  PromptInputSubmit: () => <button>Send</button>,
}))

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    type,
  }: {
    children: React.ReactNode
    onClick?: () => void
    type?: "button" | "submit" | "reset"
  }) => (
    <button type={type} onClick={onClick}>
      {children}
    </button>
  ),
}))

describe("AlymeraAssistant", () => {
  it("renders the demo AI assistant empty state", () => {
    render(<AlymeraAssistant demo />)

    expect(screen.getByText("Try Alymera AI")).toBeInTheDocument()

    expect(
      screen.getByText(
        /Ask a question to experience Alymera's conversational AI/i
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText("Public demonstration · No personal data connected")
    ).toBeInTheDocument()
  })
})