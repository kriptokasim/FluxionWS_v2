'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MainNav } from '@/components/layout/main-nav';
import { ArrowRight, Bot, GitMerge, Webhook } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { FlowSpec } from '@/lib/types';
import { mockFlows } from '@/lib/mock-data';

const flowIcons: { [key: string]: React.ReactNode } = {
  'support-triage': <Bot className="w-6 h-6 text-primary" />,
  'code-summarize': <GitMerge className="w-6 h-6 text-primary" />,
  'web-to-csv': <Webhook className="w-6 h-6 text-primary" />,
};

const getFlowDescription = (flow: FlowSpec): string => {
  switch (flow.id) {
    case 'support-triage':
      return 'Classify a support ticket, use RAG to find fixes, propose a plan, and create a GitHub issue after human approval.';
    case 'code-summarize':
      return 'Ingest a repo, summarize changes, highlight risks, and open a PR with a checklist after human approval.';
    case 'web-to-csv':
      return 'Crawl a web page, extract tables, normalize data, validate schema, and push to a data warehouse.';
    default:
      return 'A flow for processing data and tasks.';
  }
};

export default function Home() {
  const flows = useMemo(() => mockFlows, []);

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">Flows Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Select a starter flow to view or edit it in the Fluxion Workbench Studio.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {flows.map((flow) => (
              <Link href={`/${flow.id}`} key={flow.id} className="group block">
                <Card className="h-full transition-all duration-300 ease-in-out transform hover:shadow-xl hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-2">
                         {flowIcons[flow.id] || <Bot className="w-6 h-6 text-primary" />}
                        <CardTitle className="font-headline text-lg">{flow.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</CardTitle>
                      </div>
                      <Badge variant="outline">v{flow.version}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {getFlowDescription(flow)}
                    </CardDescription>
                    <div className="flex items-center justify-end mt-4 text-sm font-medium text-primary group-hover:underline">
                      Open Editor <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
