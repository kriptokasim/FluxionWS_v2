
"use client";

import { useState, useEffect, useCallback } from "react";
import type { FlowSpec, NodeSpec, RunRecord } from "@fluxion/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { JsonViewer } from "./json-viewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getNodeIcon } from "../icons";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveFlowSpecAction } from "@/lib/actions";
import semver from 'semver';

interface RightPanelProps {
  flow: FlowSpec;
  selectedNode: NodeSpec | null;
  onRunFlow: (input: any) => void;
  isPending: boolean;
  onFlowChange: (newFlow: FlowSpec) => void;
  onNodeConfigSave: (nodeName: string, newConfig: any) => void;
}

export function RightPanel({ flow, selectedNode, onRunFlow, isPending, onFlowChange, onNodeConfigSave }: RightPanelProps) {
  if (selectedNode) {
    return <NodeConfigPanel node={selectedNode} onSave={onNodeConfigSave} />;
  }
  return <FlowTabsPanel flow={flow} onRunFlow={onRunFlow} isPending={isPending} onFlowChange={onFlowChange} />;
}

function NodeConfigPanel({ node, onSave }: { node: NodeSpec; onSave: (nodeName: string, newConfig: any) => void; }) {
  const Icon = getNodeIcon(node.kind);
  const [configStr, setConfigStr] = useState(JSON.stringify(node.config, null, 2));
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setConfigStr(JSON.stringify(node.config, null, 2));
  }, [node]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newConfig = JSON.parse(configStr);
      await onSave(node.name, newConfig);
    } catch (e) {
      toast({ variant: "destructive", title: "Invalid JSON", description: "Could not save, the configuration is not valid JSON." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 pb-4 border-b shrink-0">
        <div className="flex items-center gap-2 mb-1">
           <Icon className="h-5 w-5 text-primary" />
           <h3 className="text-lg font-semibold font-headline">{node.name}</h3>
        </div>
        <Badge variant="secondary">{node.kind}</Badge>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={["config", "inputs", "outputs"]} className="w-full">
            <AccordionItem value="config">
              <AccordionTrigger>Configuration</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                    <Textarea 
                        value={configStr}
                        onChange={(e) => setConfigStr(e.target.value)}
                        className="font-mono h-48"
                        placeholder="Enter JSON config..."
                    />
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Config
                    </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="inputs">
              <AccordionTrigger>Inputs</AccordionTrigger>
              <AccordionContent>
                {node.inputs.map(input => (
                  <div key={input.name} className="mb-2">
                    <p className="font-mono text-xs font-medium">{input.name}</p>
                    <JsonViewer data={input.schema} />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="outputs">
              <AccordionTrigger>Outputs</AccordionTrigger>
              <AccordionContent>
                {node.outputs.map(output => (
                   <div key={output.name} className="mb-2">
                    <p className="font-mono text-xs font-medium">{output.name}</p>
                    <JsonViewer data={output.schema} />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}

function FlowTabsPanel({ flow, onRunFlow, isPending, onFlowChange }: { flow: FlowSpec, onRunFlow: (input: any) => void, isPending: boolean, onFlowChange: (newFlow: FlowSpec) => void}) {
  return (
    <Tabs defaultValue="test" className="h-full flex flex-col">
      <TabsList className="mx-4 mt-4 shrink-0">
        <TabsTrigger value="test">Test</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>
      <TabsContent value="test" className="flex-1 flex flex-col m-0 overflow-hidden">
        <FlowTestPanel flow={flow} onRunFlow={onRunFlow} isPending={isPending} />
      </TabsContent>
      <TabsContent value="history" className="flex-1 m-0 overflow-hidden">
        <RunHistoryPanel flow={flow} />
      </TabsContent>
       <TabsContent value="details" className="flex-1 flex flex-col m-0 overflow-hidden">
        <FlowDetailsPanel flow={flow} onFlowChange={onFlowChange} />
      </TabsContent>
    </Tabs>
  );
}

function FlowTestPanel({ flow, onRunFlow, isPending }: { flow: FlowSpec, onRunFlow: (input: any) => void, isPending: boolean }) {
  const defaultInput = '{\n  "subject": "Refund",\n  "body": "I want a refund for my recent order."\n}';
  const [testInput, setTestInput] = useState(defaultInput);

  const handleRunClick = () => {
    try {
      const parsedInput = JSON.parse(testInput);
      onRunFlow(parsedInput);
    } catch (e) {
      alert("Invalid JSON input.");
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
       <div className="pb-4 border-b shrink-0">
         <h3 className="text-lg font-semibold font-headline">Test Runner</h3>
         <p className="text-sm text-muted-foreground">Test the &ldquo;{flow.id}&rdquo; flow.</p>
       </div>
       <ScrollArea className="flex-1 py-4">
        <div className="flex flex-col gap-4 px-1">
          <div>
            <label className="text-sm font-medium mb-2 block">Flow Input (JSON)</label>
            <Textarea 
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="font-mono h-48"
              placeholder="Enter JSON input for the flow..."
            />
          </div>
        </div>
       </ScrollArea>
       <div className="pt-4 border-t shrink-0">
          <Button id="run-flow-button" onClick={handleRunClick} disabled={isPending} className="w-full">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Run Flow
          </Button>
       </div>
    </div>
  );
}


function FlowDetailsPanel({ flow, onFlowChange }: { flow: FlowSpec, onFlowChange: (newFlow: FlowSpec) => void }) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (incrementType: 'major' | 'minor' | 'patch') => {
    setIsSaving(true);
    try {
      const currentVersion = flow.version || '0.0.0';
      const nextVersion = semver.inc(currentVersion, incrementType);
      if (!nextVersion) {
        throw new Error('Invalid version for increment');
      }

      const updatedSpec = { ...flow, version: nextVersion };
      const result = await saveFlowSpecAction(updatedSpec);
      
      if (result.ok) {
        onFlowChange(updatedSpec);
        toast({ title: "Flow Saved", description: `Version ${nextVersion} has been saved.` });
      } else {
        throw new Error('Failed to save flow spec.');
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="p-4 h-full flex flex-col">
       <div className="pb-4 border-b shrink-0">
         <h3 className="text-lg font-semibold font-headline">Flow Details</h3>
         <p className="text-sm text-muted-foreground">ID: {flow.id}</p>
         <p className="text-sm text-muted-foreground">Version: {flow.version}</p>
       </div>
       <ScrollArea className="flex-1 -mx-4">
         <div className="p-4 space-y-4">
            <div>
              <h4 className="font-medium">Save New Version</h4>
              <p className="text-xs text-muted-foreground">
                Save the current state of the flow as a new semantic version.
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <Button onClick={() => handleSave('patch')} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save />}
                  Save as Patch Version (e.g., {semver.inc(flow.version, 'patch')})
                </Button>
                <Button onClick={() => handleSave('minor')} disabled={isSaving} variant="secondary">
                  Save as Minor Version (e.g., {semver.inc(flow.version, 'minor')})
                </Button>
                <Button onClick={() => handleSave('major')} disabled={isSaving} variant="secondary">
                  Save as Major Version (e.g., {semver.inc(flow.version, 'major')})
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-medium">Raw Specification</h4>
              <ScrollArea className="h-64 mt-2">
                <JsonViewer data={flow} />
              </ScrollArea>
            </div>
          </div>
       </ScrollArea>
    </div>
  )
}


function RunHistoryPanel({ flow }: { flow: FlowSpec }) {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/runs/${flow.id}?limit=20`);
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Failed to load runs');
      }
      setRuns(data.runs || []);
    } catch (err: any) {
      setError(err.message || 'Unable to load run history.');
    } finally {
      setIsLoading(false);
    }
  }, [flow.id]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns, flow.version]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h3 className="text-lg font-semibold font-headline">Run History</h3>
          <p className="text-sm text-muted-foreground">Latest executions for &ldquo;{flow.id}&rdquo;</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRuns} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Refresh
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {error && <div className="text-sm text-destructive">{error}</div>}
          {!error && runs.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">No runs recorded yet.</p>
          )}
          {runs.map((run) => (
            <div key={run.id} className="rounded-lg border p-3 text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold capitalize">{run.status}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(run.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-muted-foreground flex gap-3">
                <span>Version: {run.specVersion}</span>
                {run.durationMs && <span>Duration: {run.durationMs}ms</span>}
              </div>
              {run.error && <p className="text-xs text-destructive">Error: {run.error}</p>}
              {run.outputSummary && (
                <p className="text-xs text-muted-foreground truncate">Output: {run.outputSummary}</p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

    
