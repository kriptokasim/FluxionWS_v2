'use server';
/**
 * @fileOverview Shared utilities for AI flows.
 */

import { Output } from 'genkit/generate';

/**
 * A helper function to wrap a prompt call with retry logic for transient errors.
 * @param prompt The Genkit prompt function to call.
 * @param input The input to the prompt.
 * @param retries The number of times to retry.
 * @param delayMs The initial delay between retries.
 * @returns The output of the prompt.
 */
export async function runPromptWithRetry<I, O>(
  prompt: (input: I) => Promise<Output<O>>,
  input: I,
  retries = 3,
  delayMs = 1000
): Promise<Output<O>> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await prompt(input);
    } catch (e: any) {
      lastError = e;
      // Check if the error is a 503 or similar transient error
      if (e.message?.includes('503') || e.message?.includes('overloaded')) {
        console.log(`Attempt ${i + 1} failed. Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential backoff
      } else {
        // Not a transient error, fail immediately
        throw e;
      }
    }
  }
  throw lastError; // Throw the last error after all retries have failed
}
