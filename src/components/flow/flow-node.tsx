"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { NodeSpec } from "@fluxion/types";
import { getNodeIcon } from "@/components/icons";
import { Button } from "../ui/button";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

interface FlowNodeProps {
  node: NodeSpec;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: (nodeName: string) => void;
  onDelete: (nodeName: string) => void;
  onOrderChange: (nodeName: string, direction: 'up' | 'down') => void;
}

export function FlowNode({ node, isSelected, isFirst, isLast, onSelect, onDelete, onOrderChange }: FlowNodeProps) {
  const Icon = getNodeIcon(node.kind);

  const handleNodeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onSelect(node.name);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete(node.name);
  };

  const handleMoveUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onOrderChange(node.name, 'up');
  };

  const handleMoveDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onOrderChange(node.name, 'down');
  };

  return (
    <Card
      className={cn(
        "w-72 cursor-pointer border-2 transition-all duration-200 ease-in-out relative",
        isSelected ? "border-primary shadow-lg" : "hover:border-primary/50"
      )}
      onClick={handleNodeClick}
    >
      {isSelected && (
        <div className="absolute -top-3 -right-3 z-10 flex gap-1">
          {!isFirst &&
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-full bg-background"
              onClick={handleMoveUp}
              aria-label="Move node up"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          }
          {!isLast &&
             <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-full bg-background"
              onClick={handleMoveDown}
              aria-label="Move node down"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          }
          <Button
            variant="destructive"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={handleDeleteClick}
            aria-label="Delete node"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{node.name}</CardTitle>
        <div className="flex items-center text-xs text-muted-foreground">
          <Icon className="h-4 w-4 mr-1" />
          {node.kind}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {node.inputs.map(port => (
            <div key={port.name} className="absolute -left-[25px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-muted-foreground/50 border-2 border-card" title={`Input: ${port.name}`} />
          ))}
          <div className="text-xs text-muted-foreground bg-secondary/50 rounded-md p-2 h-12 flex items-center justify-center">
            Click to configure
          </div>
          {node.outputs.map(port => (
            <div key={port.name} className="absolute -right-[25px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-muted-foreground/50 border-2 border-card" title={`Output: ${port.name}`} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
