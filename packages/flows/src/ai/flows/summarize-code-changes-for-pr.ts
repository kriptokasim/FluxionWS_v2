/**
 * @fileOverview Summarizes code changes for a pull request.
 *
 * - summarizeCodeChangesForPR - A function that handles the code change summarization process.
 * - SummarizeCodeChangesForPRInput - The input type for the summarizeCodeChangesForPR function.
 * - SummarizeCodeChangesForPROutput - The return type for the summarizeCodeChangesForPR function.
 */

import { ai } from '../genkit';
import { runPromptWithRetry } from '../utils';
import { z } from 'genkit';

const SummarizeCodeChangesForPRInputSchema = z.object({
  diff: z.string().describe('The code diff to summarize.'),
});
export type SummarizeCodeChangesForPRInput = z.infer<typeof SummarizeCodeChangesForPRInputSchema>;

const SummarizeCodeChangesForPROutputSchema = z.object({
  summary: z.string().describe('The summary of the code changes.'),
});
export type SummarizeCodeChangesForPROutput = z.infer<typeof SummarizeCodeChangesForPROutputSchema>;

export async function summarizeCodeChangesForPR(input: SummarizeCodeChangesForPRInput): Promise<SummarizeCodeChangesForPROutput> {
  return summarizeCodeChangesForPRFlow(input);
}

const summarizeCodeChangesForPRPrompt = ai.definePrompt({
  name: 'summarizeCodeChangesForPRPrompt',
  input: {schema: SummarizeCodeChangesForPRInputSchema},
  output: {schema: SummarizeCodeChangesForPROutputSchema},
  prompt: `You are a code summarization expert.  You are given a code diff and you need to summarize the changes in the code diff to create a pull request description.  Be concise.

Code Diff:
{{diff}}`,
});

const summarizeCodeChangesForPRFlow = ai.defineFlow(
  {
    name: 'summarizeCodeChangesForPRFlow',
    inputSchema: SummarizeCodeChangesForPRInputSchema,
    outputSchema: SummarizeCodeChangesForPROutputSchema,
  },
  async input => {
    const {output} = await runPromptWithRetry(summarizeCodeChangesForPRPrompt, input);
    return output!;
  }
);
