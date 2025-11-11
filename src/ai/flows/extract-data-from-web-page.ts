'use server';
/**
 * @fileOverview Extracts relevant information from a web page into a structured format like CSV using an LLM.
 *
 * - extractDataFromWebPage - A function that handles the extraction process.
 * - ExtractDataFromWebPageInput - The input type for the extractDataFromWebPage function.
 * - ExtractDataFromWebPageOutput - The return type for the extractDataFromWebPage function.
 */

import {ai} from '@/ai/genkit';
import { runPromptWithRetry } from '@/ai/utils';
import {z} from 'genkit';

const ExtractDataFromWebPageInputSchema = z.object({
  url: z.string().describe('The URL of the web page to extract data from.'),
  extractionPrompt: z.string().describe('Instructions for the LLM on what data to extract and how to format it (e.g., CSV format).'),
});
export type ExtractDataFromWebPageInput = z.infer<typeof ExtractDataFromWebPageInputSchema>;

const ExtractDataFromWebPageOutputSchema = z.object({
  extractedData: z.string().describe('The extracted data in the specified format (e.g., CSV).'),
});
export type ExtractDataFromWebPageOutput = z.infer<typeof ExtractDataFromWebPageOutputSchema>;

export async function extractDataFromWebPage(input: ExtractDataFromWebPageInput): Promise<ExtractDataFromWebPageOutput> {
  return extractDataFromWebPageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractDataFromWebPagePrompt',
  input: {schema: ExtractDataFromWebPageInputSchema},
  output: {schema: ExtractDataFromWebPageOutputSchema},
  prompt: `You are an expert data extraction specialist. Your goal is to extract data from a web page and format it according to user instructions. 

  Web Page URL: {{{url}}}
  Extraction Instructions: {{{extractionPrompt}}}
  
  Extracted Data: `,
});

const extractDataFromWebPageFlow = ai.defineFlow(
  {
    name: 'extractDataFromWebPageFlow',
    inputSchema: ExtractDataFromWebPageInputSchema,
    outputSchema: ExtractDataFromWebPageOutputSchema,
  },
  async input => {
    const {output} = await runPromptWithRetry(prompt, input);
    return output!;
  }
);
