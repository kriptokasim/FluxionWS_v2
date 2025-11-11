"use client";

import React from "react";
import type { FlowSpec } from "@/lib/types";
import { FlowNode } from "./flow-node";
import { ArrowDown } from "lucide-react";

interface FlowCanvasProps {
  flow: FlowSpec;
  selectedNodeName: string | null;
  onNodeSelect: (nodeName: string | null) => void;
  onNodeDelete: (nodeName: string) => void;
  onNodeOrderChange: (nodeName: string, direction: 'up' | 'down') => void;
}

export function FlowCanvas({ 
  flow, 
  selectedNodeName, 
  onNodeSelect, 
  onNodeDelete,
  onNodeOrderChange,
}: FlowCanvasProps) {
  // For MVP, we assume a linear flow based on the edge definitions.
  const sortedNodes = [];
  const nodeMap = new Map(flow.nodes.map(node => [node.name, node]));
  
  // A more robust sorting based on the provided nodes array order
  const nodeOrder = flow.nodes.map(n => n.name);
  const sortedFlowNodes = [...flow.nodes].sort((a, b) => nodeOrder.indexOf(a.name) - nodeOrder.indexOf(b.name));

  return (
    <div className="w-full h-full" onClick={() => onNodeSelect(null)}>
      <div className="relative flex flex-col items-center p-4 md:p-8">
        {sortedFlowNodes.map((node, index) => {
          const isFirstNode = index === 0;
          const isLastNode = index === sortedFlowNodes.length - 1;
          const hasConnectionToNext = !isLastNode && flow.edges.some(e => e.from === node.name && e.to === sortedFlowNodes[index+1]?.name);

          return (
            <React.Fragment key={node.name}>
              <FlowNode
                node={node}
                isSelected={selectedNodeName === node.name}
                isFirst={isFirstNode}
                isLast={isLastNode}
                onSelect={onNodeSelect}
                onDelete={onNodeDelete}
                onOrderChange={onNodeOrderChange}
              />
              {hasConnectionToNext && (
                <div
                  className="my-4 h-16 w-0.5 bg-muted-foreground/30 relative flex justify-center"
                  aria-hidden="true"
                >
                  <ArrowDown className="absolute bottom-1 h-5 w-5 text-muted-foreground/50" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
