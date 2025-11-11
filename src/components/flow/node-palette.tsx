import { nodeIcons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";

export function NodePalette() {
  const nodes = [
    { kind: "Input", description: "Starts a flow" },
    { kind: "LLMCall", description: "Call a language model" },
    { kind: "HTTP", description: "Make an HTTP request" },
    { kind: "Parse", description: "Parse structured data" },
    { kind: "Decision", description: "Branch based on logic" },
    { kind: "HumanApprove", description: "Request human approval" },
    { kind: "Storage", description: "Write to storage" },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold font-headline mb-4 px-2">Node Palette</h2>
      <div className="space-y-2">
        {nodes.map(({ kind, description }) => {
          const Icon = nodeIcons[kind];
          return (
            <div
              key={kind}
              className="flex items-center p-2 rounded-lg hover:bg-accent hover:text-accent-foreground cursor-grab transition-colors"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/reactflow", kind);
                e.dataTransfer.effectAllowed = "move";
              }}
            >
              {Icon && <Icon className="h-5 w-5 mr-3 text-primary" />}
              <div>
                <p className="font-medium">{kind}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <Separator className="my-4" />
      <p className="text-xs text-muted-foreground px-2">
        Drag and drop nodes onto the canvas to build your flow.
      </p>
    </div>
  );
}
