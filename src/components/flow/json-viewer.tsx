import { cn } from "@/lib/utils";

interface JsonViewerProps {
  data: any;
  className?: string;
}

export function JsonViewer({ data, className }: JsonViewerProps) {
  return (
    <pre className={cn("text-xs w-full rounded-md bg-secondary p-4 overflow-x-auto", className)}>
      <code className="text-secondary-foreground">{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
}
