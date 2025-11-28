#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { load } from 'yaml';
import { randomUUID } from 'crypto';
import { resolveFlowEntry } from '@fluxion/flows';
import { getFlowSpec } from '@fluxion/local-store';

type EvalCase = {
  name: string;
  input: any;
  expect?: {
    contains?: string;
  };
};

type EvalSuite = {
  suite: string;
  flowId: string;
  metrics?: string[];
  cases: EvalCase[];
};

async function runSuite(suite: EvalSuite) {
  const spec = await getFlowSpec(suite.flowId);
  if (!spec) {
    throw new Error(`Flow ${suite.flowId} not initialized. Initialize it before running evals.`);
  }

  const entry = resolveFlowEntry(spec);
  const results: Array<{ name: string; passed: boolean; details?: string }> = [];

  for (const testCase of suite.cases) {
    const runId = randomUUID();
    const events: any[] = [];
    const append = async (event: any) => events.push({ ...event, ts: Date.now() });
    try {
      const output = await entry(testCase.input, { spec, append, runId, flowId: suite.flowId });
      const verdict = evaluateCase(output, testCase);
      results.push({ name: testCase.name, passed: verdict.pass, details: verdict.details });
    } catch (err: any) {
      results.push({ name: testCase.name, passed: false, details: err?.message || String(err) });
    }
  }

  return results;
}

function evaluateCase(output: any, testCase: EvalCase) {
  if (!testCase.expect?.contains) {
    return { pass: true };
  }
  const serialized = typeof output === 'string' ? output : JSON.stringify(output);
  const needle = testCase.expect.contains;
  if (!serialized.includes(needle)) {
    return { pass: false, details: `Expected result to contain "${needle}". Output: ${serialized}` };
  }
  return { pass: true };
}

async function main() {
  const evalDir = path.resolve(process.cwd(), 'evals');
  const files = fs.readdirSync(evalDir).filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'));
  const summary: Array<{ suite: string; passed: number; total: number }> = [];
  let hasFailure = false;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(evalDir, file), 'utf-8');
    const suite = load(raw) as EvalSuite;
    if (!suite?.flowId || !suite?.cases) {
      console.error(`Skipping ${file}: missing flowId or cases.`);
      continue;
    }
    console.log(`\nRunning suite: ${suite.suite} (flow: ${suite.flowId})`);
    const results = await runSuite(suite);
    results.forEach((result) => {
      if (result.passed) {
        console.log(` ✅ ${result.name}`);
      } else {
        hasFailure = true;
        console.log(` ❌ ${result.name}: ${result.details || 'failed'}`);
      }
    });
    const passed = results.filter((r) => r.passed).length;
    summary.push({ suite: suite.suite, passed, total: results.length });
  }

  console.log('\nEval Summary:');
  summary.forEach((item) => {
    console.log(` - ${item.suite}: ${item.passed}/${item.total} passed`);
  });

  if (hasFailure) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
