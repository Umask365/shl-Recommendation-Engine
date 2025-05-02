"use client";

import React, { type Dispatch, type SetStateAction, forwardRef, useImperativeHandle } from 'react';
import { useForm, type UseFormSetValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { getRecommendationAction } from '@/app/actions';
import type { GenerateRecommendationOutput } from '@/ai/flows/generate-recommendation';

const FormSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(1000, {
    message: "Description must not exceed 1000 characters.",
  }),
});

type FormValues = z.infer<typeof FormSchema>;

// Define the handle type to expose setValue
export type RecommendationFormHandle = {
  setValue: UseFormSetValue<FormValues>;
  triggerSubmit: () => void; // Optional: if you want to trigger submit from parent
};

type RecommendationFormProps = {
  setRecommendation: Dispatch<SetStateAction<GenerateRecommendationOutput | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  isLoading: boolean;
};

// Use forwardRef to get the ref from the parent
const RecommendationForm = forwardRef<RecommendationFormHandle, RecommendationFormProps>(
  ({ setRecommendation, setIsLoading, setError, isLoading }, ref) => {
    const { toast } = useToast();
    const form = useForm<FormValues>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        description: "",
      },
    });

    const { isSubmitting } = form.formState;

    // Expose the setValue function via useImperativeHandle
    useImperativeHandle(ref, () => ({
      setValue: form.setValue,
      triggerSubmit: () => form.handleSubmit(onSubmit)(), // Optional: expose submit trigger
    }));

    async function onSubmit(data: FormValues) {
      setIsLoading(true);
      setError(null);
      setRecommendation(null);

      try {
        const result = await getRecommendationAction(data);
        if (result.error) {
          setError(result.error);
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
          });
        } else {
          setRecommendation(result.data);
          toast({
            title: "Recommendation Generated",
            description: "Successfully retrieved assessment recommendation.",
          });
        }
      } catch (error) {
        console.error("Error calling getRecommendationAction:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown client-side error occurred";
        setError(`Failed to get recommendation: ${errorMessage}`);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to get recommendation: ${errorMessage}`,
        });
      } finally {
        setIsLoading(false);
      }
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="description">Role Description & Skills</FormLabel>
                <FormControl>
                  <Textarea
                    id="description"
                    placeholder="e.g., Assess a sales manager's leadership skills..."
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Get Recommendation"
            )}
          </Button>
        </form>
      </Form>
    );
  }
);

RecommendationForm.displayName = "RecommendationForm"; // Add display name for DevTools

export default RecommendationForm;
