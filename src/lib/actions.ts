'use server';

import { randomUUID } from 'crypto';
import { resolveFlowEntry } from '@/lib/flow-registry';
import { appendRunRecord, getFlowSpecById, saveFlowSpecLocal } from '@/lib/storage/local-store';
import type { FlowSpec } from '@/lib/types';
import { mockFlows } from '@/lib/mock-data';

export async function runFlowAction({ flowId, version, input }: { flowId: string; version?: string; input: any;}) {
  const spec = await getFlowSpecById(flowId);
  if (!spec) {
    throw new Error(`Flow not found: ${flowId}`);
  }
  if (version && spec.version !== version) {
    console.warn(`Requested version ${version} does not match stored version ${spec.version}. Proceeding with stored version.`);
  }

  const runId = randomUUID();
  const startTs = Date.now();
  const events = [];

  const append = async (event: any) => {
    events.push({ ...event, ts: Date.now() });
  };

  try {
    const entry = resolveFlowEntry(spec);
    await append({ kind: 'start', node: 'entry', data: truncate(input) });

    const out = await entry(input, { spec, append, runId, flowId });
    const durationMs = Date.now() - startTs;

    await append({ kind: 'finish', node: 'entry', ms: durationMs, data: truncate(out) });

    await appendRunRecord(flowId, {
      id: runId,
      status: out.status === 'pending_approval' ? 'pending_approval' : 'ok',
      createdAt: startTs,
      durationMs,
      specVersion: spec.version,
      inputSummary: summarize(input),
      outputSummary: summarize(out),
      events,
    });

    return { ok: true, out };
  } catch (err: any) {
    const errorMsg = String(err?.message || err);
    await append({ kind: 'error', node: 'entry', error: errorMsg });

    const durationMs = Date.now() - startTs;

    await appendRunRecord(flowId, {
      id: runId,
      status: 'error',
      createdAt: startTs,
      durationMs,
      specVersion: spec.version,
      inputSummary: summarize(input),
      error: errorMsg,
      events,
    });

    return { ok: false, error: errorMsg };
  }
}

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

function summarize(x: any) {
  if (typeof x === 'string') {
    return x.length > 200 ? x.slice(0, 200) + '…' : x;
  }
  const s = JSON.stringify(truncate(x));
  return s.length > 200 ? s.slice(0, 200) + '…' : s;
}

function truncate(x: any) {
  try { 
    return JSON.parse(JSON.stringify(x, (_k, v) => 
      (typeof v === 'string' && v.length > 500 ? v.slice(0, 500) + '…' : v)
    )); 
  } catch { return x; }
}
