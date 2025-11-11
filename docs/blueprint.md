# **App Name**: Fluxion Workbench Studio

## Core Features:

- Visual Flow Designer: A React-based UI (in apps/studio) to visually design and edit AI flows with live schema validation.
- Node Palette: Selection of available nodes for flow design: Input, LLMCall, HTTP, Parse, Decision, HumanApprove, Storage.
- LLM Call Node: Node which calls a configured Large Language Model and extracts a specific response using the provided API key. This uses the typescript node SDK to allow a standard format of node.
- Human Approval Node: Includes a human approval tool to incorporate a human 'in-the-loop' with access control so people can give the okay, and potentially edit, a piece of content. This uses the typescript node SDK to allow a standard format of node.
- Flow Execution: Execute designed flows using the minimal runtime service (services/runtime), supporting linear edges and basic node execution.
- Policy Enforcement: Apply security policies using a Rego-like DSL (Guard) to control capabilities like network access and data egress, with a default deny-all approach.
- Gateway API: REST API (in apps/gateway) to trigger flow executions, load flows, and return results. The gateway compiles the flowspec into JSON and caches it. A policy may also be applied.

## Style Guidelines:

- Primary color: Deep violet (#673AB7) to signify innovation, intelligence, and sophistication, in alignment with a cutting-edge developer tool.
- Background color: Light gray (#EEEEEE) for a clean and neutral canvas, enhancing focus on the flow diagrams.
- Accent color: Soft lavender (#B39DDB), an analogous color to the primary violet, to draw the user's eye to key interactive elements without disrupting the harmony of the color scheme.
- Body and headline font: 'Inter', a grotesque sans-serif, known for its clear, modern aesthetic and readability across different screen sizes, ideal for technical interfaces and detailed documentation.
- Minimalist icons representing each node type (LLMCall, HTTP, etc.) for quick identification in the visual flow designer.
- Clean, intuitive layout with a clear separation between the node palette, the flow designer, and the configuration panel.
- Subtle animations for node connections and data flow visualization to enhance the user's understanding of the process.