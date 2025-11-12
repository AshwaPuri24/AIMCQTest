import { useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, LogOut, Plus, Clock, Target, TrendingUp, Award } from "lucide-react";
import { Link } from "wouter";
import type { TestAttempt, Test } from "@shared/schema";

type AttemptWithTest = TestAttempt & { test: Test };

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: attempts = [], isLoading: attemptsLoading } = useQuery<AttemptWithTest[]>({
    queryKey: ["/api/attempts"],
    enabled: isAuthenticated,
  });
  const bestAttempts = useMemo(() => {
  if (attemptsLoading || !attempts) return [];

  const testMap = new Map<string, AttemptWithTest>();

  for (const attempt of attempts) {
    // Skip tests that were started but never completed
    if (!attempt.completedAt) {
      continue;
    }

    const testId = attempt.test.id;
    const existingAttempt = testMap.get(testId);

    // If we haven't seen this test, or if this attempt has a better score, save it
    if (!existingAttempt || (attempt.percentage || 0) > (existingAttempt.percentage || 0)) {
      testMap.set(testId, attempt);
    }
  }

  // Return the best attempts, sorted by most recent
  return Array.from(testMap.values())
    .sort((a, b) => (new Date(b.startedAt || 0).getTime()) - (new Date(a.startedAt || 0).getTime()));
  }, [attempts, attemptsLoading]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const totalAttempts = attempts.length;
  const averageScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length)
    : 0;
  const completedTests = attempts.filter(a => a.completedAt).length;
  const bestScore = attempts.length > 0
    ? Math.max(...attempts.map(a => a.percentage || 0))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TestAI</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                  data-testid="img-profile"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {user?.firstName?.[0] || user?.email?.[0] || "U"}
                </div>
              )}
              <span className="text-sm font-medium hidden sm:inline" data-testid="text-username">
                {user?.firstName || user?.email?.split("@")[0] || "User"}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold" data-testid="text-welcome">
            Welcome back, {user?.firstName || "there"}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Ready to practice? Generate a new test or review your past attempts.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-attempts">{totalAttempts}</div>
              <p className="text-xs text-muted-foreground">
                {completedTests} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-average-score">{averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                Across all tests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-best-score">{bestScore}%</div>
              <p className="text-xs text-muted-foreground">
                Personal best
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-time-spent">
                {Math.round(attempts.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / 60)}m
              </div>
              <p className="text-xs text-muted-foreground">
                Total practice time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <Link href="/generate">
            <Button size="lg" className="w-full sm:w-auto" data-testid="button-generate-test">
              <Plus className="mr-2 h-5 w-5" />
              Generate New Test
            </Button>
          </Link>
        </div>

        {/* Test History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Test History</CardTitle>
            <CardDescription>
              Your best score for each test you've completed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attemptsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-lg bg-muted animate-pulse"></div>
                ))}
              </div>
            ) : bestAttempts.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No tests yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Generate your first AI-powered test to start practicing for your technical interviews
                  </p>
                </div>
                <Link href="/generate">
                  <Button data-testid="button-empty-generate">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Test
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bestAttempts.map((attempt) => (
                  <Link key={attempt.id} href={`/results/${attempt.id}`}>
                    <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-attempt-${attempt.id}`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <h4 className="font-semibold text-lg" data-testid={`text-test-title-${attempt.id}`}>
                              {attempt.test.title}
                            </h4>
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                              <span>{attempt.test.subject}</span>
                              <span>•</span>
                              <span className="capitalize">{attempt.test.difficulty}</span>
                              <span>•</span>
                              <span>{attempt.test.totalQuestions} questions</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            {attempt.completedAt ? (
                              <>
                                <div className="text-right">
                                  <div className="text-2xl font-bold" data-testid={`text-score-${attempt.id}`}>
                                    {attempt.percentage}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Grade: {attempt.grade}
                                  </div>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                  <Award className="h-6 w-6 text-primary" />
                                </div>
                              </>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                In Progress
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
