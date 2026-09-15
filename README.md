# Alymera — Build. Apply. Become.

**FlyRank AI Frontend AI Engineer Capstone**

Alymera is an AI-powered workspace for developers and graduating students who manage both **software projects** and **job applications**.

Instead of switching between separate tools for project planning, task management, resume preparation, and job tracking, Alymera brings these workflows together in one workspace.

## Live Demo

**Production:** `<your deployed Vercel URL>`

> The production deployment is currently being finalized and tested as part of the capstone submission.

---

## What Alymera Does

Alymera has two main areas:

### Build Mode

Build Mode helps users organize and work on software projects.

* Create and manage projects
* Break project ideas into actionable tasks
* Organize tasks with a Kanban workflow
* Drag and drop tasks between statuses
* Track milestones and project progress
* Estimate task effort
* Use AI for project and coding assistance
* Stream AI responses instead of waiting for one large response
* Work with project-specific context so the AI can focus on the active project

### Career Mode

Career Mode helps developers manage their job search.

* Create and manage job applications
* Track application status
* Store resume information
* Compare a resume against a job description
* Generate a structured match score
* Identify matched and missing skills
* Highlight strengths and improvement areas
* Get AI-assisted resume guidance
* Organize applications in one workspace

---

## Key Features

### AI Project Assistant

The AI assistant can work with project and career context and use application tools to perform supported actions.

The assistant can:

* Read project information
* Read current project tasks and milestones
* Check project progress
* Create projects
* Create tasks
* Create milestones
* Work with job applications
* Read resume information
* Assist with career analysis

Mutation actions use approval steps before changes are made.

### Streaming AI Responses

Alymera uses the Vercel AI SDK to stream assistant responses progressively.

This allows users to see the AI response as it is generated instead of waiting for the entire response to finish.

### Current Project Context

When a user is inside a specific project workspace, the AI is instructed to treat that project as the active project.

Project-specific tools are used to avoid accidentally reading or modifying unrelated projects.

The application also verifies relevant database state before making claims about project data.

### Career Assistant

The Career Assistant provides structured resume/job-description analysis including:

* Match score
* Matching skills
* Missing skills
* Strengths
* Suggestions for improvement

---

## Tech Stack

### Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui
* Motion
* React Hook Form
* Zod

### AI

* Vercel AI SDK
* Groq
* `openai/gpt-oss-120b`
* Streaming responses
* Tool calling
* Structured AI workflows
* Human-in-the-loop approval for mutations

### Backend & Data

* Supabase
* PostgreSQL
* Supabase Auth
* Next.js Route Handlers

### Other Technologies

* dnd-kit
* React Three Fiber
* Three.js
* Streamdown
* Jest
* React Testing Library
* Vercel

---

## Architecture

Alymera uses a Next.js App Router architecture.

```text
User
 │
 ▼
Next.js / React UI
 │
 ├── Build Mode
 │    ├── Projects
 │    ├── Tasks
 │    ├── Milestones
 │    └── AI Project Assistant
 │
 ├── Career Mode
 │    ├── Applications
 │    ├── Resume
 │    └── Career Assistant
 │
 ▼
Next.js API Routes
 │
 ├── Authentication
 ├── AI orchestration
 ├── Tool execution
 └── Streaming responses
 │
 ├───────────────┐
 ▼               ▼
Groq          Supabase
AI Model      PostgreSQL
              Auth / Data
```

The AI route is responsible for coordinating model responses, project/career context, tools, approvals, and streamed output.

---

## AI Route Protection

The production AI endpoint includes basic protections against trivial abuse.

### Request size cap

Requests larger than **100 KB** are rejected.

This helps prevent unnecessarily large requests from being sent to the AI provider.

### Streaming duration

The AI route uses:

```ts
export const maxDuration = 30
```

This places a sensible maximum duration on streaming AI requests.

### Retry behavior

AI requests use:

```ts
maxRetries: 0
```

This prevents automatic retries from unnecessarily increasing provider usage.

### Authentication and data scoping

Authenticated AI functionality is associated with the current user, and project/application operations are scoped to the appropriate user and active project context.

Secrets such as AI provider keys are stored as environment variables and are not exposed to the client.

