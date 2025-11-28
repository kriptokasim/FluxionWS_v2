
"use client";

import { useState, useTransition, useMemo } from "react";
import type { FlowSpec, NodeSpec } from "@fluxion/types";
import { NodePalette } from "./node-palette";
import { FlowCanvas } from "./flow-canvas";
import { RightPanel } from "./right-panel";
import { Button } from "@/components/ui/button";
import { Loader2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveFlowSpecAction } from "@/lib/actions";
import { HumanApprovalModal } from "./human-approval-modal";
import semver from 'semver';

const runtimeUrl = process.env.NEXT_PUBLIC_RUNTIME_URL || 'http://localhost:4000';

const defaultNodeConfig: { [key: string]: Partial<NodeSpec> } = {
  LLMCall: { inputs: [{ name: "input", schema: {}}], outputs: [{ name: "output", schema: {}}], config: { provider: "google", model: "gemini-2.5-flash" } },
  HTTP: { inputs: [{ name: "input", schema: {}}], outputs: [{ name: "output", schema: {}}], config: { url: "https://example.com" } },
  Parse: { inputs: [{ name: "input", schema: {}}], outputs: [{ name: "output", schema: {}}], config: { type: "json" } },
  Decision: { inputs: [{ name: "input", schema: {}}], outputs: [{ name: "output", schema: {}}], config: {} },
  HumanApprove: { inputs: [{ name: "input", schema: {}}], outputs: [{ name: "output", schema: {}}], config: { queue: "default" } },
  Storage: { inputs: [{ name: "input", schema: {}}], outputs: [{ name: "output", schema: {}}], config: { path: "output.txt" } },
  Input: { inputs: [], outputs: [{ name: "output", schema: {}}], config: {} },
};

type RunPayload = {
  flowId: string;
  version?: string;
  input: any;
};

