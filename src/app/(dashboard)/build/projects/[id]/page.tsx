import ProjectWorkSpace from "./project-workspace"

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    conversationId?: string
    tab?: string
  }>
}) {
  const { id } = await params
  const query = await searchParams

  return (
    <ProjectWorkSpace
      id={id}
      conversationId={query.conversationId ?? null}
      requestedTab={query.tab ?? null}
    />
  )
}