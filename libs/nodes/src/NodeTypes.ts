export type Schema = unknown // swap with JSONSchema later
export type NodeSpec = {
  name: string
  in?: Schema
  out?: Schema
}
