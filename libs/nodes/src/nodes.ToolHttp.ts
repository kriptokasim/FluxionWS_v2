import type { NodeFn } from '@fluxion/sdk';
import { enforceHttpEgress } from './policy';

export const ToolHttp: NodeFn<{ url: string }, { status: number; body: string }> = async (_ctx, io) => {
  enforceHttpEgress(io.input.url);
  const res = await fetch(io.input.url);
  const body = await res.text();
  return { input: io.input, output: { status: res.status, body } };
};
