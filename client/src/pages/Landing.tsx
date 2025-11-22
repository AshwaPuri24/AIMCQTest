import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, Zap, TrendingUp, BookOpen, Award, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  // const handleLogin = () => {
  //   window.location.href = "/api/login";
  // };

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
          <Link href="/login">
            <Button data-testid="button-login">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                Ace Your Technical Interviews with{" "}
                <span className="text-primary">AI-Powered Tests</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Generate unlimited practice tests tailored to any company, subject, or difficulty level. 
                Get instant feedback with detailed explanations powered by advanced AI.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="text-base" data-testid="button-get-started">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base" data-testid="button-learn-more" onClick={() => {
                const featuresSection = document.getElementById("features");
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: "smooth" });
                }
              }}>
                Learn More
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Unlimited Tests</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">AI-Generated Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Instant Feedback</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl blur-3xl"></div>
            <Card className="relative">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl">Sample Question</CardTitle>
                <CardDescription>AI-generated technical MCQ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-medium text-foreground">
                    What is the time complexity of binary search in a sorted array?
                  </p>
                </div>
                <div className="space-y-2">
                  {["O(n)", "O(log n)", "O(n²)", "O(1)"].map((option, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg border-2 p-4 transition-colors ${
                        idx === 1
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                          idx === 1 ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}>
                          {idx === 1 && <div className="h-2 w-2 rounded-full bg-primary-foreground"></div>}
                        </div>
                        <span className={idx === 1 ? "font-medium" : ""}>{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Powerful Features for Success</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to prepare for technical interviews and exams
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Brain,
                title: "AI-Powered Generation",
                description: "Advanced AI creates contextual questions tailored to your specific needs - company, role, and difficulty level.",
              },
              {
                icon: Target,
                title: "Targeted Practice",
                description: "Focus on specific subjects, topics, and difficulty levels to maximize your preparation efficiency.",
              },
              {
                icon: Zap,
                title: "Instant Feedback",
                description: "Get immediate results with detailed explanations for every question to accelerate your learning.",
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description: "Monitor your performance over time with comprehensive analytics and identify areas for improvement.",
              },
              {
                icon: BookOpen,
                title: "Detailed Reasoning",
                description: "Understand the 'why' behind every answer with AI-generated explanations and learning resources.",
              },
              {
                icon: Award,
                title: "Performance Grading",
                description: "Receive accurate scores and grades to benchmark your readiness for real interviews.",
              },
            ].map((feature, idx) => (
              <Card key={idx} className="hover-elevate">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple four-step process
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Create Your Prompt",
                description: "Specify the company, subject, difficulty level, and any additional context.",
              },
              {
                step: "2",
                title: "AI Generates Test",
                description: "Our AI creates a comprehensive test with MCQs tailored to your requirements.",
              },
              {
                step: "3",
                title: "Take the Test",
                description: "Answer questions at your own pace with an intuitive interface and timer.",
              },
              {
                step: "4",
                title: "Review & Learn",
                description: "Get detailed results with explanations to understand and improve.",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative space-y-4">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-border">
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl font-bold text-primary-foreground">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of successful candidates who prepared with AI-powered practice tests
          </p>
          <Link href="/register">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-base"
              data-testid="button-cta-start"
            >
              Start Practicing Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">TestAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 AI Test Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
