import type { FlowSpec } from "./types";

export const mockFlows: FlowSpec[] = [
  {
    id: "support-triage",
    version: "0.1.0",
    meta: {
      entry: "generateSupportEmailDraft"
    },
    policy: "default",
    nodes: [
      {
        kind: "LLMCall",
        name: "classify",
        inputs: [{ name: "input", schema: {"type":"object","properties":{"subject":{"type":"string"},"body":{"type":"string"}},"required":["subject","body"]}}],
        outputs: [{ name: "output", schema: {"type":"object","properties":{"label":{"type":"string"}},"required":["label"]}}],
        config: { provider: "google", model: "gemini-2.5-flash" }
      },
      {
        kind: "LLMCall",
        name: "rag",
        inputs: [{ name: "input", schema: {"type":"object","properties":{"label":{"type":"string"}},"required":["label"]}}],
        outputs: [{ name: "output", schema: {"type":"object","properties":{"context":{"type":"string"}},"required":["context"]}}],
        config: { provider: "google", model: "gemini-2.5-flash" }
      },
      {
        kind: "LLMCall",
        name: "fix-plan",
        inputs: [{ name: "input", schema: {"type":"object","properties":{"context":{"type":"string"}},"required":["context"]}}],
        outputs: [{ name: "output", schema: {"type":"object","properties":{"plan":{"type":"string"}},"required":["plan"]}}],
        config: { provider: "google", model: "gemini-2.5-flash" }
      },
      {
        kind: "HumanApprove",
        name: "approve",
        inputs: [{ name: "input", schema: {"type":"object","properties":{"plan":{"type":"string"}},"required":["plan"]}}],
        outputs: [{ name: "output", schema: {"type":"object","properties":{"approved":{"type":"boolean"}},"required":["approved"]}}],
        config: { queue: "support-leads" }
      },
      {
        kind: "HTTP",
        name: "create-issue",
        inputs: [{ name: "input", schema: {"type":"object","properties":{"plan":{"type":"string"}},"required":["plan"]}}],
        outputs: [{ name: "output", schema: {"type":"object"}}],
        config: { url: "https://api.github.com/repos/:org/:repo/issues" }
      }
    ],
    edges: [
      { from: "classify", out: "output", to: "rag", in: "input" },
      { from: "rag", out: "output", to: "fix-plan", in: "input" },
      { from: "fix-plan", out: "output", to: "approve", in: "input" },
      { from: "approve", out: "output", to: "create-issue", in: "input" }
    ]
  },
  {
    id: "code-summarize",
    version: "0.1.0",
    policy: "default",
    nodes: [
      {
        kind: "HTTP",
        name: "repo-ingest",
        inputs: [],
        outputs: [{name: "output", schema: {}}],
        config: { url: "https://api.github.com/repos/:org/:repo/contents" }
      },
      {
        kind: "LLMCall",
        name: "summarize",
        inputs: [{name: "input", schema: {}}],
        outputs: [{name: "output", schema: {}}],
        config: { provider: "google", model: "gemini-2.5-flash" }
      },
      {
        kind: "LLMCall",
        name: "risk-highlights",
        inputs: [{name: "input", schema: {}}],
        outputs: [{name: "output", schema: {}}],
        config: { provider: "google", model: "gemini-2.5-flash" }
      },
      {
        kind: "HumanApprove",
        name: "approve",
        inputs: [{name: "input", schema: {}}],
        outputs: [{name: "output", schema: {}}],
        config: { queue: "dev-leads" }
      },
      {
        kind: "HTTP",
        name: "open-pr",
        inputs: [{name: "input", schema: {}}],
        outputs: [{name: "output", schema: {}}],
        config: { url: "https://api.github.com/repos/:org/:repo/pulls" }
      }
    ],
    edges: [
      { from: "repo-ingest", out: "output", to: "summarize", in: "input" },
      { from: "summarize", out: "output", to: "risk-highlights", in: "input" },
      { from: "risk-highlights", out: "output", to: "approve", in: "input" },
      { from: "approve", out: "output", to: "open-pr", in: "input" }
    ]
  },
  {
    id: "web-to-csv",
    version: "0.1.0",
    policy: "default",
    nodes: [
      {
        kind: "HTTP",
        name: "crawl",
        inputs: [],
        outputs: [{name: "output", schema: {}}],
        config: { url: "https://example.com/data" }
      },
      {
        kind: "Parse",
        name: "extract-tables",
        inputs: [{name: "input", schema: {}}],
        outputs: [{name: "output", schema: {}}],
        config: { type: "html" }
      },
      {
        kind: "LLMCall",
        name: "normalize",
        inputs: [{name: "input", schema: {}}],
        outputs: [{name: "output", schema: {}}],
        config: { provider: "google", model: "gemini-2.5-flash" }
      },
       {
        kind: "LLMCall",
        name: "validate-schema",
        inputs: [{name: "input", schema: {}}],
        outputs: [{name: "output", schema: {}}],
        config: { provider: "google", model: "gemini-2.5-flash" }
      },
      {
        kind: "Storage",
        name: "push-to-warehouse",
        inputs: [{name: "input", schema: {}}],
        outputs: [{name: "output", schema: {}}],
        config: { path: "gs://my-bucket/data/output.csv" }
      }
    ],
    edges: [
      { from: "crawl", out: "output", to: "extract-tables", in: "input" },
      { from: "extract-tables", out: "output", to: "normalize", in: "input" },
      { from: "normalize", out: "output", to: "validate-schema", in: "input" },
      { from: "validate-schema", out: "output", to: "push-to-warehouse", in: "input" }
    ]
  }
];
