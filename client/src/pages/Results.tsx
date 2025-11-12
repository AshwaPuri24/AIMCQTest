import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, ArrowLeft, Award, CheckCircle2, XCircle, Share2, RotateCcw, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { AttemptWithDetails } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";

export default function Results({ params }: { params: { attemptId: string } }) {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: result, isLoading } = useQuery<AttemptWithDetails>({
    queryKey: ["/api/attempts", params.attemptId, "results"],
    enabled: isAuthenticated,
  });

  const reattemptMutation = useMutation({
  mutationFn: async () => {
    // We get the test ID from the results we already loaded
    const response = await apiRequest("POST", `/api/tests/${result!.test.id}/reattempt`);
    return response.json();
  },
  onSuccess: (data: any) => {
    toast({
      title: "New Attempt Created!",
      description: "Good luck on your re-attempt.",
    });
    // Navigate to the new test attempt
    navigate(`/test/${data.attemptId}`);
  },
  onError: (error: Error) => {
    toast({
      title: "Failed to Create Re-attempt",
      description: error.message || "Please try again.",
      variant: "destructive",
    });
  },
});

const handleReattempt = () => {
  reattemptMutation.mutate();
};

  if (authLoading || isLoading || !result) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
      case "A+":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "B":
      case "B+":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "C":
      case "C+":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      default:
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    }
  };

  const getMessage = (percentage: number) => {
    if (percentage >= 90) return "Outstanding! You've mastered this topic!";
    if (percentage >= 80) return "Excellent work! You're well-prepared!";
    if (percentage >= 70) return "Good job! Keep practicing to improve!";
    if (percentage >= 60) return "Not bad! Review the topics and try again!";
    return "Keep learning! Practice makes perfect!";
  };

  const correctAnswers = result.userAnswers.filter((a) => a.isCorrect).length;
  const totalQuestions = result.userAnswers.length;
  const percentage = result.percentage || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">TestAI</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Results Summary */}
        <Card className="mb-8">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">Test Completed!</CardTitle>
            <CardDescription className="text-lg">{result.test.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center space-y-4">
              <div>
                <div className="text-6xl font-bold text-primary mb-2" data-testid="text-final-score">
                  {percentage}%
                </div>
                <p className="text-xl text-muted-foreground">
                  {correctAnswers} out of {totalQuestions} correct
                </p>
              </div>
              <Badge className={`text-2xl px-6 py-2 ${getGradeColor(result.grade || "F")}`} data-testid="badge-grade">
                Grade: {result.grade}
              </Badge>
              <p className="text-lg font-medium">{getMessage(percentage)}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Accuracy</span>
                <span>{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-3" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-destructive">{totalQuestions - correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{Math.floor((result.timeTaken || 0) / 60)}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold capitalize">{result.test.difficulty}</div>
                <div className="text-sm text-muted-foreground">Level</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
  <Link href="/" className="flex-1">
    <Button variant="outline" className="w-full" data-testid="button-dashboard">
      <Home className="mr-2 h-4 w-4" />
      Back to Dashboard
    </Button>
  </Link>

  {/* --- NEW RE-ATTEMPT BUTTON --- */}
  <Button
    onClick={handleReattempt}
    disabled={reattemptMutation.isPending}
    className="w-full flex-1"
    data-testid="button-reattempt"
  >
    <RotateCcw className="mr-2 h-4 w-4" />
    {reattemptMutation.isPending ? "Creating..." : "Re-attempt This Test"}
  </Button>

  {/* --- RENAMED "GENERATE NEW" BUTTON --- */}
  <Link href="/generate" className="flex-1">
    <Button variant="outline" className="w-full" data-testid="button-new-test">
      <Plus className="mr-2 h-4 w-4" />
      Generate New Test
    </Button>
  </Link>
</div>
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Detailed Breakdown</CardTitle>
            <CardDescription>
              Review each question with correct answers and AI-generated explanations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {result.userAnswers.map((answer, index) => {
                const question = answer.question;
                const isCorrect = answer.isCorrect;
                return (
                  <AccordionItem key={answer.id} value={answer.id}>
                    <AccordionTrigger className="hover:no-underline" data-testid={`accordion-question-${index}`}>
                      <div className="flex items-center gap-3 text-left flex-1">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          isCorrect ? "bg-green-500/10" : "bg-red-500/10"
                        }`}>
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Question {index + 1}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {question.questionText}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-6">
                      <div className="space-y-6 pl-11">
                        {/* Question */}
                        <div>
                          <h4 className="font-semibold mb-2">Question:</h4>
                          <p className="text-foreground leading-relaxed">{question.questionText}</p>
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                          <h4 className="font-semibold">Options:</h4>
                          {question.options.map((option, optIdx) => {
                            const isUserAnswer = answer.selectedAnswer === optIdx;
                            const isCorrectAnswer = question.correctAnswer === optIdx;
                            
                            return (
                              <div
                                key={optIdx}
                                className={`rounded-lg border-2 p-3 ${
                                  isCorrectAnswer
                                    ? "border-green-500 bg-green-500/5"
                                    : isUserAnswer
                                    ? "border-red-500 bg-red-500/5"
                                    : "border-border"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isCorrectAnswer && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  )}
                                  <span className={isCorrectAnswer || isUserAnswer ? "font-medium" : ""}>
                                    {option}
                                  </span>
                                  {isUserAnswer && (
                                    <Badge variant="outline" className="ml-auto">Your Answer</Badge>
                                  )}
                                  {isCorrectAnswer && (
                                    <Badge variant="outline" className="ml-auto bg-green-500/10">Correct</Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* AI Reasoning */}
                        <div className="rounded-lg bg-muted/50 p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            AI Explanation:
                          </h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {question.reasoning}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
