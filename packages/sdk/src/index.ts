export type NodeContext = { runId: string; memoryUrl?: string }
export type NodeIO<TIn = unknown, TOut = unknown> = { input: TIn; output?: TOut }
export type NodeFn<TIn, TOut> = (ctx: NodeContext, io: NodeIO<TIn, TOut>) => Promise<NodeIO<TIn, TOut>>
