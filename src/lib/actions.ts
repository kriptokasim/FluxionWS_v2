'use server';

import type { FlowSpec } from '@fluxion/types';
import { saveFlowSpec as saveFlowSpecLocal } from '@fluxion/local-store';
import { mockFlows } from '@/lib/mock-data';

export async function saveFlowSpecAction(spec: FlowSpec) {
  if (!spec?.id || !spec?.version) {
    throw new Error('Flow spec requires an id and version');
  }
  await saveFlowSpecLocal(spec);
  return { ok: true };
}

export async function initializeFlowFromTemplateAction(flowId: string) {
  const template = mockFlows.find(f => f.id === flowId);
  if (!template) {
    throw new Error(`Unknown flow template: ${flowId}`);
  }
  await saveFlowSpecLocal(template);
  return { ok: true };
}
