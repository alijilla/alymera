**Flyrank AI Frontend AI Engineer Capstone · 🚧 In Development**

ALYMERA is an AI-powered workspace designed for developers and graduating students who manage both **software projects and job applications**.

Instead of using separate tools for managing coding projects and tracking a job applications, ALYMERA brings both workflows together.

### 💻 Build Mode

AI-assisted project management:

- Turn an application idea into development tasks
- Manage tasks through a Kanban board
- Drag and drop tasks
- Estimate development work
- Get AI coding/project assistance
- Interact with a streaming AI assistant

### 🎯 Career Mode

AI-assisted job description insight:

- Track job applications
- Organize applications 
- Compare jobs against a resume
- Generate resume–job alignment scores
- Identify missing or relevant skills
- Tailor resume content
- Generate customized cover letters (I'm still thinking about this)

### 🛠️ Technologies

`Next.js` `React` `TypeScript` `Tailwind CSS` `shadcn/ui`

`Supabase` `PostgreSQL` `Vercel AI SDK` `Groq`

`dnd-kit` `Git` `GitHub` `Vercel`

**Status:** 🚧 Actively building


## 🤝 Contact
Alyssa Jade P. Merjilla  
- LinkedIn: [linkedin.com/in/alyssa-jade-merjilla](https://linkedin.com/in/alyssa-jade-merjilla)
- GitHub: [@alijilla](https://github.com/alijilla)


## FE-AA2 — Interactive 3D Experience

### What I Built

ALYMERA's landing page features an interactive 3D workspace built with React Three Fiber.

The scene includes:
- A custom ALYMERA mascot
- A floating workspace interface
- Project, progress, and career preview information
- Pointer-based mascot rotation
- Hover interaction with smooth visual changes

The 3D experience is integrated directly into the ALYMERA landing page rather than being a separate demo.

### Interaction

The ALYMERA mascot responds to pointer movement by smoothly rotating toward the cursor.

Hovering over the mascot triggers a smooth color and scale transition.

### Performance

The 3D hero is lazy-loaded using Next.js `next/dynamic` with server-side rendering disabled.

The React Three Fiber canvas uses a capped device pixel ratio to help reduce rendering cost.

The current scene uses lightweight Three.js geometry rather than a large external 3D model.

Lighthouse testing produced the following results:

| Audit | Mobile | Desktop |
|---|---:|---:|
| Performance | **75** | **98** |

The current mobile performance score reflects the cost of rendering the interactive 3D experience under a constrained mobile profile. Further optimization will be addressed during the final FE-10 accessibility and performance audit.

### Accessibility / Reduced Motion

The 3D experience detects the user's `prefers-reduced-motion` preference.

When reduced motion is enabled:
- 3D movement is reduced/stopped
- The scene remains visible
- Non-motion visual feedback can still be provided

### Mobile

The landing page is designed to remain usable across mobile and desktop screen sizes.

The 3D canvas is lazy-loaded to avoid loading the WebGL experience before it is needed.

### What I'd Add With More Time

I would add more detailed 3D assets, additional interactions, and further mobile performance optimization based on real-device testing.

### FE-AA2 Requirement Status

- [x] Real 3D scene rendered in the browser
- [x] React Three Fiber
- [x] Meaningful interaction beyond orbiting
- [x] Lazy-loaded 3D canvas
- [x] Lightweight 3D geometry
- [x] Mobile-friendly layout
- [x] Performance checked with Lighthouse
- [x] Reduced-motion handling
- [ ] Further mobile performance optimization
Further mobile performance optimization will be addressed during the final FE-10 audit.