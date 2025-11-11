import { promises as fs } from 'fs';
import path from 'path';
import type { FlowSpec, RunEvent, RunRecord } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const FLOWS_DIR = path.join(DATA_DIR, 'flows');
const RUNS_DIR = path.join(DATA_DIR, 'runs');

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

async function writeJson(filePath: string, data: unknown) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function listFlowSpecs(): Promise<FlowSpec[]> {
  await ensureDir(FLOWS_DIR);
  const files = await fs.readdir(FLOWS_DIR);
  const specs: FlowSpec[] = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const spec = await readJson<FlowSpec>(path.join(FLOWS_DIR, file));
    if (spec) {
      specs.push(spec);
    }
  }
  return specs;
}

export async function getFlowSpecById(flowId: string): Promise<FlowSpec | null> {
  const filePath = path.join(FLOWS_DIR, `${flowId}.json`);
  return readJson<FlowSpec>(filePath);
}

export async function saveFlowSpecLocal(spec: FlowSpec): Promise<void> {
  if (!spec?.id) {
    throw new Error('Flow spec must include an id');
  }
  const filePath = path.join(FLOWS_DIR, `${spec.id}.json`);
  await writeJson(filePath, spec);
}

type StoredRunsFile = {
  runs: Array<RunRecord & { events?: RunEvent[] }>;
};

export async function appendRunRecord(flowId: string, record: RunRecord & { events?: RunEvent[] }) {
  const filePath = path.join(RUNS_DIR, `${flowId}.json`);
  const existing = (await readJson<StoredRunsFile>(filePath)) ?? { runs: [] };
  existing.runs.unshift(record);
  await writeJson(filePath, existing);
}

export async function getRunRecords(flowId: string, limit = 20): Promise<Array<RunRecord & { events?: RunEvent[] }>> {
  const filePath = path.join(RUNS_DIR, `${flowId}.json`);
  const existing = (await readJson<StoredRunsFile>(filePath)) ?? { runs: [] };
  return existing.runs.slice(0, limit);
}
