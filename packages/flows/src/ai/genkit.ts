import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Initializes and configures the Genkit AI instance.
 * By not passing any credentials to googleAI(), it will automatically use
 * Application Default Credentials in the cloud environment.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
