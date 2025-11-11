import type { NodeFn } from '@fluxion/sdk'
export const ParseJson: NodeFn<{ text: string }, { json: unknown }> = async (_ctx, io) => {
  const json = JSON.parse(io.input.text)
  return { input: io.input, output: { json } }
}
