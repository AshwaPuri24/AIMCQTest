import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Brain, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const formSchema = z.object({
  company: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  numberOfQuestions: z.coerce.number().min(5, "Minimum 5 questions").max(50, "Maximum 50 questions"),
  context: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function GenerateTest() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [charCount, setCharCount] = useState(0);

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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      subject: "",
      difficulty: "medium",
      numberOfQuestions: 10,
      context: "",
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/tests/generate", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Test Generated!",
        description: "Your AI-powered test is ready. Starting now...",
      });
      navigate(`/test/${data.attemptId}`);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate test. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    generateMutation.mutate(data);
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

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

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold">Generate Your Test</h1>
          <p className="text-xl text-muted-foreground">
            Customize your AI-powered practice test with specific requirements
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Test Configuration
            </CardTitle>
            <CardDescription>
              Provide details to generate a tailored MCQ test for your preparation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Google, Microsoft, Amazon"
                          {...field}
                          data-testid="input-company"
                        />
                      </FormControl>
                      <FormDescription>
                        Target company for interview preparation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-subject">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="data-structures">Data Structures</SelectItem>
                          <SelectItem value="algorithms">Algorithms</SelectItem>
                          <SelectItem value="system-design">System Design</SelectItem>
                          <SelectItem value="databases">Databases</SelectItem>
                          <SelectItem value="operating-systems">Operating Systems</SelectItem>
                          <SelectItem value="networking">Networking</SelectItem>
                          <SelectItem value="web-development">Web Development</SelectItem>
                          <SelectItem value="machine-learning">Machine Learning</SelectItem>
                          <SelectItem value="cloud-computing">Cloud Computing</SelectItem>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Main topic for your test questions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Difficulty Level *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-4"
                        >
                          <FormItem>
                            <FormControl>
                              <div>
                                <RadioGroupItem
                                  value="easy"
                                  id="easy"
                                  className="peer sr-only"
                                  data-testid="radio-easy"
                                />
                                <FormLabel
                                  htmlFor="easy"
                                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover-elevate peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                                >
                                  <span className="text-2xl mb-2">🟢</span>
                                  <span className="font-semibold">Easy</span>
                                </FormLabel>
                              </div>
                            </FormControl>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <div>
                                <RadioGroupItem
                                  value="medium"
                                  id="medium"
                                  className="peer sr-only"
                                  data-testid="radio-medium"
                                />
                                <FormLabel
                                  htmlFor="medium"
                                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover-elevate peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                                >
                                  <span className="text-2xl mb-2">🟡</span>
                                  <span className="font-semibold">Medium</span>
                                </FormLabel>
                              </div>
                            </FormControl>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <div>
                                <RadioGroupItem
                                  value="hard"
                                  id="hard"
                                  className="peer sr-only"
                                  data-testid="radio-hard"
                                />
                                <FormLabel
                                  htmlFor="hard"
                                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover-elevate peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                                >
                                  <span className="text-2xl mb-2">🔴</span>
                                  <span className="font-semibold">Hard</span>
                                </FormLabel>
                              </div>
                            </FormControl>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numberOfQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={5}
                          max={50}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-questions"
                        />
                      </FormControl>
                      <FormDescription>
                        Choose between 5 and 50 questions (recommended: 10-20)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Context (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Focus on sorting algorithms, include time complexity questions..."
                          className="min-h-[120px] resize-none"
                          maxLength={500}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setCharCount(e.target.value.length);
                          }}
                          data-testid="textarea-context"
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>Any specific topics or requirements for your test</span>
                        <span className="text-xs">{charCount}/500</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={generateMutation.isPending}
                    className="flex-1"
                    data-testid="button-generate"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Test...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Test
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
