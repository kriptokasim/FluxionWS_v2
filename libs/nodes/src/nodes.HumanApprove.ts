import type { NodeFn } from '@fluxion/sdk'
export const HumanApprove: NodeFn<{ summary: string }, { approved: boolean }> = async (_ctx, io) => {
  // placeholder: wire to inbox later
  return { input: io.input, output: { approved: true } }
}
