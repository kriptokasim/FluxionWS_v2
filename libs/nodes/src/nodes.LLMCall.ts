import type { NodeFn } from '@fluxion/sdk'
// placeholder; integrate any provider later
export const LLMCall: NodeFn<{ prompt: string }, { text: string }> = async (_ctx, io) => {
  const text = `LLM(not-implemented): ${io.input.prompt}`
  return { input: io.input, output: { text } }
}
