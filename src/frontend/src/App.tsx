import { Toaster } from "@/components/ui/sonner";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Category, Question, Test, TestResult } from "./backend.d";
import AdminPanel from "./components/AdminPanel";
import AuthScreen from "./components/AuthScreen";
import Footer from "./components/Footer";
import HomeScreen from "./components/HomeScreen";
import NameEntryScreen from "./components/NameEntryScreen";
import NavBar from "./components/NavBar";
import ResultScreen from "./components/ResultScreen";
import TestScreen from "./components/TestScreen";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetAllDataPublic,
  useGetQuestionsByIds,
  useGetTestById,
  useGetTestResult,
  useIsCallerAdmin,
  useSeedData,
  useSubmitTestAttempt,
} from "./hooks/useQueries";

const SEED_KEY = "prepmaster_seeded_v2";

type Screen = "home" | "nameEntry" | "test" | "result" | "admin";

function AppInner() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const qc = useQueryClient();

  const [screen, setScreen] = useState<Screen>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTestId, setActiveTestId] = useState<bigint | null>(null);
  const [pendingResult, setPendingResult] = useState<TestResult | null>(null);
  const [lastAnswers, setLastAnswers] = useState<bigint[]>([]);
  const [userName, setUserName] = useState("");
  const registeredRef = useRef(false);

  // Register user in backend (first caller becomes admin)
  useEffect(() => {
    if (!actor || !isAuthenticated || registeredRef.current) return;
    registeredRef.current = true;
    actor
      .register()
      .then(() => {
        qc.invalidateQueries({ queryKey: ["isCallerAdmin"] });
        qc.invalidateQueries({ queryKey: ["callerUserRole"] });
      })
      .catch(() => {
        qc.invalidateQueries({ queryKey: ["isCallerAdmin"] });
      });
  }, [actor, isAuthenticated, qc]);

  // Seed data once
  const seedData = useSeedData();
  useEffect(() => {
    if (!actor) return;
    const seeded = localStorage.getItem(SEED_KEY);
    if (!seeded) {
      seedData.mutate(undefined, {
        onSuccess: () => localStorage.setItem(SEED_KEY, "1"),
        onError: () => {},
      });
    }
  }, [actor, seedData.mutate]);

  // Public data
  const { data: publicData, isLoading: publicLoading } = useGetAllDataPublic();
  const categories: Category[] = publicData?.categories ?? [];
  const tests: Test[] = publicData?.tests ?? [];
  const questions: Question[] = publicData?.questions ?? [];

  // Admin check
  const { data: isAdmin = false } = useIsCallerAdmin();

  // Active test
  const { data: activeTest } = useGetTestById(activeTestId);
  const { data: testQuestions = [], isLoading: questionsLoading } =
    useGetQuestionsByIds(
      activeTest?.questionIds ?? [],
      screen === "test" && activeTest !== null && activeTest !== undefined,
    );

  // Mutations
  const submitAttempt = useSubmitTestAttempt();
  const getResult = useGetTestResult();

  const handleStartTest = useCallback((testId: bigint) => {
    setActiveTestId(testId);
    setScreen("nameEntry");
  }, []);

  const handleNameSubmit = useCallback((name: string) => {
    setUserName(name);
    setScreen("test");
  }, []);

  const handleSubmitTest = useCallback(
    async (answers: bigint[]) => {
      if (!activeTestId) return;
      setLastAnswers(answers);
      try {
        const [result] = await Promise.all([
          getResult.mutateAsync({ testId: activeTestId, answers }),
          submitAttempt.mutateAsync({
            testId: activeTestId,
            answers,
            userName,
          }),
        ]);
        setPendingResult(result);
        setScreen("result");
      } catch {
        toast.error("Failed to submit test. Please try again.");
      }
    },
    [activeTestId, getResult, submitAttempt, userName],
  );

  const handleLogout = useCallback(async () => {
    registeredRef.current = false;
    await clear();
    setScreen("home");
    setActiveTestId(null);
    setPendingResult(null);
    setUserName("");
  }, [clear]);

  const handleNavigate = useCallback(
    (s: Screen) => {
      if (s === "admin" && !isAdmin) return;
      setScreen(s);
      setActiveTestId(null);
      setPendingResult(null);
    },
    [isAdmin],
  );

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={login} isLoggingIn={isLoggingIn} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar
        currentScreen={screen}
        isAdmin={isAdmin}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1">
        {screen === "home" && (
          <HomeScreen
            categories={categories}
            tests={tests}
            isLoading={publicLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onStartTest={handleStartTest}
          />
        )}

        {screen === "nameEntry" && (
          <NameEntryScreen
            testTitle={activeTest?.title ?? ""}
            onStart={handleNameSubmit}
            onBack={() => setScreen("home")}
          />
        )}

        {screen === "test" && (
          <TestScreen
            test={activeTest ?? null}
            questions={testQuestions}
            isLoading={questionsLoading || !activeTest}
            onSubmit={handleSubmitTest}
            isSubmitting={submitAttempt.isPending || getResult.isPending}
          />
        )}

        {screen === "result" && pendingResult && (
          <ResultScreen
            result={pendingResult}
            test={activeTest ?? null}
            questions={testQuestions}
            userAnswers={lastAnswers}
            userName={userName}
            onRetry={() => {
              if (activeTestId) handleStartTest(activeTestId);
            }}
            onHome={() => setScreen("home")}
          />
        )}

        {screen === "admin" && isAdmin && (
          <AdminPanel
            categories={categories}
            tests={tests}
            questions={questions}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 10000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
