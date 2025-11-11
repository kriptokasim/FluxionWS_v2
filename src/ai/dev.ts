import { config } from 'dotenv';
config();

import '@/ai/flows/extract-data-from-web-page.ts';
import '@/ai/flows/summarize-code-changes-for-pr.ts';
import '@/ai/flows/generate-support-email-draft.ts';