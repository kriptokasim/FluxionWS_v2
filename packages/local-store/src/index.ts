import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import type { FlowSpec, RunEvent, RunRecord } from '@fluxion/types';

const DATA_DIR = resolveDataDir();
const FLOWS_DIR = path.join(DATA_DIR, 'flows');
const RUNS_DIR = path.join(DATA_DIR, 'runs');

function resolveDataDir(): string {
  if (process.env.FLUXION_DATA_DIR) {
    return path.resolve(process.env.FLUXION_DATA_DIR);
  }

  const cwdCandidate = path.resolve(process.cwd(), 'data');
  if (fs.existsSync(cwdCandidate)) {
    return cwdCandidate;
  }

  const root = findRepoRoot(process.cwd());
  return path.join(root, 'data');
}

function findRepoRoot(start: string): string {
  let dir = start;
  while (true) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        if (pkg?.name === 'fluxion-workbench') {
          return dir;
        }
      } catch {
        // ignore JSON parse errors
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return start;
}

async function ensureDir(dir: string) {
  await fsp.mkdir(dir, { recursive: true });
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fsp.readFile(filePath, 'utf-8');
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
  await fsp.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function listFlowSpecs(): Promise<FlowSpec[]> {
  await ensureDir(FLOWS_DIR);
  const files = await fsp.readdir(FLOWS_DIR);
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

export async function getFlowSpec(flowId: string): Promise<FlowSpec | null> {
  const filePath = path.join(FLOWS_DIR, `${flowId}.json`);
  return readJson<FlowSpec>(filePath);
}

export async function saveFlowSpec(spec: FlowSpec): Promise<void> {
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

export function getDataDirectory() {
  return DATA_DIR;
}
