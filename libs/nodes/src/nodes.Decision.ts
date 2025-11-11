import type { NodeFn } from '@fluxion/sdk'
export const Decision: NodeFn<{ flag: boolean }, { branch: 'yes' | 'no' }> = async (_ctx, io) => {
  return { input: io.input, output: { branch: io.input.flag ? 'yes' : 'no' } }
}
