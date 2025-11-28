import { generateSupportEmailDraft } from './ai/flows/generate-support-email-draft';

export function resolveFlowEntry(spec: { id: string; meta?: { entry?: string } }): (...args: any[]) => any {
  const entry = spec.meta?.entry || spec.id;
  switch (entry) {
    case 'support-triage':
    case 'generateSupportEmailDraft':
      return generateSupportEmailDraft;
    // case 'code-to-pr': return codeToPr;
    default:
      console.warn(`No entry resolver for ${entry}, returning a no-op function.`);
      // Return a dummy function for flows that don't have a backend implementation yet
      return async (input: any) => ({
        message: `Flow entry '${entry}' not implemented.`,
        receivedInput: input,
      });
  }
}
