# Alymera — Build. Apply. Become.

**FlyRank AI Frontend AI Engineer Capstone**

Alymera is an AI-powered workspace for developers and graduating students who manage both **software projects** and **job applications**.

Instead of switching between separate tools for project planning, task management, resume preparation, interview preparation, and job tracking, Alymera brings these workflows together in one workspace.

## Live Application

**Production:** https://alymera.vercel.app

**Repository:** https://github.com/alijilla/alymera

---

## 1. What Alymera Does

Alymera combines project development and career workflows while providing three separate AI experiences for different tasks.

### Build Mode

Build Mode is the software project workspace.

- Create and manage software projects
- Organize projects and tasks
- Manage milestones
- Track project progress
- Use a Kanban workflow
- Drag and drop tasks between statuses
- Estimate task effort
- Use the **Coding AI** for project and coding assistance

### Career Mode

Career Mode is the job-search workspace.

- Create and manage job applications
- Track application status
- Store resume information
- Compare a resume against a job description
- Get AI-assisted resume and job-description analysis
- Identify matched and missing skills
- Review strengths and improvement areas
- Get career guidance
- Prepare for interviews
- Organize applications in one workspace

### Alymera AI

The main **Alymera AI** is a separate general-purpose assistant for the Alymera workspace.

It provides an AI chat experience with application context and supported tools, allowing the user to interact with Alymera through natural language.

---

## 2. AI Architecture

Alymera has **three AI experiences**:

### Coding AI

The Coding AI is available within the Build/project workspace.

It uses the AI SDK chat interface and can work with relevant project context and supported tools. It is designed to help with software-development-related tasks and project workflows.

### Career AI

The Career AI is available within Career Mode.

It supports career-related workflows such as resume and job-description analysis, application context, career assistance, and interview preparation.

### Main Alymera AI

The main Alymera AI is available through the dedicated Alymera AI page.

It provides a broader workspace assistant experience and can use supported application tools.

### Shared AI infrastructure

The three AI experiences use the same general server-side AI infrastructure rather than maintaining three completely separate AI backends.

```text
                         ALYMERA
                            │
                     Next.js App Router
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
      BUILD MODE        CAREER MODE       ALYMERA AI
          │                 │                 │
          ▼                 ▼                 ▼
      Coding AI          Career AI       Main AI Assistant
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
                    Vercel AI SDK
                   Chat / Streaming
                            │
                            ▼
                     /api/alymera
                            │
                  ┌─────────┴─────────┐
                  │                   │
                  ▼                   ▼
               Prompts              Tools
            lib/ai/prompts.ts   lib/ai/tools.ts
                  │                   │
                  └─────────┬─────────┘
                            ▼
                           Groq
                            │
                            ▼
                     Supabase / Auth
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
       Projects           Tasks          Career Data
       Milestones       Activity       Resume / Jobs
```

The application routes and feature components are separated by domain. Build, Career, and Alymera AI each have their own UI entry points and assistant components, while the central AI API route provides shared server-side AI infrastructure.

---

## 3. AI Features

### Prompt-Based AI

Alymera uses prompts to guide the behavior of its AI experiences and provide relevant context.

For example, the Coding AI can receive active project context so that assistance is focused on the current project. The application also verifies relevant database state before making claims about project information.

### Tool Calling

The AI experiences can call supported application tools instead of only returning plain text.

Tools can interact with relevant Alymera data such as projects, tasks, milestones, applications, and resume information.

### Human-in-the-Loop Approval

Data-changing AI actions use an approval step before mutations are executed.

This gives the user an opportunity to review an AI-requested change before it affects application data.

### Streaming

Alymera uses the **Vercel AI SDK** with **Groq** to stream AI responses progressively.

Instead of waiting for one large response, users can see the assistant response as it is generated.

### Career AI & Interview Support

Career Mode includes AI-assisted resume/job-description analysis, career assistance, application-related context, and interview preparation functionality.

---

## 4. Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Motion
- React Hook Form
- Zod

### AI

- Vercel AI SDK
- Groq
- `openai/gpt-oss-120b`
- Prompt-based AI behavior
- Streaming responses
- Tool calling
- Human-in-the-loop approval for mutations

### Backend & Data

- Supabase
- PostgreSQL
- Supabase Auth
- Next.js Route Handlers

### Project & UI

- dnd-kit
- React Three Fiber
- Three.js
- Streamdown
- Jest
- React Testing Library
- Vercel

---

## 5. Application Architecture

Alymera uses the **Next.js App Router** with a feature-oriented component structure.

