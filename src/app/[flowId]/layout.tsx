import { MainNav } from "@/components/layout/main-nav";

export default function FlowEditorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { flowId: string };
}) {
  return (
    <div className="flex flex-col h-screen">
      <MainNav />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
