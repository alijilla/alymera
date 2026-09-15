
import { CareerAssistant } from "@/components/career/assistant";

export default async function CareerAssistantPage({
  searchParams,
}: {
  searchParams: Promise<{
    conversationId?: string
  }>
}) {
  const params = await searchParams
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      <CareerAssistant   conversationId={params.conversationId} />
    </div>
  );
}
