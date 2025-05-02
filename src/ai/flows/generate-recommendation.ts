'use server';

/**
 * @fileOverview A flow for generating assessment recommendations based on a description of the role and skills to assess, using a predefined list of assessments.
 *
 * - generateRecommendation - A function that generates an assessment recommendation.
 * - GenerateRecommendationInput - The input type for the generateRecommendation function (user-facing).
 * - GenerateRecommendationOutput - The return type for the generateRecommendation function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
// Import fs promises for reading the file
import fs from 'fs/promises';
import path from 'path';

// Define the structure of an assessment in the JSON file
const AssessmentSchema = z.object({
  name: z.string(),
  category: z.string(),
  description: z.string(),
  url: z.string().url().optional(), // Make URL optional as not all might have one immediately
});
type Assessment = z.infer<typeof AssessmentSchema>;

// User-facing input schema
const GenerateRecommendationInputSchema = z.object({
  description: z.string().describe('A description of the role and skills to assess.'),
});
export type GenerateRecommendationInput = z.infer<typeof GenerateRecommendationInputSchema>;

// Internal flow input schema including assessment data
const FlowInputSchema = z.object({
    description: z.string().describe('A description of the role and skills to assess.'),
    assessmentData: z.string().describe('A JSON string representing the list of available SHL assessments.'),
});
type FlowInput = z.infer<typeof FlowInputSchema>;


const GenerateRecommendationOutputSchema = z.object({
  recommendation: z.string().describe('A relevant and concise assessment recommendation text.'),
});
export type GenerateRecommendationOutput = z.infer<typeof GenerateRecommendationOutputSchema>;

// Function to load assessment data from JSON file
async function loadAssessmentData(): Promise<Assessment[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'shl-assessments.json');
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const assessments = JSON.parse(jsonData);
    // Validate the data against the schema
    return z.array(AssessmentSchema).parse(assessments);
  } catch (error) {
    console.error("Error loading or parsing assessment data:", error);
    // Return an empty array or throw a more specific error if loading data is critical
    return [];
  }
}

// This is the function called by the server action
export async function generateRecommendation(input: GenerateRecommendationInput): Promise<GenerateRecommendationOutput> {
  // Load assessment data
  const assessments = await loadAssessmentData();
  if (!Array.isArray(assessments) || assessments.length === 0) {
    // Ensure assessments is an array before proceeding
    console.error("Assessment data is not an array or is empty:", assessments);
    throw new Error("Could not load or parse valid assessment data. Unable to generate recommendations.");
  }


  // Prepare the input for the internal flow
  const flowInput: FlowInput = {
      description: input.description,
      assessmentData: JSON.stringify(assessments, null, 2), // Pass assessments as a stringified JSON
  };

  // Call the Genkit flow with the combined input
  return generateRecommendationFlow(flowInput);
}

const PromptOutputSchema = z.object({
    recommendationText: z.string().describe('A relevant and concise assessment recommendation based *only* on the provided list.'),
    assessmentName: z.string().describe('The exact name of the SHL assessment recommended, as it appears in the provided list (e.g., "Verify G+ (Inductive)").'),
});

const prompt = ai.definePrompt({
  name: 'generateRecommendationPrompt',
  input: {
    // Prompt input schema matches FlowInputSchema
    schema: FlowInputSchema,
  },
  output: {
    schema: PromptOutputSchema,
  },
  prompt: `You are an AI assistant specializing in recommending SHL assessments. A user will provide a description of the role and skills they need to assess.

You MUST use ONLY the following JSON list of SHL assessments provided below as your source to find the most relevant assessment. Do NOT invent assessments or use external knowledge.

Available Assessments:
\`\`\`json
{{{assessmentData}}}
\`\`\`

Generate a relevant and concise assessment recommendation based ONLY on the user's description and the provided list of assessments.

IMPORTANT: In your response:
1.  Strictly choose an assessment from the provided list.
2.  Clearly identify the **exact name** of the SHL assessment you are recommending (as listed in the JSON) in the 'assessmentName' field.
3.  Provide a descriptive recommendation text in the 'recommendationText' field, explaining why the chosen assessment is suitable based on the user's description and the assessment's details from the list.
4.  Do not include any links or URLs in the recommendationText or assessmentName fields.

User Description: {{{description}}}`,
});

// Modify the flow definition:
// - Input type is FlowInput
// - Output type is GenerateRecommendationOutputSchema
// - The function receives ONE argument: flowInput
const generateRecommendationFlow = ai.defineFlow<
  typeof FlowInputSchema,
  typeof GenerateRecommendationOutputSchema
>({
  name: 'generateRecommendationFlow',
  inputSchema: FlowInputSchema, // Use the combined schema
  outputSchema: GenerateRecommendationOutputSchema,
}, async (flowInput) => { // The flow receives a single input object

    // Call the prompt with the received flow input
    const {output} = await prompt(flowInput);

    if (!output || !output.recommendationText || !output.assessmentName) {
        console.error("AI Output Error:", output); // Log the output for debugging
        throw new Error("AI failed to generate a complete recommendation (text and assessment name).");
    }

    // No need to find the assessment or link anymore
    // Return only the recommendation text generated by the AI

    return { recommendation: output.recommendationText };
});