```text
src/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── build/
│   │   │   └── projects/[id]/
│   │   ├── career/
│   │   │   ├── overview/
│   │   │   ├── applications/
│   │   │   ├── resume/
│   │   │   └── assistant/
│   │   ├── aly/
│   │   ├── history/
│   │   ├── profile/
│   │   └── settings/
│   │
│   └── api/
│       └── alymera/
│           └── route.ts
│
├── components/
│   ├── aly/
│   │   └── alymera-assistant.tsx
│   │
│   ├── build/
│   │   ├── coding-assistant.tsx
│   │   ├── kanban.tsx
│   │   ├── overview.tsx
│   │   └── roadmap.tsx
│   │
│   ├── career/
│   │   ├── assistant.tsx
│   │   └── StatsCard.tsx
│   │
│   ├── hero/
│   │   ├── Mascot.tsx
│   │   ├── TestScene.tsx
│   │   ├── Workspace.tsx
│   │   └── Backgroundshader.tsx
│   │
│   ├── history/
│   ├── layout/
│   └── ui/
│
├── data/
│   ├── activity.ts
│   ├── milestonedata.ts
│   ├── profiledata.ts
│   ├── projectdata.ts
│   └── taskdata.ts
│
├── lib/
│   ├── ai/
│   │   ├── prompts.ts
│   │   ├── schemas.ts
│   │   └── tools.ts
│   │
│   ├── schemas/
│   ├── progress.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
│
├── hooks/
└── proxy.ts
```

The repository separates application routes from feature components and shared UI. Build and Career contain domain-specific functionality, while the AI implementation is organized under `src/lib/ai`.

The central `/api/alymera` route imports the Groq provider and the Supabase server client. AI-specific prompts and tools are kept in dedicated modules. The frontend AI assistants use the AI SDK chat interface and communicate with this server-side AI infrastructure.

---

## 6. AI Request Flow

A typical AI interaction follows this flow:

```text
User
  │
  ▼
Coding AI / Career AI / Alymera AI
  │
  ▼
AI SDK Chat Client
  │
  ▼
/api/alymera
  │
  ├── Authentication / user context
  │
  ├── Prompt/context handling
  │
  ├── Groq model
  │
  └── Tool calls
          │
          ▼
      Supabase data
          │
          ▼
    Approval when mutation
          │
          ▼
      Stream response
          │
          ▼
          User
```

This flow allows the assistants to use application data while keeping provider credentials and server-side operations behind the API route.

---

## 7. AI Route Protection

The production AI endpoint includes protections against trivial abuse and unnecessarily large requests.

### Request size cap

Requests larger than **100 KB** are rejected.

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

Authenticated AI functionality is associated with the current user, and project/application operations are scoped to the appropriate user and active application context.

Secrets such as AI provider keys are stored as environment variables and are not exposed to the client.

---

## 8. Getting Started

### Prerequisites

- Node.js
- npm
- A Supabase project
- A Groq API key

### 1. Clone the repository

```bash
git clone https://github.com/alijilla/alymera.git
cd alymera
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

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

Open the local URL shown in the terminal.

### 5. Create a production build

```bash
npm run build
```

### 6. Start the production server locally

```bash
npm run start
```

---

## 9. Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase client/server authentication |
| `GROQ_API_KEY` | Yes | Access to the Groq AI provider |

Keep secret credentials in environment variables rather than hard-coding them into source code.

---

## 10. Testing

Alymera includes automated tests using **Jest** and **React Testing Library**.

The test suite covers areas including:

- Component rendering
- Empty application states
- Project workspace context
- AI assistant demo behavior
- Sidebar layout/navigation behavior

Latest test evidence:

```text
Test Suites: 5 passed, 5 total
Tests:       6 passed, 6 total

