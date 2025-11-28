export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export interface PortSchema {
  name: string;
  schema: Json;
}

export interface NodeSpec {
  kind: string;
  name: string;
  inputs: PortSchema[];
  outputs: PortSchema[];
  config: Json;
}

export interface FlowSpec {
  id: string;
  version: string;
  policy?: string;
  meta?: { entry?: string };
  nodes: Array<NodeSpec>;
  edges: Array<{ from: string; out: string; to: string; in: string }>;
  createdAt?: number;
}

export interface RunEvent {
  kind: string;
  node: string;
  ts: number;
  data?: Json;
  ms?: number;
  error?: string;
}

export interface RunRecord {
  id: string;
  status: string;
  createdAt: number;
  specVersion: string;
  inputSummary?: string;
  outputSummary?: string;
  durationMs?: number;
  error?: string;
  events?: RunEvent[];
}
