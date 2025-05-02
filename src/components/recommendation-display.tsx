import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { GenerateRecommendationOutput } from '@/ai/flows/generate-recommendation';

type RecommendationDisplayProps = {
  recommendation: GenerateRecommendationOutput | null;
  isLoading: boolean;
  error: string | null;
};

export default function RecommendationDisplay({ recommendation, isLoading, error }: RecommendationDisplayProps) {
  if (isLoading) {
    return (
      <Card className="border-dashed border-muted-foreground">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!recommendation) {
    return (
        <div className="text-center text-muted-foreground p-6 border border-dashed rounded-md">
            Enter details above to get a recommendation.
        </div>
    );
  }

  return (
    <Card className="bg-secondary shadow-inner">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
         <CheckCircle className="h-5 w-5 text-accent" />
        <CardTitle className="text-lg font-semibold text-foreground">Recommendation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground whitespace-pre-wrap">{recommendation.recommendation}</p>
        {/* Future: Add more structured display here, e.g., key features, links */}
      </CardContent>
    </Card>
  );
}
