import { notFound } from 'next/navigation';
import { FlowEditorClient } from '@/components/flow/flow-editor-client';
import { getFlowSpec as getFlowSpecById } from '@fluxion/local-store';
import { mockFlows } from '@/lib/mock-data';
import { InitializeFlowButton } from '@/components/flow/initialize-flow-button';

interface FlowPageProps {
  params: { flowId: string };
}

export default async function FlowPage({ params }: FlowPageProps) {
  const { flowId } = params;
  const storedFlow = await getFlowSpecById(flowId);

  if (!storedFlow) {
    const template = mockFlows.find(f => f.id === flowId);
    if (!template) {
      notFound();
    }

    return (
      <div className="flex min-h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
        <h2 className="text-2xl font-semibold font-headline">Flow not initialized</h2>
        <p className="text-muted-foreground max-w-lg">
          The &ldquo;{flowId}&rdquo; template exists but has not been copied into your local workspace yet.
          Initialize it to start editing locally.
        </p>
        <InitializeFlowButton flowId={flowId} />
      </div>
    );
  }

  return <FlowEditorClient flow={storedFlow} />;
}