async function invokeRuntime(payload: RunPayload) {
  const response = await fetch(`${runtimeUrl}/v1/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error('Runtime returned an invalid response.');
  }

  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || `Runtime error (status ${response.status})`);
  }

  return data;
}


export function FlowEditorClient({ flow: initialFlow }: { flow: FlowSpec }) {
  const [flow, setFlow] = useState<FlowSpec>(initialFlow);
  const [selectedNodeName, setSelectedNodeName] = useState<string | null>(null);
  const [isExecuting, startTransition] = useTransition();
  const { toast } = useToast();
  
  const [approvalState, setApprovalState] = useState<{ draft: string; runId: string, flowId: string } | null>(null);

  const selectedNode = useMemo(() => {
    return flow.nodes.find(n => n.name === selectedNodeName) || null;
  }, [flow.nodes, selectedNodeName]);

  const handleNodeOrderChange = (nodeName: string, direction: 'up' | 'down') => {
    const { nodes, edges } = flow;
    const index = nodes.findIndex(n => n.name === nodeName);

    if ((direction === 'up' && index === 0) || (direction === 'down' && index === nodes.length - 1)) {
        return; // Cannot move further
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newNodes = [...nodes];
    const [movedNode] = newNodes.splice(index, 1);
    newNodes.splice(newIndex, 0, movedNode);
    
    // Naive edge rewiring based on new linear order.
    // This is a simplification for the MVP and might need to be more robust for complex graphs.
    const newEdges = [];
    for (let i = 0; i < newNodes.length - 1; i++) {
        const fromNode = newNodes[i];
        const toNode = newNodes[i + 1];
        if (fromNode.outputs.length > 0 && toNode.inputs.length > 0) {
            newEdges.push({
                from: fromNode.name,
                out: fromNode.outputs[0].name,
                to: toNode.name,
                in: toNode.inputs[0].name,
            });
        }
    }

    setFlow({ ...flow, nodes: newNodes, edges: newEdges });
  };

  const handleNodeSelect = (nodeName: string | null) => {
    setSelectedNodeName(nodeName);
  };
  
  const handleFlowChange = (newFlow: FlowSpec) => {
    setFlow(newFlow);
  };

  const handleNodeDelete = (nodeNameToDelete: string) => {
    const newFlow = {
      ...flow,
      nodes: flow.nodes.filter(n => n.name !== nodeNameToDelete),
      edges: flow.edges.filter(e => e.from !== nodeNameToDelete && e.to !== nodeNameToDelete)
    };
    setFlow(newFlow);
    if (selectedNodeName === nodeNameToDelete) {
      setSelectedNodeName(null);
    }
    toast({
      title: "Node Deleted",
      description: `Node "${nodeNameToDelete}" has been removed.`,
    });
  };

  const handleNodeConfigSave = async (nodeName: string, newConfig: any) => {
    const nextVersion = semver.inc(flow.version, 'patch');
    if (!nextVersion) {
      toast({ variant: "destructive", title: "Save Failed", description: "Invalid version for increment" });
      return;
    }
    const newFlow = {
      ...flow,
      version: nextVersion,
      nodes: flow.nodes.map(n => n.name === nodeName ? { ...n, config: newConfig } : n)
    };
    
    try {
      const result = await saveFlowSpecAction(newFlow);
      if (result.ok) {
        setFlow(newFlow);
        toast({ title: "Flow Saved", description: `Version ${nextVersion} has been saved.` });
      } else {
         throw new Error('Failed to save flow spec.');
      }
    } catch (error: any) {
       toast({ variant: "destructive", title: "Save Failed", description: error.message });
    }
  };

  const handleRunFlow = (input: any) => {
    startTransition(async () => {
      try {
        const result = await invokeRuntime({
          flowId: flow.id,
          version: flow.version,
          input,
        });

        if (result.out?.status === 'pending_approval') {
          setApprovalState({
            draft: result.out.text,
            runId: result.out.runId,
            flowId: result.out.flowId,
          });
        } else {
          toast({
            title: "Flow Executed Successfully",
            description: (
              <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                <code className="text-white">{JSON.stringify(result.out, null, 2)}</code>
              </pre>
            ),
          });
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Flow Execution Failed",
          description: error.message || 'Runtime error',
        });
      }
    });
  };

  const handleApprove = (approvedText: string) => {
    if (!approvalState) return;

    const stateToContinue = { ...approvalState };
    setApprovalState(null);
    
    startTransition(async () => {
      try {
        const result = await invokeRuntime({
          flowId: stateToContinue.flowId,
          input: { approvedText, runId: stateToContinue.runId },
        });

        toast({
          title: "Flow Approved & Completed",
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">{JSON.stringify(result.out, null, 2)}</code>
            </pre>
          ),
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Approval Failed",
          description: error.message || 'Runtime error',
        });
      }
    });
  };

  const handleReject = () => {
    if (approvalState) {
        // Here you might want to update the run status to 'rejected' in Firestore
    }
    setApprovalState(null);
    toast({
      variant: 'default',
      title: 'Flow Rejected',
      description: 'The flow was stopped and no further action was taken.'
    });
  }

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const kind = event.dataTransfer.getData('application/reactflow');
    if (!kind) return;

    const newNodeName = `${kind.toLowerCase()}-${flow.nodes.length + 1}`;
    const newNode: NodeSpec = {
      kind,
      name: newNodeName,
      ...defaultNodeConfig[kind],
      inputs: defaultNodeConfig[kind]?.inputs || [],
      outputs: defaultNodeConfig[kind]?.outputs || [],
      config: defaultNodeConfig[kind]?.config || {},
    };

    const newFlow = { ...flow, nodes: [...flow.nodes, newNode] };
    
    // Auto-connect if there's a previous node
    if (flow.nodes.length > 0) {
      const lastNode = flow.nodes[flow.nodes.length - 1];
      if(lastNode.outputs.length > 0 && newNode.inputs.length > 0) {
        const newEdge = {
          from: lastNode.name,
          out: lastNode.outputs[0].name,
          to: newNode.name,
          in: newNode.inputs[0].name,
        };
        newFlow.edges = [...flow.edges, newEdge];
      }
    }
    setFlow(newFlow);
    setSelectedNodeName(newNode.name);
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_400px] h-full overflow-hidden">
      <aside className="hidden md:flex flex-col border-r bg-card p-4">
        <NodePalette />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden" onDragOver={onDragOver} onDrop={onDrop}>
        <div className="flex items-center justify-between border-b p-4">
          <h1 className="text-xl font-bold font-headline">{flow.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
          <Button onClick={() => document.getElementById('run-flow-button')?.click()} disabled={isExecuting}>
            {isExecuting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Run Flow
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-background">
          <FlowCanvas 
            flow={flow} 
            selectedNodeName={selectedNodeName} 
            onNodeSelect={handleNodeSelect} 
            onNodeDelete={handleNodeDelete}
            onNodeOrderChange={handleNodeOrderChange}
          />
        </div>
      </main>

      <aside className="hidden lg:flex flex-col border-l bg-card">
        <RightPanel 
          key={selectedNodeName}
          flow={flow} 
          selectedNode={selectedNode} 
          onRunFlow={handleRunFlow}
          isPending={isExecuting} 
          onFlowChange={handleFlowChange}
          onNodeConfigSave={handleNodeConfigSave}
        />
      </aside>

      {approvalState && (
        <HumanApprovalModal
          isOpen={!!approvalState}
          onOpenChange={(open) => {
            if (!open) {
                handleReject();
            }
          }}
          draftText={approvalState.draft}
          onApprove={handleApprove}
          onReject={handleReject}
          isPending={isExecuting}
        />
      )}
    </div>
  );
}
