"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { initializeFlowFromTemplateAction } from "@/lib/actions";

export function InitializeFlowButton({ flowId }: { flowId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const handleInitialize = () => {
    startTransition(async () => {
      try {
        const result = await initializeFlowFromTemplateAction(flowId);
        if (result.ok) {
          toast({
            title: "Flow Initialized",
            description: "Template copied into your local workspace.",
          });
          router.refresh();
        } else {
          throw new Error("Failed to initialize flow");
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Initialization Failed",
          description: error.message || "Unable to create the flow locally.",
        });
      }
    });
  };

  return (
    <Button onClick={handleInitialize} disabled={isPending}>
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Initialize Flow
    </Button>
  );
}
