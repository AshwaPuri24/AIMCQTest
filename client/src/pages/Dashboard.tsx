import { useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, LogOut, Plus, Clock, Target, TrendingUp, Award } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { TestAttempt, Test } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

type AttemptWithTest = TestAttempt & { test: Test };

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

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

  const { data: tests = [], isLoading: testsLoading } = useQuery<Test[]>({
    queryKey: ["/api/tests"],
    enabled: isAuthenticated,
  });

  // One row per generated test, joined to the attempt that best represents it.
  // Preference order for which attempt to show on the card:
  //   1. Best *completed* attempt (highest percentage) — gives the user their best score.
  //   2. Most recent in-progress attempt — so half-finished tests don't disappear.
  //   3. null — test exists but was never started (auto-attempt creation failed, etc.).
  type DashboardRow = { test: Test; attempt: AttemptWithTest | null };

  const dashboardRows: DashboardRow[] = useMemo(() => {
    if (attemptsLoading || testsLoading) return [];

    // Bucket every attempt under its test ID so we don't do an O(n*m) scan below.
    const byTest = new Map<string, AttemptWithTest[]>();
    for (const a of attempts) {
      const list = byTest.get(a.test.id) ?? [];
      list.push(a);
      byTest.set(a.test.id, list);
    }

    const pick = (list: AttemptWithTest[]): AttemptWithTest | null => {
      if (list.length === 0) return null;
      const completed = list.filter((a) => a.completedAt);
      if (completed.length > 0) {
        return completed.reduce((best, a) =>
          (a.percentage || 0) > (best.percentage || 0) ? a : best
        );
      }
      // No completed attempts → take the most recently started in-progress one.
      return list.reduce((latest, a) =>
        new Date(a.startedAt || 0).getTime() > new Date(latest.startedAt || 0).getTime()
          ? a
          : latest
      );
    };

    // Drive off `tests` (the master list), not `attempts`, so tests with zero
    // attempts still get a row.
    return tests
      .map((test) => ({ test, attempt: pick(byTest.get(test.id) ?? []) }))
      .sort((a, b) => {
        // Sort by most recent attempt activity; unattempted tests sink to the bottom.
        const aTime = a.attempt ? new Date(a.attempt.startedAt || 0).getTime() : 0;
        const bTime = b.attempt ? new Date(b.attempt.startedAt || 0).getTime() : 0;
        return bTime - aTime;
      });
  }, [attempts, tests, attemptsLoading, testsLoading]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
    },
    onError: () => {
      toast({
        title: "Logout Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
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
            <Button variant="ghost" size="icon" onClick={handleLogout} disabled={logoutMutation.isPending} data-testid="button-logout">
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
            ) : dashboardRows.length === 0 ? (
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
                {dashboardRows.map(({ test, attempt }) => {
                  const isCompleted = !!attempt?.completedAt;
                  const isInProgress = !!attempt && !isCompleted;
                  // Completed/in-progress attempts have a results page; unattempted
                  // tests are non-clickable for now (auto-attempt creation should
                  // mean this branch is rarely hit in practice).
                  const card = (
                    <Card
                      className={`${attempt ? "hover-elevate active-elevate-2 cursor-pointer" : "opacity-80"}`}
                      data-testid={`card-test-${test.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <h4 className="font-semibold text-lg" data-testid={`text-test-title-${test.id}`}>
                              {test.title}
                            </h4>
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                              <span>{test.subject}</span>
                              <span>•</span>
                              <span className="capitalize">{test.difficulty}</span>
                              <span>•</span>
                              <span>{test.totalQuestions} questions</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            {isCompleted && attempt ? (
                              <>
                                <div className="text-right">
                                  <div className="text-2xl font-bold" data-testid={`text-score-${test.id}`}>
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
                            ) : isInProgress ? (
                              <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                In Progress
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                Not Started
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                  return attempt ? (
                    <Link key={test.id} href={`/results/${attempt.id}`}>
                      {card}
                    </Link>
                  ) : (
                    <div key={test.id}>{card}</div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
