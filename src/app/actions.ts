"use server";

import { generateRecommendation, type GenerateRecommendationInput, type GenerateRecommendationOutput } from '@/ai/flows/generate-recommendation';

/**
 * Server action to get assessment recommendations.
 * Takes user input, calls the Genkit flow, and returns the recommendation or an error.
 */
export async function getRecommendationAction(
  input: GenerateRecommendationInput
): Promise<{ data?: GenerateRecommendationOutput | null; error?: string | null }> {
  try {
    // Validate input if necessary (basic validation done by flow schema)
    if (!input || !input.description) {
      throw new Error("Invalid input: Description is required.");
    }

    const recommendation = await generateRecommendation(input);

    // Check if the recommendation object itself is valid and has the recommendation string
    if (!recommendation || typeof recommendation.recommendation !== 'string') {
        console.error("Received invalid recommendation object:", recommendation);
        throw new Error("AI failed to generate a valid recommendation structure.");
    }

    return { data: recommendation };
  } catch (error) {
    console.error("Error in getRecommendationAction:", error);
    // Ensure a user-friendly error message is returned
    const message = error instanceof Error ? error.message : "An unexpected error occurred while generating the recommendation.";
    // Avoid exposing overly technical internal errors like "assessments.find is not a function"
    if (message.includes("assessment data")) {
         return { error: "There was an issue retrieving assessment information. Please try again later." };
    }
    return { error: message };
  }
}
