import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";

interface AuthScreenProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export default function AuthScreen({ onLogin, isLoggingIn }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="min-h-screen hero-wash flex flex-col">
      {/* Top bar */}
      <header className="px-6 py-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg text-navy">PrepMaster</span>
      </header>

      {/* Hero + Auth grid */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">
          {/* Left: hero copy */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/60 border border-border rounded-full px-4 py-1.5 text-sm font-medium text-navy">
              <span className="w-2 h-2 rounded-full bg-success inline-block" />
              Free mock tests for everyone
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
              Ace Your Exams with <span className="text-navy">PrepMaster</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto lg:mx-0">
              Practice with thousands of curated MCQs across Math, Science and
              General Knowledge. Track your progress and improve with every
              attempt.
            </p>

            <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm">
              {[
                { label: "Mock Tests", value: "50+" },
                { label: "Questions", value: "2,000+" },
                { label: "Students", value: "10,000+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-bold text-2xl text-navy">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Hero image */}
            <div className="hidden lg:block rounded-2xl overflow-hidden shadow-card mt-4 max-h-64">
              <img
                src="/assets/generated/hero-students.dim_700x500.jpg"
                alt="Students studying"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: auth card */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Welcome back
                </CardTitle>
                <CardDescription>
                  Sign in to continue your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="w-full mb-6" data-ocid="auth.tab">
                    <TabsTrigger
                      value="login"
                      className="flex-1"
                      data-ocid="auth.login.tab"
                    >
                      Login
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      className="flex-1"
                      data-ocid="auth.signup.tab"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          data-ocid="auth.login.email.input"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          data-ocid="auth.login.password.input"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-3 bg-muted rounded-lg p-3">
                        This app uses Internet Identity for secure, passwordless
                        authentication. Click below to continue with your
                        Internet Identity.
                      </p>
                      <Button
                        data-ocid="auth.login.submit_button"
                        className="w-full bg-primary text-primary-foreground hover:opacity-90"
                        onClick={onLogin}
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isLoggingIn
                          ? "Connecting…"
                          : "Login with Internet Identity"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          data-ocid="auth.signup.email.input"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          data-ocid="auth.signup.password.input"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm"
                          data-ocid="auth.signup.confirm.input"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-3 bg-muted rounded-lg p-3">
                        New accounts are created via Internet Identity — a
                        secure, privacy-preserving authentication system.
                      </p>
                      <Button
                        data-ocid="auth.signup.submit_button"
                        className="w-full bg-primary text-primary-foreground hover:opacity-90"
                        onClick={onLogin}
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isLoggingIn
                          ? "Creating account…"
                          : "Create Account with Internet Identity"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
