'use server';

/**
 * @fileOverview A Genkit flow for summarizing assessment recommendations.
 *
 * - summarizeAssessment - A function that generates a summary of an assessment.
 * - SummarizeAssessmentInput - The input type for the summarizeAssessment function.
 * - SummarizeAssessmentOutput - The return type for the summarizeAssessment function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeAssessmentInputSchema = z.object({
  assessmentDetails: z
    .string()
    .describe('The detailed description of the assessment to be summarized.'),
});
export type SummarizeAssessmentInput = z.infer<typeof SummarizeAssessmentInputSchema>;

const SummarizeAssessmentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the assessment.'),
});
export type SummarizeAssessmentOutput = z.infer<typeof SummarizeAssessmentOutputSchema>;

export async function summarizeAssessment(input: SummarizeAssessmentInput): Promise<SummarizeAssessmentOutput> {
  return summarizeAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAssessmentPrompt',
  input: {
    schema: z.object({
      assessmentDetails: z
        .string()
        .describe('The detailed description of the assessment to be summarized.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise summary of the assessment.'),
    }),
  },
  prompt: `You are an expert assessment summarizer. Please provide a concise summary of the following assessment details, highlighting its key features and benefits:\n\nAssessment Details: {{{assessmentDetails}}}`,
});

const summarizeAssessmentFlow = ai.defineFlow<
  typeof SummarizeAssessmentInputSchema,
  typeof SummarizeAssessmentOutputSchema
>({
  name: 'summarizeAssessmentFlow',
  inputSchema: SummarizeAssessmentInputSchema,
  outputSchema: SummarizeAssessmentOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
