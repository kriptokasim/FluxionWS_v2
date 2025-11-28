/**
 * @fileOverview This file defines a Genkit flow for automatically drafting support email replies.
 *
 * - generateSupportEmailDraft - A function that generates a support email draft based on the customer's issue and suggested classification.
 * - GenerateSupportEmailDraftInput - The input type for the generateSupportEmailDraft function.
 * - GenerateSupportEmailDraftOutput - The return type for the generateSupportEmailDraft function.
 */

import { ai } from '../genkit';
import { z } from 'genkit';
import { runPromptWithRetry } from '../utils';

const GenerateSupportEmailDraftInputSchema = z.object({
  subject: z.string().describe('The subject of the customer support issue.'),
  body: z.string().describe('The body of the customer support issue.'),
  // These are provided if continuing a run
  runId: z.string().optional().describe('The ID of the run to continue.'),
  approvedText: z.string().optional().describe('The human-approved text.')
});
export type GenerateSupportEmailDraftInput = z.infer<typeof GenerateSupportEmailDraftInputSchema>;

const GenerateSupportEmailDraftOutputSchema = z.object({
  draftEmail: z.string().describe('The drafted support email reply.'),
});
export type GenerateSupportEmailDraftOutput = z.infer<typeof GenerateSupportEmailDraftOutputSchema>;

const classifyPrompt = ai.definePrompt({
  name: 'classifySupportIssuePrompt',
  input: { schema: z.object({ subject: z.string(), body: z.string() }) },
  output: { schema: z.object({ label: z.string().describe('e.g., billing, bug, feature') }) },
  prompt: `Classify the support issue based on its subject and body.
  
  Subject: {{{subject}}}
  Body: {{{body}}}`,
});

const draftPrompt = ai.definePrompt({
  name: 'generateSupportEmailDraftPrompt',
  input: { schema: z.object({ subject: z.string(), body: z.string(), classification: z.string() }) },
  output: { schema: GenerateSupportEmailDraftOutputSchema },
  prompt: `You are an AI assistant specializing in drafting support email replies. Based on the customer's issue and its classification, draft a polite and helpful reply.

  Classification: {{{classification}}}
  Issue Subject: {{{subject}}}
  Issue Body: {{{body}}}

  Draft Email:`,
});

export async function generateSupportEmailDraft(
  input: GenerateSupportEmailDraftInput,
  context: { spec: any, append: (event: any) => Promise<any>, runId: string, flowId: string }
) {
  // STAGE 2: Human approval has been given.
  if (input.runId && input.approvedText) {
    await context.append({ kind: 'info', node: 'human-approve', data: { approvedText: input.approvedText }});
    // Simulate sending the email
    await new Promise(resolve => setTimeout(resolve, 750));
    await context.append({ kind: 'info', node: 'send-email', data: { message: "Email sent (simulated)." }});
    
    return {
      message: 'Email sent successfully (simulated).',
      approvedText: input.approvedText,
    };
  }

  // STAGE 1: Starting the flow.
  const { subject, body } = input;
  
  // 1. Classify
  const { output: classification } = await runPromptWithRetry(classifyPrompt, { subject, body });
  await context.append({ kind: 'llm-call', node: 'classify', data: classification });

  // 2. Draft
  const { output: draft } = await runPromptWithRetry(draftPrompt, { subject, body, classification: classification!.label });
  await context.append({ kind: 'llm-call', node: 'draft', data: draft });

  // 3. Wait for Human-in-the-loop (HITL)
  // We return a special status to the client, which will show the approval modal.
  return {
    status: 'pending_approval',
    text: draft!.draftEmail,
    runId: context.runId, // Pass the runId back to the client
    flowId: context.flowId
  };
}