---

## Getting Started

### Prerequisites

* Node.js
* npm
* Supabase project
* Groq API key

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd alymera
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GROQ_API_KEY=your_groq_api_key
```

Do not commit `.env.local` or API keys to the repository.

### 4. Start the development server

```bash
npm run dev
```

Then open the local Next.js development server shown in your terminal.

### 5. Create a production build

```bash
npm run build
```

### 6. Start the production server locally

```bash
npm run start
```

---

## Environment Variables

| Variable                               | Required | Purpose                               |
| -------------------------------------- | -------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Yes      | Supabase project URL                  |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes      | Supabase client/server authentication |
| `GROQ_API_KEY`                         | Yes      | Access to the Groq AI provider        |

Keep secret credentials in environment variables rather than hard-coding them into source code.

---

## Testing

Alymera includes automated tests using Jest and React Testing Library.

Current tests cover areas including:

* Component rendering
* Empty application states
* Project workspace context
* AI assistant demo behavior
* Supabase-related UI behavior

Run the available checks with:

```bash
npm test
```

For a production build:

```bash
npm run build
```

---

## 3D Experience

The landing page includes an interactive 3D experience built with React Three Fiber and Three.js.

The experience includes:

* Custom Alymera mascot
* Floating workspace interface
* Pointer-based interaction
* Hover interactions
* Lazy loading
* Reduced-motion consideration
* Lightweight 3D geometry
* Capped device pixel ratio

The 3D experience is treated as an enhancement to the landing page rather than a requirement for using the core application.

---

## Design Decisions

### Why Supabase?

Supabase provides PostgreSQL, authentication, and database access in one service, which simplified the application's full-stack architecture.

### Why Groq?

Groq was selected as the current AI provider because of its fast inference experience and compatibility with the AI SDK architecture.

The AI provider integration is kept replaceable so another supported provider can be introduced later if needed.

### Why streaming?

Streaming makes AI interactions feel more responsive because users can see the answer being generated progressively.

### Why tool calling?

Tool calling allows the AI assistant to interact with application data and perform supported operations instead of only returning plain text.

### Why human approval?

Actions that modify project or career data require approval before execution. This reduces the risk of an AI assistant making unintended changes.

---

## How AI Tools Were Used to Build Alymera

AI tools were used throughout development as development assistance rather than as a replacement for engineering decisions.

They helped with activities such as:

* Exploring implementation approaches
* Debugging errors
* Understanding unfamiliar APIs
* Generating initial code ideas
* Refactoring and cleanup
* Writing and improving tests
* Reviewing implementation details
* Improving documentation

The application was still developed through manual testing, debugging, code review, architectural decisions, and iterative changes.

AI-generated suggestions were reviewed and adapted to the actual requirements of Alymera.

---

## Production Status

Alymera is deployed to Vercel as the production capstone application.

The final stage focuses on:

* Production verification
* Cross-browser checks
* Final documentation
* End-to-end testing
* Capstone submission

The project is intentionally documented around the functionality that is actually implemented rather than planned future features.

---

## Known Limitations

* AI functionality depends on the availability and usage limits of the configured AI provider.
* AI responses may vary depending on the model and prompt context.
* Performance can vary depending on device and network conditions.
* The 3D landing experience adds additional client-side work.
* Some advanced performance optimizations may be considered in future iterations.

---

## Future Improvements

Potential future improvements include:

* More advanced AI project planning
* GitHub integration
* Deeper career analytics
* More automation around job applications
* Additional AI providers
* Further mobile and performance optimization
* Expanded automated test coverage

---

## Project Background

Alymera was created as the capstone project for the **FlyRank AI Frontend AI Engineer** internship.

The project combines frontend development, full-stack application architecture, database integration, authentication, AI integration, streaming interfaces, tool calling, and production deployment into one application.

---

## Author

**Alyssa Jade P. Merjilla**

Frontend & AI Developer

* Portfolio: `https://ajpm-portfolio.vercel.app/`
* GitHub: `https://github.com/alijilla`
* LinkedIn: `https://linkedin.com/in/alyssa-jade-merjilla`

---

## License

This project was created as a personal capstone project.