All files
Statements: 52.48%
Branches:   30.11%
Functions:  33.87%
Lines:      53.61%
```

Run the test suite with:

```bash
npx jest --coverage
```

Run a production build with:

```bash
npm run build
```

---

## 11. Accessibility & Performance

Accessibility testing was performed across the application's pages using WAVE-based checks. Pages were reviewed for WCAG-related issues and known accessibility issues were addressed during development.

Performance was evaluated with Lighthouse on the production deployment.

Representative mobile results include:

| Page | Mobile Performance |
| --- | ---: |
| Landing | ~76 |
| Dashboard | 87 |
| Build | 74–82 across repeated runs |
| Career routes | 66–78 |
| Project Workspace | 69 |

Performance varies between Lighthouse runs and devices. The project prioritized functional production readiness, accessibility, and targeted performance improvements rather than removing core product features solely to improve an audit score.

One concrete optimization was reducing the client-side cost of the landing-page 3D experience by using lazy loading and lighter 3D geometry. Additional Streamdown bundle cleanup also reduced unused client-side code.

---

## 12. 3D Experience

The landing page includes an interactive 3D experience built with React Three Fiber and Three.js.

The experience includes:

- Custom Alymera mascot
- Floating workspace interface
- Pointer-based interaction
- Hover interactions
- Lazy loading
- Reduced-motion consideration
- Lightweight 3D geometry
- Capped device pixel ratio

The 3D experience is an enhancement to the landing page and is not required for the core application workflows.

The main Alymera AI experience also uses the 3D mascot as part of its interface.

---

## 13. Deployment & Operation

Alymera is deployed to **Vercel** as the production capstone application.

### Deployment checklist

- Production deployment available
- Environment variables configured outside source control
- Production AI route protected with request-size and duration limits
- AI retries disabled
- Authentication and user data scoping implemented
- Production build verified with `npm run build`
- Automated tests passing
- Accessibility checks completed
- Lighthouse performance checks completed
- Production URL manually tested

### Safe failure behavior

AI requests are handled through the application route with error handling so provider failures do not expose provider credentials to the client. Supported mutation actions also use approval steps before changes are made.

### Rollback plan

The deployment is connected to the Git repository through Vercel. If a production deployment introduces a regression, the previous working Vercel deployment can be restored, or the problematic commit can be reverted and the main branch redeployed.

---

## 14. Design Decisions

### Why Supabase?

Supabase provides PostgreSQL, authentication, and database access in one service, simplifying the application's full-stack architecture.

### Why Groq?

Groq was selected as the current AI provider because of its fast inference experience and compatibility with the AI SDK architecture. The provider integration is kept replaceable so another supported provider can be introduced later if needed.

### Why streaming?

Streaming makes AI interactions feel more responsive because users can see the answer being generated progressively.

### Why tool calling?

Tool calling allows the AI experiences to interact with application data and perform supported operations instead of only returning plain text.

### Why human approval?

Actions that modify project or career data require approval before execution. This reduces the risk of an AI assistant making unintended changes.

### Why three AI experiences?

The three assistants have different responsibilities:

- **Coding AI** focuses on software development and project workflows.
- **Career AI** focuses on job applications, career assistance, and interview preparation.
- **Main Alymera AI** provides a broader workspace assistant experience.

Separating the experiences keeps their user interfaces and purposes clear while allowing them to share common AI infrastructure.

---

## 15. How AI Tools Were Used to Build Alymera

AI tools were used throughout development as a **coding assistant, debugging partner, and tutor**.

They helped with activities such as:

- Exploring implementation approaches
- Debugging errors
- Understanding unfamiliar APIs and concepts
- Explaining code and development patterns
- Generating initial code ideas when useful
- Refactoring and cleanup
- Writing and improving tests
- Reviewing implementation details
- Improving documentation

I remained responsible for writing, integrating, testing, debugging, and understanding the application's code, as well as making the final engineering decisions.

AI-generated suggestions were reviewed, tested, and adapted to the actual requirements of Alymera.

---

## 16. Known Limitations

- AI functionality depends on the availability and usage limits of the configured AI provider.
- AI responses may vary depending on the model and prompt context.
- Performance can vary depending on device and network conditions.
- The 3D experiences add additional client-side work.
- Some advanced performance optimizations remain possible in future iterations.
- Automated test coverage currently focuses on selected application areas rather than every component.

---

## 17. Future Improvements

Potential future improvements include:

- More advanced AI project planning
- GitHub integration
- Deeper career analytics
- More automation around job applications
- Additional AI providers
- Further mobile and performance optimization
- Expanded automated test coverage
- More advanced interview practice workflows

---

## 18. Reflection

Alymera was built as a learning-focused capstone that combined frontend development, full-stack architecture, database integration, authentication, AI integration, streaming interfaces, tool calling, testing, accessibility, and production deployment.

One of the hardest parts was making the AI experiences reliable when working with real application data. It was not enough for the model to produce a convincing answer; the application also needed relevant context, scoped operations, approval steps for mutations, and verification of application state.

Another important learning was that production work extends beyond making features function. Testing, accessibility, performance auditing, error handling, documentation, deployment, and rollback planning all became part of the development process.

If I built the project again, I would establish the architecture and testing strategy earlier and keep performance considerations in mind while adding features instead of evaluating them mostly near the end.

---

## Project Background

Alymera was created as the capstone project for the **FlyRank AI Frontend AI Engineer** internship.

The project brings together frontend development, full-stack application architecture, database integration, authentication, AI integration, streaming interfaces, tool calling, testing, and production deployment into one application.

---

## Author

**Alyssa Jade P. Merjilla**

Frontend & AI Developer

- Portfolio: https://ajpm-portfolio.vercel.app/
- GitHub: https://github.com/alijilla
- LinkedIn: https://linkedin.com/in/alyssa-jade-merjilla

---

## License

This project was created as a personal capstone project.
