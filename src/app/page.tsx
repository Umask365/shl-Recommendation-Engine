"use client";

import type { Dispatch, SetStateAction, RefObject } from 'react';
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecommendationForm, { type RecommendationFormHandle } from '@/components/recommendation-form'; // Import handle type
import RecommendationDisplay from '@/components/recommendation-display';
import type { GenerateRecommendationOutput } from '@/ai/flows/generate-recommendation';
import { Button } from '@/components/ui/button'; // Import Button
import { Bot, Sparkles } from 'lucide-react';

const examplePrompts = [
    "Assess a sales manager's leadership skills and ability to handle objections.",
    "Evaluate a software engineer's coding skills and problem-solving abilities.",
    "Determine a candidate's suitability for a customer service role, focusing on communication and empathy."
];

export default function Home() {
  const [recommendation, setRecommendation] = useState<GenerateRecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<RecommendationFormHandle>(null); // Create a ref for the form

  // Handler to populate the form with an example prompt
  const handleExamplePromptClick = (promptText: string) => {
    if (formRef.current) {
      formRef.current.setValue('description', promptText);
      // Optionally trigger form submission immediately
      // formRef.current.triggerSubmit();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
           <div className="flex justify-center items-center mb-4">
             <Bot className="h-10 w-10 text-primary" />
           </div>
          <CardTitle className="text-2xl font-bold text-primary">SHL Assessment Recommendation Engine</CardTitle> {/* Updated title */}
          <CardDescription className="text-muted-foreground">
            Enter a role description and skills to get AI-powered SHL assessment recommendations.
          </CardDescription>
           {/* Example Prompts Section */}
          <div className="pt-4 space-y-2">
             <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
               <Sparkles className="h-4 w-4 text-accent" /> Try an example:
             </p>
             <div className="flex flex-wrap justify-center gap-2">
               {examplePrompts.map((prompt, index) => (
                 <Button
                   key={index}
                   variant="outline"
                   size="sm"
                   className="text-xs"
                   onClick={() => handleExamplePromptClick(prompt)}
                 >
                   {prompt.split(' ').slice(0, 3).join(' ')}...
                   {/* Shorten button text */}
                 </Button>
               ))}
             </div>
           </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <RecommendationForm
            ref={formRef} // Attach the ref
            setRecommendation={setRecommendation}
            setIsLoading={setIsLoading}
            setError={setError}
            isLoading={isLoading}
          />
          <RecommendationDisplay
            recommendation={recommendation}
            isLoading={isLoading}
            error={error}
          />
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        Powered by SHL & GenAI
      </footer>
    </main>
  );
}
